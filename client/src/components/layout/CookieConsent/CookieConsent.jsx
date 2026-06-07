import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { initMetaPixel, trackPageView } from '../../../utils/analytics'
import styles from './CookieConsent.module.css'

const CONSENT_KEY = 'emv_cookie_consent'

function applyConsent(level) {
  if (level === 'all') {
    window.gtag?.('consent', 'update', {
      analytics_storage:  'granted',
      ad_storage:         'granted',
      ad_user_data:       'granted',
      ad_personalization: 'granted',
    })
    initMetaPixel()
  } else {
    window.gtag?.('consent', 'update', {
      analytics_storage:  'denied',
      ad_storage:         'denied',
      ad_user_data:       'denied',
      ad_personalization: 'denied',
    })
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY)
    if (saved) {
      applyConsent(saved)
    } else {
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  const accept = (level) => {
    localStorage.setItem(CONSENT_KEY, level)
    applyConsent(level)
    // The route hook has already run for this page — fire the missed page view now
    if (level === 'all') {
      trackPageView(window.location.pathname + window.location.search)
    }
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.45, ease: [0.33, 1, 0.68, 1] }}
          role="dialog"
          aria-label="Cookie consent"
        >
          <div className={styles.accent} />

          <div className={styles.top}>
            <div className={styles.iconWrap}>
              <span className={styles.icon}>🍪</span>
            </div>
            <div>
              <p className={styles.title}>We use cookies</p>
              <p className={styles.desc}>
                We use cookies to enhance your browsing experience, analyse traffic, and personalise
                content. Read our{' '}
                <Link to="/cookie-policy" className={styles.policyLink} onClick={() => setVisible(false)}>
                  Cookie Policy
                </Link>{' '}
                to learn more.
              </p>
            </div>
          </div>

          <div className={styles.actions}>
            <button className={styles.rejectBtn} onClick={() => accept('rejected')}>
              Reject
            </button>
            <button className={styles.necessaryBtn} onClick={() => accept('necessary')}>
              Necessary Only
            </button>
            <button className={styles.acceptBtn} onClick={() => accept('all')}>
              Accept All
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
