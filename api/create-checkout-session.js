export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const { priceId, plan, userId, userEmail, origin } = req.body;

    // Subscription plans use inline price_data so no pre-created Stripe price
    // is required — works identically in sandbox and live mode.
    if (plan === 'alerts') {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'AptPilot Alerts',
              description: 'Instant SMS + email alerts for new no-fee NYC listings matching your criteria',
            },
            unit_amount: 1499,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        }],
        subscription_data: { trial_period_days: 3 },
        success_url: `${origin}/dashboard?alerts=active`,
        cancel_url: `${origin}/pricing`,
        customer_email: userEmail,
        client_reference_id: userId,
        metadata: { plan: 'alerts' },
      });
      return res.status(200).json({ url: session.url });
    }

    if (!priceId) {
      return res.status(400).json({ error: 'Missing priceId' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?payment=success`,
      cancel_url: `${origin}/checkout`,
      customer_email: userEmail,
      client_reference_id: userId,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    // Log server-side; never return the message or stack to the browser —
    // Stripe errors can echo key prefixes, account ids, and internal paths.
    console.error('create-checkout-session error:', err);
    return res.status(500).json({ error: 'Could not start checkout. Please try again.' });
  }
}
