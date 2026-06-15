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
    const priceId = search.tier === 'pro' ? PRICES.pro.id : PRICES.core.id
    await redirectToCheckout(priceId, user.id, user.email)
    setPaying(false)
  }

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'calc(100vh - 64px)' }}>
      <div className="spinner" style={{ borderColor:'rgba(10,147,150,0.3)', borderTopColor:'var(--teal)', width:32, height:32 }} />
    </div>
  )

  const price = search?.tier === 'pro' ? 599 : 399
  const planName = search?.tier === 'pro' ? 'Pro Plan' : 'Core Plan'

  return (
    <div style={{ minHeight:'calc(100vh - 64px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
      <div className="card fade-up" style={{ width:'100%', maxWidth:480 }}>
        <div style={{ textAlign:'center', marginBottom:'1.75rem' }}>
          <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>🚀</div>
          <h1 className="serif" style={{ fontSize:'1.9rem', color:'var(--navy)', marginBottom:'0.4rem' }}>Almost there!</h1>
          <p style={{ color:'var(--gray)', fontSize:'0.9rem' }}>Complete payment to activate your AptPilot search.</p>
        </div>

        <div style={{ background:'var(--off-white)', borderRadius:'10px', padding:'1.25rem', marginBottom:'1.5rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.6rem', fontSize:'0.9rem' }}>
            <span style={{ color:'var(--gray)' }}>{planName}</span>
            <span style={{ fontWeight:600 }}>${price}.00</span>
          </div>
          {search?.chauffeur && (
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.6rem', fontSize:'0.9rem' }}>
              <span style={{ color:'var(--gray)' }}>🚘 Chauffeur Add-On</span>
              <span style={{ fontWeight:600 }}>Per booking</span>
            </div>
          )}
          <div style={{ borderTop:'1px solid var(--gray-light)', paddingTop:'0.6rem', display:'flex', justifyContent:'space-between', fontWeight:700 }}>
            <span>Total Due Today</span>
            <span style={{ color:'var(--teal)', fontFamily:"'DM Serif Display',serif", fontSize:'1.2rem' }}>${price}.00</span>
          </div>
        </div>

        <div style={{ background:'#F0FDF4', border:'1px solid #A7F3D0', borderRadius:'8px', padding:'0.75rem 1rem', marginBottom:'1.5rem', fontSize:'0.82rem', color:'#065F46', display:'flex', gap:'0.5rem' }}>
          🔒 Payments are processed securely by Stripe. AptPilot never stores your card details.
        </div>

        <button className="btn btn-primary" onClick={handlePay} disabled={paying} style={{ width:'100%', justifyContent:'center', padding:'0.9rem' }}>
          {paying ? <span className="spinner" /> : `Pay $${price} — Activate AptPilot`}
        </button>

        <p style={{ marginTop:'1rem', textAlign:'center', fontSize:'0.78rem', color:'#94A3B8', lineHeight:1.5 }}>
          One-time payment. No subscription. No hidden fees.
        </p>
      </div>
    </div>
  )
}
