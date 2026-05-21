import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

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
            <div className="flex items-center gap-3">
              {['I', 'F', 'L'].map((s, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/30 transition-all text-sm font-bold">
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="col-span-1 md:col-span-8 lg:col-span-7 grid grid-cols-3 gap-8 md:gap-12">
            <div>
              <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-5">Discover</h5>
              <ul className="space-y-3.5">
                {[['Destinations', '/destinations'], ['Journeys', '/packages'], ['Our Ethos', '/about']].map(([l, p]) => (
                  <li key={p}><Link to={p} className="text-gray-400 hover:text-white transition-colors font-light text-sm md:text-base">{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-5">Support</h5>
              <ul className="space-y-3.5">
                {['FAQ', 'Visa Guidance', 'Terms', 'Privacy'].map(l => (
                  <li key={l}><a href="#" className="text-gray-400 hover:text-white transition-colors font-light text-sm md:text-base">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-5">Contact</h5>
              <ul className="space-y-3.5">
                <li className="text-gray-400 font-light text-sm md:text-base break-all">concierge@emvglobal.in</li>
                <li className="text-gray-400 font-light text-sm md:text-base">+91 98765 43210</li>
                <li className="text-gray-400 font-light text-sm md:text-base">WhatsApp 24/7</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-900 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-gray-600 text-xs md:text-sm font-medium text-center sm:text-left">© {new Date().getFullYear()} EaseMyVacations Global. All rights reserved.</p>
          <p className="text-gray-600 text-xs md:text-sm font-medium">Crafted with precision. Delivered with passion.</p>
        </div>
      </div>
    </footer>
  )
}
