import { motion } from 'framer-motion'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import styles from './LegalLayout.module.css'

const LEGAL_LINKS = [
  { label: 'Privacy Policy',              to: '/privacy-policy' },
  { label: 'Cookie Policy',               to: '/cookie-policy' },
  { label: 'Terms of Service',            to: '/terms-of-service' },
  { label: 'User Agreement',              to: '/user-agreement' },
  { label: 'Data Processing Agreement',   to: '/data-processing-agreement' },
  { label: 'Cancellation & Refund Policy', to: '/cancellation-policy' },
]

export default function LegalLayout({ title, subtitle, children }) {
  const navigate  = useNavigate()
  const { pathname } = useLocation()

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroBgDecor} />
        <div className={styles.heroInner}>
          <button onClick={() => navigate(-1)} className={styles.backBtn}>
            <svg className={styles.backBtnIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back
          </button>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowLine} /> Legal
            </span>
            <h1 className={styles.heroTitle}>{title}</h1>
            <p className={styles.heroSubtitle}>{subtitle}</p>
          </motion.div>
        </div>
      </div>

      <div className={styles.contentWrap}>
        <div className={styles.contentGrid}>
          <aside className={styles.sidebar}>
            <p className={styles.sidebarLabel}>Legal Documents</p>
            <nav className={styles.sidebarNav}>
              {LEGAL_LINKS.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`${styles.sidebarLink} ${pathname === link.to ? styles.sidebarLinkActive : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </aside>

          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className={styles.article}
          >
            {children}
          </motion.article>
        </div>
      </div>
    </div>
  )
}

export function Section({ title }) {
  return <h2 className={styles.section}>{title}</h2>
}

export function Sub({ title }) {
  return <h3 className={styles.sub}>{title}</h3>
}

export function P({ children }) {
  return <p className={styles.para}>{children}</p>
}

export function Ul({ items }) {
  return (
    <ul className={styles.list}>
      {items.map((item, i) => (
        <li key={i} className={styles.listItem}>
          <span className={styles.listDot} />
          {item}
        </li>
      ))}
    </ul>
  )
}

export function Highlight({ children }) {
  return (
    <div className={styles.highlight}>
      <p className={styles.highlightText}>{children}</p>
    </div>
  )
}

export function Strong({ children }) {
  return <strong className={styles.strong}>{children}</strong>
}
