import { useEffect } from 'react'

export function usePageMeta(title, description) {
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

    return () => {
      document.title = prevTitle
      if (metaDesc && prevContent !== null) {
        metaDesc.setAttribute('content', prevContent)
      }
    }
  }, [title, description])
}
