import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { api } from '../../../services/api'
import styles from './FAQSection.module.css'

// Rendered until the API responds, and kept if it fails — the section never goes blank.
const FALLBACK = [
  {
    q: 'How does Ease My Vacations plan customised holidays?',
    a: 'Share your destination, dates, travellers and preferences — over a call, WhatsApp, or our holiday planner. Your dedicated travel expert puts together an itinerary within 24 hours, which you can refine until it feels exactly right.',
  },
  {
    q: 'Can I customize an existing package?',
    a: 'Always. Every package on our site is a starting point — hotels, duration, sightseeing and transfers can all be reshaped around your pace and budget.',
  },
  {
    q: 'Do you provide visa assistance?',
    a: 'Yes — our team guides you through visa requirements, documentation, and processing timelines for your destination as part of every booking.',
  },
  {
    q: 'Can I book international and domestic holidays?',
    a: 'Both. We plan holidays across India as well as international destinations including Thailand, Dubai, Vietnam, Bali, the Maldives, Singapore, Georgia and Europe.',
  },
  {
    q: 'Do you provide airport transfers?',
    a: 'Yes. Airport pickups and drops are included in most of our packages, and can be added to any customised itinerary.',
  },
  {
    q: 'Can I speak to a travel expert before booking?',
    a: 'Of course. You get one dedicated point of contact from the first conversation onward — reachable on call or WhatsApp, before and during your trip.',
  },
  {
    q: 'Do you provide travel insurance?',
    a: 'Yes, we arrange travel insurance through our partners so your trip, health and belongings are covered while you are away.',
  },
  {
    q: 'How do I request a holiday quote?',
    a: 'Use the holiday planner on this page, message us on WhatsApp, or send an enquiry — you will get a personalised quote back within 24 hours. Cancellation terms are on our',
    linkLabel: 'Cancellation Policy',
    linkTo: '/cancellation-policy',
  },
]

function Answer({ item }) {
  if (!item.linkLabel || !item.linkTo) return <p>{item.a}</p>
  return (
    <p>
      {item.a}{' '}
      <Link to={item.linkTo} className={styles.inlineLink}>{item.linkLabel}</Link>
    </p>
  )
}

export default function FAQSection() {
  const [open, setOpen] = useState(0)
  const [faqs, setFaqs] = useState(FALLBACK)

  useEffect(() => {
    api.getHomeContent({ section: 'faq', status: 'active' })
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) return
        setFaqs(data.map(item => ({
          q:         item.question,
          a:         item.answer,
          linkLabel: item.linkLabel,
          linkTo:    item.linkTo,
        })))
      })
      .catch(() => {})
  }, [])

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
          {faqs.map((item, i) => {
            const isOpen = open === i
            return (
              <div key={item.q || i} className={styles.item}>
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
                    <Answer item={item} />
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
