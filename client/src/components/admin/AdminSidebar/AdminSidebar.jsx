import styles from './AdminSidebar.module.css'

const nav = [
  { icon: '⊞', label: 'Dashboard',    id: 'dashboard'    },
  { icon: '📋', label: 'Leads',        id: 'leads'        },
  { icon: '📦', label: 'Packages',     id: 'packages'     },
  { icon: '🌍', label: 'Destinations', id: 'destinations' },
  { icon: '💬', label: 'Quotes',       id: 'quotes'       },
  { icon: '📝', label: 'Blog',         id: 'blogs'        },
  { icon: '💼', label: 'Careers',      id: 'careers'      },
  { icon: '👥', label: 'Team',         id: 'team'         },
  { icon: '👤', label: 'Users',        id: 'users'        },
  { icon: '🔐', label: 'Access',       id: 'access'       },
  { icon: '📊', label: 'Analytics',    id: 'analytics'    },
  { icon: '⚙',  label: 'Settings',    id: 'settings'     },
]

export default function AdminSidebar({ active, onNavigate, onLogout, user }) {
  const initial = user?.email?.[0]?.toUpperCase() || 'A'
  const name    = user?.email?.split('@')[0] || 'Admin'

  return (
    <aside className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.logo}>E</div>
        <div>
          <p className={styles.brandTitle}>Workspace</p>
          <p className={styles.brandSub}>EMV Global Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {nav.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`${styles.navBtn} ${active === item.id ? styles.navBtnActive : ''}`}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* User + Sign out */}
      <div className={styles.footer}>
        <div className={styles.userRow}>
          <div className={styles.avatar}>{initial}</div>
          <div className={styles.userInfo}>
            <p className={styles.userName}>{name}</p>
            <p className={styles.userRole}>{user?.role || 'Admin'}</p>
          </div>
        </div>
        <button onClick={onLogout} className={styles.signout}>
          <span className={styles.navIcon}>→</span>
          Sign Out
        </button>
      </div>
    </aside>
  )
}
