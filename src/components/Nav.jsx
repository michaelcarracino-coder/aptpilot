import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'

export default function Nav() {
  const { user, profile, signOut } = useAuth()
  const navigate  = useNavigate()
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)

  const isHeroPage = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const navBg = isHeroPage && !scrolled
    ? 'transparent'
    : 'rgba(6,9,15,0.82)'
  const navBorder = isHeroPage && !scrolled
    ? 'transparent'
    : 'rgba(255,255,255,0.07)'
  const navShadow = scrolled ? '0 4px 32px rgba(0,0,0,0.22)' : 'none'
  const navBackdrop = scrolled ? 'blur(24px) saturate(1.4)' : 'none'

  return (
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
      <div onClick={() => navigate('/')} style={{
        display: 'flex', alignItems: 'center', gap: '0.55rem',
        cursor: 'pointer', userSelect: 'none',
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8, flexShrink: 0,
          background: 'linear-gradient(135deg, #0ABFBF, #00E5CC)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Inter, sans-serif', fontWeight: 900, fontSize: '0.9rem',
          color: '#0C1628', boxShadow: '0 2px 12px rgba(10,191,191,0.45)',
        }}>A</div>
        <span style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.4rem', fontWeight: 700, color: '#fff',
        }}>
          Apt<span style={{ color: 'var(--teal)' }}>Pilot</span>
        </span>
      </div>

      {/* Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        <button
          className={`nav-link ${pathname === '/blog' || pathname.startsWith('/blog/') ? 'active' : ''}`}
          onClick={() => navigate('/blog')}
        >Blog</button>

        {!user && (
          <>
            <button className="nav-link" onClick={() => navigate('/login')}>Log In</button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/signup')}
              style={{ marginLeft: '0.3rem' }}
            >Get Started</button>
          </>
        )}

        {user && (
          <>
            {profile?.paid && (
              <button
                className={`nav-link ${pathname === '/dashboard' ? 'active' : ''}`}
                onClick={() => navigate('/dashboard')}
              >Dashboard</button>
            )}
            {!profile?.paid && (
              <button
                className={`nav-link ${pathname === '/intake' ? 'active' : ''}`}
                onClick={() => navigate('/intake')}
              >My Search</button>
            )}
            {user.email === 'aptpilot1@gmail.com' && (
              <>
                <button
                  className={`nav-link ${pathname === '/admin/listings' ? 'active' : ''}`}
                  onClick={() => navigate('/admin/listings')}
                >Listings</button>
                <button
                  className={`nav-link ${pathname === '/admin/blog' ? 'active' : ''}`}
                  onClick={() => navigate('/admin/blog')}
                >Blog Admin</button>
              </>
            )}
            <button className="nav-link" onClick={handleSignOut}>Sign Out</button>
          </>
        )}
      </div>
    </nav>
  )
}
