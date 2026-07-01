const ADMIN_EMAIL = 'aptpilot1@gmail.com';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Verify caller is the admin via their Supabase JWT
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const { createClient } = await import('@supabase/supabase-js');

  // Verify the token belongs to admin
  const anonClient = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  const { data: { user }, error: authErr } = await anonClient.auth.getUser(token);
  if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });
  if (user.email !== ADMIN_EMAIL) return res.status(403).json({ error: 'Forbidden' });

  // All queries use service role
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
