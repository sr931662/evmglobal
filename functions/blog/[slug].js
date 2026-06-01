import { buildHtmlResponse, isCrawler, normalizeApiBase, renderPreviewHtml, resolvePreviewImage } from '../_preview.js'

const BLOG_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1200&h=630'

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

  const slug = context.params.slug
  const articleUrl = new URL(context.request.url)

  const fallbackTitle = `${slugToTitle(slug)} | EMV Global Blog`
  const fallbackDescription = 'Read the latest travel story from EMV Global.'

  const apiBase = normalizeApiBase(context.env)
  if (!apiBase) {
    return buildHtmlResponse(renderPreviewHtml({
      title: fallbackTitle,
      description: fallbackDescription,
      url: articleUrl.toString(),
      image: BLOG_FALLBACK_IMAGE,
      type: 'article',
    }))
  }

  const apiOrigin = new URL(apiBase).origin

  try {
    const response = await fetch(`${apiBase}/blogs/${encodeURIComponent(slug)}`, {
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      return buildHtmlResponse(renderPreviewHtml({
        title: fallbackTitle,
        description: fallbackDescription,
        url: articleUrl.toString(),
        image: BLOG_FALLBACK_IMAGE,
        type: 'article',
      }))
    }

    const post = await response.json()
    return buildHtmlResponse(renderPreviewHtml({
      title: `${post.title} | EMV Global Blog`,
      description: post.excerpt || fallbackDescription,
      url: articleUrl.toString(),
      image: resolvePreviewImage(post.coverImage, apiOrigin),
      type: 'article',
    }))
  } catch {
    return buildHtmlResponse(renderPreviewHtml({
      title: fallbackTitle,
      description: fallbackDescription,
      url: articleUrl.toString(),
      image: BLOG_FALLBACK_IMAGE,
      type: 'article',
    }))
  }
}
