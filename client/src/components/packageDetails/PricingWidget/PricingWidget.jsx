import { motion } from 'framer-motion'
import { openWhatsApp } from '../../../utils/whatsapp'
import { formatPrice } from '../../../utils/currency'
import { splitTitle, stayNights, durationLabel, packageLocation } from '../../../utils/packageContent'
import styles from './PricingWidget.module.css'

const WA_PATH = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.112.555 4.094 1.523 5.813L0 24l6.336-1.499A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.946 0-3.77-.51-5.338-1.4l-.382-.225-3.961.937.997-3.868-.249-.401A9.942 9.942 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z'

export default function PricingWidget({ pkg, destination, onRequestQuote, onShare, shared }) {
  const price   = formatPrice(pkg?.priceValue, pkg?.price)
  const title   = pkg?.title || 'Package'
  // Falls back to the itinerary or hotel nights when the nights field was left
  // blank, so the duration doesn't vanish from the page.
  const nights   = stayNights(pkg)
  const duration = durationLabel(pkg)
  const location = packageLocation(pkg, destination)
  const { name } = splitTitle(pkg)

  const hotels   = Array.isArray(pkg?.hotels) ? pkg.hotels.filter(h => h.name) : []
  const stars    = hotels.map(h => parseInt(h.stars) || 0).filter(Boolean)
  const hotelTier = stars.length
    ? `${Math.min(...stars)}★${Math.max(...stars) !== Math.min(...stars) ? `–${Math.max(...stars)}★` : ''}`
    : null

  const details = [
    location && { icon: '📍', label: 'Location', value: location },
    duration && { icon: '📅', label: 'Duration', value: duration },
    { icon: '👥', label: 'Travellers', value: 'Your group size' },
    hotelTier && { icon: '🏨', label: 'Hotels', value: `${hotelTier} category` },
  ].filter(Boolean)

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
      className={styles.widget}
    >
      <p className={styles.pkgName}>{name}</p>
      {nights > 0 && <p className={styles.pkgDuration}>{nights + 1} Days / {nights} Nights</p>}
      {location && <p className={styles.pkgLocation}>📍 {location}</p>}

      <div className={styles.priceSec}>
        {price ? (
          <>
            <span className={styles.priceLabel}>Starting from</span>
            <div className={styles.priceRow}>
              <span className={styles.priceAmt}>{price}</span>
              <span className={styles.pricePer}>/ person</span>
            </div>
            <p className={styles.priceBasis}>Based on selected dates &amp; occupancy</p>
          </>
        ) : (
          <>
            <span className={styles.priceLabel}>Get your best price</span>
            <p className={styles.priceRow} style={{ display: 'block' }}>
              <span className={styles.priceCta}>Tell us your travel dates</span>
            </p>
          </>
        )}
        <p className={styles.priceNote}>
          Indicative price &mdash; subject to travel dates and availability. We never quote a live
          figure we can&rsquo;t honour.
        </p>

        {/* Explains the variables rather than leaving the customer to wonder
            why the number moves. */}
        <details className={styles.whyPrice}>
          <summary className={styles.whyPriceSummary}>What determines your price?</summary>
          <ul className={styles.whyPriceList}>
            {[
              ['📅', 'Travel dates'],
              ['🏨', 'Hotel category'],
              ['✈️', 'Flights'],
              ['👥', 'Number of travellers'],
              ['🎟', 'Experiences'],
              ['🚐', 'Transfers'],
            ].map(([icon, label]) => (
              <li key={label} className={styles.whyPriceItem}>
                <span aria-hidden="true">{icon}</span> {label}
              </li>
            ))}
          </ul>
        </details>
      </div>

      <div className={styles.details}>
        {details.map(item => (
          <div key={item.label} className={styles.detailRow}>
            <span className={styles.detailLabel}>
              <span className={styles.detailIcon} aria-hidden="true">{item.icon}</span>
              {item.label}
            </span>
            <span className={styles.detailValue}>{item.value}</span>
          </div>
        ))}
      </div>

      <button onClick={onRequestQuote} className={styles.ctaBtn}>
        Get My Quote
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.ctaArrow}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </button>

      <button onClick={onRequestQuote} className={styles.secondaryBtn}>
        Customize This Trip
      </button>

      <button onClick={() => openWhatsApp(title)} className={styles.waBtn}>
        <svg viewBox="0 0 24 24" fill="currentColor" className={styles.waIcon}>
          <path d={WA_PATH} />
        </svg>
        WhatsApp a Travel Expert
      </button>

      {/* Indian family travel is decided in a group chat — make it one tap to
          send this trip to the people who get a say. */}
      <button onClick={onShare} className={styles.shareTripBtn}>
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8.7 10.7a3 3 0 100 2.6m0-2.6l6.6-3.4m-6.6 6l6.6 3.4M18 8a3 3 0 100-6 3 3 0 000 6zm0 14a3 3 0 100-6 3 3 0 000 6z" />
        </svg>
        {shared ? 'Link copied' : 'Share this trip'}
      </button>

      <div className={styles.trust}>
        <span className={styles.trustItem}>✓ No payment to enquire</span>
        <span className={styles.trustItem}>✓ Reply within 24 hours</span>
      </div>
    </motion.div>
  )
}
