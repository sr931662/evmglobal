import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { openWhatsApp } from '../../../utils/whatsapp'
import styles from './PackageCard.module.css'

export default function PackageCard({ pkg, index }) {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 1, delay: (index % 3) * 0.1, ease: [0.33, 1, 0.68, 1] }}
      className="bg-white rounded-[1.75rem] p-3 border border-gray-200 shadow-glass bento-hover flex flex-col group"
    >
      <div className="relative h-56 rounded-[1.25rem] overflow-hidden cursor-pointer" onClick={() => navigate('/package-details')}>
        <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
        <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-xl px-5 py-2.5 rounded-full text-sm font-bold text-dark shadow-sm flex items-center gap-2">
          <span className="text-brand">◑</span> {pkg.nights} Nights
        </div>
        {pkg.badge && (
          <div className={`absolute top-6 right-6 ${pkg.badgeVariant === 'dark' ? 'bg-dark text-white' : 'bg-brand text-white shadow-glow'} px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]`}>
            {pkg.badge}
          </div>
        )}
      </div>

      <div className="p-5 md:p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">
          📍 {pkg.location}
        </div>
        <h3
          className="text-2xl font-serif font-bold text-dark mb-3 leading-tight group-hover:text-brand transition-colors tracking-tight cursor-pointer"
          onClick={() => navigate('/package-details')}
        >
          {pkg.title}
        </h3>
        <p className="text-gray-500 font-light text-base mb-6 line-clamp-2 leading-relaxed">{pkg.description}</p>

        <div className="flex flex-wrap gap-2 mb-6">
          {pkg.amenities.map((a, i) => (
            <span key={i} className="bg-gray-50 text-gray-600 text-sm font-bold px-4 py-2.5 rounded-2xl flex items-center gap-2 border border-gray-100">
              <span className="text-brand">✦</span> {a.label}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-5 border-t border-gray-100 flex items-end justify-between">
          <div>
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] block mb-2">{pkg.priceLabel}</span>
            <span className="font-serif font-bold text-3xl text-dark tracking-tight">{pkg.pricePerAdult}</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => openWhatsApp(pkg.title)}
              className="bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white w-14 h-14 rounded-full flex items-center justify-center transition-colors"
              title="WhatsApp"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.112.555 4.094 1.523 5.813L0 24l6.336-1.499A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.946 0-3.77-.51-5.338-1.4l-.382-.225-3.961.937.997-3.868-.249-.401A9.942 9.942 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
            </button>
            <button
              onClick={() => navigate('/package-details')}
              className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center text-dark group-hover:bg-brand group-hover:text-white transition-all duration-500 group-hover:-rotate-45"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
