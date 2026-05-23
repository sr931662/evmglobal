import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

const socials = [
  { label: 'Instagram', href: 'https://www.instagram.com/_emvglobal', icon: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )},
  { label: 'Facebook', href: 'https://www.facebook.com/emvglobal', icon: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  )},
  { label: 'X / Twitter', href: 'https://www.x.com/_emvglobal', icon: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  )},
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/emvglobal', icon: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )},
  { label: 'YouTube', href: 'https://www.youtube.com/emvglobal', icon: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )},
]

export default function Footer() {
  return (
    <footer className="bg-dark text-white pt-14 md:pt-24 pb-8 md:pb-12 mt-auto border-t border-gray-900">
      <div className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 mb-10 md:mb-20">

          {/* Brand */}
          <div className="col-span-1 md:col-span-4 lg:col-span-5">
            <Link to="/" className="flex items-center gap-3 mb-6 w-fit group">
              <div className="w-11 h-11 rounded-xl bg-brand flex items-center justify-center text-white font-serif font-bold text-2xl group-hover:scale-105 transition-transform shadow-glow">E</div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-[26px] tracking-tight leading-none">EMV</span>
                <span className="text-gray-400 font-sans text-[10px] font-black uppercase tracking-[0.3em] leading-none mt-1.5">Global</span>
              </div>
            </Link>
            <p className="text-gray-400 text-base leading-relaxed mb-8 font-light max-w-sm">
              Your premium travel concierge. We craft bespoke journeys and unforgettable memories, providing high-touch service from inspiration to return.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              {socials.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={s.label}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 hover:bg-white/10 transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="col-span-1 md:col-span-8 lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-12">
            <div>
              <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-5">Discover</h5>
              <ul className="space-y-3.5">
                {[
                  ['Destinations', '/destinations'],
                  ['Journeys',     '/packages'],
                  ['About Us',     '/about'],
                ].map(([l, p]) => (
                  <li key={p}>
                    <Link to={p} className="text-gray-400 hover:text-white transition-colors font-light text-sm md:text-base">{l}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-5">Legal</h5>
              <ul className="space-y-3.5">
                {[
                  ['Privacy Policy',    '/privacy-policy'],
                  ['Cookie Policy',     '/cookie-policy'],
                  ['Terms of Service',  '/terms-of-service'],
                  ['User Agreement',    '/user-agreement'],
                  ['Data Processing',   '/data-processing-agreement'],
                ].map(([l, p]) => (
                  <li key={p}>
                    <Link to={p} className="text-gray-400 hover:text-white transition-colors font-light text-sm md:text-base">{l}</Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-5">Contact</h5>
              <ul className="space-y-3.5">
                <li className="text-gray-400 font-light text-sm md:text-base break-all">concierge@emvglobal.in</li>
                <li className="text-gray-400 font-light text-sm md:text-base">Gurugram, Haryana</li>
                <li className="text-gray-400 font-light text-sm md:text-base">WhatsApp 24/7</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-900 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-gray-600 text-xs md:text-sm font-medium text-center sm:text-left">© {new Date().getFullYear()} Ease My Vacations Global Private Limited. All rights reserved.</p>
          <p className="text-gray-600 text-xs md:text-sm font-medium">Crafted with precision. Delivered with passion.</p>
        </div>
      </div>
    </footer>
  )
}
