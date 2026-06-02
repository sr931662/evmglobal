import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { api } from '../../services/api'
import { openWhatsApp } from '../../utils/whatsapp'
import styles from './CancellationPage.module.css'

const REASONS = [
  'Change of travel plans',
  'Medical / health emergency',
  'Visa not approved',
  'Financial constraints',
  'Natural disaster / force majeure',
  'Duplicate booking',
  'Other',
]

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.33, 1, 0.68, 1] } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.25 } },
}

function nightsLabel(n) { return `${n || 0}N${(n || 0) + 1}D` }

function TripSummary({ quote }) {
  return (
    <div className={styles.tripSummary}>
      <div className={styles.tripSummaryTop}>
        <div>
          <p className={styles.tripRef}>{quote.refNumber}</p>
          <h3 className={styles.tripTitle}>{quote.tripTitle}</h3>
        </div>
        <span className={styles.statusBadge}>{quote.status}</span>
      </div>
      {quote.destinations?.length > 0 && (
        <div className={styles.destPills}>
          {quote.destinations.map((d, i) => (
            <span key={i} className={styles.destPill}>{d}</span>
          ))}
        </div>
      )}
      <div className={styles.tripMeta}>
        {quote.startDate && <span className={styles.metaItem}><span className={styles.metaLabel}>Departure</span>{quote.startDate}</span>}
        {quote.nights > 0 && <span className={styles.metaItem}><span className={styles.metaLabel}>Duration</span>{nightsLabel(quote.nights)}</span>}
        {quote.pax > 0 && <span className={styles.metaItem}><span className={styles.metaLabel}>Travellers</span>{quote.pax}</span>}
        {quote.tripType && <span className={styles.metaItem}><span className={styles.metaLabel}>Type</span>{quote.tripType}</span>}
      </div>
      {quote.hotels?.filter(h => h.name).length > 0 && (
        <div className={styles.tripHotels}>
          <p className={styles.tripHotelsLabel}>Accommodation</p>
          <div className={styles.hotelCardList}>
            {quote.hotels.filter(h => h.name).map((h, i) => (
              <div key={i} className={styles.hotelCard}>
                <div className={styles.hotelCardTop}>
                  <div>
                    <p className={styles.hotelName}>{h.name}</p>
                    {h.stars > 0 && <p className={styles.hotelStars}>{'★'.repeat(Math.min(h.stars, 5))}</p>}
                  </div>
                  {h.roomCategory && <span className={styles.hotelRoom}>{h.roomCategory}</span>}
                </div>
                {h.address && <p className={styles.hotelAddress}>📍 {h.address}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CancellationPage() {
  const [searchParams] = useSearchParams()

  const [step, setStep] = useState('lookup') // 'lookup' | 'form' | 'done'

  // Step 1 state
  const [ref,     setRef]     = useState(searchParams.get('ref') || '')
  const [phone,   setPhone]   = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError,   setLookupError]   = useState('')
  const [quote, setQuote] = useState(null)

  // Step 2 state
  const [reason,      setReason]      = useState('')
  const [details,     setDetails]     = useState('')
  const [contactName, setContactName] = useState('')
  const [contactPhone,setContactPhone]= useState('')
  const [contactEmail,setContactEmail]= useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitError,   setSubmitError]   = useState('')

  const handleLookup = async (e) => {
    e.preventDefault()
    if (!ref.trim()) return
    setLookupLoading(true)
    setLookupError('')
    try {
      const data = await api.lookupQuote(ref.trim(), phone.trim())
      setQuote(data)
      setContactName(data.clientName || '')
      setContactPhone(data.clientPhone || '')
      setContactEmail(data.clientEmail || '')
      setStep('form')
    } catch {
      setLookupError('Booking not found. Please check your reference number and try again.')
    } finally {
      setLookupLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!reason) { setSubmitError('Please select a cancellation reason.'); return }
    if (!contactName.trim() || !contactPhone.trim()) {
      setSubmitError('Name and phone are required for the cancellation request.')
      return
    }
    setSubmitLoading(true)
    setSubmitError('')
    try {
      const message = [
        `CANCELLATION REQUEST`,
        `Booking Ref: ${quote.refNumber}`,
        `Trip: ${quote.tripTitle}`,
        `Destinations: ${quote.destinations?.join(', ') || '—'}`,
        `Start Date: ${quote.startDate || '—'}`,
        `Reason: ${reason}`,
        details ? `Additional Details: ${details}` : null,
      ].filter(Boolean).join('\n')

      await api.submitLead({
        name: contactName,
        phone: contactPhone,
        email: contactEmail || undefined,
        type: 'inquiry',
        message,
        destination: quote.destinations?.join(', ') || undefined,
      })
      setStep('done')
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit. Please try WhatsApp instead.')
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <div className={styles.page}>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroInner}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}>
            <span className={styles.eyebrow}><span className={styles.eyebrowLine} /> Cancellation Request <span className={styles.eyebrowLine} /></span>
            <h1 className={styles.heroHeading}>Cancel your booking</h1>
            <p className={styles.heroDesc}>
              We understand plans change. Look up your booking below and submit a cancellation request — our team will be in touch within 24 hours.
            </p>
          </motion.div>
        </div>
      </section>

      <div className={styles.body}>
        <AnimatePresence mode="wait">

          {/* ── Step 1: Lookup ── */}
          {step === 'lookup' && (
            <motion.div key="lookup" variants={cardVariants} initial="initial" animate="animate" exit="exit" className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>🔍</div>
                <div>
                  <h2 className={styles.cardTitle}>Find your booking</h2>
                  <p className={styles.cardSub}>Enter your quote reference number to get started.</p>
                </div>
              </div>

              <form onSubmit={handleLookup} className={styles.form}>
                {lookupError && <div className={styles.errorBanner}>⚠ {lookupError}</div>}

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Booking Reference Number *</label>
                  <input
                    className={styles.input}
                    placeholder="EMV-Q-2026-001"
                    value={ref}
                    onChange={e => setRef(e.target.value.toUpperCase())}
                    required
                  />
                  <p className={styles.hint}>Format: EMV-Q-YYYY-NNN (found in your quote email)</p>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>Phone Number <span className={styles.optional}>(optional, for verification)</span></label>
                  <input
                    className={styles.input}
                    type="tel"
                    placeholder="+91 99999 99999"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>

                <button type="submit" disabled={lookupLoading || !ref.trim()} className={styles.primaryBtn}>
                  {lookupLoading ? <><span className={styles.spinner} /> Looking up…</> : 'Find My Booking →'}
                </button>
              </form>
            </motion.div>
          )}

          {/* ── Step 2: Cancellation form ── */}
          {step === 'form' && quote && (
            <motion.div key="form" variants={cardVariants} initial="initial" animate="animate" exit="exit">

              {/* Warning banner */}
              <div className={styles.warningBanner}>
                <span className={styles.warningIcon}>⚠</span>
                <div>
                  <p className={styles.warningTitle}>Review before cancelling</p>
                  <p className={styles.warningText}>
                    Cancellation charges may apply as per airline, hotel, and supplier policies. Non-refundable components will not be reimbursed. Contact us on WhatsApp first if you have questions.
                  </p>
                </div>
              </div>

              {/* Trip Summary */}
              <div className={styles.card} style={{ marginBottom: '1.25rem' }}>
                <p className={styles.sectionLabel}>Your Booking</p>
                <TripSummary quote={quote} />
              </div>

              {/* Cancellation form */}
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardIcon}>📋</div>
                  <div>
                    <h2 className={styles.cardTitle}>Cancellation Request</h2>
                    <p className={styles.cardSub}>Fill in the details below and our team will process your request.</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                  {submitError && <div className={styles.errorBanner}>⚠ {submitError}</div>}

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Reason for Cancellation *</label>
                    <div className={styles.reasonGrid}>
                      {REASONS.map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setReason(r)}
                          className={`${styles.reasonChip} ${reason === r ? styles.reasonChipActive : ''}`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Additional Details <span className={styles.optional}>(optional)</span></label>
                    <textarea
                      className={styles.textarea}
                      placeholder="Please describe your situation or any specific requests…"
                      value={details}
                      onChange={e => setDetails(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className={styles.divider} />

                  <p className={styles.contactHeading}>Your Contact Information</p>

                  <div className={styles.fieldRow}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>Full Name *</label>
                      <input className={styles.input} value={contactName} onChange={e => setContactName(e.target.value)} required />
                    </div>
                    <div className={styles.fieldGroup}>
                      <label className={styles.label}>Phone Number *</label>
                      <input className={styles.input} type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} required />
                    </div>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Email <span className={styles.optional}>(optional)</span></label>
                    <input className={styles.input} type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
                  </div>

                  <div className={styles.actionRow}>
                    <button type="button" className={styles.secondaryBtn} onClick={() => setStep('lookup')}>
                      ← Back
                    </button>
                    <button type="submit" disabled={submitLoading || !reason} className={styles.dangerBtn}>
                      {submitLoading ? <><span className={styles.spinner} /> Submitting…</> : 'Submit Cancellation Request'}
                    </button>
                  </div>

                  <p className={styles.altNote}>
                    Prefer to cancel over WhatsApp?{' '}
                    <button
                      type="button"
                      className={styles.waLink}
                      onClick={() => openWhatsApp(`I would like to cancel booking ${quote.refNumber} — ${quote.tripTitle}. Reason: ${reason || 'Not specified'}`)}
                    >
                      Chat with us directly →
                    </button>
                  </p>
                </form>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Confirmation ── */}
          {step === 'done' && (
            <motion.div key="done" variants={cardVariants} initial="initial" animate="animate" exit="exit" className={styles.card}>
              <div className={styles.successCard}>
                <div className={styles.successIcon}>✓</div>
                <h2 className={styles.successTitle}>Request Received</h2>
                <p className={styles.successText}>
                  Your cancellation request for <strong>{quote?.refNumber}</strong> has been submitted.
                  Our team will review it and reach out to you within <strong>24 hours</strong> with the next steps and any applicable refund details.
                </p>
                <div className={styles.successActions}>
                  <button
                    className={styles.primaryBtn}
                    onClick={() => openWhatsApp(`Hi, I just submitted a cancellation request for ${quote?.refNumber}. Please confirm receipt.`)}
                  >
                    Confirm on WhatsApp
                  </button>
                  <a href="/" className={styles.secondaryBtn}>Back to Home</a>
                </div>
                <p className={styles.refNote}>Reference: <strong>{quote?.refNumber}</strong></p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Policy box */}
        {step !== 'done' && (
          <div className={styles.policyBox}>
            <p className={styles.policyTitle}>Cancellation Policy</p>
            <ul className={styles.policyList}>
              <li>Cancellations are subject to airline, hotel, and supplier policies</li>
              <li>Service fees charged by EMV Global are non-refundable</li>
              <li>Refund timelines depend on suppliers and banking systems (typically 7–21 business days)</li>
              <li>Flight tickets cancelled within 24 hours of departure are generally non-refundable</li>
              <li>Our team will provide a full breakdown of applicable charges before processing</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
