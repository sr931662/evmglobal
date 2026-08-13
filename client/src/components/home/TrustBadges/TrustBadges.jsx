import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../../services/api'
import styles from './TrustBadges.module.css'

const ICONS = {
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></>,
  lock:   <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
  check:  <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>,
  users:  <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  award:  <><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></>,
  headset:<><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></>,
  route:  <><circle cx="6" cy="19" r="3" /><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" /><circle cx="18" cy="5" r="3" /></>,
  tag:    <><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></>,
  globe:  <><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>,
}

// Rendered until the API responds, and kept if it fails — the section never goes blank.
const FALLBACK = [
  { icon: 'route',   title: 'Personalised Itineraries', sub: 'Trips designed around your preferences' },
  { icon: 'tag',     title: 'Competitive Pricing',      sub: 'We compare options to find the right value' },
  { icon: 'headset', title: 'Dedicated Travel Expert',  sub: 'One point of contact throughout your journey' },
  { icon: 'globe',   title: 'On-Trip Assistance',       sub: 'Support when you need us, wherever you travel' },
]

export default function TrustBadges() {
  const [badges, setBadges] = useState(FALLBACK)

  useEffect(() => {
    api.getHomeContent({ section: 'trust', status: 'active' })
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) return
        setBadges(data.map(item => ({
          icon:  item.icon || 'shield',
          title: item.title,
          sub:   item.subtitle,
        })))
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
          className={styles.header}
        >
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowLine} /> Trust &amp; Assurance
          </span>
          <h2 className={styles.heading}>Why Travel With Ease My Vacations?</h2>
          <p className={styles.sub}>
            Everything a booking site can&rsquo;t give you — a real expert, a real plan, and a real person to call.
          </p>
        </motion.div>

        <div className={styles.grid}>
          {badges.map((b, i) => (
            <motion.div
              key={b.title || i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.07, ease: [0.33, 1, 0.68, 1] }}
              className={styles.badge}
            >
              <div className={styles.iconWrap}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {ICONS[b.icon] || ICONS.shield}
                </svg>
              </div>
              <p className={styles.badgeTitle}>{b.title}</p>
              <p className={styles.badgeSub}>{b.sub}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
