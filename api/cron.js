// Consolidated cron endpoint (Vercel Hobby allows max 12 functions + daily crons).
// The Railway scraper's 5-minute heartbeat POSTs here with { job: 'scrape-jobs' };
// the daily Vercel cron GETs with no job and runs everything as a backstop.
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const job = req.query?.job || req.body?.job || 'all';
  const out = { ts: new Date().toISOString() };

  if (job === 'keepalive' || job === 'all') {
    out.keepalive = await runKeepalive();
  }
  if (job === 'scrape-jobs' || job === 'all') {
    out.scrapeJobs = await runScrapeJobs();
    out.processed = out.scrapeJobs.processed;
  }
  if (job === 'digest' || job === 'all') {
    out.digest = await runDailyDigest();
  }

  return res.status(200).json(out);
}

// Daily ops + P&L digest emailed to the founder. Runs with the daily Vercel cron.
async function runDailyDigest() {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const count = async (table, mod) => {
    let q = supabase.from(table).select('id', { count: 'exact', head: true });
    if (mod) q = mod(q);
    const { count: c, error } = await q;
    return error ? `err: ${error.message}` : (c ?? 0);
  };

  const [
    signups24h, totalUsers, trialing, active, canceled,
    notifsSent24h, notifsFailed24h, newListings24h, failedJobs, leads24h,
  ] = await Promise.all([
    count('profiles', q => q.gte('created_at', dayAgo)),
    count('profiles'),
    count('alerts', q => q.eq('status', 'trialing')),
    count('alerts', q => q.eq('status', 'active')),
    count('alerts', q => q.eq('status', 'canceled')),
    count('alert_notifications', q => q.eq('status', 'sent').gte('created_at', dayAgo)),
    count('alert_notifications', q => q.eq('status', 'failed').gte('created_at', dayAgo)),
    count('seen_listings', q => q.gte('first_seen', dayAgo)),
    count('scrape_jobs', q => q.eq('status', 'failed')),
    count('email_leads', q => q.gte('created_at', dayAgo)),
  ]);

  const mrr = (typeof active === 'number' ? active : 0) * 14.99;
  const pendingMrr = (typeof trialing === 'number' ? trialing : 0) * 14.99;
  const crawlerDead = typeof newListings24h === 'number' && newListings24h === 0;
  const alarms = [];
  if (crawlerDead) alarms.push('Crawler found 0 new listings in 24h — likely blocked or down.');
  if (typeof notifsFailed24h === 'number' && notifsFailed24h > 0) alarms.push(`${notifsFailed24h} notification(s) failed in 24h — check alert_notifications.error.`);
  if (typeof failedJobs === 'number' && failedJobs > 0) alarms.push(`${failedJobs} scrape job(s) in failed state.`);

  const row = (label, val) => `<tr><td style="color:#6B7FA0;padding:0.3rem 0;">${label}</td><td style="font-weight:700;color:#0C1628;text-align:right;">${val}</td></tr>`;
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:1.5rem;">
      <h2 style="color:#0C1628;font-family:Georgia,serif;">AptPilot Daily Digest</h2>
      ${alarms.length ? `<div style="background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;padding:0.85rem 1rem;margin-bottom:1rem;color:#991B1B;font-size:0.88rem;"><strong>⚠ Needs attention</strong><ul style="margin:0.5rem 0 0;padding-left:1.1rem;">${alarms.map(a => `<li>${a}</li>`).join('')}</ul></div>` : '<p style="color:#059669;font-size:0.9rem;">✅ All systems normal.</p>'}
      <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">
        ${row('MRR (active subs)', `$${mrr.toFixed(2)}`)}
        ${row('Pending MRR (trials)', `$${pendingMrr.toFixed(2)}`)}
        ${row('Alerts: trialing / active / canceled', `${trialing} / ${active} / ${canceled}`)}
        ${row('Signups (24h)', signups24h)}
        ${row('Total users', totalUsers)}
        ${row('Email leads (24h)', leads24h)}
        ${row('New listings crawled (24h)', newListings24h)}
        ${row('Alerts sent (24h)', notifsSent24h)}
        ${row('Alerts failed (24h)', notifsFailed24h)}
        ${row('Scrape jobs failed (total)', failedJobs)}
      </table>
      <p style="color:#94A3B8;font-size:0.78rem;margin-top:1.25rem;"><a href="https://aptpilot.vercel.app/admin/dashboard">Open live ops dashboard →</a></p>
    </div>
  `;

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'AptPilot Ops <onboarding@resend.dev>',
        to: ['michael.carracino@gmail.com'],
        subject: `AptPilot daily: $${mrr.toFixed(0)} MRR · ${signups24h} signups · ${notifsSent24h} alerts sent${alarms.length ? ' · ⚠ ' + alarms.length + ' issue(s)' : ''}`,
        html,
      }),
    });
    return { sent: resp.ok, mrr, alarms };
  } catch (err) {
    console.error('Daily digest email failed:', err.message);
    return { sent: false, error: err.message };
  }
}

async function runKeepalive() {
  const results = {};

  try {
    const resp = await fetch(`${process.env.SCRAPER_URL}/health`, {
      signal: AbortSignal.timeout(10000),
    });
    results.scraper = resp.ok ? 'ok' : `status ${resp.status}`;
  } catch (err) {
    results.scraper = `error: ${err.message}`;
    console.error('Scraper keepalive failed:', err.message);
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const { error } = await supabase.from('profiles').select('id').limit(1);
    results.supabase = error ? `error: ${error.message}` : 'ok';
  } catch (err) {
    results.supabase = `error: ${err.message}`;
    console.error('Supabase keepalive failed:', err.message);
  }

  return results;
}

async function runScrapeJobs() {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: jobs, error } = await supabase
    .from('scrape_jobs')
    .select('*, searches(*)')
    .in('status', ['pending', 'failed'])
    .lt('attempts', 3)
    .order('created_at', { ascending: true })
    .limit(10);

  if (error) {
    console.error('scrape-jobs cron fetch error:', error);
    return { processed: 0, error: error.message };
  }

  if (!jobs?.length) {
    return { processed: 0 };
  }

  const results = await Promise.allSettled(
    jobs.map(async (job) => {
      await supabase
        .from('scrape_jobs')
        .update({ status: 'running', attempts: job.attempts + 1, updated_at: new Date().toISOString() })
        .eq('id', job.id);

      const search = job.searches;
      try {
        const resp = await fetch(`${process.env.SCRAPER_URL}/scrape`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.SCRAPER_API_KEY,
          },
          body: JSON.stringify({ searchId: job.search_id, userId: job.user_id, criteria: search }),
          signal: AbortSignal.timeout(25000),
        });

        if (!resp.ok) throw new Error(`Scraper returned ${resp.status}`);

        await supabase
          .from('scrape_jobs')
          .update({ status: 'done', updated_at: new Date().toISOString() })
          .eq('id', job.id);

        return { id: job.id, status: 'done' };
      } catch (err) {
        const isFinal = job.attempts + 1 >= 3;
        await supabase
          .from('scrape_jobs')
          .update({
            status: isFinal ? 'failed' : 'pending',
            last_error: err.message,
            updated_at: new Date().toISOString(),
          })
          .eq('id', job.id);

        if (isFinal) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', job.user_id)
            .single();

          const emailPromises = [];

          if (profile?.email) {
            emailPromises.push(
              fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  from: 'AptPilot <onboarding@resend.dev>',
                  to: [profile.email],
                  subject: "We're searching for your apartment now",
                  html: `
                    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:2rem;">
                      <p style="font-size:1rem;color:#0C1628;">Hi there,</p>
                      <p style="color:#374151;">Your payment went through and your search is active. We ran into a brief technical hiccup pulling listings automatically — our team has been notified and will pull your matches manually within a few hours.</p>
                      <p style="color:#374151;">You'll see listings appear in your dashboard as soon as we have them. No action needed on your end.</p>
                      <a href="https://aptpilot.vercel.app/dashboard" style="display:inline-block;margin-top:1rem;background:#0ABFBF;color:#0C1628;font-weight:700;padding:0.75rem 1.5rem;border-radius:100px;text-decoration:none;">View Dashboard →</a>
                      <p style="color:#94A3B8;font-size:0.8rem;margin-top:2rem;">Questions? Reply to this email.</p>
                    </div>
                  `,
                }),
              }).catch(() => {})
            );
          }

          emailPromises.push(
            fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                from: 'AptPilot Alerts <onboarding@resend.dev>',
                to: ['michael.carracino@gmail.com'],
                subject: `ACTION REQUIRED: Scrape job failed — search ${job.search_id}`,
                html: `<p>Job <strong>${job.id}</strong> for search <strong>${job.search_id}</strong> (user <strong>${job.user_id}</strong>, email: ${profile?.email || 'unknown'}) failed 3 times and needs manual scraping.</p><p>Last error: ${err.message}</p><p><a href="https://aptpilot.vercel.app/admin">Open Admin →</a></p>`,
              }),
            }).catch(() => {})
          );

          await Promise.allSettled(emailPromises);
        }

        return { id: job.id, status: isFinal ? 'failed' : 'retrying', error: err.message };
      }
    })
  );

  const summary = results.map((r) => (r.status === 'fulfilled' ? r.value : { error: r.reason?.message }));
  console.log('scrape-jobs cron done:', summary);
  return { processed: jobs.length, results: summary };
}
