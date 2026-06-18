export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, source } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { error } = await supabase
      .from('email_leads')
      .insert({ email, source: source || 'unknown' });

    if (error) {
      // Don't fail hard on duplicate emails
      if (error.code === '23505') {
        return res.status(200).json({ success: true, note: 'already_subscribed' });
      }
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Capture email error:', err);
    return res.status(500).json({ error: err.message });
  }
}
