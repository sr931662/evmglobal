import { useState } from 'react'
import { leads } from '../../../data/leads'
import { openWhatsApp } from '../../../utils/whatsapp'
import styles from './LeadsTable.module.css'

const statusStyles = {
  Quoted: 'bg-brand/10 text-brand border-brand/20',
  Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Converted: 'bg-green-100 text-green-700 border-green-200',
}

export default function LeadsTable() {
  const [search, setSearch] = useState('')
  const filtered = leads.filter(l =>
    l.client.toLowerCase().includes(search.toLowerCase()) ||
    l.journey.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-10 py-8 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center bg-white gap-6">
        <h3 className="font-bold text-dark text-xl">Recent Inquiries</h3>
        <div className="relative w-full sm:w-auto">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full sm:w-80 pl-12 pr-5 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-brand focus:bg-white transition-colors font-bold text-dark"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50/50 text-[10px] uppercase text-gray-500 font-black border-b border-gray-100 tracking-[0.2em]">
            <tr>
              <th className="px-10 py-6">Client Profile</th>
              <th className="px-10 py-6">Requested Journey</th>
              <th className="px-10 py-6">Date</th>
              <th className="px-10 py-6">Status</th>
              <th className="px-10 py-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-base">
            {filtered.map(lead => (
              <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-10 py-6">
                  <div className="font-bold text-dark text-lg group-hover:text-brand transition-colors">{lead.client}</div>
                  <div className="text-sm text-gray-400 mt-2 font-bold uppercase tracking-widest">Ref: {lead.ref}</div>
                </td>
                <td className="px-10 py-6">
                  <div className="font-bold text-dark">{lead.journey}</div>
                  <div className="mt-2"><span className="bg-gray-100 text-gray-500 text-[10px] font-black px-3 py-1.5 rounded-md uppercase tracking-[0.2em]">{lead.pax} Pax</span></div>
                </td>
                <td className="px-10 py-6 text-gray-500 font-medium">{lead.date}</td>
                <td className="px-10 py-6">
                  <span className={`px-4 py-2 rounded-full text-[10px] font-black border shadow-sm uppercase tracking-[0.2em] ${statusStyles[lead.status]}`}>{lead.status}</span>
                </td>
                <td className="px-10 py-6 text-right">
                  <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-12 h-12 rounded-2xl bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-colors shadow-sm flex items-center justify-center" title="Edit">✏</button>
                    <button
                      onClick={() => openWhatsApp(lead.journey)}
                      className="w-12 h-12 rounded-2xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors shadow-sm flex items-center justify-center"
                      title="WhatsApp"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.112.555 4.094 1.523 5.813L0 24l6.336-1.499A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.946 0-3.77-.51-5.338-1.4l-.382-.225-3.961.937.997-3.868-.249-.401A9.942 9.942 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
