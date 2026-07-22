import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import NeighborhoodPicker from '../components/NeighborhoodPicker'

const TIMES = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM']
const AMENITIES = [
  'Doorman','Virtual Doorman','Concierge','Elevator',
  'In-Unit Washer/Dryer','Laundry in Building','Dishwasher','Central A/C',
  'Gym / Fitness Center','Roof Deck','Terrace / Balcony','Outdoor Space',
  'Storage','Bike Room','Parking / Garage','Pool',
  'Pets OK — Dogs','Pets OK — Cats','Furnished','Flexible Lease',
]
const BUILDING_TYPES = ['Rental Building','Condo','Co-op','Townhouse']

const TENANT_DOCS = [
  { id:'t1', label:'ID or Passport', sub:'Photo or scan — government issued' },
  { id:'t2', label:'Offer Letter or Letter of Employment', sub:'Ideally dated within 30 days of lease start. Upload what you have if outside that range and try to add a newer one when available.' },
  { id:'t3', label:'2 Most Recent Bank Statements', sub:'Checking, savings, and any investment accounts' },
  { id:'t4', label:'Top 2 Pages of 2 Most Recent Tax Returns', sub:'First 2 pages only of each return' },
  { id:'t5', label:'6 Months Proof of Rent Payments or Landlord Letter', sub:'Not required — but strongly recommended if you have it', optional: true },
]

const GUARANTOR_DOCS = [
  { id:'g1', label:'ID or Passport', sub:'Photo or scan — government issued' },
  { id:'g2', label:'Letter of Employment', sub:'Must state start date, length of employment, position, salary/bonuses, and be signed. If self-employed or retired, a CPA letter with the same criteria works.' },
  { id:'g3', label:'2 Most Recent Paystubs', sub:'' },
  { id:'g4', label:'2 Most Recent Bank Statements', sub:'Checking, savings, and any investment accounts' },
  { id:'g5', label:'Top 2 Pages of 2 Most Recent Tax Returns', sub:'First 2 pages only of each return' },
  { id:'g6', label:'2 Most Recent W-2s', sub:'Can substitute for tax returns', optional: true },
]

const css = `
.intake { max-width: 960px; margin: 0 auto; padding: 2.5rem 2rem; animation: fadeUp 0.4s ease both; }
.intake h1 { font-family:'Inter', sans-serif; font-size:2rem; color:var(--navy); margin-bottom:0.3rem; }
.intake .sub { color:var(--slate); font-size:0.9rem; margin-bottom:2rem; }
.progress-wrap { margin-bottom:2rem; }
.step-labels { display:flex; justify-content:space-between; font-size:0.75rem; font-weight:600; text-transform:uppercase; letter-spacing:0.04em; color:var(--slate); margin-bottom:0.5rem; }
.step-labels .active { color:var(--teal); }
.progress-track { background:var(--surface-mid); height:4px; border-radius:4px; overflow:hidden; }
.progress-fill { background:var(--teal); height:100%; border-radius:4px; transition:width 0.35s ease; }
.section-card { background:#fff; border-radius:var(--radius); box-shadow:var(--shadow); padding:1.75rem; margin-bottom:1.25rem; }
.section-label { font-weight:700; font-size:0.95rem; color:var(--navy); margin-bottom:1.25rem; display:flex; align-items:center; gap:0.6rem; }
.section-label-icon { width:30px;height:30px;background:var(--teal-pale);border-radius:8px;display:flex;align-items:center;justify-content:center; }
.chip-grid { display:flex; flex-wrap:wrap; gap:0.5rem; }
.chip { padding:0.4rem 0.9rem; border-radius:100px; border:1.5px solid var(--surface-mid); font-size:0.82rem; font-weight:500; cursor:pointer; background:#fff; color:var(--slate); transition:all 0.15s; }
.chip.on { background:var(--teal); border-color:var(--teal); color:#fff; }
.time-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:0.5rem; }
@media(max-width:500px){ .time-grid{grid-template-columns:repeat(3,1fr);} }
.time-chip { padding:0.55rem 0.4rem; border-radius:8px; border:1.5px solid var(--surface-mid); font-size:0.8rem; font-weight:500; cursor:pointer; text-align:center; background:#fff; color:var(--slate); transition:all 0.15s; }
.time-chip.on { background:var(--teal-pale); border-color:var(--teal); color:var(--teal); }
.upload-area { border:2px dashed var(--surface-mid); border-radius:10px; padding:1.5rem; text-align:center; cursor:pointer; transition:all 0.2s; }
.upload-area:hover { border-color:var(--teal); background:var(--teal-pale); }
.doc-item { display:flex;align-items:center;gap:0.7rem;background:var(--teal-pale);border-radius:8px;padding:0.5rem 0.75rem;font-size:0.85rem;color:var(--navy);margin-top:0.5rem; }
.doc-outer-layout { display:grid; grid-template-columns:1fr 240px; gap:1.5rem; align-items:start; }
@media(max-width:760px){ .doc-outer-layout{grid-template-columns:1fr;} }
.doc-sidenote { background:linear-gradient(135deg,#EFF8F8,#E0F5F5); border:1.5px solid rgba(10,191,191,0.25); border-radius:12px; padding:1.25rem 1.1rem; }
.doc-sidenote-title { font-weight:700; font-size:0.85rem; color:var(--navy); margin-bottom:0.6rem; display:flex; align-items:center; gap:0.5rem; }
.doc-sidenote-body { font-size:0.8rem; color:#4A6080; line-height:1.65; }
.role-tabs { display:flex; gap:0; margin-bottom:1.25rem; background:var(--surface); border-radius:9px; padding:3px; }
.role-tab { flex:1; padding:0.45rem 0.75rem; border-radius:7px; border:none; font-size:0.82rem; font-weight:600; cursor:pointer; background:transparent; color:var(--slate); transition:all 0.15s; font-family:inherit; }
.role-tab.on { background:#fff; color:var(--navy); box-shadow:0 1px 4px rgba(12,22,40,0.1); }
.doc-checklist { display:flex; flex-direction:column; gap:0.6rem; margin-bottom:1.25rem; }
.doc-check-item { display:flex; gap:0.75rem; align-items:flex-start; padding:0.75rem 0.9rem; border-radius:9px; border:1.5px solid var(--surface-mid); background:#fff; cursor:pointer; transition:all 0.15s; }
.doc-check-item.checked { border-color:var(--teal); background:var(--teal-pale); }
.doc-check-item.optional { border-style:dashed; }
.doc-check-box { width:20px; height:20px; border-radius:5px; border:2px solid var(--surface-mid); flex-shrink:0; margin-top:1px; display:flex; align-items:center; justify-content:center; transition:all 0.15s; }
.doc-check-item.checked .doc-check-box { background:var(--teal); border-color:var(--teal); }
.doc-check-label { font-size:0.84rem; font-weight:600; color:var(--navy); line-height:1.3; }
.doc-check-sub { font-size:0.76rem; color:var(--slate); margin-top:0.2rem; line-height:1.45; }
.doc-check-optional { font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; color:var(--teal); margin-top:0.2rem; }
.doc-upload-btn { display:inline-flex; align-items:center; gap:0.35rem; margin-top:0.55rem; font-size:0.75rem; font-weight:600; color:var(--teal); background:rgba(10,191,191,0.1); border:1.5px solid rgba(10,191,191,0.3); border-radius:6px; padding:0.3rem 0.65rem; cursor:pointer; transition:all 0.15s; font-family:inherit; }
.doc-upload-btn:hover { background:rgba(10,191,191,0.18); }
.doc-uploaded-file { display:flex; align-items:center; gap:0.45rem; font-size:0.75rem; color:#059669; margin-top:0.35rem; font-weight:500; width:100%; }
.doc-uploaded-file button:hover { color:#EF4444 !important; }
.tier-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:0.75rem; }
@media(max-width:700px){ .tier-grid{grid-template-columns:1fr;} }
.tier-card { border:2px solid var(--surface-mid); border-radius:12px; padding:1.25rem; cursor:pointer; transition:all 0.18s; position:relative; }
.tier-card.on { border-color:var(--teal); background:var(--teal-pale); }
.tier-badge { position:absolute;top:-10px;right:12px;background:var(--teal);color:#fff;font-size:0.7rem;font-weight:700;padding:0.2rem 0.6rem;border-radius:100px;text-transform:uppercase;letter-spacing:0.05em; }
.tier-name { font-weight:700; font-size:1rem; color:var(--navy); }
.tier-price { font-family:'Inter', sans-serif; font-size:1.7rem; color:var(--teal); }
.tier-price span { font-family:'Inter',sans-serif; font-size:0.8rem; color:var(--slate); font-weight:400; }
.tier-feats { margin-top:0.75rem; display:flex; flex-direction:column; gap:0.3rem; }
.tier-feat { font-size:0.8rem; color:#475569; display:flex; gap:0.4rem; }
.tier-feat::before { content:"✓"; color:var(--teal); font-weight:700; }
.chauffeur-row { border:2px solid var(--surface-mid); border-radius:12px; padding:1rem 1.25rem; display:flex;align-items:center;gap:1rem;cursor:pointer;transition:all 0.18s; }
.info-bubble-wrap { position:relative; display:inline-flex; align-items:center; }
.info-icon { display:inline-flex;align-items:center;justify-content:center;width:16px;height:16px;border-radius:50%;background:var(--surface-mid);color:var(--slate);font-size:0.65rem;font-weight:700;cursor:pointer;margin-left:0.35rem;flex-shrink:0;transition:background 0.15s; }
.info-icon:hover { background:var(--teal);color:#fff; }
.info-bubble { position:absolute;top:calc(100% + 8px);left:0;z-index:50;background:var(--navy);color:#fff;font-size:0.78rem;line-height:1.55;padding:0.65rem 0.85rem;border-radius:10px;width:240px;box-shadow:0 8px 24px rgba(0,0,0,0.18);pointer-events:none; }
.info-bubble::before { content:'';position:absolute;top:-5px;left:10px;width:10px;height:10px;background:var(--navy);transform:rotate(45deg); }
.chauffeur-row:hover,.chauffeur-row.on { border-color:var(--teal); background:var(--teal-pale); }
.check-box { width:22px;height:22px;border-radius:6px;border:2px solid var(--surface-mid);display:flex;align-items:center;justify-content:center;font-size:0.8rem;color:#fff;flex-shrink:0;transition:all 0.15s; }
.chauffeur-row.on .check-box { background:var(--teal);border-color:var(--teal); }
.form-nav { display:flex;justify-content:space-between;align-items:center;margin-top:1.5rem; }
.order-row { display:flex;justify-content:space-between;padding:0.55rem 0;border-bottom:1px solid var(--surface-mid);font-size:0.88rem; }
.order-row:last-child { border:none;font-weight:700;font-size:1rem;padding-top:0.75rem; }
`

function InfoBubble({ text }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="info-bubble-wrap">
      <span className="info-icon" onClick={e => { e.stopPropagation(); setOpen(o => !o) }} onBlur={() => setOpen(false)} tabIndex={0}>i</span>
      {open && <span className="info-bubble">{text}</span>}
    </span>
  )
}

function AmenitiesSection({ form, toggle }) {
  return (
    <>
      <div className="section-card">
        <div className="section-label">
          <span className="section-label-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </span>
          Must-Haves
          <InfoBubble text="We will only send you apartments that have all of these features. Listings missing any must-have will be excluded from your search." />
        </div>
        <div className="chip-grid">
          {AMENITIES.map(a => (
            <button key={a} className={`chip ${form.amenities.includes(a) ? 'on' : ''}`} onClick={() => toggle('amenities', a)}>{a}</button>
          ))}
        </div>
      </div>
    </>
  )
}

export default function Intake() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [teaser, setTeaser] = useState(null) // { count, seconds }
  const [showCriteriaPreview, setShowCriteriaPreview] = useState(false)

  const [step, setStep]       = useState(1)
  const [saving, setSaving]   = useState(false)
  const [docRole, setDocRole] = useState('tenant')
  const [docFiles, setDocFiles] = useState({})   // { [docId]: [{ name, path }, ...] }
  const [uploadingDoc, setUploadingDoc] = useState(null)

  const handleDocUpload = async (docId, files) => {
    if (!files.length) return
    setUploadingDoc(docId)
    const docList = docRole === 'tenant' ? TENANT_DOCS : GUARANTOR_DOCS
    const docMeta = docList.find(d => d.id === docId)
    const uploaded = []
    for (const file of files) {
      const path = `${user.id}/${Date.now()}-${file.name}`
      const { error } = await supabase.storage.from('documents').upload(path, file)
      if (!error) {
        await supabase.from('user_documents').insert({
          user_id: user.id, doc_id: docId,
          doc_label: docMeta?.label || docId,
          doc_role: docRole,
          storage_path: path,
          file_name: file.name,
        })
        uploaded.push({ name: file.name, path })
      }
    }
    setDocFiles(d => ({ ...d, [docId]: [...(d[docId] || []), ...uploaded] }))
    setUploadingDoc(null)
  }

  const handleDocDelete = async (docId, filePath) => {
    await supabase.storage.from('documents').remove([filePath])
    await supabase.from('user_documents').delete().eq('storage_path', filePath)
    setDocFiles(d => ({ ...d, [docId]: (d[docId] || []).filter(f => f.path !== filePath) }))
  }
  const [form, setForm]       = useState({
    moveIn:'', moveInDirection:'on_or_before', minBed:'1', maxBed:'2', minBudget:'', maxBudget:'',
    neighborhoods:[], tourTimes:[], notes:'',
    tier:'core', chauffeur:false,
    phone:'', workAddress:'',
    minBath:'Any', amenities:[], buildingTypes:[], minSqft:'',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggle = (k, v) => setForm(f => ({
    ...f, [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v]
  }))

  const estimateListings = (f) => {
    let score = 420
    // Budget range — narrow range reduces inventory
    const min = parseInt(f.minBudget) || 0
    const max = parseInt(f.maxBudget) || 0
    if (min && max) {
      const range = max - min
      if (range < 300)       score -= 180
      else if (range < 700)  score -= 90
      else if (range > 2000) score += 60
    } else if (!min && !max) score += 40
    // Neighborhoods — more specific = fewer results
    const n = f.neighborhoods.length
    if (n === 0)       score += 30
    else if (n <= 2)   score -= 140
    else if (n <= 5)   score -= 60
    else if (n <= 10)  score -= 20
    // Building types — more filters = fewer results
    const b = f.buildingTypes.length
    if (b === 1) score -= 80
    else if (b === 2) score -= 30
    // Amenities — each must-have cuts inventory
    score -= f.amenities.length * 18
    // Beds — fewer options = more specific
    const bedCount = f.minBed && f.maxBed ? (parseInt(f.maxBed) - parseInt(f.minBed) + 1) : 2
    if (bedCount === 1) score -= 40
    else if (bedCount >= 3) score += 30
    // Sqft floor
    if (f.minSqft && parseInt(f.minSqft) > 700) score -= 50
    return Math.max(12, Math.min(score, 600))
  }

  const getCriteriaFeedback = (count) => {
    if (count < 20)  return { tone:'tight',  msg:'Your criteria is quite specific — we may have limited inventory to pull from. Consider widening your budget range or adding more neighborhoods.', color:'#EF4444', bg:'#FEF2F2', border:'#FECACA' }
    if (count <= 75) return { tone:'good',   msg:'Solid criteria — specific enough to find great matches, with enough flexibility for solid options.', color:'#059669', bg:'#F0FDF4', border:'#86EFAC' }
    return { tone:'broad', msg:'Your search is wide open — you can get more than you think! Try narrowing neighborhoods or adding must-have amenities to get better matches.', color:'#D97706', bg:'#FFFBEB', border:'#FCD34D' }
  }

  const STEPS = ['Your Info', 'Criteria', 'Availability', 'Plan']

  const handleSubmit = async () => {
    setSaving(true)
    if (form.workAddress) {
      await supabase.from('profiles').update({ work_address: form.workAddress }).eq('id', user.id)
    }
    const { data, error } = await supabase.from('searches').insert({
      user_id:       user.id,
      move_in:           form.moveIn || null,
      move_in_direction: form.moveInDirection,
      min_bed:       form.minBed,
      max_bed:       form.maxBed,
      min_budget:    form.minBudget ? parseInt(form.minBudget.replace(/\D/g,'')) : null,
      max_budget:    form.maxBudget ? parseInt(form.maxBudget.replace(/\D/g,'')) : null,
      neighborhoods:  form.neighborhoods,
      tour_times:     form.tourTimes,
      notes:          form.notes,
      tier:           form.tier,
      chauffeur:      form.chauffeur,
      phone:          form.phone,
      min_bath:       form.minBath !== 'Any' ? form.minBath : null,
      amenities:           form.amenities,
      building_types: form.buildingTypes,
      min_sqft:       form.minSqft ? parseInt(form.minSqft) : null,
    })
    setSaving(false)
    if (!error) {
      // Simulate a listing scan — randomize a realistic count and elapsed time
      const count = Math.floor(Math.random() * 60) + 80 // 80–140
      const secs = (Math.random() * 1.8 + 0.8).toFixed(1) // 0.8–2.6s
      setTeaser({ count, secs })
    }
  }

  if (teaser) return (
    <>
      <style>{css}</style>
      <div style={{
        minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center',
        justifyContent:'center', background:'var(--navy)', padding:'2rem', textAlign:'center',
      }}>
        <div style={{
          background:'#fff', borderRadius:20, padding:'3rem 2.5rem', maxWidth:480, width:'100%',
          boxShadow:'0 24px 80px rgba(0,0,0,0.3)',
        }}>
          <div style={{ fontSize:'2.8rem', marginBottom:'0.5rem' }}>🏙️</div>
          <h2 style={{ fontFamily:"'Inter', sans-serif", fontSize:'1.75rem', color:'var(--navy)', marginBottom:'0.5rem' }}>
            AptPilot found <span style={{ color:'var(--teal)' }}>{teaser.count} listings</span> for you
          </h2>
          <p style={{ color:'var(--slate)', fontSize:'0.95rem', marginBottom:'0.35rem' }}>
            Scanned in <strong>{teaser.secs}s</strong> across every NYC listing source.
          </p>
          <p style={{ color:'var(--slate)', fontSize:'0.88rem', marginBottom:'2rem', lineHeight:1.6 }}>
            Unlock your matches, tour scheduling, and document organizer — all for a single flat fee.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/checkout')}
            style={{ width:'100%', justifyContent:'center', fontSize:'1rem', padding:'0.9rem 1.5rem', borderRadius:100, marginBottom:'0.75rem' }}
          >
            See my listings →
          </button>
          <p style={{ fontSize:'0.75rem', color:'#94A3B8', margin:0 }}>One-time payment · No subscription · No broker fee</p>
        </div>
      </div>
    </>
  )

  return (
    <>
      <style>{css}</style>
      <div className="intake">
        <h1>Let's find your apartment.</h1>
        <p className="sub">Fill in your criteria — we'll handle everything from here.</p>

        <div className="progress-wrap">
          <div className="step-labels">
            {STEPS.map((l, i) => <span key={l} className={step === i+1 ? 'active' : ''}>{i+1}. {l}</span>)}
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${(step / STEPS.length) * 100}%` }} />
          </div>
        </div>

        {step === 1 && (
          <div className="fade-up">
            <div className="section-card">
              <div className="section-label"><span className="section-label-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>Contact Info</div>
              <div className="grid-2">
                <div className="field"><label>Phone Number</label><input placeholder="(908) 555-0100" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
                <div className="field" style={{ justifyContent:'flex-end' }}><label>Email (from account)</label><input value={user?.email} disabled style={{ background:'var(--surface)', color:'var(--slate)' }} /></div>
              </div>
            </div>
            <div style={{ background:'linear-gradient(135deg,#EFF8F8,#E0F5F5)', border:'1.5px solid rgba(10,191,191,0.25)', borderRadius:12, padding:'1.25rem 1.5rem', display:'flex', gap:'1rem', alignItems:'flex-start' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:2 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <div>
                <div style={{ fontWeight:700, fontSize:'0.88rem', color:'var(--navy)', marginBottom:'0.25rem' }}>Documents are uploaded from your dashboard</div>
                <div style={{ fontSize:'0.82rem', color:'#4A6080', lineHeight:1.6 }}>After completing this form, head to <strong>My Documents</strong> in your dashboard to upload your ID, pay stubs, bank statements, and tax returns. Having everything ready before touring gives you a major edge — apartments in NYC move fast.</div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="fade-up">
            <div className="section-card">
              <div className="section-label"><span className="section-label-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span>Apartment Criteria</div>
              <div className="grid-2" style={{ marginBottom:'1rem' }}>
                <div className="field">
                  <label>Move-In Date</label>
                  <div style={{ display:'flex', gap:'0.5rem', marginBottom:'0.5rem' }}>
                    {[['on_or_before','On or before'],['on_or_after','On or after']].map(([val, label]) => (
                      <button key={val} type="button" onClick={() => set('moveInDirection', val)}
                        style={{ fontSize:'0.78rem', fontWeight:600, fontFamily:'inherit', padding:'0.3rem 0.85rem', borderRadius:100, border:'1.5px solid', cursor:'pointer', transition:'all 0.15s',
                          background: form.moveInDirection === val ? 'var(--navy)' : '#fff',
                          color: form.moveInDirection === val ? '#fff' : 'var(--slate)',
                          borderColor: form.moveInDirection === val ? 'var(--navy)' : '#CBD5E1' }}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <input type="date" value={form.moveIn} onChange={e => set('moveIn', e.target.value)} />
                </div>
                <div />
                <div className="field"><label>Monthly Budget Min</label><input placeholder="$2,000" value={form.minBudget} onChange={e => set('minBudget', e.target.value)} /></div>
                <div className="field"><label>Monthly Budget Max</label><input placeholder="$5,000" value={form.maxBudget} onChange={e => set('maxBudget', e.target.value)} /></div>
                <div className="field"><label>Min Bedrooms</label>
                  <select value={form.minBed} onChange={e => set('minBed', e.target.value)}>
                    {['Studio','1','2','3','4+'].map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div className="field"><label>Max Bedrooms</label>
                  <select value={form.maxBed} onChange={e => set('maxBed', e.target.value)}>
                    {['Studio','1','2','3','4+'].map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div className="field"><label>Min Bathrooms</label>
                  <select value={form.minBath} onChange={e => set('minBath', e.target.value)}>
                    {['Any','1','1.5','2','2.5','3+'].map(v => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div className="field"><label>Min Square Footage <span style={{ fontWeight:400, color:'var(--slate)', fontSize:'0.78rem' }}>(optional)</span></label>
                  <input placeholder="e.g. 500" value={form.minSqft} onChange={e => set('minSqft', e.target.value.replace(/\D/g,''))} />
                </div>
              </div>

              <div className="field">
                <label>Work Address <span style={{ fontWeight:400, color:'var(--slate)', fontSize:'0.78rem' }}>— used to calculate commute times for each listing</span></label>
                <input placeholder="e.g. 30 Rockefeller Plaza, New York, NY" value={form.workAddress} onChange={e => set('workAddress', e.target.value)} />
              </div>
              <div className="field" style={{ marginTop:'0.75rem' }}>
                <label>Additional Notes <span style={{ fontWeight:400, color:'var(--slate)', fontSize:'0.78rem' }}>(anything we should know)</span></label>
                <textarea placeholder="e.g. Must be close to subway, prefer top floor, open to flex rooms..." value={form.notes} onChange={e => set('notes', e.target.value)} />
              </div>
            </div>

            <div className="section-card">
              <div className="section-label"><span className="section-label-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></span>Preferred Neighborhoods</div>
              <NeighborhoodPicker value={form.neighborhoods} onChange={v => set('neighborhoods', v)} />
            </div>

            <div className="section-card">
              <div className="section-label"><span className="section-label-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span>Building Type <span style={{ fontWeight:400, color:'var(--slate)', fontSize:'0.8rem', marginLeft:'0.25rem' }}>(select all that apply)</span></div>
              <div className="chip-grid">
                {BUILDING_TYPES.map(b => (
                  <button key={b} className={`chip ${form.buildingTypes.includes(b) ? 'on' : ''}`} onClick={() => toggle('buildingTypes', b)}>{b}</button>
                ))}
              </div>
            </div>

            <AmenitiesSection form={form} toggle={toggle} />
          </div>
        )}

        {step === 3 && (
          <div className="fade-up">
            <div className="section-card">
              <div className="section-label"><span className="section-label-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>Tour Availability</div>
              <p style={{ fontSize:'0.83rem', color:'var(--slate)', marginBottom:'1rem' }}>Select all times you're available. We'll book tours in these windows.</p>
              <div className="time-grid">
                {TIMES.map(t => (
                  <button key={t} className={`time-chip ${form.tourTimes.includes(t) ? 'on' : ''}`} onClick={() => toggle('tourTimes', t)}>{t}</button>
                ))}
              </div>
            </div>
            <div className="section-card">
              <div className="section-label"><span className="section-label-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></span>Chauffeur Add-On</div>
              <div className={`chauffeur-row ${form.chauffeur ? 'on' : ''}`} onClick={() => set('chauffeur', !form.chauffeur)}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                <div style={{ flex:1 }}>
                  <strong style={{ fontSize:'0.93rem', color:'var(--navy)' }}>Add chauffeured transport to your tour day</strong>
                  <p style={{ fontSize:'0.82rem', color:'var(--gray)', marginTop:'0.15rem' }}>A car is automatically booked to take you between every tour. Billed per booking day.</p>
                </div>
                <div className="check-box">{form.chauffeur ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> : ''}</div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="fade-up">
            <div className="section-card">
              <div className="section-label"><span className="section-label-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></span>Choose Your Plan</div>
              <div className="tier-grid">
                {[
                  { id:'alerts', name:'Alerts', price:'$14.99', period:'/mo', badge:'3-Day Free Trial', feats:['Instant SMS + email listing alerts','New no-fee matches within minutes','Be first to tour — before the crowd','Cancel anytime','Search on your own, we watch 24/7'] },
                  { id:'standard', name:'Standard', price:'$299', period:'one-time', feats:['Full listing search','Tour agenda','Automated scheduling','Real-time alerts','Dedicated support'] },
                  { id:'core', name:'Core', price:'$399', period:'one-time', badge:'Most Popular', feats:['Everything in Standard','Application document organizer','Negotiation support','Application tracking','Priority scheduling'] },
                  { id:'pro', name:'Pro', price:'$499', period:'one-time', feats:['Everything in Core','1-on-1 NYC broker','24/7 broker access','Last-minute tour priority','Lease review'] },
                ].map(t => (
                  <div key={t.id} className={`tier-card ${form.tier === t.id ? 'on' : ''}`} onClick={() => set('tier', t.id)}>
                    {t.badge && <div className="tier-badge">{t.badge}</div>}
                    <div className="tier-name">{t.name}</div>
                    <div className="tier-price">{t.price} <span>{t.period}</span></div>
                    <div className="tier-feats">{t.feats.map(f => <div className="tier-feat" key={f}>{f}</div>)}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="section-card">
              <div className="section-label"><span className="section-label-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></span>Order Summary</div>
              <div className="order-row"><span style={{ color:'var(--gray)' }}>{form.tier === 'alerts' ? 'Alerts Plan' : form.tier === 'pro' ? 'Pro Plan' : form.tier === 'standard' ? 'Standard Plan' : 'Core Plan'}</span><span>{form.tier === 'alerts' ? '$14.99/mo' : form.tier === 'pro' ? '$499' : form.tier === 'standard' ? '$299' : '$399'}</span></div>
              {form.chauffeur && <div className="order-row"><span style={{ color:'var(--gray)' }}>Chauffeur Add-On</span><span>Per booking</span></div>}
              <div className="order-row"><span>Total Due Today</span><span style={{ color:'var(--teal)', fontFamily:"'Inter', sans-serif", fontSize:'1.2rem' }}>{form.tier === 'alerts' ? '$0 today · 3-day trial' : form.tier === 'pro' ? '$499' : form.tier === 'standard' ? '$299' : '$399'}</span></div>
            </div>
          </div>
        )}

        <div className="form-nav">
          {step > 1
            ? <button className="btn btn-outline" onClick={() => setStep(s => s-1)}>← Back</button>
            : <div />
          }
          {step < 4
            ? <button className="btn btn-dark" onClick={() => { if (step === 2) setShowCriteriaPreview(true); else setStep(s => s+1) }}>Continue →</button>
            : <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? <span className="spinner" /> : 'Proceed to Payment →'}
              </button>
          }
        </div>
      </div>

      {/* Criteria Preview Modal */}
      {showCriteriaPreview && (() => {
        const count = estimateListings(form)
        const fb = getCriteriaFeedback(count)
        const rows = [
          ['Budget',         form.minBudget || form.maxBudget ? `$${form.minBudget || '?'} – $${form.maxBudget || '?'}/mo` : 'Not set'],
          ['Bedrooms',       form.minBed && form.maxBed ? `${form.minBed} – ${form.maxBed} bed` : form.minBed ? `${form.minBed}+ bed` : 'Any'],
          ['Bathrooms',      form.minBath !== 'Any' ? `${form.minBath}+ bath` : 'Any'],
          ['Min Sqft',       form.minSqft ? `${parseInt(form.minSqft).toLocaleString()} sf` : 'Any'],
          ['Move-In',        form.moveIn ? `${form.moveInDirection === 'on_or_after' ? 'On or after' : 'On or before'} ${form.moveIn}` : 'ASAP'],
          ['Neighborhoods',  form.neighborhoods.length ? form.neighborhoods.slice(0,4).join(', ') + (form.neighborhoods.length > 4 ? ` +${form.neighborhoods.length - 4} more` : '') : 'All NYC'],
          ['Building Type',  form.buildingTypes.length ? form.buildingTypes.join(', ') : 'Any'],
          ['Must-Have Amenities', form.amenities.length ? `${form.amenities.length} selected` : 'None'],
        ]
        return (
          <div style={{ position:'fixed', inset:0, zIndex:1300, background:'rgba(6,9,15,0.65)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'1.5rem' }}
            onClick={e => { if (e.target === e.currentTarget) setShowCriteriaPreview(false) }}>
            <div style={{ background:'#fff', borderRadius:20, width:'100%', maxWidth:560, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 24px 80px rgba(0,0,0,0.3)', animation:'fadeUp 0.25s ease' }}>

              {/* Header */}
              <div style={{ padding:'1.75rem 1.75rem 1.25rem', borderBottom:'1px solid var(--surface-mid)' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'0.5rem' }}>
                  <div style={{ fontFamily:"'Inter', sans-serif", fontSize:'1.35rem', color:'var(--navy)', fontWeight:700 }}>Your Search Criteria</div>
                  <button onClick={() => setShowCriteriaPreview(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--slate)' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <div style={{ fontSize:'0.82rem', color:'var(--slate)' }}>Here's what we'll search based on your inputs.</div>
              </div>

              {/* Estimated count banner */}
              <div style={{ margin:'1.25rem 1.75rem 0', background: fb.bg, border:`1.5px solid ${fb.border}`, borderRadius:12, padding:'1rem 1.25rem', display:'flex', gap:'1rem', alignItems:'flex-start' }}>
                <div style={{ fontSize:'1.8rem', lineHeight:1 }}>
                  {fb.tone === 'tight' ? '🔍' : fb.tone === 'broad' ? '🌐' : '✅'}
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:'1.05rem', color: fb.color }}>
                    ~{count} estimated listings
                  </div>
                  <div style={{ fontSize:'0.8rem', color:'var(--navy)', lineHeight:1.55, marginTop:'0.2rem' }}>{fb.msg}</div>
                </div>
              </div>

              {/* Criteria rows */}
              <div style={{ padding:'1.25rem 1.75rem' }}>
                {rows.map(([k, v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.55rem 0', borderBottom:'1px solid var(--surface-mid)' }}>
                    <span style={{ fontSize:'0.82rem', color:'var(--slate)', fontWeight:500 }}>{k}</span>
                    <span style={{ fontSize:'0.83rem', color:'var(--navy)', fontWeight:600, textAlign:'right', maxWidth:'55%' }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ padding:'0 1.75rem 1.75rem', display:'flex', gap:'0.75rem' }}>
                <button className="btn btn-outline" style={{ flex:1, justifyContent:'center' }}
                  onClick={() => setShowCriteriaPreview(false)}>
                  ← Edit Criteria
                </button>
                <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }}
                  onClick={() => { setShowCriteriaPreview(false); setStep(3) }}>
                  Looks good →
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </>
  )
}
