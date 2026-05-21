import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaBars } from 'react-icons/fa6'
import MobileMenu from '../MobileMenu/MobileMenu'
import { openWhatsApp } from '../../../utils/whatsapp'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  const isDarkHero = ['/', '/package-details'].includes(location.pathname)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setScrolled(false) }, [location.pathname])

  const textColor = isDarkHero ? 'text-white' : 'text-dark'
  const scrolledBg = isDarkHero ? 'rgba(10,10,10,0.85)' : 'rgba(255,255,255,0.97)'
  const borderClass = scrolled && !isDarkHero ? 'border-gray-200/70' : 'border-transparent'

  return (
    <>
      <nav
        id="navbar"
        className={`fixed w-full z-50 transition-all duration-500 border-b ${borderClass} ${styles.navbar} ${scrolled ? styles.scrolled : ''}`}
        style={{ padding: scrolled ? '16px 0' : '24px 0', backgroundColor: scrolled ? scrolledBg : 'transparent' }}
      >
        <div className="max-w-[95rem] mx-auto px-6 sm:px-8 lg:px-12 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 cursor-pointer">
            <div className="w-12 h-12 rounded-[14px] bg-brand flex items-center justify-center text-white font-serif font-bold text-2xl shadow-glow">E</div>
            <div className={`flex flex-col ${textColor} transition-colors duration-300`}>
              <span className="font-serif font-bold text-[24px] tracking-tight leading-none">EMV</span>
              <span className="text-brand font-sans text-[10px] font-black uppercase tracking-[0.25em] leading-none mt-1.5">Global</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-2 glass px-2 py-2 rounded-full transition-all duration-500">
            {[['Destinations', '/destinations'], ['Journeys', '/packages'], ['Our Ethos', '/about']].map(([label, path]) => (
              <Link key={path} to={path} className="px-6 py-2.5 rounded-full text-base font-bold text-gray-700 hover:text-dark hover:bg-white/80 transition-all">
                {label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/admin" className={`text-sm font-bold ${textColor} hover:text-brand transition-colors duration-300 tracking-[0.15em] uppercase`}>
              Workspace
            </Link>
            <button onClick={() => openWhatsApp('Bespoke Trip Planning')} className="bg-white text-dark px-8 py-4 rounded-full text-base font-bold hover:bg-gray-100 transition-all shadow-float flex items-center gap-3 group">
              <span className="text-whatsapp text-xl group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.112.555 4.094 1.523 5.813L0 24l6.336-1.499A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.946 0-3.77-.51-5.338-1.4l-.382-.225-3.961.937.997-3.868-.249-.401A9.942 9.942 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
              </span>
              Plan Trip
            </button>
          </div>

          <button className="md:hidden glass p-4 rounded-full flex items-center justify-center text-dark" onClick={() => setMenuOpen(true)}>
            <FaBars className="text-xl" />
          </button>
        </div>
      </nav>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
