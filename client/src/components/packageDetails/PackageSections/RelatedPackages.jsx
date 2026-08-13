import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../services/api'
import { formatPrice } from '../../../utils/currency'
import styles from './PackageSections.module.css'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1000'

// Scores candidates by how much they overlap with the current package —
// shared destinations first, then category — so "You may also like" is
// actually related rather than a random slice of the catalogue.
function scoreRelated(candidate, current) {
  const currentDests = new Set(
    (Array.isArray(current.destinations) ? current.destinations : [])
      .map(d => (d || '').toLowerCase().trim())
  )
  const candidateDests = Array.isArray(candidate.destinations) ? candidate.destinations : []

  let score = candidateDests.reduce(
    (acc, d) => acc + (currentDests.has((d || '').toLowerCase().trim()) ? 3 : 0),
    0
  )
  if (candidate.category && candidate.category === current.category) score += 1
  return score
}

export default function RelatedPackages({ pkg, where }) {
  const navigate = useNavigate()
  const [related, setRelated] = useState([])

  const currentId = pkg?.id || pkg?._id

  useEffect(() => {
    if (!pkg) return
    let cancelled = false

    api.getPackages({ status: 'Active', limit: 60 })
      .then(data => {
        if (cancelled) return
        const all = Array.isArray(data?.packages) ? data.packages : (Array.isArray(data) ? data : [])
        const scored = all
          .filter(p => (p.id || p._id) !== currentId)
          .map(p => ({ pkg: p, score: scoreRelated(p, pkg) }))
          .filter(entry => entry.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map(entry => entry.pkg)
        setRelated(scored)
      })
      .catch(() => setRelated([]))

    return () => { cancelled = true }
  }, [currentId, pkg])

  if (related.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
      className={styles.card}
    >
      <span className={styles.eyebrow}>You May Also Like</span>
      <h2 className={styles.heading}>{where ? `More ${where} Holidays` : 'More Holidays You May Like'}</h2>
      <p className={styles.sub}>Similar itineraries our travellers often compare this one with.</p>

      <div className={styles.relatedGrid}>
        {related.map(item => {
          const id = item.slug || item.id || item._id
          const price = formatPrice(item.priceValue, item.price)
          const nights = Number(item.nights) || 0

          return (
            <article
              key={id}
              className={styles.relatedCard}
              onClick={() => navigate(`/package-details/${id}`)}
            >
              <div className={styles.relatedImgWrap}>
                <img
                  src={item.image || FALLBACK_IMAGE}
                  alt={item.title}
                  loading="lazy"
                  className={styles.relatedImg}
                />
              </div>
              <div className={styles.relatedBody}>
                {nights > 0 && (
                  <p className={styles.relatedDuration}>{nights} Nights / {nights + 1} Days</p>
                )}
                <h3 className={styles.relatedTitle}>{item.title}</h3>
                {price && (
                  <p className={styles.relatedPrice}>From <strong>{price}</strong> / person</p>
                )}
                <span className={styles.relatedLink}>
                  View Package
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '0.875rem', height: '0.875rem' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
              </div>
            </article>
          )
        })}
      </div>
    </motion.section>
  )
}
