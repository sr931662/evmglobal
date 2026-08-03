import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import styles from './FAQSection.module.css'

const FAQS = [
  {
    q: 'How does the trip planning process work?',
    a: 'Share your travel dream with us — over a call, WhatsApp, or our inquiry form. Your dedicated concierge puts together a bespoke itinerary within 24 hours, which you can refine until it feels exactly right.',
  },
  {
    q: 'Can I get a fully customised itinerary?',
    a: 'Always. Every EMV trip is built from scratch around your pace, budget, and preferences — we do not sell fixed, one-size-fits-all packages.',
  },
  {
    q: 'What is your cancellation and refund policy?',
    a: (
      <>
        Cancellation terms vary by supplier and how close to departure you cancel. Full details are on our{' '}
        <Link to="/cancellation-policy" className={styles.inlineLink}>Cancellation Policy</Link> page.
      </>
    ),
  },
  {
    q: 'Do you help with visas and travel documentation?',
    a: 'Yes — our concierge team guides you through visa requirements, documentation, and processing timelines for your destination as part of every booking.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit/debit cards, UPI, and net banking through a secure, encrypted checkout. Payment plans are available for larger bookings.',
  },
  {
    q: 'Is support really available 24/7 during my trip?',
    a: 'Yes. From the moment you depart to the moment you return, your concierge is one call or WhatsApp message away — day or night.',
  },
]

export default function FAQSection() {
  const [open, setOpen] = useState(0)

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
            <span className={styles.eyebrowLine} /> Good to Know
          </span>
          <h2 className={styles.heading}>Frequently asked questions.</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.33, 1, 0.68, 1] }}
          className={styles.list}
        >
          {FAQS.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={item.q} className={styles.item}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className={styles.question}
                  aria-expanded={isOpen}
                >
                  <span>{item.q}</span>
                  <span className={`${styles.icon} ${isOpen ? styles.iconOpen : ''}`}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                {isOpen && (
                  <div className={styles.answer}>
                    <p>{item.a}</p>
                  </div>
                )}
              </div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
