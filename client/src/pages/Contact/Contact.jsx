import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { api } from '../../services/api'
import { openWhatsApp } from '../../utils/whatsapp'
import styles from './Contact.module.css'
import { usePageMeta } from '../../hooks/usePageMeta'

const BUDGETS       = ['Under ₹50,000', '₹50k–₹1L', '₹1L–₹2L', '₹2L–₹5L', '₹5L+', 'Flexible / TBD']
const TRIP_TYPES    = ['Honeymoon', 'Family Holiday', 'Solo Travel', 'Group Tour', 'Luxury Escape', 'Adventure', 'Business + Leisure', 'Pilgrimage / Religious', 'Anniversary Celebration', 'Corporate Retreat']
const ACCOMMODATION = ['3-Star', '4-Star', '5-Star', 'Boutique / Heritage', 'Budget / Hostel', 'Luxury Resort', 'Villa / Apartment', 'No Preference']
const HOW_HEARD     = ['Google Search', 'Instagram', 'Facebook', 'WhatsApp', 'Friend / Family', 'Travel Expo', 'LinkedIn', 'YouTube', 'OTA / Booking Site', 'Walk-in', 'Other']
const MONTHS        = ['January','February','March','April','May','June','July','August','September','October','November','December']

const EMPTY = {
  name: '', phone: '', email: '',
  destination: '', departureCity: '', travelDate: '', travelMonth: '', tripDuration: '',
  numAdults: '', numChildren: '', numInfants: '',
  budget: '', tripType: '', accommodation: '', occasion: '',
  howHeard: '', preferredContact: '',
  specialRequirements: '', message: '',
}

const features = [
  { icon: '✈', label: 'Personalised itinerary', desc: 'Custom plan crafted within 24 hours' },
  { icon: '💰', label: 'Best price guarantee',   desc: 'No hidden charges, full transparency' },
  { icon: '🎧', label: 'Dedicated concierge',    desc: '24/7 support from inquiry to return'  },
  { icon: '🗺', label: 'All destinations',        desc: 'India, international & group tours'  },
]

const STEPS = ['Contact Info', 'Trip Details', 'Preferences']

export default function Contact() {
  usePageMeta(
    'Contact Ease My Vacations | Travel Experts for Holiday Planning',
    'Get in touch with Ease My Vacations for personalized travel planning, holiday packages, group tours, honeymoon vacations, corporate travel, and exclusive travel deals.'
  )
  const location = useLocation()
  const [form,    setForm]    = useState(EMPTY)
  const [step,    setStep]    = useState(0)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const pkg = params.get('package')
    if (pkg) setForm(p => ({ ...p, message: `Interested in: ${pkg}` }))
  }, [location.search])

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleNext = (e) => {
    e.preventDefault()
    if (step === 0 && (!form.name.trim() || !form.phone.trim())) {
      setError('Name and phone number are required.')
      return
    }
    setError('')
    setStep(s => s + 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) { setError('Name and phone are required.'); return }
    setLoading(true)
    setError('')
    try {
      await api.submitLead({ ...form, type: 'inquiry' })
      setSuccess(true)
      setForm(EMPTY)
      setStep(0)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inpClass = styles.input
  const selClass = styles.input

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
              <p className={styles.contactDetail}>info@easemyvacationsglobal.com</p>
              <p className={styles.contactDetail}>Enkay Tower, Cyber City, Phase V, Udyog Vihar, Sector 19, Gurugram, Haryana – 122016</p>
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

                  {/* Step progress */}
                  <div className="flex gap-2 mb-6">
                    {STEPS.map((s, i) => (
                      <div key={s} className="flex-1">
                        <div className={`h-1 rounded-full transition-colors ${i <= step ? 'bg-brand' : 'bg-gray-200'}`} />
                        <p className={`text-[9px] font-black uppercase tracking-[0.15em] mt-1 ${i <= step ? 'text-brand' : 'text-gray-400'}`}>{s}</p>
                      </div>
                    ))}
                  </div>

                  {error && <div className={styles.errorBanner}>{error}</div>}

                  <AnimatePresence mode="wait">

                    {/* Step 0: Contact Info */}
                    {step === 0 && (
                      <motion.form key="step0" onSubmit={handleNext}
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className={styles.form}
                      >
                        <div className={styles.row2}>
                          <div className={styles.fieldGroup}>
                            <label className={styles.label}>Full Name *</label>
                            <input type="text" required value={form.name} onChange={e => f('name', e.target.value)} placeholder="Your full name" className={inpClass} />
                          </div>
                          <div className={styles.fieldGroup}>
                            <label className={styles.label}>Phone / WhatsApp *</label>
                            <input type="tel" required value={form.phone} onChange={e => f('phone', e.target.value)} placeholder="+91 70705 95907" className={inpClass} />
                          </div>
                        </div>
                        <div className={styles.fieldGroup}>
                          <label className={styles.label}>Email Address</label>
                          <input type="email" value={form.email} onChange={e => f('email', e.target.value)} placeholder="your@email.com" className={inpClass} />
                        </div>
                        <div className={styles.row2}>
                          <div className={styles.fieldGroup}>
                            <label className={styles.label}>Your City</label>
                            <input type="text" value={form.departureCity} onChange={e => f('departureCity', e.target.value)} placeholder="e.g. Mumbai" className={inpClass} />
                          </div>
                          <div className={styles.fieldGroup}>
                            <label className={styles.label}>Preferred Contact</label>
                            <select value={form.preferredContact} onChange={e => f('preferredContact', e.target.value)} className={selClass}>
                              <option value="">Select…</option>
                              <option>WhatsApp</option>
                              <option>Phone Call</option>
                              <option>Email</option>
                              <option>Any</option>
                            </select>
                          </div>
                        </div>
                        <div className={styles.fieldGroup}>
                          <label className={styles.label}>How did you hear about us?</label>
                          <select value={form.howHeard} onChange={e => f('howHeard', e.target.value)} className={selClass}>
                            <option value="">Select source…</option>
                            {HOW_HEARD.map(h => <option key={h} value={h}>{h}</option>)}
                          </select>
                        </div>
                        <button type="submit" className={styles.submitBtn}>Next: Trip Details →</button>
                        <p className={styles.privacyNote}>No spam, ever. Your details stay private.</p>
                      </motion.form>
                    )}

                    {/* Step 1: Trip Details */}
                    {step === 1 && (
                      <motion.form key="step1" onSubmit={handleNext}
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className={styles.form}
                      >
                        <div className={styles.row2}>
                          <div className={styles.fieldGroup}>
                            <label className={styles.label}>Destination(s)</label>
                            <input type="text" value={form.destination} onChange={e => f('destination', e.target.value)} placeholder="e.g. Kashmir, Bali, Europe" className={inpClass} />
                          </div>
                          <div className={styles.fieldGroup}>
                            <label className={styles.label}>Departure City</label>
                            <input type="text" value={form.departureCity} onChange={e => f('departureCity', e.target.value)} placeholder="e.g. Delhi" className={inpClass} />
                          </div>
                        </div>
                        <div className={styles.row2}>
                          <div className={styles.fieldGroup}>
                            <label className={styles.label}>Approx. Travel Date</label>
                            <input type="text" value={form.travelDate} onChange={e => f('travelDate', e.target.value)} placeholder="e.g. 15 Dec 2025" className={inpClass} />
                          </div>
                          <div className={styles.fieldGroup}>
                            <label className={styles.label}>Travel Month</label>
                            <select value={form.travelMonth} onChange={e => f('travelMonth', e.target.value)} className={selClass}>
                              <option value="">Select month…</option>
                              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className={styles.fieldGroup}>
                          <label className={styles.label}>Trip Duration</label>
                          <input type="text" value={form.tripDuration} onChange={e => f('tripDuration', e.target.value)} placeholder="e.g. 7 nights / 8 days" className={inpClass} />
                        </div>
                        <div>
                          <label className={styles.label}>Number of Travellers</label>
                          <div className={styles.row2}>
                            <div className={styles.fieldGroup}>
                              <label className={styles.labelSub}>Adults</label>
                              <input type="number" min="1" value={form.numAdults} onChange={e => f('numAdults', e.target.value)} placeholder="2" className={inpClass} />
                            </div>
                            <div className={styles.fieldGroup}>
                              <label className={styles.labelSub}>Children (2–12)</label>
                              <input type="number" min="0" value={form.numChildren} onChange={e => f('numChildren', e.target.value)} placeholder="0" className={inpClass} />
                            </div>
                            <div className={styles.fieldGroup}>
                              <label className={styles.labelSub}>Infants (&lt;2)</label>
                              <input type="number" min="0" value={form.numInfants} onChange={e => f('numInfants', e.target.value)} placeholder="0" className={inpClass} />
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button type="button" onClick={() => setStep(0)} className={styles.backBtn}>← Back</button>
                          <button type="submit" className={styles.submitBtn} style={{ flex: 2 }}>Next: Preferences →</button>
                        </div>
                      </motion.form>
                    )}

                    {/* Step 2: Preferences + Submit */}
                    {step === 2 && (
                      <motion.form key="step2" onSubmit={handleSubmit}
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className={styles.form}
                      >
                        <div className={styles.row2}>
                          <div className={styles.fieldGroup}>
                            <label className={styles.label}>Budget (per person)</label>
                            <select value={form.budget} onChange={e => f('budget', e.target.value)} className={selClass}>
                              <option value="">Select budget…</option>
                              {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                          </div>
                          <div className={styles.fieldGroup}>
                            <label className={styles.label}>Trip Type</label>
                            <select value={form.tripType} onChange={e => f('tripType', e.target.value)} className={selClass}>
                              <option value="">Select type…</option>
                              {TRIP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className={styles.row2}>
                          <div className={styles.fieldGroup}>
                            <label className={styles.label}>Accommodation Preference</label>
                            <select value={form.accommodation} onChange={e => f('accommodation', e.target.value)} className={selClass}>
                              <option value="">Select preference…</option>
                              {ACCOMMODATION.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                          </div>
                          <div className={styles.fieldGroup}>
                            <label className={styles.label}>Occasion / Purpose</label>
                            <input type="text" value={form.occasion} onChange={e => f('occasion', e.target.value)} placeholder="e.g. Honeymoon, Anniversary" className={inpClass} />
                          </div>
                        </div>
                        <div className={styles.fieldGroup}>
                          <label className={styles.label}>Special Requirements / Notes</label>
                          <textarea value={form.specialRequirements} onChange={e => f('specialRequirements', e.target.value)}
                            placeholder="Dietary needs, accessibility requirements, preferred activities, anniversary surprise, visa assistance, specific hotels…"
                            rows={4} className={styles.textarea} />
                        </div>
                        <div className="flex gap-3">
                          <button type="button" onClick={() => setStep(1)} className={styles.backBtn}>← Back</button>
                          <button type="submit" disabled={loading} className={styles.submitBtn} style={{ flex: 2 }}>
                            {loading ? (
                              <span className={styles.submitSpinner}>
                                <span className={styles.spinnerCircle} />Sending…
                              </span>
                            ) : 'Send My Inquiry →'}
                          </button>
                        </div>
                        <p className={styles.privacyNote}>No spam, ever. Your details stay private.</p>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
