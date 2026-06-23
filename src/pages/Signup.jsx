import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function Signup() {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { signUp } = useAuth()
  const navigate   = useNavigate()
  const [searchParams] = useSearchParams()
  const refCode = searchParams.get('ref') || ''

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setError(''); setLoading(true)
    const { error, data } = await signUp(email, password, name)
    setLoading(false)
    if (error) { setError(error.message); return }
    // Track referral if ref code present
    if (refCode && data?.user?.id) {
      const { data: referrer } = await supabase
        .from('profiles').select('id').eq('referral_code', refCode.toUpperCase()).single()
      if (referrer) {
        await supabase.from('referrals').insert({ referrer_id: referrer.id, referee_id: data.user.id }).catch(() => {})
        await supabase.from('profiles').update({ referred_by: refCode.toUpperCase() }).eq('id', data.user.id).catch(() => {})
      }
    }
    navigate('/intake')
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

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', color: 'var(--navy)', marginBottom: '0.4rem', lineHeight: 1.2 }}>
          Create your account
        </h1>
        <p className="sub">Start your AptPilot search in minutes.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Full Name</label>
            <input placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && (
            <div style={{ color: '#EF4444', fontSize: '0.83rem', background: '#FEF2F2', padding: '0.65rem 0.9rem', borderRadius: 8, border: '1px solid #FECACA' }}>
              {error}
            </div>
          )}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: '0.5rem', justifyContent: 'center', borderRadius: 100 }}>
            {loading ? <span className="spinner" /> : 'Create Account →'}
          </button>
        </form>

        <p className="auth-footer" style={{ marginTop: '1.5rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--teal)', fontWeight: 600 }}>Sign in</Link>
        </p>
        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--slate)', marginTop: '0.75rem', lineHeight: 1.55 }}>
          By signing up you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
