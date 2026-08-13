import { motion } from 'framer-motion'
import styles from './EMVDifference.module.css'

const POINTS = [
  { num: '01', title: 'One Point of Contact',  desc: 'No jumping between different agents. One expert owns your trip end to end.' },
  { num: '02', title: 'Personalised Planning',  desc: 'Your itinerary is built around your preferences — not pulled off a shelf.' },
  { num: '03', title: 'Transparent Options',    desc: 'You always understand what you are paying for, before you pay for it.' },
  { num: '04', title: 'Dedicated Support',      desc: 'We are there before and during your journey, in whichever time zone you land.' },
]

export default function EMVDifference() {
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
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowLine} /> Travel Made Easier
          </span>
          <h2 className={styles.heading}>The Ease My Vacations Difference</h2>
          <p className={styles.sub}>
            We don&rsquo;t compete on price alone. We compete on how the whole thing feels — from the
            first conversation to the day you get home.
          </p>
        </motion.div>

        <div className={styles.grid}>
          {POINTS.map((point, i) => (
            <motion.div
              key={point.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.33, 1, 0.68, 1] }}
              className={styles.item}
            >
              <span className={styles.num}>{point.num}</span>
              <h3 className={styles.title}>{point.title}</h3>
              <p className={styles.desc}>{point.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
