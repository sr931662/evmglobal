import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import styles from './PackageSections.module.css'

// Only entries we can state truthfully for any destination are hard-coded.
// Destination-specific facts (visa rules, currency, best season) come from the
// matching destination record in the CMS — if it isn't filled in, we say we'll
// confirm it rather than guessing.
function buildEntries(pkg, destinationRecord) {
  const destinations = Array.isArray(pkg?.destinations) ? pkg.destinations.filter(Boolean) : []
  const where = destinations.length ? destinations.join(', ') : 'your destination'

  return [
    {
      q: 'Visa requirements',
      a: destinationRecord?.visaInfo
        || `Entry requirements for ${where} vary by nationality, purpose of travel and length of stay. Our team confirms the current rules for your passport and handles the visa paperwork as part of your booking.`,
    },
    {
      q: 'Currency',
      a: destinationRecord?.currency
        ? `The local currency is ${destinationRecord.currency}. We'll advise on how much to carry and where to exchange before you travel.`
        : `We'll confirm the local currency and how much to carry when we send your quote, along with guidance on cards and cash.`,
    },
    {
      q: 'Best time to travel',
      a: destinationRecord?.bestTime
        || `The best window for ${where} depends on weather, crowds and pricing. Tell us roughly when you're free and your travel expert will recommend the best dates within that period.`,
    },
    {
      q: 'Travel documents',
      a: 'Your passport should generally be valid for at least six months beyond your return date, with blank pages available for stamps. We send a full document checklist once your trip is confirmed.',
    },
    {
      q: 'Cancellation & refunds',
      a: 'Cancellation terms depend on the supplier and how close to departure you cancel. The applicable terms are set out in your quote, and the full policy is available here.',
      linkTo: '/cancellation-policy',
      linkLabel: 'Cancellation Policy',
    },
  ]
}

export default function BeforeYouBook({ pkg, destinationRecord }) {
  const [open, setOpen] = useState(null)
  const entries = buildEntries(pkg, destinationRecord)

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
      className={styles.card}
    >
      <span className={styles.eyebrow}>Important Information</span>
      <h2 className={styles.heading}>Before You Book</h2>

      <div className={styles.accordion}>
        {entries.map((entry, i) => {
          const isOpen = open === i
          return (
            <div key={entry.q} className={styles.accItem}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className={styles.accQuestion}
                aria-expanded={isOpen}
              >
                <span>{entry.q}</span>
                <span className={`${styles.accIcon} ${isOpen ? styles.accIconOpen : ''}`}>
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              {isOpen && (
                <div className={styles.accAnswer}>
                  {entry.a}
                  {entry.linkTo && (
                    <> <Link to={entry.linkTo}>{entry.linkLabel}</Link>.</>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </motion.section>
  )
}
