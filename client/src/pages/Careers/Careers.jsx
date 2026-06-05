import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../../services/api'

const CAREERS_EMAIL = 'info@easemyvacationsglobal.com'
import styles from './Careers.module.css'

function RichText({ text, className }) {
  if (!text) return null
  const lines = text.split('\n')
  const elements = []
  let listItems = []

  const flushList = () => {
    if (listItems.length) {
      elements.push(
        <ul key={`ul-${elements.length}`} className={styles.descList}>
          {listItems.map((li, i) => <li key={i} className={styles.descListItem}>{li}</li>)}
        </ul>
      )
      listItems = []
    }
  }

  lines.forEach((line, i) => {
    if (line.startsWith('## ')) {
      flushList()
      elements.push(<h4 key={i} className={styles.descHeading}>{line.slice(3)}</h4>)
    } else if (line.startsWith('# ')) {
      flushList()
      elements.push(<h3 key={i} className={styles.descHeadingLg}>{line.slice(2)}</h3>)
    } else if (line.startsWith('- ') || line.startsWith('• ')) {
      listItems.push(line.slice(2))
    } else if (line.trim() === '') {
      flushList()
    } else {
      flushList()
      elements.push(<p key={i} className={styles.descPara}>{line}</p>)
    }
  })
  flushList()

  return <div className={className}>{elements}</div>
}

const values = [
  { icon: '✦', title: 'People First', desc: 'Our team is our greatest asset. We invest in growth, wellbeing, and creating an environment where everyone thrives.' },
  { icon: '◎', title: 'Ownership Mindset', desc: 'Every team member takes full ownership of their work — we move fast, iterate, and celebrate wins together.' },
  { icon: '◈', title: 'Passion for Travel', desc: 'We hire people who love travel as much as our clients do. Genuine passion translates into extraordinary service.' },
  { icon: '◇', title: 'Remote-Friendly', desc: 'Flexible work arrangements with regular team meetups — because great work can happen anywhere.' },
]

const deptStyle = {
  'Sales':            { background: '#eff6ff', color: '#1d4ed8' },
  'Marketing':        { background: '#fdf2f8', color: '#9d174d' },
  'Customer Support': { background: '#f0fdf4', color: '#15803d' },
  'Technology':       { background: '#faf5ff', color: '#7e22ce' },
  'Operations':       { background: '#fff7ed', color: '#c2410c' },
  'Management':       { background: '#f3f4f6', color: '#374151' },
}

const typeStyle = {
  'Full-time': { background: '#eff6ff', color: '#1d4ed8' },
  'Part-time': { background: '#faf5ff', color: '#7e22ce' },
  'Remote':    { background: '#f0fdf4', color: '#15803d' },
  'Hybrid':    { background: '#fff7ed', color: '#c2410c' },
}

export default function Careers() {
  const [openings,    setOpenings]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [expandedId,  setExpandedId]  = useState(null)

  useEffect(() => {
    api.getCareers({ status: 'open' })
      .then(data => setOpenings(Array.isArray(data) ? data : (Array.isArray(data?.careers) ? data.careers : [])))
      .catch(() => setOpenings([]))
      .finally(() => setLoading(false))
  }, [])

  const applyEmail = (role) => {
    window.location.href = `mailto:${CAREERS_EMAIL}?subject=${encodeURIComponent(`Application for ${role} — EMV Global`)}&body=${encodeURIComponent(`Hi,\n\nI would like to apply for the ${role} position at EMV Global.\n\nPlease find my details below:\n\n`)}`
  }

  return (
    <div className={styles.page}>

      {/* Hero */}
      <section className={styles.heroSection}>
        <div className={styles.heroBg} />
        <div className={styles.heroInner}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.33, 1, 0.68, 1] }}
            className={styles.heroContent}
          >
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowLine} /> Join Our Team
            </span>
            <h1 className={styles.heroHeading}>
              Build the future<br />of travel with us.
            </h1>
            <p className={styles.heroDesc}>
              We are a fast-growing travel concierge company with a mission to make extraordinary journeys accessible. Join a team that is passionate, driven, and genuinely loves what they do.
            </p>
            <div className={styles.heroStats}>
              {[
                ['🌍', loading ? 'Open Roles' : `${openings.length} Open Role${openings.length !== 1 ? 's' : ''}`],
                ['📍', 'Gurugram & Remote'],
                ['🏆', 'Great Place to Work'],
              ].map(([icon, label]) => (
                <div key={label} className={styles.heroStat}>{icon} {label}</div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className={styles.valuesSection}>
        <div className={styles.inner}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className={styles.sectionHead}
          >
            <h2 className={styles.sectionHeading}>Why EMV Global?</h2>
          </motion.div>
          <div className={styles.valuesGrid}>
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.6 }}
                className={styles.valueCard}
              >
                <span className={styles.valueIcon}>{v.icon}</span>
                <h3 className={styles.valueTitle}>{v.title}</h3>
                <p className={styles.valueDesc}>{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className={styles.positionsSection}>
        <div className={styles.inner}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className={styles.positionsHead}
          >
            <h2 className={styles.positionsHeading}>Open Positions</h2>
            {!loading && (
              <p className={styles.positionsCount}>{openings.length} role{openings.length !== 1 ? 's' : ''} available</p>
            )}
          </motion.div>

          {loading ? (
            <div className={styles.spinner}><div className={styles.spinnerCircle} /></div>
          ) : openings.length === 0 ? (
            <div className={styles.emptyMsg}>No open positions right now. Check back soon!</div>
          ) : (
            <div className={styles.jobList}>
              {openings.map((job, i) => {
                const id       = job._id || job.id
                const isOpen   = expandedId === id
                const toggle   = () => setExpandedId(isOpen ? null : id)
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07, duration: 0.6 }}
                    className={`${styles.jobCard} ${isOpen ? styles.jobCardOpen : ''}`}
                  >
                    {/* Always-visible header row */}
                    <button className={styles.jobHeader} onClick={toggle} aria-expanded={isOpen}>
                      <div className={styles.jobInfo}>
                        <div className={styles.jobBadges}>
                          <span
                            className={styles.jobBadge}
                            style={deptStyle[job.department] || { background: '#f3f4f6', color: '#374151' }}
                          >
                            {job.department}
                          </span>
                          <span
                            className={styles.jobBadge}
                            style={typeStyle[job.type] || { background: '#f3f4f6', color: '#374151' }}
                          >
                            {job.type}
                          </span>
                          <span className={styles.jobLocation}>📍 {job.location}</span>
                        </div>
                        <h3 className={styles.jobTitle}>{job.title}</h3>
                      </div>
                      <div className={styles.jobHeaderRight}>
                        <span className={`${styles.jobChevron} ${isOpen ? styles.jobChevronOpen : ''}`}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </span>
                      </div>
                    </button>

                    {/* Expandable body */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          key="body"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35, ease: [0.33, 1, 0.68, 1] }}
                          className={styles.jobBody}
                          style={{ overflow: 'hidden' }}
                        >
                          <div className={styles.jobBodyInner}>
                            <RichText text={job.description} className={styles.jobDesc} />
                            {job.requirements?.length > 0 && (
                              <div className={styles.reqBlock}>
                                <p className={styles.reqLabel}>Requirements</p>
                                <ul className={styles.reqList}>
                                  {job.requirements.map((r, ri) => (
                                    <li key={ri} className={styles.reqItem}>
                                      <span className={styles.reqCheck}>✓</span> {r}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); applyEmail(job.title) }}
                              className={styles.jobApplyBtn}
                            >
                              Apply via Email <span>→</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.inner}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className={styles.ctaInner}
          >
            <h2 className={styles.ctaHeading}>Don't see your role?</h2>
            <p className={styles.ctaDesc}>We are always looking for talented people. Send us your CV and tell us how you can contribute.</p>
            <button
              onClick={() => { window.location.href = `mailto:${CAREERS_EMAIL}?subject=${encodeURIComponent('Career Enquiry — EMV Global')}&body=${encodeURIComponent('Hi,\n\nI would like to explore career opportunities at EMV Global.\n\n')}` }}
              className={styles.ctaBtn}
            >
              Get in Touch
            </button>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
