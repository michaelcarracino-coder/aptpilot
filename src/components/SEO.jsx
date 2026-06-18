import { useEffect } from 'react'

// Lightweight SEO helper — updates document title and meta tags per page.
// No extra dependencies needed (avoids react-helmet version conflicts).
export default function SEO({ title, description, canonical }) {
  useEffect(() => {
    if (title) document.title = title

    const setMeta = (name, content, isProperty = false) => {
      if (!content) return
      const attr = isProperty ? 'property' : 'name'
      let tag = document.querySelector(`meta[${attr}="${name}"]`)
      if (!tag) {
        tag = document.createElement('meta')
        tag.setAttribute(attr, name)
        document.head.appendChild(tag)
      }
      tag.setAttribute('content', content)
    }

    setMeta('description', description)
    setMeta('og:title', title, true)
    setMeta('og:description', description, true)
    setMeta('twitter:title', title)
    setMeta('twitter:description', description)

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]')
      if (!link) {
        link = document.createElement('link')
        link.setAttribute('rel', 'canonical')
        document.head.appendChild(link)
      }
      link.setAttribute('href', canonical)
    }
  }, [title, description, canonical])

  return null
}
