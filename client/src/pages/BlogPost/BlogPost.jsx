import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { api } from '../../services/api'
import styles from './BlogPost.module.css'

const categoryStyle = {
  'Travel Tips':       { background: '#eff6ff', color: '#1d4ed8' },
  Honeymoon:           { background: '#fdf2f8', color: '#9d174d' },
  'Luxury Travel':     { background: '#faf5ff', color: '#7e22ce' },
  Destinations:        { background: '#fff7ed', color: '#c2410c' },
  'Family Travel':     { background: '#f0fdf4', color: '#15803d' },
  Wellness:            { background: '#f0fdfa', color: '#0f766e' },
  'Behind the Scenes': { background: '#fefce8', color: '#a16207' },
  News:                { background: '#f3f4f6', color: '#374151' },
  Culture:             { background: '#fff1f2', color: '#be123c' },
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

function upsertMeta(selector, attributes) {
  let tag = document.head.querySelector(selector)
  if (!tag) {
    tag = document.createElement('meta')
    document.head.appendChild(tag)
  }

  Object.entries(attributes).forEach(([key, value]) => {
    tag.setAttribute(key, value)
  })
}

function buildShareUrl(slug) {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/blog/${slug}`
}

function resolveMetaImage(post) {
  if (typeof window === 'undefined') return ''

  const candidates = [
    post?.coverImage,
    post?.image,
    post?.thumbnail,
    post?.featuredImage,
    post?.heroImage,
  ]

  for (const candidate of candidates) {
    if (!candidate) continue
    try {
      const resolved = new URL(candidate, window.location.origin).toString()
      if (!resolved.includes('favicon')) return resolved
    } catch {}
  }

  return `${window.location.origin}/favicon.png`
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
  a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className={styles.mdLink}>{children}</a>,
  table: ({ children }) => <div className={styles.mdTableWrap}><table className={styles.mdTable}>{children}</table></div>,
  th: ({ children }) => <th className={styles.mdTh}>{children}</th>,
  td: ({ children }) => <td className={styles.mdTd}>{children}</td>,
  img: ({ src, alt }) => <img src={src} alt={alt} className={styles.mdImg} />,
}

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=800'

function recScore(pkg, tags) {
  const lowerTags = tags.map(t => t.toLowerCase())
  const dests = (pkg.destinations || []).map(d => d.toLowerCase())
  const title = (pkg.title || '').toLowerCase()
  const cat   = (pkg.category || '').toLowerCase()
  let score = 0
  lowerTags.forEach(tag => {
    if (dests.some(d => d.includes(tag) || tag.includes(d))) score += 3
    if (title.includes(tag)) score += 1
    if (cat.includes(tag))   score += 1
  })
  return score
}

export default function BlogPost() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [post,        setPost]        = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [recPackages, setRecPackages] = useState([])

  useEffect(() => {
    api.getBlog(id)
      .then(data => setPost(data))
      .catch(err => setError(err.message || 'Post not found'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!post) return
    const tags = post.tags?.length ? post.tags : []
    const categoryMap = {
      Honeymoon:      'Honeymoon',
      'Family Travel':'Family',
      Luxury:         'Luxury',
      Wellness:       'Wellness',
      Destinations:   null,
      'Travel Tips':  null,
    }
    const catFilter = categoryMap[post.category]
    const params = { status: 'Active', limit: 100 }
    if (catFilter && !tags.length) params.category = catFilter

    api.getPackages(params)
      .then(data => {
        const pkgs = Array.isArray(data) ? data : (data.packages || [])
        if (!tags.length) {
          setRecPackages(pkgs.slice(0, 4))
          return
        }
        const scored = pkgs
          .map(pkg => ({ pkg, score: recScore(pkg, tags) }))
          .filter(({ score }) => score > 0)
          .sort((a, b) => b.score - a.score)
        setRecPackages(scored.slice(0, 4).map(({ pkg }) => pkg))
      })
      .catch(() => {})
  }, [post])

  useEffect(() => {
    if (!post || typeof window === 'undefined') return

    const title = `${post.title} | Ease My Vacations Blog`
    const description = post.excerpt || 'Read the latest travel story from EMV Global.'
    const url = buildShareUrl(post.slug || post.id || id)
    const image = resolveMetaImage(post)
    const previousTitle = document.title

    document.title = title
    upsertMeta('meta[name="description"]', { name: 'description', content: description })
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title })
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description })
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: 'article' })
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: url })
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: image })
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' })
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title })
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description })
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image })

    return () => {
      document.title = previousTitle
    }
  }, [id, post])

  async function handleShare() {
    if (!post || typeof window === 'undefined') return

    const shareUrl = buildShareUrl(post.slug || post.id || id)
    const shareText = post.excerpt || `Read "${post.title}" on EMV Global`

    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, text: shareText, url: shareUrl })
        return
      }
    } catch (err) {
      if (err?.name === 'AbortError') return
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl)
        window.alert('Blog link copied. You can share it now.')
        return
      }
    } catch {}

    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${post.title}\n${shareUrl}`)}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.spinnerWrap}>
          <div className={styles.spinner} />
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.errorWrap}>
            <p className={styles.errorTitle}>Post not found</p>
            <p className={styles.errorDesc}>{error || 'This article may have been moved or deleted.'}</p>
            <button onClick={() => navigate('/blog')} className={styles.backBtn}>Back to Blog</button>
          </div>
        </div>
      </div>
    )
  }

  const badgeStyle = categoryStyle[post.category] || { background: '#f3f4f6', color: '#374151' }
  const content = post.content || post.excerpt || ''

  return (
    <div className={styles.page}>
      {post.coverImage && (
        <div className={styles.cover}>
          <img src={post.coverImage} alt={post.title} className={styles.coverImg} />
          <div className={styles.coverOverlay} />
        </div>
      )}

      <div className={styles.inner}>
        <motion.button
          onClick={() => navigate('/blog')}
          className={styles.backBtn}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          whileHover={{ x: -3 }}
        >
          Back to Blog
        </motion.button>

        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.33, 1, 0.68, 1] }}
        >
          <div className={styles.meta}>
            <span className={styles.badge} style={badgeStyle}>{post.category}</span>
            <span className={styles.metaDot}>|</span>
            <span className={styles.metaText}>{post.author}</span>
            <span className={styles.metaDot}>|</span>
            <span className={styles.metaText}>{formatDate(post.publishedAt || post.created_at)}</span>
          </div>

          <h1 className={styles.title}>{post.title}</h1>

          {post.excerpt && (
            <p className={styles.excerpt}>{post.excerpt}</p>
          )}

          <button type="button" onClick={handleShare} className={styles.shareBtn}>
            Share article
          </button>
        </motion.div>

        <motion.article
          className={styles.body}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
            {content}
          </ReactMarkdown>
        </motion.article>

        {post.tags?.length > 0 && (
          <motion.div
            className={styles.tags}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            {post.tags.map(tag => (
              <span key={tag} className={styles.tag}>#{tag}</span>
            ))}
          </motion.div>
        )}

        <motion.div
          className={styles.bottomBack}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <button onClick={() => navigate('/blog')} className={styles.backBtnBottom}>
            Back to all articles
          </button>
        </motion.div>
      </div>

      {recPackages.length > 0 && (
        <motion.section
          className={styles.recSection}
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45, ease: [0.33, 1, 0.68, 1] }}
        >
          <div className={styles.recInner}>
            <div className={styles.recHead}>
              <div>
                <span className={styles.recEyebrow}>Curated for this article</span>
                <h2 className={styles.recHeading}>Recommended Packages</h2>
              </div>
              <button onClick={() => navigate('/packages')} className={styles.recViewAll}>
                View all packages →
              </button>
            </div>

            <div className={styles.recGrid}>
              {recPackages.map((pkg, i) => {
                const dest = Array.isArray(pkg.destinations) && pkg.destinations.length
                  ? pkg.destinations.join(', ')
                  : pkg.category || ''
                const slug = pkg.slug || pkg.id || pkg._id
                return (
                  <motion.div
                    key={pkg.id || pkg._id}
                    className={styles.recCard}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + i * 0.08, ease: [0.33, 1, 0.68, 1] }}
                    whileHover={{ y: -6, transition: { duration: 0.3 } }}
                    onClick={() => navigate(`/package-details/${slug}`)}
                  >
                    <div className={styles.recCardImg}>
                      <img
                        src={pkg.image || FALLBACK_IMG}
                        alt={pkg.title}
                        className={styles.recImg}
                      />
                      <div className={styles.recImgOverlay} />
                      <span className={styles.recNightsBadge}>◑ {pkg.nights} Nights</span>
                      {pkg.category && (
                        <span className={styles.recCatBadge}>{pkg.category}</span>
                      )}
                    </div>
                    <div className={styles.recCardBody}>
                      <p className={styles.recDest}>📍 {dest}</p>
                      <h3 className={styles.recTitle}>{pkg.title}</h3>
                      <div className={styles.recFooter}>
                        <div>
                          <span className={styles.recPriceLabel}>Per Adult</span>
                          <span className={styles.recPrice}>{pkg.price}</span>
                        </div>
                        <button
                          className={styles.recBtn}
                          onClick={e => { e.stopPropagation(); navigate(`/package-details/${slug}`) }}
                        >
                          View →
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.section>
      )}
    </div>
  )
}
