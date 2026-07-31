import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { api } from '../../services/api'
import { openWhatsApp } from '../../utils/whatsapp'
import QuotePrintDocument from '../../components/quote/QuotePrintDocument'
import {
  COMPANY, LOGO_URL, computeQuote, quoteMarkdown,
  fmt, nightsLabel, durationLabel, openQuotePrintWindow,
} from '../../utils/quote'
import styles from './Quotes.module.css'

const statusColors = {
  Sent:     { background: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6' },
  Accepted: { background: '#f0fdf4', color: '#15803d', dot: '#22c55e' },
  Draft:    { background: '#f3f4f6', color: '#4b5563', dot: '#9ca3af' },
  Rejected: { background: '#fef2f2', color: '#dc2626', dot: '#f87171' },
}

function WaIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.112.555 4.094 1.523 5.813L0 24l6.336-1.499A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.946 0-3.77-.51-5.338-1.4l-.382-.225-3.961.937.997-3.868-.249-.401A9.942 9.942 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
    </svg>
  )
}

function MdBlock({ children }) {
  if (!children?.trim()) return null
  return (
    <div className={styles.qvMd}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  )
}

function QuoteView({ quote }) {
  const printRef = useRef(null)
  const calc     = computeQuote(quote)
  const md       = quoteMarkdown(quote)
  const cur      = calc.currency
  const outbound = quote.flights?.find(f => f.type === 'outbound')
  const ret      = quote.flights?.find(f => f.type === 'return')
  const sc       = statusColors[quote.status] || statusColors.Sent

  const handlePrint = () => {
    openQuotePrintWindow(printRef.current?.innerHTML, quote.refNumber)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
      className={styles.qvWrap}
    >
      <div className={styles.qvHeaderBar}>
        <div>
          <div className={styles.qvBrandRow}>
            <img src={LOGO_URL} alt="EMV" className={styles.qvLogo} />
            <span className={styles.qvBrandName}>{COMPANY.name}</span>
          </div>
          <div className={styles.qvRefRow}>
            <span className={styles.qvRefLabel}>Quote No.</span>
            <span className={styles.qvRef}>{quote.refNumber}</span>
            <span className={styles.qvStatusPill} style={{ background: sc.background, color: sc.color }}>
              <span className={styles.qvStatusDot} style={{ background: sc.dot }} />
              {quote.status}
            </span>
          </div>
          <h2 className={styles.qvTitle}>{quote.tripTitle}</h2>
          <p className={styles.qvMeta}>
            {quote.destinations?.filter(Boolean).join(' · ')} · {durationLabel(quote.nights)} ({nightsLabel(quote.nights)}) · {calc.pax} Pax · {quote.tripType}
            {quote.startDate && ` · Departure: ${quote.startDate}`}
          </p>
        </div>
        <div className={styles.qvActions}>
          <button onClick={handlePrint} className={styles.qvPrintBtn}>
            <span>🖨</span> Download PDF
          </button>
          <button
            onClick={() => openWhatsApp(`Hi, I'm viewing my quote ${quote.refNumber} — ${quote.tripTitle}`)}
            className={styles.qvChatBtn}
          >
            <WaIcon className={styles.qvWaIcon} /> Chat with Us
          </button>
        </div>
      </div>

      <div className={styles.qvCard}>
        {/* Price breakdown */}
        <div className={styles.qvSection}>
          <p className={styles.qvSectionLabel}>Price Breakdown</p>

          {calc.adults > 0 && calc.perAdult > 0 && (
            <div className={styles.costRow}>
              <span className={styles.costRowLabel}>
                Adult{calc.adults === 1 ? '' : 's'}
                <span className={styles.costRowMeta}> {calc.adults} × {cur} {fmt(calc.perAdult)} per person</span>
              </span>
              <span className={styles.costRowAmt}>{cur} {fmt(calc.adultTotal)}</span>
            </div>
          )}
          {calc.children > 0 && calc.perChild > 0 && (
            <div className={styles.costRow}>
              <span className={styles.costRowLabel}>
                Child{calc.children === 1 ? '' : 'ren'}
                <span className={styles.costRowMeta}> {calc.children} × {cur} {fmt(calc.perChild)} per child</span>
              </span>
              <span className={styles.costRowAmt}>{cur} {fmt(calc.childTotal)}</span>
            </div>
          )}
          {calc.extraItems.filter(i => i.description).map((item, i) => (
            <div key={i} className={styles.costRow}>
              <span className={styles.costRowLabel}>{item.description}</span>
              <span className={styles.costRowAmt}>{cur} {fmt(item.amount)}</span>
            </div>
          ))}

          <div className={styles.costRow}>
            <span className={styles.costRowLabel}><strong>Subtotal</strong></span>
            <span className={styles.costRowAmt}>{cur} {fmt(calc.subtotal)}</span>
          </div>

          {calc.taxes.map((t, i) => (
            <div key={i} className={styles.costRow}>
              <span className={styles.costRowTax}>{t.name} @ {t.percent}%</span>
              <span className={styles.costRowTaxAmt}>{cur} {fmt(t.amount)}</span>
            </div>
          ))}

          <div className={styles.costTotal}>
            <span className={styles.costTotalLabel}>Total Payable ({calc.pax} Pax)</span>
            <span className={styles.costTotalAmt}>{cur} {fmt(calc.total)}</span>
          </div>
          {calc.pax > 0 && (
            <p className={styles.costValidity}>
              {cur} {fmt(calc.perPerson)} per person, inclusive of taxes
            </p>
          )}
          {quote.validUntil && (
            <p className={styles.costValidity}>Quote valid until: <strong>{quote.validUntil}</strong></p>
          )}
        </div>

        {/* Flights */}
        {(outbound || ret) && (
          <div className={styles.qvSection}>
            <p className={styles.qvSectionLabel}>Flight Details</p>
            <div className={styles.flightGrid}>
              {[outbound, ret].filter(Boolean).map((fl, i) => (
                <div key={i} className={styles.flightBox}>
                  <div className={styles.flightBoxHeader}>
                    <span className={`${styles.flightTypeBadge} ${fl.type === 'outbound' ? styles.flightTypeOut : styles.flightTypeRet}`}>
                      {fl.type === 'outbound' ? '↗ Outbound' : '↙ Return'}
                    </span>
                    <span className={styles.flightNum}>{fl.airline} {fl.flightNumber}</span>
                  </div>
                  <div className={styles.flightRow}>
                    <div>
                      <div className={styles.flightTime}>{fl.departure}</div>
                      <div className={styles.flightPort}>{fl.from}</div>
                    </div>
                    <div className={styles.flightMiddle}>
                      <div className={styles.flightDuration}>{fl.duration}</div>
                      <div className={styles.flightTrack}>
                        <div className={styles.flightLine} />
                        <span className={styles.flightIcon}>✈</span>
                        <div className={styles.flightLine} />
                      </div>
                      <div className={styles.flightDetails}>{fl.class} · {fl.baggage}</div>
                    </div>
                    <div>
                      <div className={styles.flightTime}>{fl.arrival}</div>
                      <div className={styles.flightPort}>{fl.to}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hotels */}
        {quote.hotels?.filter(h => h.name).length > 0 && (
          <div className={styles.qvSection}>
            <p className={styles.qvSectionLabel}>Accommodation</p>
            <div className={styles.hotelGrid}>
              {quote.hotels.filter(h => h.name).map((h, i) => (
                <div key={i} className={styles.hotelBox}>
                  <div className={styles.hotelBoxHeader}>
                    <div>
                      <p className={styles.hotelName}>{h.name}</p>
                      {h.stars > 0 && <p className={styles.hotelStars}>{'★'.repeat(Math.min(h.stars, 5))}</p>}
                    </div>
                    {h.roomCategory && <span className={styles.hotelMealPlan}>{h.roomCategory}</span>}
                  </div>
                  {h.address && (
                    <div className={styles.hotelMeta}>
                      <span>📍 {h.address}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Itinerary */}
        {quote.itinerary?.filter(d => d.title || d.description).length > 0 && (
          <div className={styles.qvSection}>
            <p className={styles.qvSectionLabel}>Day-wise Itinerary</p>
            <div className={styles.itinTimeline}>
              <div className={styles.itinLine} />
              <div className={styles.itinList}>
                {quote.itinerary.filter(d => d.title || d.description).map((day) => (
                  <div key={day.day} className={styles.itinItem}>
                    <div className={styles.itinDot}>{day.day}</div>
                    <div className={styles.itinContent}>
                      {day.title && <p className={styles.itinTitle}>{day.title}</p>}
                      {day.description && <p className={styles.itinDesc}>{day.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Inclusions / Exclusions */}
        {(md.inclusions.trim() || md.exclusions.trim()) && (
          <div className={styles.qvSection}>
            <div className={styles.inclExclGrid}>
              {md.inclusions.trim() && (
                <div>
                  <p className={styles.inclLabel}>✓ What's Included</p>
                  <MdBlock>{md.inclusions}</MdBlock>
                </div>
              )}
              {md.exclusions.trim() && (
                <div>
                  <p className={styles.exclLabel}>✗ Not Included</p>
                  <MdBlock>{md.exclusions}</MdBlock>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Important notes */}
        {md.notes.trim() && (
          <div className={`${styles.qvSection} ${styles.notesSection}`}>
            <p className={`${styles.qvSectionLabel} ${styles.qvLabelAmber}`}>⚠ Important Notes</p>
            <MdBlock>{md.notes}</MdBlock>
          </div>
        )}

        {/* Policy & terms */}
        {md.terms.trim() && (
          <div className={styles.qvSection}>
            <p className={styles.qvSectionLabel}>Policy &amp; Terms</p>
            <MdBlock>{md.terms}</MdBlock>
          </div>
        )}
      </div>

      {/* CTA strip */}
      <div className={styles.ctaStrip}>
        <div>
          <p className={styles.ctaStripTitle}>Ready to confirm?</p>
          <p className={styles.ctaStripDesc}>Our concierge is available 24/7 to answer questions and lock in your booking.</p>
        </div>
        <button
          onClick={() => openWhatsApp(`I'd like to confirm my quote ${quote.refNumber} — ${quote.tripTitle}`)}
          className={styles.ctaStripBtn}
        >
          <WaIcon className={styles.ctaWaIcon} /> Confirm on WhatsApp
        </button>
      </div>

      <p className={styles.qvFootNote}>
        {COMPANY.legal} · CIN: {COMPANY.cin} · GST: {COMPANY.gst} · Prepared by {quote.agentName || 'EMV Team'}
      </p>

      <div ref={printRef} style={{ display: 'none' }}>
        <QuotePrintDocument quote={quote} />
      </div>
    </motion.div>
  )
}


export default function QuotesPage() {
  const [ref,     setRef]     = useState('')
  const [phone,   setPhone]   = useState('')
  const [loading, setLoading] = useState(false)
  const [quote,   setQuote]   = useState(null)
  const [error,   setError]   = useState(null)

  async function handleLookup(e) {
    e.preventDefault()
    if (!ref.trim()) return
    setLoading(true)
    setError(null)
    setQuote(null)
    try {
      const data = await api.lookupQuote(ref.trim(), phone.trim())
      setQuote(data)
    } catch {
      setError('Quote not found. Please check your reference number and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>

      {/* Hero */}
      <section className={styles.heroSection}>
        <div className={styles.heroBgDecor} />
        <div className={styles.heroInner}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
          >
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowLine} /> Travel Quotes <span className={styles.eyebrowLine} />
            </span>
            <h1 className={styles.heroHeading}>
              Your personalised<br /> journey awaits.
            </h1>
            <p className={styles.heroDesc}>
              Enter your quote reference number below to view your custom travel proposal, cost breakdown, itinerary, and more.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Lookup form */}
      <div className={styles.lookupWrap}>
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleLookup}
          className={styles.lookupCard}
        >
          <h2 className={styles.lookupTitle}>View Your Quote</h2>
          <p className={styles.lookupHint}>
            Your reference number is in the format{' '}
            <code className={styles.lookupCode}>EMV-Q-YYYY-NNN</code>
          </p>

          <div className={styles.lookupFields}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Quote Reference Number *</label>
              <input
                className={styles.input}
                placeholder="EMV-Q-2026-001"
                value={ref}
                onChange={e => setRef(e.target.value.toUpperCase())}
                required
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Phone Number{' '}
                <span className={styles.labelOptional}>(optional, for verification)</span>
              </label>
              <input
                className={`${styles.input} ${styles.inputTel}`}
                placeholder="+91 99999 99999"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                type="tel"
              />
            </div>

            {error && (
              <div className={styles.errorBox}>
                <span>⚠</span> {error}
              </div>
            )}

            <button type="submit" disabled={loading || !ref.trim()} className={styles.submitBtn}>
              {loading ? (
                <><span className={styles.spinnerCircle} /> Looking up…</>
              ) : 'View My Quote →'}
            </button>
          </div>
        </motion.form>
      </div>

      {/* Quote result */}
      <AnimatePresence>
        {quote && (
          <section className={styles.quoteSection}>
            <QuoteView quote={quote} />
          </section>
        )}
      </AnimatePresence>

      {/* Cancellation link */}
      {!quote && (
        <div style={{ textAlign: 'center', marginTop: '-1rem', marginBottom: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
          Need to cancel a booking?{' '}
          <Link to="/cancellation-policy" style={{ color: '#E53935', fontWeight: 700, textDecoration: 'none' }}>
            Read our cancellation policy
          </Link>
        </div>
      )}

      {/* No quote CTA */}
      {!quote && (
        <section className={styles.noQuoteSec}>
          <div className={styles.noQuoteBox}>
            <div className={styles.noQuoteIcon}>✈</div>
            <h3 className={styles.noQuoteTitle}>Don't have a quote yet?</h3>
            <p className={styles.noQuoteDesc}>
              Chat with our travel concierge on WhatsApp and we'll craft a personalised quote for your dream trip — usually within a few hours.
            </p>
            <button onClick={() => openWhatsApp('I would like a travel quote')} className={styles.noQuoteBtn}>
              <span className={styles.waIconGreen}><WaIcon className={styles.ctaWaIcon} /></span>
              Request a Quote on WhatsApp
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
