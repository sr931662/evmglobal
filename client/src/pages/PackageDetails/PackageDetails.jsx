import { useRef, useEffect, useState, useMemo } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate, useParams, Link } from 'react-router-dom'
import PricingWidget from '../../components/packageDetails/PricingWidget/PricingWidget'
import StickyQuoteBar from '../../components/packageDetails/StickyQuoteBar/StickyQuoteBar'
import QuoteModal from '../../components/packageDetails/QuoteModal/QuoteModal'
import RouteMap from '../../components/packageDetails/PackageSections/RouteMap'
import WhyLoveTrip from '../../components/packageDetails/PackageSections/WhyLoveTrip'
import PerfectFor from '../../components/packageDetails/PackageSections/PerfectFor'
import CustomiseTrip from '../../components/packageDetails/PackageSections/CustomiseTrip'
import BeforeYouBook from '../../components/packageDetails/PackageSections/BeforeYouBook'
import PackageFAQ from '../../components/packageDetails/PackageSections/PackageFAQ'
import DestinationReviews from '../../components/packageDetails/PackageSections/DestinationReviews'
import RelatedPackages from '../../components/packageDetails/PackageSections/RelatedPackages'
import DestinationHighlights from '../../components/packageDetails/PackageSections/DestinationHighlights'
import ItineraryDay from '../../components/packageDetails/ItineraryDay/ItineraryDay'
import sectionStyles from '../../components/packageDetails/PackageSections/PackageSections.module.css'
import { api } from '../../services/api'
import { openWhatsApp } from '../../utils/whatsapp'
import { trackFunnel } from '../../utils/analytics'
import { formatPrice } from '../../utils/currency'
import { splitTitle, tagline, tripLabel, packageFaqs, stayNights, packageLocation } from '../../utils/packageContent'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useJsonLd } from '../../hooks/useJsonLd'
import styles from './PackageDetails.module.css'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=2800'

// Days shown to signed-out visitors before the sign-in gate. Enough to prove
// the itinerary is worth reading — the revision brief asks for a scannable
// itinerary, and a fully blurred one can't be scanned at all.
const FREE_PREVIEW_DAYS = 2

const ARROW = (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ width: '1rem', height: '1rem' }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
)

export default function PackageDetails() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const heroRef    = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const bgY        = useTransform(scrollYProgress, [0, 1], ['0%', '25%'])

  const { customer } = useCustomerAuth()
  const [pkg,       setPkg]       = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [destRecords, setDestRecords] = useState([])

  const [shared, setShared] = useState(false)

  const itinUnlocked = !!customer

  const openQuote = () => {
    setQuoteOpen(true)
    trackFunnel('intent', { package: pkg?.title, destination: pkg?.destinations?.[0] })
  }

  // Family trips get decided in a group chat, so sharing has to be one tap.
  const shareTrip = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    const text = `${pkg?.title || 'This holiday'} — Ease My Vacations`
    try {
      if (navigator.share) {
        await navigator.share({ title: pkg?.title, text, url })
        return
      }
    } catch (err) {
      if (err?.name === 'AbortError') return
    }
    try {
      await navigator.clipboard?.writeText(url)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    } catch {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, '_blank', 'noopener,noreferrer')
    }
  }

  useEffect(() => {
    if (!id) { navigate('/packages', { replace: true }); return }
    setLoading(true)
    api.getPackage(id)
      .then(setPkg)
      .catch(() => setError('Package not found.'))
      .finally(() => setLoading(false))
  }, [id])

  // Pull the CMS record for every destination on this package: the first one
  // gives "Before You Book" real visa / currency / season guidance, and all of
  // them feed the per-destination highlight blocks.
  const destinationKey = Array.isArray(pkg?.destinations) ? pkg.destinations.join('|') : ''
  useEffect(() => {
    if (!destinationKey) return
    let cancelled = false
    const wanted = destinationKey.toLowerCase().split('|').map(n => n.trim())

    api.getDestinations({})
      .then(data => {
        if (cancelled || !Array.isArray(data)) return
        const matched = wanted
          .map(name => data.find(d => (d.name || '').toLowerCase().trim() === name))
          .filter(Boolean)
        setDestRecords(matched)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [destinationKey])

  const destRecord = destRecords[0] || null

  const destinations = useMemo(
    () => (Array.isArray(pkg?.destinations) ? pkg.destinations.filter(Boolean) : []),
    [pkg]
  )

  // Viewing a package is the consideration step of the funnel.
  const pkgTitle = pkg?.title
  useEffect(() => {
    if (pkgTitle) trackFunnel('consideration', { package: pkgTitle })
  }, [pkgTitle])
  const faqs = useMemo(() => (pkg ? packageFaqs(pkg) : []), [pkg])

  const { name: pkgName, route: pkgRoute } = pkg ? splitTitle(pkg) : { name: '', route: '' }
  const pkgTagline = pkg ? tagline(pkg) : ''
  const destinationList = destinations.join(', ')
  // Country where we know it, so multi-city headings don't name just one stop.
  const where = pkg ? tripLabel(pkg, destRecord) : ''

  usePageMeta(
    pkg
      ? `${pkgName} Holiday Package${destinationList ? ` – ${destinationList}` : ''} | Ease My Vacations`
      : 'Holiday Packages | Ease My Vacations',
    pkg
      ? `Explore ${destinationList || pkgName} with a personalised ${pkgName} holiday package${stayNights(pkg) > 0 ? ` — ${stayNights(pkg)} nights` : ''}, handpicked hotels, transfers and sightseeing. Get a personalised quote from Ease My Vacations.`
      : 'Discover personalised holiday packages with Ease My Vacations.',
    {
      image: pkg?.image || FALLBACK_IMAGE,
      url: typeof window !== 'undefined' ? `${window.location.origin}/package-details/${id}` : '',
      type: 'website'
    }
  )

  // FAQ rich result for the package's own questions.
  const faqSchema = useMemo(() => {
    if (!pkg || faqs.length === 0) return null
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: { '@type': 'Answer', text: faq.a },
      })),
    }
  }, [pkg, faqs])
  useJsonLd('package-faq-schema', faqSchema)

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

  const highlights = Array.isArray(pkg.highlights) ? pkg.highlights : []
  const inclusions = Array.isArray(pkg.inclusions) ? pkg.inclusions : highlights
  const exclusions = Array.isArray(pkg.exclusions) && pkg.exclusions.length
    ? pkg.exclusions
    : ['International flights', 'Visa fees & processing', 'Personal expenses & shopping', 'Meals not mentioned', 'Optional activities', 'Travel insurance']
  const itinerary = Array.isArray(pkg.itinerary) ? pkg.itinerary : []
  const flights   = Array.isArray(pkg.flights)   ? pkg.flights.filter(f => f.airline || f.flightNumber || f.from) : []
  const hotels    = Array.isArray(pkg.hotels)    ? pkg.hotels.filter(h => h.name) : []
  const notes     = Array.isArray(pkg.notes) && pkg.notes.length ? pkg.notes : []
  const heroImage = pkg.image || FALLBACK_IMAGE
  const price     = formatPrice(pkg.priceValue, pkg.price)
  // Derived, so packages saved without a nights value still show a duration.
  const nights    = stayNights(pkg)

  // Signed-in customers see everything; everyone else gets the first couple of
  // days in full and the rest behind the sign-in gate.
  const previewDays = itinUnlocked ? itinerary : itinerary.slice(0, FREE_PREVIEW_DAYS)
  const lockedDays  = itinUnlocked ? [] : itinerary.slice(FREE_PREVIEW_DAYS)

  const transferType = inclusions.find(i => /private transfer/i.test(i))
    ? 'Private Transfers'
    : inclusions.find(i => /transfer/i.test(i)) ? 'Transfers Included' : null

  // Location comes from the destinations set in Basic Info, not the title.
  const location = packageLocation(pkg, destRecord)

  const summaryChips = [
    location && { icon: '📍', text: location },
    nights > 0 && { icon: '🗓', text: `${nights} Nights / ${nights + 1} Days` },
    transferType && { icon: '🚗', text: transferType },
    { icon: '✎', text: 'Customisable' },
  ].filter(Boolean)

  return (
    <div className={styles.page}>
      {/* ── Hero: name, route, tagline, price and CTAs all above the fold ── */}
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
              All Holidays
            </button>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.33,1,0.68,1] }}
            >
              {pkg.category && <span className={styles.catBadge}>{pkg.category}</span>}

              <h1 className={styles.heroTitle}>{pkgName}</h1>
              {pkgRoute && <p className={styles.heroRoute}>{pkgRoute}</p>}
              {pkgTagline && <p className={styles.heroTagline}>{pkgTagline}</p>}

              {/* Summary bar — the package understood in five seconds */}
              <div className={styles.summaryBar}>
                {summaryChips.map(chip => (
                  <span key={chip.text} className={styles.summaryChip}>
                    <span aria-hidden="true">{chip.icon}</span> {chip.text}
                  </span>
                ))}
              </div>

              {/* Price + primary CTAs, above the fold */}
              <div className={styles.heroActions}>
                <div className={styles.heroPrice}>
                  {price ? (
                    <>
                      <span className={styles.heroPriceLabel}>Starting from</span>
                      <span className={styles.heroPriceAmt}>
                        {price} <span className={styles.heroPricePer}>/ person</span>
                      </span>
                      <span className={styles.heroPriceBasis}>Based on selected dates &amp; occupancy</span>
                    </>
                  ) : (
                    <>
                      <span className={styles.heroPriceLabel}>Get your best price</span>
                      <span className={styles.heroPriceAmt} style={{ fontSize: '1.375rem' }}>
                        Priced around your dates
                      </span>
                      <span className={styles.heroPriceBasis}>Tell us when you want to travel</span>
                    </>
                  )}
                </div>

                <div className={styles.heroBtns}>
                  <button onClick={openQuote} className={styles.heroPrimaryBtn}>
                    Get My Personalised Quote {ARROW}
                  </button>
                  <button onClick={openQuote} className={styles.heroGhostBtn}>
                    Customize This Trip
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className={styles.content}>
        <div className={styles.contentGrid}>
          <div className={styles.left}>

            <RouteMap pkg={pkg} />

            {pkg.description && (
              <motion.section
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className={sectionStyles.card}
              >
                <span className={sectionStyles.eyebrow}>Overview</span>
                <h2 className={sectionStyles.heading}>
                  {where ? `${where} Holiday Overview` : 'Holiday Overview'}
                </h2>
                <p className={styles.overviewText}>{pkg.description}</p>
              </motion.section>
            )}

            <WhyLoveTrip pkg={pkg} where={where} />

            <DestinationHighlights pkg={pkg} destinationRecords={destRecords} />

            {/* Itinerary timeline */}
            {itinerary.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.05 }}
                transition={{ duration: 0.6, ease: [0.33,1,0.68,1] }}
                className={sectionStyles.card}
              >
                <span className={sectionStyles.eyebrow}>Day by Day</span>
                <h2 className={sectionStyles.heading}>
                  Your {where ? `${where} ` : ''}Journey
                </h2>
                <p className={sectionStyles.sub}>
                  {nights > 0 ? `${nights + 1} days, ` : ''}mapped out day by day. Every stop is adjustable.
                </p>

                {previewDays.length > 0 && (
                  <div className={styles.timeline}>
                    {previewDays.map((day, i) => (
                      <ItineraryDay key={day.day} day={day} hotels={hotels} styles={styles} defaultOpen={i === 0} />
                    ))}
                  </div>
                )}

                {lockedDays.length > 0 && (
                  <div style={{ position: 'relative' }}>
                    <div
                      className={styles.timeline}
                      style={{ filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none' }}
                      aria-hidden="true"
                    >
                      {lockedDays.map(day => (
                        <ItineraryDay key={day.day} day={day} hotels={hotels} styles={styles} />
                      ))}
                    </div>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.itinLock}>
                      <motion.div
                        initial={{ scale: 0.9, y: 10 }}
                        animate={{ scale: 1, y: 0 }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 20 }}
                        className={styles.itinLockCard}
                      >
                        <div className={styles.itinLockIcon}>🔒</div>
                        <h3 className={styles.itinLockTitle}>
                          {lockedDays.length} More {lockedDays.length === 1 ? 'Day' : 'Days'} to Explore
                        </h3>
                        <p className={styles.itinLockDesc}>
                          Sign in free to see days {lockedDays[0].day}&ndash;{lockedDays[lockedDays.length - 1].day} in full.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                          <Link
                            to={`/login?next=${encodeURIComponent(`/package-details/${id}`)}`}
                            className={styles.itinLockBtn}
                          >
                            🔓 Sign In Free &mdash; Unlock Full Itinerary
                          </Link>
                          <button onClick={openQuote} className={styles.itinLockAlt}>
                            Or get a personalised quote instead →
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  </div>
                )}
              </motion.section>
            )}

            {/* Inclusions */}
            {inclusions.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, ease: [0.33,1,0.68,1] }}
                className={sectionStyles.card}
              >
                <span className={sectionStyles.eyebrow}>Package Inclusions</span>
                <h2 className={sectionStyles.heading}>What&rsquo;s Included?</h2>
                <p className={sectionStyles.sub}>
                  Everything below is part of the quoted price — compare it line for line against any
                  other quote you have.
                </p>
                <div className={styles.inclGrid}>
                  {inclusions.map((item, i) => (
                    <span key={i} className={styles.inclItem}>
                      <span className={styles.inclCheck} aria-hidden="true">✓</span> {item}
                    </span>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Exclusions */}
            {exclusions.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, ease: [0.33,1,0.68,1] }}
                className={sectionStyles.card}
              >
                <span className={sectionStyles.eyebrow}>Package Exclusions</span>
                <h2 className={sectionStyles.heading}>Not Included</h2>
                <p className={sectionStyles.sub}>
                  Stated up front so there are no surprises later. Any of these can be added to your quote.
                </p>
                <div className={styles.inclGrid}>
                  {exclusions.map((item, i) => (
                    <span key={i} className={styles.exclItem}>
                      <span className={styles.exclCross} aria-hidden="true">✕</span> {item}
                    </span>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Accommodation */}
            {hotels.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, ease: [0.33,1,0.68,1] }}
                className={sectionStyles.card}
              >
                <span className={sectionStyles.eyebrow}>Accommodation</span>
                <h2 className={sectionStyles.heading}>Your Accommodation</h2>
                <p className={sectionStyles.sub}>
                  Hotel selection is subject to availability at the time of booking. Where a listed
                  property is unavailable we substitute a similar hotel of the same category.
                </p>

                <div className={styles.hotelsList}>
                  {hotels.map((h, i) => {
                    const stars = parseInt(h.stars) || 4
                    return (
                      <div key={i} className={styles.hotelCard}>
                        <div className={styles.hotelTop}>
                          <div>
                            {(h.city || h.location) && (
                              <p className={styles.hotelCity}>
                                {h.city || h.location}
                                {h.nights ? ` — ${h.nights} ${Number(h.nights) === 1 ? 'Night' : 'Nights'}` : ''}
                              </p>
                            )}
                            <p className={styles.hotelName}>{h.name}</p>
                            <p className={styles.hotelStars}>
                              {'★'.repeat(stars)}
                              <span className={styles.hotelStarEmpty}>{'★'.repeat(5 - stars)}</span>
                              <span className={styles.hotelStarLabel}>{stars}★ Hotel / Similar</span>
                            </p>
                          </div>
                          {h.roomType && <span className={styles.hotelRoomBadge}>{h.roomType}</span>}
                        </div>
                        <div className={styles.hotelMeta}>
                          {h.mealPlan && <span className={styles.hotelMetaItem}>🍽 {h.mealPlan}</span>}
                          {h.address && <span className={styles.hotelMetaItem}>📍 {h.address}</span>}
                          {h.checkIn && <span className={styles.hotelMetaItem}>📅 Check-in: {h.checkIn}</span>}
                          {h.checkOut && <span className={styles.hotelMetaItem}>📅 Check-out: {h.checkOut}</span>}
                        </div>
                        {Array.isArray(h.amenities) && h.amenities.length > 0 && (
                          <div className={styles.hotelAmenities}>
                            {h.amenities.map((a, ai) => (
                              <span key={ai} className={styles.hotelAmenityTag}>{a}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </motion.section>
            )}

            {/* Flights */}
            {flights.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, ease: [0.33,1,0.68,1] }}
                className={sectionStyles.card}
              >
                <span className={sectionStyles.eyebrow}>Flights</span>
                <h2 className={sectionStyles.heading}>Flight Details</h2>
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
                        {fl.airline      && <span>{fl.airline}</span>}
                        {fl.flightNumber && <span>· {fl.flightNumber}</span>}
                        {fl.date         && <span>· {fl.date}</span>}
                        {fl.time         && <span>· {fl.time}</span>}
                        {fl.cabinClass   && <span className={styles.flightClass}>· {fl.cabinClass}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            <CustomiseTrip pkg={pkg} onRequestQuote={openQuote} />

            <PerfectFor pkg={pkg} />

            {/* Why Ease My Vacations */}
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, ease: [0.33,1,0.68,1] }}
              className={sectionStyles.card}
            >
              <span className={sectionStyles.eyebrow}>Why Book With Us</span>
              <h2 className={sectionStyles.heading}>Why Ease My Vacations?</h2>
              <div className={sectionStyles.grid}>
                {[
                  { icon: '✎',  title: 'Personalised Planning',  desc: 'Your itinerary is built around your preferences.' },
                  { icon: '₹',  title: 'Competitive Pricing',    desc: 'We compare options to find the right value.' },
                  { icon: '☎',  title: 'Dedicated Travel Expert', desc: 'One point of contact throughout your journey.' },
                  { icon: '🌍', title: 'On-Trip Assistance',     desc: 'Support when you need us, wherever you travel.' },
                ].map(item => (
                  <div key={item.title} className={sectionStyles.feature}>
                    <span className={sectionStyles.featureIcon} aria-hidden="true">{item.icon}</span>
                    <div>
                      <p className={sectionStyles.featureTitle}>{item.title}</p>
                      <p className={sectionStyles.featureDesc}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            <BeforeYouBook pkg={pkg} destinationRecord={destRecord} />

            {/* Important notes from the CMS */}
            {notes.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, ease: [0.33,1,0.68,1] }}
                className={styles.notesCard}
              >
                <h2 className={styles.notesTitle}>📋 Important Notes</h2>
                <ul className={styles.notesList}>
                  {notes.map((note, i) => (
                    <li key={i} className={styles.notesItem}>
                      <span className={styles.notesBullet} />
                      {note}
                    </li>
                  ))}
                </ul>
              </motion.section>
            )}

            <DestinationReviews pkg={pkg} where={where} />
            <RelatedPackages pkg={pkg} where={where} />
            <PackageFAQ faqs={faqs} where={where} />

            {/* Final CTA */}
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.6, ease: [0.33,1,0.68,1] }}
              className={sectionStyles.finalCta}
            >
              <h2 className={sectionStyles.finalHeading}>
                Ready to Experience {where || pkgName}?
              </h2>
              <p className={sectionStyles.finalSub}>
                Tell us your dates and we&rsquo;ll create the perfect holiday around you.
              </p>
              <div className={sectionStyles.finalBtns}>
                <button onClick={openQuote} className={sectionStyles.primaryBtn}>
                  Get My Personalised Quote {ARROW}
                </button>
                <button onClick={() => openWhatsApp(pkg.title)} className={sectionStyles.ghostBtn}>
                  💬 Chat with a Travel Expert
                </button>
              </div>
            </motion.section>
          </div>

          {/* Sticky enquiry panel (desktop) */}
          <div className={styles.right}>
            <PricingWidget pkg={pkg} destination={destRecord} onRequestQuote={openQuote} onShare={shareTrip} shared={shared} />
          </div>
        </div>
      </div>

      <StickyQuoteBar pkg={pkg} onRequestQuote={openQuote} />
      <QuoteModal open={quoteOpen} onClose={() => setQuoteOpen(false)} pkg={pkg} where={where} />
    </div>
  )
}
