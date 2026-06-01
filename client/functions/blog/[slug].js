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

  const slug = context.params.slug
  const articleUrl = new URL(context.request.url)

  try {
    const response = await fetch(`${apiBase}/blogs/${encodeURIComponent(slug)}`, {
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      return context.next()
    }

    const post = await response.json()
    const html = renderPreviewHtml({
      title: `${post.title} | EMV Global Blog`,
      description: post.excerpt || 'Read the latest travel story from EMV Global.',
      url: articleUrl.toString(),
      image: resolvePreviewImage(post.coverImage, articleUrl.origin),
      type: 'article',
    })

    return buildHtmlResponse(html)
  } catch {
    return context.next()
  }
}
