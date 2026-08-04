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
    'Everything a renter’s broker charges 12–15% of a year’s rent for. We watch the market around the clock, tell you the moment a no-fee listing matches, and walk you through qualifying, documents, and the application — for one flat payment instead of a cut of your lease.',
  features: [
    'Instant SMS + email the moment a no-fee listing matches',
    'An AI guide that knows the NYC rental process, any hour of the day',
    'Know exactly what you qualify for — 40x rule, guarantors, combined incomes',
    'Your application documents tracked and checked before a landlord asks',
    'Around-the-clock monitoring of new NYC listings',
    'Unlimited searches, forever — use it again at your next lease',
  ],
}

// What hiring a broker actually costs. This is the anchor the whole price
// argument rests on, so the framing matters as much as the numbers.
//
// THE HONEST FRAMING — do not drift from this. The FARE Act (June 2025) ended
// forced tenant-paid fees on landlord-listed apartments. What it did NOT do is
// give renters representation: the listing agent is paid by, and works for, the
// landlord. A renter who wants someone on their own side hires that person
// themselves, and pays the rates below out of pocket.
//
// So every comparison on the site is to *hiring your own broker* — never to a
// fee renters are still forced to pay. A NYC renter knows the difference and
// will catch it instantly, and the honest version is the stronger argument
// anyway: $199.99 against $4,199–$7,558 for the same work.
//
// 12–15% of annual rent, or one month's rent at the floor, are the standard
// NYC asks. We quote the top of the range in headline numbers and say so.
export const BROKER_COST = {
  floorLabel:     "one month's rent",
  percentRange:   '12–15%',
  typicalPercent: 15,
  medianRent:     4199, // StreetEasy median NYC asking rent, May 2026
}

/** The floor a renter's agent asks: one month's rent. */
export const brokerFloor = rent => Math.round(rent)

/** The standard ask: 15% of the annual rent. */
export const brokerTypical = rent =>
  Math.round(rent * 12 * (BROKER_COST.typicalPercent / 100))

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
