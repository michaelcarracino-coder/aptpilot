import { useParams, useNavigate, Navigate } from 'react-router-dom'
import { BLOG_POSTS } from '../data/blogPosts'

const css = `
.post-page { max-width: 680px; margin: 0 auto; padding: 3rem 1.5rem 5rem; animation: fadeUp 0.4s ease both; }
.post-back {
  display: inline-flex; align-items: center; gap: 0.4rem; color: var(--gray);
  font-size: 0.85rem; font-weight: 500; background: none; border: none; cursor: pointer;
  margin-bottom: 2rem; transition: color 0.15s; padding: 0;
}
.post-back:hover { color: var(--teal); }
.post-cat {
  font-size: 0.75rem; font-weight: 700; color: var(--teal); text-transform: uppercase;
  letter-spacing: 0.07em; margin-bottom: 0.75rem;
}
.post-title {
  font-family: 'Cormorant Garamond', serif; font-size: 2.4rem; color: var(--navy);
  line-height: 1.15; margin-bottom: 1rem;
}
.post-meta {
  font-size: 0.85rem; color: var(--gray); display: flex; gap: 0.6rem; align-items: center;
  margin-bottom: 2.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--gray-light);
}
.post-hero {
  font-size: 4rem; text-align: center; margin-bottom: 2.5rem;
  background: var(--teal-pale); border-radius: 16px; padding: 2.5rem;
}
.post-body { font-size: 1.02rem; line-height: 1.85; color: var(--text); }
.post-body h2 {
  font-family: 'Cormorant Garamond', serif; font-size: 1.6rem; color: var(--navy);
  margin: 2.25rem 0 0.9rem; line-height: 1.3;
}
.post-body p { margin-bottom: 1.1rem; }
.post-body ul { margin: 0 0 1.1rem 1.25rem; }
.post-body li { margin-bottom: 0.4rem; }
.post-cta {
  margin-top: 3rem; background: var(--navy); border-radius: 16px; padding: 2rem;
  text-align: center;
}
.post-cta h3 {
  font-family: 'Cormorant Garamond', serif; font-size: 1.5rem; color: white; margin-bottom: 0.6rem;
}
.post-cta p { color: #94A3B8; font-size: 0.9rem; margin-bottom: 1.25rem; }
`

function renderContent(content) {
  const blocks = content.trim().split('\n\n')
  return blocks.map((block, i) => {
    const trimmed = block.trim()
    if (trimmed.startsWith('## ')) {
      return <h2 key={i}>{trimmed.replace('## ', '')}</h2>
    }
    if (trimmed.startsWith('- ')) {
      const items = trimmed.split('\n').map(l => l.replace(/^- /, ''))
      return <ul key={i}>{items.map((it, j) => <li key={j}>{it}</li>)}</ul>
    }
    return <p key={i}>{trimmed}</p>
  })
}

export default function BlogPost() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const post = BLOG_POSTS.find(p => p.slug === slug)

  if (!post) return <Navigate to="/blog" replace />

  return (
    <>
      <style>{css}</style>
      <div className="post-page">
        <button className="post-back" onClick={() => navigate('/blog')}>← Back to Journal</button>
        <div className="post-cat">{post.category}</div>
        <h1 className="post-title">{post.title}</h1>
        <div className="post-meta">
          <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          <span>·</span>
          <span>{post.readTime}</span>
        </div>
        <div className="post-hero">{post.image}</div>
        <div className="post-body">
          {renderContent(post.content)}
        </div>
        <div className="post-cta">
          <h3>Ready to find your next apartment?</h3>
          <p>Let AptPilot handle the search, scheduling, and applications — starting at $299.</p>
          <button className="btn btn-primary" onClick={() => navigate('/signup')}>Start My Search →</button>
        </div>
      </div>
    </>
  )
}
