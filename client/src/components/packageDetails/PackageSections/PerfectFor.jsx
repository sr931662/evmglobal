import { motion } from 'framer-motion'
import { perfectFor, tripPace } from '../../../utils/packageContent'
import styles from './PackageSections.module.css'

// Audience tags plus a pace read-out measured off the itinerary itself.
// Renders nothing when the package has neither.
export default function PerfectFor({ pkg }) {
  const tags  = perfectFor(pkg)
  const paces = tripPace(pkg)

  if (tags.length === 0 && !paces) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
      className={styles.card}
    >
      <span className={styles.eyebrow}>Is This Trip For You?</span>
      <h2 className={styles.heading}>This Trip Is Perfect For</h2>

      {tags.length > 0 && (
        <div className={styles.tags}>
          {tags.map(tag => (
            <span key={tag.label} className={styles.tag}>
              <span aria-hidden="true">{tag.icon}</span> {tag.label}
            </span>
          ))}
        </div>
      )}

      {paces && (
        <>
          <p className={styles.sub} style={{ marginTop: '1.75rem', marginBottom: 0 }}>
            How this holiday actually feels, based on the day-by-day itinerary:
          </p>
          <div className={styles.meters}>
            {paces.map(pace => (
              <div key={pace.key} className={styles.meterRow}>
                <span className={styles.meterKey}>{pace.key}</span>
                <span className={styles.meterDots} aria-label={`${pace.score} out of 5`}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <span
                      key={n}
                      className={`${styles.meterDot} ${n <= pace.score ? styles.meterDotOn : ''}`}
                    />
                  ))}
                </span>
                <span className={styles.meterLabel}>{pace.label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.section>
  )
}
