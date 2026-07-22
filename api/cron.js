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

  return res.status(200).json(out);
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
                to: ['michael.carracino@compass.com'],
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
