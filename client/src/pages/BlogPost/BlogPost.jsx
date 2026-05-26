import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { api } from '../../services/api'
import styles from './BlogPost.module.css'

const categoryStyle = {
  'Travel Tips':       { background: '#eff6ff', color: '#1d4ed8' },
  'Honeymoon':         { background: '#fdf2f8', color: '#9d174d' },
  'Luxury Travel':     { background: '#faf5ff', color: '#7e22ce' },
  'Destinations':      { background: '#fff7ed', color: '#c2410c' },
  'Family Travel':     { background: '#f0fdf4', color: '#15803d' },
  'Wellness':          { background: '#f0fdfa', color: '#0f766e' },
  'Behind the Scenes': { background: '#fefce8', color: '#a16207' },
  'News':              { background: '#f3f4f6', color: '#374151' },
  'Culture':           { background: '#fff1f2', color: '#be123c' },
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

const mdComponents = {
  h1: ({ children }) => <h2 className={styles.mdH1}>{children}</h2>,
  h2: ({ children }) => <h3 className={styles.mdH2}>{children}</h3>,
  h3: ({ children }) => <h4 className={styles.mdH3}>{children}</h4>,
  p:  ({ children }) => <p  className={styles.mdP}>{children}</p>,
  ul: ({ children }) => <ul className={styles.mdUl}>{children}</ul>,
  ol: ({ children }) => <ol className={styles.mdOl}>{children}</ol>,
  li: ({ children }) => <li className={styles.mdLi}>{children}</li>,
  strong: ({ children }) => <strong className={styles.mdStrong}>{children}</strong>,
  em:     ({ children }) => <em className={styles.mdEm}>{children}</em>,
  blockquote: ({ children }) => <blockquote className={styles.mdBlockquote}>{children}</blockquote>,
  code: ({ inline, children }) => inline
    ? <code className={styles.mdInlineCode}>{children}</code>
    : <pre className={styles.mdPre}><code className={styles.mdCode}>{children}</code></pre>,
  hr: () => <hr className={styles.mdHr} />,
  a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className={styles.mdLink}>{children}</a>,
  table: ({ children }) => <div className={styles.mdTableWrap}><table className={styles.mdTable}>{children}</table></div>,
  th: ({ children }) => <th className={styles.mdTh}>{children}</th>,
  td: ({ children }) => <td className={styles.mdTd}>{children}</td>,
  img: ({ src, alt }) => <img src={src} alt={alt} className={styles.mdImg} />,
}

export default function BlogPost() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const [post,    setPost]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    api.getBlog(id)
      .then(data => setPost(data))
      .catch(err => setError(err.message || 'Post not found'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.spinnerWrap}>
          <div className={styles.spinner} />
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className={styles.page}>
        <div className={styles.inner}>
          <div className={styles.errorWrap}>
            <p className={styles.errorTitle}>Post not found</p>
            <p className={styles.errorDesc}>{error || 'This article may have been moved or deleted.'}</p>
            <button onClick={() => navigate('/blog')} className={styles.backBtn}>← Back to Blog</button>
          </div>
        </div>
      </div>
    )
  }

  const badgeStyle = categoryStyle[post.category] || { background: '#f3f4f6', color: '#374151' }
  const content    = post.content || post.excerpt || ''

  return (
    <div className={styles.page}>
      {/* Cover image */}
      {post.coverImage && (
        <div className={styles.cover}>
          <img src={post.coverImage} alt={post.title} className={styles.coverImg} />
          <div className={styles.coverOverlay} />
        </div>
      )}

      <div className={styles.inner}>
        {/* Back button */}
        <motion.button
          onClick={() => navigate('/blog')}
          className={styles.backBtn}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          whileHover={{ x: -3 }}
        >
          ← Back to Blog
        </motion.button>

        {/* Article header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.33, 1, 0.68, 1] }}
        >
          <div className={styles.meta}>
            <span className={styles.badge} style={badgeStyle}>{post.category}</span>
            <span className={styles.metaDot}>·</span>
            <span className={styles.metaText}>{post.author}</span>
            <span className={styles.metaDot}>·</span>
            <span className={styles.metaText}>{formatDate(post.publishedAt || post.created_at)}</span>
          </div>

          <h1 className={styles.title}>{post.title}</h1>

          {post.excerpt && (
            <p className={styles.excerpt}>{post.excerpt}</p>
          )}
        </motion.div>

        {/* Article body */}
        <motion.article
          className={styles.body}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
            {content}
          </ReactMarkdown>
        </motion.article>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <motion.div
            className={styles.tags}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            {post.tags.map(tag => (
              <span key={tag} className={styles.tag}>#{tag}</span>
            ))}
          </motion.div>
        )}

        {/* Bottom back link */}
        <motion.div
          className={styles.bottomBack}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <button onClick={() => navigate('/blog')} className={styles.backBtnBottom}>
            ← Back to all articles
          </button>
        </motion.div>
      </div>
    </div>
  )
}
