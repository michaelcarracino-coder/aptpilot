import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    setLoading(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <div style={{ minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
      <div className="card fade-up" style={{ width:'100%', maxWidth:420 }}>
        {!sent ? (
          <>
            <h1 className="serif" style={{ fontSize:'1.9rem', color:'var(--navy)', marginBottom:'0.4rem' }}>Reset your password</h1>
            <p style={{ color:'var(--slate)', fontSize:'0.9rem', marginBottom:'1.75rem' }}>Enter your email and we'll send you a reset link.</p>

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div className="field">
                <label>Email</label>
                <input type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              {error && <p style={{ color:'#EF4444', fontSize:'0.82rem', background:'#FEF2F2', padding:'0.6rem 0.9rem', borderRadius:'7px' }}>{error}</p>}
              <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop:'0.5rem', justifyContent:'center' }}>
                {loading ? <span className="spinner" /> : 'Send Reset Link'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign:'center' }}>
            <div style={{ width:56, height:56, borderRadius:16, background:'var(--teal-pale)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 0.75rem' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <h1 className="serif" style={{ fontSize:'1.7rem', color:'var(--navy)', marginBottom:'0.6rem' }}>Check your email</h1>
            <p style={{ color:'var(--slate)', fontSize:'0.9rem', lineHeight:1.6 }}>
              We sent a password reset link to <strong>{email}</strong>. Click the link in that email to set a new password.
            </p>
          </div>
        )}

        <p style={{ marginTop:'1.25rem', textAlign:'center', fontSize:'0.85rem', color:'var(--slate)' }}>
          <Link to="/login" style={{ color:'var(--teal)', fontWeight:600 }}>← Back to Sign In</Link>
        </p>
      </div>
    </div>
  )
}
