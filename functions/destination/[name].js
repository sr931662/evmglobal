import {
  buildHtmlResponse, needsOgResponse, normalizeApiBase,
  renderPreviewHtml, resolvePreviewImage,
} from '../_preview.js'

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=1200&h=630'

function normalizeName(value = '') {
  return decodeURIComponent(String(value)).trim().toLowerCase()
}

export async function onRequestGet(context) {
  const shareName  = context.params.name || ''
  const redirectTo = new URL(`/packages?destination=${encodeURIComponent(shareName)}`, context.request.url).toString()
  const pageUrl    = new URL(context.request.url)
  if (!needsOgResponse(context.request)) return Response.redirect(redirectTo, 302)

  const readableName = decodeURIComponent(shareName)
  const fallbackHtml = () =>
    buildHtmlResponse(renderPreviewHtml({
      title:       `${readableName} | EMV Global Destinations`,
      description: `Discover ${readableName} with Ease My Vacations Global's bespoke travel planning. Explore curated holiday packages.`,
      url:         pageUrl.toString(),
      image:       DEFAULT_IMAGE,
      redirectUrl: redirectTo,
    }))

  const apiBase = normalizeApiBase(context.env)
  if (!apiBase) return fallbackHtml()

  try {
    const res = await fetch(`${apiBase}/destinations`, {
      headers: { Accept: 'application/json' },
      signal:  AbortSignal.timeout(4000),
    })

    if (!res.ok) return fallbackHtml()

    const destinations = await res.json()
    const destination  = Array.isArray(destinations)
      ? destinations.find(d => normalizeName(d?.name) === normalizeName(shareName))
      : null

    if (!destination) return fallbackHtml()

    const image = resolvePreviewImage(destination.image, pageUrl.origin)

    return buildHtmlResponse(renderPreviewHtml({
      title:       `${destination.name}, ${destination.country} | EMV Global`,
      description: `Discover ${destination.name}, ${destination.country} with Ease My Vacations Global. Explore handpicked holiday packages for this destination.`,
      url:         pageUrl.toString(),
      image,
      redirectUrl: redirectTo,
    }))
  } catch {
    return fallbackHtml()
  }
}
