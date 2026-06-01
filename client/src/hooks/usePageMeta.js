import { useEffect } from 'react'

function upsertMeta(selector, attributes) {
  let tag = document.head.querySelector(selector)
  if (!tag) {
    tag = document.createElement('meta')
    document.head.appendChild(tag)
  }
  Object.entries(attributes).forEach(([key, value]) => {
    tag.setAttribute(key, value)
  })
}

export function usePageMeta(title, description, options = {}) {
  useEffect(() => {
    const prevTitle = document.title
    if (title) document.title = title

    let metaDesc = document.querySelector('meta[name="description"]')
    const prevContent = metaDesc ? metaDesc.getAttribute('content') : ''

    if (description) {
      if (!metaDesc) {
        metaDesc = document.createElement('meta')
        metaDesc.setAttribute('name', 'description')
        document.head.appendChild(metaDesc)
      }
      metaDesc.setAttribute('content', description)
    }

    // Set Open Graph meta tags
    if (options.image) {
      upsertMeta('meta[property="og:image"]', { property: 'og:image', content: options.image })
    }
    if (title) {
      upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title })
    }
    if (description) {
      upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    }
    if (options.url) {
      upsertMeta('meta[property="og:url"]', { property: 'og:url', content: options.url })
    }
    if (options.type) {
      upsertMeta('meta[property="og:type"]', { property: 'og:type', content: options.type })
    }

    // Set Twitter Card meta tags
    if (options.image) {
      upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
      upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: options.image })
    }
    if (title) {
      upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title })
    }
    if (description) {
      upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
    }

    return () => {
      document.title = prevTitle
      if (metaDesc && prevContent !== null) {
        metaDesc.setAttribute('content', prevContent)
      }
    }
  }, [title, description, options])
}
