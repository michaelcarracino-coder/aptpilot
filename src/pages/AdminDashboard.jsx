import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import Chart from 'chart.js/auto'

const ADMIN_EMAIL = 'aptpilot1@gmail.com'
const TIER_PRICE = { standard: 299, core: 399, pro: 499 }
const TIER_COLOR = { standard: '#3b82f6', core: '#0ABFBF', pro: '#a855f7' }

function fmt(n) { return n == null ? '—' : n.toLocaleString() }
function fmtMoney(n) { return n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}` }
function timeAgo(ts) {
  if (!ts) return '—'
  const diff = (Date.now() - new Date(ts)) / 1000
  if (diff < 60) return `${Math.round(diff)}s ago`
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`
  if (diff < 86400) return `${Math.round(diff / 3600)}h ago`
  return `${Math.round(diff / 86400)}d ago`
}
function fmtDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const STATUS_PILL = {
  paid:      { bg: 'rgba(34,197,94,.15)',   color: '#22c55e' },
  free:      { bg: 'rgba(100,116,139,.15)', color: '#64748b' },
  pending:   { bg: 'rgba(245,158,11,.15)',  color: '#f59e0b' },
  running:   { bg: 'rgba(59,130,246,.15)',  color: '#3b82f6' },
  done:      { bg: 'rgba(34,197,94,.15)',   color: '#22c55e' },
  failed:    { bg: 'rgba(239,68,68,.15)',   color: '#ef4444' },
  new:       { bg: 'rgba(10,191,191,.15)',  color: '#0ABFBF' },
  contacted: { bg: 'rgba(59,130,246,.15)',  color: '#3b82f6' },
  touring:   { bg: 'rgba(168,85,247,.15)',  color: '#a855f7' },
  passed:    { bg: 'rgba(100,116,139,.15)', color: '#64748b' },
  closed:    { bg: 'rgba(34,197,94,.15)',   color: '#22c55e' },
  standard:  { bg: 'rgba(59,130,246,.15)',  color: '#3b82f6' },
  core:      { bg: 'rgba(10,191,191,.15)',  color: '#0ABFBF' },
  pro:       { bg: 'rgba(168,85,247,.15)',  color: '#a855f7' },
}
function Pill({ val }) {
  const s = STATUS_PILL[val] || { bg: 'rgba(100,116,139,.15)', color: '#64748b' }
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 100,
      fontSize: 11, fontWeight: 700, background: s.bg, color: s.color,
    }}>{val || '—'}</span>
  )
}

function KPI({ label, value, sub, accent }) {
  return (
    <div style={{
      background: '#111827', border: '1px solid #1e2d45', borderRadius: 12,
      padding: '1rem 1.25rem', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: accent || '#0ABFBF', borderRadius: '12px 12px 0 0',
      }} />
      <div style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function Card({ title, badge, children, style }) {
  return (
    <div style={{ background: '#111827', border: '1px solid #1e2d45', borderRadius: 12, padding: '1.25rem', ...style }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ color: '#64748b', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</span>
        {badge && (
          <span style={{ background: '#1a2235', border: '1px solid #1e2d45', borderRadius: 4, padding: '2px 8px', fontSize: 11, color: '#e2e8f0' }}>{badge}</span>
        )}
      </div>
      {children}
    </div>
  )
}

function StatusBar({ label, count, total, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <div style={{ width: 62, fontSize: 11, color: '#64748b' }}>{label}</div>
      <div style={{ flex: 1, height: 8, background: '#1a2235', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${total ? count / total * 100 : 0}%`, background: color, borderRadius: 4, transition: 'width .5s ease' }} />
      </div>
      <div style={{ width: 28, textAlign: 'right', fontSize: 12, fontWeight: 600, color }}>{count}</div>
    </div>
  )
}

function useChart(ref, config, deps) {
  const instRef = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    if (instRef.current) instRef.current.destroy()
    instRef.current = new Chart(ref.current, config)
    return () => { instRef.current?.destroy() }
  }, deps)
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const growthRef = useRef(null)
  const revenueRef = useRef(null)
  const neighborhoodRef = useRef(null)

  async function load() {
    setError(null)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.email !== ADMIN_EMAIL) {
      navigate('/')
      return
    }
    try {
      const res = await fetch('/api/admin-metrics', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      if (!res.ok) throw new Error(`API error ${res.status}`)
      const json = await res.json()
      setData(json)
      setLastUpdated(new Date())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    const id = setInterval(load, 60000)
    return () => clearInterval(id)
  }, [])

  // Charts
  const chartDeps = [data]

  useEffect(() => {
    if (!data || !growthRef.current) return
    const days = [], signupsByDay = {}, paidByDay = {}
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000)
      const k = d.toISOString().slice(0, 10)
      days.push(k); signupsByDay[k] = 0; paidByDay[k] = 0
    }
    data.profiles.forEach(u => {
      const k = u.created_at?.slice(0, 10)
      if (signupsByDay[k] !== undefined) signupsByDay[k]++
      if (u.paid && paidByDay[k] !== undefined) paidByDay[k]++
    })
    const labels = days.map(d => { const [,m,day] = d.split('-'); return `${parseInt(m)}/${parseInt(day)}` })
    const inst = new Chart(growthRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Signups', data: days.map(d => signupsByDay[d]), backgroundColor: 'rgba(10,191,191,.25)', borderColor: '#0ABFBF', borderWidth: 1.5, borderRadius: 3 },
          { label: 'Paid', data: days.map(d => paidByDay[d]), backgroundColor: 'rgba(34,197,94,.3)', borderColor: '#22c55e', borderWidth: 1.5, borderRadius: 3 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { labels: { color: '#94a3b8', font: { size: 11 } } } },
        scales: {
          x: { ticks: { color: '#475569', font: { size: 10 }, maxTicksLimit: 10 }, grid: { color: '#1e2d45' } },
          y: { ticks: { color: '#475569', stepSize: 1 }, grid: { color: '#1e2d45' } },
        },
      },
    })
    return () => inst.destroy()
  }, chartDeps)

  useEffect(() => {
    if (!data || !revenueRef.current) return
    const tierCounts = { standard: 0, core: 0, pro: 0 }
    data.profiles.filter(p => p.paid).forEach(p => { if (tierCounts[p.tier] !== undefined) tierCounts[p.tier]++ })
    const inst = new Chart(revenueRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Standard ($299)', 'Core ($399)', 'Pro ($499)'],
        datasets: [{
          data: [tierCounts.standard * 299, tierCounts.core * 399, tierCounts.pro * 499],
          backgroundColor: ['#3b82f6', '#0ABFBF', '#a855f7'],
          borderWidth: 0, hoverOffset: 6,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '70%',
        plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', font: { size: 10 }, padding: 10 } } },
      },
    })
    return () => inst.destroy()
  }, chartDeps)

  useEffect(() => {
    if (!data || !neighborhoodRef.current) return
    const nbrCounts = {}
    data.searches.forEach(s => (s.neighborhoods || []).forEach(n => { nbrCounts[n] = (nbrCounts[n] || 0) + 1 }))
    const sorted = Object.entries(nbrCounts).sort((a, b) => b[1] - a[1]).slice(0, 8)
    const inst = new Chart(neighborhoodRef.current, {
      type: 'bar',
      data: {
        labels: sorted.map(([n]) => n.length > 14 ? n.slice(0, 13) + '…' : n),
        datasets: [{ data: sorted.map(([, c]) => c), backgroundColor: 'rgba(10,191,191,.3)', borderColor: '#0ABFBF', borderWidth: 1.5, borderRadius: 4 }],
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: '#475569', font: { size: 10 }, stepSize: 1 }, grid: { color: '#1e2d45' } },
          y: { ticks: { color: '#94a3b8', font: { size: 10 } }, grid: { display: false } },
        },
      },
    })
    return () => inst.destroy()
  }, chartDeps)

  const s = { color: '#e2e8f0', background: '#0a0f1e', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', fontSize: 14 }

  if (loading) return (
    <div style={{ ...s, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0ABFBF', animation: 'pulse 1s infinite' }} />
      <span style={{ color: '#64748b' }}>Loading dashboard…</span>
    </div>
  )

  if (error) return (
    <div style={{ ...s, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#ef4444' }}>Error: {error}</div>
    </div>
  )

  const profiles = data.profiles || []
  const paid = profiles.filter(p => p.paid)
  const totalUsers = profiles.length
  const paidCount = paid.length
  const convPct = totalUsers ? Math.round(paidCount / totalUsers * 100) : 0
  const revenue = paid.reduce((sum, p) => sum + (TIER_PRICE[p.tier] || 399), 0)
  const weekAgo = Date.now() - 7 * 86400000
  const usersThisWeek = profiles.filter(u => new Date(u.created_at) > weekAgo).length
  const allListings = data.listings || []
  const allJobs = data.scrapeJobs || []
  const allTours = data.tours || []
  const tierCounts = { standard: 0, core: 0, pro: 0 }
  paid.forEach(p => { if (tierCounts[p.tier] !== undefined) tierCounts[p.tier]++ })

  const jobCounts = { pending: 0, running: 0, done: 0, failed: 0 }
  allJobs.forEach(j => { if (jobCounts[j.status] !== undefined) jobCounts[j.status]++ })

  const listingCounts = {}
  allListings.forEach(l => { listingCounts[l.status] = (listingCounts[l.status] || 0) + 1 })

  const confirmedTours = allTours.filter(t => t.status === 'confirmed').length
  const jobTotal = allJobs.length || 1
  const listingTotal = allListings.length || 1

  const funnelRows = [
    { label: 'Leads', value: (data.emailLeads || []).length + totalUsers, color: '#64748b' },
    { label: 'Signups', value: totalUsers, color: '#0ABFBF' },
    { label: 'Searches', value: (data.searches || []).length, color: '#3b82f6' },
    { label: 'Paid', value: paidCount, color: '#22c55e' },
    { label: 'Tours', value: confirmedTours, color: '#a855f7' },
  ]
  const funnelMax = funnelRows[0].value || 1

  const thStyle = { color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '6px 10px', textAlign: 'left', borderBottom: '1px solid #1e2d45', fontWeight: 600 }
  const tdStyle = { padding: '8px 10px', borderBottom: '1px solid #1e2d45', fontSize: 13 }
  const tdMuted = { ...tdStyle, color: '#64748b' }

  return (
    <div style={s}>
      {/* Header */}
      <div style={{ background: '#0C1628', borderBottom: '1px solid #1e2d45', padding: '14px 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'none', boxShadow: '0 0 6px #22c55e' }} />
          <span style={{ fontFamily: 'Georgia, serif', fontSize: 16, fontWeight: 700 }}>
            Apt<span style={{ color: '#0ABFBF' }}>Pilot</span>
            <span style={{ fontFamily: 'sans-serif', fontWeight: 400, fontSize: 12, color: '#64748b', marginLeft: 8 }}>Ops Dashboard</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#64748b', fontSize: 12 }}>
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : ''}
          </span>
          <button onClick={load} style={{ background: '#1a2235', border: '1px solid #1e2d45', color: '#e2e8f0', padding: '5px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
            ↻ Refresh
          </button>
        </div>
      </div>

      <div style={{ padding: '1.5rem 2rem', maxWidth: 1600, margin: '0 auto' }}>
        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 16 }}>
          <KPI label="Total Users" value={fmt(totalUsers)} sub={`+${usersThisWeek} this week`} accent="#0ABFBF" />
          <KPI label="Paid Users" value={fmt(paidCount)} sub={`${totalUsers - paidCount} free`} accent="#22c55e" />
          <KPI label="Conversion" value={`${convPct}%`} sub="signup → paid" accent="#a855f7" />
          <KPI label="Revenue (Est.)" value={fmtMoney(revenue)} sub="lifetime" accent="#3b82f6" />
          <KPI label="Active Searches" value={fmt((data.searches || []).length)} sub={`${paidCount} paid`} accent="#f59e0b" />
          <KPI label="Listings Found" value={fmt(allListings.length)} accent="#00E5CC" />
          <KPI label="Scrape Jobs" value={fmt(allJobs.length)} sub={`${jobCounts.pending} pending · ${jobCounts.failed} failed`} accent={jobCounts.failed > 0 ? '#ef4444' : '#0ABFBF'} />
          <KPI label="Tours Booked" value={fmt(confirmedTours)} sub="confirmed" accent="#f97316" />
        </div>

        {/* Row 1: Growth + Funnel */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>
          <Card title="User Growth — Last 30 Days" badge={`+${profiles.filter(u => new Date(u.created_at) > new Date(Date.now() - 30*86400000)).length} this month`}>
            <div style={{ position: 'relative', height: 220 }}><canvas ref={growthRef} /></div>
          </Card>
          <Card title="Conversion Funnel">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
              {funnelRows.map(f => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 62, fontSize: 12, color: '#64748b' }}>{f.label}</div>
                  <div style={{ flex: 1, height: 26, background: '#1a2235', borderRadius: 6, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.max(4, f.value / funnelMax * 100)}%`, background: f.color, borderRadius: 6, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#0C1628' }}>{fmt(f.value)}</span>
                    </div>
                  </div>
                  <div style={{ width: 36, textAlign: 'right', fontSize: 12, color: '#64748b' }}>{funnelMax ? Math.round(f.value / funnelMax * 100) : 0}%</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Row 2: Revenue + Health + Neighborhoods */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
          <Card title="Revenue by Plan">
            <div style={{ position: 'relative', height: 175 }}><canvas ref={revenueRef} /></div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 10 }}>
              {Object.entries(tierCounts).map(([tier, count]) => (
                <div key={tier} style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: TIER_COLOR[tier] }}>{count}</div>
                  <div style={{ color: '#64748b', fontSize: 11 }}>{tier}</div>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Scrape & Listing Health">
            <div style={{ marginBottom: 12 }}>
              {[{ key: 'done', color: '#22c55e' }, { key: 'pending', color: '#f59e0b' }, { key: 'running', color: '#3b82f6' }, { key: 'failed', color: '#ef4444' }].map(({ key, color }) => (
                <StatusBar key={key} label={key} count={jobCounts[key]} total={jobTotal} color={color} />
              ))}
            </div>
            <div style={{ color: '#64748b', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, marginTop: 4 }}>Listing Status</div>
            {['new','contacted','touring','passed','closed'].map(s => (
              <StatusBar key={s} label={s} count={listingCounts[s] || 0} total={listingTotal} color={{ new:'#0ABFBF',contacted:'#3b82f6',touring:'#a855f7',passed:'#64748b',closed:'#22c55e' }[s]} />
            ))}
          </Card>
          <Card title="Top Neighborhoods">
            <div style={{ position: 'relative', height: 200 }}><canvas ref={neighborhoodRef} /></div>
          </Card>
        </div>

        {/* Row 3: Recent users + Recent listings */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
          <Card title="Recent Signups" badge="last 15">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th style={thStyle}>Name</th><th style={thStyle}>Email</th><th style={thStyle}>Plan</th><th style={thStyle}>Status</th><th style={thStyle}>Joined</th></tr></thead>
                <tbody>
                  {(data.recentProfiles || []).map(u => (
                    <tr key={u.id} style={{ cursor: 'default' }}>
                      <td style={tdStyle}>{u.full_name || <span style={{ color: '#64748b' }}>—</span>}</td>
                      <td style={tdMuted}>{u.email || '—'}</td>
                      <td style={tdStyle}><Pill val={u.tier} /></td>
                      <td style={tdStyle}><Pill val={u.paid ? 'paid' : 'free'} /></td>
                      <td style={tdMuted}>{timeAgo(u.created_at)}</td>
                    </tr>
                  ))}
                  {!data.recentProfiles?.length && <tr><td colSpan={5} style={{ ...tdMuted, textAlign: 'center', padding: '2rem' }}>No users yet</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>
          <Card title="Recent Listings" badge="last 15">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr><th style={thStyle}>Address</th><th style={thStyle}>Bed/Bath</th><th style={thStyle}>Price</th><th style={thStyle}>Status</th><th style={thStyle}>Found</th></tr></thead>
                <tbody>
                  {(data.recentListings || []).map(l => (
                    <tr key={l.id}>
                      <td style={tdStyle}>{l.address || '—'}</td>
                      <td style={tdMuted}>{l.bedrooms != null ? `${l.bedrooms}br / ${l.bathrooms || '?'}ba` : '—'}</td>
                      <td style={tdStyle}>{l.price ? `$${Number(l.price).toLocaleString()}/mo` : '—'}</td>
                      <td style={tdStyle}><Pill val={l.status || 'new'} /></td>
                      <td style={tdMuted}>{timeAgo(l.created_at)}</td>
                    </tr>
                  ))}
                  {!data.recentListings?.length && <tr><td colSpan={5} style={{ ...tdMuted, textAlign: 'center', padding: '2rem' }}>No listings yet</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Scrape jobs */}
        <Card title="Recent Scrape Jobs" badge="last 25" style={{ marginBottom: 12 }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={thStyle}>Job ID</th><th style={thStyle}>Search ID</th><th style={thStyle}>Status</th><th style={thStyle}>Attempts</th><th style={thStyle}>Last Error</th><th style={thStyle}>Created</th><th style={thStyle}>Updated</th></tr></thead>
              <tbody>
                {(data.recentJobs || []).map(j => (
                  <tr key={j.id}>
                    <td style={{ ...tdMuted, fontFamily: 'monospace', fontSize: 12 }}>{j.id.slice(0, 8)}…</td>
                    <td style={{ ...tdMuted, fontFamily: 'monospace', fontSize: 12 }}>{j.search_id?.slice(0, 8)}…</td>
                    <td style={tdStyle}><Pill val={j.status} /></td>
                    <td style={tdMuted}>{j.attempts}</td>
                    <td style={{ ...tdStyle, color: '#ef4444', fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{j.last_error || <span style={{ color: '#64748b' }}>—</span>}</td>
                    <td style={tdMuted}>{timeAgo(j.created_at)}</td>
                    <td style={tdMuted}>{timeAgo(j.updated_at)}</td>
                  </tr>
                ))}
                {!data.recentJobs?.length && <tr><td colSpan={7} style={{ ...tdMuted, textAlign: 'center', padding: '2rem' }}>No jobs yet</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Email leads */}
        <Card title="Email Leads (Pre-signup)" badge={`${(data.recentLeads || []).length} captured`}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr><th style={thStyle}>Email</th><th style={thStyle}>Captured</th></tr></thead>
              <tbody>
                {(data.recentLeads || []).map(l => (
                  <tr key={l.id}>
                    <td style={tdStyle}>{l.email}</td>
                    <td style={tdMuted}>{timeAgo(l.created_at)}</td>
                  </tr>
                ))}
                {!data.recentLeads?.length && <tr><td colSpan={2} style={{ ...tdMuted, textAlign: 'center', padding: '2rem' }}>No leads yet</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}
