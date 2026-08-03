import { motion } from 'framer-motion'
import styles from './TrustBadges.module.css'

const ICONS = {
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></>,
  lock:   <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
  check:  <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></>,
  users:  <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  award:  <><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></>,
  headset:<><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></>,
}

const BADGES = [
  { icon: 'shield',  title: 'IATA Accredited',        sub: 'Certified travel partner' },
  { icon: 'lock',    title: '100% Secure Payments',   sub: 'SSL encrypted checkout' },
  { icon: 'check',   title: 'No Hidden Charges',      sub: 'Transparent pricing, always' },
  { icon: 'headset', title: '24/7 Concierge',         sub: 'Real humans, always reachable' },
  { icon: 'users',   title: '15,000+ Travellers',     sub: 'Trusted since day one' },
  { icon: 'award',   title: 'Award-Winning Service',  sub: 'Recognised for excellence' },
]

export default function TrustBadges() {
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
          <h2 className={styles.heading}>Booked with confidence.</h2>
        </motion.div>

        <div className={styles.grid}>
          {BADGES.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.07, ease: [0.33, 1, 0.68, 1] }}
              className={styles.badge}
            >
              <div className={styles.iconWrap}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {ICONS[b.icon]}
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
