import { useState, Suspense, lazy, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import AdminSidebar from '../../components/admin/AdminSidebar/AdminSidebar'
import AdminMobileSidebar from '../../components/admin/AdminSidebar/AdminMobileSidebar'
import styles from './Admin.module.css'

const AdminDashboard         = lazy(() => import('./sections/AdminDashboard'))
const AdminAnalytics         = lazy(() => import('./sections/AdminAnalytics'))
const AdminLeadsPage         = lazy(() => import('./sections/AdminLeadsPage'))
const AdminPackagesPage      = lazy(() => import('./sections/AdminPackagesPage'))
const AdminDestinationsPage  = lazy(() => import('./sections/AdminDestinationsPage'))
const AdminQuotesPage        = lazy(() => import('./sections/AdminQuotesPage'))
const AdminBlogsPage         = lazy(() => import('./sections/AdminBlogsPage'))
const AdminCareersPage       = lazy(() => import('./sections/AdminCareersPage'))
const AdminTeamPage          = lazy(() => import('./sections/AdminTeamPage'))
const AdminHomeContentPage   = lazy(() => import('./sections/AdminHomeContentPage'))
const AdminSettings          = lazy(() => import('./sections/AdminSettings'))
const AdminUsersPage         = lazy(() => import('./sections/AdminUsersPage'))
const AdminAccessPage        = lazy(() => import('./sections/AdminAccessPage'))

function SectionLoader() {
  return (
    <div className={styles.sectionLoader}>
      <div className={styles.spinner} />
    </div>
  )
}

const sections = {
  dashboard:    AdminDashboard,
  analytics:    AdminAnalytics,
  leads:        AdminLeadsPage,
  packages:     AdminPackagesPage,
  destinations: AdminDestinationsPage,
  quotes:       AdminQuotesPage,
  blogs:        AdminBlogsPage,
  careers:      AdminCareersPage,
  team:         AdminTeamPage,
  homeContent:  AdminHomeContentPage,
  users:        AdminUsersPage,
  access:       AdminAccessPage,
  settings:     AdminSettings,
}

export default function Admin() {
  const [active,     setActive]     = useState('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [navState,   setNavState]   = useState(null)
  const { logout, user } = useAuth()

  const Section = sections[active] || AdminDashboard

  // Scroll to top whenever the active section changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [active])

  const navigate = (id, state = null) => { setNavState(state); setActive(id); setMobileOpen(false) }

  return (
    <div className={styles.shell}>
      {/* Desktop sidebar */}
      <AdminSidebar active={active} onNavigate={navigate} onLogout={logout} user={user} />

      {/* Mobile sidebar drawer */}
      <AdminMobileSidebar
        open={mobileOpen}
        active={active}
        onNavigate={navigate}
        onLogout={logout}
        user={user}
        onClose={() => setMobileOpen(false)}
      />

      <main className={styles.main}>
        {/* Mobile top bar */}
        <div className={styles.mobileBar}>
          <div className={styles.mobileBarLeft}>
            <div className={styles.mobileLogo}>E</div>
            <span className={styles.mobileTitle}>Workspace</span>
          </div>
          <button onClick={() => setMobileOpen(true)} className={styles.hamburger}>
            <span className={styles.bar} />
            <span className={styles.bar} />
            <span className={styles.barShort} />
          </button>
        </div>

        <div className={styles.content}>
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
            >
              <Suspense fallback={<SectionLoader />}>
                <Section onNavigate={navigate} navState={navState} />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
