import { motion, AnimatePresence } from 'framer-motion'

const nav = [
  { icon: '⊞', label: 'Dashboard',    id: 'dashboard'    },
  { icon: '📋', label: 'Leads',        id: 'leads'        },
  { icon: '🏠', label: 'Home Page',    id: 'homeContent'  },
  { icon: '📣', label: 'Ad Banners',   id: 'ads'          },
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

export default function AdminMobileSidebar({ open, active, onNavigate, onLogout, user, onClose }) {
  const initial = user?.email?.[0]?.toUpperCase() || 'A'
  const name    = user?.email?.split('@')[0] || 'Admin'

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 50,
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          />

          {/* Drawer */}
          <motion.aside
            key="mobile-drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32, mass: 0.8 }}
            style={{
              position: 'fixed', top: 0, left: 0, bottom: 0,
              width: '78vw', maxWidth: '300px',
              zIndex: 51,
              background: '#fff',
              borderRight: '1px solid #f3f4f6',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '4px 0 40px rgba(0,0,0,0.12)',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1rem 1.25rem 1.25rem', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 36, height: 36, background: 'var(--dark)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '1.125rem', fontFamily: 'var(--font-serif)' }}>E</div>
                <div>
                  <p style={{ fontWeight: 900, fontSize: '0.6875rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--dark)' }}>Workspace</p>
                  <p style={{ fontSize: '0.625rem', color: '#9ca3af', fontWeight: 500 }}>EMV Global Admin</p>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{ width: 32, height: 32, borderRadius: '0.625rem', border: 'none', background: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '1rem' }}
              >
                ✕
              </button>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
              {nav.map((item, i) => (
                <motion.button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 + i * 0.03, duration: 0.25, ease: [0.33, 1, 0.68, 1] }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.875rem',
                    padding: '0.875rem 1rem',
                    borderRadius: '1rem',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontWeight: 700,
                    fontSize: '0.9375rem',
                    marginBottom: '0.125rem',
                    background: active === item.id ? 'var(--dark)' : 'transparent',
                    color: active === item.id ? '#fff' : '#6b7280',
                    transition: 'background 0.18s, color 0.18s',
                  }}
                >
                  <span style={{ fontSize: '1.125rem', width: 22, flexShrink: 0 }}>{item.icon}</span>
                  {item.label}
                  {active === item.id && (
                    <motion.span
                      layoutId="mobile-active-dot"
                      style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'var(--brand)', flexShrink: 0 }}
                    />
                  )}
                </motion.button>
              ))}
            </nav>

            {/* User + Sign out */}
            <div style={{ padding: '0.75rem', borderTop: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', marginBottom: '0.25rem' }}>
                <div style={{ width: 34, height: 34, background: 'var(--brand)', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.875rem', fontWeight: 700, flexShrink: 0 }}>{initial}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--dark)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>{name}</p>
                  <p style={{ fontSize: '0.625rem', color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>{user?.role || 'Admin'}</p>
                </div>
              </div>
              <button
                onClick={() => { onLogout(); onClose() }}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '1rem', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem', color: '#6b7280', background: 'transparent', transition: 'background 0.18s, color 0.18s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6b7280' }}
              >
                <span style={{ fontSize: '1rem' }}>→</span>
                Sign Out
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
