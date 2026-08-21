import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaBars } from 'react-icons/fa6'
import MobileMenu from '../MobileMenu/MobileMenu'
import { useCustomerAuth } from '../../../context/CustomerAuthContext'
import { useAuth } from '../../../context/AuthContext'
import styles from './Navbar.module.css'
import logo from '../../../assets/logo.png'

const NAV_LINKS = [
  ['Destinations', '/destinations'],
  ['Holidays', '/packages'],
  ['Travel Styles', '/#travel-styles'],
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { customer, logoutCustomer } = useCustomerAuth()
  // Admin access lives in the footer only — this is read just to hide the
  // public "Sign In" link while an admin session is active.
  const { user: adminUser } = useAuth()

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Pages that open on a full-bleed photo need white header text — but only
  // until the visitor scrolls off the hero, after which the bar goes light
  // like the rest of the page.
  const hasPhotoHero = ['/', '/quotes'].includes(location.pathname)
    || location.pathname.startsWith('/package-details')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setScrolled(false)
  }, [location.pathname])

  const isDarkHero = hasPhotoHero && !scrolled

  const navClass = [
    styles.navbar,
    scrolled ? styles.scrolled : '',
    scrolled ? styles.scrolledLight : '',
  ].filter(Boolean).join(' ')

  const scrolledBg = 'rgba(255,255,255,0.97)'

  const hamburgerStyle = isDarkHero
    ? { color: '#fff', background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.2)' }
    : {}

  // "Travel Styles" is a home-page section, not a route — go home first when
  // we're elsewhere, then scroll once the section has mounted.
  const goToSection = (e, hash) => {
    e.preventDefault()
    const id = hash.replace('/#', '')
    const scroll = () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    if (location.pathname === '/') {
      scroll()
    } else {
      navigate('/')
      setTimeout(scroll, 400)
    }
  }

  return (
    <>
      <nav
        id="navbar"
        className={navClass}
        style={{ backgroundColor: scrolled ? scrolledBg : 'transparent' }}
      >
        <div className={styles.inner}>
          <Link to="/" className={styles.logo}>
            <img src={logo} alt="Ease My Vacations" className={styles.logoImg} />
            <span className={`${styles.globalText} ${isDarkHero ? styles.globalTextLight : styles.globalTextDark}`}>
              Ease My Vacations
            </span>
          </Link>

          <nav className={styles.navPill} aria-label="Main navigation">
            {NAV_LINKS.map(([label, path]) => (
              path.startsWith('/#')
                ? <a key={path} href={path} onClick={e => goToSection(e, path)} className={styles.navLink}>{label}</a>
                : <Link key={path} to={path} className={styles.navLink}>{label}</Link>
            ))}
          </nav>

          <div className={styles.actions}>
            {customer ? (
              <div className={styles.customerAvatar} ref={dropdownRef}>
                <button
                  className={styles.avatarBtn}
                  onClick={() => setDropdownOpen((open) => !open)}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <div className={styles.avatarCircle}>
                    {customer.name[0].toUpperCase()}
                  </div>
                  <span className={`${styles.avatarName} ${isDarkHero ? styles.avatarNameLight : styles.avatarNameDark}`}>
                    {customer.name.split(' ')[0]}
                  </span>
                </button>
                {dropdownOpen && (
                  <div className={styles.avatarDropdown}>
                    <div className={styles.dropdownHeader}>
                      <p className={styles.dropdownName}>{customer.name}</p>
                      <p className={styles.dropdownEmail}>{customer.email}</p>
                      {customer.city && <p className={styles.dropdownEmail}>Location: {customer.city}</p>}
                    </div>
                    <Link
                      to="/customer/profile"
                      className={styles.dropdownItem}
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    <Link
                      to="/customer/profile/trips"
                      className={styles.dropdownItem}
                      onClick={() => setDropdownOpen(false)}
                    >
                      Trip History
                    </Link>
                    <button
                      className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                      onClick={() => { logoutCustomer(); setDropdownOpen(false) }}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : !adminUser ? (
              <Link
                to="/login"
                className={`${styles.signInLink} ${isDarkHero ? styles.signInLight : styles.signInDark}`}
              >
                Sign In
              </Link>
            ) : null}

            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-travel-quiz'))}
              className={styles.planTripBtn}
            >
              Plan My Trip
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>

          <button
            className={styles.hamburger}
            style={hamburgerStyle}
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <FaBars style={{ fontSize: '1.125rem' }} />
          </button>
        </div>
      </nav>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
