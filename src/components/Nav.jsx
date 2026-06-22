import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Nav() {
  const { user, profile, signOut } = useAuth()
  const navigate  = useNavigate()
  const { pathname } = useLocation()

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="nav">
      <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor:'pointer' }}>
        Apt<span>Pilot</span>
      </div>

      <div className="nav-links">
        <button className={`nav-link ${pathname === '/blog' || pathname.startsWith('/blog/') ? 'active' : ''}`} onClick={() => navigate('/blog')}>Blog</button>
        {!user && (
          <>
            <button className="nav-link" onClick={() => navigate('/login')}>Log In</button>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/signup')}>Get Started</button>
          </>
        )}
        {user && (
          <>
            {profile?.paid && (
              <button className={`nav-link ${pathname === '/dashboard' ? 'active' : ''}`} onClick={() => navigate('/dashboard')}>Dashboard</button>
            )}
            {!profile?.paid && (
              <button className={`nav-link ${pathname === '/intake' ? 'active' : ''}`} onClick={() => navigate('/intake')}>My Search</button>
            )}
            {user.email === 'aptpilot1@gmail.com' && (
              <>
                <button className={`nav-link ${pathname === '/admin/listings' ? 'active' : ''}`} onClick={() => navigate('/admin/listings')}>Listings</button>
                <button className={`nav-link ${pathname === '/admin/blog' ? 'active' : ''}`} onClick={() => navigate('/admin/blog')}>Blog Admin</button>
              </>
            )}
            <button className="nav-link" onClick={handleSignOut}>Sign Out</button>
          </>
        )}
      </div>
    </nav>
  )
}
