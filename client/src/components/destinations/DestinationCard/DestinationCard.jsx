import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import styles from './DestinationCard.module.css'

export default function DestinationCard({ dest, index }) {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 1.2, delay: (index % 4) * 0.12, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => navigate('/packages')}
      className="h-[380px] relative rounded-[1.75rem] overflow-hidden group cursor-pointer shadow-glass bento-hover"
    >
      <img src={dest.image} alt={dest.name} className="absolute inset-0 w-full h-full object-cover img-zoom" />
      <div className="absolute inset-0 card-vignette opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute top-8 right-8 z-10">
        <div className="w-12 h-12 rounded-full glass flex items-center justify-center text-white group-hover:bg-brand group-hover:border-brand transition-all duration-500 group-hover:-rotate-45">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"/></svg>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 p-7 flex flex-col justify-end z-10">
        <span className="text-brand text-[10px] font-black uppercase tracking-[0.3em] mb-1.5 drop-shadow-md">{dest.region}</span>
        <h3 className="text-3xl font-serif font-bold text-white mb-1 tracking-tight">{dest.name}</h3>
        <p className="text-white/80 font-light text-sm">{dest.country}</p>
      </div>
    </motion.div>
  )
}
