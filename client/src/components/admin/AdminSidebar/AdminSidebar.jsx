import styles from './AdminSidebar.module.css'

const nav = [
  { icon: '⊞', label: 'Dashboard',  id: 'dashboard' },
  { icon: '📥', label: 'Inquiries',  id: 'leads',     badge: '3' },
  { icon: '📦', label: 'Packages',   id: 'packages' },
  { icon: '📊', label: 'Analytics',  id: 'analytics' },
  { icon: '⚙',  label: 'Settings',   id: 'settings' },
]

export default function AdminSidebar({ active, onNavigate }) {
  return (
    <aside className="w-full md:w-[280px] lg:w-[300px] bg-white border-r border-gray-100 p-6 hidden md:flex flex-col relative z-10 min-h-[calc(100vh-85px)] flex-shrink-0">
      <div className="flex items-center gap-3 mb-10 px-2 mt-2">
        <div className="w-9 h-9 bg-dark rounded-xl flex items-center justify-center text-white font-bold font-serif shadow-sm text-lg">E</div>
        <div>
          <p className="font-black text-sm tracking-[0.25em] uppercase text-dark">Workspace</p>
          <p className="text-[10px] text-gray-400 font-medium">EMV Global Admin</p>
        </div>
      </div>

      <nav className="space-y-1 flex-1">
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
            {item.badge && (
              <span className={`ml-auto text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wide ${active === item.id ? 'bg-white/20 text-white' : 'bg-brand text-white'}`}>
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 bg-brand rounded-xl flex items-center justify-center text-white text-sm font-bold">S</div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-dark truncate">Shivam Rastogi</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
