import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './CookieConsent.module.css'

const CONSENT_KEY = 'emv_cookie_consent'

function initMetaPixel() {
  if (window.fbq) return
  try {
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
    (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', '2533390780452728')
    window.fbq('track', 'PageView')
  } catch {}
}

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
      // Small delay so the page settles before banner appears
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  const accept = (level) => {
    localStorage.setItem(CONSENT_KEY, level)
    applyConsent(level)
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
