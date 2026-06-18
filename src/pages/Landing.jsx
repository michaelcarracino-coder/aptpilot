import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import SEO from '../components/SEO'

const styles = `
.landing {
  min-height: calc(100vh - 64px);
  background: linear-gradient(160deg, #0D1B2A 0%, #0D2A3A 55%, #0D1B2A 100%);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 5rem 2rem; position: relative; overflow: hidden;
}
.landing::before {
  content:''; position:absolute; width:700px; height:700px; border-radius:50%;
  background: radial-gradient(circle, rgba(10,147,150,0.13) 0%, transparent 70%);
  top:-150px; right:-150px; pointer-events:none;
}
.landing::after {
  content:''; position:absolute; width:500px; height:500px; border-radius:50%;
  background: radial-gradient(circle, rgba(148,210,189,0.07) 0%, transparent 70%);
  bottom:-80px; left:-80px; pointer-events:none;
}
.landing-badge {
  background: rgba(10,147,150,0.15); border: 1px solid rgba(10,147,150,0.3);
  color: #94D2BD; padding: 0.35rem 1rem; border-radius: 100px;
  font-size: 0.78rem; font-weight: 500; letter-spacing: 0.06em;
  text-transform: uppercase; margin-bottom: 1.5rem;
  animation: fadeUp 0.5s ease both;
}
.landing-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(2.8rem, 6vw, 5rem);
  color: #fff; text-align: center; line-height: 1.1;
  max-width: 820px; margin-bottom: 1.25rem;
  animation: fadeUp 0.5s 0.1s ease both;
}
.landing-title em { color: var(--teal); font-style: italic; }
.landing-sub {
  font-size: 1.1rem; color: #94A3B8; text-align: center;
  max-width: 560px; line-height: 1.75; margin-bottom: 2.5rem;
  animation: fadeUp 0.5s 0.2s ease both;
}
.landing-cta {
  display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;
  animation: fadeUp 0.5s 0.3s ease both;
}
.landing-stats {
  display: flex; gap: 3.5rem; margin-top: 4.5rem; flex-wrap: wrap; justify-content: center;
  animation: fadeUp 0.5s 0.4s ease both;
}
.stat { text-align: center; }
.stat-val { font-family: 'Cormorant Garamond', serif; font-size: 2.1rem; color: #94D2BD; }
.stat-lbl { font-size: 0.8rem; color: #64748B; margin-top: 0.25rem; }

.how-section {
  padding: 5rem 2rem; max-width: 1000px; margin: 0 auto; width: 100%;
}
.how-section h2 {
  font-family: 'Cormorant Garamond', serif; font-size: 2.2rem; color: var(--navy);
  text-align: center; margin-bottom: 0.5rem;
}
.how-sub { text-align: center; color: var(--gray); font-size: 0.95rem; margin-bottom: 3rem; }
.steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
@media (max-width: 700px) { .steps-grid { grid-template-columns: 1fr; } }
.step-card {
  background: #fff; border-radius: 14px; padding: 1.75rem;
  box-shadow: var(--shadow); text-align: center;
  border-top: 3px solid var(--teal);
}
.step-num {
  width: 36px; height: 36px; background: var(--teal-pale); border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; color: var(--teal); font-size: 0.9rem; margin: 0 auto 1rem;
}
.step-icon { font-size: 1.8rem; margin-bottom: 0.75rem; }
.step-title { font-weight: 700; font-size: 1rem; color: var(--navy); margin-bottom: 0.4rem; }
.step-desc { font-size: 0.85rem; color: var(--gray); line-height: 1.6; }

.pricing-section {
  background: var(--navy); padding: 5rem 2rem;
}
.pricing-inner { max-width: 860px; margin: 0 auto; }
.pricing-inner h2 {
  font-family: 'Cormorant Garamond', serif; font-size: 2.2rem; color: #fff;
  text-align: center; margin-bottom: 0.5rem;
}
.pricing-sub { text-align: center; color: #64748B; font-size: 0.95rem; margin-bottom: 3rem; }
.pricing-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
@media (max-width: 900px) { .pricing-grid-3 { grid-template-columns: 1fr; } }
.price-card {
  border-radius: 16px; padding: 2rem;
  background: #0D2A3A; border: 1.5px solid rgba(255,255,255,0.08);
  position: relative;
}
.price-card.featured { border-color: var(--teal); background: rgba(10,147,150,0.12); }
.price-popular {
  position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
  background: var(--teal); color: #fff; font-size: 0.72rem; font-weight: 700;
  padding: 0.25rem 0.9rem; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.06em;
  white-space: nowrap;
}
.price-name { font-size: 0.8rem; font-weight: 700; color: var(--teal); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.75rem; }
.price-amt { font-family: 'Cormorant Garamond', serif; font-size: 3rem; color: #fff; line-height: 1; }
.price-amt span { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.9rem; color: #64748B; font-weight: 400; }
.price-features { margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
.price-feat { font-size: 0.85rem; color: #CBD5E1; display: flex; gap: 0.5rem; align-items: flex-start; }
.price-feat::before { content: '✓'; color: var(--teal); font-weight: 700; flex-shrink: 0; margin-top: 1px; }
.price-cta { margin-top: 1.75rem; width: 100%; text-align: center; }

.calc-section {
  padding: 5rem 2rem;
  background: var(--off-white);
}
.calc-inner {
  max-width: 780px; margin: 0 auto;
}
.calc-inner h2 {
  font-family: 'Cormorant Garamond', serif; font-size: 2.2rem; color: var(--navy);
  text-align: center; margin-bottom: 0.5rem;
}
.calc-sub { text-align: center; color: var(--gray); font-size: 0.95rem; margin-bottom: 2.5rem; }
.calc-card {
  background: white; border-radius: 16px; box-shadow: var(--shadow);
  padding: 2.5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;
}
@media(max-width:640px){ .calc-card { grid-template-columns: 1fr; } }
.calc-label { font-size: 0.8rem; font-weight: 600; color: #475569; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.5rem; }
.calc-input {
  width: 100%; border: 2px solid var(--gray-light); border-radius: 10px;
  padding: 0.8rem 1rem; font-size: 1.5rem; font-family: 'Cormorant Garamond', serif;
  color: var(--navy); font-weight: 600; outline: none; transition: border-color 0.18s;
}
.calc-input:focus { border-color: var(--teal); }
.calc-slider { width: 100%; margin-top: 0.75rem; accent-color: var(--teal); cursor: pointer; }
.calc-result {
  background: var(--navy); border-radius: 12px; padding: 1.75rem;
  display: flex; flex-direction: column; justify-content: center; gap: 1rem;
}
.calc-result-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.08); }
.calc-result-row:last-child { border: none; }
.calc-result-label { font-size: 0.85rem; color: #94A3B8; }
.calc-result-val { font-family: 'Cormorant Garamond', serif; font-size: 1.4rem; color: white; font-weight: 500; }
.calc-result-val.savings { color: #94D2BD; font-size: 1.8rem; }
.calc-cta-wrap { text-align: center; margin-top: 1.75rem; }
.calc-note { font-size: 0.78rem; color: var(--gray); margin-top: 0.75rem; text-align: center; }

.faq-section { padding: 5rem 2rem; background: white; }
.faq-inner { max-width: 780px; margin: 0 auto; }
.faq-inner h2 {
  font-family: 'Cormorant Garamond', serif; font-size: 2.2rem; color: var(--navy);
  text-align: center; margin-bottom: 0.5rem;
}
.faq-sub { text-align: center; color: var(--gray); font-size: 0.95rem; margin-bottom: 3rem; }
.faq-list { display: flex; flex-direction: column; gap: 0.75rem; }
.faq-item {
  border: 1.5px solid var(--gray-light); border-radius: 12px;
  overflow: hidden; transition: border-color 0.2s;
}
.faq-item.open { border-color: var(--teal); }
.faq-question {
  width: 100%; display: flex; justify-content: space-between; align-items: center;
  padding: 1.1rem 1.5rem; background: white; border: none; cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif; font-size: 0.95rem; font-weight: 600;
  color: var(--navy); text-align: left; transition: background 0.15s;
}
.faq-item.open .faq-question { background: var(--teal-pale); color: var(--teal); }
.faq-icon { font-size: 1.2rem; flex-shrink: 0; margin-left: 1rem; transition: transform 0.2s; color: var(--gray); }
.faq-item.open .faq-icon { transform: rotate(45deg); color: var(--teal); }
.faq-answer {
  max-height: 0; overflow: hidden; transition: max-height 0.3s ease, padding 0.2s;
  padding: 0 1.5rem; color: var(--gray); font-size: 0.9rem; line-height: 1.7;
}
.faq-item.open .faq-answer { max-height: 300px; padding: 0.75rem 1.5rem 1.25rem; }

.exit-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(13,27,42,0.75); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; animation: fadeUp 0.3s ease both;
  padding: 1.5rem;
}
.exit-modal {
  background: white; border-radius: 20px; max-width: 480px; width: 100%;
  padding: 2.5rem; position: relative; text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  animation: fadeUp 0.35s 0.05s ease both;
}
.exit-close {
  position: absolute; top: 1.1rem; right: 1.1rem;
  width: 32px; height: 32px; border-radius: 50%;
  background: var(--off-white); border: none; cursor: pointer;
  font-size: 1.1rem; color: var(--gray); display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.exit-close:hover { background: var(--gray-light); color: var(--navy); }
.exit-icon { font-size: 2.5rem; margin-bottom: 1rem; }
.exit-modal h3 {
  font-family: 'Cormorant Garamond', serif; font-size: 1.75rem; color: var(--navy);
  margin-bottom: 0.6rem; line-height: 1.2;
}
.exit-modal p { color: var(--gray); font-size: 0.92rem; margin-bottom: 1.5rem; line-height: 1.6; }
.exit-form { display: flex; flex-direction: column; gap: 0.75rem; }
.exit-input {
  width: 100%; border: 1.5px solid var(--gray-light); border-radius: 10px;
  padding: 0.85rem 1rem; font-size: 0.95rem; outline: none;
  transition: border-color 0.18s; font-family: 'Plus Jakarta Sans', sans-serif;
}
.exit-input:focus { border-color: var(--teal); }
.exit-note { font-size: 0.74rem; color: #94A3B8; margin-top: 0.85rem; }
.exit-success { padding: 1rem 0; }
.exit-success-icon { font-size: 2.5rem; margin-bottom: 0.75rem; }
`

const STEPS = [
  { icon: '📋', title: 'Tell us what you need', desc: 'Budget, bedrooms, neighborhoods, move-in date, and your available tour times.' },
  { icon: '🤖', title: 'AptPilot searches & books', desc: 'We scan every listing platform and automatically book tours during your available windows.' },
  { icon: '🏠', title: 'Tour, choose, apply', desc: 'Receive your tour agenda, visit the apartments, and apply with one click.' },
  { icon: '📅', title: 'We schedule everything', desc: 'No more back-and-forth emails. All tours are confirmed and added to your agenda.' },
  { icon: '🚀', title: 'One-click applications', desc: 'Your documents are pre-uploaded. Hit apply and we submit instantly to the landlord.' },
  { icon: '📊', title: 'Track your status', desc: 'Real-time updates on every application until you get your keys.' },
]



const FAQS = [
  {
    q: "Is AptPilot legal in New York City?",
    a: "Yes. AptPilot is a technology platform, not a licensed broker. We automate tasks you authorize us to perform on your behalf — searching listings, scheduling tours, and submitting applications with your documents. We do not negotiate lease terms or represent you in a legal capacity. Think of us as a very smart personal assistant."
  },
  {
    q: "What listing platforms do you search?",
    a: "AptPilot searches across all major NYC listing platforms including StreetEasy, Zillow, Apartments.com, Rent.com, and more. Pro plan members also get access to off-market listings sourced through our agent and owner network."
  },
  {
    q: "What happens if I don't find an apartment I like?",
    a: "We keep searching and scheduling tours until you find the right place. Your search stays active until you sign a lease or cancel. If you genuinely can't find anything that fits your criteria within 60 days, contact our support team and we'll work with you on a solution."
  },
  {
    q: "How does the application submission work?",
    a: "You upload your documents once — pay stubs, tax returns, bank statements, and ID. When you find an apartment you love, you click Apply in your dashboard and AptPilot auto-fills and submits the application to the landlord using your pre-uploaded documents. You review and confirm before anything is sent."
  },
  {
    q: "Will landlords and agents accept AI-scheduled tours?",
    a: "Yes — tour requests are sent professionally on your behalf via email and phone, the same way any person or assistant would reach out. Landlords and agents receive a normal tour request and respond accordingly. In our experience, the vast majority confirm without issue."
  },
  {
    q: "How is AptPilot different from StreetEasy or Zillow?",
    a: "StreetEasy and Zillow are search portals — they show you listings but leave all the work to you. AptPilot actually does the work: contacts agents, books tours, builds your agenda, and submits applications. It's the difference between a map and a chauffeur."
  },
  {
    q: "Is my personal and financial information secure?",
    a: "Absolutely. All documents and personal data are encrypted in transit and at rest using AES-256 encryption. We never sell your data and only share it with landlords and platforms as part of applications you explicitly authorize. You can request deletion of all your data at any time."
  },
  {
    q: "What does the Pro plan include that Core doesn't?",
    a: "Pro adds access to off-market listings (apartments not listed publicly), priority tour scheduling so your requests go to the front of the queue, agent network sourcing, and dedicated 1-on-1 support. It's designed for renters with tighter timelines or higher-end requirements."
  },
  {
    q: "What is the Tour Chauffeur add-on?",
    a: "For an additional per-booking fee, AptPilot will automatically arrange a chauffeured car to take you between all your tours on your tour day. The driver is booked based on your tour schedule and you receive full pickup details in your dashboard. We partner with licensed car services in NYC."
  },
  {
    q: "What if I want a refund?",
    a: "If AptPilot fails to schedule a single tour within 7 days of your search launching (assuming you have reasonable criteria and availability), we'll issue a full refund. Outside of that, all sales are final given the work we put in from day one of your search. Contact support@aptpilot.com with any concerns."
  },
]

function FAQ() {
  const [open, setOpen] = useState(null)
  return (
    <section className="faq-section">
      <div className="faq-inner">
        <h2>Frequently Asked Questions</h2>
        <p className="faq-sub">Everything you need to know before getting started.</p>
        <div className="faq-list">
          {FAQS.map((faq, i) => (
            <div key={i} className={`faq-item ${open === i ? 'open' : ''}`}>
              <button className="faq-question" onClick={() => setOpen(open === i ? null : i)}>
                {faq.q}
                <span className="faq-icon">+</span>
              </button>
              <div className="faq-answer">{faq.a}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SavingsCalc({ navigate }) {
  const [rent, setRent] = useState(3500)
  const brokerFee = Math.round(rent * 1.0833 * 100) / 100
  const aptPilot = 399
  const savings = brokerFee - aptPilot

  return (
    <section className="calc-section">
      <div className="calc-inner">
        <h2>How Much Will You Save?</h2>
        <p className="calc-sub">See exactly what AptPilot saves you vs. a traditional broker.</p>
        <div className="calc-card">
          <div>
            <div className="calc-label">Your Monthly Rent</div>
            <input
              className="calc-input"
              type="text"
              value={"$" + rent.toLocaleString()}
              onChange={e => {
                const val = parseInt(e.target.value.replace(/[^0-9]/g, '')) || 0
                if (val <= 20000) setRent(val)
              }}
            />
            <input
              className="calc-slider"
              type="range"
              min={1500}
              max={15000}
              step={100}
              value={rent}
              onChange={e => setRent(Number(e.target.value))}
            />
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.78rem', color:'var(--gray)', marginTop:'0.3rem' }}>
              <span>$1,500</span><span>$15,000</span>
            </div>
          </div>
          <div className="calc-result">
            <div className="calc-result-row">
              <span className="calc-result-label">Traditional Broker Fee</span>
              <span className="calc-result-val">${brokerFee.toLocaleString()}</span>
            </div>
            <div className="calc-result-row">
              <span className="calc-result-label">AptPilot Fee</span>
              <span className="calc-result-val">$399</span>
            </div>
            <div className="calc-result-row">
              <span className="calc-result-label">You Save</span>
              <span className="calc-result-val savings">${savings.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="calc-cta-wrap">
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/signup')}>
            Save ${savings.toLocaleString()} — Start My Search →
          </button>
          <p className="calc-note">One-time flat fee. No hidden costs. No commission.</p>
        </div>
      </div>
    </section>
  )
}


function ExitIntentModal({ show, onClose }) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  if (!show) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.includes('@')) { setError('Please enter a valid email'); return }
    setError('')
    try {
      await fetch('/api/capture-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'exit_intent' }),
      })
    } catch (err) {
      console.error('Email capture failed:', err)
    }
    setSubmitted(true)
  }

  return (
    <div className="exit-overlay" onClick={onClose}>
      <div className="exit-modal" onClick={e => e.stopPropagation()}>
        <button className="exit-close" onClick={onClose}>✕</button>
        {!submitted ? (
          <>
            <div className="exit-icon">📋</div>
            <h3>Wait — don't leave empty-handed!</h3>
            <p>Get our free NYC Apartment Hunting Checklist — everything you need to know before signing a lease, straight to your inbox.</p>
            <form className="exit-form" onSubmit={handleSubmit}>
              <input
                className="exit-input"
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              {error && <p style={{ color:'#EF4444', fontSize:'0.8rem', margin:0 }}>{error}</p>}
              <button className="btn btn-primary" type="submit" style={{ justifyContent:'center', padding:'0.85rem' }}>
                Send Me The Checklist →
              </button>
            </form>
            <p className="exit-note">No spam. Unsubscribe anytime.</p>
          </>
        ) : (
          <div className="exit-success">
            <div className="exit-success-icon">✅</div>
            <h3>You're in!</h3>
            <p>Check your inbox — your free NYC Apartment Checklist is on its way.</p>
            <button className="btn btn-dark" onClick={onClose} style={{ marginTop:'0.5rem' }}>Continue Browsing</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const [showExitModal, setShowExitModal] = useState(false)
  const [hasShown, setHasShown] = useState(false)

  useEffect(() => {
    const alreadyShown = sessionStorage.getItem('aptpilot_exit_shown')
    if (alreadyShown) { setHasShown(true); return }

    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !hasShown) {
        setShowExitModal(true)
        setHasShown(true)
        sessionStorage.setItem('aptpilot_exit_shown', 'true')
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [hasShown])

  return (
    <>
    <SEO
      title="AptPilot — NYC Apartment Search Without a Broker Fee"
      description="Avoid the NYC broker fee. AptPilot searches every listing, books your tours, and submits applications automatically — starting at $299 flat fee."
      canonical="https://aptpilot.vercel.app/"
    />
    <ExitIntentModal show={showExitModal} onClose={() => setShowExitModal(false)} />
    <>
      <style>{styles}</style>

      <section className="landing">
        <div className="landing-badge">🏙 Now Live in New York City</div>
        <h1 className="landing-title">Your apartment search,<br /><em>on autopilot.</em></h1>
        <p className="landing-sub">
          AptPilot searches every listing, books your tours, and submits your applications — all for a one-time flat fee. No broker. No stress.
        </p>
        <div className="landing-cta">
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/signup')}>Start My Search →</button>
          <button className="btn btn-ghost btn-lg" onClick={() => navigate('/login')}>I have an account</button>
        </div>
        <div className="landing-stats">
          {[['$0','Broker fees'],['$399','Flat fee vs. $3–6K broker'],['1 day','Tour agenda delivered'],['1-click','Application submission']].map(([v,l]) => (
            <div className="stat" key={l}><div className="stat-val">{v}</div><div className="stat-lbl">{l}</div></div>
          ))}
        </div>
      </section>

      <section className="how-section">
        <h2>How AptPilot Works</h2>
        <p className="how-sub">From criteria to keys — we handle the whole process.</p>
        <div className="steps-grid">
          {STEPS.map((s, i) => (
            <div className="step-card" key={i}>
              <div className="step-num">{i + 1}</div>
              <div className="step-icon">{s.icon}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>


      {/* SAVINGS CALCULATOR */}
      <SavingsCalc navigate={navigate} />

      <FAQ />

      <section className="pricing-section">
        <div className="pricing-inner">
          <h2>Simple, Transparent Pricing</h2>
          <p className="pricing-sub">Pay once. No subscription. No commission. Save thousands vs. a broker.</p>
          <div className="pricing-grid-3">
            <div className="price-card">
              <div className="price-name">Standard</div>
              <div className="price-amt">$299 <span>one-time</span></div>
              <div className="price-features">
                {['Full listing search across all platforms','Personalized tour agenda','Automated tour scheduling','Real-time listing alerts','Dedicated email support','Move-in checklist & resources'].map(f => (
                  <div className="price-feat" key={f}>{f}</div>
                ))}
              </div>
              <div className="price-cta">
                <button className="btn btn-outline" style={{ width:'100%', color:'#fff', borderColor:'rgba(255,255,255,0.2)' }} onClick={() => navigate('/signup')}>Get Started</button>
              </div>
            </div>
            <div className="price-card featured">
              <div className="price-popular">Most Popular</div>
              <div className="price-name">Core</div>
              <div className="price-amt">$399 <span>one-time</span></div>
              <div className="price-features">
                {['Everything in Standard','Auto-filled applications submitted for you','Negotiation support on your behalf','Real-time application status updates','Landlord & agent follow-up handled','Priority tour scheduling'].map(f => (
                  <div className="price-feat" key={f}>{f}</div>
                ))}
              </div>
              <div className="price-cta">
                <button className="btn btn-primary" style={{ width:'100%' }} onClick={() => navigate('/signup')}>Get Started</button>
              </div>
            </div>
            <div className="price-card">
              <div className="price-name">Pro</div>
              <div className="price-amt">$499 <span>one-time</span></div>
              <div className="price-features">
                {['Everything in Core','1-on-1 with a real NYC broker','24/7 broker access via phone & text','Prioritized scheduling for last-minute tours','Broker-led negotiation & lease review','White-glove move-in coordination'].map(f => (
                  <div className="price-feat" key={f}>{f}</div>
                ))}
              </div>
              <div className="price-cta">
                <button className="btn btn-outline" style={{ width:'100%', color:'#fff', borderColor:'rgba(255,255,255,0.2)' }} onClick={() => navigate('/signup')}>Get Started</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
    </>
  )
}
