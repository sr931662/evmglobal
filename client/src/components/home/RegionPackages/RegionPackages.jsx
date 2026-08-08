import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../services/api'
import { formatPrice } from '../../../utils/currency'
import styles from './RegionPackages.module.css'

const REGIONS = [
  { key: 'Asia',        label: 'Asia',        blurb: 'Beaches, temples and street food across the East.' },
  { key: 'Europe',      label: 'Europe',      blurb: 'Alpine trails, old towns and coastal escapes.' },
  { key: 'Middle East', label: 'Middle East', blurb: 'Desert luxury, skylines and heritage souks.' },
]

// Fallback mapping for destinations that aren't in the CMS yet.
const REGION_KEYWORDS = {
  Asia: ['india','thailand','vietnam','bali','indonesia','singapore','malaysia','japan','kashmir','sikkim','nepal','bhutan','sri lanka','maldives','cambodia','philippines','china','hong kong','korea','goa','kerala','andaman','ladakh','rajasthan','shimla','manali','darjeeling','bangkok','phuket','krabi','pattaya','hanoi','danang','ubud','tokyo','kyoto','dubai'],
  Europe: ['europe','switzerland','swiss','france','paris','italy','rome','spain','greece','santorini','germany','austria','netherlands','amsterdam','portugal','iceland','norway','london','united kingdom','uk','scotland','prague','budapest','croatia','turkey'],
  'Middle East': ['dubai','uae','abu dhabi','qatar','doha','oman','muscat','saudi','jordan','israel','bahrain','kuwait'],
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1000'

const ARROW = (
  <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
)

function matchRegion(pkg, destRegionMap) {
  const names = Array.isArray(pkg.destinations) ? pkg.destinations : []

  for (const name of names) {
    const mapped = destRegionMap[(name || '').toLowerCase().trim()]
    if (mapped) return mapped
  }

  const haystack = [...names, pkg.title, pkg.location].filter(Boolean).join(' ').toLowerCase()
  for (const region of REGIONS) {
    if (REGION_KEYWORDS[region.key].some(kw => haystack.includes(kw))) return region.key
  }
  return null
}

export default function RegionPackages() {
  const navigate = useNavigate()
  const [byRegion, setByRegion] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getPackages({ limit: 200 }), api.getDestinations()])
      .then(([pkgData, destData]) => {
        const pkgs = Array.isArray(pkgData?.packages) ? pkgData.packages
          : (Array.isArray(pkgData) ? pkgData : [])
        const dests = Array.isArray(destData) ? destData : []

        const destRegionMap = {}
        dests.forEach(d => {
          if (d.name && d.region) destRegionMap[d.name.toLowerCase().trim()] = d.region
        })

        const grouped = {}
        pkgs.forEach(pkg => {
          const region = matchRegion(pkg, destRegionMap)
          if (!region) return
          if (!grouped[region]) grouped[region] = []
          if (grouped[region].length < 8) grouped[region].push(pkg)
        })
        setByRegion(grouped)
      })
      .catch(() => setByRegion({}))
      .finally(() => setLoading(false))
  }, [])

  const visibleRegions = REGIONS.filter(r => (byRegion[r.key] || []).length > 0)

  if (!loading && visibleRegions.length === 0) return null

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
              <span className={styles.eyebrowLine} /> Holiday Packages
            </span>
            <h2 className={styles.heading}>Browse by region</h2>
          </div>
          <button onClick={() => navigate('/packages')} className={styles.allBtn}>
            All Holidays {ARROW}
          </button>
        </motion.div>

        {loading ? (
          <div className={styles.skeletonRow}>
            {[0, 1, 2, 3].map(i => <div key={i} className={styles.skeleton} />)}
          </div>
        ) : (
          visibleRegions.map((region, rowIndex) => (
            <div key={region.key} className={styles.row}>
              <div className={styles.rowHead}>
                <div>
                  <h3 className={styles.rowTitle}>{region.label}</h3>
                  <p className={styles.rowBlurb}>{region.blurb}</p>
                </div>
                <button onClick={() => navigate('/packages')} className={styles.rowLink}>
                  View all {ARROW}
                </button>
              </div>

              <div className={styles.track}>
                {byRegion[region.key].map((pkg, i) => (
                  <motion.article
                    key={pkg.id || pkg._id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.1 }}
                    transition={{ duration: 0.5, delay: Math.min(i, 4) * 0.06, ease: [0.33, 1, 0.68, 1] }}
                    className={styles.card}
                    onClick={() => navigate(`/package-details/${pkg.slug || pkg.id || pkg._id}`)}
                  >
                    <div className={styles.cardImgWrap}>
                      <img
                        src={pkg.image || FALLBACK_IMAGE}
                        alt={pkg.title}
                        loading="lazy"
                        className={styles.cardImg}
                      />
                      {pkg.nights ? <span className={styles.nights}>{pkg.nights} Nights</span> : null}
                    </div>
                    <div className={styles.cardBody}>
                      <p className={styles.cardLocation}>
                        {Array.isArray(pkg.destinations) && pkg.destinations.length
                          ? pkg.destinations.join(' · ')
                          : region.label}
                      </p>
                      <h4 className={styles.cardTitle}>{pkg.title}</h4>
                      {formatPrice(pkg.priceValue, pkg.price) && (
                        <p className={styles.cardPrice}>
                          <span className={styles.cardPriceLabel}>From</span> {formatPrice(pkg.priceValue, pkg.price)}
                        </p>
                      )}
                    </div>
                  </motion.article>
                ))}
              </div>

              {/* Advertisement slot — one banner after the first region row */}
              {rowIndex === 0 && (
                <div className={styles.adSlot} data-ad-slot="home-region-packages">
                  <span className={styles.adLabel}>Advertisement</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  )
}
