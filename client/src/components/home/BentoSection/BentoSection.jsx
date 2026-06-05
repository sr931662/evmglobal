import { motion } from 'framer-motion'
import { useScrollAnimation, fadeUpStagger, fadeUpChild } from '../../../hooks/useScrollAnimation'
import { useNavigate } from 'react-router-dom'
import styles from './BentoSection.module.css'

const bentoCards = [
  {
    icon: '✦',
    title: '100% Bespoke Itineraries.',
    desc: 'Every trip is crafted from a blank canvas. Your pace, your preferences, your style. We reject the one-size-fits-all approach to travel entirely.',
    cta: true,
    span2: true,
    row2: true,
  },
  { icon: '◎', title: '24/7 Concierge Support.',   desc: 'From your first query to your safe return, a dedicated concierge is available at all hours.', dark: true },
  { icon: '◈', title: 'Absolute Transparency.',     desc: 'No hidden fees, no surprises. Every expense itemised before you pay.' },
  { icon: '◇', title: 'Seamless Logistics.',        desc: 'Flights, hotels, transfers — all coordinated in a single, elegant itinerary.', span2: true },
]

export default function BentoSection() {
  const { ref, controls } = useScrollAnimation()
  const navigate = useNavigate()

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <motion.div
          ref={ref} animate={controls} initial="hidden" variants={fadeUpStagger}
          className={styles.header}
        >
          <div className={styles.headerLeft}>
            <motion.span variants={fadeUpChild} className={styles.eyebrow}>
              <span className={styles.eyebrowLine} /> The Philosophy
            </motion.span>
            <motion.h2 variants={fadeUpChild} className={styles.heading}>
              Artisans of global travel.
            </motion.h2>
            <motion.p variants={fadeUpChild} className={styles.subtitle}>
              We replace algorithms with experts. Every detail is immaculate, from inspiration to your safe return.
            </motion.p>
          </div>
        </motion.div>

        <div className={styles.grid}>
          {bentoCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.8, delay: i * 0.08, ease: [0.33, 1, 0.68, 1] }}
              whileHover={{ y: -8, transition: { duration: 0.4, ease: [0.33, 1, 0.68, 1] } }}
              className={[
                styles.card,
                card.dark  ? styles.cardDark  : styles.cardLight,
                card.span2 ? styles.cardSpan2 : '',
                card.row2  ? styles.cardRow2  : '',
                card.cta   ? styles.cardFullBottom : '',
              ].filter(Boolean).join(' ')}
            >
              {!card.dark && <div className={styles.cardGlow} />}

              <div className={styles.cardContent}>
                <div className={`${styles.icon} ${card.dark ? styles.iconDark : styles.iconLight}`}>
                  {card.icon}
                </div>
                <h3 className={[
                  styles.cardTitle,
                  card.dark ? styles.cardTitleDark : styles.cardTitleLight,
                  card.cta  ? styles.cardTitleFeatured : '',
                ].filter(Boolean).join(' ')}>
                  {card.title}
                </h3>
                <p className={`${styles.cardDesc} ${card.dark ? styles.cardDescDark : styles.cardDescLight}`}>
                  {card.desc}
                </p>
              </div>

              {card.cta && (
                <button onClick={() => navigate('/packages')} className={styles.ctaBtn}>
                  Explore Curations
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
