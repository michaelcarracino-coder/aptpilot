export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { userId } = req.body
    if (!userId) return res.status(400).json({ error: 'userId required' })

    const { default: Stripe } = await import('stripe')
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

    // Find Stripe customer by looking up their checkout sessions
    const sessions = await stripe.checkout.sessions.list({ limit: 100 })
    const session = sessions.data.find(s => s.client_reference_id === userId)

    if (!session?.customer) {
      return res.status(404).json({ error: 'No Stripe customer found for this user' })
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: session.customer,
      return_url: `${req.headers.origin || 'https://aptpilot.vercel.app'}/dashboard`,
    })

    return res.status(200).json({ url: portalSession.url })
  } catch (err) {
    console.error('Portal error:', err)
    return res.status(500).json({ error: err.message })
  }
}
