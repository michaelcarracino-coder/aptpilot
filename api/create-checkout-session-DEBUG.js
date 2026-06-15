import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId, userId, userEmail, origin } = req.body;

    const debugInfo = {
      received_priceId: priceId,
      env_PRICE_CORE: (process.env.VITE_STRIPE_PRICE_CORE || 'MISSING').slice(0, 15) + '...',
      env_PRICE_PRO: (process.env.VITE_STRIPE_PRICE_PRO || 'MISSING').slice(0, 15) + '...',
      env_SECRET_KEY_prefix: (process.env.STRIPE_SECRET_KEY || 'MISSING').slice(0, 10) + '...',
    };

    if (!priceId) {
      return res.status(400).json({ error: 'Missing priceId', debug: debugInfo });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
    console.error('Stripe session error:', err);

    const debugInfo = {
      received_priceId: req.body?.priceId,
      env_PRICE_CORE: (process.env.VITE_STRIPE_PRICE_CORE || 'MISSING').slice(0, 15) + '...',
      env_PRICE_PRO: (process.env.VITE_STRIPE_PRICE_PRO || 'MISSING').slice(0, 15) + '...',
      env_SECRET_KEY_prefix: (process.env.STRIPE_SECRET_KEY || 'MISSING').slice(0, 10) + '...',
    };

    return res.status(500).json({ error: err.message, debug: debugInfo });
  }
}
