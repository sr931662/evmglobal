import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { api } from '../../services/api'
import { openWhatsApp } from '../../utils/whatsapp'
import styles from './Contact.module.css'

const EMPTY = { name: '', phone: '', email: '', destination: '', travelDate: '', travellers: '', message: '' }

const features = [
  { icon: '✈', label: 'Personalised itinerary', desc: 'Custom plan crafted within 24 hours' },
  { icon: '💰', label: 'Best price guarantee', desc: 'No hidden charges, full transparency' },
  { icon: '🎧', label: 'Dedicated concierge', desc: '24/7 support from inquiry to return' },
  { icon: '🗺', label: 'All destinations', desc: 'India, international & group tours' },
]

export default function Contact() {
  const location = useLocation()
  const [form,    setForm]    = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const pkg = params.get('package')
    if (pkg) setForm(p => ({ ...p, message: `Interested in: ${pkg}` }))
  }, [location.search])

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) return
    setLoading(true)
    setError('')
    try {
      await api.submitLead({ ...form, type: 'inquiry' })
      setSuccess(true)
      setForm(EMPTY)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>

      {/* Hero strip */}
      <section className={styles.heroStrip}>
        <div className={styles.inner}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
          >
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowLine} /> Free Consultation
            </span>
            <h1 className={styles.heroHeading}>
              Plan your dream trip.<br />We'll handle the rest.
            </h1>
            <p className={styles.heroDesc}>
              Share your travel vision and our expert concierge team will craft a completely personalised itinerary — no booking fees, no obligation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <div className={styles.mainSection}>
        <div className={styles.mainGrid}>

          {/* Info column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
            className={styles.infoCol}
          >
            <h2 className={styles.infoHeading}>Get in touch</h2>

            <div className={styles.features}>
              {features.map(item => (
                <div key={item.label} className={styles.featureItem}>
                  <span className={styles.featureIcon}>{item.icon}</span>
                  <div>
                    <p className={styles.featureTitle}>{item.label}</p>
                    <p className={styles.featureDesc}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.contactBox}>
              <p className={styles.contactBoxLabel}>Direct Contact</p>
              <p className={styles.contactDetail}>concierge@emvglobal.in</p>
              <p className={styles.contactDetail}>Gurugram, Haryana</p>
              <button onClick={() => openWhatsApp('I have a travel inquiry')} className={styles.waBtn}>
                <svg viewBox="0 0 24 24" fill="currentColor" className={styles.waIcon}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.112.555 4.094 1.523 5.813L0 24l6.336-1.499A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.946 0-3.77-.51-5.338-1.4l-.382-.225-3.961.937.997-3.868-.249-.401A9.942 9.942 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
                Chat on WhatsApp
              </button>
            </div>
          </motion.div>

          {/* Form column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1], delay: 0.1 }}
            className={styles.formCol}
          >
            <div className={styles.formCard}>
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={styles.successState}
                >
                  <div className={styles.successIcon}>✅</div>
                  <h3 className={styles.successTitle}>Inquiry Received!</h3>
                  <p className={styles.successDesc}>
                    Thank you! Our concierge team will contact you within 24 hours to start planning your perfect journey.
                  </p>
                  <button onClick={() => setSuccess(false)} className={styles.successLink}>
                    Submit another inquiry
                  </button>
                </motion.div>
              ) : (
                <>
                  <h3 className={styles.formTitle}>Send an Inquiry</h3>
                  <p className={styles.formSubtitle}>We'll respond within 24 hours.</p>
                  <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <div className={styles.errorBanner}>{error}</div>}

                    <div className={styles.row2}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>Full Name *</label>
                        <input type="text" required value={form.name} onChange={e => f('name', e.target.value)}
                          placeholder="Your full name" className={styles.input} />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>Phone *</label>
                        <input type="tel" required value={form.phone} onChange={e => f('phone', e.target.value)}
                          placeholder="+91 98765 43210" className={styles.input} />
                      </div>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>Email Address</label>
                      <input type="email" value={form.email} onChange={e => f('email', e.target.value)}
                        placeholder="your@email.com" className={styles.input} />
                    </div>

                    <div className={styles.row2}>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>Destination</label>
                        <input type="text" value={form.destination} onChange={e => f('destination', e.target.value)}
                          placeholder="e.g. Kashmir, Bali, Europe" className={styles.input} />
                      </div>
                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>Approximate Travel Date</label>
                        <input type="text" value={form.travelDate} onChange={e => f('travelDate', e.target.value)}
                          placeholder="e.g. July 2025" className={styles.input} />
                      </div>
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>Number of Travellers</label>
                      <input type="text" value={form.travellers} onChange={e => f('travellers', e.target.value)}
                        placeholder="e.g. 2 adults, 1 child" className={styles.input} />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>Special Requests / Notes</label>
                      <textarea value={form.message} onChange={e => f('message', e.target.value)}
                        placeholder="Any specific hotels, activities, dietary needs, budget range…"
                        rows={4} className={styles.textarea} />
                    </div>

                    <button type="submit" disabled={loading} className={styles.submitBtn}>
                      {loading ? (
                        <span className={styles.submitSpinner}>
                          <span className={styles.spinnerCircle} />
                          Sending…
                        </span>
                      ) : 'Send My Inquiry →'}
                    </button>

                    <p className={styles.privacyNote}>No spam, ever. Your details stay private.</p>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
