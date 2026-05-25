import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate, useParams, Link } from 'react-router-dom'
import PricingWidget from '../../components/packageDetails/PricingWidget/PricingWidget'
import { api } from '../../services/api'
import { openWhatsApp } from '../../utils/whatsapp'
import styles from './PackageDetails.module.css'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=2800'

export default function PackageDetails() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const heroRef    = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const bgY        = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])

  const [pkg,     setPkg]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [itinUnlocked, setItinUnlocked] = useState(() => !!localStorage.getItem('emv_quiz_done'))

  useEffect(() => {
    const h = () => setItinUnlocked(true)
    window.addEventListener('emv-quiz-completed', h)
    return () => window.removeEventListener('emv-quiz-completed', h)
  }, [])

  useEffect(() => {
    if (!id) { navigate('/packages', { replace: true }); return }
    setLoading(true)
    api.getPackage(id)
      .then(setPkg)
      .catch(() => setError('Package not found.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className={styles.loadingPage}>
      <div className={styles.spinnerCircle} />
    </div>
  )

  if (error || !pkg) return (
    <div className={styles.errorPage}>
      <p className={styles.errorMsg}>{error || 'Package not found.'}</p>
      <button onClick={() => navigate('/packages')} className={styles.errorBtn}>
        Back to Packages
      </button>
    </div>
  )

  const destinations = Array.isArray(pkg.destinations) ? pkg.destinations : []
  const highlights   = Array.isArray(pkg.highlights)   ? pkg.highlights   : []
  const inclusions   = Array.isArray(pkg.inclusions)   ? pkg.inclusions   : highlights
  const exclusions   = Array.isArray(pkg.exclusions) && pkg.exclusions.length
    ? pkg.exclusions
    : ['Visa fees & processing', 'City taxes (payable at hotel)', 'Personal expenses & shopping', 'Tips & gratuities']
  const itinerary    = Array.isArray(pkg.itinerary)    ? pkg.itinerary    : []
  const heroImage    = pkg.image || FALLBACK_IMAGE

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div ref={heroRef} className={styles.hero}>
        <motion.div className={styles.heroBg} style={{ y: bgY }}>
          <img src={heroImage} alt={pkg.title} className={styles.heroImg} />
        </motion.div>
        <div className={styles.heroOverlay} />

        <div className={styles.heroContent}>
          <div className={styles.heroInner}>
            <button onClick={() => navigate('/packages')} className={styles.backBtn}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
              </svg>
              Back to Curations
            </button>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.33,1,0.68,1] }}
              className={styles.heroBadges}
            >
              <span className={styles.catBadge}>{pkg.category}</span>
              <span className={styles.heroBadgePill}>⏱ {pkg.nights} Nights / {pkg.nights + 1} Days</span>
              {destinations.length > 0 && (
                <>
                  <span className={styles.heroDivider}>|</span>
                  <span className={styles.heroBadgePill}>📍 {destinations.join(' • ')}</span>
                </>
              )}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.15, ease: [0.22,1,0.36,1] }}
              className={styles.heroTitle}
            >
              {pkg.title}
            </motion.h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.contentGrid}>
          {/* Left column */}
          <div className={styles.left}>

            {/* Description */}
            {pkg.description && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className={styles.card}
              >
                <h3 className={styles.cardTitle}>About This Journey</h3>
                <p className={styles.cardDesc}>{pkg.description}</p>
              </motion.div>
            )}

            {/* Inclusions & Exclusions */}
            {(inclusions.length > 0 || exclusions.length > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.33,1,0.68,1] }}
                className={styles.card}
              >
                <h3 className={styles.cardTitleLg}>What's Included</h3>
                <div className={styles.inclGrid}>
                  {inclusions.length > 0 && (
                    <div className={`${styles.inclBox} ${styles.inclBoxGreen}`}>
                      <h4 className={`${styles.inclTitle} ${styles.inclTitleGreen}`}>✅ Inclusions</h4>
                      <ul className={styles.inclList}>
                        {inclusions.map((item, i) => (
                          <li key={i} className={styles.inclItem}>
                            <span className={`${styles.inclCheck} ${styles.inclCheckGreen}`}>✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {exclusions.length > 0 && (
                    <div className={`${styles.inclBox} ${styles.inclBoxRed}`}>
                      <h4 className={`${styles.inclTitle} ${styles.inclTitleRed}`}>❌ Exclusions</h4>
                      <ul className={styles.inclList}>
                        {exclusions.map((item, i) => (
                          <li key={i} className={styles.inclItem}>
                            <span className={`${styles.inclCheck} ${styles.inclCheckRed}`}>✕</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Itinerary */}
            {itinerary.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.33,1,0.68,1] }}
                className={styles.card}
              >
                <h3 className={styles.cardTitleLg}>Day-by-Day Itinerary</h3>
                <div style={{ position: 'relative' }}>
                  <div
                    className={styles.itineraryList}
                    style={!itinUnlocked ? { filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none' } : undefined}
                  >
                    {itinerary.map((day) => (
                      <details key={day.day} className={styles.dayAccordion} open={day.day === 1}>
                        <summary className={styles.daySummary}>
                          <span className={styles.dayNum}>{day.day}</span>
                          <span className={styles.dayTitle}>{day.title || `Day ${day.day}`}</span>
                          <svg className={styles.dayChevron} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </summary>
                        {Array.isArray(day.activities) && day.activities.length > 0 && (
                          <div className={styles.dayBody}>
                            {day.activities.map((act, ai) => (
                              <div key={ai} className={styles.activity}>
                                <span className={styles.actIcon}>{act.icon || '📍'}</span>
                                <div>
                                  {act.time && <span className={styles.actTime}>{act.time}</span>}
                                  <span className={styles.actDesc}>{act.description}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </details>
                    ))}
                  </div>

                  {!itinUnlocked && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={styles.itinLock}
                    >
                      <motion.div
                        initial={{ scale: 0.9, y: 10 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 20 }}
                        className={styles.itinLockCard}
                      >
                        <div className={styles.itinLockIcon}>🔒</div>
                        <h4 className={styles.itinLockTitle}>Full Itinerary Locked</h4>
                        <p className={styles.itinLockDesc}>
                          Plan your trip for free to unlock the complete day-by-day itinerary
                        </p>
                        <motion.button
                          onClick={() => window.dispatchEvent(new CustomEvent('open-travel-quiz'))}
                          whileHover={{ scale: 1.04, boxShadow: '0 0 28px rgba(229,57,53,0.45)' }}
                          whileTap={{ scale: 0.96 }}
                          className={styles.itinLockBtn}
                        >
                          🗺️ Plan My Trip — It's Free
                        </motion.button>
                      </motion.div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right column */}
          <div className={styles.right}>
            <div className={styles.sideStack}>
              <PricingWidget pkg={pkg} />

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className={styles.inquiryCard}
              >
                <span className={styles.inquiryEmoji}>✉️</span>
                <h4 className={styles.inquiryTitle}>Send an Inquiry</h4>
                <p className={styles.inquiryDesc}>
                  Get a personalised quote for this package within 24 hours.
                </p>
                <Link
                  to={`/contact?package=${encodeURIComponent(pkg.title)}`}
                  className={styles.inquiryBtn}
                >
                  Inquire About This Package
                </Link>
                <button
                  onClick={() => openWhatsApp(pkg.title)}
                  className={styles.inquiryWaBtn}
                >
                  Chat on WhatsApp
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
