import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../../../services/api'
import styles from './AdminAccessPage.module.css'

const ALLOWED_DOMAIN = 'easemyvacationsglobal.com'

function fmt(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function Avatar({ email }) {
  const initials = (email || '?')[0].toUpperCase()
  return <div className={styles.avatar}>{initials}</div>
}

function AddUserModal({ onClose, onCreated }) {
  const [email,    setEmail]    = useState('')
  const [pass,     setPass]     = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [saving,   setSaving]   = useState(false)
  const [err,      setErr]      = useState('')

  const domainOk = email.toLowerCase().endsWith(`@${ALLOWED_DOMAIN}`)

  const handleSubmit = async () => {
    setErr('')
    if (!email.trim() || !pass.trim()) { setErr('Email and password are required.'); return }
    if (!domainOk) { setErr(`Only @${ALLOWED_DOMAIN} email addresses are allowed.`); return }
    if (pass.length < 8) { setErr('Password must be at least 8 characters.'); return }
    if (pass !== confirm) { setErr('Passwords do not match.'); return }
    setSaving(true)
    try {
      await api.createAdminUser(email.trim(), pass)
      onCreated()
      onClose()
    } catch (e) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className={styles.modal}
        onClick={e => e.stopPropagation()}
      >
        <h3 className={styles.modalTitle}>Add Portal Access</h3>
        <p className={styles.modalHint}>
          Only <strong>@{ALLOWED_DOMAIN}</strong> email addresses can be added as admin users.
        </p>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Work Email <span className={styles.req}>*</span></label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={`name@${ALLOWED_DOMAIN}`}
            className={`${styles.input} ${email && !domainOk ? styles.inputError : ''}`}
          />
          {email && !domainOk && (
            <p className={styles.fieldErr}>Must be an @{ALLOWED_DOMAIN} address</p>
          )}
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Password <span className={styles.req}>*</span></label>
          <input
            type="password"
            value={pass}
            onChange={e => setPass(e.target.value)}
            placeholder="Min 8 characters"
            className={styles.input}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Confirm Password <span className={styles.req}>*</span></label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Re-enter password"
            className={`${styles.input} ${confirm && pass !== confirm ? styles.inputError : ''}`}
          />
        </div>

        {err && <div className={styles.errBanner}>{err}</div>}

        <div className={styles.modalActions}>
          <button onClick={onClose} className={styles.btnCancel}>Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className={styles.btnCreate}
          >
            {saving ? 'Creating…' : 'Create Access'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function AdminAccessPage() {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [err,     setErr]     = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const load = useCallback(() => {
    setLoading(true); setErr('')
    api.getAdminUsers()
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async (user) => {
    if (!window.confirm(`Remove portal access for ${user.email}? They will no longer be able to log in.`)) return
    setDeleting(user.id || user._id)
    try {
      await api.deleteAdminUser(user.id || user._id)
      setUsers(prev => prev.filter(u => (u.id || u._id) !== (user.id || user._id)))
    } catch (e) {
      alert(e.message)
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Portal Access</h2>
          <p className={styles.subtitle}>
            Manage who can log into the EMV Global admin panel. Only{' '}
            <strong>@{ALLOWED_DOMAIN}</strong> addresses are permitted.
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className={styles.btnAdd}>
          + Add Member
        </button>
      </div>

      <div className={styles.rbacInfo}>
        <div className={styles.rbacIcon}>🔐</div>
        <div>
          <p className={styles.rbacTitle}>Role-Based Access Control (RBAC)</p>
          <p className={styles.rbacDesc}>
            All admin users currently share the <strong>admin</strong> role with full access to leads, packages, blogs, destinations, careers, and settings. Domain restriction ensures only company email accounts can be onboarded.
          </p>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}><div className={styles.spinner} /></div>
      ) : err ? (
        <div className={styles.errCenter}>{err}</div>
      ) : (
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.panelCount}>{users.length} admin {users.length === 1 ? 'user' : 'users'}</span>
          </div>

          {users.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyIcon}>👥</p>
              <p className={styles.emptyText}>No admin users found</p>
            </div>
          ) : (
            <div className={styles.list}>
              {users.map((user, i) => (
                <motion.div
                  key={user.id || user._id || i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={styles.row}
                >
                  <Avatar email={user.email} />
                  <div className={styles.rowInfo}>
                    <p className={styles.rowEmail}>{user.email}</p>
                    <p className={styles.rowMeta}>
                      <span className={styles.roleBadge}>{user.role || 'admin'}</span>
                      <span className={styles.rowDate}>Joined {fmt(user.created_at)}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(user)}
                    disabled={deleting === (user.id || user._id)}
                    className={styles.btnRemove}
                    title="Remove portal access"
                  >
                    {deleting === (user.id || user._id) ? '…' : 'Remove'}
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showAdd && (
          <AddUserModal
            onClose={() => setShowAdd(false)}
            onCreated={load}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
