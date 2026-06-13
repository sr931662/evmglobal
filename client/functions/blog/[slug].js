import {
  buildHtmlResponse, isCrawler, normalizeApiBase,
  renderPreviewHtml, resolvePreviewImage, slugToTitle,
} from '../_preview.js'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1200&h=630'

export async function onRequestGet(context) {
  const userAgent = context.request.headers.get('user-agent') || ''
  if (!isCrawler(userAgent)) return context.next()

  const slug     = context.params.slug || ''
  const pageUrl  = new URL(context.request.url)

  // Derive a readable title from the slug immediately — used as fallback
  const derivedTitle = `${slugToTitle(slug)} | EMV Global Blog`
  const defaultDesc  = 'Read the latest travel stories, tips and destination guides from EMV Global.'

  const fallbackHtml = () =>
    buildHtmlResponse(renderPreviewHtml({
      title:       derivedTitle,
      description: defaultDesc,
      url:         pageUrl.toString(),
      image:       FALLBACK_IMAGE,
      type:        'article',
    }))

  const apiBase = normalizeApiBase(context.env)

  // If API URL is not configured, still serve meaningful OG (not the homepage)
  if (!apiBase) return fallbackHtml()

  try {
    const res = await fetch(`${apiBase}/blogs/${encodeURIComponent(slug)}`, {
      headers: { Accept: 'application/json' },
      signal:  AbortSignal.timeout(4000),
    })

    if (!res.ok) return fallbackHtml()

    const post  = await res.json()
    const image = resolvePreviewImage(post.coverImage, pageUrl.origin)

    return buildHtmlResponse(renderPreviewHtml({
      title:       `${post.title} | EMV Global Blog`,
      description: post.excerpt || defaultDesc,
      url:         pageUrl.toString(),
      image,
      type:        'article',
    }))
  } catch {
    return fallbackHtml()
  }
}
