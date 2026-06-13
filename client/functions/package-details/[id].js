import {
  buildHtmlResponse, needsOgResponse, normalizeApiBase,
  renderPreviewHtml, resolvePreviewImage,
} from '../_preview.js'

const CATEGORY_IMAGES = {
  Honeymoon: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=1200&h=630',
  Family:    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=1200&h=630',
  Luxury:    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200&h=630',
  Domestic:  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=1200&h=630',
  Wellness:  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&q=80&w=1200&h=630',
}
const DEFAULT_IMAGE = CATEGORY_IMAGES.Domestic

export async function onRequestGet(context) {
  if (!needsOgResponse(context.request)) return context.next()

  const id      = context.params.id || ''
  const pageUrl = new URL(context.request.url)

  const defaultTitle = 'Curated Holiday Package | EMV Global'
  const defaultDesc  = 'Explore this handpicked travel package by Ease My Vacations Global. Book now for an unforgettable journey.'

  const fallbackHtml = (image = DEFAULT_IMAGE) =>
    buildHtmlResponse(renderPreviewHtml({
      title:       defaultTitle,
      description: defaultDesc,
      url:         pageUrl.toString(),
      image,
      type:        'website',
    }))

  const apiBase = normalizeApiBase(context.env)
  if (!apiBase) return fallbackHtml()

  try {
    const res = await fetch(`${apiBase}/packages/${encodeURIComponent(id)}`, {
      headers: { Accept: 'application/json' },
      signal:  AbortSignal.timeout(4000),
    })

    if (!res.ok) return fallbackHtml()

    const pkg  = await res.json()
    const dest = Array.isArray(pkg.destinations) ? pkg.destinations.filter(Boolean).join(', ') : ''
    const desc = pkg.description
      || (dest ? `Explore ${dest} with Ease My Vacations Global. ${pkg.nights ? `${pkg.nights} nights` : ''} curated journey.` : defaultDesc)

    let image = resolvePreviewImage(pkg.image, pageUrl.origin)
    if (!image || image.includes('favicon')) {
      image = CATEGORY_IMAGES[pkg.category] || DEFAULT_IMAGE
    }

    return buildHtmlResponse(renderPreviewHtml({
      title:       `${pkg.title} | EMV Global`,
      description: desc.slice(0, 200),
      url:         pageUrl.toString(),
      image,
      type:        'website',
    }))
  } catch {
    return fallbackHtml()
  }
}
