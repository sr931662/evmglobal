import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../services/api'
import { formatPrice } from '../../../utils/currency'
import { openWhatsApp } from '../../../utils/whatsapp'
import { stayNights } from '../../../utils/packageContent'
import styles from './PopularHolidays.module.css'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1000'

// Shown when a package has no highlights of its own — every card must still
// answer "what's actually included?" rather than being a pretty picture.
const DEFAULT_INCLUSIONS = ['4★ Hotels', 'Breakfast', 'Sightseeing', 'Transfers']

const WA_PATH = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.112.555 4.094 1.523 5.813L0 24l6.336-1.499A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.946 0-3.77-.51-5.338-1.4l-.382-.225-3.961.937.997-3.868-.249-.401A9.942 9.942 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z'

const ARROW = (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: '1rem', height: '1rem' }}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
)

function durationLabel(pkg) {
  const n = stayNights(pkg)
  if (!n) return null
  return `${n} Nights / ${n + 1} Days`
}

export default function PopularHolidays() {
  const navigate = useNavigate()
  const [packages, setPackages] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.getPackages({ status: 'Active', limit: 8 })
      .then(data => {
        const list = Array.isArray(data?.packages) ? data.packages : (Array.isArray(data) ? data : [])
        setPackages(list.slice(0, 8))
      })
      .catch(() => setPackages([]))
      .finally(() => setLoading(false))
  }, [])

  if (!loading && packages.length === 0) return null

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
          className={styles.header}
        >
          <div>
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowLine} /> Popular Holidays
            </span>
            <h2 className={styles.heading}>Find Your Next Escape</h2>
          </div>
          <button onClick={() => navigate('/packages')} className={styles.allBtn}>
            Explore All Holidays {ARROW}
          </button>
        </motion.div>

        {loading ? (
          <div className={styles.skeletonGrid}>
            {[0, 1, 2, 3].map(i => <div key={i} className={styles.skeleton} />)}
          </div>
        ) : (
          <div className={styles.grid}>
            {packages.map((pkg, i) => {
              const id       = pkg.slug || pkg.id || pkg._id
              const price    = formatPrice(pkg.priceValue, pkg.price)
              const duration = durationLabel(pkg)
              const included = Array.isArray(pkg.highlights) && pkg.highlights.length
                ? pkg.highlights.slice(0, 4)
                : DEFAULT_INCLUSIONS
              const location = Array.isArray(pkg.destinations) && pkg.destinations.length
                ? pkg.destinations.join(' · ')
                : pkg.category

              return (
                <motion.article
                  key={id}
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.6, delay: (i % 4) * 0.08, ease: [0.33, 1, 0.68, 1] }}
                  className={styles.card}
                >
                  <div className={styles.imgWrap} onClick={() => navigate(`/package-details/${id}`)}>
                    <img
                      src={pkg.image || FALLBACK_IMAGE}
                      alt={pkg.title}
                      loading="lazy"
                      className={styles.img}
                    />
                    {duration && <span className={styles.duration}>{duration}</span>}
                  </div>

                  <div className={styles.body}>
                    {location && <p className={styles.location}>{location}</p>}
                    <h3 className={styles.title} onClick={() => navigate(`/package-details/${id}`)}>
                      {pkg.title}
                    </h3>

                    {price && (
                      <div className={styles.price}>
                        <span className={styles.priceValue}>{price}</span>
                        <span className={styles.priceUnit}>/ person</span>
                      </div>
                    )}

                    <div className={styles.inclusions}>
                      {included.map((item, j) => (
                        <span key={j} className={styles.inclusion}>
                          <span className={styles.tick}>✓</span> {item}
                        </span>
                      ))}
                    </div>

                    <div className={styles.actions}>
                      <button onClick={() => navigate(`/package-details/${id}`)} className={styles.viewBtn}>
                        View Package {ARROW}
                      </button>
                      <button
                        onClick={() => openWhatsApp(pkg.title)}
                        className={styles.waBtn}
                        title="Ask about this holiday on WhatsApp"
                        aria-label={`Ask about ${pkg.title} on WhatsApp`}
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d={WA_PATH} /></svg>
                      </button>
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
