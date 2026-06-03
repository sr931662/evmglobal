import { useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../../services/api'
import styles from './InquirySection.module.css'

const EMPTY = {
  name: '', phone: '', email: '', destination: '', travelMonth: '',
  travelers: '2', budget: '', tripType: '', message: '',
}

const BUDGETS = ['Under ₹50,000', '₹50k–₹1L', '₹1L–₹2L', '₹2L–₹5L', '₹5L+']
const TRIP_TYPES = ['Honeymoon', 'Family Holiday', 'Solo Travel', 'Group Tour', 'Luxury Escape', 'Adventure', 'Business + Leisure']

const PERKS = [
  { icon: '✈', text: 'Personalised itinerary within 24 hours' },
  { icon: '💰', text: 'Best price guarantee — no hidden charges' },
  { icon: '🎧', text: 'Dedicated concierge support throughout' },
]

export default function InquirySection() {
  const [form,    setForm]    = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState('')

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) return
    setLoading(true); setError('')
    try {
      const message = [
        form.destination && `Destination: ${form.destination}`,
        form.travelMonth && `Travel Month: ${form.travelMonth}`,
        form.travelers   && `Travelers: ${form.travelers}`,
        form.budget      && `Budget: ${form.budget}`,
        form.tripType    && `Trip Type: ${form.tripType}`,
        form.message     && `Details: ${form.message}`,
      ].filter(Boolean).join('\n')
      await api.submitLead({ ...form, message, type: 'lead' })
      setSuccess(true); setForm(EMPTY)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
          >
            <span className={styles.eyebrow}>Free Consultation</span>
            <h2 className={styles.heading}>Plan your<br />dream trip.</h2>
            <p className={styles.desc}>
              Share your travel dream with us and our expert concierge team will craft a completely personalised itinerary — no booking fees, no obligation.
            </p>
            <div className={styles.perks}>
              {PERKS.map(item => (
                <div key={item.text} className={styles.perk}>
                  <span className={styles.perkIcon}>{item.icon}</span>
                  <p className={styles.perkText}>{item.text}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1], delay: 0.1 }}
          >
            <div className={styles.formCard}>
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={styles.successWrap}
                >
                  <div className={styles.successIcon}>✅</div>
                  <h3 className={styles.successTitle}>Inquiry Received!</h3>
                  <p className={styles.successMsg}>
                    Thank you for reaching out. Our concierge team will contact you within 24 hours to plan your perfect journey.
                  </p>
                  <button onClick={() => setSuccess(false)} className={styles.retryBtn}>
                    Submit another inquiry
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formHead}>
                    <h3 className={styles.formTitle}>Get in Touch</h3>
                    <p className={styles.formSub}>We'll respond within 24 hours.</p>
                  </div>

                  {error && <div className={styles.errorBox}>{error}</div>}

                  <div className={styles.row}>
                    <div>
                      <label className={styles.label}>Full Name *</label>
                      <input type="text" required value={form.name} onChange={e => f('name', e.target.value)} placeholder="Your full name" className={styles.input} />
                    </div>
                    <div>
                      <label className={styles.label}>Phone *</label>
                      <input type="tel" required value={form.phone} onChange={e => f('phone', e.target.value)} placeholder="+91 70705 95907" className={styles.input} />
                    </div>
                  </div>

                  <div>
                    <label className={styles.label}>Email Address</label>
                    <input type="email" value={form.email} onChange={e => f('email', e.target.value)} placeholder="your@email.com" className={styles.input} />
                  </div>

                  <div>
                    <label className={styles.label}>Where do you want to go? *</label>
                    <input type="text" required value={form.destination} onChange={e => f('destination', e.target.value)} placeholder="e.g. Maldives, Bali, Switzerland…" className={styles.input} />
                  </div>

                  <div className={styles.row}>
                    <div>
                      <label className={styles.label}>Travel Month</label>
                      <input type="text" value={form.travelMonth} onChange={e => f('travelMonth', e.target.value)} placeholder="e.g. Dec 2025" className={styles.input} />
                    </div>
                    <div>
                      <label className={styles.label}>No. of Travellers</label>
                      <input type="number" min="1" value={form.travelers} onChange={e => f('travelers', e.target.value)} placeholder="2" className={styles.input} />
                    </div>
                  </div>

                  <div className={styles.row}>
                    <div>
                      <label className={styles.label}>Budget (per person)</label>
                      <select value={form.budget} onChange={e => f('budget', e.target.value)} className={styles.input}>
                        <option value="">Select budget…</option>
                        {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={styles.label}>Trip Type</label>
                      <select value={form.tripType} onChange={e => f('tripType', e.target.value)} className={styles.input}>
                        <option value="">Select type…</option>
                        {TRIP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={styles.label}>Anything else we should know?</label>
                    <textarea value={form.message} onChange={e => f('message', e.target.value)} placeholder="Special requests, dietary needs, anniversary, preferred hotel, etc." rows={3} className={styles.textarea} />
                  </div>

                  <button type="submit" disabled={loading} className={styles.submitBtn}>
                    {loading ? (
                      <><span className={styles.spinner} />Sending…</>
                    ) : 'Send My Inquiry'}
                  </button>

                  <p className={styles.privacy}>No spam, ever. Your details stay private.</p>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
