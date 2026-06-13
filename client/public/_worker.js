/**
 * Cloudflare Pages Worker — OG meta tag pre-rendering for crawlers.
 *
 * Set API_URL in Cloudflare Pages → Settings → Environment Variables:
 *   API_URL = https://your-nestjs-backend.run.app
 *
 * All non-crawler requests pass straight through to the static SPA.
 */

const CRAWLER_RE =
  /bot|crawler|spider|crawling|facebookexternalhit|linkedinbot|twitterbot|whatsapp|slurp|quora|quoralink|googlebot|bingbot|yandexbot|duckduckbot|applebot|discordbot|slackbot|telegrambot|vkshare|iframely|embedly|preview|opengraph|unfurl|python-requests|python-urllib|curl\/|wget\//i;

const FALLBACK_OG_IMAGE =
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1200&h=630';

const SITE_NAME = 'Ease My Vacations (EMV)';

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slugToTitle(slug) {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/**
 * Extract the first usable image URL from markdown or HTML content.
 * Tries: markdown ![alt](url), then HTML <img src="">.
 */
function extractFirstImage(content) {
  if (!content) return null;
  // markdown image: ![alt](url)
  const mdMatch = content.match(/!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/);
  if (mdMatch) return mdMatch[1];
  // HTML img tag
  const htmlMatch = content.match(/<img[^>]+src=["'](https?:\/\/[^"']+)["']/i);
  if (htmlMatch) return htmlMatch[1];
  return null;
}

/**
 * Pick the best available image for the OG tag.
 * Priority: coverImage field → first image in markdown content → fallback.
 */
function resolveImage(post) {
  if (post.coverImage && post.coverImage.startsWith('http')) return post.coverImage;
  const fromContent = extractFirstImage(post.content);
  if (fromContent) return fromContent;
  return FALLBACK_OG_IMAGE;
}

function buildBlogHtml(post, slug, origin) {
  const t   = esc(`${post.title} | EMV Blog`);
  const d   = esc(post.excerpt || `Read the latest travel insights from ${SITE_NAME}.`);
  const img = esc(resolveImage(post));
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

function buildBlogFallbackHtml(slug, origin) {
  const title = slugToTitle(slug);
  return buildBlogHtml(
    { title, excerpt: `${title} — travel guide and tips from ${SITE_NAME}.`, content: '' },
    slug,
    origin,
  );
}

export default {
  async fetch(request, env) {
    const url       = new URL(request.url);
    const userAgent = request.headers.get('user-agent') || '';

    if (CRAWLER_RE.test(userAgent)) {
      const blogMatch = url.pathname.match(/^\/blog\/([^/]+)\/?$/);

      if (blogMatch) {
        const slug    = blogMatch[1];
        const apiBase = (env.API_URL || 'https://evmglobal-270604353720.europe-west1.run.app').replace(/\/$/, '');

        try {
          // 8-second timeout so a cold-starting Cloud Run instance doesn't hang the worker
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 8000);

          const res = await fetch(`${apiBase}/api/blogs/${encodeURIComponent(slug)}`, {
            signal: controller.signal,
            headers: { Accept: 'application/json' },
            cf: { cacheTtl: 3600, cacheEverything: true },
          });
          clearTimeout(timer);

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
          // timeout or network error — fall through to slug-based fallback
        }

        return new Response(buildBlogFallbackHtml(slug, url.origin), {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'public, max-age=300',
          },
        });
      }
    }

    return env.ASSETS.fetch(request);
  },
};
