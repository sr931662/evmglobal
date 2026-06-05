import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../../../services/api'
import Pagination from '../../../components/admin/Pagination'
import { useScrollLock } from '../../../hooks/useScrollLock'
import c from './adminCommon.module.css'
import styles from './AdminCareersPage.module.css'

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
    <div className={c.overlay} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }} transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className={`${c.modal} ${c.modalLg} ${c.modalScroll} modal-scroll`}
        onWheel={e => e.stopPropagation()}
      >
        <h3 className={c.modalTitle}>
          {isEdit ? 'Edit Job Posting' : 'New Job Posting'}
        </h3>

        <div className={c.stack}>
          <div>
            <label className={c.label}>Job Title <span className={c.req}>*</span></label>
            <input type="text" value={form.title} onChange={e => f('title', e.target.value)}
              placeholder="e.g. Travel Sales Executive"
              className={c.input} />
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
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className={c.grid2}>
            <div>
              <label className={c.label}>Location</label>
              <input type="text" value={form.location} onChange={e => f('location', e.target.value)}
                placeholder="Gurugram / Remote"
                className={c.input} />
            </div>
            <div>
              <label className={c.label}>Type</label>
              <select value={form.type} onChange={e => f('type', e.target.value)}
                className={`${c.input} ${c.select}`}>
                {JOB_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <div className={c.labelRow}>
              <label className={c.label} style={{ marginBottom: 0 }}>Description <span className={c.req}>*</span></label>
              <span className={c.labelHint}>Use ## for heading, - for bullet points</span>
            </div>
            <textarea rows={5} value={form.description} onChange={e => f('description', e.target.value)}
              placeholder={"Describe the role and responsibilities…\n\n## Responsibilities\n- Manage client relationships\n- Coordinate with operations team"}
              className={`${c.input} ${c.textareaMono}`} />
          </div>

          <div>
            <label className={c.label}>Requirements (one per line)</label>
            <textarea rows={4} value={form.requirements} onChange={e => f('requirements', e.target.value)}
              placeholder={"2+ years in travel sales\nExcellent communication skills\nKnowledge of GDS systems"}
              className={`${c.input} ${c.textarea}`} />
          </div>
        </div>

        {err && <p className={c.formError}>{err}</p>}

        <div className={c.modalActions}>
          <button onClick={onClose} className={`${c.btnOutline} ${c.flex1}`}>Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className={`${c.btnBrand} ${c.flex1}`}>
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
    <div className={c.overlay} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className={`${c.modal} ${c.modalSm}`}
      >
        <div className={c.confirmIcon}>🗑️</div>
        <h3 className={c.confirmTitle}>Delete Posting?</h3>
        <p className={c.confirmText}>
          <span className={c.strong}>{label}</span> will be permanently removed.
        </p>
        <div className={c.actionsTight}>
          <button onClick={onClose} className={`${c.btnOutline} ${c.btnSm} ${c.flex1}`}>Cancel</button>
          <button onClick={async () => { setDeleting(true); await onConfirm(); setDeleting(false) }} disabled={deleting}
            className={`${c.btnDanger} ${c.flex1}`}>
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

  const typeBadge = (type) => ({
    'Full-time': c.badgeBlue,
    'Part-time': c.badgePurple,
    'Remote':    c.badgeGreen,
    'Hybrid':    c.badgeOrange,
  }[type] || c.badgeGray)

  return (
    <div className={c.page}>
      <div className={c.header}>
        <div>
          <h2 className={c.title}>Careers</h2>
          <p className={c.subtitle}>{open} open · {closed} closed</p>
        </div>
        <button onClick={() => setModal('create')} className={c.addBtn}>
          + New Posting
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
      ) : jobs.length === 0 ? (
        <div className={c.emptyCard}>
          <p className={styles.emptyMb}>No job postings yet.</p>
          <button onClick={() => setModal('create')} className={c.btnBrandSm}>
            + Create First Posting
          </button>
        </div>
      ) : (
        <div className={c.listStack}>
          {jobs.map(job => {
            const id = job._id || job.id
            return (
              <motion.div key={id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className={styles.listRow}>
                <div className={styles.rowMain}>
                  <div className={styles.rowTop}>
                    <h3 className={styles.rowTitle}>{job.title}</h3>
                    <span className={`${c.badge} ${typeBadge(job.type)}`}>
                      {job.type}
                    </span>
                    <span className={`${c.badge} ${job.status === 'open' ? c.badgeGreen : c.badgeGray}`}>
                      {job.status}
                    </span>
                  </div>
                  <p className={styles.dept}>{job.department} · {job.location}</p>
                  {job.description && (
                    <p className={styles.desc}>{job.description}</p>
                  )}
                </div>
                <div className={c.actionsInline}>
                  <button onClick={() => setModal(job)}
                    className={`${c.iconBtn} ${c.iconBtnEdit}`}
                    title="Edit posting">✏</button>
                  <button onClick={() => setDeleteTarget(job)}
                    className={`${c.iconBtn} ${c.iconBtnDelete}`}
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
