import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState, useRef } from 'react'

const SEARCH_INDEX = [
  { label: 'Dashboard', desc: 'Your search overview', path: '/dashboard' },
  { label: 'Search Criteria', desc: 'Edit your budget, bedrooms, neighborhoods', path: '/dashboard', hash: 'criteria' },
  { label: 'Application Readiness', desc: 'Track document upload progress', path: '/dashboard', hash: 'readiness' },
  { label: 'Commute Times', desc: 'View commute estimates for your group', path: '/dashboard', hash: 'commutes' },
  { label: 'Group Members', desc: 'Invite and manage roommates', path: '/dashboard', hash: 'group' },
  { label: 'Documents', desc: 'Upload tenant and guarantor docs', path: '/documents' },
  { label: 'How to Qualify', desc: 'Income requirements, credit, guarantors', path: '/qualify' },
  { label: 'Income Calculator', desc: '40x / 80x rent qualification calculator', path: '/qualify', hash: 'calculator' },
  { label: 'Document Checklist', desc: 'What documents you need to apply', path: '/qualify', hash: 'documents' },
  { label: 'Credit Score Guide', desc: 'Credit score requirements for NYC rentals', path: '/qualify', hash: 'credit' },
  { label: 'Guarantor Info', desc: 'When and how to use a guarantor', path: '/qualify', hash: 'guarantors' },
  { label: 'Neighborhoods', desc: 'Explore NYC neighborhoods', path: '/neighborhoods' },
  { label: 'Pricing', desc: 'AptPilot plans and pricing', path: '/pricing' },
  { label: 'Blog', desc: 'NYC renting tips and guides', path: '/blog' },
  { label: 'Settings', desc: 'Update your profile and preferences', path: '/settings' },
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

  const isHeroPage = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); setSearchOpen(false) }, [pathname])

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen) { setSearchQuery(''); setTimeout(() => searchInputRef.current?.focus(), 50) }
  }, [searchOpen])

  // Close search on Escape, open on ⌘K
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Escape') setSearchOpen(false)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(o => !o) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

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

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const navBg = isHeroPage && !scrolled ? 'transparent' : 'rgba(6,9,15,0.88)'
  const navBorder = isHeroPage && !scrolled ? 'transparent' : 'rgba(255,255,255,0.07)'
  const navShadow = scrolled ? '0 4px 32px rgba(0,0,0,0.22)' : 'none'
  const navBackdrop = scrolled ? 'blur(24px) saturate(1.4)' : 'none'

  const navLinks = [
    { label: 'Pricing', path: '/pricing', show: true },
    { label: 'How to Qualify', path: '/qualify', show: true },
    { label: 'Neighborhoods', path: '/neighborhoods', show: true },
    { label: 'Blog', path: '/blog', show: true },
    { label: 'Log In', path: '/login', show: !user },
    { label: 'My Dashboard', path: '/dashboard', show: !!user && !!profile?.paid },
    { label: 'My Search', path: '/intake', show: !!user && !profile?.paid },
    { label: 'Ops', path: '/admin/dashboard', show: user?.email === 'aptpilot1@gmail.com' },
    { label: 'Listings', path: '/admin/listings', show: user?.email === 'aptpilot1@gmail.com' },
    { label: 'Blog Admin', path: '/admin/blog', show: user?.email === 'aptpilot1@gmail.com' },
    { label: 'Testimonials', path: '/admin/testimonials', show: user?.email === 'aptpilot1@gmail.com' },
  ].filter(l => l.show)

  return (
    <>
      <style>{`
        @media(max-width:640px){
          .nav-desktop { display:none !important; }
          .nav-hamburger { display:flex !important; }
        }
        .nav-hamburger { display:none; flex-direction:column; gap:5px; cursor:pointer; padding:8px; border:none; background:transparent; }
        .nav-hamburger span { display:block; width:22px; height:2px; background:#fff; border-radius:2px; transition:all 0.25s; }
        .nav-hamburger.open span:nth-child(1) { transform:translateY(7px) rotate(45deg); }
        .nav-hamburger.open span:nth-child(2) { opacity:0; }
        .nav-hamburger.open span:nth-child(3) { transform:translateY(-7px) rotate(-45deg); }
        .mobile-menu { position:fixed;inset:0;top:68px;background:rgba(6,9,15,0.97);backdrop-filter:blur(20px);z-index:499;
          display:flex;flex-direction:column;padding:2rem 1.5rem;gap:0.5rem;
          animation:fadeUp 0.2s ease; }
        .mobile-link { display:block;width:100%;text-align:left;background:transparent;border:none;
          color:#fff;font-size:1.2rem;font-weight:600;font-family:'Playfair Display',serif;
          padding:0.85rem 0;border-bottom:1px solid rgba(255,255,255,0.07);cursor:pointer; }
        .mobile-link:last-child { border:none; }
        .mobile-link.teal { color:var(--teal); }
      `}</style>

      <nav style={{
        height: 68, display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', padding: '0 2.5rem',
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 500,
        background: navBg, backdropFilter: navBackdrop,
        WebkitBackdropFilter: navBackdrop,
        borderBottom: `1px solid ${navBorder}`,
        boxShadow: navShadow,
        transition: 'background 0.35s, backdrop-filter 0.35s, border-color 0.35s, box-shadow 0.35s',
      }}>
        {/* Logo */}
        <div onClick={() => navigate('/')} style={{ display:'flex', alignItems:'center', gap:'0.55rem', cursor:'pointer', userSelect:'none' }}>
          <div style={{
            width:30, height:30, borderRadius:8, flexShrink:0,
            background:'linear-gradient(135deg,#0ABFBF,#00E5CC)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontFamily:'Inter,sans-serif', fontWeight:900, fontSize:'0.9rem',
            color:'#0C1628', boxShadow:'0 2px 12px rgba(10,191,191,0.45)',
          }}>A</div>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', fontWeight:700, color:'#fff' }}>
            Apt<span style={{ color:'var(--teal)' }}>Pilot</span>
          </span>
        </div>

        {/* Desktop links */}
        <div className="nav-desktop" style={{ display:'flex', alignItems:'center', gap:'0.3rem' }}>
          {/* Search button */}
          <button onClick={() => setSearchOpen(true)} style={{
            display:'flex', alignItems:'center', gap:'0.4rem',
            background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)',
            borderRadius:8, padding:'0.3rem 0.75rem', cursor:'pointer', color:'rgba(255,255,255,0.6)',
            fontSize:'0.8rem', fontFamily:'inherit', transition:'all 0.15s',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Search
            <span style={{ fontSize:'0.68rem', opacity:0.5, marginLeft:'0.1rem' }}>⌘K</span>
          </button>
          {navLinks.map(l => (
            <button key={l.path} className={`nav-link${pathname === l.path || pathname.startsWith(l.path + '/') ? ' active' : ''}`} onClick={() => navigate(l.path)}>
              {l.label}
            </button>
          ))}
          {user
            ? <button className="nav-link" onClick={handleSignOut}>Sign Out</button>
            : <button className="btn btn-primary btn-sm" onClick={() => navigate('/signup')} style={{ marginLeft:'0.3rem' }}>Get Started</button>
          }
        </div>

        {/* Hamburger */}
        <button className={`nav-hamburger${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(o => !o)} aria-label="Menu">
          <span /><span /><span />
        </button>
      </nav>

      {/* Global search overlay */}
      {searchOpen && (
        <div onClick={() => setSearchOpen(false)} style={{
          position:'fixed', inset:0, background:'rgba(6,9,15,0.7)', backdropFilter:'blur(6px)',
          zIndex:1000, display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:'10vh',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background:'#fff', borderRadius:14, width:'100%', maxWidth:560,
            margin:'0 1rem', boxShadow:'0 24px 80px rgba(0,0,0,0.35)', overflow:'hidden',
          }}>
            {/* Search input */}
            <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', padding:'0.85rem 1.1rem', borderBottom:'1px solid #E2E8F0' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search pages, sections, features…"
                style={{
                  flex:1, border:'none', outline:'none', fontSize:'0.95rem',
                  color:'var(--navy)', fontFamily:'inherit', background:'transparent',
                }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} style={{ border:'none', background:'none', cursor:'pointer', color:'#94A3B8', fontSize:'1rem', padding:0, lineHeight:1 }}>×</button>
              )}
            </div>
            {/* Results */}
            <div style={{ maxHeight:360, overflowY:'auto' }}>
              {filteredResults.length === 0
                ? <div style={{ padding:'1.5rem', textAlign:'center', color:'var(--slate)', fontSize:'0.875rem' }}>No results for "{searchQuery}"</div>
                : filteredResults.map((item, i) => (
                  <button key={i} onClick={() => handleSearchSelect(item)} style={{
                    display:'flex', flexDirection:'column', alignItems:'flex-start',
                    width:'100%', padding:'0.7rem 1.1rem', background:'none', border:'none',
                    borderBottom:'1px solid #F1F5F9', cursor:'pointer', textAlign:'left',
                    transition:'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background='#F8FAFC'}
                  onMouseLeave={e => e.currentTarget.style.background='none'}>
                    <span style={{ fontWeight:600, fontSize:'0.875rem', color:'var(--navy)' }}>{item.label}</span>
                    <span style={{ fontSize:'0.775rem', color:'var(--slate)', marginTop:'0.1rem' }}>{item.desc}</span>
                  </button>
                ))
              }
            </div>
            <div style={{ padding:'0.55rem 1.1rem', background:'#F8FAFC', borderTop:'1px solid #E2E8F0', fontSize:'0.7rem', color:'#94A3B8' }}>
              Press <kbd style={{ background:'#E2E8F0', borderRadius:4, padding:'0.1rem 0.35rem', fontFamily:'inherit' }}>Esc</kbd> to close
            </div>
          </div>
        </div>
      )}

      {/* Mobile slide-down menu */}
      {menuOpen && (
        <div className="mobile-menu">
          {navLinks.map(l => (
            <button key={l.path} className="mobile-link" onClick={() => navigate(l.path)}>{l.label}</button>
          ))}
          {user
            ? <button className="mobile-link teal" onClick={handleSignOut}>Sign Out</button>
            : <button className="mobile-link teal" onClick={() => navigate('/signup')}>Get Started →</button>
          }
        </div>
      )}
    </>
  )
}
