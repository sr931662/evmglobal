import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import styles from './DestinationCard.module.css'

const ARROW = (
  <svg style={{width:'1.25rem',height:'1.25rem'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/>
  </svg>
)

export default function DestinationCard({ dest, index }) {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 1.2, delay: (index % 4) * 0.12, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8, transition: { duration: 0.4, ease: [0.33, 1, 0.68, 1] } }}
      onClick={() => navigate(`/packages?destination=${encodeURIComponent(dest.name)}`)}
      className={styles.card}
    >
      <motion.img
        src={dest.image}
        alt={dest.name}
        className={styles.img}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
      />
      <div className={`${styles.vignette} card-vignette`} />
      <div className={`${styles.arrow} glass`}>{ARROW}</div>
      <div className={styles.info}>
        <span className={styles.region}>{dest.region}</span>
        <h3 className={styles.name}>{dest.name}</h3>
        <p className={styles.country}>{dest.country}</p>
      </div>
    </motion.div>
  )
}
