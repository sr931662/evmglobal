import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { api } from '../../../services/api'
import { useScrollLock } from '../../../hooks/useScrollLock'

const CATEGORIES = ['Travel Tips', 'Destinations', 'Behind the Scenes', 'News', 'Culture']
const STATUS_OPTIONS = ['All', 'draft', 'published']

const emptyForm = {
  title: '', excerpt: '', content: '', category: 'Travel Tips',
  coverImage: '', author: 'EMV Global', tags: '', status: 'draft',
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const mdPreviewComponents = {
  h1: ({ children }) => <h2 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1.375rem', color: '#111', margin: '1.25rem 0 0.5rem', lineHeight: 1.25 }}>{children}</h2>,
  h2: ({ children }) => <h3 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1.125rem', color: '#111', margin: '1rem 0 0.375rem', lineHeight: 1.3 }}>{children}</h3>,
  h3: ({ children }) => <h4 style={{ fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '1rem', color: '#111', margin: '0.875rem 0 0.25rem' }}>{children}</h4>,
  p:  ({ children }) => <p style={{ color: '#374151', fontSize: '0.9375rem', lineHeight: 1.75, margin: '0.5rem 0' }}>{children}</p>,
  ul: ({ children }) => <ul style={{ paddingLeft: '1.25rem', margin: '0.5rem 0', listStyleType: 'disc' }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ paddingLeft: '1.25rem', margin: '0.5rem 0', listStyleType: 'decimal' }}>{children}</ol>,
  li: ({ children }) => <li style={{ color: '#374151', fontSize: '0.9375rem', lineHeight: 1.65, marginBottom: '0.2rem' }}>{children}</li>,
  strong: ({ children }) => <strong style={{ fontWeight: 700, color: '#111' }}>{children}</strong>,
  em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
  blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid #E53935', paddingLeft: '0.875rem', margin: '0.875rem 0', color: '#6b7280', fontStyle: 'italic' }}>{children}</blockquote>,
  code: ({ inline, children }) => inline
    ? <code style={{ background: '#f3f4f6', padding: '0.1em 0.35em', borderRadius: '0.25rem', fontSize: '0.85em', fontFamily: 'monospace', color: '#be123c' }}>{children}</code>
    : <pre style={{ background: '#1e293b', borderRadius: '0.5rem', padding: '0.75rem 1rem', margin: '0.75rem 0', overflowX: 'auto' }}><code style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: '#e2e8f0' }}>{children}</code></pre>,
  hr: () => <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '1rem 0' }} />,
  a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#E53935', textDecoration: 'underline' }}>{children}</a>,
  table: ({ children }) => <div style={{ overflowX: 'auto', margin: '0.75rem 0' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>{children}</table></div>,
  th: ({ children }) => <th style={{ background: '#f9fafb', padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 700, borderBottom: '2px solid #e5e7eb' }}>{children}</th>,
  td: ({ children }) => <td style={{ padding: '0.5rem 0.75rem', color: '#6b7280', borderBottom: '1px solid #f3f4f6' }}>{children}</td>,
}

const MD_SHORTCUTS = [
  { label: 'H1',   insert: '# ',     title: 'Heading 1' },
  { label: 'H2',   insert: '## ',    title: 'Heading 2' },
  { label: 'H3',   insert: '### ',   title: 'Heading 3' },
  { label: 'B',    insert: '**bold**',  title: 'Bold', wrap: true },
  { label: 'I',    insert: '*italic*',  title: 'Italic', wrap: true },
  { label: '—',    insert: '\n---\n',   title: 'Divider' },
  { label: '• ',   insert: '- ',     title: 'Bullet list' },
  { label: '1.',   insert: '1. ',    title: 'Numbered list' },
  { label: '"',    insert: '> ',     title: 'Blockquote' },
  { label: '`',    insert: '`code`', title: 'Inline code', wrap: true },
]

function BlogModal({ blog, onClose, onSave }) {
  useScrollLock()
  const isEdit = !!blog?._id || !!blog?.id
  const [form,      setForm]      = useState(isEdit ? {
    title:      blog.title      || '',
    excerpt:    blog.excerpt    || '',
    content:    blog.content    || '',
    category:   blog.category   || 'Travel Tips',
    coverImage: blog.coverImage || '',
    author:     blog.author     || 'EMV Global',
    tags:       Array.isArray(blog.tags) ? blog.tags.join(', ') : (blog.tags || ''),
    status:     blog.status     || 'draft',
  } : { ...emptyForm })
  const [saving,    setSaving]    = useState(false)
  const [err,       setErr]       = useState('')
  const [contentTab, setContentTab] = useState('write')

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const insertMarkdown = (shortcut) => {
    const ta = document.getElementById('blog-content-editor')
    if (!ta) return
    const start = ta.selectionStart
    const end   = ta.selectionEnd
    const selected = form.content.slice(start, end)
    let insertion
    if (shortcut.wrap && selected) {
      const tag = shortcut.insert.split('text')[0] || shortcut.insert.split('code')[0] || shortcut.insert.match(/^[^a-z]*/)[0]
      insertion = tag + selected + tag
    } else {
      insertion = shortcut.insert
    }
    const next = form.content.slice(0, start) + insertion + form.content.slice(end)
    f('content', next)
    setTimeout(() => {
      ta.focus()
      const cursor = start + insertion.length
      ta.setSelectionRange(cursor, cursor)
    }, 0)
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) { setErr('Title is required.'); return }
    setSaving(true); setErr('')
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
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
        className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-premium border border-gray-100 flex flex-col"
        style={{ maxHeight: '92vh' }}
      >
        {/* Fixed header */}
        <div className="px-10 pt-10 pb-0 shrink-0">
          <h3 className="text-3xl font-serif font-bold text-dark mb-8">
            {isEdit ? 'Edit Post' : 'New Blog Post'}
          </h3>
        </div>

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto px-10 pb-2 modal-scroll">
          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Title <span className="text-brand">*</span></label>
              <input type="text" value={form.title} onChange={e => f('title', e.target.value)}
                placeholder="e.g. Hidden Gems of Santorini"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Category</label>
                <select value={form.category} onChange={e => f('category', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors cursor-pointer">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Status</label>
                <select value={form.status} onChange={e => f('status', e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors cursor-pointer capitalize">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Excerpt</label>
              <textarea rows={2} value={form.excerpt} onChange={e => f('excerpt', e.target.value)}
                placeholder="Short summary shown in blog cards…"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors resize-none" />
            </div>

            {/* Content — markdown editor with preview tab */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Content (Markdown)</label>
                <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '0.625rem', padding: '0.1875rem', gap: '0.125rem' }}>
                  {['write', 'preview'].map(tab => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setContentTab(tab)}
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '0.4375rem',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                        background: contentTab === tab ? '#fff' : 'transparent',
                        color: contentTab === tab ? '#111' : '#9ca3af',
                        boxShadow: contentTab === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        transition: 'all 0.15s',
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {contentTab === 'write' ? (
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '1rem', overflow: 'hidden' }}>
                  {/* Markdown toolbar */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', padding: '0.5rem 0.75rem', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    {MD_SHORTCUTS.map(s => (
                      <button
                        key={s.label}
                        type="button"
                        title={s.title}
                        onClick={() => insertMarkdown(s)}
                        style={{
                          padding: '0.2rem 0.5rem',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          fontFamily: 'monospace',
                          border: '1px solid #e5e7eb',
                          background: '#fff',
                          color: '#374151',
                          cursor: 'pointer',
                          lineHeight: 1.5,
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    id="blog-content-editor"
                    rows={12}
                    value={form.content}
                    onChange={e => f('content', e.target.value)}
                    placeholder={'# My Article Title\n\nWrite your content here. Use **bold**, *italic*, ## headings, - bullet lists, and more.\n\n## Section Heading\n\nYour paragraph text goes here...'}
                    style={{
                      width: '100%',
                      background: '#fff',
                      border: 'none',
                      padding: '0.875rem 1rem',
                      fontFamily: 'ui-monospace, monospace',
                      fontSize: '0.8125rem',
                      color: '#1e293b',
                      lineHeight: 1.7,
                      resize: 'vertical',
                      outline: 'none',
                      boxSizing: 'border-box',
                      minHeight: '220px',
                      maxHeight: '480px',
                      overflowY: 'auto',
                    }}
                  />
                </div>
              ) : (
                <div style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '1rem',
                  padding: '1rem 1.25rem',
                  minHeight: '220px',
                  maxHeight: '360px',
                  overflowY: 'auto',
                  background: '#fafafa',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#e5e7eb transparent',
                }}>
                  {form.content.trim() ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdPreviewComponents}>
                      {form.content}
                    </ReactMarkdown>
                  ) : (
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem', fontStyle: 'italic' }}>Nothing to preview yet. Switch to Write and add some content.</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Cover Image URL</label>
              <input type="text" value={form.coverImage} onChange={e => f('coverImage', e.target.value)}
                placeholder="https://…"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Author</label>
                <input type="text" value={form.author} onChange={e => f('author', e.target.value)}
                  placeholder="EMV Global"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Tags (comma-separated)</label>
                <input type="text" value={form.tags} onChange={e => f('tags', e.target.value)}
                  placeholder="travel, europe, tips"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors" />
              </div>
            </div>
          </div>

          {err && <p className="mt-4 text-red-500 text-sm font-bold">{err}</p>}
        </div>

        {/* Fixed footer */}
        <div className="px-10 py-6 shrink-0 border-t border-gray-100">
          <div className="flex gap-4">
            <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-4 rounded-full font-bold hover:bg-gray-50 transition-colors text-sm">Cancel</button>
            <button onClick={handleSubmit} disabled={saving}
              className="flex-1 bg-brand text-white py-4 rounded-full font-bold hover:bg-brand-hover transition-colors shadow-glow text-sm disabled:opacity-50">
              {saving ? 'Saving…' : isEdit ? 'Update Post' : 'Publish Post'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function DeleteConfirm({ item, label, onClose, onConfirm }) {
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
        <h3 className="text-xl font-serif font-bold text-dark mb-2">Delete Post?</h3>
        <p className="text-gray-500 text-sm font-medium mb-8">
          <span className="font-bold text-dark">{label}</span> will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-full font-bold hover:bg-gray-50 text-sm">Cancel</button>
          <button onClick={async () => { setDeleting(true); await onConfirm(); setDeleting(false) }}
            disabled={deleting}
            className="flex-1 bg-red-500 text-white py-3 rounded-full font-bold hover:bg-red-600 text-sm disabled:opacity-50">
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function AdminBlogsPage() {
  const [blogs,        setBlogs]        = useState([])
  const [total,        setTotal]        = useState(0)
  const [page,         setPage]         = useState(1)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [status,       setStatus]       = useState('All')
  const [modal,        setModal]        = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const limit = 20

  const fetchBlogs = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const params = { page, limit }
      if (status !== 'All') params.status = status
      const data = await api.getBlogs(params)
      setBlogs(data.blogs || [])
      setTotal(data.pagination?.total || 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [page, status])

  useEffect(() => { fetchBlogs() }, [fetchBlogs])

  const handleSave = async (form) => {
    if (modal === 'create') {
      await api.createBlog(form)
    } else {
      await api.updateBlog(modal._id || modal.id, form)
    }
    fetchBlogs()
  }

  const handleDelete = async () => {
    await api.deleteBlog(deleteTarget._id || deleteTarget.id)
    setDeleteTarget(null)
    fetchBlogs()
  }

  const totalPages = Math.ceil(total / limit)
  const published  = blogs.filter(b => b.status === 'published').length

  const statusBadge = (s) => s === 'published'
    ? 'bg-green-50 text-green-700 border-green-100'
    : 'bg-yellow-50 text-yellow-700 border-yellow-100'

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-serif font-bold text-dark tracking-tight">Blog</h2>
          <p className="text-gray-400 mt-1 font-medium">{total} total · {published} published</p>
        </div>
        <button onClick={() => setModal('create')}
          className="bg-brand text-white px-7 py-3.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-brand-hover transition-colors shadow-glow">
          + New Post
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(1) }}
            className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all capitalize ${status === s ? 'bg-dark text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-brand hover:text-brand'}`}>
            {s}
          </button>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {error ? (
          <div className="px-8 py-12 text-center text-red-500 font-bold">{error}</div>
        ) : loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="px-8 py-16 text-center">
            <p className="text-gray-400 font-bold mb-4">No posts yet.</p>
            <button onClick={() => setModal('create')} className="bg-brand text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-brand-hover transition-colors">
              + Write First Post
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-600">
              <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-black border-b border-gray-100 tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-5 text-left">Title</th>
                  <th className="px-8 py-5 text-left hidden md:table-cell">Category</th>
                  <th className="px-8 py-5 text-left hidden md:table-cell">Author</th>
                  <th className="px-8 py-5 text-left hidden md:table-cell">Date</th>
                  <th className="px-8 py-5 text-left">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {blogs.map(blog => {
                  const id = blog._id || blog.id
                  return (
                    <motion.tr key={id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="hover:bg-gray-50/60 transition-colors group">
                      <td className="px-8 py-5 max-w-[260px]">
                        <p className="font-bold text-dark group-hover:text-brand transition-colors truncate">{blog.title}</p>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5 truncate">{blog.excerpt || '—'}</p>
                      </td>
                      <td className="px-8 py-5 text-gray-500 hidden md:table-cell">{blog.category}</td>
                      <td className="px-8 py-5 text-gray-500 font-medium hidden md:table-cell">{blog.author}</td>
                      <td className="px-8 py-5 text-gray-500 font-medium hidden md:table-cell whitespace-nowrap">
                        {formatDate(blog.publishedAt || blog.created_at)}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-[0.15em] ${statusBadge(blog.status)}`}>
                          {blog.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setModal(blog)}
                            className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-colors text-sm flex items-center justify-center shadow-sm"
                            title="Edit post">✏</button>
                          <button onClick={() => setDeleteTarget(blog)}
                            className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors text-sm flex items-center justify-center shadow-sm"
                            title="Delete post">🗑</button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-8 py-4 border-t border-gray-50 flex items-center justify-between">
            <p className="text-sm text-gray-400 font-bold">Showing {blogs.length} of {total} posts</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-100 disabled:opacity-30">‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-bold ${p === page ? 'bg-dark text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{p}</button>
                )
              })}
              <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}
                className="w-8 h-8 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-100 disabled:opacity-30">›</button>
            </div>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {modal && (
          <BlogModal blog={modal === 'create' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} />
        )}
        {deleteTarget && (
          <DeleteConfirm item={deleteTarget} label={deleteTarget.title} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} />
        )}
      </AnimatePresence>
    </div>
  )
}
