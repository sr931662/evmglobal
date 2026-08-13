import { useEffect } from 'react'

// Injects a JSON-LD <script> into <head> for the lifetime of the component.
// Pass null to render nothing (e.g. while the page is still loading).
export function useJsonLd(id, data) {
  useEffect(() => {
    if (!data) return

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = id
    script.textContent = JSON.stringify(data)
    document.head.appendChild(script)

    return () => { script.remove() }
  }, [id, data])
}
