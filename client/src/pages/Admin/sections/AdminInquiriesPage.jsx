import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../../../services/api'
import { useScrollLock } from '../../../hooks/useScrollLock'
import c from './adminCommon.module.css'
import styles from './AdminInquiriesPage.module.css'

const STATUS_OPTIONS = ['All', 'new', 'contacted', 'qualified', 'converted', 'rejected']
const STATUS_EDITABLE = STATUS_OPTIONS.slice(1)

const statusStyles = {
  new:       c.badgeBlue,
  contacted: c.badgeYellow,
  qualified: c.badgePurple,
  converted: c.badgeGreen,
  rejected:  c.badgeRed,
}

const emptyForm = {
  name: '', phone: '', email: '', destination: '', travelDate: '', travellers: '', message: '', status: 'new',
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function InquiryModal({ inquiry, onClose, onSave }) {
  useScrollLock()
  const isEdit = !!inquiry?._id || !!inquiry?.id
  const [form, setForm] = useState(isEdit ? {
    name:        inquiry.name        || '',
    phone:       inquiry.phone       || '',
    email:       inquiry.email       || '',
    destination: inquiry.destination || '',
    travelDate:  inquiry.travelDate  || '',
    travellers:  inquiry.travellers  || '',
    message:     inquiry.message     || '',
    status:      inquiry.status      || 'new',
  } : { ...emptyForm })
  const [saving, setSaving] = useState(false)
  const [err,    setErr]    = useState('')

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      setErr('Name and phone are required.')
      return
    }
    setSaving(true)
    setErr('')
    try {
      await onSave(form)
      onClose()
    } catch (e) {
      setErr(e.message)
    } finally {
      setSaving(false)
    }
  }

  const textFields = [
    { label: 'Full Name',        key: 'name',        placeholder: 'e.g. Rahul Sharma',        required: true  },
    { label: 'Phone / WhatsApp', key: 'phone',       placeholder: 'e.g. +91 98765 43210',     required: true  },
    { label: 'Email Address',    key: 'email',       placeholder: 'e.g. rahul@email.com',     required: false },
    { label: 'Destination',      key: 'destination', placeholder: 'e.g. Maldives, Bali',      required: false },
    { label: 'Travel Date',      key: 'travelDate',  placeholder: 'e.g. Dec 2025',            required: false },
    { label: 'Travellers',       key: 'travellers',  placeholder: 'e.g. 2 adults, 1 child',   required: false },
  ]

  return (
    <div className={c.overlay} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className={`${c.modal} ${c.modalScroll}`}
      >
        <h3 className={c.modalTitle}>
          {isEdit ? 'Edit Inquiry' : 'Add Inquiry'}
        </h3>

        <div className={c.stack}>
          {textFields.map(field => (
            <div key={field.key}>
              <label className={c.label}>
                {field.label}{field.required && <span className={c.req}> *</span>}
              </label>
              <input
                type="text"
                placeholder={field.placeholder}
                value={form[field.key]}
                onChange={e => f(field.key, e.target.value)}
                className={c.input}
              />
            </div>
          ))}

          <div>
            <label className={c.label}>
              Trip Description
            </label>
            <textarea
              rows={3}
              placeholder="What are they looking for?"
              value={form.message}
              onChange={e => f('message', e.target.value)}
              className={`${c.input} ${c.textarea}`}
            />
          </div>

          <div>
            <label className={c.label}>Status</label>
            <select
              value={form.status}
              onChange={e => f('status', e.target.value)}
              className={`${c.input} ${c.select}`}
            >
              {STATUS_EDITABLE.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {err && <p className={c.formError}>{err}</p>}

        <div className={c.modalActions}>
          <button onClick={onClose} className={`${c.btnOutline} ${c.flex1}`}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className={`${c.btnBrand} ${c.flex1}`}
          >
            {saving ? 'Saving…' : isEdit ? 'Update Inquiry' : 'Add Inquiry'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

function DeleteConfirm({ inquiry, onClose, onConfirm }) {
  const [deleting, setDeleting] = useState(false)
  const handleConfirm = async () => {
    setDeleting(true)
    await onConfirm()
    setDeleting(false)
  }
  return (
    <div className={c.overlay} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className={`${c.modal} ${c.modalSm}`}
      >
        <div className={c.confirmIcon}>🗑️</div>
        <h3 className={c.confirmTitle}>Delete Inquiry?</h3>
        <p className={c.confirmText}>
          <span className={c.strong}>{inquiry.name}</span> will be permanently removed.
        </p>
        <div className={c.actionsTight}>
          <button onClick={onClose} className={`${c.btnOutline} ${c.btnSm} ${c.flex1}`}>Cancel</button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className={`${c.btnDanger} ${c.flex1}`}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function AdminInquiriesPage() {
  const [inquiries,    setInquiries]    = useState([])
  const [total,        setTotal]        = useState(0)
  const [page,         setPage]         = useState(1)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [search,       setSearch]       = useState('')
  const [status,       setStatus]       = useState('All')
  const [modal,        setModal]        = useState(null)  // null | 'create' | inquiry-object
  const [deleteTarget, setDeleteTarget] = useState(null)

  const limit = 20

  const fetchInquiries = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = { page, limit, type: 'inquiry' }
      if (status !== 'All') params.status = status
      if (search.trim())    params.search = search.trim()
      const data = await api.getLeads(params)
      setInquiries(data.leads || [])
      setTotal(data.pagination?.total || 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, status, search])

  useEffect(() => { fetchInquiries() }, [fetchInquiries])

  useEffect(() => {
    const t = setTimeout(() => { if (page !== 1) setPage(1); else fetchInquiries() }, 400)
    return () => clearTimeout(t)
  }, [search]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (form) => {
    if (modal === 'create') {
      await api.submitLead({ ...form, type: 'inquiry' })
    } else {
      const id = modal._id || modal.id
      await api.updateLead(id, form)
    }
    fetchInquiries()
  }

  const handleDelete = async () => {
    const id = deleteTarget._id || deleteTarget.id
    await api.deleteLead(id)
    setDeleteTarget(null)
    fetchInquiries()
  }

  const handleWhatsApp = async (inquiry) => {
    try {
      const data = await api.getWhatsAppLink(inquiry.phone, inquiry.message || '')
      window.open(data.link, '_blank')
    } catch {
      window.open(`https://wa.me/${inquiry.phone?.replace(/\D/g, '')}`, '_blank')
    }
  }

  const handleExport = async () => {
    try {
      const params = { type: 'inquiry' }
      if (status !== 'All') params.status = status
      const res = await api.exportLeads(params)
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href = url
      a.download = `EMV_Inquiries_${Date.now()}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(`Export failed: ${err.message}`)
    }
  }

  const totalPages = Math.ceil(total / limit)
  const pending    = inquiries.filter(i => i.status === 'new' || i.status === 'contacted').length

  return (
    <div className={c.page}>
      {/* Header */}
      <div className={c.header}>
        <div>
          <h2 className={c.title}>Inquiries</h2>
          <p className={c.subtitle}>{total} total · {pending} pending action</p>
        </div>
        <div className={c.headerActions}>
          <button onClick={handleExport} className={c.btnExport}>
            ⬇ Export CSV
          </button>
          <button onClick={() => setModal('create')} className={c.addBtn}>
            + Add Inquiry
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={c.toolbar}>
        <div className={c.searchFlex}>
          <span className={c.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search by name, phone, destination…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={c.searchSolo}
          />
        </div>
        <div className={c.tabRow}>
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1) }}
              className={`${c.tab} ${status === s ? c.tabActive : ''}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className={c.panel}
      >
        {error ? (
          <div className={c.errorCenter}>{error}</div>
        ) : loading ? (
          <div className={c.loadingSm}>
            <div className={c.spinner} />
          </div>
        ) : inquiries.length === 0 ? (
          <div className={c.empty}>
            <p className={c.emptyText} style={{ marginBottom: '1rem' }}>No inquiries found.</p>
            <button onClick={() => setModal('create')} className={c.btnBrandSm}>
              + Add First Inquiry
            </button>
          </div>
        ) : (
          <div className={c.scroll}>
            <table className={c.table}>
              <thead className={styles.thead}>
                <tr>
                  <th className={styles.th}>Client</th>
                  <th className={`${styles.th} ${styles.hideLg}`}>Destination</th>
                  <th className={`${styles.th} ${styles.hideMd}`}>Travel Date</th>
                  <th className={`${styles.th} ${styles.hideXl}`}>Travellers</th>
                  <th className={`${styles.th} ${styles.hideMd}`}>Submitted</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.thRight}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map(inquiry => {
                  const id = inquiry._id || inquiry.id
                  return (
                    <motion.tr
                      key={id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={styles.row}
                    >
                      <td className={styles.td}>
                        <p className={styles.clientName}>{inquiry.name}</p>
                        <p className={styles.clientPhone}>{inquiry.phone}</p>
                        <p className={styles.clientEmail}>{inquiry.email || ''}</p>
                      </td>
                      <td className={`${styles.td} ${styles.hideLg}`}>
                        <p className={styles.cellText}>{inquiry.destination || '—'}</p>
                      </td>
                      <td className={`${styles.td} ${styles.hideMd}`}>
                        <p className={styles.cellText}>{inquiry.travelDate || '—'}</p>
                      </td>
                      <td className={`${styles.td} ${styles.hideXl}`}>
                        <p className={styles.cellText}>{inquiry.travellers || '—'}</p>
                      </td>
                      <td className={`${styles.td} ${styles.cellDate} ${styles.hideMd}`}>
                        {formatDate(inquiry.created_at)}
                      </td>
                      <td className={styles.td}>
                        <span className={`${c.badge} ${statusStyles[inquiry.status] || c.badgeGray}`}>
                          {inquiry.status}
                        </span>
                      </td>
                      <td className={styles.tdRight}>
                        <div className={styles.actions}>
                          {/* WhatsApp */}
                          <button
                            onClick={() => handleWhatsApp(inquiry)}
                            className={`${c.iconBtn} ${c.iconBtnWa}`}
                            title="WhatsApp"
                          >
                            <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.112.555 4.094 1.523 5.813L0 24l6.336-1.499A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.946 0-3.77-.51-5.338-1.4l-.382-.225-3.961.937.997-3.868-.249-.401A9.942 9.942 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                          </button>
                          {/* View message */}
                          {inquiry.message && (
                            <button
                              onClick={() => alert(`Message from ${inquiry.name}:\n\n${inquiry.message}`)}
                              className={`${c.iconBtn} ${c.iconBtnMsg}`}
                              title="View message"
                            >💬</button>
                          )}
                          {/* Edit */}
                          <button
                            onClick={() => setModal(inquiry)}
                            className={`${c.iconBtn} ${c.iconBtnEdit}`}
                            title="Edit inquiry"
                          >✏</button>
                          {/* Delete */}
                          <button
                            onClick={() => setDeleteTarget(inquiry)}
                            className={`${c.iconBtn} ${c.iconBtnDelete}`}
                            title="Delete inquiry"
                          >🗑</button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className={c.pagBar}>
            <p className={c.pagInfo}>Showing {inquiries.length} of {total} inquiries</p>
            <div className={c.pagBtns}>
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className={c.pagBtn}
              >‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`${c.pagBtn} ${p === page ? c.pagBtnActive : ''}`}
                  >{p}</button>
                )
              })}
              <button
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className={c.pagBtn}
              >›</button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {modal && (
          <InquiryModal
            inquiry={modal === 'create' ? null : modal}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
        {deleteTarget && (
          <DeleteConfirm
            inquiry={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
