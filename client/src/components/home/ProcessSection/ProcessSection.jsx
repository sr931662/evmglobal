import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import styles from './ProcessSection.module.css'

const steps = [
  { num: '01', title: 'Connect', desc: 'Share your travel dreams with our dedicated concierge. A 15-minute consultation — phone or WhatsApp.' },
  { num: '02', title: 'Curate',  desc: 'We design a bespoke itinerary with handpicked stays, experiences and logistics tailored to you.' },
  { num: '03', title: 'Depart', desc: 'Travel with confidence. Your concierge is available 24/7 throughout the journey.' },
]

export default function ProcessSection() {
  const sectionRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start center', 'center center'] })
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section ref={sectionRef} id="process-section" className={styles.section}>
      <div className={styles.inner}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
          className={styles.header}
        >
          <span className={styles.eyebrow}>How It Works</span>
          <h2 className={styles.heading}>The EMV Journey.</h2>
        </motion.div>

        <div className={styles.relative}>
          <div className={styles.progressLine}>
            <motion.div className={styles.progressFill} style={{ scaleX }} />
          </div>

          <div className={styles.grid}>
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: i * 0.12, ease: [0.33, 1, 0.68, 1] }}
                className={styles.step}
              >
                <div className={styles.circle}>{step.num}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
