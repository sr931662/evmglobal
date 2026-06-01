import { buildHtmlResponse, isCrawler, normalizeApiBase, renderPreviewHtml, resolvePreviewImage } from '../_preview.js'

// Category-based default images for better fallback
const CATEGORY_IMAGES = {
  'Honeymoon': 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=1200&h=630',
  'Family': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1200&h=630',
  'Luxury': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200&h=630',
  'Domestic': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=1200&h=630',
  'Wellness': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=1200&h=630',
}

export async function onRequestGet(context) {
  const userAgent = context.request.headers.get('user-agent') || ''
  if (!isCrawler(userAgent)) {
    return context.next()
  }

  const apiBase = normalizeApiBase(context.env)
  if (!apiBase) {
    return context.next()
  }

  const id = context.params.id
  const pageUrl = new URL(context.request.url)

  try {
    const response = await fetch(`${apiBase}/packages/${encodeURIComponent(id)}`, {
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      return context.next()
    }

    const pkg = await response.json()
    const destinations = Array.isArray(pkg.destinations) ? pkg.destinations.filter(Boolean).join(', ') : ''
    const description = pkg.description || (destinations ? `Explore ${destinations} with EMV Global.` : 'Explore this curated journey from EMV Global.')
    
    // Use package image, fallback to category image, then generic travel image
    let image = resolvePreviewImage(pkg.image, pageUrl.origin)
    if (!image || image.includes('favicon')) {
      image = CATEGORY_IMAGES[pkg.category] || CATEGORY_IMAGES['Domestic']
    }
    
    const html = renderPreviewHtml({
      title: `${pkg.title} | EMV Global`,
      description,
      url: pageUrl.toString(),
      image,
      type: 'website',
    })

    return buildHtmlResponse(html)
  } catch {
    return context.next()
  }
}
