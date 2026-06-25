export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email required' })

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Generate a real Supabase password-reset link
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${process.env.SITE_URL || 'https://aptpilot.vercel.app'}/reset-password`,
      },
    })

    if (error) {
      // Don't reveal whether the email exists
      console.error('generateLink error:', error.message)
      return res.status(200).json({ success: true })
    }

    const resetUrl = data.properties?.action_link
    if (!resetUrl) return res.status(200).json({ success: true })

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'AptPilot <onboarding@resend.dev>',
        to: [email],
        subject: 'Reset your AptPilot password',
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:2rem;background:#F2F5FA;">
            <div style="background:#0C1628;border-radius:14px;padding:2rem;margin-bottom:1.25rem;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:0.5rem;margin-bottom:1.25rem;">
                <div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#0ABFBF,#00E5CC);display:inline-flex;align-items:center;justify-content:center;font-weight:900;color:#0C1628;font-size:0.95rem;">A</div>
                <span style="font-family:Georgia,serif;font-size:1.15rem;font-weight:700;color:#fff;">Apt<span style="color:#0ABFBF;">Pilot</span></span>
              </div>
              <h1 style="color:#fff;font-family:Georgia,serif;font-size:1.6rem;margin:0 0 0.4rem;">Reset your password</h1>
              <p style="color:rgba(255,255,255,0.5);font-size:0.85rem;margin:0;">This link expires in 1 hour.</p>
            </div>

            <div style="background:#fff;border-radius:12px;padding:1.5rem;margin-bottom:1rem;">
              <p style="color:#6B7FA0;font-size:0.9rem;line-height:1.7;margin:0 0 1.25rem;">
                We received a request to reset the password for your AptPilot account. Click the button below to choose a new password.
              </p>
              <a href="${resetUrl}" style="display:block;text-align:center;background:#0ABFBF;color:#0C1628;font-weight:700;padding:0.9rem 2rem;border-radius:100px;text-decoration:none;font-size:0.95rem;">
                Reset My Password →
              </a>
            </div>

            <p style="color:#94A3B8;font-size:0.77rem;text-align:center;margin:0;">
              If you didn't request this, you can safely ignore this email — your password won't change.
            </p>
          </div>
        `,
      }),
    })

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('send-reset-email error:', err)
    return res.status(500).json({ error: err.message })
  }
}
