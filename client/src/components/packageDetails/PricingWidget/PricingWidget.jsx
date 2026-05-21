import { motion } from 'framer-motion'
import { openWhatsApp } from '../../../utils/whatsapp'
import styles from './PricingWidget.module.css'

const breakdown = [
  { label: 'Flights', value: 'Included', icon: '✈' },
  { label: 'Hotels', value: '4★ Premium', icon: '🏨' },
  { label: 'Transfers', value: 'Private', icon: '🚗' },
]

export default function PricingWidget() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.2, ease: [0.33, 1, 0.68, 1] }}
      className="sticky top-[120px] bg-white rounded-[3rem] shadow-premium border border-gray-200 p-10 md:p-12"
    >
      <div className="border-b border-gray-100 pb-10 mb-10">
        <span className="text-sm font-black text-gray-400 tracking-[0.3em] uppercase mb-4 block">Total Estimate</span>
        <div className="flex items-baseline gap-3">
          <span className="text-6xl font-serif font-bold text-dark tracking-tight">₹1.47L</span>
          <span className="text-gray-500 font-bold text-lg">/ person</span>
        </div>
        <p className="text-[10px] text-gray-400 mt-6 font-black bg-gray-50 p-4 rounded-xl border border-gray-100 uppercase tracking-[0.2em] leading-relaxed">
          Flight approx. ₹28,000 included in estimate.
        </p>
      </div>

      <div className="space-y-6 mb-12 bg-gray-50 rounded-[2rem] p-8 border border-gray-100">
        {breakdown.map((item, i) => (
          <div key={i}>
            {i > 0 && <div className="w-full h-[2px] bg-gray-200/60 mb-6" />}
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-bold flex items-center gap-4 text-base">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-xs">{item.icon}</div>
                {item.label}
              </span>
              <span className="font-black text-dark text-sm uppercase tracking-widest">{item.value}</span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => openWhatsApp('Romantic European Escapade')}
        className="w-full bg-dark text-white py-6 rounded-full font-bold text-xl shadow-float flex justify-center items-center gap-4 mb-6 hover:bg-black transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-whatsapp">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.112.555 4.094 1.523 5.813L0 24l6.336-1.499A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.946 0-3.77-.51-5.338-1.4l-.382-.225-3.961.937.997-3.868-.249-.401A9.942 9.942 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
        Request Quote
      </button>

      <div className="mt-10 pt-10 border-t border-gray-100 flex justify-center gap-12 text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">
        <span className="flex flex-col items-center gap-3">🛡️ Secure</span>
        <span className="flex flex-col items-center gap-3">🎧 Support</span>
      </div>
    </motion.div>
  )
}
