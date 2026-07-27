// Single source of truth for what AptPilot charges.
//
// AptPilot sells exactly one thing: a monthly subscription to instant no-fee
// listing alerts. The old one-time concierge tiers (Standard $299 / Core $399 /
// Pro $499) were retired — every surface reads from PLAN, so a price change is
// a one-line edit here.
//
// The server-side amount lives in api/create-checkout-session.js as
// PLAN_AMOUNT_CENTS and MUST be kept in step with PLAN.priceMonthly. Checkout
// is built from inline price_data rather than a pre-created Stripe price id,
// so moving the account from test to live mode needs no price migration and
// no new env vars.
export const PLAN = {
  id: 'alerts',
  name: 'AptPilot Alerts',
  priceMonthly: 29,
  trialDays: 3,
  blurb: 'Good no-fee apartments in NYC lease within hours. We watch new listings around the clock and text + email you the instant one matches your criteria — so you tour first.',
  features: [
    'Instant SMS + email the moment a no-fee listing matches',
    'Around-the-clock monitoring of new NYC listings',
    'Filter by budget, bedrooms, and neighborhood',
    'Unlimited alerts — no cap on matches',
    'Cancel anytime, straight from your dashboard',
  ],
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
