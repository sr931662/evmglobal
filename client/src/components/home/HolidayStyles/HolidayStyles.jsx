import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import styles from './HolidayStyles.module.css'

// `to` deep-links into the holidays listing — `category` maps to the CMS
// category tabs, `q` falls back to a keyword search for styles that aren't
// a category of their own.
const STYLES = [
  { emoji: '🏝',  label: 'Beach Escapes',        blurb: 'Sand, sea and slow mornings',        to: '/packages?q=beach' },
  { emoji: '💑', label: 'Honeymoon',            blurb: 'Romantic stays, made private',       to: '/packages?category=Honeymoon' },
  { emoji: '👨‍👩‍👧', label: 'Family Holidays',      blurb: 'Paced for every age group',          to: '/packages?category=Family' },
  { emoji: '🌍', label: 'Europe Tours',         blurb: 'Multi-country classics',             to: '/packages?q=europe' },
  { emoji: '🏔',  label: 'Adventure & Trekking', blurb: 'For journeys beyond the ordinary',   to: '/packages?q=trek' },
  { emoji: '🏙',  label: 'City Breaks',          blurb: 'Short, sharp, unforgettable',        to: '/packages?q=city' },
  { emoji: '🚢', label: 'Cruises',              blurb: 'Discover the world differently',     to: '/packages?q=cruise' },
  { emoji: '💼', label: 'MICE & Corporate',     blurb: 'Travel solutions for businesses',    to: '/packages?q=corporate' },
]

export default function HolidayStyles() {
  const navigate = useNavigate()

  return (
    <section id="travel-styles" className={styles.section}>
      <div className={styles.inner}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
          className={styles.header}
        >
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowLine} /> Travel Your Way
          </span>
          <h2 className={styles.heading}>What Kind of Holiday Are You Looking For?</h2>
          <p className={styles.sub}>
            Pick the kind of trip you have in mind — we&rsquo;ll take it from there.
          </p>
        </motion.div>

        <div className={styles.grid}>
          {STYLES.map((style, i) => (
            <motion.button
              key={style.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.06, ease: [0.33, 1, 0.68, 1] }}
              whileHover={{ y: -4 }}
              onClick={() => navigate(style.to)}
              className={styles.card}
            >
              <span className={styles.emoji} aria-hidden="true">{style.emoji}</span>
              <span className={styles.label}>{style.label}</span>
              <span className={styles.blurb}>{style.blurb}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}
