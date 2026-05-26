import { useState, Suspense, lazy } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import AdminSidebar from '../../components/admin/AdminSidebar/AdminSidebar'
import AdminMobileSidebar from '../../components/admin/AdminSidebar/AdminMobileSidebar'

const AdminDashboard         = lazy(() => import('./sections/AdminDashboard'))
const AdminAnalytics         = lazy(() => import('./sections/AdminAnalytics'))
const AdminLeadsPage         = lazy(() => import('./sections/AdminLeadsPage'))
const AdminPackagesPage      = lazy(() => import('./sections/AdminPackagesPage'))
const AdminDestinationsPage  = lazy(() => import('./sections/AdminDestinationsPage'))
const AdminQuotesPage        = lazy(() => import('./sections/AdminQuotesPage'))
const AdminBlogsPage         = lazy(() => import('./sections/AdminBlogsPage'))
const AdminCareersPage       = lazy(() => import('./sections/AdminCareersPage'))
const AdminTeamPage          = lazy(() => import('./sections/AdminTeamPage'))
const AdminSettings          = lazy(() => import('./sections/AdminSettings'))
const AdminUsersPage         = lazy(() => import('./sections/AdminUsersPage'))

function SectionLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
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
  users:        AdminUsersPage,
  settings:     AdminSettings,
}

export default function Admin() {
  const [active,     setActive]     = useState('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const { logout, user } = useAuth()

  const Section = sections[active] || AdminDashboard

  const navigate = (id) => { setActive(id); setMobileOpen(false) }

  return (
    <div className="flex min-h-screen bg-[#f7f8fa]">
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

      <main className="flex-1 min-w-0">
        {/* Mobile top bar */}
        <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3.5 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-dark rounded-xl flex items-center justify-center text-white font-bold font-serif text-base">E</div>
            <span className="font-black text-xs tracking-[0.25em] uppercase text-dark">Workspace</span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <span className="w-5 h-0.5 bg-dark rounded-full" />
            <span className="w-5 h-0.5 bg-dark rounded-full" />
            <span className="w-3 h-0.5 bg-dark rounded-full self-start ml-1" />
          </button>
        </div>

        <div className="px-4 md:px-10 py-6 md:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
            >
              <Suspense fallback={<SectionLoader />}>
                <Section />
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
