import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { redirectToCheckout, PRICES } from '../lib/stripe'

export default function Checkout() {
  const { user, profile } = useAuth()
  const [search, setSearch]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying]   = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('searches').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: false }).limit(1).single()
      setSearch(data)
      setLoading(false)
    }
    if (user) load()
  }, [user])

  const handlePay = async () => {
    if (!search) return
    setPaying(true)
    if (search.tier === 'alerts') {
      await redirectToCheckout(null, user.id, user.email, 'alerts')
    } else {
      const priceId = search.tier === 'pro' ? PRICES.pro.id : search.tier === 'standard' ? PRICES.standard.id : PRICES.core.id
      await redirectToCheckout(priceId, user.id, user.email)
    }
    setPaying(false)
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'calc(100vh - 64px)' }}>
      <div className="spinner" style={{ borderColor:'rgba(10,147,150,0.3)', borderTopColor:'var(--teal)', width:32, height:32 }} />
    </div>
  )

  const isAlerts = search?.tier === 'alerts'
  const price = search?.tier === 'pro' ? 499 : search?.tier === 'standard' ? 299 : 399
  const planName = isAlerts ? 'Alerts Plan' : search?.tier === 'pro' ? 'Pro Plan' : search?.tier === 'standard' ? 'Standard Plan' : 'Core Plan'
  const priceLabel = isAlerts ? '$14.99/mo' : `$${price}.00`
  const dueToday = isAlerts ? '$0.00' : `$${price}.00`

  return (
    <div style={{ minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
      <div className="card fade-up" style={{ width:'100%', maxWidth:480 }}>
        <div style={{ textAlign:'center', marginBottom:'1.75rem' }}>
          <div style={{ width:56, height:56, borderRadius:16, background:'var(--teal-pale)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 0.75rem' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h1 className="serif" style={{ fontSize:'1.9rem', color:'var(--navy)', marginBottom:'0.4rem' }}>Almost there!</h1>
          <p style={{ color:'var(--gray)', fontSize:'0.9rem' }}>Complete payment to activate your AptPilot search.</p>
        </div>

        <div style={{ background:'var(--surface)', borderRadius:'10px', padding:'1.25rem', marginBottom:'1.5rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.6rem', fontSize:'0.9rem' }}>
            <span style={{ color:'var(--slate)' }}>{planName}</span>
            <span style={{ fontWeight:600 }}>{priceLabel}</span>
          </div>
          {isAlerts && (
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.6rem', fontSize:'0.9rem' }}>
              <span style={{ color:'var(--slate)' }}>3-day free trial</span>
              <span style={{ fontWeight:600, color:'#059669' }}>Included</span>
            </div>
          )}
          {search?.chauffeur && (
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.6rem', fontSize:'0.9rem' }}>
              <span style={{ color:'var(--slate)' }}>Chauffeur Add-On</span>
              <span style={{ fontWeight:600 }}>Per booking</span>
            </div>
          )}
          <div style={{ borderTop:'1px solid var(--surface-mid)', paddingTop:'0.6rem', display:'flex', justifyContent:'space-between', fontWeight:700 }}>
            <span>Total Due Today</span>
            <span style={{ color:'var(--teal)', fontFamily:"'Inter', sans-serif", fontSize:'1.2rem' }}>{dueToday}</span>
          </div>
        </div>

        <div style={{ background:'#F0FDF4', border:'1px solid #A7F3D0', borderRadius:'8px', padding:'0.75rem 1rem', marginBottom:'1.5rem', fontSize:'0.82rem', color:'#065F46', display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#065F46" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Payments are processed securely by Stripe. AptPilot never stores your card details.
        </div>

        <button className="btn btn-primary" onClick={handlePay} disabled={paying} style={{ width:'100%', justifyContent:'center', padding:'0.9rem' }}>
          {paying ? <span className="spinner" /> : isAlerts ? 'Start Free Trial — Activate Alerts' : `Pay $${price} — Activate AptPilot`}
        </button>

        <p style={{ marginTop:'1rem', textAlign:'center', fontSize:'0.78rem', color:'#94A3B8', lineHeight:1.5 }}>
          {isAlerts ? '3 days free, then $14.99/mo. Cancel anytime.' : 'One-time payment. No subscription. No hidden fees.'}
        </p>
      </div>
    </div>
  )
}
