import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../../../services/api'
import { useScrollLock } from '../../../hooks/useScrollLock'

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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-[2.5rem] p-10 w-full max-w-2xl shadow-premium border border-gray-100 max-h-[90vh] overflow-y-auto modal-scroll"
      >
        <h3 className="text-3xl font-serif font-bold text-dark mb-8">
          {isEdit ? 'Edit Team Member' : 'Add Team Member'}
        </h3>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Full Name <span className="text-brand">*</span></label>
              <input type="text" value={form.name} onChange={e => f('name', e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors" />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Designation <span className="text-brand">*</span></label>
              <input type="text" value={form.role} onChange={e => f('role', e.target.value)}
                placeholder="e.g. Senior Travel Consultant"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Department</label>
              <select value={form.department} onChange={e => f('department', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors cursor-pointer">
                {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Status</label>
              <select value={form.status} onChange={e => f('status', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors cursor-pointer">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Email</label>
              <input type="email" value={form.email} onChange={e => f('email', e.target.value)}
                placeholder="priya@emvglobal.in"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors" />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Phone</label>
              <input type="text" value={form.phone} onChange={e => f('phone', e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Bio</label>
            <textarea rows={3} value={form.bio} onChange={e => f('bio', e.target.value)}
              placeholder="Brief professional bio…"
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-medium text-sm focus:outline-none focus:border-brand transition-colors resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Avatar URL</label>
              <input type="text" value={form.avatar} onChange={e => f('avatar', e.target.value)}
                placeholder="https://…"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors" />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Joined Date</label>
              <input type="date" value={form.joinedAt} onChange={e => f('joinedAt', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors" />
            </div>
          </div>
        </div>

        {err && <p className="mt-4 text-red-500 text-sm font-bold">{err}</p>}

        <div className="flex gap-4 mt-8">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-4 rounded-full font-bold hover:bg-gray-50 transition-colors text-sm">Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 bg-brand text-white py-4 rounded-full font-bold hover:bg-brand-hover transition-colors shadow-glow text-sm disabled:opacity-50">
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-premium border border-gray-100 text-center"
      >
        <div className="text-4xl mb-4">🗑️</div>
        <h3 className="text-xl font-serif font-bold text-dark mb-2">Remove Member?</h3>
        <p className="text-gray-500 text-sm font-medium mb-8">
          <span className="font-bold text-dark">{label}</span> will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-full font-bold hover:bg-gray-50 text-sm">Cancel</button>
          <button onClick={async () => { setDeleting(true); await onConfirm(); setDeleting(false) }} disabled={deleting}
            className="flex-1 bg-red-500 text-white py-3 rounded-full font-bold hover:bg-red-600 text-sm disabled:opacity-50">
            {deleting ? 'Removing…' : 'Remove'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function Avatar({ src, name }) {
  const initials = name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?'
  if (src) return <img src={src} alt={name} className="w-10 h-10 rounded-2xl object-cover flex-shrink-0" />
  return (
    <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-bold text-sm flex-shrink-0">
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-serif font-bold text-dark tracking-tight">Team</h2>
          <p className="text-gray-400 mt-1 font-medium">{active} active · {inactive} inactive</p>
        </div>
        <button onClick={() => setModal('create')}
          className="bg-brand text-white px-7 py-3.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-brand-hover transition-colors shadow-glow">
          + Add Member
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all capitalize ${status === s ? 'bg-dark text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-brand hover:text-brand'}`}>
            {s}
          </button>
        ))}
      </div>

      {error ? (
        <div className="text-red-500 font-bold px-6 py-4 bg-red-50 rounded-2xl">{error}</div>
      ) : loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : members.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-8 py-16 text-center">
          <p className="text-gray-400 font-bold mb-4">No team members yet.</p>
          <button onClick={() => setModal('create')} className="bg-brand text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-brand-hover transition-colors">
            + Add First Member
          </button>
        </div>
      ) : status !== 'All' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map(m => <MemberCard key={m._id || m.id} member={m} onEdit={() => setModal(m)} onDelete={() => setDeleteTarget(m)} />)}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(deptGroups).sort(([a], [b]) => a.localeCompare(b)).map(([dept, deptMembers]) => (
            <div key={dept}>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-4">{dept}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
      className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 group hover:border-brand/30 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar src={member.avatar} name={member.name} />
          <div>
            <p className="font-bold text-dark group-hover:text-brand transition-colors">{member.name}</p>
            <p className="text-xs text-gray-400 font-bold mt-0.5">{member.role}</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-[0.1em] ${member.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
          {member.status}
        </span>
      </div>

      {member.bio && (
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{member.bio}</p>
      )}

      <div className="space-y-1.5 mb-5">
        {member.email && (
          <p className="text-xs text-gray-500 font-medium flex items-center gap-2">
            <span className="text-gray-300">✉</span> {member.email}
          </p>
        )}
        {member.phone && (
          <p className="text-xs text-gray-500 font-medium flex items-center gap-2">
            <span className="text-gray-300">☎</span> {member.phone}
          </p>
        )}
      </div>

      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit}
          className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-xs font-bold hover:border-blue-200 hover:text-blue-600 transition-colors">
          Edit
        </button>
        <button onClick={onDelete}
          className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors text-sm flex items-center justify-center">
          🗑
        </button>
      </div>
    </motion.div>
  )
}
