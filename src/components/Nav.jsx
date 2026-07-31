import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState, useRef } from 'react'

// In-app search index. Only surfaced to signed-in users — on the marketing
// pages a command palette is chrome nobody asked for, and every entry here
// points at dashboard internals anyway. Every path below is a real route in
// App.jsx; there is deliberately no /settings entry (that route not exist).
const SEARCH_INDEX = [
  { label: 'Dashboard', desc: 'Your search overview', path: '/dashboard' },
  { label: 'Search Criteria', desc: 'Edit your budget, bedrooms, neighborhoods', path: '/dashboard', hash: 'criteria' },
  { label: 'Application Readiness', desc: 'Track document upload progress', path: '/dashboard', hash: 'readiness' },
  { label: 'Commute Times', desc: 'View commute estimates for your group', path: '/dashboard', hash: 'commutes' },
  { label: 'Group Members', desc: 'Invite and manage roommates', path: '/dashboard', hash: 'group' },
  { label: 'Documents', desc: 'Upload tenant and guarantor docs', path: '/documents' },
  { label: 'How to Qualify', desc: 'Income requirements, credit, guarantors', path: '/qualify' },
  { label: 'Income Calculator', desc: '40x / 80x rent qualification calculator', path: '/qualify', hash: 'calculator' },
  { label: 'Neighborhoods', desc: 'Explore NYC neighborhoods', path: '/neighborhoods' },
  { label: 'Pricing', desc: 'AptPilot plans and pricing', path: '/pricing' },
  { label: 'Blog', desc: 'NYC renting tips and guides', path: '/blog' },
]

export default function Nav() {
  const { user, profile, signOut } = useAuth()
  const navigate  = useNavigate()
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false); setSearchOpen(false) }, [pathname])

  useEffect(() => {
    if (searchOpen) { setSearchQuery(''); setTimeout(() => searchInputRef.current?.focus(), 50) }
  }, [searchOpen])

  useEffect(() => {
    if (!user) return
    const onKey = e => {
      if (e.key === 'Escape') setSearchOpen(false)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(o => !o) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [user])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  function handleSearchSelect(item) {
    setSearchOpen(false)
    if (item.hash) {
      if (pathname === item.path) {
        document.getElementById(item.hash)?.scrollIntoView({ behavior: 'smooth' })
      } else {
        navigate(item.path)
        setTimeout(() => document.getElementById(item.hash)?.scrollIntoView({ behavior: 'smooth' }), 400)
      }
    } else {
      navigate(item.path)
    }
  }

  const filteredResults = searchQuery.trim()
    ? SEARCH_INDEX.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : SEARCH_INDEX

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const isAdmin = user?.email === 'aptpilot1@gmail.com'

  const navLinks = [
    { label: 'How it works', path: '/', hash: 'how-it-works', show: pathname === '/' },
    { label: 'Pricing', path: '/pricing', show: true },
    { label: 'Neighborhoods', path: '/neighborhoods', show: true },
    { label: 'Qualify', path: '/qualify', show: true },
    { label: 'Journal', path: '/blog', show: true },
    { label: 'Log in', path: '/login', show: !user },
    { label: 'Dashboard', path: '/dashboard', show: !!user && !!profile?.paid },
    { label: 'My search', path: '/intake', show: !!user && !profile?.paid },
    { label: 'Ops', path: '/admin/dashboard', show: isAdmin },
    { label: 'Listings', path: '/admin/listings', show: isAdmin },
  ].filter(l => l.show)

  function go(l) {
    if (l.hash) {
      document.getElementById(l.hash)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate(l.path)
    }
  }

  return (
    <>
      <style>{`
        @media(max-width:860px){
          .nav-desktop { display:none !important; }
          .nav-hamburger { display:flex !important; }
        }
        .nav-hamburger { display:none; flex-direction:column; gap:5px; cursor:pointer; padding:8px; border:none; background:transparent; }
        .nav-hamburger span { display:block; width:22px; height:1.5px; background:var(--text); border-radius:2px; transition:all 0.25s; }
        .nav-hamburger.open span:nth-child(1) { transform:translateY(6.5px) rotate(45deg); }
        .nav-hamburger.open span:nth-child(2) { opacity:0; }
        .nav-hamburger.open span:nth-child(3) { transform:translateY(-6.5px) rotate(-45deg); }
        .mobile-menu {
          position:fixed; inset:0; top:74px; background:var(--paper); z-index:499;
          display:flex; flex-direction:column; padding:2rem 1.5rem; gap:0;
          animation:fadeIn 0.18s ease;
        }
        .mobile-link {
          display:block; width:100%; text-align:left; background:transparent; border:none;
          color:var(--text); font-size:1.45rem; font-weight:500;
          font-family:'Fraunces', Georgia, serif; font-variation-settings:'opsz' 120;
          letter-spacing:-0.02em;
          padding:1rem 0; border-bottom:1px solid var(--line); cursor:pointer;
        }
        .mobile-link.accent { color:var(--clay); }
      `}</style>

      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
        {/* Wordmark — the logo artwork itself (keyhole mark + aptpilot) */}
        <div className="nav-logo" onClick={() => navigate('/')} role="link" tabIndex={0}
             onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate('/') }}>
          <img src="/logo-wordmark.png" alt="AptPilot" width="440" height="105" />
        </div>

        <div className="nav-desktop" style={{ display:'flex', alignItems:'center', gap:'0.15rem' }}>
          {navLinks.map(l => (
            <button
              key={l.label}
              className={`nav-link${!l.hash && (pathname === l.path || pathname.startsWith(l.path + '/')) ? ' active' : ''}`}
              onClick={() => go(l)}
            >
              {l.label}
            </button>
          ))}
          {user && (
            <button
              className="nav-link"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              title="Search (⌘K)"
              style={{ display:'flex', alignItems:'center', padding:'0.5rem 0.7rem' }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>
          )}
          {user
            ? <button className="nav-link" onClick={handleSignOut}>Sign out</button>
            : <button className="btn btn-primary btn-sm" onClick={() => navigate('/signup')} style={{ marginLeft:'0.6rem' }}>Start free trial</button>
          }
        </div>

        <button className={`nav-hamburger${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </nav>

      {/* In-app search — signed-in only */}
      {searchOpen && user && (
        <div onClick={() => setSearchOpen(false)} style={{
          position:'fixed', inset:0, background:'rgba(31,26,20,0.45)', backdropFilter:'blur(5px)',
          zIndex:1000, display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:'11vh',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background:'#fff', borderRadius:8, width:'100%', maxWidth:560,
            margin:'0 1rem', boxShadow:'var(--shadow-xl)', overflow:'hidden',
            border:'1px solid var(--line)',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', padding:'0.9rem 1.15rem', borderBottom:'1px solid var(--line)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search your dashboard…"
                style={{ flex:1, border:'none', outline:'none', fontSize:'0.95rem', color:'var(--text)', fontFamily:'inherit', background:'transparent' }}
              />
            </div>
            <div style={{ maxHeight:360, overflowY:'auto' }}>
              {filteredResults.length === 0
                ? <div style={{ padding:'1.5rem', textAlign:'center', color:'var(--text-muted)', fontSize:'0.88rem' }}>No results for “{searchQuery}”</div>
                : filteredResults.map((item, i) => (
                  <button key={i} onClick={() => handleSearchSelect(item)} style={{
                    display:'flex', flexDirection:'column', alignItems:'flex-start',
                    width:'100%', padding:'0.75rem 1.15rem', background:'none', border:'none',
                    borderBottom:'1px solid var(--paper-deep)', cursor:'pointer', textAlign:'left',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background='var(--paper)'}
                  onMouseLeave={e => e.currentTarget.style.background='none'}>
                    <span style={{ fontWeight:600, fontSize:'0.89rem', color:'var(--text)' }}>{item.label}</span>
                    <span style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:'0.12rem' }}>{item.desc}</span>
                  </button>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="mobile-menu">
          {navLinks.map(l => (
            <button key={l.label} className="mobile-link" onClick={() => { setMenuOpen(false); go(l) }}>{l.label}</button>
          ))}
          {user
            ? <button className="mobile-link accent" onClick={handleSignOut}>Sign out</button>
            : <button className="mobile-link accent" onClick={() => navigate('/signup')}>Start free trial →</button>
          }
        </div>
      )}
    </>
  )
}
