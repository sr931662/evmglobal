import { motion } from 'framer-motion'
import styles from './AdminNavbar.module.css'

const sectionTitles = {
  dashboard: 'Dashboard',
  leads:     'Inquiries',
  packages:  'Packages',
  analytics: 'Analytics',
  settings:  'Settings',
}

export default function AdminNavbar({ active, onLogout, user }) {
  const initial = user?.email?.[0]?.toUpperCase() || 'A'
  const name    = user?.email?.split('@')[0] || 'Admin'

  return (
    <header className={styles.header}>
      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.logo}>E</div>
        <div className={styles.brandText}>
          <p className={styles.brandName}>EMV</p>
          <p className={styles.brandSub}>Admin</p>
        </div>
      </div>

      <div className={styles.divider} />

      {/* Current section title */}
      <motion.h1
        key={active}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={styles.sectionTitle}
      >
        {sectionTitles[active] || 'Dashboard'}
      </motion.h1>

      <div className={styles.spacer} />

      {/* Right side */}
      <div className={styles.right}>
        {/* User pill */}
        <div className={styles.userPill}>
          <div className={styles.avatar}>
            {initial}
          </div>
          <div className={styles.userText}>
            <p className={styles.userName}>{name}</p>
            <p className={styles.userRole}>{user?.role || 'Admin'}</p>
          </div>
        </div>

        {/* Sign out */}
        <button onClick={onLogout} className={styles.signout} title="Sign out">
          <span className={styles.signoutArrow}>→</span>
          <span className={styles.signoutLabel}>Sign Out</span>
        </button>
      </div>
    </header>
  )
}
