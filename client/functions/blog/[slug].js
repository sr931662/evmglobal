import {
  buildHtmlResponse, getPreviewApiBases, needsOgResponse,
  renderPreviewHtml, resolvePreviewPostImage, slugToTitle,
} from '../_preview.js'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1200&h=630'

export async function onRequestGet(context) {
  if (!needsOgResponse(context.request)) return context.next()

  const slug     = context.params.slug || ''
  const pageUrl  = new URL(context.request.url)

  // Derive a readable title from the slug immediately — used as fallback
  const derivedTitle = `${slugToTitle(slug)} | Ease My Vacations Blog`
  const defaultDesc  = 'Read the latest travel stories, tips and destination guides from EMV Global.'

  const fallbackHtml = () =>
    buildHtmlResponse(renderPreviewHtml({
      title:       derivedTitle,
      description: defaultDesc,
      url:         pageUrl.toString(),
      image:       FALLBACK_IMAGE,
      type:        'article',
    }))

  const apiBases = getPreviewApiBases(context.env)
  if (!apiBases.length) return fallbackHtml()

  for (const apiBase of apiBases) {
    try {
      const res = await fetch(`${apiBase}/blogs/${encodeURIComponent(slug)}`, {
        headers: { Accept: 'application/json' },
        signal:  AbortSignal.timeout(4000),
      })

      if (!res.ok) continue

      const post  = await res.json()
      const image = resolvePreviewPostImage(post, pageUrl.origin)

      return buildHtmlResponse(renderPreviewHtml({
        title:       `${post.title} | Ease My Vacations Blog`,
        description: post.excerpt || defaultDesc,
        url:         pageUrl.toString(),
        image,
        type:        'article',
      }))
    } catch {}
  }

  return fallbackHtml()
}
