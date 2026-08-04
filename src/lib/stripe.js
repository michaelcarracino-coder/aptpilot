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
    'Renting in New York is confusing, fast, and unforgiving, and the only help on offer costs a month’s rent. AptPilot does what that broker would do — tells you what you actually qualify for, gets your paperwork landlord-ready before anyone asks, and moves the moment something matches — for one flat payment instead of a cut of your lease.',
  features: [
    'A guide that knows the NYC rental process, awake whenever you are',
    'Know exactly what you qualify for — 40x rule, guarantors, combined incomes',
    'Every document a landlord will demand, tracked and checked before they ask',
    'Your whole application collated into one package, ready to send',
    'Instant text and email when a listing matches, while you can still be first',
    'Unlimited searches, forever — use it again at your next lease',
  ],
}

// What hiring a broker costs. This anchors the price, so the framing matters as
// much as the number.
//
// THE FRAMING — do not drift from this. We are NOT selling "save the broker
// fee." The FARE Act killed forced tenant-paid fees in June 2025 and most
// renters now pay $0 on a landlord's listing, so a renter who reads "save
// $7,558" knows it is not their situation and stops trusting the page.
//
// What the FARE Act did not do is make renting here any easier. A 1.4% vacancy
// market, ~50 inquiries on a good listing in its first hour, agents who stop
// reading once two or three complete applications land, and rejections driven
// by paperwork a landlord cannot verify rather than by affordability. Against
// all that a renter has exactly two options: go it alone and hope, or hire a
// tenant-side broker and pay them one month's rent to steer.
//
// AptPilot is the missing third option. So the comparison is always "the only
// help that currently exists costs a month's rent" — never "a fee you would
// otherwise be charged."
//
// One month's rent (8.33% of the year) is the FLOOR and the number we quote,
// because it is the least attackable. Tenant-side asks commonly run higher —
// roughly 7.5-15% of annual rent depending on the broker.
export const BROKER_COST = {
  floorLabel:   "one month's rent",
  floorPercent: 8.33,
  upperPercent: 15,
  percentRange: '7.5–15%',
  medianRent:   4199, // StreetEasy median NYC asking rent, May 2026
  vacancyRate:  1.4,  // NYC five-borough vacancy, 2026
}

/** What a tenant-side broker asks at the floor: one month's rent. */
export const brokerFloor = rent => Math.round(rent)

/** The upper end of the tenant-side ask: 15% of the annual rent. */
export const brokerTypical = rent =>
  Math.round(rent * 12 * (BROKER_COST.upperPercent / 100))

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
