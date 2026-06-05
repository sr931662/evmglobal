import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../../../services/api'
import { useScrollLock } from '../../../hooks/useScrollLock'
import c from './adminCommon.module.css'
import styles from './AdminTeamPage.module.css'

const DEPARTMENTS   = ['Sales', 'Operations', 'Marketing', 'Technology', 'Management', 'Customer Support']
const STATUS_OPTIONS = ['All', 'active', 'inactive']

const emptyForm = {
  name: '', role: '', department: 'Sales', email: '',
  phone: '', bio: '', avatar: '', status: 'active', joinedAt: '',
}

function TeamModal({ member, onClose, onSave }) {
  useScrollLock()
  const isEdit = !!member?._id || !!member?.id
  const [form,   setForm]   = useState(isEdit ? {
    name:       member.name       || '',
    role:       member.role       || '',
    department: member.department || 'Sales',
    email:      member.email      || '',
    phone:      member.phone      || '',
    bio:        member.bio        || '',
    avatar:     member.avatar     || '',
    status:     member.status     || 'active',
    joinedAt:   member.joinedAt   ? member.joinedAt.slice(0, 10) : '',
  } : { ...emptyForm })
  const [saving, setSaving] = useState(false)
  const [err,    setErr]    = useState('')

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.role.trim()) {
      setErr('Name and role are required.')
      return
    }
    setSaving(true); setErr('')
    try {
      const payload = { ...form, joinedAt: form.joinedAt || null }
      await onSave(payload)
      onClose()
    } catch (e) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={c.overlay} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className={`${c.modal} ${c.modalLg} ${c.modalScroll} modal-scroll`}
      >
        <h3 className={c.modalTitle}>
          {isEdit ? 'Edit Team Member' : 'Add Team Member'}
        </h3>

        <div className={c.stack}>
          <div className={c.grid2}>
            <div>
              <label className={c.label}>Full Name <span className={c.req}>*</span></label>
              <input type="text" value={form.name} onChange={e => f('name', e.target.value)}
                placeholder="e.g. Priya Sharma"
                className={c.input} />
            </div>
            <div>
              <label className={c.label}>Designation <span className={c.req}>*</span></label>
              <input type="text" value={form.role} onChange={e => f('role', e.target.value)}
                placeholder="e.g. Senior Travel Consultant"
                className={c.input} />
            </div>
          </div>

          <div className={c.grid2}>
            <div>
              <label className={c.label}>Department</label>
              <select value={form.department} onChange={e => f('department', e.target.value)}
                className={`${c.input} ${c.select}`}>
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={c.label}>Status</label>
              <select value={form.status} onChange={e => f('status', e.target.value)}
                className={`${c.input} ${c.select}`}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className={c.grid2}>
            <div>
              <label className={c.label}>Email</label>
              <input type="email" value={form.email} onChange={e => f('email', e.target.value)}
                placeholder="priya@emvglobal.in"
                className={c.input} />
            </div>
            <div>
              <label className={c.label}>Phone</label>
              <input type="text" value={form.phone} onChange={e => f('phone', e.target.value)}
                placeholder="+91 98765 43210"
                className={c.input} />
            </div>
          </div>

          <div>
            <label className={c.label}>Bio</label>
            <textarea rows={3} value={form.bio} onChange={e => f('bio', e.target.value)}
              placeholder="Brief professional bio…"
              className={`${c.input} ${c.textarea}`} />
          </div>

          <div className={c.grid2}>
            <div>
              <label className={c.label}>Avatar URL</label>
              <input type="text" value={form.avatar} onChange={e => f('avatar', e.target.value)}
                placeholder="https://…"
                className={c.input} />
            </div>
            <div>
              <label className={c.label}>Joined Date</label>
              <input type="date" value={form.joinedAt} onChange={e => f('joinedAt', e.target.value)}
                className={c.input} />
            </div>
          </div>
        </div>

        {err && <p className={c.formError}>{err}</p>}

        <div className={c.modalActions}>
          <button onClick={onClose} className={`${c.btnOutline} ${c.flex1}`}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className={`${c.btnBrand} ${c.flex1}`}>
            {saving ? 'Saving…' : isEdit ? 'Update Member' : 'Add Member'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function DeleteConfirm({ label, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false)
  return (
    <div className={c.overlay} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className={`${c.modal} ${c.modalSm}`}
      >
        <div className={c.confirmIcon}>🗑️</div>
        <h3 className={c.confirmTitle}>Remove Member?</h3>
        <p className={c.confirmText}>
          <span className={c.strong}>{label}</span> will be permanently removed.
        </p>
        <div className={c.actionsTight}>
          <button onClick={onClose} className={`${c.btnOutline} ${c.btnSm} ${c.flex1}`}>Cancel</button>
          <button onClick={async () => { setDeleting(true); await onConfirm(); setDeleting(false) }} disabled={deleting}
            className={`${c.btnDanger} ${c.flex1}`}>
            {deleting ? 'Removing…' : 'Remove'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function Avatar({ src, name }) {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'
  if (src) return <img src={src} alt={name} className={styles.avatar} />
  return (
    <div className={styles.avatarFallback}>
      {initials}
    </div>
  )
}

export default function AdminTeamPage() {
  const [members,      setMembers]      = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [status,       setStatus]       = useState('All')
  const [modal,        setModal]        = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const fetchMembers = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const params = {}
      if (status !== 'All') params.status = status
      const data = await api.getTeam(params)
      setMembers(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => { fetchMembers() }, [fetchMembers])

  const handleSave = async (form) => {
    if (modal === 'create') {
      await api.createTeamMember(form)
    } else {
      await api.updateTeamMember(modal._id || modal.id, form)
    }
    fetchMembers()
  }

  const handleDelete = async () => {
    await api.deleteTeamMember(deleteTarget._id || deleteTarget.id)
    setDeleteTarget(null)
    fetchMembers()
  }

  const active   = members.filter(m => m.status === 'active').length
  const inactive = members.filter(m => m.status === 'inactive').length

  const deptGroups = members.reduce((acc, m) => {
    const dept = m.department || 'Other'
    if (!acc[dept]) acc[dept] = []
    acc[dept].push(m)
    return acc
  }, {})

  return (
    <div className={c.page}>
      <div className={c.header}>
        <div>
          <h2 className={c.title}>Team</h2>
          <p className={c.subtitle}>{active} active · {inactive} inactive</p>
        </div>
        <button onClick={() => setModal('create')} className={c.addBtn}>
          + Add Member
        </button>
      </div>

      <div className={c.tabRow}>
        {STATUS_OPTIONS.map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={`${c.tab} ${status === s ? c.tabActive : ''}`}>
            {s}
          </button>
        ))}
      </div>

      {error ? (
        <div className={c.errorBox}>{error}</div>
      ) : loading ? (
        <div className={c.loadingSm}>
          <div className={c.spinner} />
        </div>
      ) : members.length === 0 ? (
        <div className={c.emptyCard}>
          <p className={styles.emptyMb}>No team members yet.</p>
          <button onClick={() => setModal('create')} className={c.btnBrandSm}>
            + Add First Member
          </button>
        </div>
      ) : status !== 'All' ? (
        <div className={styles.grid3}>
          {members.map(m => <MemberCard key={m._id || m.id} member={m} onEdit={() => setModal(m)} onDelete={() => setDeleteTarget(m)} />)}
        </div>
      ) : (
        <div className={styles.deptGroups}>
          {Object.entries(deptGroups).sort(([a], [b]) => a.localeCompare(b)).map(([dept, deptMembers]) => (
            <div key={dept}>
              <p className={styles.deptLabel}>{dept}</p>
              <div className={styles.grid3}>
                {deptMembers.map(m => <MemberCard key={m._id || m.id} member={m} onEdit={() => setModal(m)} onDelete={() => setDeleteTarget(m)} />)}
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <TeamModal member={modal === 'create' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />
        )}
        {deleteTarget && (
          <DeleteConfirm label={deleteTarget.name} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
        )}
      </AnimatePresence>
    </div>
  )
}

function MemberCard({ member, onEdit, onDelete }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className={styles.card}>
      <div className={styles.cardTop}>
        <div className={styles.cardHead}>
          <Avatar src={member.avatar} name={member.name} />
          <div>
            <p className={styles.name}>{member.name}</p>
            <p className={styles.role}>{member.role}</p>
          </div>
        </div>
        <span className={`${c.badge} ${member.status === 'active' ? c.badgeGreen : c.badgeGray}`}>
          {member.status}
        </span>
      </div>

      {member.bio && (
        <p className={styles.bio}>{member.bio}</p>
      )}

      <div className={styles.contacts}>
        {member.email && (
          <p className={styles.contact}>
            <span className={styles.contactIcon}>✉</span> {member.email}
          </p>
        )}
        {member.phone && (
          <p className={styles.contact}>
            <span className={styles.contactIcon}>☎</span> {member.phone}
          </p>
        )}
      </div>

      <div className={styles.cardBtns}>
        <button onClick={onEdit} className={styles.editBtn}>
          Edit
        </button>
        <button onClick={onDelete} className={`${c.iconBtn} ${c.iconBtnDelete}`}>
          🗑
        </button>
      </div>
    </motion.div>
  )
}
