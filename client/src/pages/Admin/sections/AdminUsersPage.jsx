import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../../services/api'

function fmt(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function timeAgo(dateStr) {
  if (!dateStr) return '—'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)   return 'Just now'
  if (mins  < 60)  return `${mins}m ago`
  if (hours < 24)  return `${hours}h ago`
  if (days  < 30)  return `${days}d ago`
  return fmt(dateStr)
}

function Avatar({ name }) {
  const initials = name
    ? name.trim().split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '?'
  const colors = [
    'bg-rose-100 text-rose-600',
    'bg-violet-100 text-violet-600',
    'bg-sky-100 text-sky-600',
    'bg-amber-100 text-amber-600',
    'bg-emerald-100 text-emerald-600',
    'bg-pink-100 text-pink-600',
  ]
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length]
  return (
    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-black shrink-0 ${color}`}>
      {initials}
    </div>
  )
}

export default function AdminUsersPage() {
  const [users,   setUsers]   = useState([])
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [search,  setSearch]  = useState('')

  const fetchAll = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [usersData, statsData] = await Promise.all([
        api.getCustomers({ search: search.trim() || undefined }),
        api.getCustomerStats(),
      ])
      setUsers(Array.isArray(usersData) ? usersData : [])
      setStats(statsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => { fetchAll() }, [fetchAll])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-4xl font-serif font-bold text-dark tracking-tight">Users</h2>
        <p className="text-gray-400 mt-1 font-medium">
          {stats ? `${stats.total} registered · ${stats.newThisMonth} new this month` : 'Loading…'}
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-5">
          {[
            { label: 'Total Users',      value: stats.total,        icon: '👤' },
            { label: 'New This Month',   value: stats.newThisMonth, icon: '✨' },
          ].map(s => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{s.icon}</span>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">{s.label}</p>
              </div>
              <p className="text-4xl font-serif font-bold text-dark">{s.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Search + Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="relative max-w-sm">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search by name, email, city…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm font-bold text-dark placeholder:text-gray-400 focus:outline-none focus:border-brand transition-colors"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-16 text-red-500 font-bold">{error}</div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">👤</p>
            <p className="text-gray-400 font-bold">
              {search ? `No users matching "${search}"` : 'No users registered yet'}
            </p>
            {!search && (
              <p className="text-gray-400 text-sm mt-1">Users appear here when customers sign in on the website.</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['User', 'Email', 'Phone', 'City', 'Joined', 'Last Seen'].map(h => (
                    <th key={h} className="px-6 py-3.5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} />
                        <span className="font-bold text-dark">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{user.email}</td>
                    <td className="px-6 py-4 text-gray-500 font-medium">{user.phone || '—'}</td>
                    <td className="px-6 py-4 text-gray-500 font-medium">{user.city || '—'}</td>
                    <td className="px-6 py-4 text-gray-500 font-medium whitespace-nowrap">{fmt(user.created_at)}</td>
                    <td className="px-6 py-4 text-gray-400 font-medium whitespace-nowrap">{timeAgo(user.lastSeen)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && users.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-bold">{users.length} user{users.length !== 1 ? 's' : ''} total</p>
          </div>
        )}
      </div>
    </div>
  )
}
