export const config = {
  api: {
    bodyParser: false,
  },
};

function buffer(readable) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readable.on('data', (chunk) => chunks.push(chunk));
    readable.on('end', () => resolve(Buffer.concat(chunks)));
    readable.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { default: Stripe } = await import('stripe');
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const sig = req.headers['stripe-signature'];
    const rawBody = await buffer(req);

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.client_reference_id;
      const userEmail = session.customer_details?.email;

      if (userId) {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.VITE_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const { error } = await supabase
          .from('profiles')
          .update({ paid: true })
          .eq('id', userId);

        if (error) {
          return res.status(500).json({ error: error.message });
        }

        // Fetch the search so we can include criteria in the admin email
        const { data: searches } = await supabase
          .from('searches')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1);

        const search = searches?.[0];

        if (search) {
          await fetch(`${process.env.VITE_SUPABASE_URL?.replace('supabase.co', 'vercel.app') || 'https://aptpilot.vercel.app'}/api/notify-new-search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              searchId: search.id,
              userId,
              userEmail: userEmail || session.customer_email || '',
              criteria: {
                min_budget: search.min_budget,
                max_budget: search.max_budget,
                min_bed: search.min_bed,
                max_bed: search.max_bed,
                move_in: search.move_in,
                neighborhoods: search.neighborhoods,
                tour_times: search.tour_times,
                notes: search.notes,
                tier: search.tier,
                chauffeur: search.chauffeur,
              },
            }),
          }).catch(e => console.error('Notify admin failed:', e));
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
