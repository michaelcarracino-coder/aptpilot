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
`

export default function Documents() {
  const { user } = useAuth()
  const [role, setRole] = useState('tenant')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [collating, setCollating] = useState(false)
  const [deletingPath, setDeletingPath] = useState(null)

  useEffect(() => { if (user) loadDocs() }, [user, role])

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

  const docList = role === 'tenant' ? TENANT_DOCS : GUARANTOR_DOCS
  const totalRequired = docList.filter(d => !d.optional).length
  const completedRequired = docList.filter(d => !d.optional && rows.some(r => r.doc_id === d.id)).length
  const pct = totalRequired ? Math.round((completedRequired / totalRequired) * 100) : 0

  return (
    <>
      <style>{css}</style>
      <div className="docs-page">
        <h1>My Documents</h1>
        <p className="sub">All your files in one place — download individually or as a single collated PDF.</p>

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
                        {done
                          ? files.map(row => (
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
                          : <div className="doc-empty">No file uploaded yet — go to your intake form to upload.</div>
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
