export const PRICES = {
  standard: {
    id: import.meta.env.VITE_STRIPE_PRICE_STANDARD,
    amount: 299,
    label: 'Standard Plan',
  },
  core: {
    id: import.meta.env.VITE_STRIPE_PRICE_CORE,
    amount: 399,
    label: 'Core Plan',
  },
  pro: {
    id: import.meta.env.VITE_STRIPE_PRICE_PRO,
    amount: 499,
    label: 'Pro Plan',
  },
}

export async function redirectToCheckout(priceId, userId, userEmail, plan) {
  const res = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      priceId,
      plan,
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
