import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../../services/api'
import Pagination from '../../../components/admin/Pagination'
import styles from './AdminUsersPage.module.css'

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
  const colors = [styles.avRose, styles.avViolet, styles.avSky, styles.avAmber, styles.avEmerald, styles.avPink]
  const color = colors[(name?.charCodeAt(0) || 0) % colors.length]
  return (
    <div className={`${styles.avatar} ${color}`}>
      {initials}
    </div>
  )
}

export default function AdminUsersPage() {
  const [users,   setUsers]   = useState([])
  const [total,   setTotal]   = useState(0)
  const [page,    setPage]    = useState(1)
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [search,  setSearch]  = useState('')

  const limit = 20

  const fetchAll = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [usersData, statsData] = await Promise.all([
        api.getCustomers({ search: search.trim() || undefined, page, limit }),
        api.getCustomerStats(),
      ])
      setUsers(usersData.customers || [])
      setTotal(usersData.pagination?.total || 0)
      setStats(statsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => { fetchAll() }, [fetchAll])

  useEffect(() => { setPage(1) }, [search])

  return (
    <div className={styles.page}>
      {/* Header */}
      <div>
        <h2 className={styles.title}>Users</h2>
        <p className={styles.subtitle}>
          {stats ? `${stats.total} registered · ${stats.newThisMonth} new this month` : 'Loading…'}
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className={styles.statGrid}>
          {[
            { label: 'Total Users',      value: stats.total,        icon: '👤' },
            { label: 'New This Month',   value: stats.newThisMonth, icon: '✨' },
          ].map(s => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.statCard}
            >
              <div className={styles.statHead}>
                <span className={styles.statIcon}>{s.icon}</span>
                <p className={styles.statLabel}>{s.label}</p>
              </div>
              <p className={styles.statValue}>{s.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Search + Table */}
      <div className={styles.panel}>
        <div className={styles.searchBar}>
          <div className={styles.searchWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="Search by name, email, city…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.search}
            />
          </div>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
          </div>
        ) : error ? (
          <div className={styles.errorCenter}>{error}</div>
        ) : users.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyIcon}>👤</p>
            <p className={styles.emptyText}>
              {search ? `No users matching "${search}"` : 'No users registered yet'}
            </p>
            {!search && (
              <p className={styles.emptyHint}>Users appear here when customers sign in on the website.</p>
            )}
          </div>
        ) : (
          <div className={styles.scroll}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.theadRow}>
                  {['User', 'Email', 'Phone', 'City', 'Joined', 'Last Seen'].map(h => (
                    <th key={h} className={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={styles.row}
                  >
                    <td className={styles.td}>
                      <div className={styles.userCell}>
                        <Avatar name={user.name} />
                        <span className={styles.cellStrong}>{user.name}</span>
                      </div>
                    </td>
                    <td className={styles.tdEmail}>{user.email}</td>
                    <td className={styles.tdMuted}>{user.phone || '—'}</td>
                    <td className={styles.tdMuted}>{user.city || '—'}</td>
                    <td className={`${styles.tdMuted} ${styles.nowrap}`}>{fmt(user.created_at)}</td>
                    <td className={`${styles.tdFaint} ${styles.nowrap}`}>{timeAgo(user.lastSeen)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={page}
          totalPages={Math.ceil(total / limit)}
          total={total}
          showing={users.length}
          onPage={setPage}
          label="users"
        />
      </div>
    </div>
  )
}
