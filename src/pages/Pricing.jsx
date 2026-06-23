import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PLANS = [
  {
    id: 'standard',
    name: 'Standard',
    price: 299,
    tag: null,
    features: [
      'Full listing search across all NYC sources',
      'Personalized tour agenda',
      'Automated agent scheduling',
      'Real-time listing alerts',
      'Dedicated support',
    ],
  },
  {
    id: 'core',
    name: 'Core',
    price: 399,
    tag: 'Most Popular',
    features: [
      'Everything in Standard',
      'Auto-filled rental applications',
      'Negotiation support',
      'Application progress tracking',
      'Priority tour scheduling',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 499,
    tag: 'Best Value',
    features: [
      'Everything in Core',
      '1-on-1 NYC licensed broker',
      '24/7 broker access',
      'Last-minute tour priority',
      'Full lease review & advice',
    ],
  },
]

const FAQS = [
  { q: 'What does AptPilot actually do?', a: 'We search every listing source in NYC, contact agents on your behalf, schedule tours at your available times, and help you submit applications — all for a single flat fee.' },
  { q: 'Is this a subscription?', a: 'No. It\'s a one-time payment per search. You pay once, we find your apartment.' },
  { q: 'How is this different from a broker?', a: 'A broker typically charges one month\'s rent (up to $4,000+). We charge a flat fee that covers the entire search from listing to lease, no recurring cost.' },
  { q: 'What if I don\'t find an apartment?', a: 'We\'ll work with you until you do. If we can\'t find a qualifying match within your criteria, reach out and we\'ll discuss a solution.' },
  { q: 'What\'s the chauffeur add-on?', a: 'On your tour day, we book a car to take you between every showing — so you\'re not sweating on the subway between 5 tours. Billed per day booked.' },
  { q: 'Which plan should I pick?', a: 'Core is the most popular — it includes auto-filled applications which saves hours and removes a major rejection risk. Go Pro if you want a dedicated NYC broker by your side.' },
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
    <div style={{ paddingTop: 68 }}>
      <style>{`
        .pricing-hero { text-align:center; padding:5rem 1.5rem 3.5rem; background:var(--navy); }
        .pricing-hero h1 { font-family:'Playfair Display',serif; font-size:clamp(2.2rem,5vw,3.5rem); color:#fff; margin-bottom:0.75rem; }
        .pricing-hero p { color:var(--slate); font-size:1.05rem; max-width:540px; margin:0 auto; line-height:1.65; }
        .pricing-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; max-width:960px; margin:0 auto; padding:3.5rem 1.5rem; }
        @media(max-width:720px){ .pricing-grid{grid-template-columns:1fr;} }
        .plan-card { border-radius:var(--radius-lg); background:#fff; box-shadow:var(--shadow); padding:2rem 1.75rem; position:relative; border:2px solid transparent; transition:all 0.2s; }
        .plan-card:hover { border-color:var(--teal); box-shadow:var(--shadow-teal); transform:translateY(-3px); }
        .plan-card.featured { border-color:var(--teal); box-shadow:var(--shadow-teal); }
        .plan-tag { position:absolute; top:-13px; left:50%; transform:translateX(-50%); background:var(--teal); color:var(--navy); font-size:0.7rem; font-weight:800; padding:0.25rem 0.85rem; border-radius:100px; text-transform:uppercase; letter-spacing:0.06em; white-space:nowrap; }
        .plan-name { font-family:'Playfair Display',serif; font-size:1.5rem; color:var(--navy); margin-bottom:0.25rem; }
        .plan-price { font-family:'Playfair Display',serif; font-size:3rem; color:var(--teal); line-height:1; margin-bottom:0.2rem; }
        .plan-price span { font-family:'Inter',sans-serif; font-size:0.9rem; color:var(--slate); font-weight:400; }
        .plan-desc { font-size:0.82rem; color:var(--slate); margin-bottom:1.5rem; }
        .plan-feats { display:flex; flex-direction:column; gap:0.6rem; margin-bottom:1.75rem; }
        .plan-feat { display:flex; gap:0.6rem; font-size:0.86rem; color:var(--navy); align-items:flex-start; }
        .feat-check { flex-shrink:0; margin-top:2px; }
        .compare-table { max-width:860px; margin:0 auto; padding:0 1.5rem 5rem; }
        .compare-table h2 { font-family:'Playfair Display',serif; font-size:2rem; color:var(--navy); text-align:center; margin-bottom:2rem; }
        .ctable { width:100%; border-collapse:collapse; font-size:0.88rem; }
        .ctable th { padding:0.75rem 1rem; text-align:center; font-weight:700; color:var(--slate); font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; }
        .ctable th:first-child { text-align:left; }
        .ctable td { padding:0.75rem 1rem; border-top:1px solid var(--surface-mid); text-align:center; color:var(--navy); }
        .ctable td:first-child { text-align:left; font-weight:500; }
        .ctable tr:hover td { background:var(--surface); }
        .faq-section { background:var(--surface); padding:4rem 1.5rem; }
        .faq-inner { max-width:700px; margin:0 auto; }
        .faq-inner h2 { font-family:'Playfair Display',serif; font-size:2rem; color:var(--navy); margin-bottom:2rem; text-align:center; }
        .faq-item { border-bottom:1px solid var(--surface-mid); padding:1.25rem 0; }
        .faq-q { font-weight:700; color:var(--navy); font-size:0.95rem; cursor:pointer; display:flex; justify-content:space-between; align-items:center; gap:1rem; }
        .faq-a { color:var(--slate); font-size:0.88rem; line-height:1.7; margin-top:0.75rem; }
        .pricing-cta { text-align:center; padding:5rem 1.5rem; background:var(--navy); }
        .pricing-cta h2 { font-family:'Playfair Display',serif; font-size:2.2rem; color:#fff; margin-bottom:0.75rem; }
        .pricing-cta p { color:var(--slate); margin-bottom:2rem; }
      `}</style>

      {/* Hero */}
      <div className="pricing-hero">
        <p style={{ color:'var(--teal)', fontWeight:700, fontSize:'0.8rem', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'1rem' }}>Transparent Pricing</p>
        <h1>One fee. No broker.<br />No surprises.</h1>
        <p>Pay once and we handle everything — searching, scheduling, applying. Save thousands compared to a traditional broker fee.</p>
      </div>

      {/* Plans */}
      <div className="pricing-grid">
        {PLANS.map(plan => (
          <div key={plan.id} className={`plan-card${plan.id === 'core' ? ' featured' : ''}`}>
            {plan.tag && <div className="plan-tag">{plan.tag}</div>}
            <div className="plan-name">{plan.name}</div>
            <div className="plan-price">${plan.price}<span> one-time</span></div>
            <div className="plan-desc">Everything you need to find and secure your next NYC apartment.</div>
            <div className="plan-feats">
              {plan.features.map(f => (
                <div className="plan-feat" key={f}>
                  <svg className="feat-check" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {f}
                </div>
              ))}
            </div>
            <button className={`btn${plan.id === 'core' ? ' btn-primary' : ' btn-outline'}`} onClick={handleSelect} style={{ width:'100%', justifyContent:'center' }}>
              Get Started →
            </button>
          </div>
        ))}
      </div>

      {/* Comparison table */}
      <div className="compare-table">
        <h2>How we compare</h2>
        <table className="ctable">
          <thead>
            <tr>
              <th></th>
              <th style={{ color:'var(--slate)' }}>Traditional Broker</th>
              <th style={{ color:'var(--teal)' }}>AptPilot</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Cost',              "One month's rent ($3,000–$6,000)", 'Flat $299–$499'],
              ['Listing search',    'Limited to broker\'s network',      'Every source in NYC'],
              ['Tour scheduling',   'Manual, broker availability',       'Automated, your schedule'],
              ['Applications',      'You fill them out',                 'Auto-filled for you'],
              ['Transparency',      'You follow the broker',             'Real-time dashboard'],
              ['Response time',     'Business hours only',               '24/7 for Pro'],
              ['Conflict of interest', 'Gets paid more on pricier apts', 'Flat fee — no bias'],
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
        <p>Join hundreds of New Yorkers who skipped the broker and found their place with AptPilot.</p>
        <button className="btn btn-primary" onClick={handleSelect} style={{ fontSize:'1rem', padding:'0.9rem 2.5rem', borderRadius:100 }}>
          Start Your Search →
        </button>
        <p style={{ color:'var(--slate)', fontSize:'0.8rem', marginTop:'1rem' }}>One-time payment · No subscription · 92% find an apartment within 3 weeks</p>
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

// useState needs to be imported for FaqItem
import { useState } from 'react'
