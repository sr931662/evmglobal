import { useNavigate, NavLink, Outlet, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import styles from './CustomerProfile.module.css'

export default function CustomerProfile() {
  const { customer, logoutCustomer } = useCustomerAuth()
  const navigate = useNavigate()

  const initials = customer?.name
    ? customer.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const handleLogout = () => {
    logoutCustomer()
    navigate('/', { replace: true })
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <motion.div
          className={styles.topBar}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link to="/" className={styles.backBtn}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className={styles.backIcon}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Home
          </Link>
          <button onClick={handleLogout} className={styles.logoutBtn}>Sign Out</button>
        </motion.div>

        <div className={styles.layout}>
          <motion.aside
            className={styles.sidebar}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
          >
            <div className={styles.avatarBlock}>
              <div className={styles.avatar}>{initials}</div>
              <p className={styles.sidebarName}>{customer?.name}</p>
              <p className={styles.sidebarEmail}>{customer?.email}</p>
              <span className={styles.badge}>Travel Member</span>
            </div>

            <nav className={styles.sidebarNav}>
              <NavLink
                to="/customer/profile"
                end
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                <span className={styles.navIcon}>Profile</span>
                My Profile
              </NavLink>
              <NavLink
                to="/customer/profile/trips"
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                <span className={styles.navIcon}>Trips</span>
                My Trips
              </NavLink>
              <NavLink
                to="/cancellation-policy"
                className={({ isActive }) => `${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                <span className={styles.navIcon}>✕</span>
                Read Cancellation Policy
              </NavLink>
            </nav>
          </motion.aside>

          <motion.div
            className={styles.content}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
