import { motion } from 'framer-motion'
import { openWhatsApp } from '../../../utils/whatsapp'

export default function HomeCTA() {
  return (
    <section className="py-12 md:py-24 bg-white">
      <div className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.33, 1, 0.68, 1] }}
          className="relative overflow-hidden bg-dark rounded-2xl md:rounded-[2rem] p-8 sm:p-10 md:p-14 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-premium border border-gray-800 group"
        >
          <div className="absolute -right-40 -top-40 w-[500px] h-[500px] bg-brand/10 rounded-full blur-[100px] pointer-events-none group-hover:scale-125 transition-transform duration-[2s]" />
          <div className="max-w-xl relative z-10">
            <span className="text-brand font-black uppercase tracking-[0.3em] text-[11px] mb-5 block">Begin Your Journey</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-4 tracking-tight leading-[1.1]">
              Begin your<br />next chapter.
            </h2>
            <p className="text-gray-400 font-light text-base md:text-lg leading-relaxed">
              Share your dream. Our expert concierge will craft a journey unlike anything a booking platform can offer.
            </p>
          </div>
          <button
            onClick={() => openWhatsApp()}
            className="relative z-10 bg-white text-dark px-8 py-4 rounded-full font-bold text-base shadow-float flex items-center gap-3 whitespace-nowrap hover:bg-gray-100 transition-colors shrink-0"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-whatsapp">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.112.555 4.094 1.523 5.813L0 24l6.336-1.499A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.946 0-3.77-.51-5.338-1.4l-.382-.225-3.961.937.997-3.868-.249-.401A9.942 9.942 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
            Chat with an Expert
          </button>
        </motion.div>
      </div>
    </section>
  )
}
