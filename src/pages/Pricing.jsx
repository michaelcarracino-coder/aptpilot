import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PLANS = [
  {
    id: 'standard',
    name: 'Standard',
    price: 299,
    tag: null,
    desc: null,
    features: [
      'Full listing search across all NYC sources',
      'Application document organizer',
      'Negotiation support',
      'Application progress tracking',
      'Priority tour scheduling',
    ],
  },
  {
    id: 'core',
    name: 'Core',
    price: 399,
    tag: 'Most Popular',
    desc: null,
    features: [
      'Everything in Standard — no restrictions',
      'Unlimited searches, use it forever',
      'Search again next year, next move, anytime',
      'Multiple concurrent searches',
      'Priority support for every search',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 499,
    tag: 'White Glove',
    desc: 'A real NYC broker in your corner — from first search to signed lease.',
    features: [
      'Everything in Core',
      'Dedicated NYC licensed broker assigned to you',
      'Custom tour itinerary planned around your schedule',
      'Broker-built apartment shortlist & agenda',
      '24/7 broker access via call, text & email',
      'Full lease review & negotiation support',
    ],
  },
]

const FAQS = [
  { q: 'What does AptPilot actually do?', a: 'We search every listing source in NYC, contact agents on your behalf, schedule tours at your available times, and keep your application documents organized and ready — all for a single flat fee.' },
  { q: 'Is this a subscription?', a: 'The concierge plans are not — Core and Standard are one-time payments per search, and Pro is a one-time payment with unlimited searches forever. AptPilot Alerts is the exception: it\'s $14.99/mo (after a 3-day free trial) because we monitor new listings for you around the clock. Cancel anytime.' },
  { q: 'How is this different from a broker?', a: 'A broker typically charges one month\'s rent (up to $4,000+). We charge a flat fee that covers the entire search from listing to lease, no recurring cost.' },
  { q: 'What if I don\'t find an apartment?', a: 'We\'ll work with you until you do. If we can\'t find a qualifying match within your criteria, reach out and we\'ll discuss a solution.' },
  { q: 'What\'s the chauffeur add-on?', a: 'On your tour day, we book a car to take you between every showing — so you\'re not sweating on the subway between 5 tours. Billed per day booked.' },
  { q: 'Which plan should I pick?', a: 'Standard covers a single search with all our core tools. Core is best if you want to use AptPilot indefinitely — multiple searches, future moves, no repaying. Go Pro if you want a real NYC broker assigned to you, a custom tour agenda, and 24/7 direct access.' },
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
        .pricing-hero h1 { font-family:'Inter', sans-serif; font-size:clamp(2.2rem,5vw,3.5rem); color:#fff; margin-bottom:0.75rem; }
        .pricing-hero p { color:var(--slate); font-size:1.05rem; max-width:540px; margin:0 auto; line-height:1.65; }
        .pricing-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; max-width:960px; margin:0 auto; padding:3.5rem 1.5rem; }
        @media(max-width:720px){ .pricing-grid{grid-template-columns:1fr;} }
        .plan-card { border-radius:var(--radius-lg); background:#fff; box-shadow:var(--shadow); padding:2rem 1.75rem; position:relative; border:2px solid transparent; transition:all 0.2s; display:flex; flex-direction:column; }
        .plan-feats { flex:1; }
        .plan-card:hover { border-color:var(--teal); box-shadow:none; }
        .plan-card.featured { border-color:var(--teal); box-shadow:var(--shadow-teal); }
        .plan-tag { position:absolute; top:-13px; left:50%; transform:translateX(-50%); background:var(--teal); color:var(--navy); font-size:0.7rem; font-weight:800; padding:0.25rem 0.85rem; border-radius:4px; text-transform:uppercase; letter-spacing:0.06em; font-family:var(--mono); white-space:nowrap; }
        .plan-name { font-family:'Inter', sans-serif; font-size:1.5rem; color:var(--navy); margin-bottom:0.25rem; }
        .plan-price { font-family:'Inter', sans-serif; font-size:3rem; color:var(--teal); line-height:1; margin-bottom:0.2rem; }
        .plan-price span { font-family:'Inter',sans-serif; font-size:0.9rem; color:var(--slate); font-weight:400; }
        .plan-desc { font-size:0.82rem; color:var(--slate); margin-bottom:1.5rem; }
        .plan-feats { display:flex; flex-direction:column; gap:0.6rem; margin-bottom:1.75rem; }
        .plan-feat { display:flex; gap:0.6rem; font-size:0.86rem; color:var(--navy); align-items:flex-start; }
        .feat-check { flex-shrink:0; margin-top:2px; }
        .compare-table { max-width:860px; margin:0 auto; padding:0 1.5rem 5rem; }
        .compare-table h2 { font-family:'Inter', sans-serif; font-size:2rem; color:var(--navy); text-align:center; margin-bottom:2rem; }
        .ctable { width:100%; border-collapse:collapse; font-size:0.88rem; }
        .ctable th { padding:0.75rem 1rem; text-align:center; font-weight:700; color:var(--slate); font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; }
        .ctable th:first-child { text-align:left; }
        .ctable td { padding:0.75rem 1rem; border-top:1px solid var(--surface-mid); text-align:center; color:var(--navy); }
        .ctable td:first-child { text-align:left; font-weight:500; }
        .ctable tr:hover td { background:var(--surface); }
        .faq-section { background:var(--surface); padding:4rem 1.5rem; }
        .faq-inner { max-width:700px; margin:0 auto; }
        .faq-inner h2 { font-family:'Inter', sans-serif; font-size:2rem; color:var(--navy); margin-bottom:2rem; text-align:center; }
        .faq-item { border-bottom:1px solid var(--surface-mid); padding:1.25rem 0; }
        .faq-q { font-weight:700; color:var(--navy); font-size:0.95rem; cursor:pointer; display:flex; justify-content:space-between; align-items:center; gap:1rem; }
        .faq-a { color:var(--slate); font-size:0.88rem; line-height:1.7; margin-top:0.75rem; }
        .pricing-cta { text-align:center; padding:5rem 1.5rem; background:var(--navy); }
        .pricing-cta h2 { font-family:'Inter', sans-serif; font-size:2.2rem; color:#fff; margin-bottom:0.75rem; }
        .pricing-cta p { color:var(--slate); margin-bottom:2rem; }
      `}</style>

      {/* Hero */}
      <div className="pricing-hero">
        <p style={{ color:'var(--teal)', fontWeight:700, fontSize:'0.8rem', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'1rem' }}>Transparent Pricing</p>
        <h1>One fee. No broker.<br />No surprises.</h1>
        <p>Pay once and we handle everything — searching, scheduling, applying. Save thousands compared to a traditional broker fee.</p>
      </div>

      {/* Alerts subscription */}
      <div style={{ maxWidth:960, margin:'0 auto', padding:'3rem 1.5rem 0' }}>
        <div style={{ background:'var(--navy)', borderRadius:20, padding:'2rem 2.25rem', display:'flex', flexWrap:'wrap', alignItems:'center', gap:'1.5rem', border:'1.5px solid var(--teal)', boxShadow:'none' }}>
          <div style={{ flex:'1 1 320px' }}>
            <div style={{ display:'inline-block', background:'var(--teal)', color:'var(--navy)', fontSize:'0.68rem', fontWeight:800, padding:'0.25rem 0.75rem', borderRadius:4, textTransform:'uppercase', letterSpacing:'0.07em', fontFamily:'var(--mono)', marginBottom:'0.75rem' }}>New · 3-Day Free Trial</div>
            <h2 style={{ fontFamily:"'Inter', sans-serif", color:'#fff', fontSize:'1.7rem', marginBottom:'0.4rem' }}>AptPilot Alerts</h2>
            <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.9rem', lineHeight:1.65, margin:0 }}>
              Good no-fee apartments in NYC lease within hours. We watch new listings around the clock and text + email you the instant one matches your criteria — so you tour first.
            </p>
          </div>
          <div style={{ textAlign:'center', flex:'0 0 auto' }}>
            <div style={{ fontFamily:"'Inter', sans-serif", fontSize:'2.6rem', color:'var(--teal)', lineHeight:1 }}>$14.99<span style={{ fontFamily:"'Inter',sans-serif", fontSize:'0.85rem', color:'rgba(255,255,255,0.5)' }}>/mo</span></div>
            <button className="btn btn-primary" onClick={handleSelect} style={{ marginTop:'0.85rem', justifyContent:'center', padding:'0.75rem 1.75rem' }}>
              Start Free Trial →
            </button>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'0.72rem', marginTop:'0.5rem' }}>Cancel anytime</p>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="pricing-grid">
        {PLANS.map(plan => (
          <div key={plan.id} className={`plan-card${plan.id === 'core' || plan.id === 'pro' ? ' featured' : ''}`}
            style={plan.id === 'pro' ? { borderColor:'var(--navy)', boxShadow:'0 8px 40px rgba(12,22,40,0.18)' } : {}}>
            {plan.tag && <div className="plan-tag">{plan.tag}</div>}
            <div className="plan-name">{plan.name}</div>
            <div className="plan-price">${plan.price}<span> one-time</span></div>
            <div className="plan-desc">{plan.desc || (plan.id === 'core' ? 'Pay once. Search forever — this year, next year, every move.' : 'Everything you need to find and secure your next NYC apartment.')}</div>
            <div className="plan-feats">
              {plan.features.map(f => (
                <div className="plan-feat" key={f}>
                  <svg className="feat-check" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {f}
                </div>
              ))}
            </div>
            <button className={`btn${plan.id === 'standard' ? ' btn-outline' : ' btn-primary'}`} onClick={handleSelect} style={{ width:'100%', justifyContent:'center' }}>
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
              ['Organization',      'Scattered docs, missed deadlines',  'Built to keep you ready & organized'],
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
        <p>Set up your criteria in two minutes. Alerts start with a free trial; concierge is a flat one-time fee.</p>
        <button className="btn btn-primary" onClick={handleSelect} style={{ fontSize:'1rem', padding:'0.9rem 2.5rem' }}>
          Start Your Search →
        </button>
        <p style={{ color:'var(--slate)', fontSize:'0.8rem', marginTop:'1rem' }}>Flat pricing · Cancel alerts anytime · 7-day tour guarantee on concierge plans</p>
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
