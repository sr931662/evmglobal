/**
 * Cloudflare Pages Worker — OG meta tag pre-rendering for crawlers.
 *
 * Set API_URL in Cloudflare Pages → Settings → Environment Variables:
 *   API_URL = https://your-nestjs-backend.run.app
 *
 * All non-crawler requests pass straight through to the static SPA.
 */

const CRAWLER_RE =
  /bot|crawler|spider|crawling|facebookexternalhit|linkedinbot|twitterbot|whatsapp|slurp|quorabot|googlebot|bingbot|yandexbot|duckduckbot|applebot|discordbot|slackbot|telegrambot|vkshare/i;

// Same fallback image used in index.html — a proper 1200×630 travel photo
const FALLBACK_OG_IMAGE =
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1200&h=630';

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildBlogHtml({ title, excerpt, coverImage }, slug, origin) {
  const t   = esc(`${title} | EMV Global Blog`);
  const d   = esc(excerpt || 'Read the latest travel insights from the EMV Global concierge team.');
  const img = esc(coverImage || FALLBACK_OG_IMAGE);
  const url = `${origin}/blog/${slug}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${t}</title>
  <meta name="description" content="${d}">
  <meta property="og:type"        content="article">
  <meta property="og:site_name"   content="EMV Global">
  <meta property="og:title"       content="${t}">
  <meta property="og:description" content="${d}">
  <meta property="og:image"       content="${img}">
  <meta property="og:url"         content="${url}">
  <meta name="twitter:card"        content="summary_large_image">
  <meta name="twitter:title"       content="${t}">
  <meta name="twitter:description" content="${d}">
  <meta name="twitter:image"       content="${img}">
  <link rel="canonical" href="${url}">
</head>
<body>
  <p>Loading&hellip; <a href="${url}">Click here if not redirected.</a></p>
  <script>window.location.replace("${url}");</script>
</body>
</html>`;
}

export default {
  async fetch(request, env) {
    const url       = new URL(request.url);
    const userAgent = request.headers.get('user-agent') || '';

    if (CRAWLER_RE.test(userAgent)) {
      const blogMatch = url.pathname.match(/^\/blog\/([^/]+)\/?$/);

      if (blogMatch) {
        const slug    = blogMatch[1];
        const apiBase = (env.API_URL || '').replace(/\/$/, '');

        if (apiBase) {
          try {
            const res = await fetch(`${apiBase}/api/blogs/${encodeURIComponent(slug)}`, {
              headers: { Accept: 'application/json' },
              cf: { cacheTtl: 3600, cacheEverything: true },
            });

            if (res.ok) {
              const post = await res.json();
              return new Response(buildBlogHtml(post, slug, url.origin), {
                headers: {
                  'Content-Type': 'text/html; charset=utf-8',
                  'Cache-Control': 'public, max-age=3600',
                },
              });
            }
          } catch {
            // API unreachable — fall through to static SPA
          }
        }
      }
    }

    // Everyone else (and fallback) → Cloudflare Pages static assets
    return env.ASSETS.fetch(request);
  },
};
