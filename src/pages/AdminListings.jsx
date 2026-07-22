import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const ADMIN_EMAIL = 'aptpilot1@gmail.com'

const css = `
.admin-listings { max-width: 1000px; margin: 0 auto; padding: 2rem 1.5rem 5rem; }
.admin-listings h1 { font-family:'Inter', sans-serif; font-size:2rem; color:var(--navy); margin-bottom:0.25rem; }
.search-selector { background:white; border-radius:12px; padding:1.25rem; box-shadow:var(--shadow); margin-bottom:1.5rem; }
.search-card {
  border:1.5px solid var(--surface-mid); border-radius:10px; padding:1rem 1.25rem;
  cursor:pointer; transition:all 0.15s; margin-bottom:0.5rem; display:flex; justify-content:space-between; align-items:center;
}
.search-card:hover,.search-card.active { border-color:var(--teal); background:var(--teal-pale); }
.search-card-info { font-size:0.88rem; color:var(--navy); font-weight:600; }
.search-card-meta { font-size:0.78rem; color:var(--slate); margin-top:0.2rem; }
.search-card-badge { font-size:0.72rem; background:var(--teal-pale); color:var(--teal); border-radius:100px; padding:0.2rem 0.6rem; font-weight:600; }
.add-listing-form { background:white; border-radius:12px; padding:1.75rem; box-shadow:var(--shadow); margin-bottom:1.5rem; }
.add-listing-form h2 { font-size:1rem; font-weight:700; color:var(--navy); margin-bottom:1.25rem; }
.form-3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:0.75rem; margin-bottom:0.75rem; }
.form-2 { display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; margin-bottom:0.75rem; }
@media(max-width:600px){ .form-3,.form-2{grid-template-columns:1fr;} }
.listing-row {
  background:white; border-radius:10px; padding:1rem 1.25rem; box-shadow:var(--shadow);
  margin-bottom:0.75rem; display:flex; justify-content:space-between; align-items:flex-start; gap:1rem; flex-wrap:wrap;
}
.listing-address { font-weight:700; font-size:0.92rem; color:var(--navy); }
.listing-meta { font-size:0.78rem; color:var(--slate); margin-top:0.2rem; }
.listing-actions { display:flex; gap:0.5rem; flex-shrink:0; }
.status-pill { font-size:0.7rem; font-weight:700; padding:0.2rem 0.65rem; border-radius:100px; text-transform:uppercase; letter-spacing:0.04em; }
.s-pending { background:#FEF3C7; color:#D97706; }
.s-outreach_sent { background:#EFF6FF; color:#2563EB; }
.s-confirmed { background:#ECFDF5; color:#059669; }
.s-declined { background:#FEF2F2; color:#EF4444; }
.s-apply_requested { background:#F5F3FF; color:#7C3AED; }
.admin-msg-panel { background:#fff; border-radius:12px; box-shadow:var(--shadow); padding:1.25rem; margin-bottom:1.5rem; }
.admin-msg-panel h3 { font-size:0.85rem; font-weight:700; color:var(--navy); margin-bottom:0.85rem; display:flex; align-items:center; gap:0.5rem; }
.admin-msg-thread { display:flex; flex-direction:column; gap:0.5rem; max-height:220px; overflow-y:auto; margin-bottom:0.75rem; }
.admin-msg-bubble { max-width:80%; padding:0.5rem 0.8rem; border-radius:12px; font-size:0.83rem; line-height:1.5; }
.admin-msg-bubble.from-user { align-self:flex-start; background:#F1F5F9; color:var(--navy); }
.admin-msg-bubble.from-admin { align-self:flex-end; background:var(--navy); color:#fff; }
.admin-msg-bubble .msg-meta { font-size:0.68rem; opacity:0.55; margin-top:0.2rem; }
.outreach-btn { background:var(--teal); color:white; border:none; border-radius:7px; padding:0.4rem 0.85rem; font-size:0.78rem; font-weight:600; cursor:pointer; font-family:inherit; transition:all 0.15s; }
.outreach-btn:hover { background:var(--teal-hover); }
.outreach-btn:disabled { opacity:0.5; cursor:not-allowed; }
`

export default function AdminListings() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [searches, setSearches] = useState([])
  const [selectedSearch, setSelectedSearch] = useState(null)
  const [listings, setListings] = useState([])
  const [saving, setSaving] = useState(false)
  const [sendingId, setSendingId] = useState(null)
  const [tourTimes, setTourTimes] = useState({})
  const [searchMessages, setSearchMessages] = useState([])
  const [adminMsgInput, setAdminMsgInput] = useState('')
  const [sendingAdminMsg, setSendingAdminMsg] = useState(false)
  const [sendingReview, setSendingReview] = useState(false)
  const [form, setForm] = useState({
    address:'', unit:'', bedrooms:'', bathrooms:'', sqft:'', price:'',
    agent_name:'', agent_email:'', agent_phone:'', listing_url:'', notes:''
  })
  const [scraping, setScraping] = useState(false)
  const [scrapeError, setScrapeError] = useState('')

  useEffect(() => { if (user) loadSearches() }, [user])
  useEffect(() => {
    const sid = searchParams.get('search')
    if (sid && searches.length) {
      const found = searches.find(s => s.id === sid)
      if (found) selectSearch(found)
    }
  }, [searches, searchParams])

  async function loadSearches() {
    const { data } = await supabase
      .from('searches').select('*, profiles(email, full_name)')
      .order('created_at', { ascending: false })
    setSearches(data || [])
  }

  async function selectSearch(search) {
    setSelectedSearch(search)
    const { data } = await supabase.from('listings').select('*').eq('search_id', search.id).order('created_at', { ascending: false })
    setListings(data || [])
    const { data: msgs } = await supabase.from('messages').select('*').eq('user_id', search.user_id).order('created_at', { ascending: true })
    setSearchMessages(msgs || [])
  }

  async function sendAdminReply() {
    const body = adminMsgInput.trim()
    if (!body || !selectedSearch) return
    setSendingAdminMsg(true)
    setAdminMsgInput('')
    const { data } = await supabase.from('messages').insert({ user_id: selectedSearch.user_id, body, from_admin: true }).select().single()
    if (data) setSearchMessages(prev => [...prev, data])
    setSendingAdminMsg(false)
  }

  async function scrapeUrl(url) {
    if (!url || !url.includes('streeteasy.com')) return
    setScraping(true)
    setScrapeError('')
    try {
      const res = await fetch('/api/admin?action=scrape-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (data.error) { setScrapeError('Could not auto-fill — fill in manually.'); return }
      setForm(f => ({
        ...f,
        address: data.address || f.address,
        unit: data.unit || f.unit,
        price: data.price || f.price,
        bedrooms: data.bedrooms || f.bedrooms,
        bathrooms: data.bathrooms || f.bathrooms,
        sqft: data.sqft || f.sqft,
        agent_name: data.agent_name || f.agent_name,
        agent_email: data.agent_email || f.agent_email,
        agent_phone: data.agent_phone || f.agent_phone,
        listing_url: url,
      }))
    } catch { setScrapeError('Could not auto-fill — fill in manually.') }
    setScraping(false)
  }

  async function handleAddListing(e) {
    e.preventDefault()
    if (!selectedSearch) return
    setSaving(true)
    const { data: inserted, error } = await supabase.from('listings').insert({
      ...form,
      price: parseInt(form.price),
      search_id: selectedSearch.id,
      user_id: selectedSearch.user_id,
      status: 'pending',
    }).select().single()

    if (!error && inserted) {
      setForm({ address:'', unit:'', bedrooms:'', bathrooms:'', sqft:'', price:'', agent_name:'', agent_email:'', agent_phone:'', listing_url:'', notes:'' })
      setScrapeError('')
      // Auto-send outreach fire-and-forget if agent contact info is present
      if (inserted.agent_email || inserted.agent_phone) {
        fetch('/api/outreach-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            listing: inserted,
            userEmail: selectedSearch?.profiles?.email,
            userName: selectedSearch?.profiles?.full_name,
            tourTimes: selectedSearch?.tour_times || [],
            searchId: selectedSearch?.id,
          }),
        }).catch(err => console.error('Auto-outreach failed:', err))
      }
      selectSearch(selectedSearch)
    }
    setSaving(false)
  }

  async function sendOutreach(listing) {
    setSendingId(listing.id)
    await fetch('/api/outreach-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        listing,
        userEmail: selectedSearch?.profiles?.email,
        userName: selectedSearch?.profiles?.full_name,
        tourTimes: selectedSearch?.tour_times || [],
        searchId: selectedSearch?.id,
      }),
    })
    setSendingId(null)
    selectSearch(selectedSearch)
  }

  async function confirmTour(listing) {
    const scheduledAt = tourTimes[listing.id]
    if (!scheduledAt) {
      alert('Please enter the confirmed tour date and time first.')
      return
    }
    setSendingId(listing.id)
    await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'tour-confirmed',
        listing,
        userEmail: selectedSearch?.profiles?.email,
        userName: selectedSearch?.profiles?.full_name,
        searchId: selectedSearch?.id,
        scheduledAt,
      }),
    })
    setSendingId(null)
    setTourTimes(t => { const n = { ...t }; delete n[listing.id]; return n })
    selectSearch(selectedSearch)
  }

  async function requestReview() {
    if (!selectedSearch) return
    setSendingReview(true)
    await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'review-request',
        userEmail: selectedSearch.profiles?.email,
        userName: selectedSearch.profiles?.full_name,
        discountCode: 'REVIEW50',
      }),
    })
    setSendingReview(false)
    alert('Review request sent!')
  }

  async function deleteListing(id) {
    if (!confirm('Delete this listing?')) return
    await supabase.from('listings').delete().eq('id', id)
    selectSearch(selectedSearch)
  }

  if (authLoading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'calc(100vh - 64px)' }}><div className="spinner" style={{ borderColor:'rgba(10,147,150,0.3)', borderTopColor:'var(--teal)', width:32, height:32 }} /></div>
  if (!user) return <Navigate to="/login" replace />
  if (user.email !== ADMIN_EMAIL) return <Navigate to="/" replace />

  return (
    <>
      <style>{css}</style>
      <div className="admin-listings">
        <h1>Listings Admin</h1>
        <p style={{ color:'var(--slate)', fontSize:'0.88rem', marginBottom:'1.5rem' }}>Select a search, pull matching listings from StreetEasy, and send outreach to agents.</p>

        {/* Search selector */}
        <div className="search-selector">
          <div style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--navy)', marginBottom:'0.75rem' }}>Active Searches ({searches.length})</div>
          {searches.length === 0 && <p style={{ color:'var(--slate)', fontSize:'0.88rem' }}>No searches yet.</p>}
          {searches.map(s => (
            <div key={s.id} className={`search-card ${selectedSearch?.id === s.id ? 'active' : ''}`} onClick={() => selectSearch(s)}>
              <div>
                <div className="search-card-info">{s.profiles?.email || s.user_id}</div>
                <div className="search-card-meta">
                  ${s.min_budget || '?'}–${s.max_budget || '?'}/mo · {s.min_bed}–{s.max_bed} bed · {(s.neighborhoods || []).slice(0,2).join(', ')}
                  {s.move_in ? ` · Move-in: ${s.move_in_direction === 'on_or_after' ? 'on or after' : 'on or before'} ${(([y,m,d]) => `${m}/${d}/${y.slice(2)}`)(s.move_in.split('-'))}` : ''}
                </div>
              </div>
              <span className="search-card-badge">{s.tier?.toUpperCase()}</span>
            </div>
          ))}
        </div>

        {selectedSearch && searchMessages.length > 0 && (
          <div className="admin-msg-panel">
            <h3>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Messages — {selectedSearch.profiles?.email}
            </h3>
            <div className="admin-msg-thread">
              {searchMessages.map(m => (
                <div key={m.id} className={`admin-msg-bubble ${m.from_admin ? 'from-admin' : 'from-user'}`}>
                  {m.body}
                  <div className="msg-meta">{m.from_admin ? 'AptPilot' : 'User'} · {new Date(m.created_at).toLocaleString('en-US', { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' })}</div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:'0.5rem' }}>
              <input
                style={{ flex:1, padding:'0.5rem 0.75rem', border:'1.5px solid var(--surface-mid)', borderRadius:8, fontSize:'0.85rem', fontFamily:'inherit', outline:'none' }}
                placeholder="Reply to user..."
                value={adminMsgInput}
                onChange={e => setAdminMsgInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendAdminReply()}
              />
              <button className="outreach-btn" onClick={sendAdminReply} disabled={sendingAdminMsg || !adminMsgInput.trim()}>
                {sendingAdminMsg ? '...' : 'Send'}
              </button>
            </div>
          </div>
        )}

        {selectedSearch && (
          <>
            {/* Add listing form */}
            <form className="add-listing-form" onSubmit={handleAddListing}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
                <h2 style={{ margin:0 }}>Add Listing for {selectedSearch.profiles?.email}</h2>
                <button
                  type="button"
                  className="outreach-btn"
                  style={{ background:'#7C3AED', whiteSpace:'nowrap' }}
                  onClick={requestReview}
                  disabled={sendingReview}
                >
                  {sendingReview ? '...' : '⭐ Request Review'}
                </button>
              </div>

              {/* StreetEasy URL auto-fill */}
              <div className="field" style={{ marginBottom:'1rem' }}>
                <label style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
                  StreetEasy URL
                  <span style={{ fontSize:'0.72rem', color:'var(--teal)', fontWeight:600, background:'var(--teal-pale)', borderRadius:4, padding:'0.1rem 0.4rem' }}>Auto-fills form</span>
                </label>
                <div style={{ display:'flex', gap:'0.5rem' }}>
                  <input
                    placeholder="https://streeteasy.com/building/..."
                    value={form.listing_url}
                    onChange={e => { setForm(f=>({...f, listing_url:e.target.value})); setScrapeError('') }}
                    onBlur={e => scrapeUrl(e.target.value)}
                    style={{ flex:1 }}
                  />
                  <button
                    type="button"
                    className="outreach-btn"
                    onClick={() => scrapeUrl(form.listing_url)}
                    disabled={scraping || !form.listing_url}
                    style={{ whiteSpace:'nowrap' }}
                  >
                    {scraping ? '…' : 'Auto-fill'}
                  </button>
                </div>
                {scrapeError && <div style={{ fontSize:'0.75rem', color:'#D97706', marginTop:'0.3rem' }}>{scrapeError}</div>}
                {scraping && <div style={{ fontSize:'0.75rem', color:'var(--teal)', marginTop:'0.3rem' }}>Fetching listing data…</div>}
              </div>

              <div className="form-3">
                <div className="field"><label>Address</label><input placeholder="245 E 63rd St" value={form.address} onChange={e => setForm(f=>({...f,address:e.target.value}))} required /></div>
                <div className="field"><label>Unit</label><input placeholder="Apt 8C" value={form.unit} onChange={e => setForm(f=>({...f,unit:e.target.value}))} /></div>
                <div className="field"><label>Monthly Rent ($)</label><input type="number" placeholder="3800" value={form.price} onChange={e => setForm(f=>({...f,price:e.target.value}))} required /></div>
              </div>
              <div className="form-3">
                <div className="field"><label>Bedrooms</label><input placeholder="2 bed" value={form.bedrooms} onChange={e => setForm(f=>({...f,bedrooms:e.target.value}))} /></div>
                <div className="field"><label>Bathrooms</label><input placeholder="1 bath" value={form.bathrooms} onChange={e => setForm(f=>({...f,bathrooms:e.target.value}))} /></div>
                <div className="field"><label>Sqft</label><input placeholder="850 sqft" value={form.sqft} onChange={e => setForm(f=>({...f,sqft:e.target.value}))} /></div>
              </div>
              <div className="form-3">
                <div className="field"><label>Agent Name</label><input placeholder="Sarah M." value={form.agent_name} onChange={e => setForm(f=>({...f,agent_name:e.target.value}))} /></div>
                <div className="field"><label>Agent Email</label><input type="email" placeholder="agent@realty.com" value={form.agent_email} onChange={e => setForm(f=>({...f,agent_email:e.target.value}))} /></div>
                <div className="field"><label>Agent Phone</label><input placeholder="+1 (212) 555-0100" value={form.agent_phone} onChange={e => setForm(f=>({...f,agent_phone:e.target.value}))} /></div>
              </div>
              <div className="field" style={{ marginBottom:'0.75rem' }}>
                <label>Notes</label>
                <input placeholder="Doorman, laundry in unit, no fee…" value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} />
              </div>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? <span className="spinner"/> : '+ Add Listing'}
              </button>
            </form>

            {/* Listings list */}
            <div style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--navy)', marginBottom:'0.75rem' }}>
              Listings ({listings.length})
            </div>
            {listings.length === 0 && <p style={{ color:'var(--slate)', fontSize:'0.88rem' }}>No listings added yet — add some above.</p>}
            {listings.map(l => (
              <div className="listing-row" key={l.id}>
                <div>
                  <div className="listing-address">{l.address}{l.unit ? `, ${l.unit}` : ''}</div>
                  <div className="listing-meta">
                    ${l.price?.toLocaleString()}/mo · {l.bedrooms} · {l.bathrooms} · {l.sqft}
                    {l.agent_name ? ` · Agent: ${l.agent_name}` : ''}
                  </div>
                  <div style={{ marginTop:'0.4rem' }}>
                    <span className={`status-pill s-${l.status}`}>{l.status?.replace('_', ' ')}</span>
                    {l.listing_url && <a href={l.listing_url} target="_blank" rel="noopener noreferrer" style={{ marginLeft:'0.5rem', fontSize:'0.75rem', color:'var(--teal)' }}>View on StreetEasy →</a>}
                  </div>
                </div>
                <div className="listing-actions">
                  {(l.status === 'outreach_sent' || l.status === 'confirmed') ? null : (
                    <button
                      className="outreach-btn"
                      onClick={() => sendOutreach(l)}
                      disabled={sendingId === l.id}
                    >
                      {sendingId === l.id ? '...' : 'Send Outreach'}
                    </button>
                  )}
                  {l.status === 'outreach_sent' && (
                    <>
                      <input
                        type="datetime-local"
                        value={tourTimes[l.id] || ''}
                        onChange={e => setTourTimes(t => ({ ...t, [l.id]: e.target.value }))}
                        style={{ fontSize:'0.78rem', border:'1.5px solid var(--surface-mid)', borderRadius:7, padding:'0.35rem 0.5rem', fontFamily:'inherit', color:'var(--navy)' }}
                      />
                      <button
                        className="outreach-btn"
                        style={{ background:'#059669' }}
                        onClick={() => confirmTour(l)}
                        disabled={sendingId === l.id || !tourTimes[l.id]}
                      >
                        {sendingId === l.id ? '...' : 'Mark Confirmed'}
                      </button>
                    </>
                  )}
                  <button className="btn btn-outline btn-sm" style={{ color:'#EF4444', borderColor:'#FECACA' }} onClick={() => deleteListing(l.id)}>✕</button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  )
}
