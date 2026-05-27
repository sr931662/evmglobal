import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaBars } from 'react-icons/fa6'
import MobileMenu from '../MobileMenu/MobileMenu'
import { openWhatsApp } from '../../../utils/whatsapp'
import { useCustomerAuth } from '../../../context/CustomerAuthContext'
import styles from './Navbar.module.css'
import logo from '../../../assets/logo.png'

const NAV_LINKS = [
  ['Destinations', '/destinations'],
  ['Journeys',     '/packages'],
  ['Quotes',       '/quotes'],
  ['Our Ethos',    '/about'],
  ['Contact',      '/contact'],
]

function EditProfileModal({ customer, onSave, onClose }) {
  const [form, setForm] = useState({
    name:  customer.name  || '',
    email: customer.email || '',
    phone: customer.phone || '',
    city:  customer.city  || '',
  })
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const valid = form.name.trim() && form.email.trim()

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: '1.5rem', padding: '2rem', width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
      >
        <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1.375rem', color: 'var(--dark)', marginBottom: '1.5rem' }}>Edit Profile</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { label: 'Full Name *', key: 'name',  type: 'text',  placeholder: 'Your full name',      ac: 'name' },
            { label: 'Email *',     key: 'email', type: 'email', placeholder: 'your@email.com',       ac: 'email' },
            { label: 'Phone',       key: 'phone', type: 'tel',   placeholder: '+91 70705 95907',      ac: 'tel' },
            { label: 'City',        key: 'city',  type: 'text',  placeholder: 'e.g. Mumbai, Delhi',   ac: 'address-level2' },
          ].map(({ label, key, type, placeholder, ac }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#374151', marginBottom: '0.375rem' }}>{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={e => f(key, e.target.value)}
                placeholder={placeholder}
                autoComplete={ac}
                style={{ width: '100%', padding: '0.75rem 1rem', border: '1.5px solid #e5e7eb', borderRadius: '0.75rem', fontSize: '0.9375rem', color: 'var(--dark)', fontFamily: 'inherit', fontWeight: 500, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '0.875rem', border: '1px solid #e5e7eb', borderRadius: '9999px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', background: 'none', color: '#6b7280' }}>
            Cancel
          </button>
          <button onClick={() => { onSave(form); onClose() }} disabled={!valid} style={{ flex: 1, padding: '0.875rem', background: 'var(--brand)', border: 'none', borderRadius: '9999px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', color: '#fff', opacity: valid ? 1 : 0.5 }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Navbar() {
  const [scrolled,      setScrolled]      = useState(false)
  const [menuOpen,      setMenuOpen]      = useState(false)
  const [dropdownOpen,  setDropdownOpen]  = useState(false)
  const [editProfile,   setEditProfile]   = useState(false)
  const dropdownRef = useRef(null)
  const location = useLocation()
  const { customer, logoutCustomer, updateCustomer } = useCustomerAuth()

  /* Close avatar dropdown on outside click */
  useEffect(() => {
    const handler = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isDarkHero = ['/', '/quotes'].includes(location.pathname)
    || location.pathname.startsWith('/package-details')

  /* Scroll detection */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* Reset scrolled state on every route change */
  useEffect(() => { setScrolled(false) }, [location.pathname])

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

          {/* Logo */}
          <Link to="/" className={styles.logo}>
            <img src={logo} alt="EMV" className={styles.logoImg} />
            <span className={`${styles.globalText} ${isDarkHero ? styles.globalTextLight : styles.globalTextDark}`}>
              GLOBAL
            </span>
          </Link>

          {/* Desktop nav pill */}
          <nav className={styles.navPill} aria-label="Main navigation">
            {NAV_LINKS.map(([label, path]) => (
              <Link key={path} to={path} className={styles.navLink}>{label}</Link>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className={styles.actions}>
            {customer ? (
              <div className={styles.customerAvatar} ref={dropdownRef}>
                <button
                  className={styles.avatarBtn}
                  onClick={() => setDropdownOpen(o => !o)}
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
                      {customer.city && <p className={styles.dropdownEmail}>📍 {customer.city}</p>}
                    </div>
                    <button
                      className={styles.dropdownItem}
                      onClick={() => { setDropdownOpen(false); setEditProfile(true) }}
                    >
                      ✏ Edit Profile
                    </button>
                    <button
                      className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                      onClick={() => { logoutCustomer(); setDropdownOpen(false) }}
                    >
                      → Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className={`${styles.signInLink} ${isDarkHero ? styles.signInLight : styles.signInDark}`}
              >
                Sign In
              </Link>
            )}

            <Link
              to="/admin"
              className={`${styles.workspaceLink} ${isDarkHero ? styles.workspaceLight : styles.workspaceDark}`}
            >
              Workspace
            </Link>

            <button
              onClick={() => openWhatsApp('Bespoke Trip Planning')}
              className={styles.planBtn}
            >
              <span className={styles.planBtnIcon}>
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '1.125rem', height: '1.125rem' }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.112.555 4.094 1.523 5.813L0 24l6.336-1.499A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.946 0-3.77-.51-5.338-1.4l-.382-.225-3.961.937.997-3.868-.249-.401A9.942 9.942 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
              </span>
              Plan Trip
            </button>
          </div>

          {/* Hamburger */}
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

      {editProfile && customer && (
        <EditProfileModal
          customer={customer}
          onSave={updateCustomer}
          onClose={() => setEditProfile(false)}
        />
      )}
    </>
  )
}
