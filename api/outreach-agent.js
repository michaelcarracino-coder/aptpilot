// Sends email + SMS to a listing agent requesting a tour on behalf of the user

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { listing, userEmail, userName, tourTimes, searchId } = req.body

    const agentName = listing.agent_name || 'there'
    const address = `${listing.address}${listing.unit ? ', ' + listing.unit : ''}`
    const timeOptions = (tourTimes || []).slice(0, 4).join(', ') || 'mornings or afternoons'

    // ── EMAIL TO AGENT ──────────────────────────────────────────────────────
    if (listing.agent_email) {
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 580px; margin: 0 auto; padding: 2rem;">
          <p>Hi ${agentName},</p>

          <p>I'm reaching out on behalf of my client <strong>${userName || 'our client'}</strong>, who is actively searching for an apartment in NYC and is very interested in the listing at <strong>${address}</strong>.</p>

          <p>They are pre-qualified with all required documentation ready (pay stubs, tax returns, bank statements, and ID on file), and are looking to move ${listing.moveIn || 'as soon as possible'}.</p>

          <p>They are available for a tour during the following times:</p>
          <ul style="color: #0D1B2A; font-weight: 600;">
            ${(tourTimes || []).map(t => `<li>${t}</li>`).join('')}
          </ul>

          <p>Would any of these work for a showing? Please reply to this email or contact us directly to confirm a time.</p>

          <p>Thank you for your time — we look forward to hearing from you.</p>

          <p style="color: #64748B; font-size: 0.85rem; margin-top: 2rem; border-top: 1px solid #E2E8F0; padding-top: 1rem;">
            AptPilot — NYC Apartment Search<br>
            On behalf of: ${userEmail}<br>
            <a href="https://aptpilot.vercel.app" style="color: #0A9396;">aptpilot.vercel.app</a>
          </p>
        </div>
      `

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'AptPilot <onboarding@resend.dev>',
          to: [listing.agent_email],
          reply_to: userEmail,
          subject: `Tour Request — ${address}`,
          html: emailHtml,
        }),
      })
    }

    // ── SMS TO AGENT ─────────────────────────────────────────────────────────
    if (listing.agent_phone) {
      const smsBody = `Hi ${agentName}, this is AptPilot reaching out on behalf of a qualified client interested in ${address}. They are pre-approved and available for a tour: ${timeOptions}. Please reply to schedule. Questions? Email tours@aptpilot.vercel.app`

      const twilioSid = process.env.TWILIO_ACCOUNT_SID
      const twilioAuth = process.env.TWILIO_AUTH_TOKEN
      const twilioFrom = process.env.TWILIO_PHONE_NUMBER

      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: twilioFrom,
          To: listing.agent_phone,
          Body: smsBody,
        }).toString(),
      })
    }

    // ── NOTIFY USER OF OUTREACH ─────────────────────────────────────────────
    if (userEmail) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'AptPilot <onboarding@resend.dev>',
          to: [userEmail],
          subject: `Update: We contacted the agent for ${address}`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:2rem;">
              <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1.5rem;">
                <div style="width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#0ABFBF,#00E5CC);display:flex;align-items:center;justify-content:center;font-weight:900;color:#0C1628;font-size:0.9rem;">A</div>
                <span style="font-family:Georgia,serif;font-size:1.1rem;font-weight:700;color:#0C1628;">AptPilot</span>
              </div>
              <h2 style="color:#0C1628;font-family:Georgia,serif;font-size:1.5rem;margin-bottom:0.5rem;">We reached out to the agent.</h2>
              <p style="color:#6B7FA0;font-size:0.9rem;line-height:1.65;margin-bottom:1.5rem;">
                We've contacted the listing agent for <strong style="color:#0C1628;">${address}</strong> on your behalf and requested a tour at your available times.
              </p>
              <div style="background:#F2F5FA;border-radius:10px;padding:1rem 1.25rem;margin-bottom:1.5rem;font-size:0.85rem;">
                <p style="margin:0 0 0.5rem;font-weight:700;color:#0C1628;">What happens next</p>
                <p style="margin:0;color:#6B7FA0;line-height:1.6;">Agents typically respond within 24–48 hours. As soon as they confirm, your dashboard will update and you'll get another email with the tour details.</p>
              </div>
              <a href="https://aptpilot.vercel.app/dashboard" style="display:inline-block;background:#0ABFBF;color:#0C1628;font-weight:700;padding:0.75rem 1.75rem;border-radius:100px;text-decoration:none;font-size:0.88rem;">View Dashboard →</a>
            </div>
          `,
        }),
      }).catch(e => console.error('User outreach notification failed:', e))
    }

    // ── UPDATE LISTING STATUS IN SUPABASE ──────────────────────────────────
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    await supabase.from('listings').update({ status: 'outreach_sent' }).eq('id', listing.id)
    await supabase.from('tours').insert({
      listing_id: listing.id,
      search_id: searchId,
      user_id: listing.user_id,
      status: 'outreach_sent',
    })

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Agent outreach error:', err)
    return res.status(500).json({ error: err.message })
  }
}
