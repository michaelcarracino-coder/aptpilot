import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const NEIGHBORHOODS = ['Upper East Side','Upper West Side','Midtown','Chelsea','West Village','SoHo','Tribeca','Lower East Side','Williamsburg','Astoria','Park Slope','Hoboken','Jersey City','Long Island City','Bushwick']
const TIMES = ['8:00 AM','9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM','7:00 PM']

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
.intake h1 { font-family:'Playfair Display',serif; font-size:2rem; color:var(--navy); margin-bottom:0.3rem; }
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
.upload-area { border:2px dashed var(--surface-mid); border-radius:10px; padding:1.5rem; text-align:center; cursor:pointer; transition:all 0.2s; }
.upload-area:hover { border-color:var(--teal); background:var(--teal-pale); }
.tier-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:0.75rem; }
@media(max-width:700px){ .tier-grid{grid-template-columns:1fr;} }
.tier-card { border:2px solid var(--surface-mid); border-radius:12px; padding:1.25rem; cursor:pointer; transition:all 0.18s; position:relative; }
.tier-card.on { border-color:var(--teal); background:var(--teal-pale); }
.tier-badge { position:absolute;top:-10px;right:12px;background:var(--teal);color:#fff;font-size:0.7rem;font-weight:700;padding:0.2rem 0.6rem;border-radius:100px;text-transform:uppercase;letter-spacing:0.05em; }
.tier-name { font-weight:700; font-size:1rem; color:var(--navy); }
.tier-price { font-family:'Playfair Display',serif; font-size:1.7rem; color:var(--teal); }
.tier-price span { font-family:'Inter',sans-serif; font-size:0.8rem; color:var(--slate); font-weight:400; }
.tier-feats { margin-top:0.75rem; display:flex; flex-direction:column; gap:0.3rem; }
.tier-feat { font-size:0.8rem; color:#475569; display:flex; gap:0.4rem; }
.tier-feat::before { content:"✓"; color:var(--teal); font-weight:700; }
.chauffeur-row { border:2px solid var(--surface-mid); border-radius:12px; padding:1rem 1.25rem; display:flex;align-items:center;gap:1rem;cursor:pointer;transition:all 0.18s; }
.chauffeur-row:hover,.chauffeur-row.on { border-color:var(--teal); background:var(--teal-pale); }
.check-box { width:22px;height:22px;border-radius:6px;border:2px solid var(--surface-mid);display:flex;align-items:center;justify-content:center;font-size:0.8rem;color:#fff;flex-shrink:0;transition:all 0.15s; }
.chauffeur-row.on .check-box { background:var(--teal);border-color:var(--teal); }
.form-nav { display:flex;justify-content:space-between;align-items:center;margin-top:1.5rem; }
.order-row { display:flex;justify-content:space-between;padding:0.55rem 0;border-bottom:1px solid var(--surface-mid);font-size:0.88rem; }
.order-row:last-child { border:none;font-weight:700;font-size:1rem;padding-top:0.75rem; }
`

export default function Intake() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep]       = useState(1)
  const [saving, setSaving]   = useState(false)
  const [docs, setDocs]       = useState([])
  const [uploading, setUploading] = useState(false)
  const [docRole, setDocRole] = useState('tenant')
  const [checkedDocs, setCheckedDocs] = useState({})

  const toggleDocCheck = (id) => setCheckedDocs(c => ({ ...c, [id]: !c[id] }))
  const [form, setForm]       = useState({
    moveIn:'', minBed:'1', maxBed:'2', minBudget:'', maxBudget:'',
    neighborhoods:[], tourTimes:[], notes:'',
    tier:'core', chauffeur:false,
    phone:'',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const toggle = (k, v) => setForm(f => ({
    ...f, [k]: f[k].includes(v) ? f[k].filter(x => x !== v) : [...f[k], v]
  }))

  const STEPS = ['Your Info', 'Criteria', 'Availability', 'Plan']

  const handleSubmit = async () => {
    setSaving(true)
    const { data, error } = await supabase.from('searches').insert({
      user_id:       user.id,
      move_in:       form.moveIn || null,
      min_bed:       form.minBed,
      max_bed:       form.maxBed,
      min_budget:    form.minBudget ? parseInt(form.minBudget.replace(/\D/g,'')) : null,
      max_budget:    form.maxBudget ? parseInt(form.maxBudget.replace(/\D/g,'')) : null,
      neighborhoods: form.neighborhoods,
      tour_times:    form.tourTimes,
      notes:         form.notes,
      tier:          form.tier,
      chauffeur:     form.chauffeur,
      phone:         form.phone,
    })
    setSaving(false)
    if (!error) {
      navigate('/checkout')
    }
  }

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
            <div className="section-card">
              <div className="section-label"><span className="section-label-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></span>Upload Documents</div>

              <div className="doc-outer-layout">
                <div>
                  {/* Role toggle */}
                  <div className="role-tabs">
                    <button className={`role-tab ${docRole === 'tenant' ? 'on' : ''}`} onClick={() => setDocRole('tenant')}>I'm a Tenant</button>
                    <button className={`role-tab ${docRole === 'guarantor' ? 'on' : ''}`} onClick={() => setDocRole('guarantor')}>I Have a Guarantor</button>
                  </div>

                  {/* Checklist */}
                  <div className="doc-checklist">
                    {(docRole === 'tenant' ? TENANT_DOCS : GUARANTOR_DOCS).map((doc, i) => (
                      <div
                        key={doc.id}
                        className={`doc-check-item${checkedDocs[doc.id] ? ' checked' : ''}${doc.optional ? ' optional' : ''}`}
                        onClick={() => toggleDocCheck(doc.id)}
                      >
                        <div className="doc-check-box">
                          {checkedDocs[doc.id] && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                        <div>
                          <div className="doc-check-label">{i + 1}. {doc.label}</div>
                          {doc.sub && <div className="doc-check-sub">{doc.sub}</div>}
                          {doc.optional && <div className="doc-check-optional">Optional</div>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Upload area */}
                  <label className="upload-area" style={{ cursor: uploading ? 'wait' : 'pointer', display:'block' }}>
                    <input type="file" accept=".pdf,image/*" multiple style={{ display:'none' }} disabled={uploading} onChange={async (e) => {
                      const files = Array.from(e.target.files)
                      if (!files.length) return
                      setUploading(true)
                      const uploaded = []
                      for (const file of files) {
                        const path = `${user.id}/${Date.now()}-${file.name}`
                        const { error } = await supabase.storage.from('documents').upload(path, file)
                        if (!error) uploaded.push(file.name)
                      }
                      setDocs(d => [...d, ...uploaded])
                      setUploading(false)
                      e.target.value = ''
                    }} />
                    <div style={{ marginBottom:'0.5rem' }}>
                      {uploading
                        ? <span className="spinner" style={{ borderColor:'rgba(10,191,191,0.3)', borderTopColor:'var(--teal)', width:24, height:24, display:'inline-block' }} />
                        : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                      }
                    </div>
                    <p style={{ fontSize:'0.85rem', color:'var(--slate)' }}><strong style={{ color:'var(--teal)' }}>Click to upload</strong> or drag & drop<br />PDF, JPG, PNG</p>
                  </label>
                  {docs.map((d, i) => (
                    <div className="doc-item" key={i}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      {d}
                    </div>
                  ))}
                </div>

                {/* Sidenote */}
                <div className="doc-sidenote">
                  <div className="doc-sidenote-title">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    Why do I need to upload my documents?
                  </div>
                  <p className="doc-sidenote-body">
                    Having your documents prepared before viewing is vital to the approval process. Many apartments in NYC are first come, first serve — so having everything ready gives you a huge leg up against the competition.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="fade-up">
            <div className="section-card">
              <div className="section-label"><span className="section-label-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span>Apartment Criteria</div>
              <div className="grid-2" style={{ marginBottom:'1rem' }}>
                <div className="field"><label>Move-In Date</label><input type="date" value={form.moveIn} onChange={e => set('moveIn', e.target.value)} /></div>
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
              </div>
              <div className="field"><label>Must-Haves</label><textarea placeholder="e.g. In-unit laundry, doorman, no-fee, pet friendly..." value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
            </div>
            <div className="section-card">
              <div className="section-label"><span className="section-label-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></span>Preferred Neighborhoods</div>
              <div className="chip-grid">
                {NEIGHBORHOODS.map(n => (
                  <button key={n} className={`chip ${form.neighborhoods.includes(n) ? 'on' : ''}`} onClick={() => toggle('neighborhoods', n)}>{n}</button>
                ))}
              </div>
            </div>
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
                  { id:'standard', name:'Standard', price:'$299', feats:['Full listing search','Tour agenda','Automated scheduling','Real-time alerts','Dedicated support'] },
                  { id:'core', name:'Core', price:'$399', badge:'Most Popular', feats:['Everything in Standard','Auto-filled applications','Negotiation support','Application tracking','Priority scheduling'] },
                  { id:'pro', name:'Pro', price:'$499', feats:['Everything in Core','1-on-1 NYC broker','24/7 broker access','Last-minute tour priority','Lease review'] },
                ].map(t => (
                  <div key={t.id} className={`tier-card ${form.tier === t.id ? 'on' : ''}`} onClick={() => set('tier', t.id)}>
                    {t.badge && <div className="tier-badge">{t.badge}</div>}
                    <div className="tier-name">{t.name}</div>
                    <div className="tier-price">{t.price} <span>one-time</span></div>
                    <div className="tier-feats">{t.feats.map(f => <div className="tier-feat" key={f}>{f}</div>)}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="section-card">
              <div className="section-label"><span className="section-label-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></span>Order Summary</div>
              <div className="order-row"><span style={{ color:'var(--gray)' }}>{form.tier === 'pro' ? 'Pro Plan' : form.tier === 'standard' ? 'Standard Plan' : 'Core Plan'}</span><span>{form.tier === 'pro' ? '$499' : form.tier === 'standard' ? '$299' : '$399'}</span></div>
              {form.chauffeur && <div className="order-row"><span style={{ color:'var(--gray)' }}>Chauffeur Add-On</span><span>Per booking</span></div>}
              <div className="order-row"><span>Total Due Today</span><span style={{ color:'var(--teal)', fontFamily:"'Playfair Display',serif", fontSize:'1.2rem' }}>{form.tier === 'pro' ? '$499' : form.tier === 'standard' ? '$299' : '$399'}</span></div>
            </div>
          </div>
        )}

        <div className="form-nav">
          {step > 1
            ? <button className="btn btn-outline" onClick={() => setStep(s => s-1)}>← Back</button>
            : <div />
          }
          {step < 4
            ? <button className="btn btn-dark" onClick={() => setStep(s => s+1)}>Continue →</button>
            : <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                {saving ? <span className="spinner" /> : 'Proceed to Payment →'}
              </button>
          }
        </div>
      </div>
    </>
  )
}
