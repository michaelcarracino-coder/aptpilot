import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import SEO from '../components/SEO'
import { supabase } from '../lib/supabase'

/* ─── Pexels photo URLs (verified) ─── */
const px = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1920`
const PHOTOS = {
  heroSkyline: px(28518041),   // NYC skyline at night
  brownstones: px(30726437),   // Brooklyn brownstones in fall
  aerial:      px(18511465),   // Aerial view of Midtown Manhattan
  manhattan:   px(10633466),   // Aerial view of Manhattan
  street:      px(16920867),   // Street in Manhattan
}

/* ─── SVG Icon library ─── */
function Icon({ name, size = 22, color = 'currentColor', strokeWidth = 1.6 }) {
  const s = { width: size, height: size, display: 'block', flexShrink: 0 }
  const p = { fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (name) {
    case 'clipboard':
      return <svg viewBox="0 0 24 24" style={s}><rect x="8" y="2" width="8" height="4" rx="1" {...p}/><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" {...p}/><path d="M9 12h6M9 16h4" {...p}/></svg>
    case 'search':
      return <svg viewBox="0 0 24 24" style={s}><circle cx="11" cy="11" r="8" {...p}/><path d="M21 21l-4.35-4.35" {...p}/></svg>
    case 'calendar':
      return <svg viewBox="0 0 24 24" style={s}><rect x="3" y="4" width="18" height="18" rx="2" {...p}/><path d="M16 2v4M8 2v4M3 10h18" {...p}/></svg>
    case 'building':
      return <svg viewBox="0 0 24 24" style={s}><path d="M3 21h18M5 21V7l7-4 7 4v14" {...p}/><path d="M9 21v-4h6v4M9 11h.01M15 11h.01M9 15h.01M15 15h.01" {...p}/></svg>
    case 'zap':
      return <svg viewBox="0 0 24 24" style={s}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" {...p}/></svg>
    case 'key':
      return <svg viewBox="0 0 24 24" style={s}><circle cx="7.5" cy="15.5" r="5.5" {...p}/><path d="M21 2l-9.6 9.6M15.5 7.5L19 11" {...p}/></svg>
    case 'check':
      return <svg viewBox="0 0 24 24" style={s}><polyline points="20 6 9 17 4 12" {...p}/></svg>
    case 'check-circle':
      return <svg viewBox="0 0 24 24" style={s}><path d="M22 11.08V12a10 10 0 11-5.93-9.14" {...p}/><polyline points="22 4 12 14.01 9 11.01" {...p}/></svg>
    case 'mail':
      return <svg viewBox="0 0 24 24" style={s}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" {...p}/><polyline points="22,6 12,13 2,6" {...p}/></svg>
    case 'star':
      return <svg viewBox="0 0 24 24" style={s}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={color} stroke={color} strokeWidth={0.5}/></svg>
    case 'arrow-right':
      return <svg viewBox="0 0 24 24" style={s}><path d="M5 12h14M12 5l7 7-7 7" {...p}/></svg>
    case 'shield':
      return <svg viewBox="0 0 24 24" style={s}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" {...p}/></svg>
    case 'map-pin':
      return <svg viewBox="0 0 24 24" style={s}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" {...p}/><circle cx="12" cy="10" r="3" {...p}/></svg>
    default:
      return null
  }
}

/* ─── Scroll-reveal hook ─── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target) } }),
      { threshold: 0.1 }
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  })
}

/* ─── Section header ─── */
function SectionHeader({ eyebrow, title, sub, light }) {
  return (
    <div className="reveal" style={{ textAlign: 'center', marginBottom: '4rem' }}>
      {eyebrow && (
        <div style={{
          display: 'inline-block',
          background: light ? 'rgba(10,191,191,0.12)' : 'rgba(10,191,191,0.1)',
          border: '1px solid rgba(10,191,191,0.25)',
          color: '#0ABFBF', padding: '0.3rem 1rem', borderRadius: 100,
          fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', marginBottom: '1.25rem',
        }}>{eyebrow}</div>
      )}
      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 'clamp(2rem, 4vw, 2.8rem)',
        fontWeight: 700, lineHeight: 1.18,
        color: light ? '#fff' : 'var(--navy)',
        marginBottom: '0.9rem',
      }}>{title}</h2>
      {sub && (
        <p style={{
          fontSize: '1.05rem', color: light ? 'rgba(255,255,255,0.55)' : 'var(--text-muted)',
          maxWidth: 540, margin: '0 auto', lineHeight: 1.75,
        }}>{sub}</p>
      )}
    </div>
  )
}

/* ─── Steps data ─── */
const STEPS = [
  { num: '01', icon: 'clipboard', title: 'Tell us what you need', desc: 'Budget, bedrooms, neighborhoods, move-in date, and available tour windows.' },
  { num: '02', icon: 'search',    title: 'We search every platform', desc: 'AptPilot scans StreetEasy, Zillow, Apartments.com and more in real time.' },
  { num: '03', icon: 'calendar',  title: 'Tours booked automatically', desc: 'We contact agents and schedule tours during your available windows — no back-and-forth.' },
  { num: '04', icon: 'building',  title: 'Tour your shortlist', desc: 'Receive a clean tour agenda. Show up, see apartments, and decide.' },
  { num: '05', icon: 'zap',       title: 'One-click application', desc: 'Docs pre-uploaded. Hit apply and we submit instantly to the landlord.' },
  { num: '06', icon: 'key',       title: 'Get your keys', desc: 'Real-time updates on every application until you sign your lease.' },
]

/* ─── Testimonials loaded from Supabase ─── */

/* ─── FAQs ─── */
const FAQS = [
  { q: "Is AptPilot legal in New York City?", a: "Yes. AptPilot is a technology platform, not a licensed broker. We automate tasks you authorize us to perform on your behalf — searching listings, scheduling tours, and submitting applications with your documents. Think of us as a very smart personal assistant." },
  { q: "What listing platforms do you search?", a: "AptPilot searches across all major NYC listing platforms including StreetEasy, Zillow, Apartments.com, Rent.com, and more. Pro plan members also get access to off-market listings sourced through our agent and owner network." },
  { q: "How does the application submission work?", a: "You upload your documents once — pay stubs, tax returns, bank statements, and ID. When you find an apartment you love, click Apply in your dashboard and AptPilot auto-fills and submits the application. You review and confirm before anything is sent." },
  { q: "Will landlords accept AI-scheduled tours?", a: "Yes — tour requests are sent professionally via email and phone, the same way any person or assistant would reach out. In our experience, the vast majority of landlords and agents confirm without issue." },
  { q: "How is AptPilot different from StreetEasy or Zillow?", a: "StreetEasy and Zillow are search portals — they show you listings but leave all the work to you. AptPilot actually does the work: contacts agents, books tours, builds your agenda, and submits applications. It's the difference between a map and a chauffeur." },
  { q: "What if I want a refund?", a: "If AptPilot fails to schedule a single tour within 7 days of your search launching (with reasonable criteria), we'll issue a full refund. Contact support@aptpilot.com with any concerns." },
]

/* ─── FAQ Item ─── */
function FaqItem({ q, a, open, toggle }) {
  return (
    <div style={{ border: `1.5px solid ${open ? 'var(--teal)' : 'var(--surface-mid)'}`, borderRadius: 14, overflow: 'hidden', transition: 'border-color 0.22s', background: '#fff' }}>
      <button onClick={toggle} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.6rem', background: open ? 'rgba(10,191,191,0.05)' : 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.18s', gap: '1rem' }}>
        <span style={{ fontWeight: 600, fontSize: '0.97rem', color: open ? 'var(--teal)' : 'var(--navy)', lineHeight: 1.45 }}>{q}</span>
        <span style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: open ? 'var(--teal)' : 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: open ? '#fff' : 'var(--slate)', fontSize: '1.1rem', fontWeight: 300, transition: 'all 0.22s', transform: open ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
      </button>
      <div style={{ maxHeight: open ? 300 : 0, overflow: 'hidden', transition: 'max-height 0.35s ease' }}>
        <p style={{ padding: '0.5rem 1.6rem 1.4rem', color: 'var(--text-muted)', fontSize: '0.93rem', lineHeight: 1.75 }}>{a}</p>
      </div>
    </div>
  )
}

/* ─── Savings Calculator ─── */
function SavingsCalc({ navigate }) {
  const [rent, setRent] = useState(3500)
  const brokerFee = Math.round(rent * 1.0833)
  const aptPilot = 399
  const savings = brokerFee - aptPilot

  return (
    <section style={{ padding: '8rem 2rem', background: 'var(--surface)' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <SectionHeader eyebrow="Savings Calculator" title="How Much Will You Save?" sub="See exactly what AptPilot saves you vs. a traditional NYC broker fee." />
        <div className="reveal" style={{ background: '#fff', borderRadius: 24, boxShadow: 'var(--shadow-xl)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            {/* Left: input */}
            <div style={{ padding: '2.75rem' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--slate-dark)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.65rem' }}>Monthly Rent</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '3.2rem', fontWeight: 700, color: 'var(--navy)', lineHeight: 1, marginBottom: '1.5rem' }}>
                ${rent.toLocaleString()}
              </div>
              <input type="range" min={1500} max={15000} step={100} value={rent} onChange={e => setRent(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--teal)', cursor: 'pointer' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--slate)', marginTop: '0.4rem' }}>
                <span>$1,500</span><span>$15,000</span>
              </div>
              <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'var(--surface)', borderRadius: 12, fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.65 }}>
                Based on the NYC standard broker fee of one month's rent (8.33% × 13 months).
              </div>
            </div>

            {/* Right: result */}
            <div style={{ background: 'var(--navy)', padding: '2.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.25rem' }}>
              {[
                { label: 'Traditional broker fee', val: `$${brokerFee.toLocaleString()}` },
                { label: 'AptPilot flat fee', val: '$399' },
                { label: 'Your savings', val: `$${savings.toLocaleString()}`, highlight: true },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: row.highlight ? 0 : '1.25rem', borderBottom: row.highlight ? 'none' : '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontSize: '0.87rem', color: 'rgba(255,255,255,0.5)' }}>{row.label}</span>
                  <span style={{ fontFamily: row.highlight ? "'Playfair Display', serif" : 'Inter, sans-serif', fontSize: row.highlight ? '2.4rem' : '1.1rem', fontWeight: row.highlight ? 700 : 500, color: row.highlight ? '#0ABFBF' : '#fff' }}>{row.val}</span>
                </div>
              ))}
              <button className="btn btn-primary" onClick={() => navigate('/signup')} style={{ marginTop: '1rem', justifyContent: 'center', gap: '0.6rem' }}>
                Save ${savings.toLocaleString()} — Start Now
                <Icon name="arrow-right" size={16} color="#fff" />
              </button>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>One-time flat fee. No hidden costs. No commission.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Exit Intent Modal ─── */
function ExitModal({ show, onClose }) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  if (!show) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.includes('@')) { setError('Enter a valid email'); return }
    try { await fetch('/api/capture-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, source: 'exit_intent' }) }) } catch {}
    setSubmitted(true)
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(6,9,15,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', animation: 'fadeIn 0.25s ease' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 24, maxWidth: 460, width: '100%', padding: '2.75rem', textAlign: 'center', position: 'relative', boxShadow: '0 24px 80px rgba(0,0,0,0.28)', animation: 'fadeUp 0.3s ease' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1.1rem', right: '1.1rem', width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate)' }}>✕</button>
        {!submitted ? (
          <>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: 'var(--teal-pale)', border: '1px solid rgba(10,191,191,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: 'var(--teal)' }}>
              <Icon name="mail" size={26} color="var(--teal)" />
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.65rem', color: 'var(--navy)', marginBottom: '0.6rem', lineHeight: 1.2 }}>Wait — don't leave empty-handed.</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.6rem', lineHeight: 1.65 }}>Get our free NYC Apartment Hunting Checklist — everything you need before signing a lease.</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <input type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', border: '1.5px solid var(--surface-mid)', borderRadius: 10, padding: '0.85rem 1rem', fontSize: '0.95rem', outline: 'none', fontFamily: 'Inter, sans-serif' }} />
              {error && <p style={{ color: '#EF4444', fontSize: '0.8rem', margin: 0 }}>{error}</p>}
              <button className="btn btn-primary" type="submit" style={{ justifyContent: 'center', padding: '0.9rem' }}>Send Me The Checklist</button>
            </form>
            <p style={{ fontSize: '0.74rem', color: 'var(--slate)', marginTop: '1rem' }}>No spam. Unsubscribe anytime.</p>
          </>
        ) : (
          <>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <Icon name="check-circle" size={28} color="#059669" strokeWidth={2} />
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.65rem', color: 'var(--navy)', marginBottom: '0.5rem' }}>You're in!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>Your NYC Apartment Checklist is on its way.</p>
            <button className="btn btn-dark" onClick={onClose} style={{ marginTop: '1.25rem' }}>Continue Browsing</button>
          </>
        )}
      </div>
    </div>
  )
}

/* ─── Main Landing ─── */
export default function Landing() {
  const navigate = useNavigate()
  const [faqOpen, setFaqOpen]           = useState(null)
  const [showExit, setShowExit]         = useState(false)
  const [hasShown, setHasShown]         = useState(false)
  const [testimonials, setTestimonials] = useState([])

  useReveal()

  useEffect(() => {
    supabase.from('testimonials').select('*').eq('active', true).order('sort_order').then(({ data }) => {
      if (data?.length) setTestimonials(data)
    })
  }, [])

  useEffect(() => {
    if (sessionStorage.getItem('aptpilot_exit')) { setHasShown(true); return }
    const handler = (e) => {
      if (e.clientY <= 0 && !hasShown) {
        setShowExit(true); setHasShown(true)
        sessionStorage.setItem('aptpilot_exit', '1')
      }
    }
    document.addEventListener('mouseleave', handler)
    return () => document.removeEventListener('mouseleave', handler)
  }, [hasShown])

  return (
    <>
      <SEO
        title="AptPilot — NYC Apartment Search Without a Broker Fee"
        description="Avoid the NYC broker fee. AptPilot searches every listing, books your tours, and submits applications automatically — starting at $299 flat fee."
        canonical="https://aptpilot.vercel.app/"
      />
      <ExitModal show={showExit} onClose={() => setShowExit(false)} />

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8rem 2rem 6rem' }}>
        {/* NYC skyline photo layer */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: `url(${PHOTOS.heroSkyline})`,
          backgroundSize: 'cover', backgroundPosition: 'center 60%',
        }} />
        {/* Dark gradient overlays */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(160deg, rgba(6,9,15,0.88) 0%, rgba(12,22,40,0.82) 50%, rgba(6,9,15,0.90) 100%)' }} />
        {/* Teal glow top-right */}
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(10,191,191,0.10) 0%, transparent 70%)', top: '-10%', right: '-8%', pointerEvents: 'none', zIndex: 2 }} />
        {/* Subtle grid */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`, backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)' }} />

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 3, textAlign: 'center', maxWidth: 900 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(10,191,191,0.1)', border: '1px solid rgba(10,191,191,0.25)', color: '#0ABFBF', padding: '0.4rem 1.1rem', borderRadius: 100, fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.75rem', animation: 'fadeUp 0.5s ease both' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#0ABFBF', animation: 'pulse 2s infinite', display: 'inline-block' }} />
            Now Live in New York City
          </div>

          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(3.2rem, 7.5vw, 5.8rem)', fontWeight: 700, color: '#fff', lineHeight: 1.08, marginBottom: '1.4rem', letterSpacing: '-0.01em', animation: 'fadeUp 0.55s 0.1s ease both' }}>
            Your apartment search,<br />
            <em style={{ color: 'var(--teal)', fontStyle: 'italic' }}>on autopilot.</em>
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'rgba(255,255,255,0.55)', maxWidth: 580, margin: '0 auto 2.5rem', lineHeight: 1.8, animation: 'fadeUp 0.55s 0.2s ease both' }}>
            AptPilot searches every listing, books your tours, and submits your applications —
            all for a one-time flat fee. <strong style={{ color: 'rgba(255,255,255,0.8)' }}>No broker. No stress.</strong>
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeUp 0.55s 0.3s ease both' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/signup')}>Start My Search</button>
            <button className="btn btn-ghost btn-lg" onClick={() => navigate('/login')}>I have an account</button>
          </div>

          <div style={{ display: 'flex', gap: 'clamp(2rem, 5vw, 4.5rem)', marginTop: '5rem', justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeUp 0.55s 0.4s ease both' }}>
            {[['$0', 'Broker fees'], ['$399', 'vs. $3–6K broker fee'], ['1 day', 'Tour agenda delivered'], ['1-click', 'Application submission']].map(([v, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.7rem, 3vw, 2.2rem)', color: '#0ABFBF', fontWeight: 600, lineHeight: 1 }}>{v}</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.38)', marginTop: '0.35rem', letterSpacing: '0.02em' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 3, animation: 'fadeUp 0.6s 0.8s ease both' }}>
          <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.28)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Scroll</span>
          <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(10,191,191,0.5), transparent)' }} />
        </div>
      </section>

      {/* ── PLATFORM MARQUEE ── */}
      <div style={{ background: 'var(--navy)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '1rem 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', width: 'max-content', animation: 'marquee 28s linear infinite' }}>
          {[...Array(2)].map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
              {['StreetEasy', 'Zillow', 'Apartments.com', 'Rent.com', 'Trulia', 'Facebook Marketplace', 'Craigslist', 'Off-Market Listings'].map(name => (
                <span key={name} style={{ padding: '0 2.5rem', fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.28)', letterSpacing: '0.07em', textTransform: 'uppercase', whiteSpace: 'nowrap', borderRight: '1px solid rgba(255,255,255,0.07)' }}>{name}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── TRUST STRIP ── */}
      <section style={{ padding: '3.5rem 2rem', background: '#fff', borderBottom: '1px solid var(--surface-mid)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '2rem', alignItems: 'center' }}>
            {[
              { stat: '500+', label: 'Searches completed' },
              { stat: '92%', label: 'Find an apartment within 3 weeks' },
              { stat: '$3,800', label: 'Average broker fee saved' },
              { stat: '48 hrs', label: 'Average time to first tour booked' },
            ].map(({ stat, label }) => (
              <div key={stat} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.2rem', fontWeight: 700, color: 'var(--teal)', lineHeight: 1 }}>{stat}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate)', marginTop: '0.4rem', lineHeight: 1.4 }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--surface-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--slate)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginRight: '0.5rem' }}>Secured by</span>
            {[
              { name: 'Stripe', color: '#635BFF' },
              { name: 'Supabase', color: '#3ECF8E' },
              { name: 'Vercel', color: '#000' },
            ].map(({ name, color }) => (
              <span key={name} style={{ background: 'var(--surface)', border: '1px solid var(--surface-mid)', borderRadius: 8, padding: '0.35rem 0.9rem', fontSize: '0.78rem', fontWeight: 700, color, display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block' }} />
                {name}
              </span>
            ))}
            <span style={{ background: 'var(--surface)', border: '1px solid var(--surface-mid)', borderRadius: 8, padding: '0.35rem 0.9rem', fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Icon name="shield" size={12} color="var(--teal)" strokeWidth={2} />
              256-bit SSL
            </span>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '8rem 2rem', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionHeader eyebrow="How It Works" title="From criteria to keys — we handle everything." sub="Tell us what you need. We do the searching, scheduling, and applying." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {STEPS.map((step, i) => (
              <div key={i} className="reveal" style={{ transitionDelay: `${i * 0.07}s` }}>
                <div
                  style={{ background: '#fff', borderRadius: 20, padding: '2rem 1.75rem', border: '1.5px solid var(--surface-mid)', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.25s, box-shadow 0.25s, border-color 0.25s', cursor: 'default' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; e.currentTarget.style.borderColor = 'var(--teal)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--surface-mid)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.4rem' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(10,191,191,0.08)', border: '1px solid rgba(10,191,191,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal)' }}>
                      <Icon name={step.icon} size={20} color="var(--teal)" />
                    </div>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', fontWeight: 700, color: 'rgba(10,191,191,0.12)', lineHeight: 1 }}>{step.num}</span>
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: '1.02rem', color: 'var(--navy)', marginBottom: '0.5rem' }}>{step.title}</h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NYC PHOTO STRIP — brownstones ── */}
      <section style={{ position: 'relative', height: 480, overflow: 'hidden' }}>
        <img
          src={PHOTOS.brownstones}
          alt="NYC brownstone buildings"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 70%', display: 'block' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(6,9,15,0.82) 0%, rgba(6,9,15,0.45) 50%, rgba(6,9,15,0.15) 100%)' }} />
        <div className="reveal" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 6vw' }}>
          <div style={{ maxWidth: 520 }}>
            <div style={{ display: 'inline-block', background: 'rgba(10,191,191,0.12)', border: '1px solid rgba(10,191,191,0.28)', color: '#0ABFBF', padding: '0.3rem 1rem', borderRadius: 100, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.25rem' }}>Every Block. Every Borough.</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 4vw, 3rem)', color: '#fff', fontWeight: 700, lineHeight: 1.15, marginBottom: '1rem' }}>
              From the Heights to<br />Hoboken — we search it all.
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: 1.75, marginBottom: '1.75rem' }}>
              AptPilot covers all five boroughs plus Jersey City, Hoboken, and Astoria — pulling listings from every major platform in real time.
            </p>
            <button className="btn btn-primary" onClick={() => {}}>
              See how it works
            </button>
          </div>
        </div>
      </section>

      {/* ── SAVINGS CALCULATOR ── */}
      <SavingsCalc navigate={navigate} />

      {/* ── NYC STREET PHOTO — aerial/park ── */}
      <section style={{ position: 'relative', height: 420, overflow: 'hidden' }}>
        <img
          src={PHOTOS.aerial}
          alt="New York City aerial view"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,9,15,0.55)' }} />
        <div className="reveal" style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', textAlign: 'center', padding: '2rem' }}>
          <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)', color: '#fff', fontWeight: 600, fontStyle: 'italic', lineHeight: 1.3, maxWidth: 680, marginBottom: '1.75rem' }}>
            "It's the difference between a map and a chauffeur."
          </p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/signup')}>
            Start My Search
          </button>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '8rem 2rem', background: 'var(--navy)' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <SectionHeader eyebrow="Client Stories" title="Real renters. Real savings." sub="Join hundreds of New Yorkers who skipped the broker and found their apartment faster." light />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {testimonials.map((t, i) => (
              <div key={i} className="reveal" style={{ transitionDelay: `${i * 0.09}s` }}>
                <div
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '2rem', transition: 'background 0.22s, border-color 0.22s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(10,191,191,0.3)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
                >
                  <div style={{ display: 'flex', gap: '2px', marginBottom: '1.1rem' }}>
                    {[...Array(t.rating || 5)].map((_, j) => <Icon key={j} name="star" size={14} color="#C9A96E" />)}
                  </div>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.97rem', lineHeight: 1.75, marginBottom: '1.5rem', fontStyle: 'italic' }}>"{t.quote}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--teal), #00E5CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.82rem', color: 'var(--navy)', flexShrink: 0 }}>{t.initials}</div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.92rem' }}>{t.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.15rem' }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ padding: '8rem 2rem', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <SectionHeader eyebrow="Pricing" title="Simple, transparent pricing." sub="Pay once. No subscription. No commission. Save thousands vs. a traditional broker." />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            {[
              { name: 'Standard', price: '$299', period: 'one-time', features: ['Full listing search', 'Personalized tour agenda', 'Automated tour scheduling', 'Real-time listing alerts', 'Dedicated email support', 'Move-in checklist'], featured: false },
              { name: 'Core', price: '$399', period: 'one-time', features: ['Everything in Standard', 'Auto-filled applications', 'Negotiation support', 'Real-time application updates', 'Agent follow-up handled', 'Priority scheduling'], featured: true, badge: 'Most Popular' },
              { name: 'Pro', price: '$499', period: 'one-time', features: ['Everything in Core', '1-on-1 NYC broker access', '24/7 phone & text support', 'Broker-led lease negotiation', 'Prioritized scheduling', 'White-glove move-in'], featured: false },
            ].map((plan, i) => (
              <div key={i} className="reveal" style={{ transitionDelay: `${i * 0.08}s`, position: 'relative' }}>
                {plan.badge && (
                  <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: 'var(--teal)', color: '#fff', borderRadius: 100, fontSize: '0.7rem', fontWeight: 700, padding: '0.28rem 1rem', letterSpacing: '0.07em', textTransform: 'uppercase', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(10,191,191,0.35)', zIndex: 1 }}>{plan.badge}</div>
                )}
                <div
                  style={{ background: plan.featured ? 'var(--navy)' : '#fff', border: `1.5px solid ${plan.featured ? 'var(--teal)' : 'var(--surface-mid)'}`, borderRadius: 20, padding: '2.25rem 1.75rem', boxShadow: plan.featured ? 'var(--shadow-teal)' : 'var(--shadow-sm)', height: '100%', transition: 'transform 0.25s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.85rem' }}>{plan.name}</div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.8rem', fontWeight: 700, lineHeight: 1, color: plan.featured ? '#fff' : 'var(--navy)', marginBottom: '0.25rem' }}>{plan.price}</div>
                  <div style={{ fontSize: '0.82rem', color: plan.featured ? 'rgba(255,255,255,0.38)' : 'var(--slate)', marginBottom: '1.75rem' }}>{plan.period}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.75rem' }}>
                    {plan.features.map(f => (
                      <div key={f} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.87rem', color: plan.featured ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', lineHeight: 1.45 }}>
                        <span style={{ color: 'var(--teal)', flexShrink: 0, marginTop: 1 }}>
                          <Icon name="check" size={14} color="var(--teal)" strokeWidth={2.5} />
                        </span>
                        {f}
                      </div>
                    ))}
                  </div>
                  <button
                    className={`btn ${plan.featured ? 'btn-primary' : 'btn-outline'}`}
                    style={{ width: '100%', justifyContent: 'center', borderRadius: 100, ...(plan.featured ? {} : { borderColor: 'var(--navy)', color: 'var(--navy)' }) }}
                    onClick={() => navigate('/signup')}
                  >Get Started</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: '8rem 2rem', background: '#fff' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <SectionHeader eyebrow="FAQ" title="Everything you need to know." sub="Answers to the most common questions before getting started." />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {FAQS.map((faq, i) => (
              <div key={i} className="reveal" style={{ transitionDelay: `${i * 0.04}s` }}>
                <FaqItem q={faq.q} a={faq.a} open={faqOpen === i} toggle={() => setFaqOpen(faqOpen === i ? null : i)} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA — Manhattan skyline photo ── */}
      <section style={{ position: 'relative', overflow: 'hidden', textAlign: 'center', minHeight: 520, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img src={PHOTOS.heroSkyline} alt="New York City skyline" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(6,9,15,0.92) 0%, rgba(12,22,40,0.88) 100%)' }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '7rem 2rem' }} className="reveal">
          <div style={{ display: 'inline-block', background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.25)', color: '#C9A96E', padding: '0.3rem 1rem', borderRadius: 100, fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1.5rem' }}>Ready to Move?</div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', color: '#fff', fontWeight: 700, lineHeight: 1.15, marginBottom: '1.1rem', maxWidth: 640, margin: '0 auto 1.1rem' }}>
            Skip the broker.<br />Start your search today.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '1.05rem', marginBottom: '2.5rem', maxWidth: 460, margin: '0 auto 2.5rem' }}>
            Join hundreds of NYC renters who saved thousands with AptPilot.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/signup')}>Start My Search</button>
            <button className="btn btn-ghost btn-lg" onClick={() => navigate('/blog')}>Read Our Blog</button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#06090F', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '4rem 2rem 2.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '3rem', marginBottom: '3rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '1rem' }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0, background: 'linear-gradient(135deg, #0ABFBF, #00E5CC)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.85rem', color: '#0C1628' }}>A</div>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>Apt<span style={{ color: '#0ABFBF' }}>Pilot</span></span>
              </div>
              <p style={{ fontSize: '0.87rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.75, maxWidth: 260 }}>
                NYC apartment search without the broker fee. Automated tours, applications, and move-in — all for a flat fee.
              </p>
            </div>
            {[
              { label: 'Product', links: [
                { label: 'How It Works', href: '#how-it-works' },
                { label: 'Pricing', href: '/pricing' },
                { label: 'Blog', href: '/blog' },
                { label: 'FAQ', href: '#faq' },
              ]},
              { label: 'Company', links: [
                { label: 'About', href: 'mailto:support@aptpilot.com' },
                { label: 'Contact', href: 'mailto:support@aptpilot.com' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
              ]},
              { label: 'Get Started', links: [
                { label: 'Create Account', href: '/signup' },
                { label: 'Sign In', href: '/login' },
                { label: 'My Search', href: '/intake' },
                { label: 'Dashboard', href: '/dashboard' },
              ]},
            ].map(col => (
              <div key={col.label}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.1rem' }}>{col.label}</div>
                {col.links.map(l => (
                  <div key={l.label} style={{ marginBottom: '0.65rem' }}>
                    <a href={l.href} style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.42)', cursor: 'pointer', transition: 'color 0.15s', textDecoration: 'none', display: 'inline-block' }}
                      onMouseEnter={e => e.target.style.color = '#fff'}
                      onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.42)'}
                    >{l.label}</a>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.22)' }}>© 2026 AptPilot. All rights reserved.</p>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.22)' }}>Made with care in New York City</p>
          </div>
        </div>
      </footer>
    </>
  )
}
