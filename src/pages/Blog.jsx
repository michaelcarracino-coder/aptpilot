import { useNavigate } from 'react-router-dom'
import { BLOG_POSTS } from '../data/blogPosts'

const css = `
.blog-page { max-width: 980px; margin: 0 auto; padding: 3rem 1.5rem 5rem; animation: fadeUp 0.4s ease both; }
.blog-header { text-align: center; margin-bottom: 3rem; }
.blog-header h1 {
  font-family: 'Cormorant Garamond', serif; font-size: 2.6rem; color: var(--navy);
  margin-bottom: 0.6rem;
}
.blog-header p { color: var(--gray); font-size: 1rem; max-width: 520px; margin: 0 auto; }
.blog-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
.blog-card {
  background: white; border-radius: 16px; overflow: hidden;
  box-shadow: var(--shadow); cursor: pointer; transition: all 0.2s;
  display: flex; flex-direction: column;
}
.blog-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
.blog-card-img {
  height: 160px; background: linear-gradient(135deg, var(--navy) 0%, #0D2A3A 100%);
  display: flex; align-items: center; justify-content: center; font-size: 3rem;
}
.blog-card-body { padding: 1.5rem; display: flex; flex-direction: column; flex: 1; }
.blog-card-cat {
  font-size: 0.7rem; font-weight: 700; color: var(--teal); text-transform: uppercase;
  letter-spacing: 0.06em; margin-bottom: 0.6rem;
}
.blog-card-title {
  font-family: 'Cormorant Garamond', serif; font-size: 1.35rem; color: var(--navy);
  margin-bottom: 0.6rem; line-height: 1.25;
}
.blog-card-excerpt { font-size: 0.85rem; color: var(--gray); line-height: 1.6; flex: 1; margin-bottom: 1rem; }
.blog-card-meta {
  font-size: 0.75rem; color: #94A3B8; display: flex; gap: 0.6rem; align-items: center;
  border-top: 1px solid var(--gray-light); padding-top: 0.85rem;
}
`

export default function Blog() {
  const navigate = useNavigate()

  return (
    <>
      <style>{css}</style>
      <div className="blog-page">
        <div className="blog-header">
          <h1>The AptPilot Journal</h1>
          <p>Renting tips, neighborhood guides, and everything you need to know about navigating NYC's apartment market.</p>
        </div>
        <div className="blog-grid">
          {BLOG_POSTS.map(post => (
            <div className="blog-card" key={post.slug} onClick={() => navigate(`/blog/${post.slug}`)}>
              <div className="blog-card-img">{post.image}</div>
              <div className="blog-card-body">
                <div className="blog-card-cat">{post.category}</div>
                <div className="blog-card-title">{post.title}</div>
                <div className="blog-card-excerpt">{post.excerpt}</div>
                <div className="blog-card-meta">
                  <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span>·</span>
                  <span>{post.readTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
