import { useState } from 'react'
import { motion } from 'framer-motion'
import { leads } from '../../../data/leads'
import { openWhatsApp } from '../../../utils/whatsapp'
import { exportToCSV } from '../../../utils/csv'

const statusStyles = {
  Quoted:    'bg-brand/5 text-brand border-brand/20',
  Pending:   'bg-yellow-50 text-yellow-700 border-yellow-100',
  Converted: 'bg-green-50 text-green-700 border-green-100',
}

const allLeads = [
  ...leads,
  { id: 4, client: 'Priya & Arjun Mehta', ref: 'EMV-2026-004', journey: 'Maldives Overwater Escape', pax: 2, date: '18 May 2026', status: 'Pending' },
  { id: 5, client: 'Ravi Kapoor Family',   ref: 'EMV-2026-005', journey: 'Swiss Alps Adventure',     pax: 4, date: '17 May 2026', status: 'Quoted' },
  { id: 6, client: 'Sana & Faraz Khan',    ref: 'EMV-2026-006', journey: 'Dubai Extravagance',       pax: 2, date: '16 May 2026', status: 'Converted' },
  { id: 7, client: 'Vikram Sharma',        ref: 'EMV-2026-007', journey: 'Bali Wellness Retreat',    pax: 1, date: '15 May 2026', status: 'Pending' },
  { id: 8, client: 'Anjali & Rohan Nair',  ref: 'EMV-2026-008', journey: 'Romantic European Escapade', pax: 2, date: '14 May 2026', status: 'Quoted' },
]

export default function AdminLeadsPage() {
  const [search,   setSearch]   = useState('')
  const [status,   setStatus]   = useState('All')
  const [selected, setSelected] = useState(null)

  const filtered = allLeads.filter(l => {
    const matchSearch = l.client.toLowerCase().includes(search.toLowerCase()) || l.journey.toLowerCase().includes(search.toLowerCase())
    const matchStatus = status === 'All' || l.status === status
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-serif font-bold text-dark tracking-tight">Inquiries</h2>
          <p className="text-gray-400 mt-1 font-medium">{allLeads.length} total leads · {allLeads.filter(l => l.status === 'Pending').length} pending action</p>
        </div>
        <button
          onClick={() => exportToCSV(allLeads, 'EMV_Leads.csv')}
          className="bg-dark text-white px-7 py-3.5 rounded-full text-sm font-bold flex items-center gap-3 hover:bg-black transition-colors shadow-sm"
        >
          ⬇ Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-5 py-3 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-brand focus:bg-white transition-colors font-bold text-dark shadow-sm"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Pending', 'Quoted', 'Converted'].map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${status === s ? 'bg-dark text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-brand hover:text-brand'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-600">
            <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-black border-b border-gray-100 tracking-[0.2em]">
              <tr>
                <th className="px-8 py-5 text-left">Client</th>
                <th className="px-8 py-5 text-left">Journey</th>
                <th className="px-8 py-5 text-left hidden md:table-cell">Date</th>
                <th className="px-8 py-5 text-left">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(lead => (
                <tr key={lead.id} className="hover:bg-gray-50/60 transition-colors group">
                  <td className="px-8 py-5">
                    <p className="font-bold text-dark group-hover:text-brand transition-colors">{lead.client}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Ref: {lead.ref}</p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="font-bold text-dark">{lead.journey}</p>
                    <span className="bg-gray-100 text-gray-500 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-[0.15em] mt-1 inline-block">{lead.pax} Pax</span>
                  </td>
                  <td className="px-8 py-5 text-gray-500 font-medium hidden md:table-cell">{lead.date}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-[0.15em] ${statusStyles[lead.status]}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setSelected(selected?.id === lead.id ? null : lead)}
                        className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-colors text-sm flex items-center justify-center shadow-sm"
                      >✏</button>
                      <button
                        onClick={() => openWhatsApp(lead.journey)}
                        className="w-9 h-9 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors flex items-center justify-center shadow-sm"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.112.555 4.094 1.523 5.813L0 24l6.336-1.499A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.946 0-3.77-.51-5.338-1.4l-.382-.225-3.961.937.997-3.868-.249-.401A9.942 9.942 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-8 py-4 border-t border-gray-50 flex items-center justify-between">
          <p className="text-sm text-gray-400 font-bold">Showing {filtered.length} of {allLeads.length} leads</p>
          <div className="flex gap-1">
            {[1,2,3].map(p => (
              <button key={p} className={`w-8 h-8 rounded-lg text-sm font-bold ${p === 1 ? 'bg-dark text-white' : 'text-gray-500 hover:bg-gray-100'}`}>{p}</button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
