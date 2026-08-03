import { useState } from 'react'
import { motion } from 'framer-motion'
import styles from './NewsletterSection.module.css'

const PERKS = ['Seasonal deals & offers', 'New destination guides', 'Concierge travel tips']

export default function NewsletterSection() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)

  // Demo only — no backend wired up yet, this just simulates a submit.
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setDone(true)
    }, 700)
  }

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
          className={styles.card}
        >
          <div className={styles.orb1} />
          <div className={styles.orb2} />

          <div className={styles.iconBadge}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <polyline points="22 6 12 13 2 6" />
            </svg>
          </div>

          <span className={styles.eyebrow}>Stay Inspired</span>
          <h2 className={styles.heading}>Get insider travel intel.</h2>
          <p className={styles.desc}>
            Fresh destination guides, seasonal deals and concierge tips — straight to your inbox. No spam, unsubscribe anytime.
          </p>

          <div className={styles.perks}>
            {PERKS.map(p => (
              <span key={p} className={styles.perk}>{p}</span>
            ))}
          </div>

          <div className={styles.formWrap}>
            {done ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={styles.successBox}
              >
                <div className={styles.successIcon}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                </div>
                <p className={styles.successTitle}>You're on the list!</p>
                <p className={styles.successSub}>Keep an eye on {email} for our next dispatch.</p>
              </motion.div>
            ) : (
              <>
                <form onSubmit={handleSubmit} className={styles.form}>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className={styles.input}
                  />
                  <button type="submit" disabled={loading} className={styles.submitBtn}>
                    {loading ? <span className={styles.spinner} /> : 'Subscribe'}
                  </button>
                </form>
                <p className={styles.privacy}>No spam, ever. Unsubscribe anytime.</p>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
