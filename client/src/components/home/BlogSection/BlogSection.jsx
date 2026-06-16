import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../services/api'
import styles from './BlogSection.module.css'

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

const ARROW = (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1rem', height: '1rem' }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
)

export default function BlogSection() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getBlogs({ status: 'published', page: 1, limit: 3 })
      .then(data => setPosts(data.blogs || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

  if (!loading && posts.length === 0) return null

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
          className={styles.header}
        >
          <div>
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowLine} /> From Our Blog
            </span>
            <h2 className={styles.heading}>
              Travel stories &amp;<br />insider guides.
            </h2>
          </div>
          <button onClick={() => navigate('/blog')} className={styles.allBtn}>
            All Articles {ARROW}
          </button>
        </motion.div>

        {loading ? (
          <div className={styles.skeletonGrid}>
            {[0, 1, 2].map(i => <div key={i} className={styles.skeleton} />)}
          </div>
        ) : (
          <div className={styles.grid}>
            {posts.map((post, i) => {
              const id   = post._id || post.id
              const slug = post.slug || id
              const badgeStyle = categoryStyle[post.category] || { background: '#f3f4f6', color: '#374151' }

              return (
                <motion.article
                  key={id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.7, delay: i * 0.1, ease: [0.33, 1, 0.68, 1] }}
                  whileHover={{ y: -6, transition: { duration: 0.35, ease: [0.33, 1, 0.68, 1] } }}
                  className={styles.card}
                  onClick={() => navigate(`/blog/${slug}`)}
                >
                  <div className={styles.cardImgWrap}>
                    {post.coverImage ? (
                      <img src={post.coverImage} alt={post.title} className={styles.cardImg} />
                    ) : (
                      <div className={styles.cardImgPlaceholder} />
                    )}
                    {post.category && (
                      <span className={styles.cardBadge} style={badgeStyle}>{post.category}</span>
                    )}
                  </div>
                  <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle}>{post.title}</h3>
                    {post.excerpt && <p className={styles.cardExcerpt}>{post.excerpt}</p>}
                    <div className={styles.cardFooter}>
                      <span className={styles.cardDate}>{formatDate(post.publishedAt || post.created_at)}</span>
                      <span className={styles.cardRead}>
                        Read More {ARROW}
                      </span>
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
