import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../services/api'
import { formatPriceCompact } from '../../../utils/currency'
import styles from './DestinationsFeatured.module.css'

const FALLBACK = [
  { id: 1, name: 'Thailand',    startingPrice: '₹38k',  region: 'Asia',        image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&q=80&w=800' },
  { id: 2, name: 'Dubai',       startingPrice: '₹65k',  region: 'Middle East', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=800' },
  { id: 3, name: 'Vietnam',     startingPrice: '₹42k',  region: 'Asia',        image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=800' },
  { id: 4, name: 'Europe',      startingPrice: '₹1.2L', region: 'Europe',      image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=800' },
  { id: 5, name: 'Bali',        startingPrice: '₹45k',  region: 'Asia',        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=800' },
  { id: 6, name: 'Maldives',    startingPrice: '₹85k',  region: 'Asia',        image: 'https://images.unsplash.com/photo-1516815231560-8f41ec531527?auto=format&fit=crop&q=80&w=800' },
]

const ARROW = (
  <svg style={{width:'1rem',height:'1rem'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
)

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function DestinationsFeatured() {
  const navigate = useNavigate()
  const [featured, setFeatured] = useState(FALLBACK)

  useEffect(() => {
    Promise.all([api.getDestinations(), api.getPackages({ limit: 200 })])
      .then(([destData, pkgData]) => {
        const dests = Array.isArray(destData) ? destData : []
        if (dests.length === 0) return
        const pkgs = Array.isArray(pkgData?.packages) ? pkgData.packages : (Array.isArray(pkgData) ? pkgData : [])
        // Build a map: destName → lowest priceValue
        const priceMap = {}
        pkgs.forEach(p => {
          const price = p.priceValue || 0
          if (!price) return
          const targets = Array.isArray(p.destinations) ? p.destinations : []
          targets.forEach(name => {
            if (!priceMap[name] || price < priceMap[name]) priceMap[name] = price
          })
        })
        const shuffled = shuffle(dests)
        setFeatured(shuffled.slice(0, 6).map(d => ({
          id:            d.id || d._id,
          name:          d.name,
          region:        d.region,
          image:         d.image,
          // Admin-set price takes priority; fall back to lowest package price
          startingPrice: d.startingPrice || formatPriceCompact(priceMap[d.name]),
        })))
      })
      .catch(() => {})
  }, [])

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
          className={styles.header}
        >
          <div>
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowLine} /> Destinations
            </span>
            <h2 className={styles.heading}>
              Where Will You<br />Go Next?
            </h2>
          </div>
          <button onClick={() => navigate('/destinations')} className={styles.allBtn}>
            Explore All Destinations {ARROW}
          </button>
        </motion.div>

        <div className={styles.grid}>
          {featured.map((dest, i) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 1, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8, transition: { duration: 0.4, ease: [0.33, 1, 0.68, 1] } }}
              onClick={() => navigate(`/packages?destination=${encodeURIComponent(dest.name)}`)}
              className={styles.card}
            >
              <motion.img
                src={dest.image}
                alt={dest.name}
                className={styles.cardImg}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              />
              <div className={`${styles.cardVignette} card-vignette`} />
              <div className={`${styles.cardArrow} glass`}>
                {ARROW}
              </div>
              <div className={styles.cardInfo}>
                <span className={styles.cardRegion}>{dest.region}</span>
                <h3 className={styles.cardName}>{dest.name}</h3>
                {dest.startingPrice && <p className={styles.cardPrice}>From {dest.startingPrice}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
