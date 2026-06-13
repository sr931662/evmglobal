const SITE_NAME = 'Ease My Vacations Global'
const SITE_URL  = 'https://www.easemyvacationsglobal.com'
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1200&h=630'

export function normalizeApiBase(env) {
  const raw = (
    env?.API_URL ||
    env?.VITE_API_URL ||
    env?.NEXT_PUBLIC_API_URL ||
    ''
  ).replace(/\/api\/?$/, '').replace(/\/$/, '')
  return raw ? `${raw}/api` : ''
}

export function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;')
}

/**
 * Returns true when the request should receive pre-rendered OG HTML.
 *
 * Strategy: modern browsers always send `Sec-Fetch-Mode: navigate` for
 * top-level page loads (defined in the W3C Fetch Metadata spec, supported
 * in Chrome 76+, Firefox 90+, Safari 16.4+). Social crawlers (WhatsApp,
 * Telegram, Slack, Facebook, iMessage, Googlebot, etc.) do NOT send this
 * header, so we serve them OG HTML regardless of their user-agent string.
 *
 * We keep a UA allowlist as a fallback for very old browsers that somehow
 * lack Sec-Fetch-Mode, but the primary gate is the fetch-metadata header.
 */
export function needsOgResponse(request) {
  const secFetchMode = request.headers.get('sec-fetch-mode') || ''
  // Any real browser navigation sets this to 'navigate' (or 'nested-navigate')
  if (secFetchMode === 'navigate' || secFetchMode === 'nested-navigate') return false
  return true
}

/** @deprecated — use needsOgResponse(request) instead */
export function isCrawler(userAgent = '') {
  return /facebookexternalhit|facebot|facebookbot|twitterbot|linkedinbot|slackbot|discordbot|whatsapp|telegrambot|skypeuripreview|googlebot|bingbot|applebot|pinterest|embedly|outbrain|vkshare|ia_archiver|rogerbot|360spider|semrushbot|ahrefsbot|mj12bot|duckduckbot|yandexbot|baiduspider|sogou|exabot|pinterestbot|bufferbot|hootsuite|brandwatch|tumblr/i.test(userAgent)
}

/** Converts a URL slug to a readable title */
export function slugToTitle(slug = '') {
  return decodeURIComponent(slug)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim()
}

export function renderPreviewHtml({ title, description, url, image, type = 'website', redirectUrl = url }) {
  const safeImg = image || DEFAULT_IMAGE
  const safeUrl = url  || SITE_URL
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />

    <!-- Open Graph -->
    <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />
    <meta property="og:title"       content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type"        content="${escapeHtml(type)}" />
    <meta property="og:url"         content="${escapeHtml(safeUrl)}" />
    <meta property="og:image"       content="${escapeHtml(safeImg)}" />
    <meta property="og:image:secure_url" content="${escapeHtml(safeImg)}" />
    <meta property="og:image:width"  content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:type"   content="image/jpeg" />
    <meta property="og:image:alt"    content="${escapeHtml(title)}" />
    <meta property="og:locale"       content="en_IN" />

    <!-- Twitter / X Card -->
    <meta name="twitter:card"        content="summary_large_image" />
    <meta name="twitter:site"        content="@EMVGlobal" />
    <meta name="twitter:title"       content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image"       content="${escapeHtml(safeImg)}" />
    <meta name="twitter:image:alt"   content="${escapeHtml(title)}" />

    <meta http-equiv="refresh" content="0;url=${escapeHtml(redirectUrl)}" />
    <link rel="canonical" href="${escapeHtml(safeUrl)}" />
  </head>
  <body>
    <p><a href="${escapeHtml(redirectUrl)}">${escapeHtml(title)}</a></p>
    <script>window.location.replace(${JSON.stringify(redirectUrl)});</script>
  </body>
</html>`
}

export function buildHtmlResponse(html) {
  return new Response(html, {
    headers: {
      'content-type':  'text/html; charset=UTF-8',
      'cache-control': 'public, s-maxage=300, stale-while-revalidate=3600',
      'vary':          'Sec-Fetch-Mode',
    },
  })
}

export function resolvePreviewImage(image, origin) {
  if (!image || !image.trim()) return DEFAULT_IMAGE
  try {
    const resolved = new URL(image, origin).toString()
    return resolved.includes('favicon') ? DEFAULT_IMAGE : resolved
  } catch {
    return DEFAULT_IMAGE
  }
}
