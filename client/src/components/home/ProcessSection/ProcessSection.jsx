import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import styles from './ProcessSection.module.css'

const steps = [
  { num: '01', title: 'Tell Us Your Dream',    desc: 'Share your destination, dates, travellers and preferences.' },
  { num: '02', title: 'We Build Your Journey', desc: 'Our travel experts curate an itinerary around you.' },
  { num: '03', title: 'Refine & Confirm',      desc: 'Make changes until everything feels right.' },
  { num: '04', title: 'Travel With Confidence',desc: 'Enjoy dedicated assistance throughout your journey.' },
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
          <h2 className={styles.heading}>Your Holiday. Your Way.</h2>
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

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
          className={styles.ctaRow}
        >
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-travel-quiz'))}
            className={styles.ctaBtn}
          >
            Start Planning
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </motion.div>
      </div>
    </section>
  )
}
