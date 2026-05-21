import { useState, Suspense, lazy } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AdminSidebar from '../../components/admin/AdminSidebar/AdminSidebar'
import styles from './Admin.module.css'

const AdminDashboard    = lazy(() => import('./sections/AdminDashboard'))
const AdminAnalytics    = lazy(() => import('./sections/AdminAnalytics'))
const AdminLeadsPage    = lazy(() => import('./sections/AdminLeadsPage'))
const AdminPackagesPage = lazy(() => import('./sections/AdminPackagesPage'))
const AdminSettings     = lazy(() => import('./sections/AdminSettings'))

function SectionLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

const sections = {
  dashboard: AdminDashboard,
  analytics: AdminAnalytics,
  leads:     AdminLeadsPage,
  packages:  AdminPackagesPage,
  settings:  AdminSettings,
}

const mobileNav = [
  { icon: '⊞', id: 'dashboard' },
  { icon: '📥', id: 'leads' },
  { icon: '📦', id: 'packages' },
  { icon: '📊', id: 'analytics' },
  { icon: '⚙',  id: 'settings' },
]

export default function Admin() {
  const [active, setActive] = useState('dashboard')

  const Section = sections[active] || AdminDashboard

  return (
    <div className="bg-[#f7f8fa] min-h-screen pt-[85px] flex">
      <AdminSidebar active={active} onNavigate={setActive} />

      {/* Main content */}
      <div className="flex-1 overflow-x-hidden pb-24 md:pb-0">
        <div className="max-w-6xl mx-auto px-5 md:px-10 py-10">
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
      </div>

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
