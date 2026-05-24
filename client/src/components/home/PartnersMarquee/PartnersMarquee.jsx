import { motion } from 'framer-motion'
import styles from './PartnersMarquee.module.css'

const PARTNERS = ['Emirates', 'IATA', 'Taj Resorts', 'Marriott', 'Four Seasons', 'Hyatt', 'Accor', 'InterContinental']

export default function PartnersMarquee() {
  const items = [...PARTNERS, ...PARTNERS]

  return (
    <div className={styles.section}>
      <p className={styles.label}>Partnered with Excellence</p>
      <div className={styles.maskWrap}>
        <motion.div
          className={styles.track}
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
          whileHover={{ animationPlayState: 'paused' }}
          style={{ opacity: 0.4 }}
          whileInView={{ opacity: 0.4 }}
          onHoverStart={e => e.target.style.animationPlayState = 'paused'}
        >
          {items.map((p, i) => (
            <span key={i} className={styles.item}>{p}</span>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
