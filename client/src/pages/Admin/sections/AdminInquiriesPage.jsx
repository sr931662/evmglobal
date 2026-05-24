import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../../../services/api'

const STATUS_OPTIONS = ['All', 'new', 'contacted', 'qualified', 'converted', 'rejected']
const STATUS_EDITABLE = STATUS_OPTIONS.slice(1)

const statusStyles = {
  new:       'bg-blue-50 text-blue-700 border-blue-100',
  contacted: 'bg-yellow-50 text-yellow-700 border-yellow-100',
  qualified: 'bg-purple-50 text-purple-700 border-purple-100',
  converted: 'bg-green-50 text-green-700 border-green-100',
  rejected:  'bg-red-50 text-red-500 border-red-100',
}

const emptyForm = {
  name: '', phone: '', email: '', destination: '', travelDate: '', travellers: '', message: '', status: 'new',
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function InquiryModal({ inquiry, onClose, onSave }) {
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-premium border border-gray-100 max-h-[90vh] overflow-y-auto"
      >
        <h3 className="text-3xl font-serif font-bold text-dark mb-8">
          {isEdit ? 'Edit Inquiry' : 'Add Inquiry'}
        </h3>

        <div className="space-y-5">
          {textFields.map(field => (
            <div key={field.key}>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">
                {field.label}{field.required && <span className="text-brand ml-1">*</span>}
              </label>
              <input
                type="text"
                placeholder={field.placeholder}
                value={form[field.key]}
                onChange={e => f(field.key, e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors"
              />
            </div>
          ))}

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">
              Trip Description
            </label>
            <textarea
              rows={3}
              placeholder="What are they looking for?"
              value={form.message}
              onChange={e => f('message', e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors resize-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Status</label>
            <select
              value={form.status}
              onChange={e => f('status', e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors cursor-pointer capitalize"
            >
              {STATUS_EDITABLE.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
            </select>
          </div>
        </div>

        {err && <p className="mt-4 text-red-500 text-sm font-bold">{err}</p>}

        <div className="flex gap-4 mt-8">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-4 rounded-full font-bold hover:bg-gray-50 transition-colors text-sm">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 bg-brand text-white py-4 rounded-full font-bold hover:bg-brand-hover transition-colors shadow-glow text-sm disabled:opacity-50"
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-premium border border-gray-100 text-center"
      >
        <div className="text-4xl mb-4">🗑️</div>
        <h3 className="text-xl font-serif font-bold text-dark mb-2">Delete Inquiry?</h3>
        <p className="text-gray-500 text-sm font-medium mb-8">
          <span className="font-bold text-dark">{inquiry.name}</span> will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-full font-bold hover:bg-gray-50 text-sm">Cancel</button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="flex-1 bg-red-500 text-white py-3 rounded-full font-bold hover:bg-red-600 text-sm disabled:opacity-50"
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-serif font-bold text-dark tracking-tight">Inquiries</h2>
          <p className="text-gray-400 mt-1 font-medium">{total} total · {pending} pending action</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="border border-gray-200 text-gray-600 px-6 py-3.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
          >
            ⬇ Export CSV
          </button>
          <button
            onClick={() => setModal('create')}
            className="bg-brand text-white px-7 py-3.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-brand-hover transition-colors shadow-glow"
          >
            + Add Inquiry
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search by name, phone, destination…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-5 py-3 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-brand transition-colors font-bold text-dark shadow-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1) }}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all capitalize ${status === s ? 'bg-dark text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-brand hover:text-brand'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
      >
        {error ? (
          <div className="px-8 py-12 text-center text-red-500 font-bold">{error}</div>
        ) : loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="px-8 py-16 text-center">
            <p className="text-gray-400 font-bold mb-4">No inquiries found.</p>
            <button onClick={() => setModal('create')} className="bg-brand text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-brand-hover transition-colors">
              + Add First Inquiry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-600">
              <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-black border-b border-gray-100 tracking-[0.2em]">
                <tr>
                  <th className="px-6 py-5 text-left">Client</th>
                  <th className="px-6 py-5 text-left hidden lg:table-cell">Destination</th>
                  <th className="px-6 py-5 text-left hidden md:table-cell">Travel Date</th>
                  <th className="px-6 py-5 text-left hidden xl:table-cell">Travellers</th>
                  <th className="px-6 py-5 text-left hidden md:table-cell">Submitted</th>
                  <th className="px-6 py-5 text-left">Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {inquiries.map(inquiry => {
                  const id = inquiry._id || inquiry.id
                  return (
                    <motion.tr
                      key={id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50/60 transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <p className="font-bold text-dark group-hover:text-brand transition-colors">{inquiry.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{inquiry.phone}</p>
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">{inquiry.email || ''}</p>
                      </td>
                      <td className="px-6 py-5 hidden lg:table-cell">
                        <p className="font-medium text-dark">{inquiry.destination || '—'}</p>
                      </td>
                      <td className="px-6 py-5 hidden md:table-cell">
                        <p className="font-medium text-dark">{inquiry.travelDate || '—'}</p>
                      </td>
                      <td className="px-6 py-5 hidden xl:table-cell">
                        <p className="font-medium text-dark">{inquiry.travellers || '—'}</p>
                      </td>
                      <td className="px-6 py-5 text-gray-500 font-medium hidden md:table-cell whitespace-nowrap">
                        {formatDate(inquiry.created_at)}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-[0.15em] ${statusStyles[inquiry.status] || 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                          {inquiry.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* WhatsApp */}
                          <button
                            onClick={() => handleWhatsApp(inquiry)}
                            className="w-9 h-9 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors flex items-center justify-center shadow-sm"
                            title="WhatsApp"
                          >
                            <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.112.555 4.094 1.523 5.813L0 24l6.336-1.499A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.946 0-3.77-.51-5.338-1.4l-.382-.225-3.961.937.997-3.868-.249-.401A9.942 9.942 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                          </button>
                          {/* View message */}
                          {inquiry.message && (
                            <button
                              onClick={() => alert(`Message from ${inquiry.name}:\n\n${inquiry.message}`)}
                              className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-brand hover:border-brand/30 transition-colors text-sm flex items-center justify-center shadow-sm"
                              title="View message"
                            >💬</button>
                          )}
                          {/* Edit */}
                          <button
                            onClick={() => setModal(inquiry)}
                            className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-colors text-sm flex items-center justify-center shadow-sm"
                            title="Edit inquiry"
                          >✏</button>
                          {/* Delete */}
                          <button
                            onClick={() => setDeleteTarget(inquiry)}
                            className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors text-sm flex items-center justify-center shadow-sm"
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
          <div className="px-8 py-4 border-t border-gray-50 flex items-center justify-between">
            <p className="text-sm text-gray-400 font-bold">Showing {inquiries.length} of {total} inquiries</p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-100 disabled:opacity-30"
              >‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-bold ${p === page ? 'bg-dark text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                  >{p}</button>
                )
              })}
              <button
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-100 disabled:opacity-30"
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
