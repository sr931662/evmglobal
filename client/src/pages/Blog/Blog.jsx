import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
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

const mdComponents = {
  h1: ({ children }) => <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.625rem', color: 'var(--dark)', margin: '1.75rem 0 0.625rem', lineHeight: 1.2, letterSpacing: '-0.02em' }}>{children}</h2>,
  h2: ({ children }) => <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--dark)', margin: '1.5rem 0 0.5rem', lineHeight: 1.3 }}>{children}</h3>,
  h3: ({ children }) => <h4 style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.0625rem', color: 'var(--dark)', margin: '1.25rem 0 0.375rem', lineHeight: 1.4 }}>{children}</h4>,
  p:  ({ children }) => <p style={{ color: '#374151', fontSize: '1rem', lineHeight: 1.85, fontWeight: 400, margin: '0.625rem 0' }}>{children}</p>,
  ul: ({ children }) => <ul style={{ paddingLeft: '1.5rem', margin: '0.75rem 0', display: 'flex', flexDirection: 'column', gap: '0.375rem', listStyleType: 'disc' }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ paddingLeft: '1.5rem', margin: '0.75rem 0', display: 'flex', flexDirection: 'column', gap: '0.375rem', listStyleType: 'decimal' }}>{children}</ol>,
  li: ({ children }) => <li style={{ color: '#374151', fontSize: '1rem', lineHeight: 1.7 }}>{children}</li>,
  strong: ({ children }) => <strong style={{ fontWeight: 700, color: 'var(--dark)' }}>{children}</strong>,
  em: ({ children }) => <em style={{ fontStyle: 'italic', color: '#4b5563' }}>{children}</em>,
  blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid var(--brand)', paddingLeft: '1rem', margin: '1.25rem 0', color: '#6b7280', fontStyle: 'italic' }}>{children}</blockquote>,
  code: ({ inline, children }) => inline
    ? <code style={{ background: '#f3f4f6', padding: '0.15em 0.45em', borderRadius: '0.3rem', fontSize: '0.875em', fontFamily: 'monospace', color: '#be123c' }}>{children}</code>
    : <pre style={{ background: '#1e293b', borderRadius: '0.75rem', padding: '1rem 1.25rem', margin: '1rem 0', overflowX: 'auto' }}><code style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: '#e2e8f0', whiteSpace: 'pre' }}>{children}</code></pre>,
  hr: () => <hr style={{ border: 'none', borderTop: '1px solid #f3f4f6', margin: '1.5rem 0' }} />,
  a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '2px' }}>{children}</a>,
  table: ({ children }) => <div style={{ overflowX: 'auto', margin: '1rem 0' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9375rem' }}>{children}</table></div>,
  th: ({ children }) => <th style={{ background: '#f9fafb', padding: '0.625rem 0.875rem', textAlign: 'left', fontWeight: 700, color: '#374151', borderBottom: '2px solid #e5e7eb' }}>{children}</th>,
  td: ({ children }) => <td style={{ padding: '0.625rem 0.875rem', color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>{children}</td>,
  img: ({ src, alt }) => <img src={src} alt={alt} style={{ maxWidth: '100%', borderRadius: '0.75rem', margin: '1rem 0', display: 'block' }} />,
}

function BlogPostModal({ post, onClose }) {
  const badgeStyle = categoryStyle[post.category] || { background: '#f3f4f6', color: '#374151' }
  const content = post.content || post.excerpt || ''

  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '1.5rem',
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
        }}
      >
        {/* Fixed header */}
        <div style={{ flexShrink: 0 }}>
          {post.coverImage && (
            <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
              <img src={post.coverImage} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.3))' }} />
            </div>
          )}
          <div style={{ padding: post.coverImage ? '1.5rem 2rem 0' : '2rem 2rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.625rem' }}>
              <span style={{ ...badgeStyle, padding: '0.375rem 0.875rem', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{post.category}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.8125rem', fontWeight: 600 }}>{post.author}</span>
                <span style={{ color: '#d1d5db' }}>·</span>
                <span style={{ color: '#9ca3af', fontSize: '0.8125rem', fontWeight: 600 }}>{formatDate(post.publishedAt)}</span>
                <button onClick={onClose} style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: '#f3f4f6', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '0.875rem' }}>✕</button>
              </div>
            </div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 'clamp(1.375rem, 4vw, 1.875rem)', color: 'var(--dark)', letterSpacing: '-0.025em', lineHeight: 1.2, marginBottom: '0.875rem' }}>{post.title}</h1>
            {post.excerpt && (
              <p style={{ color: '#6b7280', fontSize: '1rem', lineHeight: 1.7, marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid #f3f4f6' }}>{post.excerpt}</p>
            )}
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.25rem 2rem 2rem', scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent', overscrollBehavior: 'contain' }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
            {content}
          </ReactMarkdown>
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
