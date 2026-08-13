import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../../services/api'
import styles from './TrustStats.module.css'

// Only counts we can actually substantiate are shown. "Since 2022" is a fact;
// the destination and holiday counts come straight from live catalogue data.
// Anything else (e.g. happy travellers) has to be entered in the CMS under
// section: 'stat' — we never invent a number here.
const FOUNDED = { value: 'Since 2022', label: 'Serving travellers' }

export default function TrustStats() {
  const [stats, setStats] = useState([FOUNDED])

  useEffect(() => {
    let cancelled = false

    Promise.all([
      api.getHomeContent({ section: 'stat', status: 'active' }).catch(() => []),
      api.getDestinations().catch(() => []),
      api.getPackages({ status: 'Active', limit: 200 }).catch(() => []),
    ]).then(([cmsStats, destData, pkgData]) => {
      if (cancelled) return

      if (Array.isArray(cmsStats) && cmsStats.length > 0) {
        setStats(cmsStats.map(item => ({ value: item.title, label: item.subtitle })))
        return
      }

      const dests = Array.isArray(destData) ? destData : []
      const pkgs  = Array.isArray(pkgData?.packages) ? pkgData.packages
        : (Array.isArray(pkgData) ? pkgData : [])

      setStats([
        FOUNDED,
        dests.length ? { value: `${dests.length}+`, label: 'Destinations' }        : null,
        pkgs.length  ? { value: `${pkgs.length}+`,  label: 'Holiday Experiences' } : null,
        { value: '24/7', label: 'On-Trip Assistance' },
      ].filter(Boolean))
    })

    return () => { cancelled = true }
  }, [])

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
          className={styles.header}
        >
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowLine} /> Traveller Trust
          </span>
          <h2 className={styles.heading}>Why Travellers Choose Ease My Vacations</h2>
        </motion.div>

        <div className={styles.grid}>
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label || i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: [0.33, 1, 0.68, 1] }}
              className={styles.stat}
            >
              <p className={styles.value}>{stat.value}</p>
              <p className={styles.label}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
