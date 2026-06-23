import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { signIn } = useAuth()
  const navigate   = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) setError(error.message)
    else navigate('/dashboard')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.75rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
            background: 'linear-gradient(135deg, #0ABFBF, #00E5CC)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: '0.9rem', color: 'var(--navy)',
          }}>A</div>
          <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.2rem', fontWeight: 700, color: 'var(--navy)' }}>
            Apt<span style={{ color: 'var(--teal)' }}>Pilot</span>
          </span>
        </div>

        <h1 className="auth-card" style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: 'var(--navy)', marginBottom: '0.4rem', padding: 0, boxShadow: 'none', background: 'none' }}>
          Welcome back
        </h1>
        <p className="sub">Sign in to your AptPilot account.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            <p style={{ textAlign: 'right', marginTop: '0.25rem' }}>
              <Link to="/forgot-password" style={{ color: 'var(--teal)', fontSize: '0.82rem', fontWeight: 600 }}>Forgot password?</Link>
            </p>
          </div>
          {error && (
            <div style={{ color: '#EF4444', fontSize: '0.83rem', background: '#FEF2F2', padding: '0.65rem 0.9rem', borderRadius: 8, border: '1px solid #FECACA' }}>
              {error}
            </div>
          )}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: '0.5rem', justifyContent: 'center', borderRadius: 100 }}>
            {loading ? <span className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer" style={{ marginTop: '1.5rem' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: 'var(--teal)', fontWeight: 600 }}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}
