import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import styles from './CustomerLogin.module.css'

const BENEFITS = [
  { icon: '🗺️', title: 'Full Day-by-Day Itineraries', desc: 'Unlock detailed itineraries for every package — free.' },
  { icon: '💼', title: 'Personalised Quotes', desc: 'Get custom travel quotes crafted to your style and budget.' },
  { icon: '⚡', title: 'Instant Trip Planning', desc: 'Save your preferences and resume your trip plan anytime.' },
]

export default function CustomerLogin() {
  const { loginCustomer } = useCustomerAuth()
  const navigate = useNavigate()
  const [params]  = useSearchParams()
  const next      = params.get('next') || '/'

  const [form,    setForm]    = useState({ name: '', email: '', phone: '', city: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) {
      setError('Please enter your name and email to continue.')
      return
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setError('Please enter a valid email address.')
      return
    }
    setLoading(true)
    setError('')
    try {
      loginCustomer(form)
      navigate(next, { replace: true })
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>

      {/* Left — decorative panel (desktop) */}
      <div className={styles.left}>
        <div className={styles.leftBg} />
        <div className={styles.leftOverlay} />
        <div className={styles.leftContent}>
          <div className={styles.leftBody}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
            >
              <p className={styles.leftEyebrow}>
                <span className={styles.eyebrowLine} /> Free Account
              </p>
              <h2 className={styles.leftHeading}>
                Unlock your perfect<br />journey today.
              </h2>
              <div className={styles.benefits}>
                {BENEFITS.map((b, i) => (
                  <motion.div
                    key={b.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                    className={styles.benefit}
                  >
                    <div className={styles.benefitIcon}>{b.icon}</div>
                    <div>
                      <p className={styles.benefitTitle}>{b.title}</p>
                      <p className={styles.benefitDesc}>{b.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <p className={styles.leftFooter}>© {new Date().getFullYear()} Ease My Vacations Global Pvt. Ltd.</p>
        </div>
      </div>

      {/* Right — form */}
      <div className={styles.right}>
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
        >
          {/* Mobile logo */}
          <div className={styles.mobileLogoStrip}>
            <div className={styles.mobileLogoMark}>E</div>
            <span className={styles.mobileWordmark}>EMV Global</span>
          </div>

          <button onClick={() => navigate(-1)} className={styles.backBtn}>
            <svg className={styles.backBtnIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Go back
          </button>

          <p className={styles.eyebrow}>
            <span className={styles.eyebrowDot} /> It's completely free
          </p>
          <h1 className={styles.heading}>Save your journey</h1>
          <p className={styles.subheading}>
            Enter your details to unlock full itineraries, personalised quotes, and your trip history.
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            {error && <div className={styles.errorBanner}>{error}</div>}

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Full Name *</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Your full name"
                value={form.name}
                onChange={e => f('name', e.target.value)}
                autoComplete="name"
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Email Address *</label>
              <input
                type="email"
                className={styles.input}
                placeholder="your@email.com"
                value={form.email}
                onChange={e => f('email', e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Phone <span className={styles.optionalTag}>(optional)</span>
              </label>
              <input
                type="tel"
                className={styles.input}
                placeholder="+91 70705 95907"
                value={form.phone}
                onChange={e => f('phone', e.target.value)}
                autoComplete="tel"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                City <span className={styles.optionalTag}>(optional)</span>
              </label>
              <input
                type="text"
                className={styles.input}
                placeholder="e.g. Mumbai, Delhi, Bangalore"
                value={form.city}
                onChange={e => f('city', e.target.value)}
                autoComplete="address-level2"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.02 } : undefined}
              whileTap={!loading ? { scale: 0.98 } : undefined}
              className={styles.submitBtn}
            >
              {loading ? 'Setting up your account…' : 'Continue — Unlock My Itineraries →'}
            </motion.button>

            <p className={styles.note}>
              No password, no spam. We only use your info to personalise your travel experience. 🔒
            </p>
          </form>
        </motion.div>
      </div>

    </div>
  )
}
