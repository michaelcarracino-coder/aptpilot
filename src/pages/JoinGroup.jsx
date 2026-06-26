import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function JoinGroup() {
  const [searchParams] = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [status, setStatus] = useState('idle') // idle | joining | done | error
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!token) { setStatus('error'); setMessage('Invalid invite link.'); return }
    if (!user) return // wait for login
    processJoin()
  }, [user, authLoading, token])

  async function processJoin() {
    setStatus('joining')
    const res = await fetch('/api/group', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'join', token, userId: user.id }),
    })
    const json = await res.json()
    if (!res.ok) {
      setStatus('error')
      setMessage(json.error || 'Something went wrong.')
    } else {
      setStatus('done')
      setTimeout(() => navigate('/dashboard'), 2000)
    }
  }

  return (
    <div style={{ minHeight:'calc(100vh - 68px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
      <div className="card fade-up" style={{ width:'100%', maxWidth:420, textAlign:'center' }}>
        {authLoading || status === 'joining' ? (
          <>
            <div className="spinner" style={{ borderColor:'rgba(10,147,150,0.3)', borderTopColor:'var(--teal)', width:32, height:32, margin:'0 auto 1rem' }} />
            <p style={{ color:'var(--slate)', fontSize:'0.9rem' }}>Joining the group…</p>
          </>
        ) : !user ? (
          <>
            <div style={{ width:52, height:52, borderRadius:14, background:'var(--teal-pale)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h1 className="serif" style={{ fontSize:'1.7rem', color:'var(--navy)', marginBottom:'0.5rem' }}>You're invited</h1>
            <p style={{ color:'var(--slate)', fontSize:'0.88rem', lineHeight:1.6, marginBottom:'1.5rem' }}>
              Sign in or create an account to join the group and view your shared apartment search.
            </p>
            <Link to={`/login?redirect=/join?token=${token}`} className="btn btn-primary" style={{ display:'block', textAlign:'center', marginBottom:'0.75rem' }}>
              Sign In →
            </Link>
            <Link to={`/signup?redirect=/join?token=${token}`} className="btn btn-outline" style={{ display:'block', textAlign:'center' }}>
              Create Account
            </Link>
          </>
        ) : status === 'done' ? (
          <>
            <div style={{ width:52, height:52, borderRadius:14, background:'#ECFDF5', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h1 className="serif" style={{ fontSize:'1.7rem', color:'var(--navy)', marginBottom:'0.5rem' }}>You're in!</h1>
            <p style={{ color:'var(--slate)', fontSize:'0.88rem' }}>Redirecting you to the dashboard…</p>
          </>
        ) : (
          <>
            <div style={{ width:52, height:52, borderRadius:14, background:'#FEF2F2', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h1 className="serif" style={{ fontSize:'1.7rem', color:'var(--navy)', marginBottom:'0.5rem' }}>Link issue</h1>
            <p style={{ color:'var(--slate)', fontSize:'0.88rem', marginBottom:'1.25rem' }}>{message}</p>
            <Link to="/dashboard" style={{ color:'var(--teal)', fontWeight:600, fontSize:'0.88rem' }}>← Go to Dashboard</Link>
          </>
        )}
      </div>
    </div>
  )
}
