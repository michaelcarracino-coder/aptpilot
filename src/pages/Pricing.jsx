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
  { q: 'What does AptPilot actually do?', a: 'It handles the parts of a NYC rental search that are confusing, slow, or easy to get wrong. It works out what you actually qualify for — the 40x rule, guarantor thresholds, combined incomes — instead of leaving you to guess. It tracks every document a landlord will demand and collates them into one package. And it texts you the moment a listing matches, so you get there early with your paperwork already done.' },
  { q: 'How is this different from hiring a broker?', a: `A broker you hire to represent you asks ${BROKER_COST.floorLabel} at the floor — $${MEDIAN.toLocaleString()} on the median New York apartment — and up to $${MEDIAN_BROKER.toLocaleString()} depending on who you use. For that you get someone who books viewings and walks you through the process in person. AptPilot does the knowing-and-preparing half for $${PLAN.price}. If you want someone physically opening doors with you, hire the broker; you can still do both.` },
  { q: `Why does guidance cost a broker $${MEDIAN.toLocaleString()} and you $${PLAN.price}?`, a: 'Because a percentage of rent was never a price for the work — it was the price of being the only door in. Working out qualification math and checking a document set against a landlord’s requirements is work software does well, continuously, at almost no marginal cost. We charge what it costs us to run, once, instead of a cut of your lease.' },
  { q: 'Is this really one payment?', a: `Yes. $${PLAN.price} once. Nothing renews, nothing recurs, and there is nothing to cancel. The account stays yours for this search and for the next lease after it.` },
  { q: 'Why not charge monthly?', a: 'Because an apartment search ends. A monthly plan would bill you hardest right when you are still looking and then force you to remember to cancel the week you finally sign. Charging once removes both problems — and means we are not quietly hoping your search drags on.' },
  { q: 'Why pay when StreetEasy and Zillow are free?', a: 'Because they are listing portals and this is not. They will show you an apartment; they will not tell you whether you qualify for it, what a guarantor would need to earn, which of your documents a landlord will reject, or whether your file is ready to send. Browse on them all you like. Renters lose apartments on the paperwork, not the browsing.' },
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
        description={`Guidance through a NYC rental search costs a month's rent if you hire a broker. AptPilot is $${PLAN.price} once: what you qualify for, every document landlord-ready, and a text the moment a listing matches. No subscription, nothing to cancel.`}
        canonical="https://aptpilot.vercel.app/pricing"
      />

      <style>{`
        @media (max-width: 900px) {
          .price-grid { grid-template-columns: 1fr !important; }
          .price-photo { display: none !important; }
          .close-grid { grid-template-columns: 1fr !important; }
        }
        /* Four columns cannot compress to phone width without the labels
           wrapping to one word per line, so the table scrolls inside .compare
           instead and the page itself never scrolls sideways. */
        .compare-row { min-width: 640px; }
      `}</style>

      {/* Hero */}
      <section style={{ padding: '9rem 0 4rem' }}>
        <div className="wrap">
          <div className="eyebrow">Pricing</div>
          <h1 className="display display-xl" style={{ margin: '1.4rem 0 1.5rem', maxWidth: 760 }}>
            Help, without<br />the month’s rent.
          </h1>
          <p className="lede" style={{ maxWidth: 540 }}>
            Guidance through a New York rental search has had exactly one price: {BROKER_COST.floorLabel},
            {' '}${MEDIAN.toLocaleString()} on the median apartment, and up to ${MEDIAN_BROKER.toLocaleString()} depending on the broker.
            Everyone who wouldn’t pay that has been doing it alone. This is the option in between.
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
            Three ways to do this.
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.96rem', lineHeight: 1.75, maxWidth: 560, marginBottom: '3rem' }}>
            The middle column is a broker you hire to act for you — not the landlord’s
            listing agent, who is already paid by the landlord and does not work for you.
          </p>

          {/* Three columns on purpose: the argument IS the gap between doing it
              alone and paying a month's rent, so both ends have to be visible. */}
          <div className="compare" style={{ maxWidth: 900, overflowX: 'auto' }}>
            <div className="compare-row" style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem',
              paddingBottom: '0.9rem', borderBottom: '1px solid var(--line)',
              fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.13em', textTransform: 'uppercase',
            }}>
              <div />
              <div style={{ color: 'var(--text-faint)' }}>On your own</div>
              <div style={{ color: 'var(--text-faint)' }}>Hire a broker</div>
              <div style={{ color: 'var(--clay)' }}>AptPilot</div>
            </div>
            {[
              ['Cost', 'Free', `$${MEDIAN.toLocaleString()}–$${MEDIAN_BROKER.toLocaleString()}`, `$${PLAN.price}, once`],
              ['How it’s priced', '—', `${BROKER_COST.percentRange} of the annual rent`, 'Flat, studio or penthouse'],
              ['Do you qualify?', 'You guess', 'They tell you', 'Worked out for you, in writing'],
              ['Your documents', 'You figure it out', 'They chase you', 'Tracked, checked, collated'],
              ['When a listing drops', 'You refresh the app', 'Business hours', 'Texted the moment it matches'],
              ['Their incentive', '—', 'Paid more the more you spend', 'Paid the same whatever you sign'],
              ['Next time you move', 'Start over', 'Pay it again', 'Account is still yours'],
            ].map(([feat, alone, broker, us]) => (
              <div key={feat} className="compare-row" style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem',
                padding: '1.15rem 0', borderBottom: '1px solid var(--line)', alignItems: 'baseline',
              }}>
                <div style={{ fontWeight: 500, fontSize: '0.93rem' }}>{feat}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.89rem' }}>{alone}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.89rem' }}>{broker}</div>
                <div style={{ color: 'var(--text)', fontSize: '0.89rem', fontWeight: 500 }}>{us}</div>
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
              Stop doing this alone.
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
