import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate, useParams, Link } from 'react-router-dom'
import PricingWidget from '../../components/packageDetails/PricingWidget/PricingWidget'
import { api } from '../../services/api'
import { openWhatsApp } from '../../utils/whatsapp'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { usePageMeta } from '../../hooks/usePageMeta'
import styles from './PackageDetails.module.css'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=2800'

export default function PackageDetails() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const heroRef    = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const bgY        = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])

  const { customer } = useCustomerAuth()
  const [pkg,     setPkg]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  const itinUnlocked = !!customer

  useEffect(() => {
    if (!id) { navigate('/packages', { replace: true }); return }
    setLoading(true)
    api.getPackage(id)
      .then(setPkg)
      .catch(() => setError('Package not found.'))
      .finally(() => setLoading(false))
  }, [id])

  // Set meta tags for social sharing when package loads
  usePageMeta(
    pkg ? `${pkg.title} | EMV Global Travel Packages` : 'EMV Global Travel Packages',
    pkg ? `${pkg.title} - ${pkg.nights} nights${pkg.destinations && pkg.destinations.length ? ` in ${pkg.destinations.join(', ')}` : ''}` : 'Discover premium travel packages',
    {
      image: pkg?.image || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=2800',
      url: typeof window !== 'undefined' ? `${window.location.origin}/packages/${id}` : '',
      type: 'website'
    }
  )

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
  const flights      = Array.isArray(pkg.flights)      ? pkg.flights.filter(f => f.airline || f.flightNumber || f.from) : []
  const hotels       = Array.isArray(pkg.hotels)       ? pkg.hotels.filter(h => h.name)   : []
  const notes        = Array.isArray(pkg.notes) && pkg.notes.length ? pkg.notes : []
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

            {/* Flight Details */}
            {flights.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.33,1,0.68,1] }}
                className={styles.card}
              >
                <h3 className={styles.cardTitleLg}>✈ Flight Details</h3>
                <div className={styles.flightsList}>
                  {flights.map((fl, i) => (
                    <div key={i} className={styles.flightCard}>
                      <div className={styles.flightType}>{fl.type || 'Flight'}</div>
                      <div className={styles.flightRow}>
                        <div className={styles.flightCity}>
                          <span className={styles.flightCityCode}>{fl.from}</span>
                          <span className={styles.flightCityLabel}>Origin</span>
                        </div>
                        <div className={styles.flightArrow}>
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1.25rem', height: '1.25rem' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                        <div className={styles.flightCity}>
                          <span className={styles.flightCityCode}>{fl.to}</span>
                          <span className={styles.flightCityLabel}>Destination</span>
                        </div>
                      </div>
                      <div className={styles.flightMeta}>
                        {fl.airline     && <span>{fl.airline}</span>}
                        {fl.flightNumber && <span>· {fl.flightNumber}</span>}
                        {fl.date        && <span>· {fl.date}</span>}
                        {fl.time        && <span>· {fl.time}</span>}
                        {fl.cabinClass  && <span className={styles.flightClass}>· {fl.cabinClass}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Hotel Section */}
            {hotels.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.33,1,0.68,1] }}
                className={styles.card}
              >
                <div className={styles.hotelSectionHeader}>
                  <div>
                    <h3 className={styles.cardTitleLg}>🏨 Accommodation</h3>
                    <p className={styles.hotelSectionSub}>{hotels.length} {hotels.length === 1 ? 'property' : 'properties'} included in this package</p>
                  </div>
                  <span className={styles.hotelSectionBadge}>{hotels.length} {hotels.length === 1 ? 'Hotel' : 'Hotels'}</span>
                </div>
                <div className={styles.hotelsList}>
                  {hotels.map((h, i) => {
                    const stars = parseInt(h.stars) || 4
                    return (
                      <div key={i} className={styles.hotelCard}>
                        <div className={styles.hotelCardInner}>
                          <div className={styles.hotelIconWrap}>
                            <span className={styles.hotelIconEmoji}>🏨</span>
                            <span className={styles.hotelIndexBadge}>{i + 1}</span>
                          </div>
                          <div className={styles.hotelDetails}>
                            <div className={styles.hotelHeader}>
                              <div className={styles.hotelNameWrap}>
                                <p className={styles.hotelName}>{h.name}</p>
                                <p className={styles.hotelStars}>
                                  {'★'.repeat(stars)}
                                  <span className={styles.hotelStarEmpty}>{'★'.repeat(5 - stars)}</span>
                                  <span className={styles.hotelStarLabel}>{stars}-Star Hotel</span>
                                </p>
                              </div>
                              {h.roomType && <span className={styles.hotelRoomBadge}>{h.roomType}</span>}
                            </div>
                            <div className={styles.hotelMeta}>
                              {h.address && (
                                <span className={styles.hotelMetaItem}>
                                  <span className={styles.hotelMetaIcon}>📍</span>
                                  {h.address}
                                </span>
                              )}
                              {h.city && (
                                <span className={styles.hotelMetaItem}>
                                  <span className={styles.hotelMetaIcon}>🌆</span>
                                  {h.city}
                                </span>
                              )}
                              {h.checkIn && (
                                <span className={styles.hotelMetaItem}>
                                  <span className={styles.hotelMetaIcon}>📅</span>
                                  Check-in: <strong>{h.checkIn}</strong>
                                </span>
                              )}
                              {h.checkOut && (
                                <span className={styles.hotelMetaItem}>
                                  <span className={styles.hotelMetaIcon}>📅</span>
                                  Check-out: <strong>{h.checkOut}</strong>
                                </span>
                              )}
                              {h.nights && (
                                <span className={styles.hotelNightsBadge}>
                                  🌙 {h.nights} {h.nights === 1 ? 'Night' : 'Nights'}
                                </span>
                              )}
                            </div>
                            {Array.isArray(h.amenities) && h.amenities.length > 0 && (
                              <div className={styles.hotelAmenities}>
                                {h.amenities.map((a, ai) => (
                                  <span key={ai} className={styles.hotelAmenityTag}>{a}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
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
                    {itinerary.map((day) => {
                      const fullHotel = day.hotel?.name
                        ? { ...day.hotel, ...(hotels.find(h => h.name === day.hotel.name) || {}) }
                        : null
                      return (
                      <details key={day.day} className={styles.dayAccordion} open={day.day === 1}>
                        <summary className={styles.daySummary}>
                          <span className={styles.dayNum}>{day.day}</span>
                          <span className={styles.dayTitle}>{day.title || `Day ${day.day}`}</span>
                          <svg className={styles.dayChevron} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </summary>
                        {(Array.isArray(day.activities) && day.activities.length > 0 || day.note || fullHotel?.name) && (
                          <div className={styles.dayBody}>
                            {Array.isArray(day.activities) && day.activities.map((act, ai) => (
                              <div key={ai} className={styles.activity}>
                                <span className={styles.actIcon}>{act.icon || '📍'}</span>
                                <div>
                                  {act.time && <span className={styles.actTime}>{act.time}</span>}
                                  <span className={styles.actDesc}>{act.description}</span>
                                </div>
                              </div>
                            ))}
                            {fullHotel?.name && (
                              <div className={styles.dayHotel}>
                                <span className={styles.dayHotelIcon}>🏨</span>
                                <div className={styles.dayHotelInfo}>
                                  <div className={styles.dayHotelRow}>
                                    <p className={styles.dayHotelName}>{fullHotel.name}</p>
                                    {fullHotel.stars && (
                                      <span className={styles.dayHotelStars}>{'★'.repeat(parseInt(fullHotel.stars) || 4)}</span>
                                    )}
                                  </div>
                                  <div className={styles.dayHotelBadges}>
                                    {fullHotel.roomType && <span className={styles.dayHotelBadge}>{fullHotel.roomType}</span>}
                                    {fullHotel.mealPlan && <span className={styles.dayHotelBadgeMeal}>{fullHotel.mealPlan}</span>}
                                    {fullHotel.nights && <span className={styles.dayHotelBadgeNights}>🌙 {fullHotel.nights}N</span>}
                                  </div>
                                  {(fullHotel.address || fullHotel.location) && (
                                    <p className={styles.dayHotelAddress}>📍 {fullHotel.address || fullHotel.location}</p>
                                  )}
                                  {(fullHotel.checkIn || fullHotel.checkOut) && (
                                    <p className={styles.dayHotelMeta}>
                                      {[fullHotel.checkIn && `Check-in: ${fullHotel.checkIn}`, fullHotel.checkOut && `Check-out: ${fullHotel.checkOut}`].filter(Boolean).join(' · ')}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                            {day.note && (
                              <div className={styles.dayNote}>
                                <span className={styles.dayNoteIcon}>📝</span>
                                <p className={styles.dayNoteText}>{day.note}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </details>
                      )
                    })}
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
                          Sign in free to unlock the complete day-by-day itinerary for this package
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                          <Link
                            to={`/login?next=${encodeURIComponent(window.location.hash.slice(1) || '/packages')}`}
                            style={{ textDecoration: 'none' }}
                          >
                            <motion.div
                              whileHover={{ scale: 1.04, boxShadow: '0 0 28px rgba(229,57,53,0.45)' }}
                              whileTap={{ scale: 0.96 }}
                              className={styles.itinLockBtn}
                              style={{ textAlign: 'center', cursor: 'pointer' }}
                            >
                              🔓 Sign In Free — Unlock Itinerary
                            </motion.div>
                          </Link>
                          <button
                            onClick={() => window.dispatchEvent(new CustomEvent('open-travel-quiz'))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '0.8125rem', fontWeight: 600 }}
                          >
                            Or plan my trip instead →
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
            {/* Important Notes */}
            {notes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.33,1,0.68,1] }}
                className={styles.notesCard}
              >
                <h3 className={styles.notesTitle}>📋 Important Notes</h3>
                <ul className={styles.notesList}>
                  {notes.map((note, i) => (
                    <li key={i} className={styles.notesItem}>
                      <span className={styles.notesBullet} />
                      {note}
                    </li>
                  ))}
                </ul>
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
