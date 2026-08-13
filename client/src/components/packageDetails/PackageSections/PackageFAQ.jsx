import { useState } from 'react'
import { motion } from 'framer-motion'
import styles from './PackageSections.module.css'

export default function PackageFAQ({ faqs, where }) {
  const [open, setOpen] = useState(0)
  if (!faqs || faqs.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
      className={styles.card}
    >
      <span className={styles.eyebrow}>Good to Know</span>
      <h2 className={styles.heading}>{where ? `${where} Travel FAQs` : 'Frequently Asked Questions'}</h2>

      <div className={styles.accordion}>
        {faqs.map((faq, i) => {
          const isOpen = open === i
          return (
            <div key={faq.q} className={styles.accItem}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className={styles.accQuestion}
                aria-expanded={isOpen}
              >
                <span>{faq.q}</span>
                <span className={`${styles.accIcon} ${isOpen ? styles.accIconOpen : ''}`}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              {isOpen && <div className={styles.accAnswer}>{faq.a}</div>}
            </div>
          )
        })}
      </div>
    </motion.section>
  )
}
