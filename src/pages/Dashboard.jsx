import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useSearchParams, Link } from 'react-router-dom'

const css = `
.dash { max-width:1100px; margin:0 auto; padding:2.5rem 2rem; animation:fadeUp 0.4s ease both; }
.dash-header { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:2rem;flex-wrap:wrap;gap:1rem; }
.dash-header h1 { font-family:'Playfair Display',serif; font-size:2rem; color:var(--navy); }
.dash-header p { color:var(--slate); font-size:0.88rem; margin-top:0.25rem; }
.live-badge { background:#ECFDF5;color:#059669;border:1px solid #A7F3D0;padding:0.4rem 1rem;border-radius:100px;font-size:0.8rem;font-weight:600;display:flex;align-items:center;gap:0.45rem; }
.pulse { width:7px;height:7px;border-radius:50%;background:#059669;animation:pulse 2s infinite; }
.kpi-row { display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:1.75rem; }
@media(max-width:700px){ .kpi-row{grid-template-columns:repeat(2,1fr);} }
.kpi { background:#fff;border-radius:var(--radius);padding:1.25rem;box-shadow:var(--shadow); }
.kpi-label { font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--slate);margin-bottom:0.3rem; }
.kpi-val { font-family:'Playfair Display',serif;font-size:2.1rem;color:var(--navy);line-height:1; }
.kpi-sub { font-size:0.77rem;color:var(--teal);font-weight:600;margin-top:0.3rem; }
.sect-title { font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:var(--slate);margin-bottom:0.75rem; }
.two-col { display:grid;grid-template-columns:1fr 320px;gap:1.5rem; }
@media(max-width:800px){ .two-col{grid-template-columns:1fr;} }
.tour-card { background:#fff;border-radius:var(--radius);padding:1.1rem 1.25rem;box-shadow:var(--shadow);display:flex;align-items:center;gap:1.25rem;margin-bottom:0.75rem;border:1.5px solid transparent;transition:all 0.18s; }
.tour-card:hover { border-color:var(--teal); }
.tour-card.new-listing { animation:highlightIn 1.2s ease; }
@keyframes highlightIn { 0%{background:#E0FFF9;border-color:var(--teal);} 100%{background:#fff;border-color:transparent;} }
.tour-icon { background:var(--navy);color:#fff;border-radius:10px;padding:0.6rem 0.75rem;text-align:center;min-width:52px;flex-shrink:0; }
.tour-addr { font-weight:600;font-size:0.92rem;color:var(--navy); }
.tour-meta { font-size:0.8rem;color:var(--slate);margin-top:0.2rem;display:flex;gap:0.75rem;flex-wrap:wrap; }
.tour-price { font-family:'Playfair Display',serif;font-size:1.15rem;color:var(--teal);text-align:right;flex-shrink:0; }
.tour-price small { font-family:'Inter',sans-serif;font-size:0.72rem;color:var(--slate);display:block; }
.status-pill { padding:0.28rem 0.65rem;border-radius:100px;font-size:0.72rem;font-weight:700;margin-top:0.3rem;display:inline-block; }
.s-pending { background:#FEF3C7;color:#D97706; }
.s-outreach_sent { background:#EFF6FF;color:#2563EB; }
.s-confirmed { background:#ECFDF5;color:#059669; }
.s-declined { background:#FEF2F2;color:#EF4444; }
.tracker-card { background:#fff;border-radius:var(--radius);box-shadow:var(--shadow);padding:1.25rem; }
.tracker-row { display:flex;gap:0.85rem;padding:0.65rem 0;border-bottom:1px solid var(--surface-mid); }
.tracker-row:last-child { border:none; }
.t-dot { width:9px;height:9px;border-radius:50%;margin-top:4px;flex-shrink:0; }
.criteria-card { background:#fff;border-radius:var(--radius);box-shadow:var(--shadow);padding:1.25rem; }
.crit-row { display:flex;justify-content:space-between;padding:0.45rem 0;border-bottom:1px solid var(--surface-mid);font-size:0.85rem; }
.crit-row:last-child { border:none; }
.empty-state { text-align:center;padding:2.5rem;color:var(--slate);font-size:0.9rem;background:#fff;border-radius:var(--radius);box-shadow:var(--shadow); }
.success-banner { background:#ECFDF5;border:1px solid #A7F3D0;border-radius:12px;padding:1rem 1.5rem;margin-bottom:1.5rem;display:flex;align-items:center;gap:0.75rem;color:#065F46;font-size:0.88rem;font-weight:500; }
.onboard-card { background:#fff;border-radius:var(--radius);box-shadow:var(--shadow);padding:1.5rem;margin-bottom:1.75rem; }
.onboard-criteria-row { display:grid;grid-template-columns:1fr 280px;gap:1.25rem;align-items:start;margin-bottom:1.75rem; }
@media(max-width:800px){ .onboard-criteria-row{grid-template-columns:1fr;} }
.onboard-title { font-family:'Playfair Display',serif;font-size:1.1rem;color:var(--navy);margin-bottom:1.1rem; }
.onboard-steps { display:flex;flex-direction:column;gap:0; }
.onboard-step { display:flex;gap:1rem;align-items:flex-start;padding:0.7rem 0;position:relative; }
.onboard-step:not(:last-child)::after { content:'';position:absolute;left:13px;top:36px;bottom:0;width:2px;background:var(--surface-mid); }
.onboard-dot { width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:0.75rem;font-weight:700;z-index:1; }
.onboard-dot.done { background:var(--teal);color:#fff; }
.onboard-dot.active { background:var(--navy);color:#fff;box-shadow:0 0 0 4px rgba(10,191,191,0.15); }
.onboard-dot.pending { background:var(--surface-mid);color:var(--slate); }
.onboard-label { font-weight:600;font-size:0.88rem;color:var(--navy);line-height:1.3; }
.onboard-sublabel { font-size:0.78rem;color:var(--slate);margin-top:0.15rem; }
.rt-toast { position:fixed;bottom:1.5rem;right:1.5rem;background:var(--navy);color:#fff;padding:0.75rem 1.25rem;border-radius:12px;font-size:0.85rem;font-weight:500;box-shadow:var(--shadow-lg);z-index:999;animation:fadeUp 0.3s ease;display:flex;align-items:center;gap:0.6rem; }
.group-members-card { background:#fff;border-radius:var(--radius);box-shadow:var(--shadow);padding:1.25rem;margin-bottom:1.75rem; }
.group-member-row { display:flex;align-items:center;gap:1rem;padding:0.75rem 0;border-bottom:1px solid var(--surface-mid); }
.group-member-row:last-child { border:none; }
.member-avatar { width:36px;height:36px;border-radius:50%;background:var(--navy);color:#fff;font-weight:700;font-size:0.88rem;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
.member-name { font-weight:600;font-size:0.88rem;color:var(--navy); }
.member-email { font-size:0.76rem;color:var(--slate);margin-top:0.1rem; }
.member-tags { display:flex;gap:0.4rem;flex-wrap:wrap;margin-top:0.35rem; }
.member-tag { font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;padding:0.18rem 0.55rem;border-radius:100px; }
.tag-owner { background:var(--teal-pale);color:var(--teal); }
.tag-tenant { background:#EFF6FF;color:#2563EB; }
.tag-guarantor { background:#F5F3FF;color:#7C3AED; }
.tag-complete { background:#ECFDF5;color:#059669; }
.tag-partial { background:#FEF3C7;color:#D97706; }
.tag-incomplete { background:#FEF2F2;color:#EF4444; }
.referral-card { background:linear-gradient(135deg,var(--navy),var(--navy-soft));border-radius:var(--radius);padding:1.25rem;color:#fff; }
.s-apply_requested { background:#F5F3FF;color:#7C3AED; }
.apply-btn { margin-top:0.5rem;display:inline-flex;align-items:center;gap:0.35rem;font-size:0.75rem;font-weight:700;padding:0.3rem 0.75rem;border-radius:100px;border:1.5px solid #7C3AED;background:transparent;color:#7C3AED;cursor:pointer;font-family:inherit;transition:all 0.15s; }
.apply-btn:hover { background:#F5F3FF; }
.apply-btn.sent { border-color:#059669;color:#059669;cursor:default; }
.edit-modal-overlay { position:fixed;inset:0;background:rgba(6,9,15,0.5);backdrop-filter:blur(5px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:1.5rem; }
.edit-modal { background:#fff;border-radius:18px;max-width:440px;width:100%;padding:1.75rem;box-shadow:0 24px 80px rgba(0,0,0,0.2);animation:fadeUp 0.22s ease; }
.edit-modal h3 { font-family:'Playfair Display',serif;font-size:1.2rem;color:var(--navy);margin-bottom:1.1rem; }
.em-field { display:flex;flex-direction:column;gap:0.3rem;margin-bottom:0.85rem; }
.em-field label { font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--slate); }
.em-field input { padding:0.5rem 0.8rem;border:1.5px solid var(--surface-mid);border-radius:8px;font-size:0.88rem;font-family:inherit;color:var(--navy);outline:none;transition:border-color 0.15s; }
.em-field input:focus { border-color:var(--teal); }
.em-row { display:grid;grid-template-columns:1fr 1fr;gap:0.75rem; }
.referral-card h3 { font-family:'Playfair Display',serif;font-size:1rem;margin-bottom:0.35rem; }
.referral-code-box { background:rgba(10,191,191,0.12);border:1.5px solid rgba(10,191,191,0.3);border-radius:8px;padding:0.6rem 0.85rem;font-family:'Inter',monospace;font-size:0.88rem;font-weight:700;color:var(--teal);letter-spacing:0.08em;margin:0.75rem 0;display:flex;justify-content:space-between;align-items:center;cursor:pointer;transition:background 0.15s; }
.referral-code-box:hover { background:rgba(10,191,191,0.2); }
.msg-card { background:#fff;border-radius:var(--radius);box-shadow:var(--shadow);display:flex;flex-direction:column;overflow:hidden;margin-top:1.25rem; }
.msg-thread { flex:1;overflow-y:auto;max-height:260px;padding:1rem;display:flex;flex-direction:column;gap:0.6rem; }
.msg-bubble { max-width:82%;padding:0.55rem 0.85rem;border-radius:14px;font-size:0.84rem;line-height:1.5; }
.msg-bubble.mine { align-self:flex-end;background:var(--navy);color:#fff;border-bottom-right-radius:4px; }
.msg-bubble.theirs { align-self:flex-start;background:var(--surface);color:var(--navy);border-bottom-left-radius:4px; }
.msg-bubble .msg-time { font-size:0.68rem;opacity:0.55;margin-top:0.2rem; }
.msg-input-row { display:flex;gap:0.5rem;padding:0.75rem 1rem;border-top:1px solid var(--surface-mid); }
.msg-input { flex:1;border:1.5px solid var(--surface-mid);border-radius:9px;padding:0.5rem 0.75rem;font-size:0.85rem;font-family:inherit;color:var(--navy);outline:none;transition:border-color 0.15s; }
.msg-input:focus { border-color:var(--teal); }
.msg-send-btn { background:var(--navy);color:#fff;border:none;border-radius:9px;padding:0.5rem 1rem;font-size:0.82rem;font-weight:700;cursor:pointer;font-family:inherit;transition:background 0.15s; }
.msg-send-btn:hover { background:#1a2d4f; }
.msg-send-btn:disabled { opacity:0.5;cursor:not-allowed; }
.msg-unread-dot { width:7px;height:7px;border-radius:50%;background:#EF4444;display:inline-block;margin-left:5px;vertical-align:middle; }
.commute-card { background:#fff;border-radius:var(--radius);box-shadow:var(--shadow);padding:1.25rem;margin-bottom:1.75rem; }
.commute-work-row { display:flex;gap:0.5rem;margin-bottom:0.5rem; }
.commute-work-row input { flex:1;border:1.5px solid var(--surface-mid);border-radius:9px;padding:0.5rem 0.75rem;font-size:0.85rem;font-family:inherit;color:var(--navy);outline:none;transition:border-color 0.15s; }
.commute-work-row input:focus { border-color:var(--teal); }
.commute-work-row button { background:var(--teal);color:#0C1628;border:none;border-radius:9px;padding:0.5rem 0.9rem;font-size:0.8rem;font-weight:700;cursor:pointer;font-family:inherit;white-space:nowrap; }
.commute-hint { font-size:0.75rem;color:var(--slate);margin-bottom:1rem; }
.commute-listing { border-top:1px solid var(--surface-mid);padding:0.75rem 0;font-size:0.82rem; }
.commute-listing:first-child { border-top:none; }
.commute-listing-addr { font-weight:600;color:var(--navy);font-size:0.84rem;margin-bottom:0.5rem; }
.commute-modes { display:flex;flex-wrap:wrap;gap:0.4rem; }
.commute-mode { display:inline-flex;align-items:center;gap:0.3rem;background:#F8FAFB;border:1px solid var(--surface-mid);border-radius:8px;padding:0.3rem 0.55rem;font-size:0.78rem;color:var(--navy);font-weight:600;text-decoration:none;transition:background 0.12s;cursor:pointer; }
.commute-mode:hover { background:var(--teal-pale);border-color:var(--teal); }
.commute-mode span { font-weight:400;color:var(--slate); }
.readiness-card { background:#fff;border-radius:var(--radius);box-shadow:var(--shadow);padding:1.5rem 1.75rem;margin-bottom:1.75rem;display:flex;align-items:center;gap:2rem;flex-wrap:wrap; }
.readiness-ring-wrap { position:relative;flex-shrink:0;width:110px;height:110px; }
.readiness-ring-label { position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center; }
.readiness-ring-pct { font-family:'Playfair Display',serif;font-size:1.65rem;color:var(--navy);line-height:1; }
.readiness-ring-word { font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;margin-top:3px; }
.readiness-body { flex:1;min-width:220px; }
.readiness-title { font-family:'Playfair Display',serif;font-size:1.15rem;color:var(--navy);margin-bottom:0.2rem; }
.readiness-sub { font-size:0.82rem;color:var(--slate);margin-bottom:1rem;line-height:1.5; }
.readiness-factors { display:flex;flex-direction:column;gap:0.45rem; }
.rf { display:flex;align-items:center;gap:0.6rem;font-size:0.83rem; }
.rf-dot { width:8px;height:8px;border-radius:50%;flex-shrink:0; }
.rf-label { color:var(--navy);font-weight:500;flex:1; }
.rf-action { color:var(--teal);font-size:0.76rem;font-weight:600;text-decoration:none;white-space:nowrap; }
.rf-action:hover { text-decoration:underline; }
`

const STATUS_COLORS = {
  pending: '#D97706',
  outreach_sent: '#2563EB',
  confirmed: '#059669',
  declined: '#EF4444',
  apply_requested: '#7C3AED',
}

const ONBOARD_STEPS = [
  { key: 'paid',      label: 'Payment confirmed',       sub: 'Your search is active'              },
  { key: 'docs',      label: 'Documents uploaded',      sub: 'Your package is ready to go'        },
  { key: 'criteria',  label: 'Criteria reviewed',       sub: 'We review your requirements'        },
  { key: 'listings',  label: 'Listings sourced',        sub: 'Matching apartments identified'     },
  { key: 'outreach',  label: 'Agents contacted',        sub: 'Tour requests sent on your behalf'  },
  { key: 'tours',     label: 'Tours confirmed',         sub: 'Sit back — we handle scheduling'    },
]

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [search, setSearch]   = useState(null)
  const [listings, setListings] = useState([])
  const [loading, setLoading]  = useState(true)
  const [toast, setToast]      = useState(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [referrals, setReferrals] = useState(0)
  const [copied, setCopied] = useState(false)
  const [newIds, setNewIds]    = useState(new Set())
  const [docCount, setDocCount] = useState(0)
  const [groupInfo, setGroupInfo] = useState(null)
  const [groupMembers, setGroupMembers] = useState([])
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [showEditCriteria, setShowEditCriteria] = useState(false)
  const [criteriaForm, setCriteriaForm] = useState({})
  const [savingCriteria, setSavingCriteria] = useState(false)
  const [messages, setMessages] = useState([])
  const [msgInput, setMsgInput] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)
  const msgThreadRef = useRef(null)
  const [inviteEmails, setInviteEmails] = useState([''])
  const [inviting, setInviting] = useState(false)
  const [inviteSent, setInviteSent] = useState(false)
  const [searchParams] = useSearchParams()
  const justPaid = searchParams.get('payment') === 'success'
  const channelRef = useRef(null)
  const toastTimer = useRef(null)
  const [workAddress, setWorkAddress] = useState(() => localStorage.getItem('aptpilot_work_addr') || '')
  const [commuteInput, setCommuteInput] = useState('')
  const [commuteResults, setCommuteResults] = useState({})
  const [commuteLoading, setCommuteLoading] = useState({})

  useEffect(() => { if (user) { loadData(); loadReferrals(); loadDocCount(); loadGroup(); loadGroupMembers(); loadMessages() } }, [user])
  useEffect(() => { if (justPaid) setShowGroupModal(true) }, [justPaid])

  async function loadMessages() {
    const { data } = await supabase.from('messages').select('*').eq('user_id', user.id).order('created_at', { ascending: true })
    setMessages(data || [])
    setTimeout(() => { if (msgThreadRef.current) msgThreadRef.current.scrollTop = msgThreadRef.current.scrollHeight }, 50)
  }

  async function sendMessage() {
    const body = msgInput.trim()
    if (!body) return
    setSendingMsg(true)
    setMsgInput('')
    // Optimistically add user message to UI
    const tempMsg = { id: `temp-${Date.now()}`, user_id: user.id, body, from_admin: false, created_at: new Date().toISOString() }
    setMessages(prev => [...prev, tempMsg])
    setTimeout(() => { if (msgThreadRef.current) msgThreadRef.current.scrollTop = msgThreadRef.current.scrollHeight }, 50)
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, message: body, conversationHistory: messages.slice(-10) }),
      })
      const { reply } = await res.json()
      if (reply) {
        const aiMsg = { id: `ai-${Date.now()}`, user_id: user.id, body: reply, from_admin: true, created_at: new Date().toISOString() }
        setMessages(prev => [...prev, aiMsg])
        setTimeout(() => { if (msgThreadRef.current) msgThreadRef.current.scrollTop = msgThreadRef.current.scrollHeight }, 50)
      }
    } catch (e) {
      console.error('AI chat error', e)
    }
    setSendingMsg(false)
  }

  async function saveCriteria() {
    if (!search?.id) return
    setSavingCriteria(true)
    await supabase.from('searches').update({
      min_budget:    criteriaForm.min_budget ? Number(criteriaForm.min_budget) : search.min_budget,
      max_budget:    criteriaForm.max_budget ? Number(criteriaForm.max_budget) : search.max_budget,
      min_bed:       criteriaForm.min_bed    ? Number(criteriaForm.min_bed)    : search.min_bed,
      max_bed:       criteriaForm.max_bed    ? Number(criteriaForm.max_bed)    : search.max_bed,
      move_in:       criteriaForm.move_in    || search.move_in,
      neighborhoods: criteriaForm.neighborhoods || search.neighborhoods,
    }).eq('id', search.id)
    await loadData()
    setSavingCriteria(false)
    setShowEditCriteria(false)
  }

  async function loadGroupMembers() {
    const TENANT_REQUIRED  = ['t1','t2','t3','t4']
    const GUARANTOR_REQUIRED = ['g1','g2','g3','g4','g5']

    function calcStatus(docs, requiredIds, role) {
      const uploaded = docs.filter(d => d.doc_role === role).map(d => d.doc_id)
      const done = requiredIds.filter(id => uploaded.includes(id))
      if (done.length === 0) return { status:'incomplete', uploaded:0, total:requiredIds.length }
      if (done.length < requiredIds.length) return { status:'partial', uploaded:done.length, total:requiredIds.length }
      return { status:'complete', uploaded:done.length, total:requiredIds.length }
    }

    // Try fetching group members first
    const res = await fetch(`/api/group?action=status&userId=${user.id}`)
    if (res.ok) {
      const json = await res.json()
      if (json.members?.length > 0) { setGroupMembers(json.members); return }
    }

    // No group — build a solo self-entry from own docs
    const { data: docs } = await supabase.from('user_documents').select('doc_id, doc_role').eq('user_id', user.id)
    const userDocs = docs || []
    const hasTenant = userDocs.some(d => d.doc_role === 'tenant')
    const hasGuarantor = userDocs.some(d => d.doc_role === 'guarantor')
    setGroupMembers([{
      userId: user.id,
      groupRole: 'owner',
      name: profile?.full_name || user.email,
      email: user.email,
      docRole: hasTenant && hasGuarantor ? 'both' : hasTenant ? 'tenant' : hasGuarantor ? 'guarantor' : null,
      tenant: hasTenant ? calcStatus(userDocs, TENANT_REQUIRED, 'tenant') : null,
      guarantor: hasGuarantor ? calcStatus(userDocs, GUARANTOR_REQUIRED, 'guarantor') : null,
    }])
  }

  async function sendInvites() {
    const validEmails = inviteEmails.map(e => e.trim()).filter(e => e.includes('@'))
    if (!validEmails.length) return
    setInviting(true)
    await fetch('/api/group', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'invite',
        inviterUserId: user.id,
        inviterName: profile?.full_name,
        inviterEmail: user.email,
        emails: validEmails,
      }),
    })
    setInviting(false)
    setInviteSent(true)
  }

  async function loadDocCount() {
    const { count } = await supabase.from('user_documents').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    setDocCount(count || 0)
  }

  async function loadReferrals() {
    const { count } = await supabase.from('referrals').select('*', { count: 'exact', head: true }).eq('referrer_id', user.id)
    setReferrals(count || 0)
  }

  async function loadGroup() {
    const { data: membership } = await supabase
      .from('group_members').select('group_id, role, groups(owner_id)').eq('user_id', user.id).single()
    if (!membership) return
    const role = membership.role
    const ownerId = membership.groups?.owner_id
    if (role === 'member' && ownerId) {
      const { data: ownerProfile } = await supabase.from('profiles').select('full_name').eq('id', ownerId).single()
      setGroupInfo({ id: membership.group_id, role, ownerId, ownerName: ownerProfile?.full_name || 'your group owner' })
    } else {
      setGroupInfo({ id: membership.group_id, role, ownerId: user.id })
    }
  }

  async function fetchCommute(listingId, listingAddress) {
    if (!workAddress) return
    setCommuteLoading(prev => ({ ...prev, [listingId]: true }))
    try {
      const res = await fetch('/api/commute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: listingAddress, to: workAddress }),
      })
      const data = await res.json()
      setCommuteResults(prev => ({ ...prev, [listingId]: data }))
    } catch {
      setCommuteResults(prev => ({ ...prev, [listingId]: { error: 'Could not calculate' } }))
    }
    setCommuteLoading(prev => ({ ...prev, [listingId]: false }))
  }

  async function saveWorkAddress() {
    const addr = commuteInput.trim()
    if (!addr) return
    localStorage.setItem('aptpilot_work_addr', addr)
    setWorkAddress(addr)
    setCommuteResults({})
  }

  async function loadData() {
    setLoading(true)
    // Group members share the owner's search
    const { data: membership } = await supabase
      .from('group_members').select('role, groups(owner_id)').eq('user_id', user.id).single()
    const searchUserId = (membership?.role === 'member' && membership.groups?.owner_id)
      ? membership.groups.owner_id
      : user.id
    const { data: searchData } = await supabase
      .from('searches').select('*').eq('user_id', searchUserId)
      .order('created_at', { ascending: false }).limit(1).single()
    setSearch(searchData)

    if (searchData) {
      const { data: listingData } = await supabase
        .from('listings').select('*').eq('search_id', searchData.id)
        .order('created_at', { ascending: false })
      setListings(listingData || [])
      subscribeToListings(searchData.id)
    }
    setLoading(false)
  }

  function subscribeToListings(searchId) {
    if (channelRef.current) supabase.removeChannel(channelRef.current)
    channelRef.current = supabase
      .channel(`listings:${searchId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'listings',
        filter: `search_id=eq.${searchId}`,
      }, (payload) => {
        setListings(prev => [payload.new, ...prev])
        setNewIds(prev => new Set([...prev, payload.new.id]))
        showToast(`New listing added: ${payload.new.address}`)
        setTimeout(() => setNewIds(prev => { const s = new Set(prev); s.delete(payload.new.id); return s }), 2000)
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'listings',
        filter: `search_id=eq.${searchId}`,
      }, (payload) => {
        setListings(prev => prev.map(l => l.id === payload.new.id ? payload.new : l))
        if (payload.new.status === 'confirmed') showToast(`Tour confirmed: ${payload.new.address}`)
        if (payload.new.status === 'outreach_sent') showToast(`Agent contacted: ${payload.new.address}`)
      })
      .subscribe()
  }

  function showToast(msg) {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => () => {
    if (channelRef.current) supabase.removeChannel(channelRef.current)
    clearTimeout(toastTimer.current)
  }, [])

  const firstName = profile?.full_name?.split(' ')[0] || user?.user_metadata?.full_name?.split(' ')[0] || 'there'
  const confirmedTours = listings.filter(l => l.status === 'confirmed')
  const sentOutreach   = listings.filter(l => l.status === 'outreach_sent')

  // Onboarding progress
  const onboardStatus = {
    paid:     true,
    criteria: listings.length > 0 || sentOutreach.length > 0,
    docs:     docCount > 0,
    listings: listings.length > 0,
    outreach: sentOutreach.length > 0 || confirmedTours.length > 0,
    tours:    confirmedTours.length > 0,
  }
  const showOnboard = listings.length === 0

  // Readiness score
  const myMember = groupMembers.find(m => m.userId === user?.id)
  const tenantComplete   = myMember?.tenant?.status === 'complete'
  const tenantPartial    = myMember?.tenant?.status === 'partial'
  const guarantorComplete = myMember?.guarantor?.status === 'complete'
  const needsGuarantor   = !!myMember?.guarantor

  const rfFactors = [
    { key: 'criteria',   label: 'Search criteria set',       done: !!search,          pts: 20, action: null },
    { key: 'docs_any',   label: 'Documents started',         done: docCount > 0,      pts: 15, action: '/documents', actionLabel: 'Upload docs →' },
    { key: 'tenant',     label: 'Tenant docs complete',      done: tenantComplete,    pts: 30, action: '/documents', actionLabel: tenantPartial ? 'Finish uploading →' : 'Upload docs →' },
    { key: 'profile',    label: 'Profile name on file',      done: !!(profile?.full_name), pts: 15, action: null },
    { key: 'guarantor',  label: needsGuarantor ? 'Guarantor docs complete' : 'Guarantor (not required)', done: needsGuarantor ? guarantorComplete : true, pts: 20, action: needsGuarantor && !guarantorComplete ? '/documents' : null, actionLabel: 'Upload guarantor docs →' },
  ]
  const readinessScore = rfFactors.reduce((sum, f) => sum + (f.done ? f.pts : 0), 0)
  const readinessWord  = readinessScore >= 90 ? 'Ready' : readinessScore >= 60 ? 'Almost' : readinessScore >= 30 ? 'Started' : 'Early'
  const readinessColor = readinessScore >= 90 ? '#059669' : readinessScore >= 60 ? '#0ABFBF' : readinessScore >= 30 ? '#D97706' : '#94A3B8'
  const RING_R = 46; const RING_C = 2 * Math.PI * RING_R
  const ringDash = (readinessScore / 100) * RING_C

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <>
      <style>{css}</style>

      {/* Group invite modal */}
      {showGroupModal && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(6,9,15,0.6)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' }}>
          <div style={{ background:'#fff', borderRadius:20, maxWidth:460, width:'100%', padding:'2rem', boxShadow:'0 24px 80px rgba(0,0,0,0.25)', animation:'fadeUp 0.3s ease' }}>
            {!inviteSent ? (
              <>
                <div style={{ width:48, height:48, borderRadius:13, background:'var(--teal-pale)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1rem' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.45rem', color:'var(--navy)', marginBottom:'0.4rem' }}>Applying with others?</h2>
                <p style={{ color:'var(--slate)', fontSize:'0.87rem', lineHeight:1.6, marginBottom:'1.4rem' }}>
                  Invite roommates or guarantors to join your group. They'll be able to view all your listings, tours, and search activity — no extra payment needed.
                </p>
                <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', marginBottom:'1rem' }}>
                  {inviteEmails.map((email, i) => (
                    <div key={i} style={{ display:'flex', gap:'0.5rem' }}>
                      <input
                        type="email"
                        placeholder={`Email address ${i + 1}`}
                        value={email}
                        onChange={e => setInviteEmails(arr => arr.map((v, j) => j === i ? e.target.value : v))}
                        style={{ flex:1, padding:'0.6rem 0.85rem', border:'1.5px solid var(--surface-mid)', borderRadius:9, fontSize:'0.87rem', fontFamily:'inherit', color:'var(--navy)', outline:'none' }}
                      />
                      {inviteEmails.length > 1 && (
                        <button onClick={() => setInviteEmails(arr => arr.filter((_, j) => j !== i))} style={{ background:'none', border:'none', color:'#94A3B8', cursor:'pointer', fontSize:'1rem', padding:'0 0.25rem' }}>✕</button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setInviteEmails(arr => [...arr, ''])} style={{ alignSelf:'flex-start', background:'none', border:'none', color:'var(--teal)', fontSize:'0.82rem', fontWeight:600, cursor:'pointer', padding:0, fontFamily:'inherit' }}>
                    + Add another person
                  </button>
                </div>
                <div style={{ display:'flex', gap:'0.75rem' }}>
                  <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={sendInvites} disabled={inviting}>
                    {inviting ? <span className="spinner" /> : 'Send Invites'}
                  </button>
                  <button className="btn btn-outline" onClick={() => setShowGroupModal(false)}>
                    Skip
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign:'center' }}>
                <div style={{ width:52, height:52, borderRadius:14, background:'#ECFDF5', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.45rem', color:'var(--navy)', marginBottom:'0.4rem' }}>Invites sent!</h2>
                <p style={{ color:'var(--slate)', fontSize:'0.87rem', lineHeight:1.6, marginBottom:'1.4rem' }}>
                  They'll receive an email with a link to join your group and view the search.
                </p>
                <button className="btn btn-primary" style={{ margin:'0 auto', justifyContent:'center' }} onClick={() => setShowGroupModal(false)}>
                  Go to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showEditCriteria && (
        <div className="edit-modal-overlay" onClick={e => e.target === e.currentTarget && setShowEditCriteria(false)}>
          <div className="edit-modal">
            <h3>Edit Search Criteria</h3>
            <div className="em-row">
              <div className="em-field">
                <label>Min Budget</label>
                <input type="number" placeholder={search?.min_budget} defaultValue={search?.min_budget} onChange={e => setCriteriaForm(f => ({ ...f, min_budget: e.target.value }))} />
              </div>
              <div className="em-field">
                <label>Max Budget</label>
                <input type="number" placeholder={search?.max_budget} defaultValue={search?.max_budget} onChange={e => setCriteriaForm(f => ({ ...f, max_budget: e.target.value }))} />
              </div>
            </div>
            <div className="em-row">
              <div className="em-field">
                <label>Min Beds</label>
                <input type="number" placeholder={search?.min_bed} defaultValue={search?.min_bed} onChange={e => setCriteriaForm(f => ({ ...f, min_bed: e.target.value }))} />
              </div>
              <div className="em-field">
                <label>Max Beds</label>
                <input type="number" placeholder={search?.max_bed} defaultValue={search?.max_bed} onChange={e => setCriteriaForm(f => ({ ...f, max_bed: e.target.value }))} />
              </div>
            </div>
            <div className="em-field">
              <label>Move-In Date</label>
              <input type="date" defaultValue={search?.move_in} onChange={e => setCriteriaForm(f => ({ ...f, move_in: e.target.value }))} />
            </div>
            <div className="em-field">
              <label>Neighborhoods (comma separated)</label>
              <input placeholder="Williamsburg, Astoria..." defaultValue={(search?.neighborhoods || []).join(', ')} onChange={e => setCriteriaForm(f => ({ ...f, neighborhoods: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} />
            </div>
            <div style={{ display:'flex', gap:'0.75rem', marginTop:'0.25rem' }}>
              <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={saveCriteria} disabled={savingCriteria}>
                {savingCriteria ? <span className="spinner" /> : 'Save Changes'}
              </button>
              <button className="btn btn-outline" onClick={() => setShowEditCriteria(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="dash">

        {toast && (
          <div className="rt-toast">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {toast}
          </div>
        )}

        {justPaid && (
          <div className="success-banner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}><polyline points="20 6 9 17 4 12"/></svg>
            <span>Payment confirmed — check your email for a summary of what happens next. We're already on it.</span>
          </div>
        )}

        {groupInfo?.role === 'member' && (
          <div style={{ background:'var(--teal-pale)', border:'1.5px solid rgba(10,191,191,0.3)', borderRadius:12, padding:'0.85rem 1.25rem', marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'0.75rem', fontSize:'0.86rem', color:'var(--navy)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>You're viewing <strong>{groupInfo.ownerName}'s</strong> group search.</span>
          </div>
        )}

        {groupInfo?.role === 'owner' && (
          <div style={{ background:'#fff', border:'1.5px solid var(--surface-mid)', borderRadius:12, padding:'0.85rem 1.25rem', marginBottom:'1.25rem', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem', fontSize:'0.86rem', color:'var(--navy)', flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.65rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <span>You have a group. Invite more people to share this search.</span>
            </div>
            <button className="btn btn-outline" style={{ fontSize:'0.8rem', padding:'0.35rem 0.85rem' }} onClick={() => { setInviteSent(false); setInviteEmails(['']); setShowGroupModal(true) }}>
              + Invite
            </button>
          </div>
        )}

        <div className="dash-header">
          <div>
            <h1>{greeting}, {firstName}.</h1>
            <p>
              {listings.length === 0
                ? "We're finding apartments that match your criteria — your tour agenda will appear here shortly."
                : `${listings.length} apartments found · ${confirmedTours.length} tours confirmed · ${sentOutreach.length} awaiting agent response`
              }
            </p>
          </div>
          <div style={{ display:'flex', gap:'0.75rem', alignItems:'center', flexWrap:'wrap' }}>
            <div className="live-badge"><div className="pulse" />Live</div>
            <button
              onClick={async () => {
                setPortalLoading(true)
                const res = await fetch('/api/customer-portal', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ userId: user.id }) })
                const { url, error } = await res.json()
                setPortalLoading(false)
                if (url) window.location.href = url
                else showToast(error || 'Could not open billing portal')
              }}
              disabled={portalLoading}
              style={{ fontSize:'0.78rem', color:'var(--slate)', background:'transparent', border:'1px solid var(--surface-mid)', borderRadius:100, padding:'0.35rem 0.85rem', cursor:'pointer', fontFamily:'inherit' }}
            >
              {portalLoading ? '...' : 'Billing →'}
            </button>
          </div>
        </div>

        {/* Readiness Score */}
        <div className="readiness-card">
          <div className="readiness-ring-wrap">
            <svg width="110" height="110" viewBox="0 0 110 110">
              <circle cx="55" cy="55" r={RING_R} fill="none" stroke="#F1F5F9" strokeWidth="8" />
              <circle cx="55" cy="55" r={RING_R} fill="none" stroke={readinessColor} strokeWidth="8"
                strokeDasharray={`${ringDash} ${RING_C}`}
                strokeLinecap="round"
                transform="rotate(-90 55 55)"
                style={{ transition: 'stroke-dasharray 0.6s ease' }}
              />
            </svg>
            <div className="readiness-ring-label">
              <span className="readiness-ring-pct">{readinessScore}%</span>
              <span className="readiness-ring-word" style={{ color: readinessColor }}>{readinessWord}</span>
            </div>
          </div>
          <div className="readiness-body">
            <div className="readiness-title">Application Readiness</div>
            <div className="readiness-sub">
              {readinessScore === 100
                ? 'You\'re fully prepared — any NYC landlord can receive your application today.'
                : 'Complete the steps below to be ready the moment you find the right apartment.'}
            </div>
            <div className="readiness-factors">
              {rfFactors.map(f => (
                <div className="rf" key={f.key}>
                  <div className="rf-dot" style={{ background: f.done ? '#059669' : '#E2E8F0' }} />
                  <span className="rf-label" style={{ color: f.done ? 'var(--navy)' : 'var(--slate)', textDecoration: f.done ? 'none' : 'none' }}>
                    {f.label}
                  </span>
                  {!f.done && f.action && (
                    <Link to={f.action} className="rf-action">{f.actionLabel}</Link>
                  )}
                  {f.done && (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="onboard-criteria-row">
          {showOnboard && (
            <div className="onboard-card" style={{ marginBottom:0 }}>
              <div className="onboard-title">What's happening with your search</div>
              <div className="onboard-steps">
                {ONBOARD_STEPS.map((s, i) => {
                  const done   = onboardStatus[s.key]
                  const active = !done && (i === 0 || onboardStatus[ONBOARD_STEPS[i-1]?.key])
                  return (
                    <div className="onboard-step" key={s.key}>
                      <div className={`onboard-dot ${done ? 'done' : active ? 'active' : 'pending'}`}>
                        {done
                          ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          : i + 1
                        }
                      </div>
                      <div style={{ paddingTop:4 }}>
                        <div className="onboard-label" style={{ color: done ? 'var(--teal)' : active ? 'var(--navy)' : 'var(--slate)' }}>{s.label}</div>
                        <div className="onboard-sublabel">{s.sub}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem' }}>
              <div className="sect-title" style={{ margin:0 }}>Your Criteria</div>
              <button onClick={() => { setCriteriaForm({}); setShowEditCriteria(true) }} style={{ fontSize:'0.75rem', fontWeight:600, color:'var(--teal)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', padding:0 }}>Edit →</button>
            </div>
            <div className="criteria-card">
              {[
                ['Budget',        search ? `$${search.min_budget || '?'} – $${search.max_budget || '?'}/mo` : '—'],
                ['Bedrooms',      search ? `${search.min_bed} – ${search.max_bed} bed` : '—'],
                ['Move-In',       search?.move_in || 'ASAP'],
                ['Neighborhoods', (search?.neighborhoods || []).slice(0,2).join(', ') || '—'],
                ['Plan',          search?.tier === 'pro' ? 'Pro ($499)' : search?.tier === 'standard' ? 'Standard ($299)' : 'Core ($399)'],
                ['Chauffeur',     search?.chauffeur ? 'Yes' : 'No'],
              ].map(([k, v]) => (
                <div className="crit-row" key={k}>
                  <span style={{ color:'var(--slate)' }}>{k}</span>
                  <span style={{ fontWeight:600 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {groupMembers.length > 0 && (
          <div className="group-members-card">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.5rem' }}>
              <div className="onboard-title" style={{ margin:0 }}>{groupMembers.length > 1 ? 'Group Members' : 'My Profile'}</div>
              <button className="btn btn-outline" style={{ fontSize:'0.78rem', padding:'0.3rem 0.8rem' }} onClick={() => { setInviteSent(false); setInviteEmails(['']); setShowGroupModal(true) }}>
                + Invite
              </button>
            </div>
            {groupMembers.map(m => {
              const initials = m.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
              const docRoles = m.docRole === 'both' ? ['tenant','guarantor'] : m.docRole ? [m.docRole] : []

              function statusTag(info) {
                if (!info) return null
                if (info.status === 'complete') return <span className="member-tag tag-complete">Docs Complete</span>
                if (info.status === 'partial') return <span className="member-tag tag-partial">Partial ({info.uploaded}/{info.total})</span>
                return <span className="member-tag tag-incomplete">Docs Incomplete</span>
              }

              return (
                <div className="group-member-row" key={m.userId}>
                  <div className="member-avatar">{initials || '?'}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div className="member-name">{m.name}{m.userId === user.id ? ' (you)' : ''}</div>
                    <div className="member-email">{m.email}</div>
                    <div className="member-tags">
                      {m.groupRole === 'owner' && <span className="member-tag tag-owner">Owner</span>}
                      {docRoles.includes('tenant') && <span className="member-tag tag-tenant">Tenant</span>}
                      {docRoles.includes('guarantor') && <span className="member-tag tag-guarantor">Guarantor</span>}
                      {!m.docRole && <span className="member-tag tag-incomplete">No docs yet</span>}
                      {statusTag(m.tenant)}
                      {m.docRole === 'both' && statusTag(m.guarantor)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="kpi-row">
          {[
            { label:'Listings Found',   val: listings.length || '—',        sub: listings.length > 0 ? 'matching your criteria' : 'search in progress' },
            { label:'Tours Confirmed',  val: confirmedTours.length || '—',  sub: confirmedTours.length > 0 ? 'ready to visit' : 'awaiting responses' },
            { label:'Outreach Sent',    val: sentOutreach.length || '—',    sub: 'agents contacted' },
            { label:'You Saved',        val: search ? '$' + Math.round((search.max_budget || 4000) * 1.08).toLocaleString() : '—', sub: 'vs. broker fee' },
          ].map(k => (
            <div className="kpi" key={k.label}>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-val">{k.val}</div>
              <div className="kpi-sub">{k.sub}</div>
            </div>
          ))}
        </div>

        <div className="commute-card">
          <div className="sect-title">Commute Calculator</div>
          <div className="commute-work-row">
            <input
              placeholder="Enter your work address (e.g. 30 Rockefeller Plaza, New York)…"
              defaultValue={workAddress}
              onChange={e => setCommuteInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveWorkAddress()}
            />
            <button onClick={saveWorkAddress}>Set</button>
          </div>
          {workAddress
            ? <p className="commute-hint">Door-to-door estimates from each listing to <strong>{workAddress}</strong>. Click any mode to open directions in Google Maps.</p>
            : <p className="commute-hint">Set your work address to see door-to-door commute times from every listing — subway, bike, walk, drive, and bus.</p>
          }
          {workAddress && listings.length > 0 && listings.map(l => {
            const addr = `${l.address}${l.unit ? `, ${l.unit}` : ''}`
            const result = commuteResults[l.id]
            const isLoading = commuteLoading[l.id]
            return (
              <div className="commute-listing" key={l.id}>
                <div className="commute-listing-addr">{addr}</div>
                {!result && !isLoading && (
                  <button className="commute-mode" onClick={() => fetchCommute(l.id, addr)}>Calculate →</button>
                )}
                {isLoading && <span style={{ fontSize:'0.78rem', color:'var(--slate)' }}>Calculating…</span>}
                {result?.error && <span style={{ fontSize:'0.78rem', color:'#EF4444' }}>{result.error}</span>}
                {result?.modes && (
                  <div className="commute-modes">
                    {result.modes.map(m => (
                      <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer" className="commute-mode">
                        {m.emoji} {m.label} <span>~{m.minutes} min</span>
                      </a>
                    ))}
                    <span style={{ fontSize:'0.73rem', color:'var(--slate)', alignSelf:'center', marginLeft:'0.25rem' }}>
                      {result.distanceMiles} mi
                    </span>
                  </div>
                )}
              </div>
            )
          })}
          {workAddress && listings.length === 0 && (
            <p style={{ fontSize:'0.82rem', color:'var(--slate)' }}>Commute times will appear here once listings are added to your search.</p>
          )}
        </div>

        <div className="two-col">
          <div>
            <div className="sect-title">Your Apartments</div>
            {loading ? (
              <div className="empty-state">Loading your listings...</div>
            ) : listings.length === 0 ? (
              <div className="empty-state">
                <div style={{ marginBottom:'0.75rem' }}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--slate)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
                <strong>We're on it.</strong>
                <p style={{ marginTop:'0.4rem', color:'var(--slate)' }}>Our team is searching listings that match your criteria right now. Your apartments will appear here within a few hours.</p>
              </div>
            ) : (
              listings.map(l => (
                <div className={`tour-card${newIds.has(l.id) ? ' new-listing' : ''}`} key={l.id}>
                  <div className="tour-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  </div>
                  <div style={{ flex:1 }}>
                    <div className="tour-addr">{l.address}{l.unit ? `, ${l.unit}` : ''}</div>
                    <div className="tour-meta">
                      {l.bedrooms && <span>{l.bedrooms} bd</span>}
                      {l.bathrooms && <span>{l.bathrooms} ba</span>}
                      {l.sqft && <span>{l.sqft} sf</span>}
                      {l.agent_name && <span>{l.agent_name}</span>}
                    </div>
                    <div style={{ marginTop:'0.35rem' }}>
                      <span className={`status-pill s-${l.status}`}>
                        {l.status === 'pending'          ? 'Finding tour time'  :
                         l.status === 'outreach_sent'    ? 'Agent contacted'    :
                         l.status === 'confirmed'        ? 'Tour confirmed'     :
                         l.status === 'declined'         ? 'Not available'      :
                         l.status === 'apply_requested'  ? 'Apply requested'    : l.status}
                      </span>
                      {l.listing_url && (
                        <a href={l.listing_url} target="_blank" rel="noopener noreferrer"
                           style={{ marginLeft:'0.5rem', fontSize:'0.75rem', color:'var(--teal)' }}>
                          View listing →
                        </a>
                      )}
                    </div>
                    {l.notes && l.status === 'confirmed' && (
                      <div style={{ marginTop:'0.4rem', fontSize:'0.78rem', color:'var(--slate)', background:'#F8FAFB', borderRadius:6, padding:'0.35rem 0.6rem' }}>
                        📅 {l.notes}
                      </div>
                    )}
                    {(l.status === 'confirmed' || l.status === 'outreach_sent') && l.status !== 'apply_requested' && (
                      <button
                        className={`apply-btn${l.status === 'apply_requested' ? ' sent' : ''}`}
                        onClick={async () => {
                          await supabase.from('listings').update({ status: 'apply_requested' }).eq('id', l.id)
                          setListings(prev => prev.map(x => x.id === l.id ? { ...x, status: 'apply_requested' } : x))
                          showToast(`Apply request sent for ${l.address}`)
                        }}
                      >
                        ✦ I want to apply for this one
                      </button>
                    )}
                    {l.status === 'apply_requested' && (
                      <div style={{ marginTop:'0.4rem', fontSize:'0.78rem', color:'#7C3AED', fontWeight:600 }}>
                        ✓ Apply request sent — we'll be in touch
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div className="tour-price">{l.price ? `$${l.price.toLocaleString()}` : '—'}<small>/month</small></div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            <div>
              <div className="sect-title">Status Tracker</div>
              <div className="tracker-card">
                {listings.length === 0 ? (
                  <p style={{ color:'var(--slate)', fontSize:'0.85rem', padding:'0.5rem 0' }}>Listings will appear here once found.</p>
                ) : listings.map(l => (
                  <div className="tracker-row" key={l.id}>
                    <div className="t-dot" style={{ background: STATUS_COLORS[l.status] || '#94A3B8' }} />
                    <div>
                      <div style={{ fontWeight:600, fontSize:'0.85rem', color:'var(--navy)' }}>{l.address}{l.unit ? `, ${l.unit}` : ''}</div>
                      <div style={{ fontSize:'0.77rem', color:'var(--slate)', marginTop:'0.15rem' }}>
                        {l.status === 'pending'       ? 'Searching for tour availability' :
                         l.status === 'outreach_sent' ? 'Tour request sent to agent'      :
                         l.status === 'confirmed'        ? 'Tour confirmed'                  :
                         l.status === 'declined'         ? 'Listing not available'           :
                         l.status === 'apply_requested'  ? 'Apply request sent to team'      : l.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {profile?.referral_code && (
              <div>
                <div className="sect-title">Refer a Friend</div>
                <div className="referral-card">
                  <h3>Share AptPilot</h3>
                  <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.8rem', lineHeight:1.55 }}>Share your link. Every friend you refer helps us grow — and we appreciate it.</p>
                  <div className="referral-code-box" onClick={() => {
                    navigator.clipboard.writeText(`https://aptpilot.vercel.app/signup?ref=${profile.referral_code}`)
                    setCopied(true); setTimeout(() => setCopied(false), 2000)
                  }}>
                    <span>aptpilot.vercel.app/signup?ref={profile.referral_code}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  </div>
                  {copied && <p style={{ color:'var(--teal)', fontSize:'0.78rem', marginBottom:'0.5rem' }}>Copied to clipboard!</p>}
                  <p style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.76rem' }}>{referrals} {referrals === 1 ? 'person' : 'people'} referred</p>
                </div>
              </div>
            )}

            <div>
              <div className="sect-title">Messages</div>
              <div className="msg-card">
                <div className="msg-thread" ref={msgThreadRef}>
                  {messages.length === 0
                    ? <p style={{ color:'var(--slate)', fontSize:'0.82rem', textAlign:'center', margin:'auto' }}>No messages yet — send us a note and we'll get back to you.</p>
                    : messages.map(m => (
                      <div key={m.id} className={`msg-bubble ${m.from_admin ? 'theirs' : 'mine'}`}>
                        {m.body}
                        <div className="msg-time">{new Date(m.created_at).toLocaleString('en-US', { month:'short', day:'numeric', hour:'numeric', minute:'2-digit' })}</div>
                      </div>
                    ))
                  }
                </div>
                <div className="msg-input-row">
                  <input
                    className="msg-input"
                    placeholder="Message AptPilot..."
                    value={msgInput}
                    onChange={e => setMsgInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  />
                  <button className="msg-send-btn" onClick={sendMessage} disabled={sendingMsg || !msgInput.trim()}>Send</button>
                </div>
              </div>
            </div>

            <div>
              <div className="sect-title">My Documents</div>
              <Link to="/documents" style={{ textDecoration:'none' }}>
                <div style={{ background:'#fff', borderRadius:'var(--radius)', boxShadow:'var(--shadow)', padding:'1rem 1.25rem', display:'flex', alignItems:'center', gap:'0.85rem', border:'1.5px solid transparent', transition:'border-color 0.15s', cursor:'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='var(--teal)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor='transparent'}
                >
                  <div style={{ width:36, height:36, borderRadius:9, background:'var(--teal-pale)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:'0.88rem', color:'var(--navy)' }}>View & Download Files</div>
                    <div style={{ fontSize:'0.78rem', color:'var(--slate)', marginTop:'0.1rem' }}>Individual files + collated PDF package</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--slate)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                </div>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
