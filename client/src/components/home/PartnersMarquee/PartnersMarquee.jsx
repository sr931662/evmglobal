import styles from './PartnersMarquee.module.css'

const partners = ['Emirates', 'IATA', 'Taj Resorts', 'Marriott', 'Four Seasons', 'Emirates', 'IATA', 'Taj Resorts', 'Marriott', 'Four Seasons']

export default function PartnersMarquee() {
  return (
    <div className="py-16 bg-white border-b border-gray-100 overflow-hidden relative z-20">
      <div className="max-w-[95rem] mx-auto px-6 mb-10 text-center">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Partnered with Excellence</p>
      </div>
      <div className="relative w-full marquee-mask">
        <div className={`flex whitespace-nowrap ${styles.track} items-center opacity-40 hover:opacity-100 transition-opacity duration-700`}>
          {[...partners, ...partners].map((p, i) => (
            <span key={i} className="mx-10 md:mx-16 text-2xl md:text-4xl font-serif font-bold italic text-gray-800 tracking-wider">
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
