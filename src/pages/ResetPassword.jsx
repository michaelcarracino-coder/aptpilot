import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ResetPassword() {
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState(false)
  const [ready, setReady]         = useState(false)
  const navigate = useNavigate()

  // Supabase sends the user back with a recovery token in the URL hash.
  // onAuthStateChange fires PASSWORD_RECOVERY when that token is processed.
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    // Also check immediately in case the event already fired before mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirm) { setError('Passwords do not match'); return }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) setError(error.message)
    else {
      setSuccess(true)
      setTimeout(() => navigate('/login'), 2500)
    }
  }

  return (
    <div style={{ minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
      <div className="card fade-up" style={{ width:'100%', maxWidth:420 }}>
        {success ? (
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>✅</div>
            <h1 className="serif" style={{ fontSize:'1.7rem', color:'var(--navy)', marginBottom:'0.6rem' }}>Password updated</h1>
            <p style={{ color:'var(--gray)', fontSize:'0.9rem' }}>Redirecting you to sign in...</p>
          </div>
        ) : !ready ? (
          <div style={{ textAlign:'center' }}>
            <div className="spinner" style={{ borderColor:'rgba(10,147,150,0.3)', borderTopColor:'var(--teal)', width:28, height:28, margin:'0 auto 1rem' }} />
            <p style={{ color:'var(--gray)', fontSize:'0.9rem' }}>Verifying your reset link...</p>
          </div>
        ) : (
          <>
            <h1 className="serif" style={{ fontSize:'1.9rem', color:'var(--navy)', marginBottom:'0.4rem' }}>Set a new password</h1>
            <p style={{ color:'var(--gray)', fontSize:'0.9rem', marginBottom:'1.75rem' }}>Choose a new password for your AptPilot account.</p>

            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              <div className="field">
                <label>New Password</label>
                <input type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div className="field">
                <label>Confirm Password</label>
                <input type="password" placeholder="Re-enter password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
              </div>
              {error && <p style={{ color:'#EF4444', fontSize:'0.82rem', background:'#FEF2F2', padding:'0.6rem 0.9rem', borderRadius:'7px' }}>{error}</p>}
              <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop:'0.5rem', justifyContent:'center' }}>
                {loading ? <span className="spinner" /> : 'Update Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
