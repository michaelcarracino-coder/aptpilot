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

    // ── Alerts subscription lifecycle ──────────────────────────────────────
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

        // Keep the paywall flag in step with the subscription, or a cancelled
        // customer keeps dashboard access indefinitely.
        if (updated?.user_id) {
          await supabase
            .from('profiles')
            .update({ paid: ['trialing', 'active'].includes(mapped) })
            .eq('id', updated.user_id);
        }
      }
      return res.status(200).json({ received: true });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.client_reference_id;
      const userEmail = session.customer_details?.email;

      // Alerts subscription checkout: activate the alert, skip concierge flow
      if (session.mode === 'subscription' && userId) {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

        const { data: searches } = await supabase
          .from('searches')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1);
        const search = searches?.[0];

        const trialEnds = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
        const { error: alertErr } = await supabase.from('alerts').upsert({
          user_id: userId,
          search_id: search?.id || null,
          phone: search?.phone || null,
          status: 'trialing',
          stripe_subscription_id: typeof session.subscription === 'string' ? session.subscription : session.subscription?.id,
          trial_ends_at: trialEnds,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
        if (alertErr) console.error('Alert activation failed:', alertErr.message);

        // /dashboard is a PaidRoute gated on profiles.paid. Without this the
        // subscriber is redirected straight back to /checkout after paying,
        // with no way to reach the product they just bought.
        const { error: paidErr } = await supabase
          .from('profiles')
          .update({ paid: true, tier: 'alerts' })
          .eq('id', userId);
        if (paidErr) console.error('Marking profile paid failed:', paidErr.message);

        const email = userEmail || session.customer_email || '';
        if (email) {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: 'AptPilot <onboarding@resend.dev>',
              to: [email],
              subject: 'Your AptPilot Alerts are live 🚨',
              html: `
                <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:2rem;">
                  <h1 style="color:#0C1628;font-family:Georgia,serif;font-size:1.6rem;">You're on watch.</h1>
                  <p style="color:#374151;line-height:1.7;">From this moment, we're scanning new no-fee NYC listings around the clock. The instant one matches your criteria, you'll get a text and an email — usually within minutes of it hitting the market.</p>
                  <p style="color:#374151;line-height:1.7;">Your 3-day free trial is active. After that it's $29/mo — cancel anytime from your dashboard.</p>
                  <a href="https://aptpilot.vercel.app/dashboard" style="display:inline-block;margin-top:0.5rem;background:#0ABFBF;color:#0C1628;font-weight:700;padding:0.85rem 2rem;border-radius:100px;text-decoration:none;">View My Dashboard →</a>
                  <p style="color:#94A3B8;font-size:0.8rem;margin-top:2rem;">Tip: make sure ${email} and our SMS number are saved in your contacts so alerts never hit spam.</p>
                </div>
              `,
            }),
          }).catch(e => console.error('Alerts welcome email failed:', e));
        }

        return res.status(200).json({ received: true });
      }

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

        // Send welcome email to the user
        const email = userEmail || session.customer_email || '';
        if (email) {
          const planLabel = 'AptPilot Alerts ($29/mo)';
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: 'AptPilot <onboarding@resend.dev>',
              to: [email],
              subject: "You're in — AptPilot is on it",
              html: `
                <div style="font-family:sans-serif;max-width:580px;margin:0 auto;padding:2rem;background:#fff;">
                  <div style="background:#0C1628;border-radius:14px;padding:2rem;margin-bottom:1.5rem;text-align:center;">
                    <div style="display:inline-flex;align-items:center;gap:0.5rem;margin-bottom:1rem;">
                      <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#0ABFBF,#00E5CC);display:inline-flex;align-items:center;justify-content:center;font-weight:900;color:#0C1628;font-size:1rem;">A</div>
                      <span style="font-family:Georgia,serif;font-size:1.3rem;font-weight:700;color:#fff;">Apt<span style="color:#0ABFBF;">Pilot</span></span>
                    </div>
                    <h1 style="color:#fff;font-family:Georgia,serif;font-size:1.8rem;margin:0 0 0.4rem;">Your search is live.</h1>
                    <p style="color:#7A8FAF;margin:0;font-size:0.95rem;">Payment confirmed · ${planLabel}</p>
                  </div>
                  <h2 style="color:#0C1628;font-size:1.1rem;margin-bottom:1rem;">Here's what happens next:</h2>
                  <div style="display:flex;flex-direction:column;gap:0.75rem;margin-bottom:1.5rem;">
                    ${[
                      ['1', 'We review your criteria', 'Our team reviews your move-in date, budget, and neighborhoods within the hour.'],
                      ['2', 'We pull matching listings', 'We search StreetEasy, Zillow, Apartments.com, and more for apartments that fit.'],
                      ['3', 'We contact agents', 'We email and text agents on your behalf to request tours at your available times.'],
                      ['4', 'Your tour agenda is ready', 'Log in to your dashboard to see confirmed tours, listing details, and status updates.'],
                    ].map(([n, title, desc]) => `
                      <div style="display:flex;gap:1rem;padding:1rem;background:#F2F5FA;border-radius:10px;">
                        <div style="width:28px;height:28px;border-radius:50%;background:#0ABFBF;color:#0C1628;font-weight:700;font-size:0.85rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${n}</div>
                        <div><strong style="color:#0C1628;font-size:0.9rem;">${title}</strong><p style="color:#6B7FA0;font-size:0.83rem;margin:0.2rem 0 0;">${desc}</p></div>
                      </div>
                    `).join('')}
                  </div>
                  ${search ? `
                  <div style="background:#F2F5FA;border-radius:10px;padding:1rem 1.25rem;margin-bottom:1.5rem;">
                    <p style="font-weight:700;color:#0C1628;margin:0 0 0.75rem;font-size:0.9rem;">Your search criteria</p>
                    <table style="width:100%;font-size:0.85rem;border-collapse:collapse;">
                      <tr><td style="color:#6B7FA0;padding:0.3rem 0;width:120px;">Budget</td><td style="font-weight:600;color:#0C1628;">$${search.min_budget||'any'} – $${search.max_budget||'any'}/mo</td></tr>
                      <tr><td style="color:#6B7FA0;padding:0.3rem 0;">Bedrooms</td><td style="font-weight:600;color:#0C1628;">${search.min_bed} – ${search.max_bed}</td></tr>
                      <tr><td style="color:#6B7FA0;padding:0.3rem 0;">Move-In</td><td style="font-weight:600;color:#0C1628;">${search.move_in||'ASAP'}</td></tr>
                      <tr><td style="color:#6B7FA0;padding:0.3rem 0;">Areas</td><td style="font-weight:600;color:#0C1628;">${(search.neighborhoods||[]).join(', ')||'Any'}</td></tr>
                    </table>
                  </div>` : ''}
                  <a href="https://aptpilot.vercel.app/dashboard" style="display:block;text-align:center;background:#0ABFBF;color:#0C1628;font-weight:700;padding:0.9rem 2rem;border-radius:100px;text-decoration:none;font-size:0.95rem;">View My Dashboard →</a>
                  <p style="color:#94A3B8;font-size:0.77rem;text-align:center;margin-top:1.5rem;">Questions? Reply to this email and we'll get back to you.</p>
                </div>
              `,
            }),
          }).catch(e => console.error('User welcome email failed:', e));
        }

        if (search) {
          // Enqueue a scrape job — api/cron.js (scrape-jobs) picks it up and retries up to 3x
          await supabase.from('scrape_jobs').insert({
            search_id: search.id,
            user_id: userId,
            status: 'pending',
          });

          await fetch(`https://aptpilot.vercel.app/api/notify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.SCRAPER_API_KEY },
            body: JSON.stringify({
              type: 'new-search',
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
