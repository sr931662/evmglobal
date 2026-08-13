import { motion } from 'framer-motion'
import { openWhatsApp } from '../../../utils/whatsapp'
import styles from './PackageSections.module.css'

const CHANGES = [
  'Add or remove nights',
  'Upgrade your hotel',
  'Add flights',
  'Add sightseeing',
  'Add island or day tours',
  'Add honeymoon arrangements',
  'Change transfers',
  'Extend your stay',
]

export default function CustomiseTrip({ pkg, onRequestQuote }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
      className={styles.card}
    >
      <span className={styles.eyebrow}>Customise Your Trip</span>
      <h2 className={styles.heading}>Make This Trip Yours</h2>
      <p className={styles.sub}>
        This is a starting point, not a fixed product. Tell us what you&rsquo;d change and a travel
        expert will rebuild and requote it around you.
      </p>

      <div className={styles.checklist}>
        {CHANGES.map(change => (
          <span key={change} className={styles.checkItem}>
            <span className={styles.check} aria-hidden="true">✓</span> {change}
          </span>
        ))}
      </div>

      <div className={styles.btnRow}>
        <button onClick={onRequestQuote} className={styles.primaryBtn}>
          Customize My Holiday →
        </button>
        <button onClick={() => openWhatsApp(pkg?.title || '')} className={styles.ghostBtn}>
          Talk to a Travel Expert
        </button>
      </div>
    </motion.section>
  )
}
