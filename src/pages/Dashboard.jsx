import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const css = `
.dash { max-width:1100px; margin:0 auto; padding:2.5rem 2rem; animation:fadeUp 0.4s ease both; }
.dash-header { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:2rem;flex-wrap:wrap;gap:1rem; }
.dash-header h1 { font-family:'DM Serif Display',serif; font-size:2rem; color:var(--navy); }
.dash-header p { color:var(--gray); font-size:0.88rem; margin-top:0.25rem; }
.live-badge { background:#ECFDF5;color:#059669;border:1px solid #A7F3D0;padding:0.4rem 1rem;border-radius:100px;font-size:0.8rem;font-weight:600;display:flex;align-items:center;gap:0.45rem; }
.pulse { width:7px;height:7px;border-radius:50%;background:#059669;animation:pulse 2s infinite; }
.kpi-row { display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:1.75rem; }
@media(max-width:700px){ .kpi-row{grid-template-columns:repeat(2,1fr);} }
.kpi { background:#fff;border-radius:var(--radius);padding:1.25rem;box-shadow:var(--shadow); }
.kpi-label { font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--gray);margin-bottom:0.3rem; }
.kpi-val { font-family:'DM Serif Display',serif;font-size:2.1rem;color:var(--navy);line-height:1; }
.kpi-sub { font-size:0.77rem;color:var(--teal);font-weight:600;margin-top:0.3rem; }
.sect-title { font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:var(--gray);margin-bottom:0.75rem; }
.two-col { display:grid;grid-template-columns:1fr 320px;gap:1.5rem; }
@media(max-width:800px){ .two-col{grid-template-columns:1fr;} }
.tour-card { background:#fff;border-radius:var(--radius);padding:1.1rem 1.25rem;box-shadow:var(--shadow);display:flex;align-items:center;gap:1.25rem;cursor:pointer;transition:all 0.18s;border:1.5px solid transparent;margin-bottom:0.75rem; }
.tour-card:hover { border-color:var(--teal);transform:translateY(-1px);box-shadow:var(--shadow-lg); }
.tour-time { background:var(--navy);color:#fff;border-radius:10px;padding:0.55rem 0.75rem;text-align:center;min-width:62px;flex-shrink:0; }
.tour-time-val { font-family:'DM Serif Display',serif;font-size:1rem;line-height:1; }
.tour-time-ap { font-size:0.68rem;color:var(--teal-light);margin-top:0.1rem; }
.tour-addr { font-weight:600;font-size:0.92rem;color:var(--navy); }
.tour-meta { font-size:0.8rem;color:var(--gray);margin-top:0.2rem;display:flex;gap:0.85rem;flex-wrap:wrap; }
.tour-price { font-family:'DM Serif Display',serif;font-size:1.15rem;color:var(--teal);text-align:right;flex-shrink:0; }
.tour-price small { font-family:'DM Sans',sans-serif;font-size:0.72rem;color:var(--gray);display:block; }
.status-pill { padding:0.28rem 0.65rem;border-radius:100px;font-size:0.72rem;font-weight:700;margin-top:0.3rem; }
.s-confirmed { background:#ECFDF5;color:#059669; }
.s-pending { background:#FEF3C7;color:#D97706; }
.s-applied { background:#EFF6FF;color:#2563EB; }
.chauffeur-bar { background:linear-gradient(135deg,var(--navy) 0%,#0D2A3A 100%);border-radius:var(--radius);padding:1.1rem 1.5rem;display:flex;align-items:center;gap:1rem;margin-bottom:1.75rem;border:1px solid rgba(10,147,150,0.3); }
.tracker-card { background:#fff;border-radius:var(--radius);box-shadow:var(--shadow);padding:1.25rem; }
.tracker-row { display:flex;gap:0.85rem;padding:0.65rem 0;border-bottom:1px solid var(--gray-light); }
.tracker-row:last-child { border:none; }
.t-dot { width:9px;height:9px;border-radius:50%;margin-top:4px;flex-shrink:0; }
.criteria-card { background:#fff;border-radius:var(--radius);box-shadow:var(--shadow);padding:1.25rem; }
.crit-row { display:flex;justify-content:space-between;padding:0.45rem 0;border-bottom:1px solid var(--gray-light);font-size:0.85rem; }
.crit-row:last-child { border:none; }
`

const TOURS = [
  { time:'9:30', ap:'AM', addr:'245 E 63rd St, Apt 8C', beds:'2 bed', baths:'1 bath', sqft:'850 sqft', price:'$3,800', status:'confirmed', agent:'Sarah M.' },
  { time:'11:00', ap:'AM', addr:'88 Lexington Ave, Apt 14F', beds:'1 bed', baths:'1 bath', sqft:'620 sqft', price:'$3,200', status:'confirmed', agent:'James R.' },
  { time:'1:30', ap:'PM', addr:'310 W 79th St, Apt 3B', beds:'2 bed', baths:'2 bath', sqft:'1,050 sqft', price:'$5,100', status:'pending', agent:'TBD' },
  { time:'3:00', ap:'PM', addr:'55 Water St, Apt 22A', beds:'Studio', baths:'1 bath', sqft:'480 sqft', price:'$2,650', status:'confirmed', agent:'Maria T.' },
]
const APPLICATIONS = [
  { addr:'245 E 63rd St, Apt 8C', status:'Application Submitted', dot:'#2563EB' },
  { addr:'88 Lexington Ave, Apt 14F', status:'Under Review', dot:'#D97706' },
  { addr:'12 Park Ave, Apt 5D', status:'Approved ✓', dot:'#059669' },
  { addr:'401 W 25th St, Apt 9B', status:'Waiting on docs', dot:'#D97706' },
]

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [search, setSearch] = useState(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('searches').select('*').eq('user_id', user.id)
        .order('created_at', { ascending:false }).limit(1).single()
      setSearch(data)
    }
    if (user) load()
  }, [user])

  const firstName = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'there'
  const hasChauffeur = search?.chauffeur

  return (
    <>
      <style>{css}</style>
      <div className="dash">
        <div className="dash-header">
          <div>
            <h1>Good morning, {firstName}. 👋</h1>
            <p>Your tour day is scheduled for <strong>Thursday, June 5</strong> — 4 apartments lined up.</p>
          </div>
          <div className="live-badge"><div className="pulse" />AptPilot Active</div>
        </div>

        <div className="kpi-row">
          {[
            { label:'Listings Found', val:'47', sub:'↑ 12 new today' },
            { label:'Tours Booked', val:'4', sub:'June 5, 2026' },
            { label:'Applications', val:'3', sub:'1 approved' },
            { label:'You Saved', val:'$4.2K', sub:'vs. broker fee' },
          ].map(k => (
            <div className="kpi" key={k.label}>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-val">{k.val}</div>
              <div className="kpi-sub">{k.sub}</div>
            </div>
          ))}
        </div>

        {hasChauffeur && (
          <div className="chauffeur-bar">
            <span style={{ fontSize:'2rem' }}>🚘</span>
            <div style={{ flex:1 }}>
              <strong style={{ color:'#fff', fontSize:'0.95rem' }}>Your chauffeur is booked for June 5th</strong>
              <p style={{ color:'#94A3B8', fontSize:'0.82rem', marginTop:'0.2rem' }}>Pick-up 8:45 AM · Black Lincoln Navigator · Driver: Carlos M. · (917) 555-0182</p>
            </div>
            <button className="btn btn-primary btn-sm">View Details</button>
          </div>
        )}

        <div className="two-col">
          <div>
            <div className="sect-title">📅 Tour Agenda — June 5, 2026</div>
            {TOURS.map((t, i) => (
              <div className="tour-card" key={i}>
                <div className="tour-time">
                  <div className="tour-time-val">{t.time}</div>
                  <div className="tour-time-ap">{t.ap}</div>
                </div>
                <div style={{ flex:1 }}>
                  <div className="tour-addr">{t.addr}</div>
                  <div className="tour-meta">
                    <span>🛏 {t.beds}</span><span>🚿 {t.baths}</span>
                    <span>📐 {t.sqft}</span><span>👤 {t.agent}</span>
                  </div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div className="tour-price">{t.price}<small>/month</small></div>
                  <div className={`status-pill s-${t.status}`}>{t.status}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            <div>
              <div className="sect-title">📋 Application Tracker</div>
              <div className="tracker-card">
                {APPLICATIONS.map((a, i) => (
                  <div className="tracker-row" key={i}>
                    <div className="t-dot" style={{ background: a.dot }} />
                    <div>
                      <div style={{ fontWeight:600, fontSize:'0.85rem', color:'var(--navy)' }}>{a.addr}</div>
                      <div style={{ fontSize:'0.77rem', color:'var(--gray)', marginTop:'0.15rem' }}>{a.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="sect-title">🔍 Your Search Criteria</div>
              <div className="criteria-card">
                {[
                  ['Budget', search ? `$${search.min_budget||'2,500'} – $${search.max_budget||'5,000'}` : '$2,500 – $5,000'],
                  ['Bedrooms', search ? `${search.min_bed} – ${search.max_bed} bed` : '1 – 2 bed'],
                  ['Move-In', search?.move_in || 'ASAP'],
                  ['Neighborhoods', search?.neighborhoods?.slice(0,2).join(', ') || 'UES, Midtown'],
                  ['Plan', search?.tier === 'pro' ? 'Pro ($599)' : 'Core ($399)'],
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
