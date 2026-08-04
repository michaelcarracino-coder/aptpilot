import { MODEL } from './ai-chat.js';

// Consolidated cron endpoint (Vercel Hobby allows max 12 functions + daily crons).
// The Railway scraper's 5-minute heartbeat POSTs here with { job: 'scrape-jobs' };
// the daily Vercel cron GETs with no job and runs everything as a backstop.
//
// The health probe lives here rather than in its own api/health.js on purpose:
// api/ sits at 11 of the 12 functions Hobby allows, and spending the last slot
// on a status page would mean the next real endpoint silently breaks deploys.
//
// Every customer-facing email still goes out from Resend's shared test sender,
// which only ever delivers to the account owner. Kept in one constant so the
// health probe reports the real state instead of a guess.
const MAIL_FROM = 'AptPilot Ops <onboarding@resend.dev>';

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
  if (job === 'health' || job === 'all') {
    out.health = await runHealth();
  }

  return res.status(200).json(out);
}

// Readiness probe: /api/cron?job=health
//
// Answers one question — could a renter who paid today actually receive what
// they bought? Each check is the cheapest thing that would genuinely fail if
// the dependency were broken, not a ping that passes while the feature is dead.
//
// /api/cron is unauthenticated, so this reports STATUS ONLY: never a key, never
// a key fragment, never a provider's raw error body. Error *types* are fine.
async function runHealth() {
  const checks = {};
  const alarms = [];

  // Stripe mode is readable straight off the key prefix, so this creates no
  // checkout session and costs nothing.
  const sk = process.env.STRIPE_SECRET_KEY || '';
  checks.stripeMode = sk.startsWith('sk_live_') ? 'live'
    : (sk.startsWith('sk_test_') || sk.startsWith('sb_')) ? 'TEST'
    : 'MISSING';
  if (checks.stripeMode !== 'live') {
    alarms.push(`Stripe key is ${checks.stripeMode} — no real payment can complete.`);
  }

  // The expensive failure: a live secret key paired with a test-mode webhook
  // secret charges the customer, fails signature verification, and leaves
  // profiles.paid false. We can prove the secret is present and live-shaped;
  // only a real delivery proves it matches the endpoint.
  const whsec = process.env.STRIPE_WEBHOOK_SECRET || '';
  checks.stripeWebhookSecret = whsec.startsWith('whsec_') ? 'configured' : 'MISSING';
  if (checks.stripeWebhookSecret !== 'configured') {
    alarms.push('STRIPE_WEBHOOK_SECRET missing — buyers would be charged and never marked paid.');
  }

  // Anthropic: one token against the model ai-chat actually uses, so this
  // catches an exhausted balance AND a retired model id.
  if (!process.env.ANTHROPIC_API_KEY) {
    checks.anthropic = 'MISSING KEY';
    alarms.push('ANTHROPIC_API_KEY missing — the guide errors for every user.');
  } else {
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ model: MODEL, max_tokens: 1, messages: [{ role: 'user', content: 'ping' }] }),
      });
      if (r.ok) {
        checks.anthropic = 'ok';
      } else {
        const body = await r.json().catch(() => ({}));
        checks.anthropic = `ERROR ${r.status} ${body?.error?.type || ''}`.trim();
        alarms.push(`Anthropic rejected the call (${checks.anthropic}) — the guide errors for every user.`);
      }
    } catch {
      checks.anthropic = 'UNREACHABLE';
      alarms.push('Anthropic unreachable — the guide errors for every user.');
    }
  }

  checks.emailSender = MAIL_FROM.includes('onboarding@resend.dev')
    ? 'SHARED TEST SENDER — reaches only the account owner'
    : 'verified domain';
  if (checks.emailSender.startsWith('SHARED')) {
    alarms.push('Email still sends from Resend\'s test sender — customers receive nothing. Needs a verified domain.');
  }
  if (!process.env.RESEND_API_KEY) alarms.push('RESEND_API_KEY missing — no email of any kind sends.');
  if (!process.env.TWILIO_AUTH_TOKEN) checks.twilio = 'no key set';

  // Supabase, plus the two numbers that say whether the alert pipeline has ever
  // done its job. seen_listings is the crawler's own output: if it is empty the
  // scrape -> match -> notify chain has never completed, whatever else is green.
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const [{ count: seenTotal }, newest, { count: paidUsers }, { count: alertsSent }] = await Promise.all([
      supabase.from('seen_listings').select('id', { count: 'exact', head: true }),
      supabase.from('seen_listings').select('first_seen').order('first_seen', { ascending: false }).limit(1),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('paid', true),
      supabase.from('alert_notifications').select('id', { count: 'exact', head: true }),
    ]);

    checks.supabase = 'ok';
    checks.paidUsers = paidUsers ?? 0;
    checks.alertsEverSent = alertsSent ?? 0;

    const last = newest?.data?.[0]?.first_seen || null;
    checks.crawlerLastSaw = last;
    if (!seenTotal) {
      checks.crawler = 'NEVER RAN';
      alarms.push('Crawler has never ingested a listing — the alert pipeline has no successful run in its history.');
    } else {
      const ageH = (Date.now() - new Date(last).getTime()) / 3600000;
      checks.crawler = ageH > 24 ? `STALE (${Math.round(ageH)}h)` : 'ok';
      if (ageH > 24) alarms.push(`Crawler last ingested a listing ${Math.round(ageH)}h ago — likely blocked or down.`);
    }
  } catch (err) {
    checks.supabase = 'ERROR';
    alarms.push(`Supabase unreachable: ${err.message}`);
  }

  // Green means a renter who paid today would actually get what they bought.
  return { ok: alarms.length === 0, checks, alarms };
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
    signups24h, totalUsers, buyers24h, activeAlerts, totalBuyers,
    notifsSent24h, notifsFailed24h, newListings24h, failedJobs, leads24h,
  ] = await Promise.all([
    count('profiles', q => q.gte('created_at', dayAgo)),
    count('profiles'),
    count('profiles', q => q.eq('paid', true).gte('created_at', dayAgo)),
    count('alerts', q => q.eq('status', 'active')),
    count('profiles', q => q.eq('paid', true)),
    count('alert_notifications', q => q.eq('status', 'sent').gte('created_at', dayAgo)),
    count('alert_notifications', q => q.eq('status', 'failed').gte('created_at', dayAgo)),
    count('seen_listings', q => q.gte('first_seen', dayAgo)),
    count('scrape_jobs', q => q.eq('status', 'failed')),
    count('email_leads', q => q.gte('created_at', dayAgo)),
  ]);

  // AptPilot charges once, so there is no MRR to report — the meaningful
  // numbers are cash booked in the last 24h and lifetime revenue to date.
  // Keep in step with PLAN.price in src/lib/stripe.js.
  const PRICE_ONCE = 199.99;
  const revenue24h = (typeof buyers24h === 'number' ? buyers24h : 0) * PRICE_ONCE;
  const revenueTotal = (typeof totalBuyers === 'number' ? totalBuyers : 0) * PRICE_ONCE;
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
        ${row('Revenue (24h)', `$${revenue24h.toFixed(2)}`)}
        ${row('Revenue (lifetime)', `$${revenueTotal.toFixed(2)}`)}
        ${row('Buyers (24h / total)', `${buyers24h} / ${totalBuyers}`)}
        ${row('Alerts active', activeAlerts)}
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
        from: MAIL_FROM,
        to: ['michael.carracino@gmail.com'],
        // There is no MRR to report since 2c15f8e retired the subscription for
        // a one-time price; `mrr` went away with it but this line kept calling
        // it, so every digest since has died on a ReferenceError before send.
        subject: `AptPilot daily: $${revenue24h.toFixed(0)} today · $${revenueTotal.toFixed(0)} lifetime · ${signups24h} signups · ${notifsSent24h} alerts sent${alarms.length ? ' · ⚠ ' + alarms.length + ' issue(s)' : ''}`,
        html,
      }),
    });
    return { sent: resp.ok, revenue24h, revenueTotal, alarms };
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
