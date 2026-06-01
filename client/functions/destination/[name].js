import { buildHtmlResponse, isCrawler, normalizeApiBase, renderPreviewHtml, resolvePreviewImage } from '../_preview.js'

function normalizeName(value = '') {
  return decodeURIComponent(String(value)).trim().toLowerCase()
}

export async function onRequestGet(context) {
  const shareName = context.params.name || ''
  const redirectUrl = new URL(`/packages?destination=${encodeURIComponent(shareName)}`, context.request.url).toString()
  const userAgent = context.request.headers.get('user-agent') || ''

  if (!isCrawler(userAgent)) {
    return Response.redirect(redirectUrl, 302)
  }

  const apiBase = normalizeApiBase(context.env)
  if (!apiBase) {
    return Response.redirect(redirectUrl, 302)
  }

  try {
    const response = await fetch(`${apiBase}/destinations`, {
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      return Response.redirect(redirectUrl, 302)
    }

    const destinations = await response.json()
    const destination = Array.isArray(destinations)
      ? destinations.find((item) => normalizeName(item?.name) === normalizeName(shareName))
      : null

    if (!destination) {
      return Response.redirect(redirectUrl, 302)
    }

    const pageUrl = new URL(context.request.url)
    const description = `Discover ${destination.name}, ${destination.country} with EMV Global's bespoke travel planning.`
    const html = renderPreviewHtml({
      title: `${destination.name} | EMV Global Destinations`,
      description,
      url: pageUrl.toString(),
      image: resolvePreviewImage(destination.image, pageUrl.origin),
      type: 'website',
      redirectUrl,
    })

    return buildHtmlResponse(html)
  } catch {
    return Response.redirect(redirectUrl, 302)
  }
}
