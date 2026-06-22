// Fires when a user completes the intake form
// Sends you an email with their full criteria so you can pull listings

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { searchId, userId, userEmail, criteria } = req.body

    const emailBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem;">
        <h2 style="color: #0D1B2A; border-bottom: 2px solid #0A9396; padding-bottom: 0.5rem;">
          🏠 New AptPilot Search — Action Required
        </h2>

        <p style="color: #64748B; font-size: 0.9rem;">A new user has submitted their search criteria. Pull matching listings from StreetEasy and add them to the admin panel.</p>

        <div style="background: #F0F4F8; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0;">
          <h3 style="color: #0D1B2A; margin-top: 0;">Search Criteria</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="color: #64748B; padding: 0.4rem 0; width: 140px;">User Email</td><td style="font-weight: 600;">${userEmail}</td></tr>
            <tr><td style="color: #64748B; padding: 0.4rem 0;">Budget</td><td style="font-weight: 600;">$${criteria.min_budget || 'any'} – $${criteria.max_budget || 'any'}/mo</td></tr>
            <tr><td style="color: #64748B; padding: 0.4rem 0;">Bedrooms</td><td style="font-weight: 600;">${criteria.min_bed} – ${criteria.max_bed} bed</td></tr>
            <tr><td style="color: #64748B; padding: 0.4rem 0;">Move-In</td><td style="font-weight: 600;">${criteria.move_in || 'ASAP'}</td></tr>
            <tr><td style="color: #64748B; padding: 0.4rem 0;">Neighborhoods</td><td style="font-weight: 600;">${(criteria.neighborhoods || []).join(', ') || 'Any'}</td></tr>
            <tr><td style="color: #64748B; padding: 0.4rem 0;">Tour Times</td><td style="font-weight: 600;">${(criteria.tour_times || []).join(', ') || 'Flexible'}</td></tr>
            <tr><td style="color: #64748B; padding: 0.4rem 0;">Plan</td><td style="font-weight: 600;">${criteria.tier?.toUpperCase() || 'Core'}</td></tr>
            <tr><td style="color: #64748B; padding: 0.4rem 0;">Chauffeur</td><td style="font-weight: 600;">${criteria.chauffeur ? 'Yes ✓' : 'No'}</td></tr>
            ${criteria.notes ? `<tr><td style="color: #64748B; padding: 0.4rem 0;">Must-Haves</td><td style="font-weight: 600;">${criteria.notes}</td></tr>` : ''}
          </table>
        </div>

        <a href="https://aptpilot.vercel.app/admin/listings?search=${searchId}"
           style="display: inline-block; background: #0A9396; color: white; padding: 0.85rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 600; margin-bottom: 1rem;">
          Add Listings for This Search →
        </a>

        <p style="color: #94A3B8; font-size: 0.8rem; margin-top: 2rem;">
          Search ID: ${searchId}<br>
          User ID: ${userId}
        </p>
      </div>
    `

    // Send email via Resend
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'AptPilot <notifications@aptpilot.vercel.app>',
        to: ['aptpilot1@gmail.com'],
        subject: `🏠 New Search — ${userEmail} | $${criteria.min_budget}–$${criteria.max_budget}/mo | ${(criteria.neighborhoods || []).slice(0,2).join(', ')}`,
        html: emailBody,
      }),
    })

    if (!emailRes.ok) {
      const err = await emailRes.text()
      console.error('Resend error:', err)
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Notify error:', err)
    return res.status(500).json({ error: err.message })
  }
}
