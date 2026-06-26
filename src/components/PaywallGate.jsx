import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Wraps content that should be partially visible then locked.
 * Shows a fade + overlay prompting sign-up for logged-out users.
 * Pass `alwaysLock` to lock even for logged-in (but unpaid) users.
 */
export default function PaywallGate({ children, alwaysLock = false, title = "Create a free account to keep reading", subtitle = "Join AptPilot to unlock neighborhood guides, qualification tips, and more — free." }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const locked = alwaysLock ? !user : !user

  if (!locked) return <>{children}</>

  return (
    <div style={{ position: 'relative' }}>
      {/* Blurred/faded content preview */}
      <div style={{ maxHeight: 320, overflow: 'hidden', position: 'relative', pointerEvents: 'none', userSelect: 'none' }}>
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%', zIndex: 1,
          background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.88) 55%, rgba(255,255,255,1) 100%)',
        }} />
        <div style={{ filter: 'blur(3px)', opacity: 0.6 }}>
          {children}
        </div>
      </div>

      {/* Overlay CTA */}
      <div style={{
        background: '#fff', border: '1.5px solid var(--surface-mid)', borderRadius: 20,
        padding: '2.25rem 2rem', textAlign: 'center', boxShadow: '0 8px 40px rgba(12,22,40,0.12)',
        margin: '1.5rem auto 0', maxWidth: 500,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12, margin: '0 auto 1rem',
          background: 'linear-gradient(135deg,#0ABFBF,#00E5CC)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem',
        }}>🔓</div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.35rem', color: 'var(--navy)', marginBottom: '0.5rem', lineHeight: 1.25 }}>{title}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '1.5rem', maxWidth: 380, margin: '0 auto 1.5rem' }}>{subtitle}</p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/signup')}>Create Free Account</button>
          <button className="btn btn-outline" onClick={() => navigate('/login')} style={{ color: 'var(--navy)', borderColor: 'var(--surface-mid)' }}>Sign In</button>
        </div>
        <p style={{ color: 'var(--slate)', fontSize: '0.78rem', marginTop: '1rem' }}>Free to create. No credit card required.</p>
      </div>
    </div>
  )
}
