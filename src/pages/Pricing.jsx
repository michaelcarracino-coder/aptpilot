import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SEO from '../components/SEO'
import { PLAN, BROKER_COST, brokerTypical } from '../lib/stripe'

const MEDIAN = BROKER_COST.medianRent
const MEDIAN_BROKER = brokerTypical(MEDIAN)

const PHOTO = 'https://images.pexels.com/photos/30726437/pexels-photo-30726437.jpeg?auto=compress&cs=tinysrgb&w=1000'

// Ordered deliberately: the price comparison is the argument this page makes,
// and the first item renders open by default.
const FAQS = [
  { q: 'How is this different from a broker?', a: `A broker you hire to represent you asks ${BROKER_COST.percentRange} of the annual rent — $${MEDIAN.toLocaleString()} to $${MEDIAN_BROKER.toLocaleString()} on the median New York apartment. Since the FARE Act the listing agent is paid by the landlord and works for the landlord, so paying that fee yourself is now the only way most renters get anyone on their own side. AptPilot is that side: it tells you what you qualify for, what documents a landlord will demand, and what a listing actually costs you over a year.` },
  { q: `Why does the same work cost a broker $${MEDIAN_BROKER.toLocaleString()} and you $${PLAN.price}?`, a: 'Because a percentage of rent was never a price for the work — it was a price for being the only door in. Watching listings and checking a document set against a landlord’s requirements is work software does well and does continuously. We charge what it costs us to run, once, rather than a cut of your lease.' },
  { q: 'What does AptPilot actually do?', a: 'We watch new NYC rental listings around the clock. The moment one appears with no broker fee that matches your budget, bedroom count and neighborhoods, we text and email you — so you can reach the agent before the listing is gone. Then we get your side of the paperwork ready: what you qualify for, whether you need a guarantor, and every document the landlord will ask for.' },
  { q: 'Is this really one payment?', a: `Yes. $${PLAN.price} once. Nothing renews, nothing recurs, and there is nothing to cancel. The account stays yours for this search and for the next lease after it.` },
  { q: 'Why not charge monthly?', a: 'Because an apartment search ends. A monthly plan would bill you hardest right when you are still looking and then force you to remember to cancel the week you finally sign. Charging once removes both problems — and means we are not quietly hoping your search drags on.' },
  { q: 'Why pay when StreetEasy alerts are free?', a: 'Free portal alerts are generally batched and do not filter for no-fee units. In a market where a good no-fee listing can be gone the same day, minutes matter — we push the moment we see a match, and only for listings with no broker fee. Then we help you actually act on it.' },
  { q: 'What if my search takes months?', a: 'It costs exactly the same. There is no clock running, so a search that takes twelve weeks and a search that takes two are the same price. If you move again in three years, the account is still there.' },
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
        description={`A renter's broker in NYC asks ${BROKER_COST.percentRange} of the annual rent. AptPilot is $${PLAN.price} once, for the same work: instant no-fee listing alerts, qualifying, and your application. No subscription, nothing to cancel.`}
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
          <h1 className="display display-xl" style={{ margin: '1.4rem 0 1.5rem', maxWidth: 760 }}>
            ${PLAN.price} instead<br />of ${MEDIAN_BROKER.toLocaleString()}.
          </h1>
          <p className="lede" style={{ maxWidth: 540 }}>
            That is what a renter’s broker asks to represent you on the median New York
            apartment — {BROKER_COST.typicalPercent}% of a year at ${MEDIAN.toLocaleString()} a month. The work behind that number
            is finding listings and getting your paperwork in order. We do that part, and
            you keep the rest.
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
                One payment · lifetime access
              </div>

              <h2 className="display display-md" style={{ marginBottom: '0.9rem' }}>{PLAN.name}</h2>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '1.4rem' }}>
                <span className="display" style={{ fontSize: '4rem', lineHeight: 1 }}>${PLAN.price}</span>
                <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>once</span>
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
                Get lifetime access
              </button>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-faint)', marginTop: '0.9rem', textAlign: 'center' }}>
                ${PLAN.price} once · nothing renews · nothing to cancel
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
          <h2 className="display display-lg" style={{ margin: '1.1rem 0 1.2rem', maxWidth: 560 }}>
            What the fee was buying.
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.96rem', lineHeight: 1.75, maxWidth: 560, marginBottom: '3rem' }}>
            Against a broker you hire to act for you — not the landlord’s listing agent,
            who is already paid by the landlord and does not work for you at all.
          </p>

          <div style={{ maxWidth: 860 }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1.1fr 1fr 1fr', gap: '1rem',
              paddingBottom: '0.9rem', borderBottom: '1px solid var(--line)',
              fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase',
            }}>
              <div />
              <div style={{ color: 'var(--text-faint)' }}>Your own broker</div>
              <div style={{ color: 'var(--clay)' }}>AptPilot</div>
            </div>
            {[
              ['Cost', `$${MEDIAN.toLocaleString()}–$${MEDIAN_BROKER.toLocaleString()} on the median apartment`, `$${PLAN.price}, once`],
              ['How the fee is set', `${BROKER_COST.percentRange} of the annual rent`, 'Flat — the same on a studio or a penthouse'],
              ['Their incentive', 'Paid more the more you spend', 'Paid the same whatever you sign'],
              ['No-fee listings', 'Rarely their priority', 'The only thing we send'],
              ['Speed', 'Business hours', 'The moment a match is posted'],
              ['If your search drags', 'Fee due whenever you sign', 'Costs the same either way'],
              ['Next time you move', 'Pay it again', 'Account is still yours'],
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
            <h2 className="display display-md" style={{ color: 'var(--paper)' }}>
              Keep the other ${(MEDIAN_BROKER - PLAN.price).toLocaleString()}.
            </h2>
            {/* rgba on paper, not --text-muted: the muted token is tuned for
                light backgrounds and is nearly unreadable on forest. */}
            <p style={{ color: 'rgba(250,246,239,0.7)', fontSize: '0.98rem', lineHeight: 1.7, margin: '1rem auto 2rem', maxWidth: 420 }}>
              Set up your criteria in two minutes. One payment and it is yours for good.
            </p>
            {/* Cream on forest — a forest button here would be invisible. */}
            <button className="btn btn-cream btn-lg" onClick={handleSelect}>Get lifetime access</button>
            <p style={{ color: 'rgba(250,246,239,0.5)', fontSize: '0.8rem', marginTop: '1rem' }}>
              ${PLAN.price} once · no subscription · no broker fee
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
