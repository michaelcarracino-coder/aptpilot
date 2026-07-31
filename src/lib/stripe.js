// Single source of truth for what AptPilot charges.
//
// AptPilot sells exactly one thing: lifetime access, one time, $199.99.
//
// Why one-time and not a subscription: an apartment search is episodic, not
// continuous. A subscription forces a cancellation at the exact moment the
// customer succeeds, and taxes a solo operator with dunning, failed payments,
// and cancellation support. A renter buys once and the account stays theirs
// for the next lease too.
//
// "Forever" is a promise that cannot be walked back, so treat it as load
// bearing: the fair-use ceiling in api/ai-chat.js exists to keep perpetual
// per-use inference cost bounded WITHOUT ever locking out an honest renter.
//
// The server-side amount lives in api/create-checkout-session.js as
// PLAN_AMOUNT_CENTS and MUST be kept in step with PLAN.price. Checkout is
// built from inline price_data rather than a pre-created Stripe price id, so
// moving the account from test to live mode needs no price migration and no
// new env vars.
export const PLAN = {
  id: 'lifetime',
  name: 'AptPilot',
  price: 199.99,
  blurb:
    'Good no-fee apartments in NYC lease within hours. AptPilot watches the market around the clock, tells you the moment one matches, and then walks you through qualifying, documents, and the application — the part a broker used to handle.',
  features: [
    'Instant SMS + email the moment a no-fee listing matches',
    'An AI guide that knows the NYC rental process, any hour of the day',
    'Know exactly what you qualify for — 40x rule, guarantors, combined incomes',
    'Your application documents tracked and checked before a landlord asks',
    'Around-the-clock monitoring of new NYC listings',
    'Unlimited searches, forever — use it again at your next lease',
  ],
}

// What the renter would otherwise have paid a broker. Used on the pricing page
// to anchor against the pre-FARE-Act status quo, not invented.
export const BROKER_FEE_NOTE = {
  typicalPercent: 15,
  note: 'Renters historically paid 12–15% of annual rent in broker fees.',
}

export async function redirectToCheckout(userId, userEmail) {
  const res = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      plan: PLAN.id,
      userId,
      userEmail,
      origin: window.location.origin,
    }),
  })

  const data = await res.json()

  if (data.url) {
    window.location.href = data.url
  } else {
    console.error('Checkout session error:', data.error)
    alert('Something went wrong starting checkout. Please try again.')
  }
}
