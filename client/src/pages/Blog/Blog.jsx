import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
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

export default function Blog() {
  const navigate             = useNavigate()
  const [posts,   setPosts]  = useState([])
  const [loading, setLoading] = useState(true)

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
                const id         = post._id || post.id
                const badgeStyle = categoryStyle[post.category] || { background: '#f3f4f6', color: '#374151' }
                return (
                  <motion.article
                    key={id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.07, duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                    className={styles.card}
                    onClick={() => navigate(`/blog/${id}`)}
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

    </div>
  )
}
