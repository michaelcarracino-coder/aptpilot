import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { signUp } = useAuth()
  const navigate   = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setError(''); setLoading(true)
    const { error } = await signUp(email, password, name)
    setLoading(false)
    if (error) setError(error.message)
    else navigate('/intake')
  }

  return (
    <div style={{ minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
      <div className="card fade-up" style={{ width:'100%', maxWidth:440 }}>
        <h1 className="serif" style={{ fontSize:'1.9rem', color:'var(--navy)', marginBottom:'0.4rem' }}>Create your account</h1>
        <p style={{ color:'var(--gray)', fontSize:'0.9rem', marginBottom:'1.75rem' }}>Start your AptPilot search in minutes.</p>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div className="field">
            <label>Full Name</label>
            <input placeholder="Michael Carracino" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <p style={{ color:'#EF4444', fontSize:'0.82rem', background:'#FEF2F2', padding:'0.6rem 0.9rem', borderRadius:'7px' }}>{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop:'0.5rem', justifyContent:'center' }}>
            {loading ? <span className="spinner" /> : 'Create Account →'}
          </button>
        </form>

        <p style={{ marginTop:'1.25rem', textAlign:'center', fontSize:'0.85rem', color:'var(--gray)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'var(--teal)', fontWeight:600 }}>Sign in</Link>
        </p>
        <p style={{ marginTop:'0.75rem', textAlign:'center', fontSize:'0.75rem', color:'#94A3B8', lineHeight:1.5 }}>
          By signing up you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
