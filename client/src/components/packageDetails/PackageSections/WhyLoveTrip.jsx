import { motion } from 'framer-motion'
import styles from './PackageSections.module.css'

// Icons are matched to what the highlight actually says, so a package about
// beaches doesn't get a mountain icon.
const ICON_RULES = [
  [/beach|sea|coast|sand|ocean/i,             '🌊'],
  [/island|archipelago|isle/i,                '🏝'],
  [/hotel|resort|stay|villa|accommodation/i,  '🏨'],
  [/flight|air|transfer|airport/i,            '✈️'],
  [/food|cuisine|dinner|breakfast|meal|dine/i,'🍽'],
  [/temple|culture|heritage|museum|palace/i,  '🛕'],
  [/city|shopping|market|nightlife/i,         '🏙'],
  [/mountain|trek|hike|valley|snow/i,         '🏔'],
  [/cruise|boat|ferry|yacht|sail/i,           '⛵'],
  [/safari|wildlife|park|nature/i,            '🦁'],
  [/spa|wellness|massage|relax/i,             '🧖'],
  [/honeymoon|romantic|couple/i,              '💑'],
]

function iconFor(text, index) {
  const match = ICON_RULES.find(([pattern]) => pattern.test(text))
  return match ? match[1] : ['✦', '🌴', '📸', '🌅'][index % 4]
}

export default function WhyLoveTrip({ pkg, where }) {
  const highlights = Array.isArray(pkg?.highlights) ? pkg.highlights.filter(Boolean) : []
  if (highlights.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
      className={styles.card}
    >
      <span className={styles.eyebrow}>Highlights</span>
      <h2 className={styles.heading}>
        Why You&rsquo;ll Love This {where ? `${where} ` : ''}Trip
      </h2>
      <p className={styles.sub}>The moments that make this itinerary worth the flight.</p>

      <div className={`${styles.grid} ${styles.gridThree}`}>
        {highlights.map((highlight, i) => (
          <div key={i} className={styles.feature}>
            <span className={styles.featureIcon} aria-hidden="true">{iconFor(highlight, i)}</span>
            <p className={styles.featureTitle}>{highlight}</p>
          </div>
        ))}
      </div>
    </motion.section>
  )
}
