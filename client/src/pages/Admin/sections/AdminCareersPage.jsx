import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../../../services/api'
import Pagination from '../../../components/admin/Pagination'
import { useScrollLock } from '../../../hooks/useScrollLock'

const DEPARTMENTS = ['Sales', 'Operations', 'Marketing', 'Technology', 'Management', 'Customer Support']
const JOB_TYPES   = ['Full-time', 'Part-time', 'Remote', 'Hybrid']
const STATUS_OPTIONS = ['All', 'open', 'closed']

const emptyForm = {
  title: '', department: 'Sales', location: 'Gurugram',
  type: 'Full-time', description: '', requirements: '', status: 'open',
}

function CareerModal({ job, onClose, onSave }) {
  useScrollLock()
  const isEdit = !!job?._id || !!job?.id
  const [form,   setForm]   = useState(isEdit ? {
    title:        job.title        || '',
    department:   job.department   || 'Sales',
    location:     job.location     || 'Gurugram',
    type:         job.type         || 'Full-time',
    description:  job.description  || '',
    requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : (job.requirements || ''),
    status:       job.status       || 'open',
  } : { ...emptyForm })
  const [saving, setSaving] = useState(false)
  const [err,    setErr]    = useState('')

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setErr('Title and description are required.')
      return
    }
    setSaving(true); setErr('')
    try {
      const payload = {
        ...form,
        requirements: form.requirements.split('\n').map(r => r.trim()).filter(Boolean),
      }
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
        onWheel={e => e.stopPropagation()}
      >
        <h3 className="text-3xl font-serif font-bold text-dark mb-8">
          {isEdit ? 'Edit Job Posting' : 'New Job Posting'}
        </h3>

        <div className="space-y-5">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Job Title <span className="text-brand">*</span></label>
            <input type="text" value={form.title} onChange={e => f('title', e.target.value)}
              placeholder="e.g. Travel Sales Executive"
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors" />
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
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Location</label>
              <input type="text" value={form.location} onChange={e => f('location', e.target.value)}
                placeholder="Gurugram / Remote"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors" />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Type</label>
              <select value={form.type} onChange={e => f('type', e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors cursor-pointer">
                {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Description <span className="text-brand">*</span></label>
              <span className="text-[9px] text-gray-400 font-medium">Use ## for heading, - for bullet points</span>
            </div>
            <textarea rows={5} value={form.description} onChange={e => f('description', e.target.value)}
              placeholder={"Describe the role and responsibilities…\n\n## Responsibilities\n- Manage client relationships\n- Coordinate with operations team"}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-medium text-sm focus:outline-none focus:border-brand transition-colors resize-none font-mono" />
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Requirements (one per line)</label>
            <textarea rows={4} value={form.requirements} onChange={e => f('requirements', e.target.value)}
              placeholder={"2+ years in travel sales\nExcellent communication skills\nKnowledge of GDS systems"}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-medium text-sm focus:outline-none focus:border-brand transition-colors resize-none" />
          </div>
        </div>

        {err && <p className="mt-4 text-red-500 text-sm font-bold">{err}</p>}

        <div className="flex gap-4 mt-8">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-4 rounded-full font-bold hover:bg-gray-50 transition-colors text-sm">Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 bg-brand text-white py-4 rounded-full font-bold hover:bg-brand-hover transition-colors shadow-glow text-sm disabled:opacity-50">
            {saving ? 'Saving…' : isEdit ? 'Update Posting' : 'Create Posting'}
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
        <h3 className="text-xl font-serif font-bold text-dark mb-2">Delete Posting?</h3>
        <p className="text-gray-500 text-sm font-medium mb-8">
          <span className="font-bold text-dark">{label}</span> will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-full font-bold hover:bg-gray-50 text-sm">Cancel</button>
          <button onClick={async () => { setDeleting(true); await onConfirm(); setDeleting(false) }} disabled={deleting}
            className="flex-1 bg-red-500 text-white py-3 rounded-full font-bold hover:bg-red-600 text-sm disabled:opacity-50">
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function AdminCareersPage() {
  const [jobs,         setJobs]         = useState([])
  const [total,        setTotal]        = useState(0)
  const [page,         setPage]         = useState(1)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [status,       setStatus]       = useState('All')
  const [modal,        setModal]        = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const limit = 10

  const fetchJobs = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const params = { page, limit }
      if (status !== 'All') params.status = status
      const data = await api.getCareers(params)
      setJobs(data.careers || [])
      setTotal(data.pagination?.total || 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [status, page])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  useEffect(() => { setPage(1) }, [status])

  const handleSave = async (form) => {
    if (modal === 'create') {
      await api.createCareer(form)
    } else {
      await api.updateCareer(modal._id || modal.id, form)
    }
    fetchJobs()
  }

  const handleDelete = async () => {
    await api.deleteCareer(deleteTarget._id || deleteTarget.id)
    setDeleteTarget(null)
    fetchJobs()
  }

  const totalPages = Math.ceil(total / limit)
  const open   = jobs.filter(j => j.status === 'open').length
  const closed = jobs.filter(j => j.status === 'closed').length

  const typeBadge = (type) => {
    const map = {
      'Full-time': 'bg-blue-50 text-blue-700 border-blue-100',
      'Part-time': 'bg-purple-50 text-purple-700 border-purple-100',
      'Remote':    'bg-green-50 text-green-700 border-green-100',
      'Hybrid':    'bg-orange-50 text-orange-700 border-orange-100',
    }
    return map[type] || 'bg-gray-50 text-gray-500 border-gray-100'
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-serif font-bold text-dark tracking-tight">Careers</h2>
          <p className="text-gray-400 mt-1 font-medium">{open} open · {closed} closed</p>
        </div>
        <button onClick={() => setModal('create')}
          className="bg-brand text-white px-7 py-3.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-brand-hover transition-colors shadow-glow">
          + New Posting
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
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm px-8 py-16 text-center">
          <p className="text-gray-400 font-bold mb-4">No job postings yet.</p>
          <button onClick={() => setModal('create')} className="bg-brand text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-brand-hover transition-colors">
            + Create First Posting
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => {
            const id = job._id || job.id
            return (
              <motion.div key={id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-brand/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-1.5">
                    <h3 className="font-bold text-dark text-lg group-hover:text-brand transition-colors">{job.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-[0.15em] ${typeBadge(job.type)}`}>
                      {job.type}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-[0.15em] ${job.status === 'open' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm font-medium">{job.department} · {job.location}</p>
                  {job.description && (
                    <p className="text-gray-400 text-sm mt-1.5 line-clamp-2">{job.description}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity sm:opacity-100">
                  <button onClick={() => setModal(job)}
                    className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-colors text-sm flex items-center justify-center shadow-sm"
                    title="Edit posting">✏</button>
                  <button onClick={() => setDeleteTarget(job)}
                    className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors text-sm flex items-center justify-center shadow-sm"
                    title="Delete posting">🗑</button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        showing={jobs.length}
        onPage={setPage}
        label="postings"
      />

      <AnimatePresence>
        {modal && (
          <CareerModal job={modal === 'create' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />
        )}
        {deleteTarget && (
          <DeleteConfirm label={deleteTarget.title} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
        )}
      </AnimatePresence>
    </div>
  )
}
