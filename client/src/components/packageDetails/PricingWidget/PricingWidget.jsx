import { motion } from 'framer-motion'
import { openWhatsApp } from '../../../utils/whatsapp'
import styles from './PricingWidget.module.css'

export default function PricingWidget({ pkg }) {
  const price = pkg?.price || '—'
  const title = pkg?.title || 'Package'
  const hasFlights = Array.isArray(pkg?.flights) && pkg.flights.length > 0

  const breakdown = [
    ...(hasFlights ? [{ label: 'Flights', value: 'Included', icon: '✈' }] : []),
    { label: 'Hotels',    value: 'Premium', icon: '🏨' },
    { label: 'Transfers', value: 'Private', icon: '🚗' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
      className={styles.widget}
    >
      <div className={styles.priceSec}>
        <span className={styles.priceLabel}>Total Estimate</span>
        <div className={styles.priceRow}>
          <span className={styles.priceAmt}>{price}</span>
          <span className={styles.pricePer}>/ person</span>
        </div>
        <p className={styles.priceNote}>
          Contact us for detailed breakdown &amp; current availability.
        </p>
      </div>

      <div className={styles.breakdown}>
        {breakdown.map((item, i) => (
          <div key={i} className={styles.breakdownItem}>
            {i > 0 && <div className={styles.breakdownDivider} />}
            <div className={styles.breakdownRow}>
              <span className={styles.breakdownLabel}>
                <div className={styles.breakdownIcon}>{item.icon}</div>
                {item.label}
              </span>
              <span className={styles.breakdownValue}>{item.value}</span>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => openWhatsApp(title)} className={styles.ctaBtn}>
        <svg viewBox="0 0 24 24" fill="currentColor" className={styles.waIcon}>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.112.555 4.094 1.523 5.813L0 24l6.336-1.499A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.946 0-3.77-.51-5.338-1.4l-.382-.225-3.961.937.997-3.868-.249-.401A9.942 9.942 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
        Request Quote
      </button>

      <div className={styles.trust}>
        <span className={styles.trustItem}>🛡️ Secure</span>
        <span className={styles.trustItem}>🎧 Support</span>
      </div>
    </motion.div>
  )
}
