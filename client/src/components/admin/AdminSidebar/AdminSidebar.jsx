import styles from './AdminSidebar.module.css'

const nav = [
  { icon: '⊞', label: 'Dashboard',    id: 'dashboard' },
  { icon: '📥', label: 'Inquiries',    id: 'leads' },
  { icon: '📦', label: 'Packages',     id: 'packages' },
  { icon: '🌍', label: 'Destinations', id: 'destinations' },
  { icon: '📋', label: 'Quotes',       id: 'quotes' },
  { icon: '📊', label: 'Analytics',    id: 'analytics' },
  { icon: '⚙',  label: 'Settings',    id: 'settings' },
]

export default function AdminSidebar({ active, onNavigate, onLogout, user }) {
  const initial = user?.email?.[0]?.toUpperCase() || 'A'
  const name    = user?.email?.split('@')[0] || 'Admin'

  return (
    <aside className="w-[260px] lg:w-[280px] bg-white border-r border-gray-100 hidden md:flex flex-col flex-shrink-0 sticky top-0 h-screen">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100">
        <div className="w-9 h-9 bg-dark rounded-xl flex items-center justify-center text-white font-bold font-serif shadow-sm text-lg">E</div>
        <div>
          <p className="font-black text-sm tracking-[0.25em] uppercase text-dark">Workspace</p>
          <p className="text-[10px] text-gray-400 font-medium">EMV Global Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {nav.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all text-left ${
              active === item.id
                ? 'bg-dark text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50 hover:text-dark'
            }`}
          >
            <span className="w-5 text-base">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* User + Sign out */}
      <div className="px-4 py-4 border-t border-gray-100 space-y-1">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 bg-brand rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0">{initial}</div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-dark truncate capitalize">{name}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{user?.role || 'Admin'}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <span className="w-5 text-base">→</span>
          Sign Out
        </button>
      </div>
    </aside>
  )
}
