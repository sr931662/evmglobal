import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaBars } from 'react-icons/fa6'
import MobileMenu from '../MobileMenu/MobileMenu'
import { useCustomerAuth } from '../../../context/CustomerAuthContext'
import { useAuth } from '../../../context/AuthContext'
import styles from './Navbar.module.css'
import logo from '../../../assets/logo.png'

const NAV_LINKS = [
  ['Destinations', '/destinations'],
  ['Holidays', '/packages'],
  ['Quotes', '/quotes'],
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const adminDropdownRef = useRef(null)
  const location = useLocation()
  const { customer, logoutCustomer } = useCustomerAuth()
  const { user: adminUser, logout: adminLogout } = useAuth()

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false)
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(e.target)) setAdminDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isDarkHero = ['/', '/quotes'].includes(location.pathname)
    || location.pathname.startsWith('/package-details')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setScrolled(false)
  }, [location.pathname])

  const navClass = [
    styles.navbar,
    scrolled ? styles.scrolled : '',
    scrolled && !isDarkHero ? styles.scrolledLight : '',
  ].filter(Boolean).join(' ')

  const scrolledBg = isDarkHero ? 'rgba(10,10,10,0.85)' : 'rgba(255,255,255,0.97)'

  const hamburgerStyle = isDarkHero && !scrolled
    ? { color: '#fff', background: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.2)' }
    : {}

  return (
    <>
      <nav
        id="navbar"
        className={navClass}
        style={{ backgroundColor: scrolled ? scrolledBg : 'transparent' }}
      >
        <div className={styles.inner}>
          <Link to="/" className={styles.logo}>
            <img src={logo} alt="EMV" className={styles.logoImg} />
            <span className={`${styles.globalText} ${isDarkHero ? styles.globalTextLight : styles.globalTextDark}`}>
              GLOBAL
            </span>
          </Link>

          <nav className={styles.navPill} aria-label="Main navigation">
            {NAV_LINKS.map(([label, path]) => (
              <Link key={path} to={path} className={styles.navLink}>{label}</Link>
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

            {adminUser ? (
              <div className={styles.adminMenu} ref={adminDropdownRef}>
                <button
                  className={`${styles.workspaceLink} ${styles.adminBtn} ${isDarkHero ? styles.workspaceLight : styles.workspaceDark}`}
                  onClick={() => setAdminDropdownOpen(o => !o)}
                  aria-expanded={adminDropdownOpen}
                >
                  Admin
                  <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: '0.75rem', height: '0.75rem', marginLeft: '0.25rem' }}>
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.085l3.71-3.855a.75.75 0 111.08 1.04l-4.25 4.42a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                  </svg>
                </button>
                {adminDropdownOpen && (
                  <div className={styles.avatarDropdown}>
                    <div className={styles.dropdownHeader}>
                      <p className={styles.dropdownName}>Admin</p>
                      <p className={styles.dropdownEmail}>{adminUser.email}</p>
                    </div>
                    <Link
                      to="/admin"
                      className={styles.dropdownItem}
                      onClick={() => setAdminDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                      onClick={() => { adminLogout(); setAdminDropdownOpen(false) }}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : null}
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
