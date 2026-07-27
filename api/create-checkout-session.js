// AptPilot sells one thing: a monthly subscription to no-fee listing alerts.
// The retired one-time concierge tiers used pre-created Stripe price ids from
// env vars; this uses inline price_data instead, so the sandbox -> live cutover
// is purely a STRIPE_SECRET_KEY swap with no price ids to re-create.
//
// Keep PLAN_AMOUNT_CENTS in step with PLAN.priceMonthly in src/lib/stripe.js.
const PLAN_AMOUNT_CENTS = 2900;
const TRIAL_DAYS = 3;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const { userId, userEmail, origin } = req.body;

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
          unit_amount: PLAN_AMOUNT_CENTS,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      }],
      subscription_data: { trial_period_days: TRIAL_DAYS },
      success_url: `${origin}/dashboard?alerts=active`,
      cancel_url: `${origin}/pricing`,
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: { plan: 'alerts' },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    // Log server-side; never return the message or stack to the browser —
    // Stripe errors can echo key prefixes, account ids, and internal paths.
    console.error('create-checkout-session error:', err);
    return res.status(500).json({ error: 'Could not start checkout. Please try again.' });
  }
}
