import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import PackageCard from '../../components/packages/PackageCard/PackageCard'
import { api } from '../../services/api'
import styles from './Packages.module.css'

const FILTERS = ['All', 'Honeymoon', 'Family', 'Domestic', 'Luxury', 'Wellness']
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1000'

function adaptPackage(pkg) {
  return {
    id:            pkg.id || pkg._id,
    slug:          pkg.slug || pkg.id || pkg._id,
    title:         pkg.title,
    nights:        pkg.nights,
    badge:         pkg.category,
    badgeVariant:  pkg.category === 'Domestic' ? 'dark' : 'brand',
    image:         pkg.image || FALLBACK_IMAGE,
    location:      Array.isArray(pkg.destinations) && pkg.destinations.length
                     ? pkg.destinations.join(', ')
                     : pkg.category,
    pricePerAdult: pkg.price,
    priceLabel:    'Per Adult',
    description:   pkg.description || '',
    amenities:     Array.isArray(pkg.highlights) && pkg.highlights.length
                     ? pkg.highlights.slice(0, 3).map(h => ({ label: h }))
                     : [{ label: 'Accommodation' }, { label: 'Transfers' }, { label: 'Sightseeing' }],
  }
}

export default function Packages() {
  const [searchParams, setSearchParams] = useSearchParams()
  const destinationFilter = searchParams.get('destination') || ''

  const [active,   setActive]   = useState('All')
  const [packages, setPackages] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  const handleCategoryChange = (cat) => {
    setActive(cat)
    if (destinationFilter) setSearchParams({})
  }

  useEffect(() => {
    setLoading(true); setError('')
    const params = { status: 'Active' }
    if (destinationFilter)    { params.destination = destinationFilter }
    else if (active !== 'All') { params.category = active }
    api.getPackages(params)
      .then(data => setPackages(Array.isArray(data) ? data : data.packages || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [active, destinationFilter])

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div className={styles.headerInner}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.33,1,0.68,1] }}>
            <span className={styles.eyebrow}>Collection</span>
            <h1 className={styles.h1}>Curated Journeys</h1>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className={styles.filters}>
            {destinationFilter ? (
              <span className={styles.destFilter}>
                📍 {destinationFilter}
                <button onClick={() => setSearchParams({})} className={styles.clearDestBtn}>✕</button>
              </span>
            ) : (
              FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => handleCategoryChange(f)}
                  className={`${styles.filterBtn} ${active === f ? styles.filterActive : styles.filterInactive}`}
                >
                  {f}
                </button>
              ))
            )}
          </motion.div>
        </div>
      </div>

      <div className={styles.gridWrap}>
        {loading ? (
          <div className={styles.spinner}><div className={styles.spinnerCircle} /></div>
        ) : error ? (
          <div className={styles.errMsg}>{error}</div>
        ) : packages.length === 0 ? (
          <div className={styles.emptyMsg}>
            {destinationFilter ? `No packages found for "${destinationFilter}".` : 'No packages found in this category yet.'}
          </div>
        ) : (
          <div className={styles.grid}>
            {packages.map((pkg, i) => (
              <PackageCard key={pkg.id || pkg._id} pkg={adaptPackage(pkg)} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
