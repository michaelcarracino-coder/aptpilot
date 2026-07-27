import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PLAN } from '../lib/stripe'

const FAQS = [
  { q: 'What does AptPilot actually do?', a: 'We watch new NYC rental listings around the clock. The moment one comes up with no broker fee that matches your budget, bedroom count, and neighborhoods, we text and email you — so you can reach the agent before the listing is gone.' },
  { q: 'Is this a subscription?', a: `Yes — $${PLAN.priceMonthly}/mo after a ${PLAN.trialDays}-day free trial, because we monitor listings for you continuously. Cancel anytime from your dashboard; you keep access through the end of the period you already paid for.` },
  { q: 'Why pay when StreetEasy alerts are free?', a: 'Free alerts are generally sent on a batch schedule and do not filter for no-fee units. In a market where a good no-fee listing can be gone the same day, minutes matter — we push the moment we see a match, and only for listings with no broker fee.' },
  { q: 'How is this different from a broker?', a: 'A broker typically charges one month\'s rent — often $4,000 or more — to represent you. We do not represent you or show apartments. We tell you the instant a no-fee listing appears so you can contact the listing agent directly and pay no fee at all.' },
  { q: 'What if I don\'t find an apartment?', a: 'Cancel whenever you like. Most searches wrap up in a couple of months, and the subscription is built to be cancelled the day you sign a lease — there is no minimum term and no cancellation fee.' },
  { q: 'What areas do you cover?', a: 'All five boroughs. You choose the neighborhoods you care about during setup, and you can change them at any time from your dashboard.' },
]

export default function Pricing() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const handleSelect = () => {
    if (user && profile?.paid) navigate('/dashboard')
    else if (user) navigate('/intake')
    else navigate('/signup')
  }

  return (
    <div>
      <style>{`
        .pricing-hero { text-align:center; padding:5rem 1.5rem 3.5rem; background:var(--navy); }
        .pricing-hero h1 { font-family:'Inter', sans-serif; font-size:clamp(2.2rem,5vw,3.5rem); color:#fff; margin-bottom:0.75rem; letter-spacing:-0.03em; }
        .pricing-hero p { color:var(--slate); font-size:1.05rem; max-width:540px; margin:0 auto; line-height:1.65; }
        .plan-wrap { max-width:520px; margin:0 auto; padding:3.5rem 1.5rem; }
        .plan-card { border:1px solid var(--surface-mid); border-radius:var(--radius-lg); background:#fff; padding:2.25rem 2rem; display:flex; flex-direction:column; }
        .plan-tag { display:inline-block; align-self:flex-start; background:var(--teal); color:var(--navy); font-size:0.68rem; font-weight:800; padding:0.25rem 0.75rem; border-radius:4px; text-transform:uppercase; letter-spacing:0.07em; font-family:var(--mono); margin-bottom:1rem; }
        .plan-name { font-family:'Inter', sans-serif; font-size:1.6rem; color:var(--navy); margin-bottom:0.4rem; }
        .plan-price { font-family:'Inter', sans-serif; font-size:3.4rem; color:var(--teal); line-height:1; margin-bottom:0.3rem; letter-spacing:-0.03em; }
        .plan-price span { font-size:0.9rem; color:var(--slate); font-weight:400; letter-spacing:0; }
        .plan-desc { font-size:0.88rem; color:var(--slate); line-height:1.65; margin-bottom:1.75rem; }
        .plan-feats { display:flex; flex-direction:column; gap:0.7rem; margin-bottom:1.9rem; }
        .plan-feat { display:flex; gap:0.6rem; font-size:0.88rem; color:var(--navy); align-items:flex-start; }
        .feat-check { flex-shrink:0; margin-top:3px; }
        .compare-table { max-width:760px; margin:0 auto; padding:0 1.5rem 5rem; }
        .compare-table h2 { font-family:'Inter', sans-serif; font-size:2rem; color:var(--navy); text-align:center; margin-bottom:2rem; letter-spacing:-0.02em; }
        .ctable { width:100%; border-collapse:collapse; font-size:0.88rem; }
        .ctable th { padding:0.75rem 1rem; text-align:center; font-weight:700; color:var(--slate); font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; }
        .ctable th:first-child { text-align:left; }
        .ctable td { padding:0.75rem 1rem; border-top:1px solid var(--surface-mid); text-align:center; color:var(--navy); }
        .ctable td:first-child { text-align:left; font-weight:500; }
        .faq-section { background:var(--surface); padding:4rem 1.5rem; }
        .faq-inner { max-width:700px; margin:0 auto; }
        .faq-inner h2 { font-family:'Inter', sans-serif; font-size:2rem; color:var(--navy); margin-bottom:2rem; text-align:center; letter-spacing:-0.02em; }
        .faq-item { border-bottom:1px solid var(--surface-mid); padding:1.25rem 0; }
        .faq-q { font-weight:700; color:var(--navy); font-size:0.95rem; cursor:pointer; display:flex; justify-content:space-between; align-items:center; gap:1rem; }
        .faq-a { color:var(--slate); font-size:0.88rem; line-height:1.7; margin-top:0.75rem; }
        .pricing-cta { text-align:center; padding:5rem 1.5rem; background:var(--navy); }
        .pricing-cta h2 { font-family:'Inter', sans-serif; font-size:2.2rem; color:#fff; margin-bottom:0.75rem; letter-spacing:-0.02em; }
        .pricing-cta p { color:var(--slate); margin-bottom:2rem; }
      `}</style>

      {/* Hero */}
      <div className="pricing-hero">
        <p className="mono" style={{ color:'var(--teal)', fontWeight:700, fontSize:'0.75rem', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'1rem' }}>Pricing</p>
        <h1>One plan.<br />Cancel the day you sign.</h1>
        <p>No broker fee, no setup fee, no contract. Just an alert the moment a no-fee apartment matches what you are looking for.</p>
      </div>

      {/* Single plan */}
      <div className="plan-wrap">
        <div className="plan-card">
          <div className="plan-tag">{PLAN.trialDays}-Day Free Trial</div>
          <div className="plan-name">{PLAN.name}</div>
          <div className="plan-price">${PLAN.priceMonthly}<span>/month</span></div>
          <div className="plan-desc">{PLAN.blurb}</div>
          <div className="plan-feats">
            {PLAN.features.map(f => (
              <div className="plan-feat" key={f}>
                <svg className="feat-check" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {f}
              </div>
            ))}
          </div>
          <button className="btn btn-primary" onClick={handleSelect} style={{ width:'100%', justifyContent:'center', padding:'0.85rem' }}>
            Start Free Trial →
          </button>
          <p style={{ color:'var(--slate)', fontSize:'0.75rem', marginTop:'0.75rem', textAlign:'center' }}>
            $0 today · ${PLAN.priceMonthly}/mo after {PLAN.trialDays} days · cancel anytime
          </p>
        </div>
      </div>

      {/* Comparison table */}
      <div className="compare-table">
        <h2>How we compare</h2>
        <table className="ctable">
          <thead>
            <tr>
              <th></th>
              <th style={{ color:'var(--slate)' }}>Broker</th>
              <th style={{ color:'var(--teal)' }}>AptPilot</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Cost',                 "One month's rent, often $4,000+", `$${PLAN.priceMonthly}/mo, cancel anytime`],
              ['Who they work for',    'Paid more on pricier apartments', 'Flat fee — no bias'],
              ['No-fee listings',      'Rarely their priority',           'The only thing we send'],
              ['Speed',                'Business hours',                  'The moment a match is posted'],
              ['Commitment',           'Fee due at lease signing',        'Month to month, no contract'],
            ].map(([feat, broker, us]) => (
              <tr key={feat}>
                <td>{feat}</td>
                <td style={{ color:'var(--slate)' }}>{broker}</td>
                <td style={{ color:'var(--teal)', fontWeight:600 }}>{us}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FAQ */}
      <div className="faq-section">
        <div className="faq-inner">
          <h2>Frequently asked questions</h2>
          {FAQS.map(({ q, a }) => (
            <FaqItem key={q} q={q} a={a} />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="pricing-cta">
        <h2>Ready to find your apartment?</h2>
        <p>Set up your criteria in two minutes. The first {PLAN.trialDays} days are free.</p>
        <button className="btn btn-primary" onClick={handleSelect} style={{ fontSize:'1rem', padding:'0.9rem 2.5rem' }}>
          Start Free Trial →
        </button>
        <p style={{ color:'var(--slate)', fontSize:'0.8rem', marginTop:'1rem' }}>No card charged for {PLAN.trialDays} days · cancel anytime</p>
      </div>
    </div>
  )
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="faq-item">
      <div className="faq-q" onClick={() => setOpen(o => !o)}>
        {q}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--slate)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition:'transform 0.2s', flexShrink:0 }}><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      {open && <div className="faq-a">{a}</div>}
    </div>
  )
}
