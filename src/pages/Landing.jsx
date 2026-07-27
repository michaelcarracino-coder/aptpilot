import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import SEO from '../components/SEO'
import { PLAN } from '../lib/stripe'

/* ─── Photography (Pexels, verified URLs) — treated as annotated figures:
   dark/duotone overlays, hairline borders, mono captions ─── */
const px = (id, w = 1600) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`
const PHOTOS = {
  skyline:     px(28518041),        // NYC skyline at night
  brownstones: px(30726437),        // Brooklyn brownstones
  aerial:      px(18511465),        // Midtown Manhattan aerial
  manhattan:   px(10633466, 1200),  // Manhattan aerial
  street:      px(16920867, 1200),  // Manhattan street level
}

/* ─── Minimal icon set ─── */
function Icon({ name, size = 18, color = 'currentColor', strokeWidth = 1.8 }) {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const p = { fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (name) {
    case 'check':
      return <svg viewBox="0 0 24 24" style={s}><polyline points="20 6 9 17 4 12" {...p}/></svg>
    case 'arrow-right':
      return <svg viewBox="0 0 24 24" style={s}><path d="M5 12h14M12 5l7 7-7 7" {...p}/></svg>
    case 'bell':
      return <svg viewBox="0 0 24 24" style={s}><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" {...p}/><path d="M13.73 21a2 2 0 01-3.46 0" {...p}/></svg>
    case 'calendar':
      return <svg viewBox="0 0 24 24" style={s}><rect x="3" y="4" width="18" height="18" rx="2" {...p}/><path d="M16 2v4M8 2v4M3 10h18" {...p}/></svg>
    default:
      return null
  }
}

/* ─── FAQ data ─── */
const FAQS = [
  { q: "Didn't the FARE Act already kill broker fees?", a: "It killed forced tenant-paid fees — since June 2025, the landlord's broker bills the landlord. What it didn't fix: rents hit a record $4,199 citywide median asking rent a year later (StreetEasy), and no-fee inventory moves faster than ever. The fee is gone; the race isn't." },
  { q: "How fast are the alerts, really?", a: "Our crawler checks for new no-fee listings roughly every 10 minutes, around the clock. When a new listing matches your saved criteria, the text and email go out immediately — typically inside a few minutes of the listing appearing." },
  { q: "What does AptPilot actually do?", a: "You set your budget, bedrooms, and neighborhoods once. We watch new NYC rental listings around the clock and, the moment one appears with no broker fee that matches your criteria, we text and email you. You contact the listing agent directly and pay no broker fee at all." },
  { q: "Is AptPilot a brokerage?", a: "No. AptPilot is software. We don't represent landlords, we don't take commissions, and we have no incentive to steer you toward pricier apartments. Flat pricing, published on this page." },
  { q: "How is this different from StreetEasy or Zillow alerts?", a: "Portal alerts are batched and portal-specific, and they still leave the agent outreach, scheduling, and paperwork to you. AptPilot is built for exactly one job — surfacing no-fee NYC rentals the moment they list, and pushing them to you instantly rather than on a batch schedule." },
  { q: "What if it doesn't work for me?", a: "Every subscription starts with a 3-day free trial and cancel-anytime billing through Stripe. Cancel from your dashboard in two clicks — there is no minimum term and no cancellation fee." },
]

function FaqItem({ q, a, open, toggle }) {
  return (
    <div style={{ borderBottom: '1px solid var(--surface-mid)' }}>
      <button onClick={toggle} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.3rem 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: '1.5rem' }}>
        <span style={{ fontWeight: 600, fontSize: '0.98rem', color: 'var(--navy)', lineHeight: 1.45 }}>{q}</span>
        <span className="mono" style={{ color: open ? 'var(--teal)' : 'var(--slate)', fontSize: '1rem', flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'none' }}>+</span>
      </button>
      <div style={{ maxHeight: open ? 320 : 0, overflow: 'hidden', transition: 'max-height 0.3s ease' }}>
        <p style={{ padding: '0 2.5rem 1.4rem 0', color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.75 }}>{a}</p>
      </div>
    </div>
  )
}

/* ─── Savings calculator ─── */
function SavingsCalc({ navigate }) {
  const [rent, setRent] = useState(3500)
  const brokerFee = Math.round(rent * 1.0833)
  // Compare against a realistic search, not a single month: NYC searches run
  // roughly three months, so that is the honest all-in cost to put next to a
  // one-time broker fee.
  const SEARCH_MONTHS = 3
  const aptpilotCost = PLAN.priceMonthly * SEARCH_MONTHS
  const savings = brokerFee - aptpilotCost

  return (
    <section className="land-section" style={{ padding: '6.5rem 2rem', background: '#fff', borderTop: '1px solid var(--surface-mid)' }}>
      <div style={{ maxWidth: 880, margin: '0 auto' }}>
        <div className="reveal" style={{ marginBottom: '3rem' }}>
          <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--teal-dark)', letterSpacing: '0.08em', marginBottom: '0.9rem' }}>03 — THE MATH</div>
          <h2 style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.3rem)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--navy)', lineHeight: 1.15 }}>
            What a broker used to cost you.
          </h2>
        </div>
        <div className="reveal land-calc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid var(--surface-mid)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '2.5rem', background: '#fff' }}>
            <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--slate-dark)', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>MONTHLY RENT</div>
            <div className="mono" style={{ fontSize: '2.6rem', fontWeight: 600, color: 'var(--navy)', lineHeight: 1, marginBottom: '1.5rem' }}>
              ${rent.toLocaleString()}
            </div>
            <input type="range" min={1500} max={15000} step={100} value={rent} onChange={e => setRent(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--teal)', cursor: 'pointer' }} />
            <div className="mono" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--slate)', marginTop: '0.5rem' }}>
              <span>$1,500</span><span>$15,000</span>
            </div>
            <p style={{ marginTop: '2rem', fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>
              The old standard NYC broker fee: one month's rent, ~8.33% of annual. The FARE Act ended forced tenant-paid fees in June 2025 — but fee-charging listings still exist, and "no-fee" units are the ones everyone races for.
            </p>
          </div>
          <div className="land-calc-right" style={{ background: 'var(--ink)', padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.1rem' }}>
            {[
              { label: 'Old-style broker fee on this rent', val: `$${brokerFee.toLocaleString()}` },
              { label: 'AptPilot, monthly', val: `$${PLAN.priceMonthly}` },
              { label: `AptPilot, typical ${SEARCH_MONTHS}-month search`, val: `$${aptpilotCost}` },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: '1.1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>{row.label}</span>
                <span className="mono" style={{ fontSize: '1.05rem', color: '#fff' }}>{row.val}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Difference</span>
              <span className="mono" style={{ fontSize: '1.9rem', fontWeight: 600, color: 'var(--teal)' }}>${savings.toLocaleString()}</span>
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/signup')} style={{ marginTop: '0.75rem', justifyContent: 'center' }}>
              Start a search
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Landing ─── */
export default function Landing() {
  const navigate = useNavigate()
  const [faqOpen, setFaqOpen] = useState(null)

  return (
    <div style={{ marginTop: -68, background: '#fff' }}>
      <style>{`
        @media(max-width: 860px){
          .land-hero-grid { grid-template-columns: 1fr !important; gap: 3rem !important; }
          .land-products-grid { grid-template-columns: 1fr !important; }
          .land-calc-grid { grid-template-columns: 1fr !important; }
          .land-photo-grid { grid-template-columns: 1fr !important; }
          .land-footer-grid { grid-template-columns: 1fr 1fr !important; gap: 2rem !important; }
          .land-section { padding: 4rem 1.25rem !important; }
          .land-hero { padding: 7.5rem 1.25rem 4rem !important; }
          .land-data-strip { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
      <SEO
        title="AptPilot — Instant alerts for NYC no-fee apartments"
        description={`NYC no-fee listings lease within hours. AptPilot texts and emails you the moment a listing matches your criteria — $${PLAN.priceMonthly}/mo, ${PLAN.trialDays}-day free trial, cancel anytime.`}
        canonical="https://aptpilot.vercel.app/"
      />

      {/* ── HERO ── */}
      <section className="land-hero" style={{ background: 'var(--ink)', padding: '9.5rem 2rem 5rem', position: 'relative', overflow: 'hidden' }}>
        {/* skyline layer, held far back so type and data stay primary */}
        <img src={PHOTOS.skyline} alt="" aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 62%', opacity: 0.35, filter: 'saturate(0.55)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(175deg, rgba(6,9,15,0.86) 0%, rgba(6,9,15,0.78) 45%, rgba(6,9,15,0.96) 100%)' }} />
        {/* faint blueprint grid */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="land-hero-grid" style={{ maxWidth: 1080, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '5rem', alignItems: 'center', position: 'relative' }}>

          {/* Left — copy */}
          <div>
            <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--teal)', letterSpacing: '0.08em', marginBottom: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--teal)', display: 'inline-block', animation: 'pulse 2.5s infinite' }} />
              MONITORING NYC NO-FEE LISTINGS · 24/7
            </div>
            <h1 style={{ fontSize: 'clamp(2.4rem, 5.4vw, 3.7rem)', fontWeight: 800, letterSpacing: '-0.035em', color: '#fff', lineHeight: 1.06, marginBottom: '1.4rem' }}>
              Stop refreshing StreetEasy.
            </h1>
            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, maxWidth: 480, marginBottom: '2.2rem' }}>
              Good no-fee apartments in New York lease within hours. AptPilot watches new listings around the clock and texts you the moment one matches your criteria — so you reach the agent while the listing is still minutes old.
            </p>
            <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={() => navigate('/signup')}>
                Get alerts — 3 days free
              </button>
              <button className="btn btn-ghost btn-lg" onClick={() => navigate('/pricing')}>
                See pricing
              </button>
            </div>
            <div className="mono" style={{ marginTop: '1.4rem', fontSize: '0.74rem', color: 'rgba(255,255,255,0.35)' }}>
              ${PLAN.priceMonthly}/mo after trial · cancel anytime
            </div>
          </div>

          {/* Right — product artifact: alert feed */}
          <div className="reveal" style={{ position: 'relative' }}>
            <div style={{ background: '#0B121F', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.45)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.7rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <span className="mono" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.45)' }}>aptpilot · alert feed</span>
                <span className="mono" style={{ fontSize: '0.66rem', color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--teal)', display: 'inline-block' }} />
                  live
                </span>
              </div>
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                {[
                  { t: '09:41', price: '$2,850', spec: '1BR · Williamsburg', status: 'text + email sent' },
                  { t: '08:57', price: '$3,400', spec: '2BR · Astoria', status: 'text + email sent' },
                  { t: '08:12', price: '$2,395', spec: 'Studio · East Village', status: 'text + email sent' },
                  { t: '07:48', price: '$4,100', spec: '2BR · Park Slope', status: 'alert sent' },
                ].map((row, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '0.8rem 0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.3rem' }}>
                      <span className="mono" style={{ fontSize: '0.86rem', color: '#fff', fontWeight: 600 }}>{row.price} <span style={{ color: 'rgba(255,255,255,0.55)', fontWeight: 400 }}>· {row.spec}</span></span>
                      <span className="mono" style={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.3)' }}>{row.t}</span>
                    </div>
                    <div className="mono" style={{ fontSize: '0.68rem', color: 'var(--teal)' }}>→ {row.status}</div>
                  </div>
                ))}
              </div>
              <div className="mono" style={{ padding: '0.6rem 1rem', borderTop: '1px solid rgba(255,255,255,0.07)', fontSize: '0.64rem', color: 'rgba(255,255,255,0.3)' }}>
                example alerts — new listings checked every ~10 min
              </div>
            </div>
          </div>
        </div>

        {/* Data strip — real numbers, cited */}
        <div className="land-data-strip" style={{ maxWidth: 1080, margin: '4.5rem auto 0', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden', position: 'relative' }}>
          {[
            { v: '$4,199', l: 'NYC median asking rent, May 2026 (StreetEasy)' },
            { v: '$0', l: 'Forced broker fees since the FARE Act, June 2025' },
            { v: '~10 min', l: 'How often we check for new no-fee listings' },
            { v: 'Hours', l: 'How long good no-fee units typically last' },
          ].map(({ v, l }) => (
            <div key={l} style={{ background: 'var(--ink)', padding: '1.4rem 1.5rem' }}>
              <div className="mono" style={{ fontSize: '1.45rem', fontWeight: 600, color: 'var(--teal)', lineHeight: 1 }}>{v}</div>
              <div style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem', lineHeight: 1.5 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── THE PRODUCT ── */}
      <section className="land-section" style={{ padding: '6.5rem 2rem', background: '#fff' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div className="reveal" style={{ marginBottom: '3rem', maxWidth: 560 }}>
            <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--teal-dark)', letterSpacing: '0.08em', marginBottom: '0.9rem' }}>01 — THE PRODUCT</div>
            <h2 style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.3rem)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--navy)', lineHeight: 1.15, marginBottom: '0.9rem' }}>
              One job, done properly: tell you first.
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.98rem', lineHeight: 1.7 }}>
              Set your criteria once. We watch the market around the clock and reach you the moment a no-fee listing matches.
            </p>
          </div>

          <div className="reveal" style={{ maxWidth: 560, border: '1px solid var(--surface-mid)', borderRadius: 10, padding: '2.25rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '1.25rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--surface-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal-dark)' }}>
                <Icon name="bell" size={17} />
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--navy)', letterSpacing: '-0.01em' }}>{PLAN.name}</div>
                <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--slate)' }}>${PLAN.priceMonthly}/mo · {PLAN.trialDays}-day free trial</div>
              </div>
            </div>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Set your budget, bedrooms, and neighborhoods once. When a new no-fee listing matches, your phone buzzes — usually while the listing is minutes old. You tour first, before the open-house crowd exists.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', marginBottom: '1.75rem', flex: 1 }}>
              {PLAN.features.map(f => (
                <div key={f} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.88rem', color: 'var(--text)' }}>
                  <span style={{ color: 'var(--teal-dark)', marginTop: 2 }}><Icon name="check" size={14} strokeWidth={2.2} /></span>
                  {f}
                </div>
              ))}
            </div>
            <button className="btn btn-primary" onClick={() => navigate('/signup')} style={{ justifyContent: 'center' }}>
              Start free trial
            </button>
            <p className="mono" style={{ fontSize: '0.72rem', color: 'var(--slate)', marginTop: '0.75rem', textAlign: 'center' }}>
              $0 today · cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="land-section" style={{ padding: '6.5rem 2rem', background: 'var(--surface)', borderTop: '1px solid var(--surface-mid)' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div className="reveal" style={{ marginBottom: '3rem' }}>
            <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--teal-dark)', letterSpacing: '0.08em', marginBottom: '0.9rem' }}>02 — HOW IT WORKS</div>
            <h2 style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.3rem)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--navy)', lineHeight: 1.15 }}>
              Criteria in. Keys out.
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { n: '01', t: 'Define the search', d: 'Budget, bedrooms, neighborhoods, move-in window. Two minutes, editable anytime.' },
              { n: '02', t: 'The engine watches', d: 'New no-fee listings are checked roughly every 10 minutes, around the clock — weekends and 2am included.' },
              { n: '03', t: 'You get there first', d: 'You get an instant text and email with the address, price, and a direct link — while the listing is still fresh enough to matter.' },
              { n: '04', t: 'Apply the same day', d: 'Your documents — pay stubs, IDs, guarantor forms — are already organized in your dashboard. When you like a unit, the application goes out while others are still scheduling a viewing.' },
            ].map((step, i) => (
              <div key={i} className="reveal" style={{ display: 'grid', gridTemplateColumns: '64px 1fr', gap: '1.5rem', padding: '1.6rem 0', borderBottom: i < 3 ? '1px solid var(--surface-mid)' : 'none', transitionDelay: `${i * 0.05}s` }}>
                <div className="mono" style={{ fontSize: '0.85rem', color: 'var(--teal-dark)', paddingTop: 3 }}>{step.n}</div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: '1.02rem', color: 'var(--navy)', letterSpacing: '-0.015em', marginBottom: '0.4rem' }}>{step.t}</h3>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 560 }}>{step.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CALCULATOR ── */}
      <SavingsCalc navigate={navigate} />

      {/* ── COVERAGE — photo grid ── */}
      <section className="land-section" style={{ padding: '6.5rem 2rem', background: '#fff', borderTop: '1px solid var(--surface-mid)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ marginBottom: '3rem', display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '1.5rem' }}>
            <div style={{ maxWidth: 560 }}>
              <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--teal-dark)', letterSpacing: '0.08em', marginBottom: '0.9rem' }}>04 — COVERAGE</div>
              <h2 style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.3rem)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--navy)', lineHeight: 1.15 }}>
                Every borough. Every block.
              </h2>
            </div>
            <button className="btn btn-outline" onClick={() => navigate('/neighborhoods')}>
              Browse neighborhoods →
            </button>
          </div>
          <div className="land-photo-grid" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '1.25rem' }}>
            {[
              { img: PHOTOS.brownstones, alt: 'Brooklyn brownstone facades', tag: 'BKN-01', title: 'Brownstone Brooklyn', sub: 'Park Slope · Fort Greene · Bed-Stuy · Crown Heights' },
              { img: PHOTOS.aerial, alt: 'Aerial view of Midtown Manhattan', tag: 'MAN-02', title: 'Manhattan', sub: 'East Village · UWS · Hell’s Kitchen · Washington Heights' },
              { img: PHOTOS.street, alt: 'Manhattan street with apartment buildings', tag: 'QNS-03', title: 'Queens & beyond', sub: 'Astoria · LIC · Ridgewood · Jersey City · Hoboken' },
            ].map(card => (
              <figure key={card.tag} style={{ margin: 0, border: '1px solid var(--surface-mid)', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
                <div style={{ position: 'relative', height: 240, overflow: 'hidden' }}>
                  <img src={card.img} alt={card.alt} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.8)', display: 'block' }} />
                  <span className="mono" style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(6,9,15,0.78)', color: 'var(--teal)', fontSize: '0.64rem', letterSpacing: '0.08em', padding: '0.25rem 0.55rem', borderRadius: 4 }}>{card.tag}</span>
                </div>
                <figcaption style={{ padding: '1rem 1.15rem', borderTop: '1px solid var(--surface-mid)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--navy)', letterSpacing: '-0.01em', fontSize: '0.95rem' }}>{card.title}</div>
                  <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--slate)', marginTop: '0.35rem', lineHeight: 1.6 }}>{card.sub}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="land-section" style={{ padding: '6.5rem 2rem', background: 'var(--surface)', borderTop: '1px solid var(--surface-mid)' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div className="reveal" style={{ marginBottom: '2.5rem' }}>
            <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--teal-dark)', letterSpacing: '0.08em', marginBottom: '0.9rem' }}>05 — QUESTIONS</div>
            <h2 style={{ fontSize: 'clamp(1.7rem, 3.4vw, 2.3rem)', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--navy)', lineHeight: 1.15 }}>
              Fair questions.
            </h2>
          </div>
          <div className="reveal">
            {FAQS.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} open={faqOpen === i} toggle={() => setFaqOpen(faqOpen === i ? null : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* ── BROWNSTONE BAND ── */}
      <section style={{ position: 'relative', minHeight: 340, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        <img src={PHOTOS.manhattan} alt="Aerial view of Manhattan apartment buildings" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 45%', filter: 'saturate(0.6)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(6,9,15,0.92) 0%, rgba(6,9,15,0.72) 55%, rgba(6,9,15,0.45) 100%)' }} />
        <div style={{ position: 'relative', maxWidth: 1080, margin: '0 auto', padding: '4.5rem 2rem', width: '100%' }}>
          <div className="mono" style={{ fontSize: '0.7rem', color: 'var(--teal)', letterSpacing: '0.08em', marginBottom: '1rem' }}>3.7M HOUSING UNITS IN NYC · ONE OF THEM IS YOURS</div>
          <p style={{ fontSize: 'clamp(1.3rem, 2.6vw, 1.75rem)', fontWeight: 700, letterSpacing: '-0.025em', color: '#fff', lineHeight: 1.3, maxWidth: 560, margin: 0 }}>
            The city doesn't slow down for your apartment search. Now you don't have to slow down for the city.
          </p>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ background: 'var(--ink)', padding: '6rem 2rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="reveal" style={{ maxWidth: 880, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>
          <div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.6vw, 2.5rem)', fontWeight: 800, letterSpacing: '-0.03em', color: '#fff', lineHeight: 1.12, marginBottom: '0.75rem' }}>
              The next great listing posts tonight.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.98rem', maxWidth: 460 }}>
              Someone's going to see it first. Three days free to make sure it's you.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/signup')}>Start free trial</button>
            <button className="btn btn-ghost btn-lg" onClick={() => navigate('/pricing')}>Pricing</button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: 'var(--ink)', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '3.5rem 2rem 2rem' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div className="land-footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '3rem', marginBottom: '3rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1rem' }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, border: '1.5px solid var(--teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--teal)' }}>A</div>
                <span style={{ fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' }}>AptPilot</span>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.7, maxWidth: 280 }}>
                Software for winning NYC no-fee rentals: instant listing alerts, the moment a match goes live.
              </p>
            </div>
            {[
              { label: 'Product', links: [
                { label: 'How it works', href: '#how-it-works' },
                { label: 'Pricing', href: '/pricing' },
                { label: 'How to qualify', href: '/qualify' },
                { label: 'Neighborhoods', href: '/neighborhoods' },
                { label: 'Blog', href: '/blog' },
              ]},
              { label: 'Company', links: [
                { label: 'Contact', href: 'mailto:support@aptpilot.com' },
                { label: 'Privacy', href: '/privacy' },
                { label: 'Terms', href: '/terms' },
              ]},
              { label: 'Account', links: [
                { label: 'Create account', href: '/signup' },
                { label: 'Sign in', href: '/login' },
                { label: 'Dashboard', href: '/dashboard' },
              ]},
            ].map(col => (
              <div key={col.label}>
                <div className="mono" style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1rem' }}>{col.label}</div>
                {col.links.map(l => (
                  <div key={l.label} style={{ marginBottom: '0.6rem' }}>
                    <a href={l.href} style={{ fontSize: '0.87rem', color: 'rgba(255,255,255,0.45)', transition: 'color 0.15s' }}
                      onMouseEnter={e => e.target.style.color = '#fff'}
                      onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.45)'}
                    >{l.label}</a>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <span className="mono" style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)' }}>© 2026 AptPilot</span>
            <span className="mono" style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)' }}>New York, NY</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
