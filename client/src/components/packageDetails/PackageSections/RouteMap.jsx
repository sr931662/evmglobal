import { motion } from 'framer-motion'
import { routeStops } from '../../../utils/packageContent'
import styles from './PackageSections.module.css'

// "Krabi → Koh Samui → Phuket" with nights at each stop. Hidden entirely when
// the package is single-destination, where a route adds nothing.
export default function RouteMap({ pkg }) {
  const stops = routeStops(pkg)
  if (stops.length < 2) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
      className={styles.card}
    >
      <span className={styles.eyebrow}>Your Route</span>
      <h2 className={styles.heading}>{stops.map(s => s.city).join(' → ')}</h2>

      <div className={styles.route}>
        {stops.map((stop, i) => (
          <div key={stop.city} style={{ display: 'contents' }}>
            {i > 0 && <div className={styles.connector} aria-hidden="true" />}
            <div className={styles.stop}>
              <span className={styles.stopPin} aria-hidden="true">📍</span>
              <div>
                <p className={styles.stopCity}>{stop.city}</p>
                {stop.nights > 0 && (
                  <p className={styles.stopNights}>
                    {stop.nights}N
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  )
}
