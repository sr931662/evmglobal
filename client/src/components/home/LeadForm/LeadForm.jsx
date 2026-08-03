import { useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../../services/api'
import styles from './LeadForm.module.css'

const EMPTY = { name: '', phone: '', destination: '', travelMonth: '' }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function LeadForm() {
  const [form, setForm]       = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  const f = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) return

    setLoading(true)
    setError('')

    try {
      const message = [
        form.destination  && `Destination: ${form.destination}`,
        form.travelMonth  && `Travel Month: ${form.travelMonth}`,
        'Source: Home page enquiry form',
      ].filter(Boolean).join('\n')

      await api.submitLead({
        name:        form.name.trim(),
        phone:       form.phone.replace(/[^\d+]/g, ''),
        destination: form.destination.trim(),
        travelMonth: form.travelMonth,
        howHeard:    'Website',
        message,
        type: 'lead',
      })

      setSuccess(true)
      setForm(EMPTY)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
          className={styles.card}
        >
          <div className={styles.copy}>
            <h2 className={styles.heading}>Tell us where you want to go</h2>
            <p className={styles.sub}>
              Two details are all we need. A travel expert will call you back with a plan and pricing.
            </p>
          </div>

          {success ? (
            <div className={styles.successBox}>
              <div className={styles.successIcon}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className={styles.successTitle}>Thanks — we&rsquo;ve got it.</p>
              <p className={styles.successSub}>Our team will reach out within 24 hours.</p>
              <button type="button" onClick={() => setSuccess(false)} className={styles.resetBtn}>
                Send another enquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              {error && <p className={styles.error}>{error}</p>}

              <div className={styles.field}>
                <label htmlFor="lead-name" className={styles.label}>Name</label>
                <input
                  id="lead-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={e => f('name', e.target.value)}
                  placeholder="Your name"
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="lead-phone" className={styles.label}>Mobile number</label>
                <input
                  id="lead-phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  value={form.phone}
                  onChange={e => f('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="lead-destination" className={styles.label}>
                  Destination <span className={styles.optional}>(optional)</span>
                </label>
                <input
                  id="lead-destination"
                  type="text"
                  value={form.destination}
                  onChange={e => f('destination', e.target.value)}
                  placeholder="e.g. Thailand"
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="lead-month" className={styles.label}>
                  Travel month <span className={styles.optional}>(optional)</span>
                </label>
                <select
                  id="lead-month"
                  value={form.travelMonth}
                  onChange={e => f('travelMonth', e.target.value)}
                  className={styles.input}
                >
                  <option value="">Not sure yet</option>
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <button type="submit" disabled={loading} className={styles.submitBtn}>
                {loading ? <><span className={styles.spinner} />Sending…</> : 'Get a call back'}
              </button>

              <p className={styles.privacy}>No spam. We only use your number to plan your trip.</p>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}
