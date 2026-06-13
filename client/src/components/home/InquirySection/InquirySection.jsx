import { useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../../services/api'
import styles from './InquirySection.module.css'

const EMPTY = {
  name: '',
  phone: '',
  email: '',
  destination: '',
  travelMonth: '',
  numAdults: '2',
  numChildren: '0',
  numInfants: '0',
  budget: '',
  tripType: '',
  accommodation: '',
  occasion: '',
  departureCity: '',
  tripDuration: '',
  howHeard: '',
  preferredContact: '',
  specialRequirements: '',
}

const BUDGETS = ['Under Rs50,000', 'Rs50k-Rs1L', 'Rs1L-Rs2L', 'Rs2L-Rs5L', 'Rs5L+', 'Flexible / TBD']
const TRIP_TYPES = ['Honeymoon', 'Family Holiday', 'Solo Travel', 'Group Tour', 'Luxury Escape', 'Adventure', 'Business + Leisure', 'Pilgrimage', 'Anniversary', 'Corporate']
const ACCOMMODATION = ['3-Star', '4-Star', '5-Star', 'Boutique / Heritage', 'Budget', 'Luxury Resort', 'No Preference']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const PERKS = [
  { icon: 'AIR', text: 'Personalised itinerary within 24 hours' },
  { icon: 'BEST', text: 'Best price guidance with no hidden charges' },
  { icon: 'CARE', text: 'Dedicated concierge support throughout' },
]

export default function InquirySection({
  eyebrow = 'Free Consultation',
  heading = <>Plan your<br />dream trip.</>,
  description = 'Share your travel dream with us and our expert concierge team will craft a completely personalised itinerary with no booking fees and no obligation.',
  formTitle = 'Get in Touch',
  formSub = "We'll respond within 24 hours.",
  successTitle = 'Inquiry Received!',
  successMessage = 'Thank you for reaching out. Our concierge team will contact you within 24 hours to plan your perfect journey.',
  submitLabel = 'Send My Inquiry',
  defaultSource = '',
  showSourceField = true,
}) {
  const [form, setForm] = useState({ ...EMPTY, howHeard: defaultSource })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const highlights = [
    { value: '24h', label: 'First itinerary draft' },
    { value: '50+', label: 'Handpicked destinations' },
    { value: '4.9/5', label: 'Traveller satisfaction' },
  ]

  const f = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) return

    setLoading(true)
    setError('')

    try {
      const travellers = [
        form.numAdults && `${form.numAdults} adult(s)`,
        form.numChildren && form.numChildren !== '0' && `${form.numChildren} child(ren)`,
        form.numInfants && form.numInfants !== '0' && `${form.numInfants} infant(s)`,
      ].filter(Boolean).join(', ')

      const source = form.howHeard || defaultSource
      const message = [
        form.destination && `Destination: ${form.destination}`,
        form.travelMonth && `Travel Month: ${form.travelMonth}`,
        form.tripDuration && `Duration: ${form.tripDuration}`,
        form.departureCity && `Departure: ${form.departureCity}`,
        travellers && `Travellers: ${travellers}`,
        form.budget && `Budget: ${form.budget}`,
        form.tripType && `Trip Type: ${form.tripType}`,
        form.accommodation && `Accommodation: ${form.accommodation}`,
        form.occasion && `Occasion: ${form.occasion}`,
        form.specialRequirements && `Notes: ${form.specialRequirements}`,
        source && `Source: ${source}`,
      ].filter(Boolean).join('\n')

      await api.submitLead({
        name: form.name,
        phone: form.phone,
        email: form.email,
        destination: form.destination,
        travelMonth: form.travelMonth,
        tripDuration: form.tripDuration,
        departureCity: form.departureCity,
        numAdults: parseInt(form.numAdults, 10) || null,
        numChildren: parseInt(form.numChildren, 10) || null,
        numInfants: parseInt(form.numInfants, 10) || null,
        budget: form.budget,
        tripType: form.tripType,
        accommodation: form.accommodation,
        occasion: form.occasion,
        specialRequirements: form.specialRequirements,
        howHeard: source,
        preferredContact: form.preferredContact,
        travellers,
        message,
        type: 'lead',
      })

      setSuccess(true)
      setForm({ ...EMPTY, howHeard: defaultSource })
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
            className={styles.copy}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
          >
            <span className={styles.eyebrow}>{eyebrow}</span>
            <h2 className={styles.heading}>{heading}</h2>
            <p className={styles.desc}>{description}</p>

            <div className={styles.perks}>
              {PERKS.map(item => (
                <div key={item.text} className={styles.perk}>
                  <span className={styles.perkIcon}>{item.icon}</span>
                  <p className={styles.perkText}>{item.text}</p>
                </div>
              ))}
            </div>

            <div className={styles.visualWrap} aria-hidden="true">
              <div className={styles.visualCard}>
                <div className={styles.visualGlow} />
                <div className={styles.postcard}>
                  <div className={styles.postcardTop}>
                    <p className={styles.postcardEyebrow}>Tailored Journey</p>
                    <p className={styles.postcardTitle}>Bali to Swiss Alps</p>
                  </div>
                  <div className={styles.routePills}>
                    <span className={styles.routePill}>Romance</span>
                    <span className={styles.routePill}>Private Tours</span>
                    <span className={styles.routePill}>Visa Guided</span>
                  </div>
                  <div className={styles.photoStack}>
                    <div className={`${styles.photo} ${styles.photoPrimary}`} />
                    <div className={`${styles.photo} ${styles.photoSecondary}`} />
                  </div>
                  <div className={styles.statGrid}>
                    {highlights.map(item => (
                      <div key={item.label} className={styles.statCard}>
                        <strong className={styles.statValue}>{item.value}</strong>
                        <span className={styles.statLabel}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={`${styles.floatingNote} ${styles.noteTop}`}>
                  <span className={styles.noteDot} />
                  Visa, stays, transfers and concierge bundled neatly.
                </div>
                <div className={`${styles.floatingNote} ${styles.noteBottom}`}>
                  <span className={styles.noteBadge}>EMV</span>
                  Built around your pace, budget and travel style.
                </div>
              </div>
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
                  <div className={styles.successIcon}>OK</div>
                  <h3 className={styles.successTitle}>{successTitle}</h3>
                  <p className={styles.successMsg}>{successMessage}</p>
                  <button onClick={() => setSuccess(false)} className={styles.retryBtn}>
                    Submit another inquiry
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formHead}>
                    <h3 className={styles.formTitle}>{formTitle}</h3>
                    <p className={styles.formSub}>{formSub}</p>
                  </div>

                  {error && <div className={styles.errorBox}>{error}</div>}

                  <div className={styles.row}>
                    <div>
                      <label className={styles.label}>Full Name *</label>
                      <input type="text" required value={form.name} onChange={e => f('name', e.target.value)} placeholder="Your full name" className={styles.input} />
                    </div>
                    <div>
                      <label className={styles.label}>Phone / WhatsApp *</label>
                      <input type="tel" required value={form.phone} onChange={e => f('phone', e.target.value)} placeholder="+91 70705 95907" className={styles.input} />
                    </div>
                  </div>

                  <div>
                    <label className={styles.label}>Email Address</label>
                    <input type="email" value={form.email} onChange={e => f('email', e.target.value)} placeholder="your@email.com" className={styles.input} />
                  </div>

                  <div>
                    <label className={styles.label}>Where do you want to go? *</label>
                    <input type="text" required value={form.destination} onChange={e => f('destination', e.target.value)} placeholder="e.g. Maldives, Bali, Switzerland" className={styles.input} />
                  </div>

                  <div className={styles.row}>
                    <div>
                      <label className={styles.label}>From (Departure City)</label>
                      <input type="text" value={form.departureCity} onChange={e => f('departureCity', e.target.value)} placeholder="e.g. Delhi, Mumbai" className={styles.input} />
                    </div>
                    <div>
                      <label className={styles.label}>Travel Month</label>
                      <select value={form.travelMonth} onChange={e => f('travelMonth', e.target.value)} className={styles.input}>
                        <option value="">Select month...</option>
                        {MONTHS.map(month => <option key={month} value={month}>{month}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={styles.label}>Trip Duration</label>
                    <input type="text" value={form.tripDuration} onChange={e => f('tripDuration', e.target.value)} placeholder="e.g. 7 nights / 8 days" className={styles.input} />
                  </div>

                  <div>
                    <label className={styles.label}>Travellers</label>
                    <div className={styles.row3}>
                      <div>
                        <label className={styles.labelMini}>Adults</label>
                        <input type="number" min="1" value={form.numAdults} onChange={e => f('numAdults', e.target.value)} placeholder="2" className={styles.input} />
                      </div>
                      <div>
                        <label className={styles.labelMini}>Children (2-12)</label>
                        <input type="number" min="0" value={form.numChildren} onChange={e => f('numChildren', e.target.value)} placeholder="0" className={styles.input} />
                      </div>
                      <div>
                        <label className={styles.labelMini}>Infants (&lt;2)</label>
                        <input type="number" min="0" value={form.numInfants} onChange={e => f('numInfants', e.target.value)} placeholder="0" className={styles.input} />
                      </div>
                    </div>
                  </div>

                  <div className={styles.row}>
                    <div>
                      <label className={styles.label}>Budget (per person)</label>
                      <select value={form.budget} onChange={e => f('budget', e.target.value)} className={styles.input}>
                        <option value="">Select budget...</option>
                        {BUDGETS.map(budget => <option key={budget} value={budget}>{budget}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={styles.label}>Trip Type</label>
                      <select value={form.tripType} onChange={e => f('tripType', e.target.value)} className={styles.input}>
                        <option value="">Select type...</option>
                        {TRIP_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className={styles.row}>
                    <div>
                      <label className={styles.label}>Accommodation</label>
                      <select value={form.accommodation} onChange={e => f('accommodation', e.target.value)} className={styles.input}>
                        <option value="">Select preference...</option>
                        {ACCOMMODATION.map(option => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={styles.label}>Occasion</label>
                      <input type="text" value={form.occasion} onChange={e => f('occasion', e.target.value)} placeholder="e.g. Honeymoon, Anniversary" className={styles.input} />
                    </div>
                  </div>

                  {showSourceField && (
                    <div>
                      <label className={styles.label}>How did you hear about us?</label>
                      <select value={form.howHeard} onChange={e => f('howHeard', e.target.value)} className={styles.input}>
                        <option value="">Select source...</option>
                        <option>Google Search</option>
                        <option>Instagram</option>
                        <option>Facebook</option>
                        <option>WhatsApp</option>
                        <option>Friend / Family</option>
                        <option>Travel Expo</option>
                        <option>YouTube</option>
                        <option>OTA / Booking Site</option>
                        <option>Other</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className={styles.label}>Anything else we should know?</label>
                    <textarea
                      value={form.specialRequirements}
                      onChange={e => f('specialRequirements', e.target.value)}
                      placeholder="Dietary needs, accessibility, visa help, specific hotels, anniversary surprise, group events..."
                      rows={3}
                      className={styles.textarea}
                    />
                  </div>

                  <button type="submit" disabled={loading} className={styles.submitBtn}>
                    {loading ? (
                      <><span className={styles.spinner} />Sending...</>
                    ) : submitLabel}
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
