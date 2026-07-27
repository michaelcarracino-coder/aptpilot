import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { signIn } = useAuth()
  const navigate   = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) setError(error.message)
    else navigate(redirect || '/dashboard')
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ marginBottom: '1.75rem' }}>
          <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '1.35rem', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text)' }}>
            Apt<span style={{ color: 'var(--clay)' }}>Pilot</span>
          </span>
        </div>

        <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontSize: '2rem', color: 'var(--navy)', marginBottom: '0.4rem' }}>
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
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: '0.5rem', justifyContent: 'center' }}>
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
