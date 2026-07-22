// Consolidated admin endpoint: ?action=metrics (GET) | ?action=scrape-listing (POST)
// Merged from admin-metrics.js and scrape-listing.js to stay under Vercel's 12-function limit.
const ADMIN_EMAIL = 'aptpilot1@gmail.com';

export default async function handler(req, res) {
  const action = req.query?.action || (req.method === 'GET' ? 'metrics' : null);

  if (action === 'metrics') return metrics(req, res);
  if (action === 'scrape-listing') return scrapeListing(req, res);
  if (action === 'trigger-scrape') return triggerScrape(req, res);
  return res.status(400).json({ error: 'Unknown action' });
}

// ── TRIGGER SCRAPE ──────────────────────────────────────────────────────────
// Admin-only: re-run the scraper for a specific search on demand.
async function triggerScrape(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { createClient } = await import('@supabase/supabase-js');
  const anonClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  const { data: { user }, error: authErr } = await anonClient.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });
  if (user.email !== ADMIN_EMAIL) return res.status(403).json({ error: 'Forbidden' });

  const { searchId } = req.body || {};
  if (!searchId) return res.status(400).json({ error: 'searchId required' });

  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: search, error: searchErr } = await supabase
    .from('searches').select('*').eq('id', searchId).single();
  if (searchErr || !search) return res.status(404).json({ error: 'Search not found' });

  const { data: job } = await supabase.from('scrape_jobs').insert({
    search_id: searchId,
    user_id: search.user_id,
    status: 'running',
    attempts: 1,
  }).select().single();

  try {
    const resp = await fetch(`${process.env.SCRAPER_URL}/scrape`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.SCRAPER_API_KEY },
      body: JSON.stringify({ searchId, userId: search.user_id, criteria: search }),
      signal: AbortSignal.timeout(25000),
    });

    if (!resp.ok) throw new Error(`Scraper returned ${resp.status}`);

    if (job?.id) {
      await supabase.from('scrape_jobs').update({ status: 'done', updated_at: new Date().toISOString() }).eq('id', job.id);
    }
    return res.status(200).json({ ok: true, message: 'Scrape triggered successfully' });
  } catch (err) {
    if (job?.id) {
      await supabase.from('scrape_jobs').update({ status: 'failed', last_error: err.message, updated_at: new Date().toISOString() }).eq('id', job.id);
    }
    return res.status(500).json({ error: err.message });
  }
}

// ── METRICS ─────────────────────────────────────────────────────────────────
async function metrics(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Verify caller is the admin via their Supabase JWT
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { createClient } = await import('@supabase/supabase-js');

  const anonClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  const { data: { user }, error: authErr } = await anonClient.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });
  if (user.email !== ADMIN_EMAIL) return res.status(403).json({ error: 'Forbidden' });

  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const [
    profiles,
    searches,
    listings,
    scrapeJobs,
    tours,
    emailLeads,
    recentProfiles,
    recentListings,
    recentJobs,
    recentLeads,
  ] = await Promise.all([
    supabase.from('profiles').select('id,full_name,email,paid,tier,created_at').order('created_at', { ascending: false }),
    supabase.from('searches').select('id,user_id,created_at,neighborhoods,min_budget,max_budget,min_bed,max_bed,move_in,tier').order('created_at', { ascending: false }),
    supabase.from('listings').select('id,address,bedrooms,bathrooms,price,status,created_at,search_id,user_id').order('created_at', { ascending: false }),
    supabase.from('scrape_jobs').select('id,search_id,user_id,status,attempts,last_error,created_at,updated_at').order('created_at', { ascending: false }),
    supabase.from('tours').select('id,status,created_at'),
    supabase.from('email_leads').select('id,email,created_at').order('created_at', { ascending: false }),
    supabase.from('profiles').select('id,full_name,email,paid,tier,created_at').order('created_at', { ascending: false }).limit(15),
    supabase.from('listings').select('id,address,bedrooms,bathrooms,price,status,created_at').order('created_at', { ascending: false }).limit(15),
    supabase.from('scrape_jobs').select('id,search_id,user_id,status,attempts,last_error,created_at,updated_at').order('created_at', { ascending: false }).limit(25),
    supabase.from('email_leads').select('id,email,created_at').order('created_at', { ascending: false }).limit(20),
  ]);

  return res.status(200).json({
    profiles: profiles.data || [],
    searches: searches.data || [],
    listings: listings.data || [],
    scrapeJobs: scrapeJobs.data || [],
    tours: tours.data || [],
    emailLeads: emailLeads.data || [],
    recentProfiles: recentProfiles.data || [],
    recentListings: recentListings.data || [],
    recentJobs: recentJobs.data || [],
    recentLeads: recentLeads.data || [],
  });
}

// ── SCRAPE LISTING ──────────────────────────────────────────────────────────
// Scrapes a StreetEasy listing URL and returns structured listing data
async function scrapeListing(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { url } = req.body;
  if (!url || !url.includes('streeteasy.com')) {
    return res.status(400).json({ error: 'Invalid StreetEasy URL' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) return res.status(502).json({ error: 'Could not fetch listing page' });

    const html = await response.text();

    const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    let jsonLd = null;
    if (jsonLdMatch) {
      try { jsonLd = JSON.parse(jsonLdMatch[1]); } catch {}
    }

    const getMeta = (prop) => {
      const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`))
        || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`));
      return m?.[1] || '';
    };

    const title = getMeta('og:title') || jsonLd?.name || '';
    const description = getMeta('og:description') || '';

    // Parse address from title — StreetEasy titles are like "245 E 63rd St, Apt 8C in Lenox Hill"
    let address = '', unit = '';
    const addrMatch = title.match(/^([^,|]+?)(?:,\s*(Apt [^,|]+))?(?:\s+in\s+|\s*\|)/i);
    if (addrMatch) {
      address = addrMatch[1].trim();
      unit = addrMatch[2] || '';
    }

    let price = '';
    const priceMatch = html.match(/\$([0-9,]+)\s*(?:\/\s*mo|per month|a month)/i)
      || description.match(/\$([0-9,]+)\s*(?:\/\s*mo)/i);
    if (priceMatch) price = priceMatch[1].replace(/,/g, '');

    let bedrooms = '', bathrooms = '';
    const bedMatch = (description + title).match(/(\d+)\s*(?:bed|br|bedroom)/i);
    const bathMatch = (description + title).match(/(\d+(?:\.\d)?)\s*(?:bath|ba|bathroom)/i);
    if (bedMatch) bedrooms = bedMatch[1] + ' bed';
    if (bathMatch) bathrooms = bathMatch[1] + ' bath';

    // Agent info — StreetEasy renders this client-side so it usually won't be in static HTML.
    let agent_name = '', agent_email = '', agent_phone = '';
    const agentNameMatch = html.match(/"agentName"\s*:\s*"([^"]+)"/)
      || html.match(/data-agent-name="([^"]+)"/);
    if (agentNameMatch) agent_name = agentNameMatch[1];

    const agentPhoneMatch = html.match(/"phone"\s*:\s*"([^"]+)"/)
      || html.match(/data-agent-phone="([^"]+)"/);
    if (agentPhoneMatch) agent_phone = agentPhoneMatch[1];

    let sqft = '';
    const sqftMatch = (description + html.slice(0, 5000)).match(/([0-9,]+)\s*(?:sq\.?\s*ft|sqft|square feet)/i);
    if (sqftMatch) sqft = sqftMatch[1].replace(/,/g, '') + ' sqft';

    return res.status(200).json({
      address,
      unit,
      price,
      bedrooms,
      bathrooms,
      sqft,
      agent_name,
      agent_email,
      agent_phone,
      listing_url: url,
    });
  } catch (err) {
    console.error('Scrape error:', err);
    return res.status(500).json({ error: 'Failed to scrape listing' });
  }
}
