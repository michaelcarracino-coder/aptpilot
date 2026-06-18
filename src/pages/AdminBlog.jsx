import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// IMPORTANT: replace this with your actual email — only this account can access /admin/blog
const ADMIN_EMAIL = 'michael.carracino@gmail.com'

const css = `
.admin-page { max-width: 900px; margin: 0 auto; padding: 2.5rem 1.5rem 5rem; animation: fadeUp 0.4s ease both; }
.admin-header { display:flex; justify-content:space-between; align-items:center; margin-bottom: 2rem; flex-wrap:wrap; gap:1rem; }
.admin-header h1 { font-family:'Cormorant Garamond', serif; font-size: 2rem; color: var(--navy); }
.admin-form { background:white; border-radius:16px; padding:2rem; box-shadow:var(--shadow); margin-bottom:2rem; }
.admin-form h2 { font-size:1.1rem; font-weight:700; color:var(--navy); margin-bottom:1.25rem; }
.admin-grid { display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem; }
@media(max-width:600px){ .admin-grid { grid-template-columns:1fr; } }
.admin-help { font-size:0.78rem; color:var(--gray); margin-top:0.3rem; }
.admin-list { display:flex; flex-direction:column; gap:0.75rem; }
.admin-post-row {
  background:white; border-radius:12px; padding:1.25rem 1.5rem; box-shadow:var(--shadow);
  display:flex; justify-content:space-between; align-items:center; gap:1rem; flex-wrap:wrap;
}
.admin-post-title { font-weight:700; color:var(--navy); font-size:0.95rem; }
.admin-post-meta { font-size:0.78rem; color:var(--gray); margin-top:0.2rem; }
.admin-post-actions { display:flex; gap:0.5rem; }
.admin-badge { font-size:0.7rem; font-weight:700; padding:0.2rem 0.6rem; border-radius:100px; text-transform:uppercase; letter-spacing:0.04em; }
.admin-badge.published { background:#ECFDF5; color:#059669; }
.admin-badge.draft { background:#FEF3C7; color:#D97706; }
`

export default function AdminBlog() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', content: '', category: 'Renting Tips', image: '🏙️', published: true
  })
  const [message, setMessage] = useState('')

  useEffect(() => { loadPosts() }, [])

  async function loadPosts() {
    setLoading(true)
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  // Auto-generate slug from title
  const handleTitleChange = (title) => {
    setForm(f => ({
      ...f,
      title,
      slug: editingId ? f.slug : title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }))
  }

  const resetForm = () => {
    setForm({ title:'', slug:'', excerpt:'', content:'', category:'Renting Tips', image:'🏙️', published:true })
    setEditingId(null)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    if (editingId) {
      const { error } = await supabase.from('blog_posts').update(form).eq('id', editingId)
      if (error) setMessage('Error: ' + error.message)
      else { setMessage('Post updated ✓'); resetForm(); loadPosts() }
    } else {
      const { error } = await supabase.from('blog_posts').insert(form)
      if (error) setMessage('Error: ' + error.message)
      else { setMessage('Post published ✓'); resetForm(); loadPosts() }
    }
    setSaving(false)
  }

  const handleEdit = (post) => {
    setForm({
      title: post.title, slug: post.slug, excerpt: post.excerpt,
      content: post.content, category: post.category, image: post.image, published: post.published
    })
    setEditingId(post.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this post permanently?')) return
    await supabase.from('blog_posts').delete().eq('id', id)
    loadPosts()
  }

  const togglePublished = async (post) => {
    await supabase.from('blog_posts').update({ published: !post.published }).eq('id', post.id)
    loadPosts()
  }

  // Gate: only the admin email can access this page
  if (!user) return <Navigate to="/login" replace />
  if (user.email !== ADMIN_EMAIL) return <Navigate to="/" replace />

  return (
    <>
      <style>{css}</style>
      <div className="admin-page">
        <div className="admin-header">
          <h1>Blog Admin</h1>
        </div>

        <form className="admin-form" onSubmit={handleSave}>
          <h2>{editingId ? 'Edit Post' : 'Write New Post'}</h2>

          <div className="field" style={{ marginBottom: '1rem' }}>
            <label>Title</label>
            <input value={form.title} onChange={e => handleTitleChange(e.target.value)} placeholder="How to Avoid Broker Fees in NYC" required />
          </div>

          <div className="admin-grid">
            <div className="field">
              <label>URL Slug</label>
              <input value={form.slug} onChange={e => setForm(f => ({...f, slug: e.target.value}))} placeholder="avoid-broker-fees-nyc" required />
              <p className="admin-help">aptpilot.com/blog/{form.slug || '...'}</p>
            </div>
            <div className="field">
              <label>Category</label>
              <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>
                <option>Renting Tips</option>
                <option>Neighborhood Guides</option>
                <option>Application Tips</option>
                <option>Market News</option>
                <option>Company Updates</option>
              </select>
            </div>
          </div>

          <div className="admin-grid">
            <div className="field">
              <label>Emoji / Icon</label>
              <input value={form.image} onChange={e => setForm(f => ({...f, image: e.target.value}))} placeholder="🏙️" />
            </div>
            <div className="field">
              <label>Status</label>
              <select value={form.published} onChange={e => setForm(f => ({...f, published: e.target.value === 'true'}))}>
                <option value="true">Published</option>
                <option value="false">Draft</option>
              </select>
            </div>
          </div>

          <div className="field" style={{ marginBottom: '1rem' }}>
            <label>Excerpt (1-2 sentences, shown on blog list page)</label>
            <textarea value={form.excerpt} onChange={e => setForm(f => ({...f, excerpt: e.target.value}))} style={{ minHeight: '60px' }} required />
          </div>

          <div className="field" style={{ marginBottom: '1.25rem' }}>
            <label>Content</label>
            <textarea
              value={form.content}
              onChange={e => setForm(f => ({...f, content: e.target.value}))}
              style={{ minHeight: '320px', fontFamily: 'monospace', fontSize: '0.85rem' }}
              placeholder={"Write your post here.\n\nUse ## for headings:\n## My Section Title\n\nUse - for bullet lists:\n- Point one\n- Point two\n\nSeparate paragraphs with a blank line."}
              required
            />
            <p className="admin-help">Use blank lines between paragraphs. Use "## Heading" for section headers and "- item" for bullet lists.</p>
          </div>

          {message && <p style={{ marginBottom: '1rem', color: message.startsWith('Error') ? '#EF4444' : '#059669', fontWeight: 600, fontSize: '0.88rem' }}>{message}</p>}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? <span className="spinner" /> : (editingId ? 'Update Post' : 'Publish Post')}
            </button>
            {editingId && <button className="btn btn-outline" type="button" onClick={resetForm}>Cancel Edit</button>}
          </div>
        </form>

        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: '1rem' }}>All Posts ({posts.length})</h2>
        {loading ? (
          <p style={{ color: 'var(--gray)' }}>Loading...</p>
        ) : (
          <div className="admin-list">
            {posts.map(post => (
              <div className="admin-post-row" key={post.id}>
                <div>
                  <span className="admin-post-title">{post.image} {post.title}</span>
                  <div className="admin-post-meta">
                    /{post.slug} · {post.category} ·{' '}
                    <span className={`admin-badge ${post.published ? 'published' : 'draft'}`}>{post.published ? 'Published' : 'Draft'}</span>
                  </div>
                </div>
                <div className="admin-post-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => togglePublished(post)}>{post.published ? 'Unpublish' : 'Publish'}</button>
                  <button className="btn btn-outline btn-sm" onClick={() => handleEdit(post)}>Edit</button>
                  <button className="btn btn-outline btn-sm" style={{ color: '#EF4444', borderColor: '#FECACA' }} onClick={() => handleDelete(post.id)}>Delete</button>
                </div>
              </div>
            ))}
            {posts.length === 0 && <p style={{ color: 'var(--gray)', fontSize: '0.9rem' }}>No posts yet — write your first one above.</p>}
          </div>
        )}
      </div>
    </>
  )
}
