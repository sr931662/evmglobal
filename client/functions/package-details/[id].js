import { buildHtmlResponse, isCrawler, normalizeApiBase, renderPreviewHtml, resolvePreviewImage } from '../_preview.js'

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
    const html = renderPreviewHtml({
      title: `${pkg.title} | EMV Global`,
      description,
      url: pageUrl.toString(),
      image: resolvePreviewImage(pkg.image, pageUrl.origin),
      type: 'website',
    })

    return buildHtmlResponse(html)
  } catch {
    return context.next()
  }
}
