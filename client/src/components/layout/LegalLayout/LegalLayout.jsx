import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

const LEGAL_LINKS = [
  { label: 'Privacy Policy',           to: '/privacy-policy' },
  { label: 'Cookie Policy',            to: '/cookie-policy' },
  { label: 'Terms of Service',         to: '/terms-of-service' },
  { label: 'User Agreement',           to: '/user-agreement' },
  { label: 'Data Processing Agreement',to: '/data-processing-agreement' },
]

export default function LegalLayout({ title, subtitle, children }) {
  const navigate = useNavigate()

  return (
    <div className="bg-gray-50 min-h-screen pt-[85px] md:pt-[100px]">
      {/* Hero */}
      <div className="bg-dark text-white py-14 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, #E53935 0%, transparent 60%)' }} />
        <div className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 text-gray-400 hover:text-white text-sm font-bold uppercase tracking-[0.2em] transition-colors mb-8 group"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back
          </button>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="text-brand font-black uppercase tracking-[0.3em] text-[11px] mb-4 flex items-center gap-3">
              <span className="w-8 h-[2px] bg-brand" /> Legal
            </span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight mb-4">{title}</h1>
            <p className="text-gray-400 text-sm font-medium">{subtitle}</p>
          </motion.div>
        </div>
      </div>

      {/* Content + Sidebar */}
      <div className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12 py-12 md:py-20">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">

          {/* Sidebar — other legal docs */}
          <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-28">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Legal Documents</p>
            <nav className="space-y-1">
              {LEGAL_LINKS.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-4 py-3 rounded-2xl text-sm font-bold transition-colors ${
                    window.location.hash.includes(link.to)
                      ? 'bg-dark text-white'
                      : 'text-gray-500 hover:bg-white hover:text-dark'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex-1 bg-white rounded-[2.5rem] p-8 sm:p-12 md:p-16 border border-gray-100 shadow-sm min-w-0"
          >
            {children}
          </motion.article>
        </div>
      </div>
    </div>
  )
}

// ── Shared content primitives ─────────────────────────────────────────────────
export function Section({ title }) {
  return <h2 className="text-2xl md:text-3xl font-serif font-bold text-dark mt-12 mb-5 pt-8 border-t border-gray-100 first:border-0 first:pt-0 first:mt-0 tracking-tight">{title}</h2>
}

export function Sub({ title }) {
  return <h3 className="text-lg font-bold text-dark mt-6 mb-3">{title}</h3>
}

export function P({ children }) {
  return <p className="text-gray-500 leading-relaxed mb-4 font-light text-base">{children}</p>
}

export function Ul({ items }) {
  return (
    <ul className="mb-5 space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-gray-500 font-light text-base">
          <span className="w-1.5 h-1.5 rounded-full bg-brand mt-2.5 shrink-0" />
          {item}
        </li>
      ))}
    </ul>
  )
}

export function Highlight({ children }) {
  return (
    <div className="bg-brand/5 border border-brand/15 rounded-2xl px-7 py-5 my-6">
      <p className="text-gray-600 text-sm leading-relaxed font-medium">{children}</p>
    </div>
  )
}

export function Strong({ children }) {
  return <strong className="text-dark font-bold">{children}</strong>
}
