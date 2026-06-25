import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'

export default function Nav() {
  const { user, profile, signOut } = useAuth()
  const navigate  = useNavigate()
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const isHeroPage = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

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
    { label: 'Blog', path: '/blog', show: true },
    { label: 'Log In', path: '/login', show: !user },
    { label: 'My Dashboard', path: '/dashboard', show: !!user && !!profile?.paid },
    { label: 'My Search', path: '/intake', show: !!user && !profile?.paid },
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
