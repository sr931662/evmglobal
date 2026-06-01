import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import DestinationCard from '../../components/destinations/DestinationCard/DestinationCard'
import { api } from '../../services/api'
import { openWhatsApp } from '../../utils/whatsapp'
import { usePageMeta } from '../../hooks/usePageMeta'
import styles from './Destinations.module.css'

const REGIONS = ['All Regions', 'Europe', 'Asia', 'Middle East', 'Africa', 'Oceania']

export default function Destinations() {
  const [activeRegion,  setActiveRegion]  = useState('All Regions')
  const [destinations,  setDestinations]  = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState('')

  // Set meta tags for social sharing
  usePageMeta(
    'Global Destinations | EMV Global',
    'Explore premium travel destinations handpicked by our concierge team. Discover unique experiences across Europe, Asia, Middle East, Africa, and Oceania.',
    {
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=2800',
      url: typeof window !== 'undefined' ? `${window.location.origin}/destinations` : '',
      type: 'website'
    }
  )

  useEffect(() => {
    setLoading(true); setError('')
    const params = activeRegion !== 'All Regions' ? { region: activeRegion } : {}
    api.getDestinations(params)
      .then(data => setDestinations(Array.isArray(data) ? data : []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [activeRegion])

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerInner}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.33,1,0.68,1] }}>
            <span className={styles.eyebrow}>Portfolio</span>
            <h1 className={styles.h1}>Global Canvas</h1>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: [0.33,1,0.68,1] }} className={styles.filters}>
            {REGIONS.map(r => (
              <button
                key={r}
                onClick={() => setActiveRegion(r)}
                className={`${styles.filterBtn} ${activeRegion === r ? styles.filterActive : styles.filterInactive}`}
              >
                {r}
              </button>
            ))}
          </motion.div>
        </div>
      </div>

      <div className={styles.gridWrap}>
        {loading ? (
          <div className={styles.spinner}><div className={styles.spinnerCircle} /></div>
        ) : error ? (
          <div className={styles.errMsg}>{error}</div>
        ) : destinations.length === 0 ? (
          <div className={styles.emptyMsg}>No destinations found in this region.</div>
        ) : (
          <div className={styles.grid}>
            {destinations.map((dest, i) => (
              <DestinationCard key={dest.id || dest._id} dest={dest} index={i} />
            ))}
          </div>
        )}
      </div>

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
