import { motion } from 'framer-motion'
import { openWhatsApp } from '../../../utils/whatsapp'
import styles from './HomeCTA.module.css'

const WA_PATH = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.112.555 4.094 1.523 5.813L0 24l6.336-1.499A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.946 0-3.77-.51-5.338-1.4l-.382-.225-3.961.937.997-3.868-.249-.401A9.942 9.942 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z'

export default function HomeCTA() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.33, 1, 0.68, 1] }}
          className={styles.card}
        >
          <div className={styles.glow} />
          <div className={styles.copy}>
            <span className={styles.eyebrow}>Begin Your Journey</span>
            <h2 className={styles.heading}>Ready to Plan Your Next Escape?</h2>
            <p className={styles.desc}>
              Tell us where you want to go.<br />We&rsquo;ll take care of the rest.
            </p>
          </div>

          <div className={styles.actions}>
            <motion.button
              onClick={() => window.dispatchEvent(new CustomEvent('open-travel-quiz'))}
              className={styles.primaryBtn}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Plan My Trip
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className={styles.arrow}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </motion.button>

            <motion.button
              onClick={() => openWhatsApp()}
              className={styles.waBtn}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className={styles.waIcon}>
                <path d={WA_PATH} />
              </svg>
              WhatsApp a Travel Expert
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
