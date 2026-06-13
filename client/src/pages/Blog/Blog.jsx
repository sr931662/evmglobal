import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { usePageMeta } from '../../hooks/usePageMeta'
import styles from './Blog.module.css'

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
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function buildShareUrl(slug) {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/blog/${slug}`
}

const LIMIT = 12

export default function Blog() {
  usePageMeta(
    'EaseMyVacations Blogs',
    'Read travel tips, destination guides, honeymoon ideas, and insider travel advice from the Ease My Vacations team. Get inspired for your next holiday.'
  )

  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const totalPages = Math.ceil(total / LIMIT)

  const fetchPosts = useCallback(() => {
    setLoading(true)
    api.getBlogs({ status: 'published', page, limit: LIMIT })
      .then(data => {
        setPosts(data.blogs || [])
        setTotal(data.pagination?.total || 0)
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [page])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  async function handleShare(event, post) {
    event.stopPropagation()

    const slug = post.slug || post._id || post.id
    const shareUrl = buildShareUrl(slug)
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

  return (
    <div className={styles.page}>
      <section className={styles.heroSection}>
        <div className={styles.inner}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
          >
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowLine} /> Travel Insights
            </span>
            <h1 className={styles.heroHeading}>
              Stories, guides &amp;<br />travel inspiration.
            </h1>
            <p className={styles.heroDesc}>
              Expert advice, destination guides, and insider tips from the EMV Global concierge team to help you travel smarter.
            </p>
          </motion.div>
        </div>
      </section>

      <section className={styles.postsSection}>
        <div className={styles.inner}>
          {loading ? (
            <div className={styles.spinner}>
              <div className={styles.spinnerCircle} />
            </div>
          ) : posts.length === 0 ? (
            <div className={styles.comingSoon}>
              <span className={styles.comingSoonIcon}>Writing</span>
              <div>
                <p className={styles.comingSoonTitle}>Blog launching soon</p>
                <p className={styles.comingSoonDesc}>Our travel writers are crafting in-depth guides. Check back shortly or follow us on Instagram for updates.</p>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.grid}>
                {posts.map((post, i) => {
                  const id = post._id || post.id
                  const slug = post.slug || id
                  const badgeStyle = categoryStyle[post.category] || { background: '#f3f4f6', color: '#374151' }

                  return (
                    <motion.article
                      key={id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + i * 0.05, duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                      className={styles.card}
                      onClick={() => navigate(`/blog/${slug}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      {post.coverImage ? (
                        <div className={styles.cardImg}>
                          <img src={post.coverImage} alt={post.title} />
                        </div>
                      ) : (
                        <div className={styles.cardImgPlaceholder}>Trip</div>
                      )}
                      <div className={styles.cardBody}>
                        <div className={styles.cardMeta}>
                          <span className={styles.cardBadge} style={badgeStyle}>{post.category}</span>
                          <span className={styles.cardAuthor}>{post.author}</span>
                        </div>
                        <h2 className={styles.cardTitle}>{post.title}</h2>
                        <p className={styles.cardExcerpt}>{post.excerpt}</p>
                        <div className={styles.cardFooter}>
                          <span className={styles.cardDate}>{formatDate(post.publishedAt)}</span>
                          <div className={styles.cardActions}>
                            <button
                              type="button"
                              className={styles.cardShareBtn}
                              onClick={(event) => handleShare(event, post)}
                              aria-label={`Share ${post.title}`}
                            >
                              Share
                            </button>
                            <span className={styles.cardReadMore}>Read More</span>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  )
                })}
              </div>

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className={styles.pageBtn}
                    aria-label="Previous page"
                  >
                    Prev
                  </button>

                  <div className={styles.pageNumbers}>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                      return (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`${styles.pageNum} ${p === page ? styles.pageNumActive : ''}`}
                          aria-label={`Page ${p}`}
                          aria-current={p === page ? 'page' : undefined}
                        >
                          {p}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className={styles.pageBtn}
                    aria-label="Next page"
                  >
                    Next
                  </button>
                </div>
              )}

              <p className={styles.pageCount}>
                Showing {posts.length} of {total} articles
                {totalPages > 1 && ` | Page ${page} of ${totalPages}`}
              </p>
            </>
          )}
        </div>
      </section>

      <section className={styles.newsletterSection}>
        <div className={styles.inner}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className={styles.newsletterInner}
          >
            <h2 className={styles.newsletterHeading}>Get travel inspiration in your inbox</h2>
            <p className={styles.newsletterDesc}>Destination guides, exclusive deals, and curated itineraries delivered once a month.</p>
            <div className={styles.newsletterForm}>
              <input type="email" placeholder="Your email address" className={styles.newsletterInput} />
              <button className={styles.newsletterBtn}>Subscribe</button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
