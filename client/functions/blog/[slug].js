function normalizeApiBase(env) {
  const raw = (env?.API_URL || env?.VITE_API_URL || '').replace(/\/api\/?$/, '').replace(/\/$/, '')
  return raw ? `${raw}/api` : ''
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function isCrawler(userAgent = '') {
  return /facebookexternalhit|facebot|linkedinbot|twitterbot|slackbot|discordbot|whatsapp|telegrambot|skypeuripreview|googlebot|bingbot/i.test(userAgent)
}

function renderPreviewHtml({ title, description, url, image }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />
    <meta http-equiv="refresh" content="0;url=${escapeHtml(url)}" />
    <link rel="canonical" href="${escapeHtml(url)}" />
  </head>
  <body>
    <script>window.location.replace(${JSON.stringify(url)});</script>
  </body>
</html>`
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
      image: post.coverImage || `${articleUrl.origin}/favicon.png`,
    })

    return new Response(html, {
      headers: {
        'content-type': 'text/html; charset=UTF-8',
        'cache-control': 'public, s-maxage=300, stale-while-revalidate=3600',
      },
    })
  } catch {
    return context.next()
  }
}
