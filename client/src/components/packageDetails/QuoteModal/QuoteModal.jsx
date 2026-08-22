import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../../../services/api'
import { openWhatsApp } from '../../../utils/whatsapp'
import { trackFunnel } from '../../../utils/analytics'
import { getLenis } from '../../../hooks/useLenis'
import styles from './QuoteModal.module.css'

const WA_PATH = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.112.555 4.094 1.523 5.813L0 24l6.336-1.499A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.946 0-3.77-.51-5.338-1.4l-.382-.225-3.961.937.997-3.868-.249-.401A9.942 9.942 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z'

const HOTEL_TIERS = ['3★', '4★', '5★']

const BUDGETS = [
  'Under ₹50,000 per person',
  '₹50,000 – ₹1,00,000 per person',
  '₹1,00,000 – ₹2,00,000 per person',
  '₹2,00,000+ per person',
]

const CHILD_AGES = Array.from({ length: 19 }, (_, i) => String(i)) // 0–18 yrs

const EMPTY = {
  travelDate: '',
  adults: '2',
  children: '0',
  childrenAgeFrom: '',
  childrenAgeTo: '',
  hotelTier: '4★',
  budget: '',
  name: '',
  phone: '',
  email: '',
}

export default function QuoteModal({ open, onClose, pkg, where }) {
  const [form, setForm]       = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  const destinations = Array.isArray(pkg?.destinations) ? pkg.destinations.filter(Boolean) : []
  // Only name a place when we're confident it describes the whole trip.
  const place = where || (destinations.length === 1 ? destinations[0] : '')

  const f = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      getLenis()?.stop()
    } else {
      document.body.style.overflow = ''
      getLenis()?.start()
    }
    return () => {
      document.body.style.overflow = ''
      getLenis()?.start()
    }
  }, [open])

  // A fresh open should start from a clean slate, not the last submission.
  const [wasOpen, setWasOpen] = useState(open)
  if (wasOpen !== open) {
    setWasOpen(open)
    if (open) { setSuccess(false); setError('') }
  }

  const childrenAgesLabel = () => {
    const { childrenAgeFrom: from, childrenAgeTo: to } = form
    if (from && to) return ` (ages ${from}–${to})`
    if (from || to) return ` (age ${from || to})`
    return ''
  }

  const leadSummary = () => [
    `Package: ${pkg?.title || '—'}`,
    form.travelDate && `Travel date: ${form.travelDate}`,
    `Travellers: ${form.adults} adult(s)${Number(form.children) > 0 ? `, ${form.children} child(ren)${childrenAgesLabel()}` : ''}`,
    `Hotel preference: ${form.hotelTier}`,
    form.budget && `Budget: ${form.budget}`,
  ].filter(Boolean).join('\n')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) return

    setLoading(true)
    setError('')
    try {
      await api.submitLead({
        name:        form.name.trim(),
        phone:       form.phone.replace(/[^\d+]/g, ''),
        ...(form.email.trim() && { email: form.email.trim() }),
        destination: destinations.join(', '),
        travelDate:  form.travelDate,
        travellers:  `${form.adults} adults, ${form.children} children${childrenAgesLabel()}`,
        howHeard:    'Website',
        message:     `${leadSummary()}\nSource: Package page quote form.`,
        type: 'lead',
      })
      trackFunnel('lead', { package: pkg?.title, destination: destinations[0] })
      setSuccess(true)
      setForm(EMPTY)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className={`${styles.panel} modal-scroll`}
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Request a personalised quote"
          >
            <button onClick={onClose} className={styles.closeBtn} aria-label="Close">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {success ? (
              <div className={styles.success}>
                <div className={styles.successIcon}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className={styles.successTitle}>Thanks — we&rsquo;ve got it.</p>
                <p className={styles.successText}>
                  A travel expert will send your personalised quote within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => openWhatsApp(pkg?.title || '')}
                  className={styles.waBtn}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d={WA_PATH} /></svg>
                  Or message us on WhatsApp now
                </button>
              </div>
            ) : (
              <>
                <span className={styles.eyebrow}>Personalised Quote</span>
                <h2 className={styles.heading}>Let&rsquo;s Plan Your {place ? `${place} ` : ''}Trip</h2>
                <p className={styles.sub}>
                  Six quick details and a travel expert will price this trip around your dates — no
                  payment, no obligation.
                </p>

                <form onSubmit={handleSubmit} className={styles.form}>
                  {error && <p className={styles.error}>{error}</p>}

                  <div className={`${styles.field} ${styles.full}`}>
                    <label htmlFor="q-date" className={styles.label}>Travel date</label>
                    <input
                      id="q-date"
                      type="date"
                      value={form.travelDate}
                      onChange={e => f('travelDate', e.target.value)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="q-adults" className={styles.label}>Adults</label>
                    <select id="q-adults" value={form.adults} onChange={e => f('adults', e.target.value)} className={styles.input}>
                      {['1','2','3','4','5','6','7','8+'].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="q-children" className={styles.label}>Children (0–18 yrs)</label>
                    <select id="q-children" value={form.children} onChange={e => f('children', e.target.value)} className={styles.input}>
                      {['0','1','2','3','4+'].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>

                  {Number(form.children) > 0 && (
                    <div className={`${styles.field} ${styles.full}`}>
                      <span className={styles.label}>Children&rsquo;s age group</span>
                      <div className={styles.ageRangeRow}>
                        <select
                          aria-label="Age from"
                          value={form.childrenAgeFrom}
                          onChange={e => f('childrenAgeFrom', e.target.value)}
                          className={styles.input}
                        >
                          <option value="">From</option>
                          {CHILD_AGES.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                        <select
                          aria-label="Age to"
                          value={form.childrenAgeTo}
                          onChange={e => f('childrenAgeTo', e.target.value)}
                          className={styles.input}
                        >
                          <option value="">To</option>
                          {CHILD_AGES.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className={`${styles.field} ${styles.full}`}>
                    <span className={styles.label}>Hotel preference</span>
                    <div className={styles.starRow}>
                      {HOTEL_TIERS.map(tier => (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => f('hotelTier', tier)}
                          className={`${styles.starBtn} ${form.hotelTier === tier ? styles.starBtnActive : ''}`}
                        >
                          {tier}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={`${styles.field} ${styles.full}`}>
                    <label htmlFor="q-budget" className={styles.label}>
                      Estimated budget <span className={styles.optional}>(optional)</span>
                    </label>
                    <select id="q-budget" value={form.budget} onChange={e => f('budget', e.target.value)} className={styles.input}>
                      <option value="">Not sure yet</option>
                      {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>

                  <div className={`${styles.field} ${styles.full}`}>
                    <label htmlFor="q-name" className={styles.label}>Name</label>
                    <input
                      id="q-name"
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
                    <label htmlFor="q-phone" className={styles.label}>WhatsApp number</label>
                    <input
                      id="q-phone"
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
                    <label htmlFor="q-email" className={styles.label}>
                      Email <span className={styles.optional}>(optional)</span>
                    </label>
                    <input
                      id="q-email"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={e => f('email', e.target.value)}
                      placeholder="you@email.com"
                      className={styles.input}
                    />
                  </div>

                  <button type="submit" disabled={loading} className={styles.submitBtn}>
                    {loading ? <><span className={styles.spinner} />Sending…</> : 'Get My Quote →'}
                  </button>

                  <button
                    type="button"
                    onClick={() => openWhatsApp(pkg?.title || '')}
                    className={styles.waBtn}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d={WA_PATH} /></svg>
                    WhatsApp a Travel Expert
                  </button>

                  <p className={styles.privacy}>No spam. We only use your number to plan your trip.</p>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
