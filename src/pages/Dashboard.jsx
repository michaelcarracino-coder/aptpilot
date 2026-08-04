import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useSearchParams, Link } from 'react-router-dom'
import NeighborhoodPicker, { BOROUGH_NEIGHBORHOODS } from '../components/NeighborhoodPicker'

function fmtDate(d) {
  if (!d) return null
  const [y, m, day] = d.split('-')
  return `${m}/${day}/${y.slice(2)}`
}

const AMENITIES = ['Doorman','Virtual Doorman','Concierge','Elevator','In-Unit Washer/Dryer','Laundry in Building','Dishwasher','Central A/C','Gym / Fitness Center','Roof Deck','Terrace / Balcony','Outdoor Space','Storage','Bike Room','Parking / Garage','Pool','Pets OK — Dogs','Pets OK — Cats','Furnished','Flexible Lease']

const css = `
.dash { max-width:1400px; margin:0 auto; padding:2.5rem 1rem; animation:fadeUp 0.4s ease both; }
.dash-main { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; align-items:start; }
@media(max-width:900px){ .dash-main{grid-template-columns:1fr;} }
.dash-header { display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:2rem;flex-wrap:wrap;gap:1rem; }
.dash-header h1 { font-family:'Fraunces', Georgia, serif; font-size:2rem; color:var(--navy); }
.dash-header p { color:var(--slate); font-size:0.88rem; margin-top:0.25rem; }
.live-badge { background:var(--paper-deep);color:var(--text-muted);border:1px solid var(--line);padding:0.4rem 1rem;border-radius:100px;font-size:0.8rem;font-weight:600;display:flex;align-items:center;gap:0.45rem; }
.pulse { width:7px;height:7px;border-radius:50%;background:var(--clay);animation:pulse 2s infinite; }
.kpi-row { display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:1.75rem; }
@media(max-width:700px){ .kpi-row{grid-template-columns:repeat(2,1fr);} }
.kpi { background:#fff;border-radius:var(--radius);padding:1.25rem;box-shadow:var(--shadow); }
.kpi-label { font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--slate);margin-bottom:0.3rem; }
.kpi-val { font-family:'Fraunces', Georgia, serif;font-size:2.1rem;color:var(--navy);line-height:1; }
.kpi-sub { font-size:0.77rem;color:var(--teal);font-weight:600;margin-top:0.3rem; }
.sect-title { font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:var(--slate);margin-bottom:0.75rem; }
.two-col { display:grid;grid-template-columns:1fr 320px;gap:1.5rem; }
@media(max-width:800px){ .two-col{grid-template-columns:1fr;} }
.tour-card { background:#fff;border-radius:var(--radius);padding:1.1rem 1.25rem;box-shadow:var(--shadow);display:flex;align-items:center;gap:1.25rem;margin-bottom:0.75rem;border:1.5px solid transparent;transition:all 0.18s; }
.tour-card:hover { border-color:var(--teal); }
.tour-card.new-listing { animation:highlightIn 1.2s ease; }
@keyframes highlightIn { 0%{background:var(--clay-pale);border-color:var(--teal);} 100%{background:#fff;border-color:transparent;} }
.tour-icon { background:var(--navy);color:#fff;border-radius:var(--radius-lg);padding:0.6rem 0.75rem;text-align:center;min-width:52px;flex-shrink:0; }
.tour-addr { font-weight:600;font-size:0.92rem;color:var(--navy); }
.tour-meta { font-size:0.8rem;color:var(--slate);margin-top:0.2rem;display:flex;gap:0.75rem;flex-wrap:wrap; }
.tour-price { font-family:'Fraunces', Georgia, serif;font-size:1.15rem;color:var(--teal);text-align:right;flex-shrink:0; }
.tour-price small { font-family:'Fraunces', Georgia, serif;font-size:0.72rem;color:var(--slate);display:block; }
.status-pill { padding:0.28rem 0.65rem;border-radius:100px;font-size:0.72rem;font-weight:700;margin-top:0.3rem;display:inline-block; }
.s-pending { background:var(--clay-pale);color:var(--clay-dark); }
.s-outreach_sent { background:var(--moss-pale);color:var(--moss); }
.s-confirmed { background:rgba(30,61,51,0.08);color:var(--forest); }
.s-declined { background:var(--rust-pale);color:var(--rust); }
.tracker-card { background:#fff;border-radius:var(--radius);box-shadow:var(--shadow);padding:1.25rem; }
.tracker-row { display:flex;gap:0.85rem;padding:0.65rem 0;border-bottom:1px solid var(--surface-mid); }
.tracker-row:last-child { border:none; }
.t-dot { width:9px;height:9px;border-radius:50%;margin-top:4px;flex-shrink:0; }
.criteria-card { background:#fff;border-radius:var(--radius);box-shadow:var(--shadow);padding:1.25rem; }
.crit-row { display:flex;justify-content:space-between;padding:0.45rem 0;border-bottom:1px solid var(--surface-mid);font-size:0.85rem; }
.crit-row:last-child { border:none; }
.empty-state { text-align:center;padding:2.5rem;color:var(--slate);font-size:0.9rem;background:#fff;border-radius:var(--radius);box-shadow:var(--shadow); }
.success-banner { background:rgba(30,61,51,0.06);border:1px solid rgba(30,61,51,0.18);border-radius:var(--radius-xl);padding:1rem 1.5rem;margin-bottom:1.5rem;display:flex;align-items:center;gap:0.75rem;color:var(--forest);font-size:0.88rem;font-weight:500; }
.onboard-card { background:#fff;border-radius:var(--radius);box-shadow:var(--shadow);padding:1.5rem;margin-bottom:1.75rem; }
.onboard-criteria-row { display:grid;grid-template-columns:1fr;gap:1.25rem;align-items:start;margin-bottom:1.75rem; }
.onboard-title { font-family:'Fraunces', Georgia, serif;font-size:1.1rem;color:var(--navy);margin-bottom:1.1rem; }
.onboard-steps { display:flex;flex-direction:column;gap:0; }
.onboard-step { display:flex;gap:1rem;align-items:flex-start;padding:0.7rem 0;position:relative; }
.onboard-step:not(:last-child)::after { content:'';position:absolute;left:13px;top:36px;bottom:0;width:2px;background:var(--surface-mid); }
.onboard-dot { width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:0.75rem;font-weight:700;z-index:1; }
.onboard-dot.done { background:var(--teal);color:#fff; }
.onboard-dot.active { background:var(--navy);color:#fff;box-shadow:0 0 0 4px var(--clay-pale); }
.onboard-dot.pending { background:var(--surface-mid);color:var(--slate); }
.onboard-label { font-weight:600;font-size:0.88rem;color:var(--navy);line-height:1.3; }
.onboard-sublabel { font-size:0.78rem;color:var(--slate);margin-top:0.15rem; }
.rt-toast { position:fixed;bottom:1.5rem;right:1.5rem;background:var(--navy);color:#fff;padding:0.75rem 1.25rem;border-radius:var(--radius-xl);font-size:0.85rem;font-weight:500;box-shadow:var(--shadow-lg);z-index:999;animation:fadeUp 0.3s ease;display:flex;align-items:center;gap:0.6rem; }
.group-members-card { background:#fff;border-radius:var(--radius);box-shadow:var(--shadow);padding:1.25rem;margin-bottom:1.75rem; }
.group-member-row { display:flex;align-items:center;gap:1rem;padding:0.75rem 0;border-bottom:1px solid var(--surface-mid); }
.group-member-row:last-child { border:none; }
.member-avatar { width:36px;height:36px;border-radius:50%;background:var(--navy);color:#fff;font-weight:700;font-size:0.88rem;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
.member-name { font-weight:600;font-size:0.88rem;color:var(--navy); }
.member-email { font-size:0.76rem;color:var(--slate);margin-top:0.1rem; }
.member-tags { display:flex;gap:0.4rem;flex-wrap:wrap;margin-top:0.35rem; }
.member-tag { font-size:0.68rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;padding:0.18rem 0.55rem;border-radius:100px; }
.tag-owner { background:var(--teal-pale);color:var(--teal); }
.tag-tenant { background:var(--moss-pale);color:var(--moss); }
.tag-guarantor { background:rgba(30,61,51,0.08);color:var(--forest); }
.tag-complete { background:rgba(30,61,51,0.08);color:var(--forest); }
.tag-partial { background:var(--clay-pale);color:var(--clay-dark); }
.tag-incomplete { background:var(--rust-pale);color:var(--rust); }
.referral-card { background:var(--navy);border-radius:var(--radius-lg);padding:1.25rem;color:#fff; }
.s-apply_requested { background:var(--moss-pale);color:var(--moss); }
.apply-btn { margin-top:0.5rem;display:inline-flex;align-items:center;gap:0.35rem;font-size:0.75rem;font-weight:700;padding:0.3rem 0.75rem;border-radius:100px;border:1.5px solid var(--clay);background:transparent;color:var(--clay);cursor:pointer;font-family:inherit;transition:all 0.15s; }
.apply-btn:hover { background:var(--clay-pale); }
.apply-btn.sent { border-color:var(--forest);color:var(--forest);cursor:default; }
.edit-modal-overlay { position:fixed;inset:0;background:rgba(31,26,20,0.45);z-index:1000;display:flex;align-items:center;justify-content:center;padding:1.5rem; }
.edit-modal { background:#fff;border-radius:var(--radius-xl);max-width:940px;width:100%;box-shadow:var(--shadow-xl);animation:fadeUp 0.22s ease;display:grid;grid-template-columns:1fr 300px; }
.edit-modal-form { padding:1.75rem;overflow-y:auto;max-height:88vh; }
.edit-modal-preview { background:var(--surface);border-left:1px solid var(--surface-mid);padding:1.75rem;overflow-y:auto;max-height:88vh; }
.edit-modal h3 { font-family:'Fraunces', Georgia, serif;font-size:1.2rem;color:var(--navy);margin-bottom:1.1rem; }
.em-field { display:flex;flex-direction:column;gap:0.3rem;margin-bottom:0.85rem; }
.em-field label { font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--slate); }
.em-field input, .em-field select { padding:0.5rem 0.8rem;border:1.5px solid var(--surface-mid);border-radius:var(--radius-xl);font-size:0.88rem;font-family:inherit;color:var(--navy);outline:none;transition:border-color 0.15s;background:#fff; }
.em-field input:focus, .em-field select:focus { border-color:var(--teal); }
.em-row { display:grid;grid-template-columns:1fr 1fr;gap:0.75rem; }
.em-amenity-grid { display:flex;flex-wrap:wrap;gap:0.35rem;margin-top:0.4rem; }
.em-amenity-chip { font-size:0.72rem;font-weight:600;padding:0.22rem 0.6rem;border-radius:100px;cursor:pointer;border:1.5px solid transparent;transition:all 0.15s;user-select:none; }
.em-amenity-chip:hover .bt-tooltip { opacity:1 !important; }
@media(max-width:700px){ .edit-modal{grid-template-columns:1fr;} .edit-modal-preview{display:none;} }
.referral-card h3 { font-family:'Fraunces', Georgia, serif;font-size:1rem;margin-bottom:0.35rem; }
.referral-code-box { background:var(--clay-pale);border:1.5px solid var(--clay);border-radius:var(--radius-xl);padding:0.6rem 0.85rem;font-family:'Inter',monospace;font-size:0.88rem;font-weight:700;color:var(--clay-dark);letter-spacing:0.08em;margin:0.75rem 0;display:flex;justify-content:space-between;align-items:center;cursor:pointer;transition:background 0.15s; }
.referral-code-box:hover { background:rgba(190,100,56,0.2); }
.msg-card { background:#fff;border-radius:var(--radius);box-shadow:var(--shadow);display:flex;flex-direction:column;overflow:hidden;margin-top:1.25rem; }
.msg-thread { flex:1;overflow-y:auto;max-height:260px;padding:1rem;display:flex;flex-direction:column;gap:0.6rem; }
.msg-bubble { max-width:82%;padding:0.55rem 0.85rem;border-radius:var(--radius-xl);font-size:0.84rem;line-height:1.5; }
.msg-bubble.mine { align-self:flex-end;background:var(--navy);color:#fff;border-bottom-right-radius:4px; }
.msg-bubble.theirs { align-self:flex-start;background:var(--surface);color:var(--navy);border-bottom-left-radius:4px; }
.msg-bubble .msg-time { font-size:0.68rem;opacity:0.55;margin-top:0.2rem; }
.msg-input-row { display:flex;gap:0.5rem;padding:0.75rem 1rem;border-top:1px solid var(--surface-mid); }
.msg-input { flex:1;border:1.5px solid var(--surface-mid);border-radius:var(--radius-lg);padding:0.5rem 0.75rem;font-size:0.85rem;font-family:inherit;color:var(--navy);outline:none;transition:border-color 0.15s; }
.msg-input:focus { border-color:var(--teal); }
.msg-send-btn { background:var(--navy);color:#fff;border:none;border-radius:var(--radius-lg);padding:0.5rem 1rem;font-size:0.82rem;font-weight:700;cursor:pointer;font-family:inherit;transition:background 0.15s; }
.msg-send-btn:hover { background:var(--forest-mid); }
.msg-send-btn:disabled { opacity:0.5;cursor:not-allowed; }
.msg-unread-dot { width:7px;height:7px;border-radius:50%;background:var(--rust);display:inline-block;margin-left:5px;vertical-align:middle; }
.commute-mode { display:inline-flex;align-items:center;gap:0.25rem;background:var(--paper-deep);border:1px solid var(--surface-mid);border-radius:var(--radius-lg);padding:0.2rem 0.45rem;font-size:0.72rem;color:var(--navy);font-weight:600;text-decoration:none;transition:background 0.12s; }
.commute-mode:hover { background:var(--teal-pale);border-color:var(--teal); }
.commute-mode span { font-weight:400;color:var(--slate); }
.readiness-card { background:#fff;border-radius:var(--radius);box-shadow:var(--shadow);padding:1.5rem 1.75rem;margin-bottom:1.75rem;display:flex;align-items:center;gap:2rem;flex-wrap:wrap; }
.readiness-ring-wrap { position:relative;flex-shrink:0;width:110px;height:110px; }
.readiness-ring-label { position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center; }
.readiness-ring-pct { font-family:'Fraunces', Georgia, serif;font-size:1.65rem;color:var(--navy);line-height:1; }
.readiness-ring-word { font-size:0.6rem;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;margin-top:3px; }
.readiness-body { flex:1;min-width:220px; }
.readiness-title { font-family:'Fraunces', Georgia, serif;font-size:1.15rem;color:var(--navy);margin-bottom:0.2rem; }
.readiness-sub { font-size:0.82rem;color:var(--slate);margin-bottom:1rem;line-height:1.5; }
.readiness-factors { display:flex;flex-direction:column;gap:0.45rem; }
.rf { display:flex;align-items:center;gap:0.6rem;font-size:0.83rem; }
.rf-dot { width:8px;height:8px;border-radius:50%;flex-shrink:0; }
.rf-label { color:var(--navy);font-weight:500;flex:1; }
.rf-action { color:var(--teal);font-size:0.76rem;font-weight:600;text-decoration:none;white-space:nowrap; }
.rf-action:hover { text-decoration:underline; }
`

const STATUS_COLORS = {
  pending: 'var(--clay)',
  outreach_sent: 'var(--moss)',
  confirmed: 'var(--forest)',
  declined: 'var(--rust)',
  apply_requested: 'var(--moss)',
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
  const [referrals, setReferrals] = useState(0)
  const [copied, setCopied] = useState(false)
  const [newIds, setNewIds]    = useState(new Set())
  const [docCount, setDocCount] = useState(0)
  const [groupInfo, setGroupInfo] = useState(null)
  const [groupMembers, setGroupMembers] = useState([])
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [showEditCriteria, setShowEditCriteria] = useState(false)
  const [showListingsModal, setShowListingsModal] = useState(false)
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
  const [commuteResults, setCommuteResults] = useState({})
  const [commuteLoading, setCommuteLoading] = useState({})
  const [workAddrInput, setWorkAddrInput] = useState('')
  const [savingWorkAddr, setSavingWorkAddr] = useState(false)

  useEffect(() => { if (user) { loadData(); loadReferrals(); loadDocCount(); loadGroup(); loadGroupMembers(); loadMessages() } }, [user])
  useEffect(() => { if (listings.length > 0 && groupMembers.length > 0) fetchAllCommutes(listings, groupMembers) }, [listings, groupMembers])
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
    const updates = {
      min_budget:        criteriaForm.min_budget !== '' ? Number(criteriaForm.min_budget) : search.min_budget,
      max_budget:        criteriaForm.max_budget !== '' ? Number(criteriaForm.max_budget) : search.max_budget,
      min_bed:           (criteriaForm.beds || []).join(',') || null,
      max_bed:           null,
      min_bath:          criteriaForm.min_bath === 'Any' ? null : (criteriaForm.min_bath ? String(criteriaForm.min_bath) : search.min_bath),
      min_sqft:          criteriaForm.min_sqft !== '' ? Number(criteriaForm.min_sqft) : search.min_sqft,
      move_in:           criteriaForm.move_in    || search.move_in,
      move_in_direction: criteriaForm.move_in_direction || search.move_in_direction || 'on_or_before',
      neighborhoods:     criteriaForm.neighborhoods ?? search.neighborhoods,
      building_types:    criteriaForm.building_types ?? search.building_types,
      amenities:         criteriaForm.amenities ?? search.amenities,
    }
    console.log('saveCriteria updates:', updates)
    const { data: saved, error } = await supabase.from('searches').update(updates).eq('id', search.id).select().single()
    console.log('saveCriteria result:', saved, error)
    if (error) {
      showToast('Failed to save — ' + error.message)
    } else {
      setSearch(saved)
    }
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

  async function fetchCommute(listingId, listingAddress, userId, workAddr) {
    if (!workAddr) return
    const key = `${listingId}_${userId}`
    setCommuteLoading(prev => ({ ...prev, [key]: true }))
    try {
      const res = await fetch('/api/commute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: listingAddress, to: workAddr }),
      })
      const data = await res.json()
      setCommuteResults(prev => ({ ...prev, [key]: data }))
    } catch {
      setCommuteResults(prev => ({ ...prev, [key]: { error: 'Could not calculate' } }))
    }
    setCommuteLoading(prev => ({ ...prev, [key]: false }))
  }

  async function fetchAllCommutes(loadedListings, members) {
    if (!loadedListings?.length || !members?.length) return
    // Fetch work_address for all members
    const userIds = members.map(m => m.userId)
    const { data: profs } = await supabase.from('profiles').select('id, work_address').in('id', userIds)
    const workMap = Object.fromEntries((profs || []).filter(p => p.work_address).map(p => [p.id, p.work_address]))
    loadedListings.forEach(l => {
      members.forEach(m => {
        if (workMap[m.userId]) fetchCommute(l.id, l.address, m.userId, workMap[m.userId])
      })
    })
  }

  async function saveWorkAddress() {
    const addr = workAddrInput.trim()
    if (!addr) return
    setSavingWorkAddr(true)
    await supabase.from('profiles').update({ work_address: addr }).eq('id', user.id)
    setSavingWorkAddr(false)
    setWorkAddrInput('')
    setCommuteResults({})
    window.location.reload()
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
      const loaded = listingData || []
      setListings(loaded)
      subscribeToListings(searchData.id)
      // Commutes are fetched after group members load via fetchAllCommutes
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
    { key: 'criteria',   label: 'Set search criteria',       done: !!search,          pts: 20, action: null },
    { key: 'docs',       label: 'Documents uploaded',        done: tenantComplete,    pts: 35, action: '/documents', actionLabel: docCount > 0 ? 'Finish uploading →' : 'Upload docs →' },
    { key: 'guarantor',  label: needsGuarantor ? 'Guarantor docs complete' : 'Guarantor (not required)', done: needsGuarantor ? guarantorComplete : true, pts: 25, action: needsGuarantor && !guarantorComplete ? '/documents' : null, actionLabel: 'Upload guarantor docs →' },
    { key: 'credit',     label: 'Credit score awareness',    done: !!profile?.credit_confirmed, pts: 20, action: 'https://www.annualcreditreport.com', actionLabel: 'Check credit →', external: true },
  ]
  const readinessScore = rfFactors.reduce((sum, f) => sum + (f.done ? f.pts : 0), 0)
  const readinessWord  = readinessScore >= 90 ? 'Ready' : readinessScore >= 60 ? 'Almost' : readinessScore >= 30 ? 'Started' : 'Early'
  const readinessColor = readinessScore >= 90 ? 'var(--forest)' : readinessScore >= 60 ? 'var(--clay)' : readinessScore >= 30 ? 'var(--moss)' : 'var(--text-faint)'
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
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(31,26,20,0.45)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' }}>
          <div style={{ background:'#fff', borderRadius:'var(--radius-xl)', maxWidth:460, width:'100%', padding:'2rem', boxShadow:'var(--shadow-xl)', animation:'fadeUp 0.3s ease' }}>
            {!inviteSent ? (
              <>
                <div style={{ width:48, height:48, borderRadius:'var(--radius-xl)', background:'var(--teal-pale)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1rem' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <h2 style={{ fontFamily:"'Fraunces', Georgia, serif", fontSize:'1.45rem', color:'var(--navy)', marginBottom:'0.4rem' }}>Applying with others?</h2>
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
                        style={{ flex:1, padding:'0.6rem 0.85rem', border:'1.5px solid var(--surface-mid)', borderRadius:'var(--radius-lg)', fontSize:'0.87rem', fontFamily:'inherit', color:'var(--navy)', outline:'none' }}
                      />
                      {inviteEmails.length > 1 && (
                        <button onClick={() => setInviteEmails(arr => arr.filter((_, j) => j !== i))} style={{ background:'none', border:'none', color:'var(--text-faint)', cursor:'pointer', fontSize:'1rem', padding:'0 0.25rem' }}>✕</button>
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
                <div style={{ width:52, height:52, borderRadius:'var(--radius-xl)', background:'rgba(30,61,51,0.08)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--forest)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h2 style={{ fontFamily:"'Fraunces', Georgia, serif", fontSize:'1.45rem', color:'var(--navy)', marginBottom:'0.4rem' }}>Invites sent!</h2>
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
            {/* LEFT: edit form */}
            <div className="edit-modal-form">
              <h3>Edit Search Criteria</h3>
              <div className="em-row">
                <div className="em-field">
                  <label>Min Budget</label>
                  <input type="number" value={criteriaForm.min_budget} onChange={e => setCriteriaForm(f => ({ ...f, min_budget: e.target.value }))} />
                </div>
                <div className="em-field">
                  <label>Max Budget</label>
                  <input type="number" value={criteriaForm.max_budget} onChange={e => setCriteriaForm(f => ({ ...f, max_budget: e.target.value }))} />
                </div>
              </div>
              <div className="em-field">
                <label>Bedrooms</label>
                <div className="em-amenity-grid">
                  {['Studio','1','2','3','4','5','6+'].map(opt => {
                    const selected = (criteriaForm.beds || []).includes(opt)
                    return (
                      <span key={opt} className="em-amenity-chip"
                        onClick={() => setCriteriaForm(f => {
                          const cur = f.beds || []
                          return { ...f, beds: selected ? cur.filter(x => x !== opt) : [...cur, opt] }
                        })}
                        style={{ background: selected ? 'var(--navy)' : '#fff', color: selected ? '#fff' : 'var(--slate)', border: `1.5px solid ${selected ? 'var(--navy)' : 'var(--surface-mid)'}` }}>
                        {opt}
                      </span>
                    )
                  })}
                </div>
              </div>
              <div className="em-row">
                <div className="em-field">
                  <label>Min Bathrooms</label>
                  <select value={criteriaForm.min_bath} onChange={e => setCriteriaForm(f => ({ ...f, min_bath: e.target.value }))}>
                    {['Any','1','1.5','2','2.5','3'].map(v => <option key={v} value={v}>{v === 'Any' ? 'Any' : `${v}+`}</option>)}
                  </select>
                </div>
                <div className="em-field">
                  <label>Min Sqft</label>
                  <input type="number" value={criteriaForm.min_sqft} onChange={e => setCriteriaForm(f => ({ ...f, min_sqft: e.target.value }))} />
                </div>
              </div>
              <div className="em-field">
                <label>Move-In Date</label>
                <div style={{ display:'flex', gap:'0.4rem', marginBottom:'0.5rem' }}>
                  {[['on_or_before','On or before'],['on_or_after','On or after']].map(([val, label]) => (
                    <button key={val} type="button" onClick={() => setCriteriaForm(f => ({ ...f, move_in_direction: val }))}
                      style={{ fontSize:'0.75rem', fontWeight:600, fontFamily:'inherit', padding:'0.28rem 0.75rem', borderRadius:100, border:'1.5px solid', cursor:'pointer', transition:'all 0.15s',
                        background: criteriaForm.move_in_direction === val ? 'var(--navy)' : '#fff',
                        color: criteriaForm.move_in_direction === val ? '#fff' : 'var(--slate)',
                        borderColor: criteriaForm.move_in_direction === val ? 'var(--navy)' : 'var(--surface-mid)' }}>
                      {label}
                    </button>
                  ))}
                </div>
                <input type="date" value={criteriaForm.move_in} onChange={e => setCriteriaForm(f => ({ ...f, move_in: e.target.value }))} />
              </div>
              <div className="em-field">
                <label>Neighborhoods</label>
                <NeighborhoodPicker value={criteriaForm.neighborhoods || []} onChange={v => setCriteriaForm(f => ({ ...f, neighborhoods: v }))} />
              </div>
              <div className="em-field">
                <label>Building Types</label>
                <div className="em-amenity-grid">
                  {['Rental Building','Condo','Co-op','Townhouse'].map(bt => {
                    const sel = (criteriaForm.building_types || []).includes(bt)
                    const showTip = bt === 'Condo' || bt === 'Co-op'
                    return (
                      <span key={bt} className="em-amenity-chip" onClick={() => setCriteriaForm(f => ({ ...f, building_types: sel ? f.building_types.filter(x => x !== bt) : [...(f.building_types || []), bt] }))}
                        style={{ background: sel ? 'var(--navy)' : '#fff', color: sel ? '#fff' : 'var(--slate)', border: `1.5px solid ${sel ? 'var(--navy)' : 'var(--surface-mid)'}`, position:'relative' }}>
                        {bt}
                        {showTip && (
                          <>
                            <span style={{ marginLeft:'0.25rem', fontSize:'0.65rem', opacity:0.6 }}>ⓘ</span>
                            <span style={{
                              position:'absolute', bottom:'calc(100% + 8px)', left:'50%', transform:'translateX(-50%)',
                              background:'var(--forest)', color:'#fff', fontSize:'0.72rem', fontWeight:500, lineHeight:1.4,
                              padding:'0.45rem 0.7rem', borderRadius:7, width:220, pointerEvents:'none',
                              opacity:0, transition:'opacity 0.15s',
                              whiteSpace:'normal', textAlign:'center', zIndex:9999,
                            }} className="bt-tooltip">
                              Condos and co-ops oftentimes have longer application processes, board fees, & move in/out fees
                            </span>
                          </>
                        )}
                      </span>
                    )
                  })}
                </div>
              </div>
              <div className="em-field">
                <label>Must-Haves <span style={{ fontWeight:400, textTransform:'none', letterSpacing:0, color:'var(--slate)', fontSize:'0.7rem' }}>— only show listings with these</span></label>
                <div className="em-amenity-grid">
                  {AMENITIES.map(a => {
                    const sel = (criteriaForm.amenities || []).includes(a)
                    return (
                      <span key={a} className="em-amenity-chip" onClick={() => setCriteriaForm(f => ({ ...f, amenities: sel ? f.amenities.filter(x => x !== a) : [...(f.amenities || []), a] }))}
                        style={{ background: sel ? 'var(--teal-pale)' : '#fff', color: sel ? 'var(--teal)' : 'var(--slate)', border: `1.5px solid ${sel ? 'var(--teal)' : 'var(--surface-mid)'}`, cursor: 'pointer' }}>
                        {a}
                      </span>
                    )
                  })}
                </div>
              </div>
              <div style={{ display:'flex', gap:'0.75rem', marginTop:'0.5rem' }}>
                <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={saveCriteria} disabled={savingCriteria}>
                  {savingCriteria ? <span className="spinner" /> : 'Save Changes'}
                </button>
                <button className="btn btn-outline" onClick={() => setShowEditCriteria(false)}>Cancel</button>
              </div>
            </div>
            {/* RIGHT: live preview */}
            <div className="edit-modal-preview">
              <div style={{ fontSize:'0.72rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:'var(--slate)', marginBottom:'0.75rem' }}>Live Preview</div>
              <div className="criteria-card" style={{ boxShadow:'none', border:'1px solid var(--surface-mid)' }}>
                {[
                  ['Budget',        `$${criteriaForm.min_budget || '?'} – $${criteriaForm.max_budget || '?'}/mo`],
                  ['Bedrooms',      (criteriaForm.beds || []).join(', ') || 'Any'],
                  ['Bathrooms',     criteriaForm.min_bath && criteriaForm.min_bath !== 'Any' ? `${criteriaForm.min_bath}+ bath` : 'Any'],
                  ['Min Sqft',      criteriaForm.min_sqft ? `${Number(criteriaForm.min_sqft).toLocaleString()} sf` : 'Any'],
                  ['Move-In',       criteriaForm.move_in ? `${criteriaForm.move_in_direction === 'on_or_after' ? 'On or after' : 'On or before'} ${fmtDate(criteriaForm.move_in)}` : 'ASAP'],
                  ['Building Type', (criteriaForm.building_types || []).join(', ') || 'Any'],
                ].map(([k, v]) => (
                  <div className="crit-row" key={k}>
                    <span style={{ color:'var(--slate)' }}>{k}</span>
                    <span style={{ fontWeight:600, textAlign:'right', maxWidth:'55%' }}>{v}</span>
                  </div>
                ))}
                {/* Neighborhoods preview */}
                {(() => {
                  const selected = criteriaForm.neighborhoods || []
                  const boroughColors = {
                    Manhattan: { bg:'var(--clay-pale)', color:'var(--clay-dark)', border:'rgba(190,100,56,0.4)' },
                    Brooklyn:  { bg:'rgba(30,61,51,0.08)', color:'var(--forest)', border:'rgba(30,61,51,0.4)' },
                    Queens:    { bg:'rgba(176,135,72,0.10)', color:'var(--gold)', border:'rgba(176,135,72,0.4)' },
                    Bronx:     { bg:'var(--rust-pale)', color:'var(--rust)', border:'rgba(156,59,46,0.4)' },
                    NJ:        { bg:'var(--moss-pale)', color:'var(--moss)', border:'rgba(91,107,79,0.4)' },
                  }
                  const activeBoroughs = Object.keys(BOROUGH_NEIGHBORHOODS).filter(b =>
                    BOROUGH_NEIGHBORHOODS[b].some(n => selected.includes(n))
                  )
                  return (
                    <div className="crit-row" style={{ alignItems:'flex-start', gap:'0.5rem' }}>
                      <span style={{ color:'var(--slate)', flexShrink:0 }}>Neighborhoods</span>
                      {activeBoroughs.length > 0
                        ? <div style={{ display:'flex', flexWrap:'wrap', gap:'0.3rem', justifyContent:'flex-end' }}>
                            {activeBoroughs.map(b => {
                              const c = boroughColors[b]
                              const count = BOROUGH_NEIGHBORHOODS[b].filter(n => selected.includes(n)).length
                              const total = BOROUGH_NEIGHBORHOODS[b].length
                              return (
                                <span key={b} style={{
                                  fontSize:'0.72rem', fontWeight:700, padding:'0.18rem 0.55rem',
                                  borderRadius:100, background:c.bg, color:c.color,
                                  border:`1.5px solid ${c.border}`, display:'inline-flex', alignItems:'center', gap:'0.25rem',
                                }}>
                                  {b}
                                  {count < total && (
                                    <span style={{ background:c.color, color:'#fff', fontSize:'0.62rem', fontWeight:800, borderRadius:100, padding:'0 0.35rem', lineHeight:'1.5' }}>
                                      {count}
                                    </span>
                                  )}
                                </span>
                              )
                            })}
                          </div>
                        : <span style={{ fontWeight:600 }}>Any</span>
                      }
                    </div>
                  )
                })()}
                <div className="crit-row" style={{ flexDirection:'column', alignItems:'flex-start', gap:'0.4rem', borderBottom:'none' }}>
                  <span style={{ color:'var(--slate)' }}>Must-Haves</span>
                  {(criteriaForm.amenities || []).length > 0
                    ? <div style={{ display:'flex', flexWrap:'wrap', gap:'0.3rem' }}>
                        {criteriaForm.amenities.map(a => <span key={a} style={{ background:'var(--teal-pale)', color:'var(--teal)', fontSize:'0.72rem', fontWeight:600, padding:'0.18rem 0.55rem', borderRadius:100 }}>{a}</span>)}
                      </div>
                    : <span style={{ fontWeight:600 }}>None</span>
                  }
                </div>
              </div>
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--forest)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}><polyline points="20 6 9 17 4 12"/></svg>
            <span>Payment confirmed — check your email for a summary of what happens next. We're already on it.</span>
          </div>
        )}

        {groupInfo?.role === 'member' && (
          <div style={{ background:'var(--teal-pale)', border:'1.5px solid var(--teal)', borderRadius:'var(--radius-xl)', padding:'0.85rem 1.25rem', marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'0.75rem', fontSize:'0.86rem', color:'var(--navy)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>You're viewing <strong>{groupInfo.ownerName}'s</strong> group search.</span>
          </div>
        )}

        {groupInfo?.role === 'owner' && (
          <div style={{ background:'#fff', border:'1.5px solid var(--surface-mid)', borderRadius:'var(--radius-xl)', padding:'0.85rem 1.25rem', marginBottom:'1.25rem', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem', fontSize:'0.86rem', color:'var(--navy)', flexWrap:'wrap' }}>
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
          {/* No billing link: AptPilot is a one-time purchase, so there is no
              subscription to manage and a portal here would imply recurring
              charges that do not exist. Stripe emails the receipt. */}
          <div style={{ display:'flex', gap:'0.75rem', alignItems:'center', flexWrap:'wrap' }}>
            <div className="live-badge"><div className="pulse" />Live</div>
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', alignItems:'stretch' }}>

        {/* LEFT: Profile + Readiness + Criteria */}
        <div>

        {/* My Profile */}
        <div style={{ background:'#fff', borderRadius:'var(--radius)', boxShadow:'var(--shadow)', padding:'0.85rem 1.25rem', marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'1rem', flexWrap:'wrap' }}>
          <div style={{ width:40, height:40, borderRadius:'50%', background:'var(--navy)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.95rem', flexShrink:0 }}>
            {(profile?.full_name || user?.user_metadata?.full_name || '?').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--navy)' }}>{profile?.full_name || user?.user_metadata?.full_name || 'Your Name'}</div>
            <div style={{ fontSize:'0.78rem', color:'var(--slate)', marginTop:'0.1rem' }}>{user?.email}</div>
          </div>
          {profile?.phone && <div style={{ fontSize:'0.78rem', color:'var(--slate)' }}>{profile.phone}</div>}
          <a href="/settings" style={{ fontSize:'0.75rem', fontWeight:600, color:'var(--teal)', textDecoration:'none', whiteSpace:'nowrap' }}>Edit profile →</a>
        </div>

        {/* Readiness Score */}
        <div className="readiness-card" id="readiness">
          <div className="readiness-ring-wrap">
            <svg width="110" height="110" viewBox="0 0 110 110">
              <circle cx="55" cy="55" r={RING_R} fill="none" stroke="var(--surface-mid)" strokeWidth="8" />
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
                  <div className="rf-dot" style={{ background: f.done ? 'var(--forest)' : 'var(--surface-mid)' }} />
                  <span className="rf-label" style={{ color: f.done ? 'var(--navy)' : 'var(--slate)', textDecoration: f.done ? 'none' : 'none' }}>
                    {f.label}
                  </span>
                  {!f.done && f.action && (
                    f.external
                      ? <a href={f.action} target="_blank" rel="noopener noreferrer" className="rf-action">{f.actionLabel}</a>
                      : <Link to={f.action} className="rf-action">{f.actionLabel}</Link>
                  )}
                  {f.done && (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--forest)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="onboard-criteria-row" id="criteria">
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
              <button onClick={() => { setCriteriaForm({ min_budget: search?.min_budget || '', max_budget: search?.max_budget || '', beds: search?.min_bed ? search.min_bed.split(',').filter(Boolean) : [], min_bath: search?.min_bath || 'Any', min_sqft: search?.min_sqft || '', move_in: search?.move_in || '', move_in_direction: search?.move_in_direction || 'on_or_before', neighborhoods: search?.neighborhoods || [], building_types: search?.building_types || [], amenities: search?.amenities || [] }); setShowEditCriteria(true) }} style={{ fontSize:'0.75rem', fontWeight:600, color:'var(--teal)', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', padding:0 }}>Edit →</button>
            </div>
            <div className="criteria-card">
              <div style={{ background:'rgba(30,61,51,0.06)', border:'1px solid rgba(30,61,51,0.2)', borderRadius:'var(--radius-xl)', padding:'0.35rem 0.75rem', display:'flex', alignItems:'center', gap:'0.4rem', marginBottom:'0.75rem' }}>
                <span style={{ fontSize:'0.8rem' }}>💡</span>
                <p style={{ margin:0, fontSize:'0.73rem', color:'var(--forest)', lineHeight:1.4 }}>The more flexible your criteria, the more inventory we can find you.</p>
              </div>
              {[
                ['Budget',        search ? `$${search.min_budget || '?'} – $${search.max_budget || '?'}/mo` : '—'],
                ['Bedrooms',      search?.min_bed ? (() => { const order = ['Studio','1','2','3','4','5','6+']; return search.min_bed.split(',').filter(Boolean).sort((a,b) => order.indexOf(a) - order.indexOf(b)).join(', ') })() : 'Any'],
                ['Bathrooms',     search?.min_bath ? `${search.min_bath}+ bath` : 'Any'],
                ['Min Sqft',      search?.min_sqft ? `${search.min_sqft.toLocaleString()} sf` : 'Any'],
                ['Move-In',       search?.move_in ? `${search.move_in_direction === 'on_or_after' ? 'On or after' : 'On or before'} ${fmtDate(search.move_in)}` : 'ASAP'],
                ['Building Type', (search?.building_types || []).join(', ') || 'Any'],
              ].map(([k, v]) => (
                <div className="crit-row" key={k}>
                  <span style={{ color:'var(--slate)' }}>{k}</span>
                  <span style={{ fontWeight:600 }}>{v}</span>
                </div>
              ))}
              {/* Neighborhoods */}
              {(() => {
                const selected = search?.neighborhoods || []
                const boroughColors = {
                  Manhattan: { bg:'var(--clay-pale)', color:'var(--clay-dark)', border:'rgba(190,100,56,0.4)' },
                  Brooklyn:  { bg:'rgba(30,61,51,0.08)', color:'var(--forest)', border:'rgba(30,61,51,0.4)' },
                  Queens:    { bg:'rgba(176,135,72,0.10)', color:'var(--gold)', border:'rgba(176,135,72,0.4)' },
                  Bronx:     { bg:'var(--rust-pale)', color:'var(--rust)', border:'rgba(156,59,46,0.4)' },
                  NJ:        { bg:'var(--moss-pale)', color:'var(--moss)', border:'rgba(91,107,79,0.4)' },
                }
                const activeBoroughs = Object.keys(BOROUGH_NEIGHBORHOODS).filter(b =>
                  BOROUGH_NEIGHBORHOODS[b].some(n => selected.includes(n))
                )
                return (
                  <div className="crit-row" style={{ alignItems:'flex-start', gap:'0.5rem' }}>
                    <span style={{ color:'var(--slate)', flexShrink:0 }}>Neighborhoods</span>
                    {activeBoroughs.length > 0
                      ? <div style={{ display:'flex', flexWrap:'wrap', gap:'0.3rem', justifyContent:'flex-end' }}>
                          {activeBoroughs.map(b => {
                            const c = boroughColors[b]
                            const count = BOROUGH_NEIGHBORHOODS[b].filter(n => selected.includes(n)).length
                            const total = BOROUGH_NEIGHBORHOODS[b].length
                            return (
                              <span key={b} style={{
                                fontSize:'0.72rem', fontWeight:700, padding:'0.18rem 0.55rem',
                                borderRadius:100, background:c.bg, color:c.color,
                                border:`1.5px solid ${c.border}`, display:'inline-flex', alignItems:'center', gap:'0.25rem',
                              }}>
                                {b}
                                {count < total && (
                                  <span style={{ background:c.color, color:'#fff', fontSize:'0.62rem', fontWeight:800, borderRadius:100, padding:'0 0.35rem', lineHeight:'1.5' }}>
                                    {count}
                                  </span>
                                )}
                              </span>
                            )
                          })}
                        </div>
                      : <span style={{ fontWeight:600 }}>Any</span>
                    }
                  </div>
                )
              })()}
              {/* Must-Haves */}
              <div className="crit-row" style={{ alignItems:'flex-start', gap:'0.5rem' }}>
                <span style={{ color:'var(--slate)', flexShrink:0 }}>Must-Haves</span>
                {(search?.amenities || []).length > 0
                  ? <div style={{ display:'flex', flexWrap:'wrap', gap:'0.3rem', justifyContent:'flex-end' }}>
                      {(search.amenities || []).map(a => (
                        <span key={a} style={{ background:'var(--teal-pale)', color:'var(--teal)', fontSize:'0.72rem', fontWeight:600, padding:'0.18rem 0.55rem', borderRadius:100 }}>{a}</span>
                      ))}
                    </div>
                  : <span style={{ fontWeight:600 }}>None</span>
                }
              </div>
              {/* Chauffeur */}
              <div className="crit-row" style={{ borderBottom:'none' }}>
                <span style={{ color:'var(--slate)' }}>Chauffeur</span>
                <span style={{ fontWeight:600 }}>{search?.chauffeur ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        </div>
        {/* Your Apartments */}
        <div style={{ marginTop:'1.75rem' }}>
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
                    <button className={`apply-btn${l.status === 'apply_requested' ? ' sent' : ''}`}
                      onClick={async () => {
                        await supabase.from('listings').update({ status: 'apply_requested' }).eq('id', l.id)
                        setListings(prev => prev.map(x => x.id === l.id ? { ...x, status: 'apply_requested' } : x))
                        showToast(`Apply request sent for ${l.address}`)
                      }}>
                      ✦ I want to apply for this one
                    </button>
                  )}
                  {l.status === 'apply_requested' && (
                    <div style={{ marginTop:'0.4rem', fontSize:'0.78rem', color:'var(--moss)', fontWeight:600 }}>
                      ✓ Apply request sent — we'll be in touch
                    </div>
                  )}
                  {groupMembers.map(m => {
                    const key = `${l.id}_${m.userId}`
                    const firstName = m.name?.split(' ')[0] || m.name
                    const cr = commuteResults[key]
                    const cl = commuteLoading[key]
                    if (!cr && !cl) return null
                    return (
                      <div key={m.userId} style={{ marginTop:'0.4rem' }}>
                        {cl && <div style={{ fontSize:'0.73rem', color:'var(--slate)' }}>{firstName}'s commute…</div>}
                        {cr?.modes && (
                          <div style={{ display:'flex', flexWrap:'wrap', gap:'0.3rem', alignItems:'center' }}>
                            <span style={{ fontSize:'0.72rem', color:'var(--slate)', fontWeight:600, marginRight:'0.1rem' }}>{firstName}'s commute:</span>
                            {cr.modes.map(mode => (
                              <a key={mode.id} href={mode.url} target="_blank" rel="noopener noreferrer" className="commute-mode">
                                {mode.emoji} <span>~{mode.minutes}m</span>
                              </a>
                            ))}
                            <span style={{ fontSize:'0.7rem', color:'var(--slate)' }}>{cr.distanceMiles} mi</span>
                          </div>
                        )}
                        {cr?.error && <div style={{ fontSize:'0.73rem', color:'var(--rust)' }}>{cr.error}</div>}
                      </div>
                    )
                  })}
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div className="tour-price">{l.price ? `$${l.price.toLocaleString()}` : '—'}<small>/month</small></div>
                </div>
              </div>
            ))
          )}
          {listings.length > 0 && !profile?.work_address && (
            <div style={{ marginTop:'0.75rem', background:'#F8FAFB', borderRadius:10, padding:'0.85rem 1rem', border:'1.5px dashed var(--surface-mid)' }}>
              <div style={{ fontSize:'0.82rem', color:'var(--navy)', fontWeight:600, marginBottom:'0.4rem' }}>🗺 Add your work address to see commute times</div>
              <div style={{ display:'flex', gap:'0.5rem' }}>
                <input placeholder="e.g. 30 Rockefeller Plaza, New York" value={workAddrInput}
                  onChange={e => setWorkAddrInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveWorkAddress()}
                  style={{ flex:1, border:'1.5px solid var(--surface-mid)', borderRadius:8, padding:'0.45rem 0.7rem', fontSize:'0.82rem', fontFamily:'inherit', color:'var(--navy)', outline:'none' }} />
                <button onClick={saveWorkAddress} disabled={savingWorkAddr || !workAddrInput.trim()}
                  style={{ background:'var(--teal)', color:'#0C1628', border:'none', borderRadius:8, padding:'0.45rem 0.9rem', fontSize:'0.8rem', fontWeight:700, cursor:'pointer', fontFamily:'inherit', opacity: savingWorkAddr ? 0.6 : 1 }}>
                  {savingWorkAddr ? '…' : 'Save'}
                </button>
              </div>
            </div>
          )}
        </div>

        </div>{/* end left column */}

        {/* RIGHT column */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

          {/* KPI row */}
          <div className="kpi-row" id="commutes" style={{ marginBottom:0 }}>
            {[
              { label:'Listings Found',         val: listings.length || '—',       sub: listings.length > 0 ? 'matching your criteria' : 'search in progress', clickable: true },
              { label:'Tours Confirmed',         val: confirmedTours.length || '—', sub: confirmedTours.length > 0 ? 'ready to visit' : 'awaiting responses' },
              { label:'Outreach Sent',           val: sentOutreach.length || '—',   sub: 'agents contacted' },
              { label:'Applications Submitted',  val: '—',                          sub: 'tracked by AptPilot' },
            ].map(k => (
              <div className="kpi" key={k.label}
                onClick={k.clickable ? () => setShowListingsModal(true) : undefined}
                style={k.clickable ? { cursor:'pointer' } : {}}>
                <div className="kpi-label">{k.label}</div>
                <div className="kpi-val">{k.val}</div>
                <div className="kpi-sub">{k.sub}{k.clickable ? <span style={{ color:'var(--teal)', marginLeft:'0.3rem' }}>↗</span> : null}</div>
              </div>
            ))}
          </div>

          {/* Tour Agenda */}
          <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
            <div className="sect-title">Tour Agenda</div>
            <div style={{ background:'#fff', borderRadius:'var(--radius)', boxShadow:'var(--shadow)', flex:1, overflow:'hidden', display:'flex', flexDirection:'column' }}>
              {/* Header row */}
              <div style={{ display:'grid', gridTemplateColumns:'2fr 1.2fr 1fr 1fr', gap:0, background:'var(--surface)', borderBottom:'1.5px solid var(--surface-mid)', padding:'0.55rem 1.25rem' }}>
                {['Address', 'Date / Time', 'Price', 'Status'].map(h => (
                  <div key={h} style={{ fontSize:'0.68rem', fontWeight:700, color:'var(--slate)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{h}</div>
                ))}
              </div>
              {/* Rows */}
              <div style={{ flex:1, overflowY:'auto' }}>
                {(() => {
                  const rows = confirmedTours.length > 0 ? confirmedTours.map(l => ({
                    id: l.id, address: `${l.address}${l.unit ? `, ${l.unit}` : ''}`, date: l.notes || '—', price: l.price ? `$${l.price.toLocaleString()}/mo` : '—', status: 'Confirmed'
                  })) : [
                    { id:1, address:'245 E 54th St, Apt 12C', date:'Jul 2 · 10:00am', price:'$3,200/mo', status:'Confirmed' },
                    { id:2, address:'80 Riverside Blvd, Apt 4A', date:'Jul 2 · 11:30am', price:'$3,850/mo', status:'Confirmed' },
                    { id:3, address:'350 W 42nd St, Apt 8B', date:'Jul 2 · 1:00pm', price:'$2,950/mo', status:'Confirmed' },
                    { id:4, address:'15 Hudson Yards, Apt 22F', date:'Jul 2 · 2:30pm', price:'$4,400/mo', status:'Confirmed' },
                    { id:5, address:'200 Amsterdam Ave, Apt 6D', date:'Jul 3 · 10:00am', price:'$3,100/mo', status:'Pending' },
                    { id:6, address:'425 W 53rd St, Apt 3C', date:'Jul 3 · 11:30am', price:'$2,800/mo', status:'Pending' },
                  ]
                  return rows.map((r, i) => (
                    <div key={r.id} style={{ display:'grid', gridTemplateColumns:'2fr 1.2fr 1fr 1fr', gap:0, padding:'0.65rem 1.25rem', borderBottom:'1px solid var(--surface-mid)', background: i % 2 === 1 ? 'var(--surface)' : '#fff', alignItems:'center' }}>
                      <div style={{ fontWeight:600, fontSize:'0.83rem', color:'var(--navy)' }}>{r.address}</div>
                      <div style={{ fontSize:'0.78rem', color:'var(--slate)' }}>{r.date}</div>
                      <div style={{ fontSize:'0.78rem', color:'var(--teal)', fontWeight:600 }}>{r.price}</div>
                      <div>
                        <span style={{ background: r.status === 'Confirmed' ? 'rgba(30,61,51,0.08)' : 'var(--clay-pale)', color: r.status === 'Confirmed' ? 'var(--forest)' : 'var(--clay-dark)', fontSize:'0.7rem', fontWeight:700, padding:'0.2rem 0.55rem', borderRadius:100 }}>{r.status}</span>
                      </div>
                    </div>
                  ))
                })()}
              </div>
            </div>
          </div>

          {/* 2×2 grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>

            {/* Status Tracker */}
            <div>
              <div className="sect-title">Status Tracker</div>
              <div className="tracker-card" style={{ height:160, overflowY:'auto' }}>
                {listings.length === 0 ? (
                  <p style={{ color:'var(--slate)', fontSize:'0.82rem', padding:'0.5rem 0' }}>Listings will appear here once found.</p>
                ) : listings.map(l => (
                  <div className="tracker-row" key={l.id}>
                    <div className="t-dot" style={{ background: STATUS_COLORS[l.status] || 'var(--text-faint)' }} />
                    <div>
                      <div style={{ fontWeight:600, fontSize:'0.82rem', color:'var(--navy)' }}>{l.address}{l.unit ? `, ${l.unit}` : ''}</div>
                      <div style={{ fontSize:'0.74rem', color:'var(--slate)', marginTop:'0.1rem' }}>
                        {l.status === 'pending'          ? 'Searching for availability'    :
                         l.status === 'outreach_sent'    ? 'Tour request sent'             :
                         l.status === 'confirmed'        ? 'Tour confirmed'                :
                         l.status === 'declined'         ? 'Not available'                 :
                         l.status === 'apply_requested'  ? 'Apply request sent'            : l.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Share AptPilot */}
            <div>
              <div className="sect-title">Share AptPilot</div>
              {profile?.referral_code ? (
                <div className="referral-card" style={{ height:160, overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'0.88rem', color:'#fff', marginBottom:'0.3rem' }}>Refer a friend</div>
                    <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.74rem', lineHeight:1.45, margin:0 }}>Help someone skip the broker fee. Share your personal link.</p>
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(`https://aptpilot.vercel.app/signup?ref=${profile.referral_code}`); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                    style={{ background:'var(--teal)', color:'var(--navy)', border:'none', borderRadius:8, padding:'0.5rem 1rem', fontWeight:700, fontSize:'0.78rem', cursor:'pointer', fontFamily:'inherit', width:'100%', transition:'opacity 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.opacity='0.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity='1'}
                  >
                    {copied ? '✓ Link Copied!' : 'Copy My Link'}
                  </button>
                </div>
              ) : (
                <div style={{ background:'#fff', borderRadius:'var(--radius)', boxShadow:'var(--shadow)', padding:'1rem', height:160 }} />
              )}
            </div>

            {/* My Documents */}
            <div>
              <div className="sect-title">My Documents</div>
              <Link to="/documents" style={{ textDecoration:'none' }}>
                <div style={{ background:'#fff', borderRadius:'var(--radius)', boxShadow:'var(--shadow)', padding:'1.25rem', display:'flex', flexDirection:'column', gap:'0.6rem', border:'1.5px solid transparent', transition:'border-color 0.15s', cursor:'pointer', height:160, overflow:'hidden' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor='var(--teal)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor='transparent'}>
                  <div style={{ width:32, height:32, borderRadius:8, background:'var(--teal-pale)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <div style={{ fontWeight:700, fontSize:'0.83rem', color:'var(--navy)' }}>View & Download Files</div>
                  <div style={{ fontSize:'0.74rem', color:'var(--slate)' }}>Individual files + PDF package</div>
                </div>
              </Link>
            </div>

            {/* Add a Chauffeur */}
            <div>
              <div className="sect-title">Add a Chauffeur</div>
              <div style={{ background:'var(--navy)', borderRadius:'var(--radius)', padding:'1.25rem', height:160, overflow:'hidden', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:'0.88rem', color:'#fff', marginBottom:'0.3rem' }}>Ride between tours</div>
                  <p style={{ color:'rgba(255,255,255,0.6)', fontSize:'0.74rem', lineHeight:1.45, margin:0 }}>We book a car to take you between every showing on tour day.</p>
                </div>
                <button
                  onClick={() => { /* chauffeur upsell */ }}
                  style={{ background:'var(--teal)', color:'var(--navy)', border:'none', borderRadius:8, padding:'0.5rem 1rem', fontWeight:700, fontSize:'0.78rem', cursor:'pointer', fontFamily:'inherit', width:'100%', transition:'opacity 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity='0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity='1'}
                >
                  Add Chauffeur →
                </button>
              </div>
            </div>

          </div>{/* end 2×2 grid */}

        </div>{/* end right column */}
        </div>{/* end two-column layout */}
      </div>{/* end .dash */}

      {/* Listings Found Modal */}
      {showListingsModal && (
        <div style={{ position:'fixed', inset:0, zIndex:1200, background:'rgba(31,26,20,0.45)', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}
          onClick={e => { if (e.target === e.currentTarget) setShowListingsModal(false) }}>
          <div style={{ background:'var(--surface)', borderRadius:'var(--radius-xl)', width:'100%', maxWidth:860, maxHeight:'85vh', display:'flex', flexDirection:'column', boxShadow:'var(--shadow-xl)', overflow:'hidden' }}>
            {/* Modal header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.5rem 1.75rem', background:'#fff', borderBottom:'1px solid var(--surface-mid)', flexShrink:0 }}>
              <div>
                <div style={{ fontFamily:"'Fraunces', Georgia, serif", fontSize:'1.3rem', color:'var(--navy)', fontWeight:700 }}>Listings Found</div>
                <div style={{ fontSize:'0.78rem', color:'var(--slate)', marginTop:'0.15rem' }}>{listings.length} apartment{listings.length !== 1 ? 's' : ''} matching your criteria</div>
              </div>
              <button onClick={() => setShowListingsModal(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--slate)', padding:'0.25rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            {/* Modal body — scrollable listing cards */}
            <div style={{ overflowY:'auto', padding:'1.25rem 1.75rem', flex:1 }}>
              {listings.length === 0 ? (
                <div className="empty-state">
                  <div style={{ marginBottom:'0.75rem' }}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--slate)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></div>
                  <strong>We're on it.</strong>
                  <p style={{ marginTop:'0.4rem', color:'var(--slate)' }}>Our team is searching listings that match your criteria. Check back soon.</p>
                </div>
              ) : listings.map(l => (
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
                        {l.status === 'pending'         ? 'Finding tour time'  :
                         l.status === 'outreach_sent'   ? 'Agent contacted'    :
                         l.status === 'confirmed'       ? 'Tour confirmed'     :
                         l.status === 'declined'        ? 'Not available'      :
                         l.status === 'apply_requested' ? 'Apply requested'    : l.status}
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
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div className="tour-price">{l.price ? `$${l.price.toLocaleString()}` : '—'}<small>/month</small></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
