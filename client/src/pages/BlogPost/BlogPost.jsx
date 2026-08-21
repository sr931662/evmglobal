import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { api } from '../../services/api'
import { formatPrice } from '../../utils/currency'
import { openWhatsApp } from '../../utils/whatsapp'
import {
  readingMinutes, freshness, articleDestination, relatedScore, splitAtMidpoint,
  normalizeMarkdown,
} from '../../utils/blogContent'
import { useJsonLd } from '../../hooks/useJsonLd'
import styles from './BlogPost.module.css'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800'
const META_FALLBACK_IMG = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1200&h=630'

const ARROW = (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className={styles.arrow}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
)

const WA_PATH = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.112.555 4.094 1.523 5.813L0 24l6.336-1.499A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.946 0-3.77-.51-5.338-1.4l-.382-.225-3.961.937.997-3.868-.249-.401A9.942 9.942 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z'

function upsertMeta(selector, attributes) {
  let tag = document.head.querySelector(selector)
  if (!tag) {
    tag = document.createElement('meta')
    document.head.appendChild(tag)
  }
  Object.entries(attributes).forEach(([key, value]) => tag.setAttribute(key, value))
}

const buildShareUrl = (slug) =>
  typeof window === 'undefined' ? '' : `${window.location.origin}/blog/${slug}`

function resolveMetaImage(post) {
  if (typeof window === 'undefined') return META_FALLBACK_IMG
  for (const candidate of [post?.coverImage, post?.image, post?.thumbnail, post?.featuredImage, post?.heroImage]) {
    if (!candidate || typeof candidate !== 'string') continue
    try {
      const resolved = new URL(candidate.trim(), window.location.origin).toString()
      if (!resolved.includes('favicon') && resolved.startsWith('https://')) return resolved
    } catch { /* not a usable URL — try the next candidate */ }
  }
  return META_FALLBACK_IMG
}

function isImageUrl(url) {
  if (!url) return false
  try {
    const u = new URL(url)
    if (/\.(jpg|jpeg|png|gif|webp|avif|svg|bmp)(\?|$)/i.test(u.pathname)) return true
    const host = u.hostname.toLowerCase()
    if (['unsplash.com','pexels.com','pixabay.com','cloudinary.com','imgix.net','googleusercontent.com','amazonaws.com','cdn.'].some(h => host.includes(h))) return true
    if (host.startsWith('img.') || host.startsWith('images.')) return true
    const p = u.searchParams
    return p.has('auto') || p.has('fit') || p.has('ixid') || (p.has('w') && p.has('q'))
  } catch {
    return false
  }
}

const mdComponents = {
  h1: ({ children }) => <h2 className={styles.mdH1}>{children}</h2>,
  h2: ({ children }) => <h3 className={styles.mdH2}>{children}</h3>,
  h3: ({ children }) => <h4 className={styles.mdH3}>{children}</h4>,
  p: ({ children }) => <p className={styles.mdP}>{children}</p>,
  ul: ({ children }) => <ul className={styles.mdUl}>{children}</ul>,
  ol: ({ children }) => <ol className={styles.mdOl}>{children}</ol>,
  li: ({ children }) => <li className={styles.mdLi}>{children}</li>,
  strong: ({ children }) => <strong className={styles.mdStrong}>{children}</strong>,
  em: ({ children }) => <em className={styles.mdEm}>{children}</em>,
  blockquote: ({ children }) => <blockquote className={styles.mdBlockquote}>{children}</blockquote>,
  code: ({ inline, children }) => inline
    ? <code className={styles.mdInlineCode}>{children}</code>
    : <pre className={styles.mdPre}><code className={styles.mdCode}>{children}</code></pre>,
  hr: () => <hr className={styles.mdHr} />,
  a: ({ href, children }) => {
    const childText = typeof children === 'string' ? children : (Array.isArray(children) ? children.join('') : String(children ?? ''))
    if (isImageUrl(href) && childText === href) return <img src={href} alt="" className={styles.mdImg} />
    return <a href={href} target="_blank" rel="noopener noreferrer" className={styles.mdLink}>{children}</a>
  },
  table: ({ children }) => <div className={styles.mdTableWrap}><table className={styles.mdTable}>{children}</table></div>,
  th: ({ children }) => <th className={styles.mdTh}>{children}</th>,
  td: ({ children }) => <td className={styles.mdTd}>{children}</td>,
  img: ({ src, alt }) => <img src={src} alt={alt || ''} className={styles.mdImg} />,
}

// Scores a package against the article's destination and tags.
function packageScore(pkg, destination, tags) {
  const dests = (pkg.destinations || []).map(d => (d || '').toLowerCase())
  const title = (pkg.title || '').toLowerCase()
  let score = 0

  if (destination) {
    const d = destination.toLowerCase()
    if (dests.some(x => x.includes(d) || d.includes(x))) score += 5
    if (title.includes(d)) score += 2
  }
  tags.map(t => (t || '').toLowerCase()).forEach(tag => {
    if (dests.some(x => x.includes(tag) || tag.includes(x))) score += 3
    if (title.includes(tag)) score += 1
    if ((pkg.category || '').toLowerCase().includes(tag)) score += 1
  })
  return score
}

function PackageCard({ pkg, onOpen }) {
  const price  = formatPrice(pkg.priceValue, pkg.price)
  const nights = Number(pkg.nights) || 0
  return (
    <article className={styles.pkgCard} onClick={onOpen}>
      <div className={styles.pkgImgWrap}>
        <img src={pkg.image || FALLBACK_IMG} alt={pkg.title} loading="lazy" className={styles.pkgImg} />
      </div>
      <div className={styles.pkgBody}>
        {nights > 0 && <p className={styles.pkgDuration}>{nights} Nights / {nights + 1} Days</p>}
        <h3 className={styles.pkgTitle}>{pkg.title}</h3>
        {price && <p className={styles.pkgPrice}>From <strong>{price}</strong> / person</p>}
        <span className={styles.pkgLink}>View Package {ARROW}</span>
      </div>
    </article>
  )
}

export default function BlogPost() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [post,     setPost]     = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [packages, setPackages] = useState([])
  const [related,  setRelated]  = useState([])
  const [author,   setAuthor]   = useState(null)
  const [destinationNames, setDestinationNames] = useState([])
  const [openFaq,  setOpenFaq]  = useState(0)
  const [copied,   setCopied]   = useState(false)

  useEffect(() => {
    setLoading(true)
    api.getBlog(id)
      .then(setPost)
      .catch(err => setError(err.message || 'Post not found'))
      .finally(() => setLoading(false))
  }, [id])

  // Everything the article needs around it: matching holidays, related reads,
  // the author's profile, and the destination list used to detect the subject.
  useEffect(() => {
    if (!post) return
    let cancelled = false

    Promise.all([
      api.getDestinations().catch(() => []),
      api.getPackages({ status: 'Active', limit: 100 }).catch(() => null),
      api.getBlogs({ status: 'published', limit: 40 }).catch(() => null),
      api.getTeam({ status: 'active' }).catch(() => []),
    ]).then(([destData, pkgData, blogData, teamData]) => {
      if (cancelled) return

      const names = (Array.isArray(destData) ? destData : []).map(d => d.name).filter(Boolean)
      setDestinationNames(names)

      const destination = articleDestination(post, names)
      const tags = Array.isArray(post.tags) ? post.tags : []

      const pkgs = Array.isArray(pkgData?.packages) ? pkgData.packages : (Array.isArray(pkgData) ? pkgData : [])
      const scoredPkgs = pkgs
        .map(pkg => ({ pkg, score: packageScore(pkg, destination, tags) }))
        .filter(entry => entry.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(entry => entry.pkg)
      // Only offer holidays that actually match the article — a Thailand piece
      // shouldn't cross-sell Kashmir just to fill the rail.
      setPackages(scoredPkgs.slice(0, 3))

      const blogs = blogData?.blogs || []
      setRelated(
        blogs
          .map(candidate => ({ candidate, score: relatedScore(candidate, post, names) }))
          .filter(entry => entry.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map(entry => entry.candidate)
      )

      const team = Array.isArray(teamData) ? teamData : (teamData?.team || [])
      setAuthor(team.find(m => (m.name || '').toLowerCase() === (post.author || '').toLowerCase()) || null)
    })

    return () => { cancelled = true }
  }, [post])

  const destination = useMemo(
    () => (post ? articleDestination(post, destinationNames) : null),
    [post, destinationNames]
  )

  const faqs = useMemo(
    () => (Array.isArray(post?.faqs) ? post.faqs.filter(f => f.q && f.a) : []),
    [post]
  )

  const mins  = post ? readingMinutes(post) : null
  const fresh = post ? freshness(post) : null

  // Meta tags
  useEffect(() => {
    if (!post || typeof window === 'undefined') return
    const title = `${post.title} | Ease My Vacations Travel Journal`
    const description = post.excerpt || 'Travel inspiration, destination guides and expert advice from Ease My Vacations.'
    const url = buildShareUrl(post.slug || post.id || id)
    const image = resolveMetaImage(post)
    const previousTitle = document.title

    document.title = title
    upsertMeta('meta[name="description"]',        { name: 'description', content: description })
    upsertMeta('meta[property="og:title"]',       { property: 'og:title', content: title })
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    upsertMeta('meta[property="og:type"]',        { property: 'og:type', content: 'article' })
    upsertMeta('meta[property="og:url"]',         { property: 'og:url', content: url })
    upsertMeta('meta[property="og:image"]',       { property: 'og:image', content: image })
    upsertMeta('meta[name="twitter:card"]',       { name: 'twitter:card', content: 'summary_large_image' })
    upsertMeta('meta[name="twitter:title"]',      { name: 'twitter:title', content: title })
    upsertMeta('meta[name="twitter:description"]',{ name: 'twitter:description', content: description })
    upsertMeta('meta[name="twitter:image"]',      { name: 'twitter:image', content: image })

    return () => { document.title = previousTitle }
  }, [id, post])

  // Article + FAQ structured data
  const schema = useMemo(() => {
    if (!post) return null
    const graph = [{
      '@type': 'Article',
      headline: post.title,
      description: post.excerpt || undefined,
      image: post.coverImage || undefined,
      datePublished: post.publishedAt || post.created_at || undefined,
      dateModified: post.updated_at || undefined,
      author: { '@type': 'Organization', name: post.author || 'Ease My Vacations' },
      publisher: { '@type': 'Organization', name: 'Ease My Vacations' },
    }]
    if (faqs.length > 0) {
      graph.push({
        '@type': 'FAQPage',
        mainEntity: faqs.map(faq => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: { '@type': 'Answer', text: faq.a },
        })),
      })
    }
    return { '@context': 'https://schema.org', '@graph': graph }
  }, [post, faqs])
  useJsonLd('blog-post-schema', schema)

  const shareUrl  = post ? buildShareUrl(post.slug || post.id || id) : ''
  const shareText = post ? (post.excerpt || `Read "${post.title}" on Ease My Vacations`) : ''

  const shareTo = (network) => {
    const encodedUrl  = encodeURIComponent(shareUrl)
    const encodedText = encodeURIComponent(`${post.title}\n${shareUrl}`)
    const links = {
      whatsapp: `https://wa.me/?text=${encodedText}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      x:        `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(post.title)}`,
    }
    window.open(links[network], '_blank', 'noopener,noreferrer')
  }

  const copyLink = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, text: shareText, url: shareUrl })
        return
      }
    } catch (err) {
      if (err?.name === 'AbortError') return
    }
    try {
      await navigator.clipboard?.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard blocked — the share buttons still work */ }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.spinnerWrap}><div className={styles.spinner} /></div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.errorWrap}>
            <p className={styles.errorTitle}>Article not found</p>
            <p className={styles.errorDesc}>{error || 'This article may have been moved or deleted.'}</p>
            <button onClick={() => navigate('/blog')} className={styles.primaryBtn}>Back to the Journal</button>
          </div>
        </div>
      </div>
    )
  }

  const content = normalizeMarkdown(post.content || post.excerpt || '')
  const [firstHalf, secondHalf] = packages.length > 0 ? splitAtMidpoint(content) : [content, '']
  const midPackage = packages[0]

  return (
    <div className={styles.page}>
      {post.coverImage && (
        <div className={styles.cover}>
          <img
            src={post.coverImage}
            alt={post.coverAlt || post.title}
            className={styles.coverImg}
          />
          <div className={styles.coverOverlay} />
        </div>
      )}

      <div className={styles.inner}>
        <Link to="/blog" className={styles.backBtn}>← The Travel Journal</Link>

        {/* ── Header ──────────────────────────────────────────── */}
        <motion.header
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
        >
          {post.category && <span className={styles.badge}>{post.category}</span>}
          <h1 className={styles.title}>{post.title}</h1>
          {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}

          <div className={styles.metaRow}>
            {post.author && <span className={styles.metaItem}>By {post.author}</span>}
            {mins  && <span className={styles.metaItem}>{mins} min read</span>}
            {fresh && (
              <time dateTime={fresh.iso} className={styles.metaItem}>
                {fresh.label} {fresh.date}
              </time>
            )}
          </div>

          {/* Share — WhatsApp first, which is how most Indian readers pass
              an article to family */}
          <div className={styles.shareRow}>
            <span className={styles.shareLabel}>Share</span>
            <button onClick={() => shareTo('whatsapp')} className={`${styles.shareBtn} ${styles.shareWa}`}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d={WA_PATH} /></svg>
              WhatsApp
            </button>
            <button onClick={() => shareTo('facebook')} className={styles.shareBtn} aria-label="Share on Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </button>
            <button onClick={() => shareTo('linkedin')} className={styles.shareBtn} aria-label="Share on LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </button>
            <button onClick={() => shareTo('x')} className={styles.shareBtn} aria-label="Share on X">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </button>
            <button onClick={copyLink} className={styles.shareBtn}>
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>
        </motion.header>

        {/* ── Body ────────────────────────────────────────────── */}
        <article className={styles.body}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
            {firstHalf}
          </ReactMarkdown>

          {/* Mid-article package — placed at a paragraph break */}
          {midPackage && secondHalf && (
            <aside className={styles.inlinePkg}>
              <p className={styles.inlinePkgLabel}>Want us to plan this trip for you?</p>
              <PackageCard
                pkg={midPackage}
                onOpen={() => navigate(`/package-details/${midPackage.slug || midPackage.id || midPackage._id}`)}
              />
            </aside>
          )}

          {secondHalf && (
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
              {secondHalf}
            </ReactMarkdown>
          )}
        </article>

        {post.tags?.length > 0 && (
          <div className={styles.tags}>
            {post.tags.map(tag => (
              <Link key={tag} to={`/blog?destination=${encodeURIComponent(tag)}`} className={styles.tag}>
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* ── Destination-specific CTA ────────────────────────── */}
        <section className={styles.articleCta}>
          <h2 className={styles.articleCtaHeading}>
            {destination ? `Planning a ${destination} holiday?` : 'Planning your next holiday?'}
          </h2>
          <p className={styles.articleCtaSub}>
            {destination
              ? `Let our travel experts build a personalised ${destination} itinerary around your dates, preferences and budget.`
              : 'Let our travel experts build a personalised itinerary around your dates, preferences and budget.'}
          </p>
          <div className={styles.articleCtaBtns}>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-travel-quiz'))}
              className={styles.primaryBtn}
            >
              {destination ? `Get My ${destination} Quote` : 'Get My Personalised Quote'} {ARROW}
            </button>
            <button onClick={() => openWhatsApp(destination || '')} className={styles.ghostBtn}>
              <svg viewBox="0 0 24 24" fill="currentColor" className={styles.waIcon}><path d={WA_PATH} /></svg>
              {destination ? `Talk to a ${destination} Expert` : 'Talk to a Travel Expert'}
            </button>
          </div>
        </section>

        {/* ── Per-article FAQ ─────────────────────────────────── */}
        {faqs.length > 0 && (
          <section className={styles.faqSection}>
            <h2 className={styles.sectionHeading}>
              {destination ? `${destination} Travel FAQs` : 'Frequently Asked Questions'}
            </h2>
            <div className={styles.faqList}>
              {faqs.map((faq, i) => {
                const isOpen = openFaq === i
                return (
                  <div key={faq.q} className={styles.faqItem}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className={styles.faqQ}
                      aria-expanded={isOpen}
                    >
                      <span>{faq.q}</span>
                      <span className={`${styles.faqIcon} ${isOpen ? styles.faqIconOpen : ''}`}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </span>
                    </button>
                    {isOpen && <div className={styles.faqA}>{faq.a}</div>}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Author ──────────────────────────────────────────── */}
        {author && (
          <section className={styles.authorCard}>
            {author.avatar
              ? <img src={author.avatar} alt={author.name} loading="lazy" className={styles.authorPhoto} />
              : <span className={styles.authorPhotoFallback} aria-hidden="true">{author.name?.[0] || '·'}</span>}
            <div>
              <p className={styles.authorLabel}>About the author</p>
              <p className={styles.authorName}>{author.name}</p>
              {author.role && <p className={styles.authorRole}>{author.role}</p>}
              {author.bio && <p className={styles.authorBio}>{author.bio}</p>}
            </div>
          </section>
        )}
      </div>

      {/* ── Explore holidays ────────────────────────────────────── */}
      {packages.length > 0 && (
        <section className={styles.pkgSection}>
          <div className={styles.pkgInner}>
            <div className={styles.pkgHead}>
              <h2 className={styles.sectionHeading}>
                {destination ? `Explore ${destination} Holidays` : 'Explore Our Holidays'}
              </h2>
              <Link to="/packages" className={styles.linkBtn}>View all holidays {ARROW}</Link>
            </div>
            <div className={styles.pkgGrid}>
              {packages.map(pkg => (
                <PackageCard
                  key={pkg.id || pkg._id}
                  pkg={pkg}
                  onOpen={() => navigate(`/package-details/${pkg.slug || pkg.id || pkg._id}`)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Read next ───────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className={styles.relatedSection}>
          <div className={styles.pkgInner}>
            <div className={styles.pkgHead}>
              <h2 className={styles.sectionHeading}>Continue Exploring</h2>
              <Link to="/blog" className={styles.linkBtn}>All articles {ARROW}</Link>
            </div>
            <div className={styles.pkgGrid}>
              {related.map(item => {
                const slug = item.slug || item._id || item.id
                const itemMins = readingMinutes(item)
                return (
                  <article
                    key={slug}
                    className={styles.relCard}
                    onClick={() => navigate(`/blog/${slug}`)}
                  >
                    <div className={styles.pkgImgWrap}>
                      {item.coverImage
                        ? <img src={item.coverImage} alt={item.coverAlt || item.title} loading="lazy" className={styles.pkgImg} />
                        : <span className={styles.relImgFallback} aria-hidden="true" />}
                    </div>
                    <div className={styles.pkgBody}>
                      {item.category && <p className={styles.pkgDuration}>{item.category}</p>}
                      <h3 className={styles.pkgTitle}>{item.title}</h3>
                      {itemMins && <p className={styles.relMeta}>{itemMins} min read</p>}
                      <span className={styles.pkgLink}>Read More {ARROW}</span>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
