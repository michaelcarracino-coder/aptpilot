// Vercel cron: runs every 5 minutes
// Pings the Railway scraper to prevent cold starts, and keeps Supabase active.
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const results = {};

  // Ping scraper health endpoint
  try {
    const resp = await fetch(`${process.env.SCRAPER_URL}/health`, {
      signal: AbortSignal.timeout(10000),
    });
    results.scraper = resp.ok ? 'ok' : `status ${resp.status}`;
  } catch (err) {
    results.scraper = `error: ${err.message}`;
    console.error('Scraper keepalive failed:', err.message);
  }

  // Keep Supabase alive with a cheap query
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

  return res.status(200).json({ ts: new Date().toISOString(), ...results });
}
