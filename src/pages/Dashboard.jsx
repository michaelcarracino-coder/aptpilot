import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useSearchParams } from 'react-router-dom'

const css = `
.dash { max-width:1100px; margin:0 auto; padding:2.5rem 2rem; animation:fadeUp 0.4s ease both; }
.dash-header { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:2rem;flex-wrap:wrap;gap:1rem; }
.dash-header h1 { font-family:'Cormorant Garamond',serif; font-size:2rem; color:var(--navy); }
.dash-header p { color:var(--gray); font-size:0.88rem; margin-top:0.25rem; }
.live-badge { background:#ECFDF5;color:#059669;border:1px solid #A7F3D0;padding:0.4rem 1rem;border-radius:100px;font-size:0.8rem;font-weight:600;display:flex;align-items:center;gap:0.45rem; }
.pulse { width:7px;height:7px;border-radius:50%;background:#059669;animation:pulse 2s infinite; }
.kpi-row { display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:1.75rem; }
@media(max-width:700px){ .kpi-row{grid-template-columns:repeat(2,1fr);} }
.kpi { background:#fff;border-radius:var(--radius);padding:1.25rem;box-shadow:var(--shadow); }
.kpi-label { font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--gray);margin-bottom:0.3rem; }
.kpi-val { font-family:'Cormorant Garamond',serif;font-size:2.1rem;color:var(--navy);line-height:1; }
.kpi-sub { font-size:0.77rem;color:var(--teal);font-weight:600;margin-top:0.3rem; }
.sect-title { font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:var(--gray);margin-bottom:0.75rem; }
.two-col { display:grid;grid-template-columns:1fr 320px;gap:1.5rem; }
@media(max-width:800px){ .two-col{grid-template-columns:1fr;} }
.tour-card { background:#fff;border-radius:var(--radius);padding:1.1rem 1.25rem;box-shadow:var(--shadow);display:flex;align-items:center;gap:1.25rem;margin-bottom:0.75rem;border:1.5px solid transparent;transition:all 0.18s; }
.tour-card:hover { border-color:var(--teal); }
.tour-icon { background:var(--navy);color:#fff;border-radius:10px;padding:0.6rem 0.75rem;text-align:center;min-width:52px;flex-shrink:0;font-size:1.1rem; }
.tour-addr { font-weight:600;font-size:0.92rem;color:var(--navy); }
.tour-meta { font-size:0.8rem;color:var(--gray);margin-top:0.2rem;display:flex;gap:0.75rem;flex-wrap:wrap; }
.tour-price { font-family:'Cormorant Garamond',serif;font-size:1.15rem;color:var(--teal);text-align:right;flex-shrink:0; }
.tour-price small { font-family:'Plus Jakarta Sans',sans-serif;font-size:0.72rem;color:var(--gray);display:block; }
.status-pill { padding:0.28rem 0.65rem;border-radius:100px;font-size:0.72rem;font-weight:700;margin-top:0.3rem; }
.s-pending { background:#FEF3C7;color:#D97706; }
.s-outreach_sent { background:#EFF6FF;color:#2563EB; }
.s-confirmed { background:#ECFDF5;color:#059669; }
.s-declined { background:#FEF2F2;color:#EF4444; }
.tracker-card { background:#fff;border-radius:var(--radius);box-shadow:var(--shadow);padding:1.25rem; }
.tracker-row { display:flex;gap:0.85rem;padding:0.65rem 0;border-bottom:1px solid var(--gray-light); }
.tracker-row:last-child { border:none; }
.t-dot { width:9px;height:9px;border-radius:50%;margin-top:4px;flex-shrink:0; }
.criteria-card { background:#fff;border-radius:var(--radius);box-shadow:var(--shadow);padding:1.25rem; }
.crit-row { display:flex;justify-content:space-between;padding:0.45rem 0;border-bottom:1px solid var(--gray-light);font-size:0.85rem; }
.crit-row:last-child { border:none; }
.empty-state { text-align:center;padding:2.5rem;color:var(--gray);font-size:0.9rem;background:#fff;border-radius:var(--radius);box-shadow:var(--shadow); }
.success-banner { background:#ECFDF5;border:1px solid #A7F3D0;border-radius:12px;padding:1rem 1.5rem;margin-bottom:1.5rem;display:flex;align-items:center;gap:0.75rem;color:#065F46;font-size:0.88rem;font-weight:500; }
`

const STATUS_COLORS = {
  pending: '#D97706',
  outreach_sent: '#2563EB',
  confirmed: '#059669',
  declined: '#EF4444',
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [search, setSearch] = useState(null)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams] = useSearchParams()
  const justPaid = searchParams.get('payment') === 'success'

  useEffect(() => {
    if (user) loadData()
  }, [user])

  async function loadData() {
    setLoading(true)
    const { data: searchData } = await supabase
      .from('searches').select('*').eq('user_id', user.id)
      .order('created_at', { ascending: false }).limit(1).single()

    setSearch(searchData)

    if (searchData) {
      const { data: listingData } = await supabase
        .from('listings').select('*').eq('search_id', searchData.id)
        .order('created_at', { ascending: false })
      setListings(listingData || [])
    }
    setLoading(false)
  }

  const firstName = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'there'
  const confirmedTours = listings.filter(l => l.status === 'confirmed')
  const sentOutreach = listings.filter(l => l.status === 'outreach_sent')

  return (
    <>
      <style>{css}</style>
      <div className="dash">

        {justPaid && (
          <div className="success-banner">
            <span style={{ fontSize:'1.25rem' }}>🎉</span>
            <span>Payment successful! Your search is now active. We're pulling listings that match your criteria — check back soon for your tour agenda.</span>
          </div>
        )}

        <div className="dash-header">
          <div>
            <h1>Good morning, {firstName}. 👋</h1>
            <p>
              {listings.length === 0
                ? "We're finding apartments that match your criteria — your tour agenda will appear here shortly."
                : `${listings.length} apartments found · ${confirmedTours.length} tours confirmed · ${sentOutreach.length} awaiting agent response`
              }
            </p>
          </div>
          <div className="live-badge"><div className="pulse" />AptPilot Active</div>
        </div>

        <div className="kpi-row">
          {[
            { label:'Listings Found', val: listings.length || '—', sub: listings.length > 0 ? 'matching your criteria' : 'search in progress' },
            { label:'Tours Confirmed', val: confirmedTours.length || '—', sub: confirmedTours.length > 0 ? 'ready to visit' : 'awaiting responses' },
            { label:'Outreach Sent', val: sentOutreach.length || '—', sub: 'agents contacted' },
            { label:'You Saved', val: search ? '$' + Math.round((search.max_budget || 4000) * 1.08).toLocaleString() : '—', sub: 'vs. broker fee' },
          ].map(k => (
            <div className="kpi" key={k.label}>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-val">{k.val}</div>
              <div className="kpi-sub">{k.sub}</div>
            </div>
          ))}
        </div>

        <div className="two-col">
          <div>
            <div className="sect-title">🏠 Your Apartments</div>
            {loading ? (
              <div className="empty-state">Loading your listings...</div>
            ) : listings.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize:'2rem', marginBottom:'0.75rem' }}>🔍</div>
                <strong>We're on it.</strong>
                <p style={{ marginTop:'0.4rem', color:'var(--gray)' }}>
                  Our team is searching listings that match your criteria right now. Your apartments will appear here within a few hours.
                </p>
              </div>
            ) : (
              listings.map(l => (
                <div className="tour-card" key={l.id}>
                  <div className="tour-icon">🏠</div>
                  <div style={{ flex:1 }}>
                    <div className="tour-addr">{l.address}{l.unit ? `, ${l.unit}` : ''}</div>
                    <div className="tour-meta">
                      {l.bedrooms && <span>🛏 {l.bedrooms}</span>}
                      {l.bathrooms && <span>🚿 {l.bathrooms}</span>}
                      {l.sqft && <span>📐 {l.sqft}</span>}
                      {l.agent_name && <span>👤 {l.agent_name}</span>}
                    </div>
                    <div style={{ marginTop:'0.35rem' }}>
                      <span className={`status-pill s-${l.status}`}>
                        {l.status === 'pending' ? 'Finding tour time' :
                         l.status === 'outreach_sent' ? 'Agent contacted' :
                         l.status === 'confirmed' ? 'Tour confirmed ✓' :
                         l.status === 'declined' ? 'Not available' : l.status}
                      </span>
                      {l.listing_url && (
                        <a href={l.listing_url} target="_blank" rel="noopener noreferrer"
                           style={{ marginLeft:'0.5rem', fontSize:'0.75rem', color:'var(--teal)' }}>
                          View listing →
                        </a>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div className="tour-price">${l.price?.toLocaleString()}<small>/month</small></div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            <div>
              <div className="sect-title">📋 Status Tracker</div>
              <div className="tracker-card">
                {listings.length === 0 ? (
                  <p style={{ color:'var(--gray)', fontSize:'0.85rem', padding:'0.5rem 0' }}>Listings will appear here once found.</p>
                ) : listings.map(l => (
                  <div className="tracker-row" key={l.id}>
                    <div className="t-dot" style={{ background: STATUS_COLORS[l.status] || '#94A3B8' }} />
                    <div>
                      <div style={{ fontWeight:600, fontSize:'0.85rem', color:'var(--navy)' }}>{l.address}{l.unit ? `, ${l.unit}` : ''}</div>
                      <div style={{ fontSize:'0.77rem', color:'var(--gray)', marginTop:'0.15rem' }}>
                        {l.status === 'pending' ? 'Searching for tour availability' :
                         l.status === 'outreach_sent' ? 'Tour request sent to agent' :
                         l.status === 'confirmed' ? 'Tour confirmed ✓' :
                         l.status === 'declined' ? 'Listing not available' : l.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="sect-title">🔍 Your Criteria</div>
              <div className="criteria-card">
                {[
                  ['Budget', search ? `$${search.min_budget || '?'} – $${search.max_budget || '?'}/mo` : '—'],
                  ['Bedrooms', search ? `${search.min_bed} – ${search.max_bed} bed` : '—'],
                  ['Move-In', search?.move_in || 'ASAP'],
                  ['Neighborhoods', (search?.neighborhoods || []).slice(0,2).join(', ') || '—'],
                  ['Plan', search?.tier === 'pro' ? 'Pro ($499)' : search?.tier === 'standard' ? 'Standard ($299)' : 'Core ($399)'],
                  ['Chauffeur', search?.chauffeur ? 'Yes ✓' : 'No'],
                ].map(([k, v]) => (
                  <div className="crit-row" key={k}><span style={{ color:'var(--gray)' }}>{k}</span><span style={{ fontWeight:600 }}>{v}</span></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
