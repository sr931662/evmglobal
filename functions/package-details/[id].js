import { buildHtmlResponse, isCrawler, normalizeApiBase, renderPreviewHtml, resolvePreviewImage } from '../_preview.js'

const CATEGORY_IMAGES = {
  'Honeymoon': 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=1200&h=630',
  'Family': 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1200&h=630',
  'Luxury': 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200&h=630',
  'Domestic': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=1200&h=630',
  'Wellness': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=1200&h=630',
}

function slugToTitle(slug = '') {
  return decodeURIComponent(slug)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export async function onRequestGet(context) {
  const userAgent = context.request.headers.get('user-agent') || ''
  if (!isCrawler(userAgent)) {
    return context.next()
  }

  const id = context.params.id
  const pageUrl = new URL(context.request.url)

  // Slug-derived fallback used when API is unavailable
  const fallbackTitle = `${slugToTitle(id)} | EMV Global`
  const fallbackDescription = 'Explore this curated journey from EMV Global.'
  const fallbackImage = CATEGORY_IMAGES['Domestic']

  const apiBase = normalizeApiBase(context.env)
  if (!apiBase) {
    return buildHtmlResponse(renderPreviewHtml({
      title: fallbackTitle,
      description: fallbackDescription,
      url: pageUrl.toString(),
      image: fallbackImage,
      type: 'website',
    }))
  }

  // Resolve relative image paths against the backend origin, not the frontend
  const apiOrigin = new URL(apiBase).origin

  try {
    const response = await fetch(`${apiBase}/packages/${encodeURIComponent(id)}`, {
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      return buildHtmlResponse(renderPreviewHtml({
        title: fallbackTitle,
        description: fallbackDescription,
        url: pageUrl.toString(),
        image: fallbackImage,
        type: 'website',
      }))
    }

    const pkg = await response.json()
    const destinations = Array.isArray(pkg.destinations) ? pkg.destinations.filter(Boolean).join(', ') : ''
    const description = pkg.description || (destinations ? `Explore ${destinations} with EMV Global.` : fallbackDescription)

    let image = resolvePreviewImage(pkg.image, apiOrigin)
    if (!image || image.includes('favicon')) {
      image = CATEGORY_IMAGES[pkg.category] || CATEGORY_IMAGES['Domestic']
    }

    return buildHtmlResponse(renderPreviewHtml({
      title: `${pkg.title} | EMV Global`,
      description,
      url: pageUrl.toString(),
      image,
      type: 'website',
    }))
  } catch {
    return buildHtmlResponse(renderPreviewHtml({
      title: fallbackTitle,
      description: fallbackDescription,
      url: pageUrl.toString(),
      image: fallbackImage,
      type: 'website',
    }))
  }
}
