import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import DestinationCard from '../../components/destinations/DestinationCard/DestinationCard'
import { api } from '../../services/api'
import { openWhatsApp } from '../../utils/whatsapp'
import { usePageMeta } from '../../hooks/usePageMeta'
import styles from './Destinations.module.css'

const REGIONS = ['All', 'Europe', 'Asia', 'Middle East', 'Africa', 'Oceania', 'Americas']

function SegmentHeader({ eyebrow, title, count }) {
  return (
    <div className={styles.segmentHead}>
      <div>
        <span className={styles.segmentEyebrow}>{eyebrow}</span>
        <h2 className={styles.segmentTitle}>{title}</h2>
      </div>
      {count > 0 && (
        <span className={styles.segmentCount}>{count} destination{count !== 1 ? 's' : ''}</span>
      )}
    </div>
  )
}

export default function Destinations() {
  const [allDestinations, setAllDestinations] = useState([])
  const [priceMap,        setPriceMap]        = useState({})
  const [loading,         setLoading]         = useState(true)
  const [error,           setError]           = useState('')
  const [intlRegion,      setIntlRegion]      = useState('All')

  usePageMeta(
    'Global Destinations | Ease My Vacations',
    'Explore premium travel destinations handpicked by our concierge team. Discover unique experiences across Europe, Asia, Middle East, Africa, and Oceania.',
    {
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=2800',
      url: typeof window !== 'undefined' ? `${window.location.origin}/destinations` : '',
      type: 'website'
    }
  )

  // Fetch all destinations once
  useEffect(() => {
    setLoading(true); setError('')
    api.getDestinations({})
      .then(data => setAllDestinations(Array.isArray(data) ? data : []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // Fetch packages once to compute price ranges per destination
  useEffect(() => {
    api.getPackages({ status: 'Active', limit: 200 })
      .then(data => {
        const pkgs = Array.isArray(data) ? data : (data.packages || [])
        const map = {}
        pkgs.forEach(pkg => {
          const price = pkg.priceValue || 0
          if (!price) return
          const dests = Array.isArray(pkg.destinations) ? pkg.destinations : []
          dests.forEach(destName => {
            if (!map[destName]) map[destName] = { min: price, max: price, count: 0 }
            map[destName].min   = Math.min(map[destName].min, price)
            map[destName].max   = Math.max(map[destName].max, price)
            map[destName].count += 1
          })
        })
        setPriceMap(map)
      })
      .catch(() => {})
  }, [])

  // Split domestic vs international
  const domestic = useMemo(
    () => allDestinations.filter(d => d.country?.toLowerCase() === 'india'),
    [allDestinations]
  )

  const international = useMemo(() => {
    const intl = allDestinations.filter(d => d.country?.toLowerCase() !== 'india')
    if (intlRegion === 'All') return intl
    return intl.filter(d => d.region === intlRegion)
  }, [allDestinations, intlRegion])

  function renderCard(dest, i) {
    const pm = priceMap[dest.name]
    return (
      <DestinationCard
        key={dest.id || dest._id}
        dest={dest}
        index={i}
        priceMin={pm?.min}
        priceMax={pm?.max}
        packageCount={pm?.count}
      />
    )
  }

  return (
    <div className={styles.page}>

      {/* Page header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerInner}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.33,1,0.68,1] }}>
            <span className={styles.eyebrow}>Portfolio</span>
            <h1 className={styles.h1}>Global Canvas</h1>
          </motion.div>
        </div>
      </div>

      {loading ? (
        <div className={styles.spinnerWrap}><div className={styles.spinnerCircle} /></div>
      ) : error ? (
        <div className={styles.errMsg}>{error}</div>
      ) : (
        <>
          {/* ── Domestic Segment ── */}
          {domestic.length > 0 && (
            <section className={styles.segment}>
              <div className={styles.segmentInner}>
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, ease: [0.33,1,0.68,1] }}
                >
                  <SegmentHeader
                    eyebrow="Explore India"
                    title="Domestic Destinations"
                    count={domestic.length}
                  />
                </motion.div>
                <div className={styles.grid}>
                  {domestic.map((dest, i) => renderCard(dest, i))}
                </div>
              </div>
            </section>
          )}

          {/* ── Divider ── */}
          {domestic.length > 0 && international.length > 0 && (
            <div className={styles.segmentDivider} />
          )}

          {/* ── International Segment ── */}
          <section className={styles.segment}>
            <div className={styles.segmentInner}>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: [0.33,1,0.68,1] }}
              >
                <div className={styles.intlHead}>
                  <SegmentHeader
                    eyebrow="Beyond Borders"
                    title="International Destinations"
                    count={international.length}
                  />
                  {/* Region filter for international only */}
                  <div className={styles.filters}>
                    {REGIONS.map(r => (
                      <button
                        key={r}
                        onClick={() => setIntlRegion(r)}
                        className={`${styles.filterBtn} ${intlRegion === r ? styles.filterActive : styles.filterInactive}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {international.length === 0 ? (
                <div className={styles.emptyMsg}>No destinations found in this region.</div>
              ) : (
                <div className={styles.grid}>
                  {international.map((dest, i) => renderCard(dest, i))}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* CTA */}
      <div className={styles.ctaWrap}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.33, 1, 0.68, 1] }}
          className={styles.ctaCard}
        >
          <div>
            <span className={styles.ctaCopyEyebrow}>Bespoke Requests</span>
            <h3 className={styles.ctaHeading}>Can't find your destination?</h3>
            <p className={styles.ctaDesc}>Our concierges design curations across 50+ countries globally.</p>
          </div>
          <button onClick={() => openWhatsApp('New Destination Inquiry')} className={styles.ctaBtn}>
            Connect Now
          </button>
        </motion.div>
      </div>

    </div>
  )
}
