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

const SITE = 'https://aptpilot.vercel.app';

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

    // ── LEGACY: $29/mo subscription lifecycle ──────────────────────────────
    // AptPilot no longer creates subscriptions — checkout runs in 'payment'
    // mode. This branch is kept so that any subscription created before the
    // one-time cutover still syncs its status instead of silently stranding
    // the customer. Safe to delete once no live subscriptions remain.
    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const statusMap = {
        trialing: 'trialing',
        active: 'active',
        past_due: 'paused',
        unpaid: 'paused',
        canceled: 'canceled',
        incomplete_expired: 'canceled',
      };
      const mapped = event.type === 'customer.subscription.deleted' ? 'canceled' : statusMap[sub.status];
      if (mapped) {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        const { data: updated } = await supabase
          .from('alerts')
          .update({ status: mapped, updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', sub.id)
          .select('user_id')
          .maybeSingle();

        // Only ever REVOKE access for a legacy subscriber. A lifetime buyer
        // has no subscription, so this branch can never reach them — but
        // guard anyway rather than trusting the join.
        if (updated?.user_id) {
          await supabase
            .from('profiles')
            .update({ paid: ['trialing', 'active'].includes(mapped) })
            .eq('id', updated.user_id);
        }
      }
      return res.status(200).json({ received: true });
    }

    if (event.type !== 'checkout.session.completed') {
      return res.status(200).json({ received: true });
    }

    // ── Lifetime purchase ──────────────────────────────────────────────────
    const session = event.data.object;
    const userId = session.client_reference_id;
    const userEmail = session.customer_details?.email || session.customer_email || '';

    if (!userId) {
      console.error('checkout.session.completed with no client_reference_id');
      return res.status(200).json({ received: true });
    }

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { data: searches } = await supabase
      .from('searches')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);
    const search = searches?.[0];

    // /dashboard is a PaidRoute gated on profiles.paid. Without this the buyer
    // is redirected straight back to /checkout after paying, with no way to
    // reach the product they just bought.
    const { error: paidErr } = await supabase
      .from('profiles')
      .update({ paid: true, tier: 'lifetime' })
      .eq('id', userId);
    if (paidErr) console.error('Marking profile paid failed:', paidErr.message);

    // Alerts go live immediately — there is no trial to wait out.
    const { error: alertErr } = await supabase.from('alerts').upsert({
      user_id: userId,
      search_id: search?.id || null,
      phone: search?.phone || null,
      status: 'active',
      stripe_subscription_id: null,
      trial_ends_at: null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    if (alertErr) console.error('Alert activation failed:', alertErr.message);

    if (search) {
      // api/cron.js (scrape-jobs) picks this up and retries up to 3x, so the
      // renter has listings waiting rather than an empty dashboard.
      await supabase.from('scrape_jobs').insert({
        search_id: search.id,
        user_id: userId,
        status: 'pending',
      });

      await fetch(`${SITE}/api/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.SCRAPER_API_KEY },
        body: JSON.stringify({
          type: 'new-search',
          searchId: search.id,
          userId,
          userEmail,
          criteria: {
            min_budget: search.min_budget,
            max_budget: search.max_budget,
            min_bed: search.min_bed,
            max_bed: search.max_bed,
            move_in: search.move_in,
            neighborhoods: search.neighborhoods,
            tour_times: search.tour_times,
            notes: search.notes,
          },
        }),
      }).catch(e => console.error('Notify admin failed:', e));
    }

    if (userEmail) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'AptPilot <onboarding@resend.dev>',
          to: [userEmail],
          subject: "You're on watch — AptPilot is live",
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:2rem;">
              <h1 style="color:#14213D;font-family:Georgia,serif;font-size:1.7rem;margin:0 0 1rem;">You're on watch.</h1>
              <p style="color:#374151;line-height:1.7;">From this moment we're scanning new no-fee NYC listings around the clock. The instant one matches your criteria you'll get a text and an email — usually within minutes of it hitting the market.</p>
              <p style="color:#374151;line-height:1.7;">When one lands, don't just look at it. Open the chat in your dashboard and ask. It knows the 40x rule, what a guarantor needs to earn, which of your documents are missing, and what that "net effective" rent actually costs you over twelve months.</p>
              <p style="color:#374151;line-height:1.7;"><strong>This was a one-time payment.</strong> There's nothing to cancel and nothing renews. The account is yours for this search and the next one.</p>
              ${search ? `
              <div style="background:#FBF8F2;border-radius:10px;padding:1rem 1.25rem;margin:1.5rem 0;">
                <p style="font-weight:700;color:#14213D;margin:0 0 0.75rem;font-size:0.9rem;">What we're watching for</p>
                <table style="width:100%;font-size:0.85rem;border-collapse:collapse;">
                  <tr><td style="color:#6B7280;padding:0.3rem 0;width:110px;">Budget</td><td style="font-weight:600;color:#14213D;">$${search.min_budget || 'any'} – $${search.max_budget || 'any'}/mo</td></tr>
                  <tr><td style="color:#6B7280;padding:0.3rem 0;">Bedrooms</td><td style="font-weight:600;color:#14213D;">${search.min_bed} – ${search.max_bed}</td></tr>
                  <tr><td style="color:#6B7280;padding:0.3rem 0;">Move-in</td><td style="font-weight:600;color:#14213D;">${search.move_in || 'ASAP'}</td></tr>
                  <tr><td style="color:#6B7280;padding:0.3rem 0;">Areas</td><td style="font-weight:600;color:#14213D;">${(search.neighborhoods || []).join(', ') || 'Any'}</td></tr>
                </table>
              </div>` : ''}
              <a href="${SITE}/dashboard" style="display:inline-block;background:#14213D;color:#fff;font-weight:700;padding:0.85rem 2rem;border-radius:4px;text-decoration:none;">Open my dashboard →</a>
              <p style="color:#9CA3AF;font-size:0.8rem;margin-top:2rem;">Save ${userEmail} and our SMS number to your contacts so alerts never land in spam.</p>
            </div>
          `,
        }),
      }).catch(e => console.error('Welcome email failed:', e));
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('stripe-webhook error:', err);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
}
