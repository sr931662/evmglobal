import { useState, Suspense, lazy } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import AdminSidebar from '../../components/admin/AdminSidebar/AdminSidebar'

const AdminDashboard         = lazy(() => import('./sections/AdminDashboard'))
const AdminAnalytics         = lazy(() => import('./sections/AdminAnalytics'))
const AdminLeadsPage         = lazy(() => import('./sections/AdminLeadsPage'))
const AdminPackagesPage      = lazy(() => import('./sections/AdminPackagesPage'))
const AdminDestinationsPage  = lazy(() => import('./sections/AdminDestinationsPage'))
const AdminQuotesPage        = lazy(() => import('./sections/AdminQuotesPage'))
const AdminSettings          = lazy(() => import('./sections/AdminSettings'))

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
  settings:     AdminSettings,
}

const mobileNav = [
  { icon: '⊞', id: 'dashboard' },
  { icon: '📥', id: 'leads' },
  { icon: '📦', id: 'packages' },
  { icon: '📋', id: 'quotes' },
  { icon: '📊', id: 'analytics' },
  { icon: '⚙',  id: 'settings' },
]

export default function Admin() {
  const [active, setActive] = useState('dashboard')
  const { logout, user }    = useAuth()

  const Section = sections[active] || AdminDashboard

  return (
    <div className="flex min-h-screen bg-[#f7f8fa]">
      <AdminSidebar active={active} onNavigate={setActive} onLogout={logout} user={user} />

      <main className="flex-1 pb-24 md:pb-0">
        <div className="px-6 md:px-10 py-8">
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

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 flex z-40 shadow-glass">
        {mobileNav.map(item => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`flex-1 py-4 flex flex-col items-center justify-center text-xl transition-colors ${active === item.id ? 'text-brand' : 'text-gray-400'}`}
          >
            {item.icon}
            {active === item.id && <span className="w-1 h-1 bg-brand rounded-full mt-1" />}
          </button>
        ))}
      </div>
    </div>
  )
}
