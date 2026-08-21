import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { api } from '../../../services/api'
import { useScrollLock } from '../../../hooks/useScrollLock'
import { handleListKeyDown, toggleLinePrefix, dividerInsertion } from '../../../utils/markdownEditing'
import { normalizeMarkdown } from '../../../utils/blogContent'
import c from './adminCommon.module.css'
import styles from './AdminBlogsPage.module.css'

const CATEGORIES = [
  'Travel Tips', 'Destinations', 'Travel Guides', 'Visa & Entry',
  'Honeymoon', 'Family Travel', 'Luxury Travel', 'Wellness',
  'Behind the Scenes', 'News', 'Culture',
]
const STATUS_OPTIONS = ['All', 'draft', 'published']

const emptyForm = {
  title: '', excerpt: '', content: '', category: 'Travel Tips',
  coverImage: '', coverAlt: '', author: 'Ease My Vacations', tags: '', status: 'draft',
  destination: '', featured: false, editorsPick: false, faqs: '',
}

// FAQs are stored as [{ q, a }] but edited as "Question | Answer" lines —
// keeps the editor simple without needing a repeater UI.
function linesToFaqs(text) {
  return (text || '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const [q, ...rest] = line.split('|')
      return { q: (q || '').trim(), a: rest.join('|').trim() }
    })
    .filter(faq => faq.q && faq.a)
}

function faqsToLines(faqs) {
  return (Array.isArray(faqs) ? faqs : [])
    .map(faq => `${faq.q} | ${faq.a}`)
    .join('\n')
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

const MD_GROUPS = [
  { label: 'Headings', items: [
    { icon: 'H1',  title: 'Heading 1',        type: 'prefix', value: '# '    },
    { icon: 'H2',  title: 'Heading 2',        type: 'prefix', value: '## '   },
    { icon: 'H3',  title: 'Heading 3',        type: 'prefix', value: '### '  },
  ]},
  { label: 'Format', items: [
    { icon: 'B',   title: 'Bold  (Ctrl+B)',   type: 'wrap',   value: '**', ph: 'bold text',   btnStyle: { fontWeight: 800 } },
    { icon: 'I',   title: 'Italic (Ctrl+I)',  type: 'wrap',   value: '*',  ph: 'italic text', btnStyle: { fontStyle: 'italic' } },
    { icon: 'S̶',   title: 'Strikethrough',    type: 'wrap',   value: '~~', ph: 'text',        btnStyle: { textDecoration: 'line-through' } },
    { icon: '`',   title: 'Inline Code',      type: 'wrap',   value: '`',  ph: 'code',        btnStyle: { fontFamily: 'monospace' } },
    { icon: '🔗',  title: 'Link  (Ctrl+K)',   type: 'tpl',    value: '[link text](https://)' },
    { icon: '🖼',  title: 'Image',            type: 'tpl',    value: '![alt text](https://)' },
  ]},
  { label: 'Lists', items: [
    { icon: '•',   title: 'Bullet List',      type: 'prefix', value: '- '      },
    { icon: '1.',  title: 'Numbered List',    type: 'prefix', value: '1. '     },
    { icon: '☑',   title: 'Task / Checklist', type: 'prefix', value: '- [ ] '  },
  ]},
  { label: 'Blocks', items: [
    { icon: '❝',   title: 'Blockquote',       type: 'prefix', value: '> '       },
    { icon: '⊞',   title: 'Table',            type: 'block',  value: '\n| Header 1 | Header 2 | Header 3 |\n| --- | --- | --- |\n| Cell | Cell | Cell |\n' },
    { icon: '—',   title: 'Divider / HR', type: 'divider' },
    { icon: '{ }', title: 'Code Block',       type: 'block',  value: '\n```\n\n```\n', btnStyle: { fontFamily: 'monospace', fontSize: '10px' } },
  ]},
]

function applyBlogAction(content, ta, btn) {
  const start = ta.selectionStart
  const end   = ta.selectionEnd
  const sel   = content.slice(start, end)
  let nv, cs, ce

  if (btn.type === 'wrap') {
    const w = btn.value
    if (sel) {
      nv = content.slice(0, start) + w + sel + w + content.slice(end)
      cs = start + w.length; ce = end + w.length
    } else {
      const ph = btn.ph || 'text'
      nv = content.slice(0, start) + w + ph + w + content.slice(end)
      cs = start + w.length; ce = cs + ph.length
    }
  } else if (btn.type === 'prefix') {
    // Toggles across every line the selection touches, not just the first.
    const toggled = toggleLinePrefix(content, start, end, btn.value)
    nv = toggled.value; cs = ce = toggled.cursor
  } else if (btn.type === 'divider') {
    // A rule needs a blank line above it, or markdown reads it as a setext
    // heading and the divider never appears in the published article.
    const inserted = dividerInsertion(content, end)
    nv = inserted.value; cs = ce = inserted.cursor
  } else if (btn.type === 'block') {
    nv = content.slice(0, start) + btn.value + content.slice(end)
    cs = ce = start + btn.value.length
  } else {
    nv = content.slice(0, start) + btn.value + content.slice(end)
    cs = start; ce = start + btn.value.length
  }
  return { nv, cs, ce }
}

function BlogModal({ blog, onClose, onSave }) {
  useScrollLock()
  const isEdit = !!blog?._id || !!blog?.id
  const [form,      setForm]      = useState(isEdit ? {
    title:      blog.title      || '',
    excerpt:    blog.excerpt    || '',
    content:    blog.content    || '',
    category:   blog.category   || 'Travel Tips',
    coverImage: blog.coverImage || '',
    coverAlt:   blog.coverAlt   || '',
    author:     blog.author     || 'Ease My Vacations',
    tags:       Array.isArray(blog.tags) ? blog.tags.join(', ') : (blog.tags || ''),
    status:     blog.status     || 'draft',
    destination: blog.destination || '',
    featured:    !!blog.featured,
    editorsPick: !!blog.editorsPick,
    faqs:        faqsToLines(blog.faqs),
  } : { ...emptyForm })
  const [saving,    setSaving]    = useState(false)
  const [err,       setErr]       = useState('')
  const [contentTab, setContentTab] = useState('write')

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const insertMarkdown = (btn) => {
    const ta = document.getElementById('blog-content-editor')
    if (!ta) return
    const { nv, cs, ce } = applyBlogAction(form.content, ta, btn)
    f('content', nv)
    setTimeout(() => { ta.focus(); ta.setSelectionRange(cs, ce) }, 0)
  }

  const handleEditorKeyDown = (e) => {
    // Enter at the end of a bullet starts the next one; Enter on an empty
    // bullet leaves the list.
    if (handleListKeyDown(e, form.content, v => f('content', v))) return

    if (e.ctrlKey || e.metaKey) {
      const kmap = {
        b: { type: 'wrap', value: '**', ph: 'bold text' },
        i: { type: 'wrap', value: '*',  ph: 'italic text' },
        k: { type: 'tpl',  value: '[link text](https://)' },
      }
      const btn = kmap[e.key.toLowerCase()]
      if (btn) {
        e.preventDefault()
        const ta = document.getElementById('blog-content-editor')
        if (!ta) return
        const { nv, cs, ce } = applyBlogAction(form.content, ta, btn)
        f('content', nv)
        setTimeout(() => { ta.focus(); ta.setSelectionRange(cs, ce) }, 0)
      }
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = document.getElementById('blog-content-editor')
      if (!ta) return
      const s  = ta.selectionStart
      const nv = form.content.slice(0, s) + '  ' + form.content.slice(s)
      f('content', nv)
      setTimeout(() => { ta.focus(); ta.setSelectionRange(s + 2, s + 2) }, 0)
    }
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) { setErr('Title is required.'); return }
    setSaving(true); setErr('')
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        faqs: linesToFaqs(form.faqs),
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
        className={styles.modalFlex}
      >
        {/* Fixed header */}
        <div className={styles.modalHead}>
          <h3 className={c.modalTitle}>
            {isEdit ? 'Edit Post' : 'New Blog Post'}
          </h3>
        </div>

        {/* Scrollable form body */}
        <div className={`${styles.modalBody} modal-scroll`} onWheel={e => e.stopPropagation()}>
          <div className={c.stack}>
            <div>
              <label className={c.label}>Title <span className={c.req}>*</span></label>
              <input type="text" value={form.title} onChange={e => f('title', e.target.value)}
                placeholder="e.g. Hidden Gems of Santorini"
                className={c.input} />
            </div>

            <div className={c.grid2}>
              <div>
                <label className={c.label}>Category</label>
                <select value={form.category} onChange={e => f('category', e.target.value)}
                  className={`${c.input} ${c.select}`}>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className={c.label}>Status</label>
                <select value={form.status} onChange={e => f('status', e.target.value)}
                  className={`${c.input} ${c.select}`}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            {/* Drives the destination-specific CTA and the matching holidays
                shown inside the article. */}
            <div className={c.grid2}>
              <div>
                <label className={c.label}>Destination</label>
                <input type="text" value={form.destination} onChange={e => f('destination', e.target.value)}
                  placeholder="e.g. Thailand"
                  className={c.input} />
              </div>
              <div>
                <label className={c.label}>Show on the journal landing page</label>
                <div className={styles.flagRow}>
                  <label className={styles.flag}>
                    <input type="checkbox" checked={form.featured}
                      onChange={e => f('featured', e.target.checked)} />
                    Featured guide
                  </label>
                  <label className={styles.flag}>
                    <input type="checkbox" checked={form.editorsPick}
                      onChange={e => f('editorsPick', e.target.checked)} />
                    Editor&rsquo;s pick
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className={c.label}>Excerpt</label>
              <textarea rows={2} value={form.excerpt} onChange={e => f('excerpt', e.target.value)}
                placeholder="Short summary shown in blog cards…"
                className={`${c.input} ${c.textarea}`} />
            </div>

            {/* Content — markdown editor with preview tab */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label className={c.label} style={{ marginBottom: 0 }}>Content (Markdown)</label>
                <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '0.625rem', padding: '0.1875rem', gap: '0.125rem' }}>
                  {[
                    { id: 'write',   label: '✏ Write'   },
                    { id: 'split',   label: '⧉ Split'   },
                    { id: 'preview', label: '👁 Preview' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setContentTab(tab.id)}
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '0.4375rem',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        background: contentTab === tab.id ? '#fff' : 'transparent',
                        color: contentTab === tab.id ? '#111' : '#9ca3af',
                        boxShadow: contentTab === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        transition: 'all 0.15s',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {contentTab === 'write' ? (
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '1rem', overflow: 'hidden' }}>
                  {/* Enhanced grouped toolbar */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2px', padding: '0.5rem 0.75rem', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    {MD_GROUPS.map((group, gi) => (
                      <div key={group.label} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        {gi > 0 && (
                          <span style={{ display: 'inline-block', width: '1px', height: '16px', background: '#d1d5db', margin: '0 6px', flexShrink: 0 }} />
                        )}
                        {group.items.map(btn => (
                          <button
                            key={btn.icon}
                            type="button"
                            title={btn.title}
                            onClick={() => insertMarkdown(btn)}
                            style={{
                              padding: '0.2rem 0.45rem',
                              borderRadius: '0.375rem',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              border: '1px solid transparent',
                              background: 'transparent',
                              color: '#6b7280',
                              cursor: 'pointer',
                              lineHeight: 1.5,
                              transition: 'all 0.12s',
                              ...(btn.btnStyle || {}),
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = '#fff'
                              e.currentTarget.style.borderColor = '#e5e7eb'
                              e.currentTarget.style.color = '#111827'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'transparent'
                              e.currentTarget.style.borderColor = 'transparent'
                              e.currentTarget.style.color = '#6b7280'
                            }}
                          >
                            {btn.icon}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                  <textarea
                    id="blog-content-editor"
                    rows={12}
                    value={form.content}
                    onChange={e => f('content', e.target.value)}
                    onKeyDown={handleEditorKeyDown}
                    placeholder={'# My Article Title\n\nWrite your content here using Markdown.\n\n## Section Heading\n\nUse **bold**, *italic*, ~~strikethrough~~, `code`, - bullets, 1. numbered lists, > blockquotes, and tables.\n\n- [ ] Task item\n- [x] Completed item'}
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
                      maxHeight: '500px',
                      overflowY: 'auto',
                    }}
                  />
                  {/* Footer: word count + shortcuts */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.375rem 0.875rem', background: '#f9fafb', borderTop: '1px solid #e5e7eb', fontSize: '0.6875rem', color: '#9ca3af', fontWeight: 600 }}>
                    <span>
                      {form.content.trim() ? form.content.trim().split(/\s+/).length : 0} words · {form.content.length} chars
                    </span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.5rem', letterSpacing: '0.05em', color: '#d1d5db' }}>
                      Ctrl+B Bold · Ctrl+I Italic · Ctrl+K Link · Enter continues a list
                    </span>
                  </div>
                </div>
              ) : contentTab === 'split' ? (
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '1rem', overflow: 'hidden' }}>
                  {/* Toolbar in split mode */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '2px', padding: '0.5rem 0.75rem', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    {MD_GROUPS.map((group, gi) => (
                      <div key={group.label} style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        {gi > 0 && <span style={{ display: 'inline-block', width: '1px', height: '16px', background: '#d1d5db', margin: '0 6px' }} />}
                        {group.items.map(btn => (
                          <button key={btn.icon} type="button" title={btn.title} onClick={() => insertMarkdown(btn)}
                            style={{ padding: '0.2rem 0.45rem', borderRadius: '0.375rem', fontSize: '0.7rem', fontWeight: 700, border: '1px solid transparent', background: 'transparent', color: '#6b7280', cursor: 'pointer', lineHeight: 1.5, ...(btn.btnStyle || {}) }}
                            onMouseEnter={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.borderColor='#e5e7eb'; e.currentTarget.style.color='#111' }}
                            onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='transparent'; e.currentTarget.style.color='#6b7280' }}
                          >{btn.icon}</button>
                        ))}
                      </div>
                    ))}
                  </div>
                  {/* Split layout */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '280px' }}>
                    <textarea
                      id="blog-content-editor"
                      value={form.content}
                      onChange={e => f('content', e.target.value)}
                      onKeyDown={handleEditorKeyDown}
                      placeholder="Write Markdown here…"
                      style={{ width: '100%', background: '#fff', border: 'none', borderRight: '1px solid #e5e7eb', padding: '0.875rem 1rem', fontFamily: 'ui-monospace, monospace', fontSize: '0.8125rem', color: '#1e293b', lineHeight: 1.7, resize: 'none', outline: 'none', minHeight: '280px' }}
                    />
                    <div style={{ padding: '0.875rem 1.25rem', background: '#fafafa', overflowY: 'auto', minHeight: '280px' }}>
                      {form.content.trim()
                        ? <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdPreviewComponents}>{normalizeMarkdown(form.content)}</ReactMarkdown>
                        : <p style={{ color: '#9ca3af', fontSize: '0.875rem', fontStyle: 'italic' }}>Start typing to see preview…</p>
                      }
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.375rem 0.875rem', background: '#f9fafb', borderTop: '1px solid #e5e7eb', fontSize: '0.6875rem', color: '#9ca3af' }}>
                    <span>{form.content.trim() ? form.content.trim().split(/\s+/).length : 0} words · {form.content.length} chars</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.5rem', color: '#d1d5db' }}>Ctrl+B Bold · Ctrl+I Italic · Ctrl+K Link · Enter continues a list</span>
                  </div>
                </div>
              ) : (
                <div style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '1rem',
                  padding: '1rem 1.25rem',
                  minHeight: '220px',
                  maxHeight: '440px',
                  overflowY: 'auto',
                  background: '#fafafa',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#e5e7eb transparent',
                }}>
                  {form.content.trim() ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdPreviewComponents}>
                      {normalizeMarkdown(form.content)}
                    </ReactMarkdown>
                  ) : (
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem', fontStyle: 'italic' }}>Nothing to preview yet. Switch to Write and add some content.</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className={c.label}>Cover Image URL</label>
              <input type="text" value={form.coverImage} onChange={e => f('coverImage', e.target.value)}
                placeholder="https://…"
                className={c.input} />
            </div>

            <div>
              <label className={c.label}>Cover image alt text</label>
              <input type="text" value={form.coverAlt} onChange={e => f('coverAlt', e.target.value)}
                placeholder="e.g. Longtail boats on Railay beach, Krabi"
                className={c.input} />
              <p className={styles.fieldHint}>
                Describe what the photo actually shows. Don&rsquo;t stuff keywords &mdash; screen readers and
                search engines both read this.
              </p>
            </div>

            <div>
              <label className={c.label}>Article FAQs</label>
              <textarea rows={5} value={form.faqs} onChange={e => f('faqs', e.target.value)}
                placeholder={'Do Indians need a visa for Thailand? | Visa on arrival is available…\nHow many days are enough for Thailand? | Seven to ten days covers…'}
                className={c.input} />
              <p className={styles.fieldHint}>
                One per line, as <code>Question | Answer</code>. These render as an accordion at the
                bottom of the article and as Google FAQ rich-result markup.
              </p>
            </div>

            <div className={c.grid2}>
              <div>
                <label className={c.label}>Author</label>
                <input type="text" value={form.author} onChange={e => f('author', e.target.value)}
                  placeholder="Ease My Vacations"
                  className={c.input} />
              </div>
              <div>
                <label className={c.label}>Tags (comma-separated)</label>
                <input type="text" value={form.tags} onChange={e => f('tags', e.target.value)}
                  placeholder="travel, europe, tips"
                  className={c.input} />
              </div>
            </div>
          </div>

          {err && <p className={c.formError}>{err}</p>}
        </div>

        {/* Fixed footer */}
        <div className={styles.modalFoot}>
          <div className={styles.footRow}>
            <button onClick={onClose} className={`${c.btnOutline} ${c.flex1}`}>Cancel</button>
            <button onClick={handleSubmit} disabled={saving}
              className={`${c.btnBrand} ${c.flex1}`}>
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
    <div className={c.overlay} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className={`${c.modal} ${c.modalSm}`}
      >
        <div className={c.confirmIcon}>🗑️</div>
        <h3 className={c.confirmTitle}>Delete Post?</h3>
        <p className={c.confirmText}>
          <span className={c.strong}>{label}</span> will be permanently removed.
        </p>
        <div className={c.actionsTight}>
          <button onClick={onClose} className={`${c.btnOutline} ${c.btnSm} ${c.flex1}`}>Cancel</button>
          <button onClick={async () => { setDeleting(true); await onConfirm(); setDeleting(false) }}
            disabled={deleting}
            className={`${c.btnDanger} ${c.flex1}`}>
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

  const statusBadge = (s) => s === 'published' ? c.badgeGreen : c.badgeYellow

  return (
    <div className={c.page}>
      <div className={c.header}>
        <div>
          <h2 className={c.title}>Blog</h2>
          <p className={c.subtitle}>{total} total · {published} published</p>
        </div>
        <button onClick={() => setModal('create')} className={c.addBtn}>
          + New Post
        </button>
      </div>

      <div className={c.tabRow}>
        {STATUS_OPTIONS.map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(1) }}
            className={`${c.tab} ${status === s ? c.tabActive : ''}`}>
            {s}
          </button>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className={c.panel}>
        {error ? (
          <div className={c.errorCenter}>{error}</div>
        ) : loading ? (
          <div className={c.loadingSm}>
            <div className={c.spinner} />
          </div>
        ) : blogs.length === 0 ? (
          <div className={c.empty}>
            <p className={c.emptyText} style={{ marginBottom: '1rem' }}>No posts yet.</p>
            <button onClick={() => setModal('create')} className={c.btnBrandSm}>
              + Write First Post
            </button>
          </div>
        ) : (
          <div className={c.scroll}>
            <table className={c.table}>
              <thead className={styles.thead}>
                <tr>
                  <th className={styles.th}>Title</th>
                  <th className={`${styles.th} ${styles.hideMd}`}>Category</th>
                  <th className={`${styles.th} ${styles.hideMd}`}>Author</th>
                  <th className={`${styles.th} ${styles.hideMd}`}>Date</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.thRight}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map(blog => {
                  const id = blog._id || blog.id
                  return (
                    <motion.tr key={id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className={styles.row}>
                      <td className={styles.titleCell}>
                        <p className={styles.titleText}>{blog.title}</p>
                        <p className={styles.excerptText}>{blog.excerpt || '—'}</p>
                      </td>
                      <td className={`${styles.td} ${styles.cellMuted} ${styles.hideMd}`}>{blog.category}</td>
                      <td className={`${styles.td} ${styles.cellMuted} ${styles.hideMd}`}>{blog.author}</td>
                      <td className={`${styles.td} ${styles.cellDate} ${styles.hideMd}`}>
                        {formatDate(blog.publishedAt || blog.created_at)}
                      </td>
                      <td className={styles.td}>
                        <span className={`${c.badge} ${statusBadge(blog.status)}`}>
                          {blog.status}
                        </span>
                      </td>
                      <td className={styles.tdRight}>
                        <div className={styles.actions}>
                          <button onClick={() => setModal(blog)}
                            className={`${c.iconBtn} ${c.iconBtnEdit}`}
                            title="Edit post">✏</button>
                          <button onClick={() => setDeleteTarget(blog)}
                            className={`${c.iconBtn} ${c.iconBtnDelete}`}
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
          <div className={c.pagBar}>
            <p className={c.pagInfo}>Showing {blogs.length} of {total} posts</p>
            <div className={c.pagBtns}>
              <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}
                className={c.pagBtn}>‹</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`${c.pagBtn} ${p === page ? c.pagBtnActive : ''}`}>{p}</button>
                )
              })}
              <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}
                className={c.pagBtn}>›</button>
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
