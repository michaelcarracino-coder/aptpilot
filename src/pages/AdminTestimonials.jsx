import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const ADMIN_EMAIL = 'aptpilot1@gmail.com'

const BLANK = { quote: '', name: '', role: '', initials: '', photo_url: '', rating: 5, active: true, sort_order: 0 }

const css = `
.admin-t { max-width:860px; margin:0 auto; padding:2rem 1.5rem 5rem; }
.admin-t h1 { font-family:'Fraunces', Georgia, serif; font-size:2rem; color:var(--navy); margin-bottom:0.25rem; }
.t-form { background:#fff; border-radius:var(--radius); box-shadow:var(--shadow); padding:1.75rem; margin-bottom:1.5rem; }
.t-form h2 { font-size:1rem; font-weight:700; color:var(--navy); margin-bottom:1.25rem; }
.t-row { background:#fff; border-radius:var(--radius); box-shadow:var(--shadow); padding:1.25rem 1.5rem; margin-bottom:0.75rem; display:flex; gap:1rem; align-items:flex-start; }
.t-quote { font-style:italic; font-size:0.9rem; color:var(--navy); line-height:1.6; margin-bottom:0.4rem; }
.t-author { font-size:0.8rem; color:var(--slate); font-weight:600; }
.t-role { font-size:0.77rem; color:var(--slate); }
.t-actions { display:flex; gap:0.5rem; flex-shrink:0; margin-left:auto; }
.stars { display:flex; gap:2px; margin-bottom:0.35rem; }
.inactive-badge { background:#FEF3C7; color:#D97706; font-size:0.7rem; font-weight:700; padding:0.15rem 0.5rem; border-radius:100px; margin-left:0.5rem; }
.initials-circle { width:40px; height:40px; border-radius:50%; background:linear-gradient(135deg,#0ABFBF,#00E5CC); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.82rem; color:var(--navy); flex-shrink:0; }
.t-sort { display:flex; flex-direction:column; gap:2px; }
.sort-btn { background:var(--surface); border:1px solid var(--surface-mid); border-radius:4px; width:22px; height:22px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:0.7rem; color:var(--slate); }
`

export default function AdminTestimonials() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [testimonials, setTestimonials] = useState([])
  const [form, setForm] = useState(BLANK)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (user) load() }, [user])

  async function load() {
    const { data } = await supabase.from('testimonials').select('*').order('sort_order').order('created_at')
    setTestimonials(data || [])
  }

  function startEdit(t) {
    setEditId(t.id)
    setForm({ quote: t.quote, name: t.name, role: t.role, initials: t.initials, photo_url: t.photo_url || '', rating: t.rating, active: t.active, sort_order: t.sort_order })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditId(null)
    setForm(BLANK)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, rating: parseInt(form.rating), sort_order: parseInt(form.sort_order) }
    if (editId) {
      await supabase.from('testimonials').update(payload).eq('id', editId)
    } else {
      await supabase.from('testimonials').insert(payload)
    }
    setSaving(false)
    cancelEdit()
    load()
  }

  async function toggleActive(t) {
    await supabase.from('testimonials').update({ active: !t.active }).eq('id', t.id)
    load()
  }

  async function deleteT(id) {
    if (!confirm('Delete this testimonial?')) return
    await supabase.from('testimonials').delete().eq('id', id)
    load()
  }

  async function moveOrder(t, dir) {
    const newOrder = t.sort_order + dir
    await supabase.from('testimonials').update({ sort_order: newOrder }).eq('id', t.id)
    load()
  }

  if (authLoading) return null
  if (!user) return <Navigate to="/login" replace />
  if (user.email !== ADMIN_EMAIL) return <Navigate to="/" replace />

  return (
    <>
      <style>{css}</style>
      <div className="admin-t" style={{ paddingTop: 88 }}>
        <h1>Testimonials</h1>
        <p style={{ color: 'var(--slate)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
          Add, edit, and reorder testimonials shown on the landing page. Only active testimonials are shown publicly.
        </p>

        {/* Form */}
        <div className="t-form">
          <h2>{editId ? 'Edit Testimonial' : 'Add Testimonial'}</h2>
          <form onSubmit={handleSave}>
            <div className="field" style={{ marginBottom: '0.75rem' }}>
              <label>Quote</label>
              <textarea
                rows={3}
                placeholder="I saved $4,200 in broker fees and had 6 tours scheduled in 48 hours..."
                value={form.quote}
                onChange={e => setForm(f => ({ ...f, quote: e.target.value }))}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div className="field">
                <label>Full Name</label>
                <input placeholder="Sophie R." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="field">
                <label>Role / Location</label>
                <input placeholder="Moved to Williamsburg, Brooklyn" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} required />
              </div>
              <div className="field">
                <label>Initials (2 chars)</label>
                <input placeholder="SR" maxLength={3} value={form.initials} onChange={e => setForm(f => ({ ...f, initials: e.target.value.toUpperCase() }))} required />
              </div>
              <div className="field">
                <label>Rating (1–5)</label>
                <select value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))}>
                  {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} star{n !== 1 ? 's' : ''}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Photo URL (optional)</label>
                <input placeholder="https://..." value={form.photo_url} onChange={e => setForm(f => ({ ...f, photo_url: e.target.value }))} />
              </div>
              <div className="field">
                <label>Sort Order</label>
                <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', fontWeight: 600, color: 'var(--navy)', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
                Show on landing page
              </label>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? <span className="spinner" /> : editId ? 'Save Changes' : '+ Add Testimonial'}
              </button>
              {editId && (
                <button className="btn btn-outline" type="button" onClick={cancelEdit}>Cancel</button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--navy)', marginBottom: '0.75rem' }}>
          {testimonials.length} Testimonial{testimonials.length !== 1 ? 's' : ''}
        </div>

        {testimonials.length === 0 && (
          <p style={{ color: 'var(--slate)', fontSize: '0.88rem' }}>No testimonials yet — add one above.</p>
        )}

        {testimonials.map(t => (
          <div className="t-row" key={t.id}>
            {/* Sort buttons */}
            <div className="t-sort">
              <button className="sort-btn" onClick={() => moveOrder(t, -1)}>▲</button>
              <button className="sort-btn" onClick={() => moveOrder(t, 1)}>▼</button>
            </div>

            {/* Avatar */}
            {t.photo_url
              ? <img src={t.photo_url} alt={t.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              : <div className="initials-circle">{t.initials}</div>
            }

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="stars">
                {[...Array(t.rating || 5)].map((_, i) => (
                  <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill="#C9A96E" stroke="#C9A96E" strokeWidth="0.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                ))}
              </div>
              <div className="t-quote">"{t.quote}"</div>
              <div className="t-author">
                {t.name}
                {!t.active && <span className="inactive-badge">Hidden</span>}
              </div>
              <div className="t-role">{t.role}</div>
            </div>

            {/* Actions */}
            <div className="t-actions">
              <button
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem' }}
                onClick={() => toggleActive(t)}
              >
                {t.active ? 'Hide' : 'Show'}
              </button>
              <button
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem' }}
                onClick={() => startEdit(t)}
              >
                Edit
              </button>
              <button
                className="btn btn-outline btn-sm"
                style={{ color: '#EF4444', borderColor: '#FECACA', fontSize: '0.75rem' }}
                onClick={() => deleteT(t.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
