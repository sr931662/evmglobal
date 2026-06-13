/**
 * Cloudflare Pages Worker — OG meta tag pre-rendering for crawlers.
 *
 * Set API_URL in Cloudflare Pages → Settings → Environment Variables:
 *   API_URL = https://your-nestjs-backend.run.app
 *
 * All non-crawler requests pass straight through to the static SPA.
 */

// Broad crawler / link-preview detector.
// Quora uses "QuoraLink" (not "quorabot"), so we match on "quora" to cover all variants.
// iframely / embedly are used by dozens of third-party preview widgets.
// python-requests / wget / curl are used by many scraper-based link previewers.
const CRAWLER_RE =
  /bot|crawler|spider|crawling|facebookexternalhit|linkedinbot|twitterbot|whatsapp|slurp|quora|quoralink|googlebot|bingbot|yandexbot|duckduckbot|applebot|discordbot|slackbot|telegrambot|vkshare|iframely|embedly|preview|opengraph|unfurl|python-requests|python-urllib|curl\/|wget\//i;

// Same fallback image used in index.html — a proper 1200×630 travel photo
const FALLBACK_OG_IMAGE =
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1200&h=630';

const SITE_NAME = 'Ease My Vacations (EMV)';
const SITE_DOMAIN = 'https://www.easemyvacationsglobal.com';

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Convert a URL slug to a readable title as a last-resort fallback. */
function slugToTitle(slug) {
  return slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function buildBlogHtml({ title, excerpt, coverImage }, slug, origin) {
  const t   = esc(`${title} | EMV Blog`);
  const d   = esc(excerpt || `Read the latest travel insights from ${SITE_NAME}.`);
  const img = esc(coverImage || FALLBACK_OG_IMAGE);
  const url = `${origin}/blog/${slug}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${t}</title>
  <meta name="description" content="${d}">
  <meta property="og:type"        content="article">
  <meta property="og:site_name"   content="${esc(SITE_NAME)}">
  <meta property="og:title"       content="${t}">
  <meta property="og:description" content="${d}">
  <meta property="og:image"       content="${img}">
  <meta property="og:url"         content="${url}">
  <meta name="twitter:card"        content="summary_large_image">
  <meta name="twitter:site"        content="@EMVGlobal">
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

/** Fallback HTML using only the slug when the API is unreachable or API_URL is not set. */
function buildBlogFallbackHtml(slug, origin) {
  const title = slugToTitle(slug);
  return buildBlogHtml(
    {
      title,
      excerpt: `${title} — travel guide and tips from ${SITE_NAME}.`,
      coverImage: FALLBACK_OG_IMAGE,
    },
    slug,
    origin,
  );
}

export default {
  async fetch(request, env) {
    const url       = new URL(request.url);
    const userAgent = request.headers.get('user-agent') || '';

    if (CRAWLER_RE.test(userAgent)) {
      // ── Blog post pages: /blog/<slug> ──────────────────────────────────
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
            // API unreachable — serve slug-based fallback below
          }
        }

        // API_URL not configured or API call failed:
        // Return fallback HTML that is at least URL/title-specific for this blog post.
        // This is far better than serving index.html with homepage OG tags.
        return new Response(buildBlogFallbackHtml(slug, url.origin), {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=300',
          },
        });
      }
    }

    // Everyone else (and non-blog crawler paths) → Cloudflare Pages static assets
    return env.ASSETS.fetch(request);
  },
};
