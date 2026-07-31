// AptPilot sells one thing: lifetime access, one time, $199.99.
//
// This uses inline price_data rather than a pre-created Stripe price id, so
// the sandbox -> live cutover is purely a STRIPE_SECRET_KEY swap with no price
// ids to re-create.
//
// Keep PLAN_AMOUNT_CENTS in step with PLAN.price in src/lib/stripe.js.
const PLAN_AMOUNT_CENTS = 19999;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const { userId, userEmail, origin } = req.body;

    const session = await stripe.checkout.sessions.create({
      // 'payment', not 'subscription' — there is nothing to renew or cancel.
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'AptPilot — lifetime access',
            description: 'Instant no-fee NYC listing alerts, qualification and document guidance, and unlimited searches. One payment, no renewal.',
          },
          unit_amount: PLAN_AMOUNT_CENTS,
        },
        quantity: 1,
      }],
      success_url: `${origin}/dashboard?welcome=1`,
      cancel_url: `${origin}/pricing`,
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: { plan: 'lifetime' },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    // Log server-side; never return the message or stack to the browser —
    // Stripe errors can echo key prefixes, account ids, and internal paths.
    console.error('create-checkout-session error:', err);
    return res.status(500).json({ error: 'Could not start checkout. Please try again.' });
  }
}
