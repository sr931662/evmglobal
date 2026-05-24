import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaBars } from 'react-icons/fa6'
import MobileMenu from '../MobileMenu/MobileMenu'
import { openWhatsApp } from '../../../utils/whatsapp'
import styles from './Navbar.module.css'

const NAV_LINKS = [
  ['Destinations', '/destinations'],
  ['Journeys',     '/packages'],
  ['Quotes',       '/quotes'],
  ['Our Ethos',    '/about'],
  ['Contact',      '/contact'],
]

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const location = useLocation()

  const isDarkHero = ['/', '/quotes'].includes(location.pathname) || location.pathname.startsWith('/package-details')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setScrolled(false) }, [location.pathname])

  const navClass = [
    styles.navbar,
    scrolled ? styles.scrolled : '',
    scrolled && !isDarkHero ? styles.scrolledLight : '',
  ].filter(Boolean).join(' ')

  const scrolledBg = isDarkHero ? 'rgba(10,10,10,0.85)' : 'rgba(255,255,255,0.97)'

  return (
    <>
      <nav
        id="navbar"
        className={navClass}
        style={{ backgroundColor: scrolled ? scrolledBg : 'transparent' }}
      >
        <div className={styles.inner}>
          <Link to="/" className={styles.logo}>
            <div className={styles.logoMark}>E</div>
            <div className={`${styles.logoText} ${isDarkHero ? styles.logoTextLight : styles.logoTextDark}`}>
              <span className={styles.wordmark}>EMV</span>
              <span className={styles.tagline}>Global</span>
            </div>
          </Link>

          <nav className={styles.navPill}>
            {NAV_LINKS.map(([label, path]) => (
              <Link key={path} to={path} className={styles.navLink}>{label}</Link>
            ))}
          </nav>

          <div className={styles.actions}>
            <Link
              to="/admin"
              className={`${styles.workspaceLink} ${isDarkHero ? styles.workspaceLight : styles.workspaceDark}`}
            >
              Workspace
            </Link>
            <button onClick={() => openWhatsApp('Bespoke Trip Planning')} className={styles.planBtn}>
              <span className={styles.planBtnIcon}>
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '1.25rem', height: '1.25rem' }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.112.555 4.094 1.523 5.813L0 24l6.336-1.499A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.946 0-3.77-.51-5.338-1.4l-.382-.225-3.961.937.997-3.868-.249-.401A9.942 9.942 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
              </span>
              Plan Trip
            </button>
          </div>

          <button className={styles.hamburger} onClick={() => setMenuOpen(true)}>
            <FaBars style={{ fontSize: '1.25rem' }} />
          </button>
        </div>
      </nav>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
