import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../../services/api'
import styles from './Blog.module.css'

const categoryStyle = {
  'Travel Tips':       { background: '#eff6ff', color: '#1d4ed8' },
  'Honeymoon':         { background: '#fdf2f8', color: '#9d174d' },
  'Luxury Travel':     { background: '#faf5ff', color: '#7e22ce' },
  'Destinations':      { background: '#fff7ed', color: '#c2410c' },
  'Family Travel':     { background: '#f0fdf4', color: '#15803d' },
  'Wellness':          { background: '#f0fdfa', color: '#0f766e' },
  'Behind the Scenes': { background: '#fefce8', color: '#a16207' },
  'News':              { background: '#f3f4f6', color: '#374151' },
  'Culture':           { background: '#fff1f2', color: '#be123c' },
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function BlogPostModal({ post, onClose }) {
  const badgeStyle = categoryStyle[post.category] || { background: '#f3f4f6', color: '#374151' }

  // Simple renderer: ## Heading, - bullet, blank line = paragraph break
  const renderContent = (text) => {
    if (!text) return null
    const lines = text.split('\n')
    const elements = []
    let listItems = []

    const flushList = () => {
      if (listItems.length) {
        elements.push(
          <ul key={`ul-${elements.length}`} style={{ paddingLeft: '1.5rem', margin: '0.75rem 0', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
            {listItems.map((li, i) => (
              <li key={i} style={{ color: '#374151', fontSize: '1rem', lineHeight: 1.7, fontWeight: 400 }}>{li}</li>
            ))}
          </ul>
        )
        listItems = []
      }
    }

    lines.forEach((line, i) => {
      if (line.startsWith('## ')) {
        flushList()
        elements.push(<h3 key={i} style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--dark)', margin: '1.5rem 0 0.5rem', lineHeight: 1.3 }}>{line.slice(3)}</h3>)
      } else if (line.startsWith('# ')) {
        flushList()
        elements.push(<h2 key={i} style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.5rem', color: 'var(--dark)', margin: '1.75rem 0 0.625rem', lineHeight: 1.2 }}>{line.slice(2)}</h2>)
      } else if (line.startsWith('- ') || line.startsWith('• ')) {
        listItems.push(line.slice(2))
      } else if (line.trim() === '') {
        flushList()
      } else {
        flushList()
        elements.push(<p key={i} style={{ color: '#374151', fontSize: '1rem', lineHeight: 1.8, fontWeight: 400, margin: '0.5rem 0' }}>{line}</p>)
      }
    })
    flushList()
    return elements
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1rem', overflowY: 'auto' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: '1.5rem', width: '100%', maxWidth: '720px', overflow: 'hidden', marginTop: '5rem', marginBottom: '2rem', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}
      >
        {post.coverImage && (
          <div style={{ height: '260px', overflow: 'hidden' }}>
            <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}
        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <span style={{ ...badgeStyle, padding: '0.375rem 0.875rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{post.category}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: '#9ca3af', fontSize: '0.8125rem', fontWeight: 600 }}>{post.author}</span>
              <span style={{ color: '#d1d5db', fontSize: '0.8125rem' }}>·</span>
              <span style={{ color: '#9ca3af', fontSize: '0.8125rem', fontWeight: 600 }}>{formatDate(post.publishedAt)}</span>
              <button onClick={onClose} style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: '#f3f4f6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontWeight: 700, fontSize: '0.875rem' }}>✕</button>
            </div>
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 'clamp(1.5rem, 4vw, 2rem)', color: 'var(--dark)', letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: '1.25rem' }}>{post.title}</h1>
          {post.excerpt && <p style={{ color: '#6b7280', fontSize: '1.0625rem', lineHeight: 1.7, fontWeight: 400, marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #f3f4f6' }}>{post.excerpt}</p>}
          <div>{renderContent(post.content || post.excerpt || '')}</div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Blog() {
  const [posts,      setPosts]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [activePost, setActivePost] = useState(null)

  useEffect(() => {
    api.getBlogs({ status: 'published', limit: 20 })
      .then(data => setPosts(data.blogs || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className={styles.page}>

      {/* Hero */}
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
              Expert advice, destination guides, and insider tips from the EMV Global concierge team — to help you travel smarter.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Posts */}
      <section className={styles.postsSection}>
        <div className={styles.inner}>
          {loading ? (
            <div className={styles.spinner}>
              <div className={styles.spinnerCircle} />
            </div>
          ) : posts.length === 0 ? (
            <div className={styles.comingSoon}>
              <span className={styles.comingSoonIcon}>✍️</span>
              <div>
                <p className={styles.comingSoonTitle}>Blog launching soon</p>
                <p className={styles.comingSoonDesc}>Our travel writers are crafting in-depth guides. Check back shortly or follow us on Instagram for updates.</p>
              </div>
            </div>
          ) : (
            <div className={styles.grid}>
              {posts.map((post, i) => {
                const id = post._id || post.id
                const badgeStyle = categoryStyle[post.category] || { background: '#f3f4f6', color: '#374151' }
                return (
                  <motion.article
                    key={id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.07, duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                    className={styles.card}
                    onClick={() => setActivePost(post)}
                    style={{ cursor: 'pointer' }}
                  >
                    {post.coverImage ? (
                      <div className={styles.cardImg}>
                        <img src={post.coverImage} alt={post.title} />
                      </div>
                    ) : (
                      <div className={styles.cardImgPlaceholder}>✈</div>
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
                        <span className={styles.cardReadMore}>Read More →</span>
                      </div>
                    </div>
                  </motion.article>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
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
            <p className={styles.newsletterDesc}>Destination guides, exclusive deals, and curated itineraries — delivered once a month.</p>
            <div className={styles.newsletterForm}>
              <input type="email" placeholder="Your email address" className={styles.newsletterInput} />
              <button className={styles.newsletterBtn}>Subscribe</button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Blog post modal */}
      <AnimatePresence>
        {activePost && (
          <BlogPostModal post={activePost} onClose={() => setActivePost(null)} />
        )}
      </AnimatePresence>

    </div>
  )
}
