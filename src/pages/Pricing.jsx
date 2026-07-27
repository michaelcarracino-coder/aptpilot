import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SEO from '../components/SEO'
import { PLAN } from '../lib/stripe'

const PHOTO = 'https://images.pexels.com/photos/30726437/pexels-photo-30726437.jpeg?auto=compress&cs=tinysrgb&w=1000'

const FAQS = [
  { q: 'What does AptPilot actually do?', a: 'We watch new NYC rental listings around the clock. The moment one appears with no broker fee that matches your budget, bedroom count and neighborhoods, we text and email you — so you can reach the agent before the listing is gone.' },
  { q: 'Is this a subscription?', a: `Yes — $${PLAN.priceMonthly} a month after a ${PLAN.trialDays}-day free trial, because we monitor listings for you continuously. Cancel anytime from your dashboard; you keep access through the end of the period you have already paid for.` },
  { q: 'Why pay when StreetEasy alerts are free?', a: 'Free portal alerts are generally batched and do not filter for no-fee units. In a market where a good no-fee listing can be gone the same day, minutes matter — we push the moment we see a match, and only for listings with no broker fee.' },
  { q: 'How is this different from a broker?', a: 'A broker typically charges one month’s rent — often $4,000 or more — to represent you. We do not represent you and we do not show apartments. We tell you the instant a no-fee listing appears so you can contact the listing agent directly and pay no fee at all.' },
  { q: 'What if I don’t find an apartment?', a: 'Cancel whenever you like. Most searches wrap up within a couple of months, and the subscription is built to be cancelled the day you sign a lease — there is no minimum term and no cancellation fee.' },
  { q: 'What areas do you cover?', a: 'All five boroughs. You choose the neighborhoods you care about during setup, and you can change them at any time from your dashboard.' },
]

function FaqItem({ q, a, open, toggle }) {
  return (
    <div style={{ borderBottom: '1px solid var(--line)' }}>
      <button
        onClick={toggle}
        aria-expanded={open}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          padding: '1.4rem 0', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left', gap: '2rem',
        }}
      >
        <span style={{ fontSize: '1.02rem', fontWeight: 500, color: 'var(--text)', lineHeight: 1.45, letterSpacing: '-0.01em' }}>{q}</span>
        <span style={{
          color: 'var(--clay)', fontSize: '1.2rem', flexShrink: 0, lineHeight: 1,
          transition: 'transform 0.25s ease', transform: open ? 'rotate(45deg)' : 'none',
        }}>+</span>
      </button>
      <div style={{ maxHeight: open ? 340 : 0, overflow: 'hidden', transition: 'max-height 0.32s ease' }}>
        <p style={{ padding: '0 3rem 1.5rem 0', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.8 }}>{a}</p>
      </div>
    </div>
  )
}

export default function Pricing() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [openFaq, setOpenFaq] = useState(0)

  const handleSelect = () => {
    if (user && profile?.paid) navigate('/dashboard')
    else if (user) navigate('/intake')
    else navigate('/signup')
  }

  return (
    <div style={{ background: 'var(--paper)' }}>
      <SEO
        title="Pricing — AptPilot"
        description={`One plan: $${PLAN.priceMonthly} a month for instant no-fee NYC listing alerts, with a ${PLAN.trialDays}-day free trial. No broker fee, no contract, cancel anytime.`}
        canonical="https://aptpilot.vercel.app/pricing"
      />

      <style>{`
        @media (max-width: 900px) {
          .price-grid { grid-template-columns: 1fr !important; }
          .price-photo { display: none !important; }
          .close-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Hero */}
      <section style={{ padding: '9rem 0 4rem' }}>
        <div className="wrap">
          <div className="eyebrow">Pricing</div>
          <h1 className="display display-xl" style={{ margin: '1.4rem 0 1.5rem', maxWidth: 720 }}>
            One plan. Cancel<br />the day you sign.
          </h1>
          <p className="lede" style={{ maxWidth: 520 }}>
            No broker fee, no setup fee, no contract. Just an alert the moment a no-fee apartment
            matches what you are looking for.
          </p>
        </div>
      </section>

      {/* Plan */}
      <section style={{ paddingBottom: '6rem' }}>
        <div className="wrap">
          <div className="price-grid" style={{
            display: 'grid', gridTemplateColumns: '1fr 0.85fr', alignItems: 'stretch',
            border: '1px solid var(--line)', borderRadius: 6, overflow: 'hidden', background: 'var(--white)',
          }}>
            <div style={{ padding: '3.25rem 3rem' }}>
              <div style={{
                display: 'inline-block', background: 'var(--clay-pale)', color: 'var(--clay-dark)',
                fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase',
                padding: '0.35rem 0.75rem', borderRadius: 3, marginBottom: '1.5rem',
              }}>
                {PLAN.trialDays}-day free trial
              </div>

              <h2 className="display display-md" style={{ marginBottom: '0.9rem' }}>{PLAN.name}</h2>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '1.4rem' }}>
                <span className="display" style={{ fontSize: '4rem', lineHeight: 1 }}>${PLAN.priceMonthly}</span>
                <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>per month</span>
              </div>

              <p style={{ fontSize: '0.96rem', color: 'var(--text-muted)', lineHeight: 1.75, marginBottom: '2rem', maxWidth: 420 }}>
                {PLAN.blurb}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '2.25rem' }}>
                {PLAN.features.map(f => (
                  <div key={f} style={{ display: 'flex', gap: '0.7rem', alignItems: 'flex-start', fontSize: '0.94rem', color: 'var(--text)' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--clay)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 4 }}>
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {f}
                  </div>
                ))}
              </div>

              <button className="btn btn-primary btn-lg" onClick={handleSelect} style={{ width: '100%' }}>
                Start your free trial
              </button>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-faint)', marginTop: '0.9rem', textAlign: 'center' }}>
                $0 today · ${PLAN.priceMonthly}/mo after {PLAN.trialDays} days · cancel anytime
              </p>
            </div>

            <img
              className="price-photo"
              src={PHOTO}
              alt="Brownstone façades in Brooklyn"
              loading="lazy"
              style={{ width: '100%', height: '100%', minHeight: 420, objectFit: 'cover', display: 'block' }}
            />
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section style={{ background: 'var(--paper-deep)', padding: '6rem 0' }}>
        <div className="wrap">
          <div className="eyebrow">The comparison</div>
          <h2 className="display display-lg" style={{ margin: '1.1rem 0 3rem', maxWidth: 520 }}>
            What you would have paid.
          </h2>

          <div style={{ maxWidth: 860 }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr', gap: '1rem',
              paddingBottom: '0.9rem', borderBottom: '1px solid var(--line)',
              fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase',
            }}>
              <div />
              <div style={{ color: 'var(--text-faint)' }}>Broker</div>
              <div style={{ color: 'var(--clay)' }}>AptPilot</div>
            </div>
            {[
              ['Cost', "One month's rent, often $4,000+", `$${PLAN.priceMonthly}/mo, cancel anytime`],
              ['Who they work for', 'Paid more on pricier apartments', 'Flat fee — no bias'],
              ['No-fee listings', 'Rarely their priority', 'The only thing we send'],
              ['Speed', 'Business hours', 'The moment a match is posted'],
              ['Commitment', 'Fee due at lease signing', 'Month to month, no contract'],
            ].map(([feat, broker, us]) => (
              <div key={feat} style={{
                display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr', gap: '1rem',
                padding: '1.15rem 0', borderBottom: '1px solid var(--line)', alignItems: 'baseline',
              }}>
                <div style={{ fontWeight: 500, fontSize: '0.93rem' }}>{feat}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.91rem' }}>{broker}</div>
                <div style={{ color: 'var(--text)', fontSize: '0.91rem', fontWeight: 500 }}>{us}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '6rem 0 0' }}>
        <div className="wrap">
          <div className="eyebrow">Questions</div>
          <h2 className="display display-lg" style={{ margin: '1.1rem 0 2.5rem' }}>Good to know.</h2>
          <div style={{ maxWidth: 780 }}>
            {FAQS.map((f, i) => (
              <FaqItem key={f.q} q={f.q} a={f.a} open={openFaq === i} toggle={() => setOpenFaq(openFaq === i ? -1 : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* Close */}
      <section style={{ padding: '6rem 0 7rem' }}>
        <div className="wrap">
          <div style={{ background: 'var(--forest)', borderRadius: 6, padding: '4.5rem 3.5rem', textAlign: 'center' }}>
            <h2 className="display display-md" style={{ color: 'var(--paper)' }}>Ready to find your apartment?</h2>
            {/* rgba on paper, not --text-muted: the muted token is tuned for
                light backgrounds and is nearly unreadable on forest. */}
            <p style={{ color: 'rgba(250,246,239,0.7)', fontSize: '0.98rem', lineHeight: 1.7, margin: '1rem auto 2rem', maxWidth: 420 }}>
              Set up your criteria in two minutes. The first {PLAN.trialDays} days are free.
            </p>
            {/* Cream on forest — a forest button here would be invisible. */}
            <button className="btn btn-cream btn-lg" onClick={handleSelect}>Start your free trial</button>
            <p style={{ color: 'rgba(250,246,239,0.5)', fontSize: '0.8rem', marginTop: '1rem' }}>
              No card charged for {PLAN.trialDays} days · cancel anytime
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
