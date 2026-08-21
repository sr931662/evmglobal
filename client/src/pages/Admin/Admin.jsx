import { useState, Suspense, lazy, useEffect, Component } from 'react'
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
const AdminAdsPage           = lazy(() => import('./sections/AdminAdsPage'))
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

/**
 * Without this, a lazy-loaded section that fails to fetch (most commonly a
 * stale chunk hash right after a new deploy — see the vite:preloadError
 * listener in main.jsx) throws during render with nothing to catch it,
 * which unmounts the whole app to a blank page rather than just this one
 * section. Scoped to the section so the sidebar stays usable and the admin
 * can navigate elsewhere without a full reload.
 */
class SectionErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    console.error('Admin section failed to load:', error)
  }

  // Switching sections is how an admin would "retry" without a reload —
  // give the next section a clean slate rather than carrying the old error.
  componentDidUpdate(prevProps) {
    if (prevProps.sectionKey !== this.props.sectionKey && this.state.error) {
      this.setState({ error: null })
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div className={styles.sectionError}>
          <p className={styles.sectionErrorTitle}>This section didn&rsquo;t load</p>
          <p className={styles.sectionErrorText}>
            This can happen right after a new version is published. Reloading usually fixes it.
          </p>
          <button onClick={() => window.location.reload()} className={styles.sectionErrorBtn}>
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
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
  ads:          AdminAdsPage,
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
              <SectionErrorBoundary sectionKey={active}>
                <Suspense fallback={<SectionLoader />}>
                  <Section onNavigate={navigate} navState={navState} />
                </Suspense>
              </SectionErrorBoundary>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
