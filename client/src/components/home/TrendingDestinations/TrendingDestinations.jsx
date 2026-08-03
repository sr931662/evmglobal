import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import styles from './TrendingDestinations.module.css'

const TRENDING = [
  { name: 'Kashmir',  region: 'India',    image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?auto=format&fit=crop&q=80&w=800' },
  { name: 'Sikkim',   region: 'India',    image: 'https://images.unsplash.com/photo-1622308644420-b20142dc993c?auto=format&fit=crop&q=80&w=800' },
  { name: 'Thailand', region: 'Asia',     image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&q=80&w=800' },
  { name: 'Vietnam',  region: 'Asia',     image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=800' },
]

const ARROW = (
  <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
)

export default function TrendingDestinations() {
  const navigate = useNavigate()

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
              <span className={styles.eyebrowLine} /> Trending Now
            </span>
            <h2 className={styles.heading}>Trending Destinations</h2>
          </div>
          <button onClick={() => navigate('/destinations')} className={styles.allBtn}>
            All Destinations {ARROW}
          </button>
        </motion.div>

        <div className={styles.grid}>
          {TRENDING.map((dest, i) => (
            <motion.div
              key={dest.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8, transition: { duration: 0.4, ease: [0.33, 1, 0.68, 1] } }}
              onClick={() => navigate(`/packages?destination=${encodeURIComponent(dest.name)}`)}
              className={styles.card}
            >
              <motion.img
                src={dest.image}
                alt={dest.name}
                loading="lazy"
                className={styles.cardImg}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              />
              <div className={`${styles.cardVignette} card-vignette`} />
              <div className={`${styles.cardArrow} glass`}>{ARROW}</div>
              <div className={styles.cardInfo}>
                <span className={styles.cardRegion}>{dest.region}</span>
                <h3 className={styles.cardName}>{dest.name}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
