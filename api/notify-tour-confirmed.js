// Called from admin panel when a listing status is set to confirmed
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { listing, userEmail, userName, searchId } = req.body
    if (!userEmail || !listing) return res.status(400).json({ error: 'Missing fields' })

    const address = `${listing.address}${listing.unit ? ', ' + listing.unit : ''}`

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'AptPilot <onboarding@resend.dev>',
        to: [userEmail],
        subject: `Tour confirmed: ${address}`,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:2rem;">
            <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1.5rem;">
              <div style="width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#0ABFBF,#00E5CC);display:flex;align-items:center;justify-content:center;font-weight:900;color:#0C1628;font-size:0.9rem;">A</div>
              <span style="font-family:Georgia,serif;font-size:1.1rem;font-weight:700;color:#0C1628;">AptPilot</span>
            </div>

            <div style="background:#ECFDF5;border:1px solid #A7F3D0;border-radius:14px;padding:1.5rem;margin-bottom:1.5rem;text-align:center;">
              <div style="width:48px;height:48px;border-radius:50%;background:#059669;display:flex;align-items:center;justify-content:center;margin:0 auto 0.75rem;">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h2 style="color:#065F46;font-family:Georgia,serif;font-size:1.5rem;margin:0 0 0.4rem;">Your tour is confirmed!</h2>
              <p style="color:#059669;font-size:0.9rem;margin:0;font-weight:600;">${address}</p>
            </div>

            <p style="color:#6B7FA0;font-size:0.9rem;line-height:1.65;margin-bottom:1.25rem;">
              Hi ${userName || 'there'}, great news — the listing agent for <strong style="color:#0C1628;">${address}</strong> has confirmed your tour. Check your dashboard for the full details including time and agent contact info.
            </p>

            ${listing.price ? `<div style="background:#F2F5FA;border-radius:10px;padding:1rem 1.25rem;margin-bottom:1.5rem;font-size:0.85rem;">
              <table style="width:100%;border-collapse:collapse;">
                <tr><td style="color:#6B7FA0;padding:0.3rem 0;width:120px;">Address</td><td style="font-weight:600;color:#0C1628;">${address}</td></tr>
                ${listing.price ? `<tr><td style="color:#6B7FA0;padding:0.3rem 0;">Rent</td><td style="font-weight:600;color:#0ABFBF;">$${listing.price.toLocaleString()}/mo</td></tr>` : ''}
                ${listing.bedrooms ? `<tr><td style="color:#6B7FA0;padding:0.3rem 0;">Size</td><td style="font-weight:600;color:#0C1628;">${listing.bedrooms}${listing.bathrooms ? ' · ' + listing.bathrooms : ''}</td></tr>` : ''}
                ${listing.agent_name ? `<tr><td style="color:#6B7FA0;padding:0.3rem 0;">Agent</td><td style="font-weight:600;color:#0C1628;">${listing.agent_name}</td></tr>` : ''}
              </table>
            </div>` : ''}

            <a href="https://aptpilot.vercel.app/dashboard" style="display:block;text-align:center;background:#0ABFBF;color:#0C1628;font-weight:700;padding:0.9rem 2rem;border-radius:100px;text-decoration:none;font-size:0.95rem;margin-bottom:1.25rem;">View Full Tour Agenda →</a>

            <p style="color:#94A3B8;font-size:0.77rem;text-align:center;">
              Questions about your tour? Reply to this email.
            </p>
          </div>
        `,
      }),
    })

    // Update listing status in Supabase
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    await supabase.from('listings').update({ status: 'confirmed' }).eq('id', listing.id)

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Tour confirm error:', err)
    return res.status(500).json({ error: err.message })
  }
}
