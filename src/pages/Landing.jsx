import { useNavigate } from 'react-router-dom'

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
  font-family: 'DM Serif Display', serif;
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
.stat-val { font-family: 'DM Serif Display', serif; font-size: 2.1rem; color: #94D2BD; }
.stat-lbl { font-size: 0.8rem; color: #64748B; margin-top: 0.25rem; }

.how-section {
  padding: 5rem 2rem; max-width: 1000px; margin: 0 auto; width: 100%;
}
.how-section h2 {
  font-family: 'DM Serif Display', serif; font-size: 2.2rem; color: var(--navy);
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
  font-family: 'DM Serif Display', serif; font-size: 2.2rem; color: #fff;
  text-align: center; margin-bottom: 0.5rem;
}
.pricing-sub { text-align: center; color: #64748B; font-size: 0.95rem; margin-bottom: 3rem; }
.pricing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
@media (max-width: 640px) { .pricing-grid { grid-template-columns: 1fr; } }
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
.price-amt { font-family: 'DM Serif Display', serif; font-size: 3rem; color: #fff; line-height: 1; }
.price-amt span { font-family: 'DM Sans', sans-serif; font-size: 0.9rem; color: #64748B; font-weight: 400; }
.price-features { margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; }
.price-feat { font-size: 0.85rem; color: #CBD5E1; display: flex; gap: 0.5rem; align-items: flex-start; }
.price-feat::before { content: '✓'; color: var(--teal); font-weight: 700; flex-shrink: 0; margin-top: 1px; }
.price-cta { margin-top: 1.75rem; width: 100%; text-align: center; }
`

const STEPS = [
  { icon: '📋', title: 'Tell us what you need', desc: 'Budget, bedrooms, neighborhoods, move-in date, and your available tour times.' },
  { icon: '🤖', title: 'AptPilot searches & books', desc: 'We scan every listing platform and automatically book tours during your available windows.' },
  { icon: '🏠', title: 'Tour, choose, apply', desc: 'Receive your tour agenda, visit the apartments, and apply with one click.' },
  { icon: '📅', title: 'We schedule everything', desc: 'No more back-and-forth emails. All tours are confirmed and added to your agenda.' },
  { icon: '🚀', title: 'One-click applications', desc: 'Your documents are pre-uploaded. Hit apply and we submit instantly to the landlord.' },
  { icon: '📊', title: 'Track your status', desc: 'Real-time updates on every application until you get your keys.' },
]

export default function Landing() {
  const navigate = useNavigate()
  return (
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

      <section className="pricing-section">
        <div className="pricing-inner">
          <h2>Simple, Flat-Fee Pricing</h2>
          <p className="pricing-sub">Pay once. No hidden fees. No commission. Save thousands vs. a broker.</p>
          <div className="pricing-grid">
            <div className="price-card">
              <div className="price-name">Core</div>
              <div className="price-amt">$399 <span>one-time</span></div>
              <div className="price-features">
                {['Full listing search across all platforms','Automated tour scheduling','Personalized tour agenda','One-click application submission','Real-time application tracking'].map(f => (
                  <div className="price-feat" key={f}>{f}</div>
                ))}
              </div>
              <div className="price-cta">
                <button className="btn btn-outline" style={{ width:'100%', color:'#fff', borderColor:'rgba(255,255,255,0.2)' }} onClick={() => navigate('/signup')}>Get Started</button>
              </div>
            </div>
            <div className="price-card featured">
              <div className="price-popular">Most Popular</div>
              <div className="price-name">Pro</div>
              <div className="price-amt">$599 <span>one-time</span></div>
              <div className="price-features">
                {['Everything in Core','Off-market listings access','Agent network sourcing','Priority tour scheduling','Dedicated support'].map(f => (
                  <div className="price-feat" key={f}>{f}</div>
                ))}
              </div>
              <div className="price-cta">
                <button className="btn btn-primary" style={{ width:'100%' }} onClick={() => navigate('/signup')}>Get Started</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
