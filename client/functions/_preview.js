export function normalizeApiBase(env) {
  const raw = (env?.API_URL || env?.VITE_API_URL || '').replace(/\/api\/?$/, '').replace(/\/$/, '')
  return raw ? `${raw}/api` : ''
}

export function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function isCrawler(userAgent = '') {
  return /facebookexternalhit|facebot|twitterbot|linkedinbot|slackbot|discordbot|whatsapp|telegrambot|skypeuripreview|googlebot|bingbot/i.test(userAgent)
}

export function renderPreviewHtml({ title, description, url, image, type = 'website', redirectUrl = url }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="${escapeHtml(type)}" />
    <meta property="og:url" content="${escapeHtml(url)}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(image)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeHtml(title)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(image)}" />
    <meta name="twitter:image:alt" content="${escapeHtml(title)}" />
    <meta http-equiv="refresh" content="0;url=${escapeHtml(redirectUrl)}" />
    <link rel="canonical" href="${escapeHtml(url)}" />
  </head>
  <body>
    <img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" style="position:absolute;width:1px;height:1px;opacity:0;pointer-events:none" />
    <script>window.location.replace(${JSON.stringify(redirectUrl)});</script>
  </body>
</html>`
}

export function buildHtmlResponse(html) {
  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=UTF-8',
      'cache-control': 'public, s-maxage=300, stale-while-revalidate=3600',
    },
  })
}

export function resolvePreviewImage(image, origin) {
  if (!image) return `${origin}/favicon.png`

  try {
    return new URL(image, origin).toString()
  } catch {
    return `${origin}/favicon.png`
  }
}
