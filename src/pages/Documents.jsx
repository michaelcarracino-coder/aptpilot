import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const TENANT_DOCS = [
  { id:'t1', label:'ID or Passport' },
  { id:'t2', label:'Offer Letter or Letter of Employment' },
  { id:'t3', label:'2 Most Recent Bank Statements' },
  { id:'t4', label:'Top 2 Pages of 2 Most Recent Tax Returns' },
  { id:'t5', label:'6 Months Proof of Rent Payments or Landlord Letter', optional: true },
]

const GUARANTOR_DOCS = [
  { id:'g1', label:'ID or Passport' },
  { id:'g2', label:'Letter of Employment' },
  { id:'g3', label:'2 Most Recent Paystubs' },
  { id:'g4', label:'2 Most Recent Bank Statements' },
  { id:'g5', label:'Top 2 Pages of 2 Most Recent Tax Returns' },
  { id:'g6', label:'2 Most Recent W-2s', optional: true },
]

const css = `
.docs-page { max-width: 960px; margin: 0 auto; padding: 2.5rem 2rem 5rem; }
.docs-page h1 { font-family:'Playfair Display',serif; font-size:2rem; color:var(--navy); margin-bottom:0.3rem; }
.docs-page .sub { color:var(--slate); font-size:0.9rem; margin-bottom:2rem; }
.docs-role-tabs { display:flex; gap:0; margin-bottom:1.75rem; background:var(--surface); border-radius:9px; padding:3px; max-width:320px; }
.docs-role-tab { flex:1; padding:0.5rem 0.75rem; border-radius:7px; border:none; font-size:0.83rem; font-weight:600; cursor:pointer; background:transparent; color:var(--slate); transition:all 0.15s; font-family:inherit; }
.docs-role-tab.on { background:#fff; color:var(--navy); box-shadow:0 1px 4px rgba(12,22,40,0.1); }
.docs-header-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.25rem; flex-wrap:wrap; gap:0.75rem; }
.docs-section { display:flex; flex-direction:column; gap:0.75rem; }
.doc-slot { background:#fff; border-radius:12px; box-shadow:var(--shadow); overflow:hidden; }
.doc-slot-header { display:flex; align-items:center; gap:0.9rem; padding:1rem 1.25rem; border-bottom:1.5px solid var(--surface-mid); }
.doc-slot-num { width:28px; height:28px; border-radius:50%; background:var(--teal); color:#fff; font-size:0.8rem; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.doc-slot-num.empty { background:var(--surface-mid); color:var(--slate); }
.doc-slot-title { font-weight:700; font-size:0.9rem; color:var(--navy); flex:1; }
.doc-slot-badge { font-size:0.68rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; padding:0.18rem 0.55rem; border-radius:100px; }
.doc-slot-badge.done { background:#ECFDF5; color:#059669; }
.doc-slot-badge.missing { background:#FEF3C7; color:#D97706; }
.doc-slot-badge.optional { background:var(--surface); color:var(--slate); }
.doc-slot-body { padding:0.85rem 1.25rem; display:flex; flex-direction:column; gap:0.5rem; }
.doc-file-row { display:flex; align-items:center; gap:0.65rem; padding:0.6rem 0.75rem; background:var(--surface); border-radius:8px; font-size:0.83rem; }
.doc-file-name { flex:1; color:var(--navy); font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.doc-file-actions { display:flex; gap:0.4rem; flex-shrink:0; }
.doc-file-btn { display:inline-flex; align-items:center; gap:0.3rem; font-size:0.75rem; font-weight:600; padding:0.28rem 0.65rem; border-radius:6px; border:none; cursor:pointer; font-family:inherit; transition:all 0.15s; }
.doc-file-btn.view { background:var(--teal-pale); color:var(--teal); }
.doc-file-btn.view:hover { background:rgba(10,191,191,0.2); }
.doc-file-btn.del { background:#FEF2F2; color:#EF4444; }
.doc-file-btn.del:hover { background:#FECACA; }
.doc-empty { font-size:0.82rem; color:var(--slate); font-style:italic; }
.collate-btn { display:inline-flex; align-items:center; gap:0.5rem; background:var(--navy); color:#fff; border:none; border-radius:10px; padding:0.65rem 1.25rem; font-size:0.88rem; font-weight:700; cursor:pointer; font-family:inherit; transition:all 0.15s; }
.collate-btn:hover { background:#1a2d4f; }
.collate-btn:disabled { opacity:0.6; cursor:not-allowed; }
.progress-bar-wrap { background:var(--surface-mid); border-radius:100px; height:6px; overflow:hidden; margin-bottom:0.4rem; }
.progress-bar-fill { background:var(--teal); height:100%; border-radius:100px; transition:width 0.3s ease; }
.progress-label { font-size:0.78rem; color:var(--slate); }
.summary-modal-overlay { position:fixed;inset:0;background:rgba(6,9,15,0.55);backdrop-filter:blur(6px);z-index:1000;display:flex;align-items:center;justify-content:center;padding:1.5rem; }
.summary-modal { background:#fff;border-radius:20px;max-width:480px;width:100%;padding:2rem;box-shadow:0 24px 80px rgba(0,0,0,0.22);animation:fadeUp 0.25s ease; }
.summary-modal h2 { font-family:'Playfair Display',serif;font-size:1.35rem;color:var(--navy);margin-bottom:0.3rem; }
.summary-modal .modal-sub { font-size:0.82rem;color:var(--slate);margin-bottom:1.4rem;line-height:1.55; }
.summary-field { display:flex;flex-direction:column;gap:0.3rem;margin-bottom:0.9rem; }
.summary-field label { font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--slate); }
.summary-field input, .summary-field select { padding:0.55rem 0.85rem;border:1.5px solid var(--surface-mid);border-radius:9px;font-size:0.88rem;font-family:inherit;color:var(--navy);outline:none;transition:border-color 0.15s; }
.summary-field input:focus, .summary-field select:focus { border-color:var(--teal); }
.summary-field-row { display:grid;grid-template-columns:1fr 1fr;gap:0.75rem; }
`

export default function Documents() {
  const { user } = useAuth()
  const [role, setRole] = useState('tenant')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [collating, setCollating] = useState(false)
  const [deletingPath, setDeletingPath] = useState(null)
  const [uploadingSlot, setUploadingSlot] = useState(null)
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [generatingSummary, setGeneratingSummary] = useState(false)
  const [profile, setProfile] = useState(null)
  const [search, setSearch] = useState(null)
  const [summaryFields, setSummaryFields] = useState({ phone: '', employer: '', income: '', credit: '' })

  useEffect(() => { if (user) { loadDocs(); loadMeta() } }, [user, role])

  async function loadMeta() {
    const { data: p } = await supabase.from('profiles').select('full_name, referral_code').eq('id', user.id).single()
    setProfile(p)
    const { data: s } = await supabase.from('searches').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single()
    setSearch(s)
  }

  async function loadDocs() {
    setLoading(true)
    const { data } = await supabase
      .from('user_documents')
      .select('*')
      .eq('user_id', user.id)
      .eq('doc_role', role)
      .order('created_at', { ascending: true })
    setRows(data || [])
    setLoading(false)
  }

  async function handleDelete(row) {
    setDeletingPath(row.storage_path)
    await supabase.storage.from('documents').remove([row.storage_path])
    await supabase.from('user_documents').delete().eq('id', row.id)
    setRows(r => r.filter(x => x.id !== row.id))
    setDeletingPath(null)
  }

  async function viewFile(path) {
    const { data } = await supabase.storage.from('documents').createSignedUrl(path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  async function handleUpload(slot, file) {
    if (!file) return
    setUploadingSlot(slot.id)
    const ext = file.name.split('.').pop()
    const path = `${user.id}/${role}/${slot.id}/${Date.now()}.${ext}`
    const { error: storageErr } = await supabase.storage.from('documents').upload(path, file, { upsert: false })
    if (!storageErr) {
      await supabase.from('user_documents').insert({
        user_id: user.id,
        doc_id: slot.id,
        doc_role: role,
        file_name: file.name,
        storage_path: path,
      })
      await loadDocs()
    }
    setUploadingSlot(null)
  }

  async function downloadFile(path, name) {
    const { data } = await supabase.storage.from('documents').createSignedUrl(path, 60)
    if (!data?.signedUrl) return
    const a = document.createElement('a')
    a.href = data.signedUrl
    a.download = name
    a.click()
  }

  async function collateAndDownload() {
    if (!rows.length) return
    setCollating(true)
    try {
      const { PDFDocument } = await import('pdf-lib')
      const merged = await PDFDocument.create()
      const docList = role === 'tenant' ? TENANT_DOCS : GUARANTOR_DOCS

      // process in checklist order
      for (const slot of docList) {
        const slotFiles = rows.filter(r => r.doc_id === slot.id)
        for (const row of slotFiles) {
          const { data } = await supabase.storage.from('documents').createSignedUrl(row.storage_path, 120)
          if (!data?.signedUrl) continue
          const resp = await fetch(data.signedUrl)
          const bytes = await resp.arrayBuffer()
          const lowerName = row.file_name.toLowerCase()
          try {
            if (lowerName.endsWith('.pdf')) {
              const src = await PDFDocument.load(bytes)
              const pages = await merged.copyPages(src, src.getPageIndices())
              pages.forEach(p => merged.addPage(p))
            } else {
              // image (jpg/png)
              const isJpg = lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')
              const img = isJpg
                ? await merged.embedJpg(bytes)
                : await merged.embedPng(bytes)
              const page = merged.addPage([img.width, img.height])
              page.drawImage(img, { x:0, y:0, width:img.width, height:img.height })
            }
          } catch (e) {
            console.warn('Skipped file:', row.file_name, e.message)
          }
        }
      }

      const pdfBytes = await merged.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `AptPilot_Documents_${role}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Collation failed:', e)
      alert('Could not generate PDF. Please try again.')
    }
    setCollating(false)
  }

  async function generateSummary() {
    setGeneratingSummary(true)
    try {
      const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib')
      const doc = await PDFDocument.create()
      const page = doc.addPage([612, 792])
      const { width, height } = page.getSize()
      const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)
      const fontReg  = await doc.embedFont(StandardFonts.Helvetica)
      const navy  = rgb(0.047, 0.086, 0.157)
      const teal  = rgb(0.039, 0.749, 0.749)
      const slate = rgb(0.42, 0.48, 0.56)
      const white = rgb(1, 1, 1)
      const light = rgb(0.95, 0.98, 0.98)
      const M = 52
      let y = height - M

      // Header bar
      page.drawRectangle({ x: 0, y: height - 72, width, height: 72, color: navy })
      page.drawText('AptPilot', { x: M, y: height - 44, size: 22, font: fontBold, color: white })
      page.drawText('Applicant Summary', { x: M, y: height - 62, size: 10, font: fontReg, color: teal })
      const dateStr = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' })
      page.drawText(dateStr, { x: width - M - fontReg.widthOfTextAtSize(dateStr, 9), y: height - 52, size: 9, font: fontReg, color: rgb(0.6, 0.7, 0.8) })
      y = height - 100

      const section = (title) => {
        y -= 10
        page.drawRectangle({ x: M, y: y - 2, width: width - M * 2, height: 22, color: light })
        page.drawRectangle({ x: M, y: y - 2, width: 3, height: 22, color: teal })
        page.drawText(title.toUpperCase(), { x: M + 10, y: y + 5, size: 8.5, font: fontBold, color: navy })
        y -= 28
      }
      const row = (label, value) => {
        if (!value) return
        page.drawText(label, { x: M, y, size: 9, font: fontReg, color: slate })
        page.drawText(String(value), { x: M + 160, y, size: 9, font: fontBold, color: navy })
        y -= 18
      }

      section('Applicant Information')
      row('Name',    profile?.full_name || '—')
      row('Email',   user.email)
      row('Phone',   summaryFields.phone || '—')
      row('Employer', summaryFields.employer || '—')
      y -= 4

      section('Financial Profile')
      row('Annual Income',      summaryFields.income ? `$${Number(summaryFields.income).toLocaleString()}` : '—')
      row('Credit Score Range', summaryFields.credit || '—')
      if (search?.max_budget)
        row('40x Requirement',  `$${(search.max_budget * 40).toLocaleString()}/yr gross income`)
      y -= 4

      section('Rental Criteria')
      if (search?.min_budget && search?.max_budget)
        row('Budget',       `$${search.min_budget.toLocaleString()} – $${search.max_budget.toLocaleString()}/mo`)
      if (search?.min_bed != null)
        row('Bedrooms',     `${search.min_bed}${search.max_bed && search.max_bed !== search.min_bed ? ` – ${search.max_bed}` : ''}`)
      row('Move-In',        search?.move_in || 'Flexible')
      if (search?.neighborhoods?.length)
        row('Neighborhoods', search.neighborhoods.slice(0, 4).join(', ') + (search.neighborhoods.length > 4 ? ' +more' : ''))
      y -= 4

      section('Documents Included')
      const allDocs = [...TENANT_DOCS, ...GUARANTOR_DOCS]
      const { data: allRows } = await supabase.from('user_documents').select('doc_id').eq('user_id', user.id)
      const uploadedIds = new Set((allRows || []).map(r => r.doc_id))
      for (const d of allDocs) {
        const uploaded = uploadedIds.has(d.id)
        page.drawText(uploaded ? '✓' : '○', { x: M, y, size: 9, font: fontBold, color: uploaded ? teal : slate })
        page.drawText(d.label + (d.optional ? ' (optional)' : ''), { x: M + 18, y, size: 9, font: fontReg, color: uploaded ? navy : slate })
        y -= 16
      }

      // Footer
      page.drawLine({ start: { x: M, y: 48 }, end: { x: width - M, y: 48 }, thickness: 0.5, color: rgb(0.88, 0.91, 0.94) })
      page.drawText('Generated by AptPilot · aptpilot.co', { x: M, y: 32, size: 8, font: fontReg, color: slate })
      page.drawText('This document is for informational purposes only and does not constitute a formal rental application.', { x: M, y: 18, size: 7, font: fontReg, color: rgb(0.7, 0.75, 0.8) })

      const bytes = await doc.save()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `AptPilot_Summary_${(profile?.full_name || 'Applicant').replace(/\s+/g, '_')}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      setShowSummaryModal(false)
    } catch (e) {
      console.error('Summary generation failed:', e)
      alert('Could not generate summary. Please try again.')
    }
    setGeneratingSummary(false)
  }

  const docList = role === 'tenant' ? TENANT_DOCS : GUARANTOR_DOCS
  const totalRequired = docList.filter(d => !d.optional).length
  const completedRequired = docList.filter(d => !d.optional && rows.some(r => r.doc_id === d.id)).length
  const pct = totalRequired ? Math.round((completedRequired / totalRequired) * 100) : 0

  return (
    <>
      <style>{css}</style>

      {showSummaryModal && (
        <div className="summary-modal-overlay" onClick={e => e.target === e.currentTarget && setShowSummaryModal(false)}>
          <div className="summary-modal">
            <h2>Applicant Summary Sheet</h2>
            <p className="modal-sub">Fill in any missing details — we'll combine this with your profile, search criteria, and document checklist into a clean PDF you can hand any landlord.</p>
            <div className="summary-field-row">
              <div className="summary-field">
                <label>Phone Number</label>
                <input placeholder="(212) 555-0100" value={summaryFields.phone} onChange={e => setSummaryFields(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="summary-field">
                <label>Employer / Company</label>
                <input placeholder="Acme Corp" value={summaryFields.employer} onChange={e => setSummaryFields(f => ({ ...f, employer: e.target.value }))} />
              </div>
            </div>
            <div className="summary-field-row">
              <div className="summary-field">
                <label>Annual Gross Income</label>
                <input type="number" placeholder="120000" value={summaryFields.income} onChange={e => setSummaryFields(f => ({ ...f, income: e.target.value }))} />
              </div>
              <div className="summary-field">
                <label>Credit Score Range</label>
                <select value={summaryFields.credit} onChange={e => setSummaryFields(f => ({ ...f, credit: e.target.value }))}>
                  <option value="">Select range</option>
                  <option>750+</option>
                  <option>700–749</option>
                  <option>650–699</option>
                  <option>600–649</option>
                  <option>Below 600</option>
                </select>
              </div>
            </div>
            <div style={{ display:'flex', gap:'0.75rem', marginTop:'0.5rem' }}>
              <button className="collate-btn" style={{ flex:1, justifyContent:'center' }} onClick={generateSummary} disabled={generatingSummary}>
                {generatingSummary
                  ? <><span className="spinner" style={{ borderColor:'rgba(255,255,255,0.3)', borderTopColor:'#fff', width:14, height:14, display:'inline-block' }} /> Generating…</>
                  : 'Download Summary PDF'
                }
              </button>
              <button className="btn btn-outline" onClick={() => setShowSummaryModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="docs-page">
        <h1>My Documents</h1>
        <p className="sub">Upload once, use everywhere — download individual files or a single collated PDF package ready to hand any landlord.</p>

        <div className="docs-role-tabs">
          <button className={`docs-role-tab ${role === 'tenant' ? 'on' : ''}`} onClick={() => setRole('tenant')}>Tenant</button>
          <button className={`docs-role-tab ${role === 'guarantor' ? 'on' : ''}`} onClick={() => setRole('guarantor')}>Guarantor</button>
        </div>

        {/* Progress */}
        <div style={{ marginBottom:'1.5rem', maxWidth:400 }}>
          <div className="progress-bar-wrap">
            <div className="progress-bar-fill" style={{ width:`${pct}%` }} />
          </div>
          <div className="progress-label">{completedRequired} of {totalRequired} required documents uploaded</div>
        </div>

        <div className="docs-header-row">
          <span style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--navy)' }}>
            {rows.length} file{rows.length !== 1 ? 's' : ''} uploaded
          </span>
          <button className="collate-btn" style={{ background:'var(--teal)', color:'#0C1628' }} onClick={() => setShowSummaryModal(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            Summary Sheet
          </button>
          <button className="collate-btn" onClick={collateAndDownload} disabled={collating || rows.length === 0}>
            {collating
              ? <><span className="spinner" style={{ borderColor:'rgba(255,255,255,0.3)', borderTopColor:'#fff', width:14, height:14, display:'inline-block' }} /> Generating PDF…</>
              : <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download Complete Package</>
            }
          </button>
        </div>

        {loading
          ? <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}><div className="spinner" style={{ borderColor:'rgba(10,191,191,0.3)', borderTopColor:'var(--teal)', width:28, height:28 }} /></div>
          : (
            <div className="docs-section">
              {docList.map((slot, i) => {
                const files = rows.filter(r => r.doc_id === slot.id)
                const done = files.length > 0
                return (
                  <div className="doc-slot" key={slot.id}>
                    <div className="doc-slot-header">
                      <div className={`doc-slot-num ${done ? '' : 'empty'}`}>{done
                        ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        : i + 1
                      }</div>
                      <div className="doc-slot-title">{slot.label}</div>
                      <span className={`doc-slot-badge ${done ? 'done' : slot.optional ? 'optional' : 'missing'}`}>
                        {done ? `${files.length} file${files.length !== 1 ? 's' : ''}` : slot.optional ? 'Optional' : 'Missing'}
                      </span>
                    </div>
                    {(done || !slot.optional) && (
                      <div className="doc-slot-body">
                        <label style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', cursor:'pointer', fontSize:'0.8rem', fontWeight:600, color:'var(--teal)', padding:'0.35rem 0', alignSelf:'flex-start' }}>
                          {uploadingSlot === slot.id
                            ? <><span className="spinner" style={{ borderColor:'rgba(10,191,191,0.3)', borderTopColor:'var(--teal)', width:12, height:12, display:'inline-block' }} /> Uploading…</>
                            : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> {done ? 'Upload another' : 'Upload file'}</>
                          }
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display:'none' }} onChange={e => handleUpload(slot, e.target.files[0])} disabled={uploadingSlot === slot.id} />
                        </label>
                        {done && files.map(row => (
                            <div className="doc-file-row" key={row.id}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                              <span className="doc-file-name">{row.file_name}</span>
                              <div className="doc-file-actions">
                                <button className="doc-file-btn view" onClick={() => viewFile(row.storage_path)}>
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                  View
                                </button>
                                <button className="doc-file-btn view" onClick={() => downloadFile(row.storage_path, row.file_name)}>
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                  Download
                                </button>
                                <button
                                  className="doc-file-btn del"
                                  onClick={() => handleDelete(row)}
                                  disabled={deletingPath === row.storage_path}
                                >
                                  {deletingPath === row.storage_path ? '…' : '✕'}
                                </button>
                              </div>
                            </div>
                          ))
                          : null
                        }
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        }
      </div>
    </>
  )
}
