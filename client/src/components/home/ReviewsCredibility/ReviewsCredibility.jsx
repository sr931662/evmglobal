import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../../services/api'
import styles from './ReviewsCredibility.module.css'

// TODO(marketing): swap for the Google Business Profile review link once the
// place ID is available — this search link is a safe stand-in until then.
const GOOGLE_REVIEWS_URL = 'https://www.google.com/search?q=Ease+My+Vacations+Gurugram+reviews'
const YOUTUBE_URL        = 'https://www.youtube.com/easemyvacationsofficial'

const GOOGLE_ICON = (
  <svg viewBox="0 0 24 24" className={styles.btnIcon}>
    <path fill="currentColor" d="M12 11v2.4h5.7c-.2 1.5-1.7 4.3-5.7 4.3-3.4 0-6.2-2.8-6.2-6.3S8.6 5.1 12 5.1c2 0 3.3.8 4 1.5l2.7-2.6C17 2.4 14.7 1.5 12 1.5 6.2 1.5 1.5 6.2 1.5 12S6.2 22.5 12 22.5c6.1 0 10.1-4.3 10.1-10.3 0-.7-.1-1.2-.2-1.7H12z" />
  </svg>
)

const PLAY_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor" className={styles.btnIcon}>
    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.5 15.6V8.4L15.8 12l-6.3 3.6z" />
  </svg>
)

function Stars({ score }) {
  return (
    <div className={styles.stars} aria-label={`${score} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" fill={i < Math.round(score) ? 'currentColor' : 'none'} stroke="currentColor" className={styles.star}>
          <path strokeLinejoin="round" strokeWidth={i < Math.round(score) ? 0 : 1.5} d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7z" />
        </svg>
      ))}
    </div>
  )
}

export default function ReviewsCredibility() {
  // The rating and review count are only rendered when an admin has actually
  // entered them in the CMS — we never publish an unverified score.
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    api.getHomeContent({ section: 'review-summary', status: 'active' })
      .then(data => {
        const item = Array.isArray(data) ? data[0] : null
        if (!item) return
        const score = Number(item.rating ?? item.title)
        if (!Number.isFinite(score) || score <= 0) return
        setSummary({ score, count: item.subtitle })
      })
      .catch(() => {})
  }, [])

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
          className={styles.card}
        >
          <div className={styles.left}>
            <span className={styles.eyebrow}>Reviews</span>
            <h2 className={styles.heading}>Loved by Travellers</h2>
          </div>

          {summary && (
            <div className={styles.ratingRow}>
              <Stars score={summary.score} />
              <p className={styles.score}>
                {summary.score.toFixed(1)} <span className={styles.scoreOutOf}>/ 5</span>
              </p>
              {summary.count && <p className={styles.basis}>Based on {summary.count}</p>}
            </div>
          )}

          <div className={styles.actions}>
            <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className={styles.primaryBtn}>
              {GOOGLE_ICON} Google Reviews
            </a>
            <a href={YOUTUBE_URL} target="_blank" rel="noopener noreferrer" className={styles.ghostBtn}>
              {PLAY_ICON} Watch Traveller Videos
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
