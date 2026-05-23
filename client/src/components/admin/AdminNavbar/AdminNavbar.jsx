import { motion } from 'framer-motion'

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
    <header className="fixed top-0 inset-x-0 z-40 h-[64px] bg-white border-b border-gray-100 flex items-center px-5 md:px-8 gap-4 shadow-sm">
      {/* Brand */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 bg-dark rounded-xl flex items-center justify-center text-white font-bold font-serif text-base shadow-sm">E</div>
        <div className="hidden sm:block">
          <p className="font-black text-xs tracking-[0.25em] uppercase text-dark leading-none">EMV</p>
          <p className="text-[9px] text-gray-400 font-medium leading-none mt-0.5">Admin</p>
        </div>
      </div>

      <div className="w-px h-6 bg-gray-200 mx-1 hidden md:block" />

      {/* Current section title */}
      <motion.h1
        key={active}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="hidden md:block text-sm font-black text-dark tracking-[0.15em] uppercase"
      >
        {sectionTitles[active] || 'Dashboard'}
      </motion.h1>

      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* User pill */}
        <div className="hidden sm:flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-full pl-1 pr-4 py-1">
          <div className="w-7 h-7 bg-brand rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initial}
          </div>
          <div className="leading-none">
            <p className="text-xs font-bold text-dark capitalize">{name}</p>
            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-0.5">{user?.role || 'Admin'}</p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-gray-500 hover:bg-red-50 hover:text-red-500 border border-gray-200 hover:border-red-100 transition-colors"
          title="Sign out"
        >
          <span className="text-sm">→</span>
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  )
}
