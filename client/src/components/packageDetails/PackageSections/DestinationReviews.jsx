import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../../services/api'
import styles from './PackageSections.module.css'
import reviewStyles from './DestinationReviews.module.css'

function Stars({ count }) {
  return (
    <div className={reviewStyles.stars} aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" fill={i < count ? 'currentColor' : 'none'} stroke="currentColor" className={reviewStyles.star}>
          <path strokeLinejoin="round" strokeWidth={i < count ? 0 : 1.5} d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7z" />
        </svg>
      ))}
    </div>
  )
}

// Shows only reviews whose trip mentions one of this package's destinations —
// contextual social proof beats a generic company testimonial here. If nothing
// matches, the section is hidden rather than padded with unrelated reviews.
export default function DestinationReviews({ pkg, where }) {
  const [reviews, setReviews] = useState([])

  const destinations = Array.isArray(pkg?.destinations) ? pkg.destinations.filter(Boolean) : []
  const key = destinations.join('|').toLowerCase()

  useEffect(() => {
    if (!key) return
    let cancelled = false

    api.getHomeContent({ section: 'testimonial', status: 'active' })
      .then(data => {
        if (cancelled || !Array.isArray(data)) return
        const needles = key.split('|')
        const matched = data.filter(item => {
          const haystack = `${item.trip || ''} ${item.quote || ''}`.toLowerCase()
          return needles.some(n => n && haystack.includes(n))
        })
        setReviews(matched.slice(0, 3))
      })
      .catch(() => setReviews([]))

    return () => { cancelled = true }
  }, [key])

  if (reviews.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
      className={styles.card}
    >
      <span className={styles.eyebrow}>Traveller Reviews</span>
      <h2 className={styles.heading}>
        {where ? `What Travellers Say About ${where}` : 'What Travellers Say'}
      </h2>

      <div className={reviewStyles.grid}>
        {reviews.map((review, i) => (
          <figure key={review.name || i} className={reviewStyles.review}>
            <Stars count={review.rating ?? 5} />
            <blockquote className={reviewStyles.quote}>{review.quote}</blockquote>
            <figcaption className={reviewStyles.person}>
              <span className={reviewStyles.name}>{review.name}</span>
              {review.trip && <span className={reviewStyles.trip}>{review.trip}</span>}
            </figcaption>
          </figure>
        ))}
      </div>
    </motion.section>
  )
}
