import { useState } from 'react'
import { motion } from 'framer-motion'
import { mockPackages } from '../../../data/analytics'

const categoryColors = {
  Honeymoon: 'bg-pink-50 text-pink-700 border-pink-100',
  Luxury:    'bg-purple-50 text-purple-700 border-purple-100',
  Domestic:  'bg-blue-50 text-blue-700 border-blue-100',
  Family:    'bg-orange-50 text-orange-700 border-orange-100',
  Wellness:  'bg-green-50 text-green-700 border-green-100',
}

export default function AdminPackagesPage() {
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = mockPackages.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  )

  const totalRevenue = mockPackages.reduce((s, p) => {
    const v = parseFloat(p.revenue.replace('₹', '').replace('L', '')) * 100000
    return s + v
  }, 0)

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-serif font-bold text-dark tracking-tight">Packages</h2>
          <p className="text-gray-400 mt-1 font-medium">{mockPackages.length} packages · ₹{(totalRevenue / 10000000).toFixed(1)}Cr total revenue</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-brand text-white px-7 py-3.5 rounded-full text-sm font-bold flex items-center gap-3 hover:bg-brand-hover transition-colors shadow-glow"
        >
          + Add Package
        </button>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-3 gap-5">
        {[
          { label: 'Active Packages', value: mockPackages.filter(p => p.status === 'Active').length, icon: '✅' },
          { label: 'Total Bookings',  value: mockPackages.reduce((s, p) => s + p.bookings, 0),       icon: '📋' },
          { label: 'Best Seller',     value: 'Dubai Extravagance',                                   icon: '🏆' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
          >
            <span className="text-2xl mb-3 block">{s.icon}</span>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-1">{s.label}</p>
            <p className="text-2xl font-serif font-bold text-dark truncate">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        <input
          type="text"
          placeholder="Search packages..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-5 py-3 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-brand transition-colors font-bold text-dark shadow-sm"
        />
      </div>

      {/* Packages Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-black border-b border-gray-100 tracking-[0.2em]">
              <tr>
                <th className="px-8 py-5 text-left">Package</th>
                <th className="px-8 py-5 text-left">Category</th>
                <th className="px-8 py-5 text-center hidden md:table-cell">Nights</th>
                <th className="px-8 py-5 text-right">Price</th>
                <th className="px-8 py-5 text-center">Bookings</th>
                <th className="px-8 py-5 text-right hidden lg:table-cell">Revenue</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((pkg, i) => (
                <motion.tr key={pkg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 + i * 0.04 }}
                  className="hover:bg-gray-50/60 transition-colors group"
                >
                  <td className="px-8 py-5">
                    <p className="font-bold text-dark group-hover:text-brand transition-colors">{pkg.title}</p>
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">{pkg.nights}N / {pkg.nights + 1}D</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-[0.1em] ${categoryColors[pkg.category] || 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                      {pkg.category}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center text-gray-500 font-bold hidden md:table-cell">{pkg.nights}</td>
                  <td className="px-8 py-5 text-right font-serif font-bold text-dark">{pkg.price}</td>
                  <td className="px-8 py-5 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-black text-dark">{pkg.bookings}</span>
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand rounded-full" style={{ width: `${Math.min((pkg.bookings / 90) * 100, 100)}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right font-bold text-dark hidden lg:table-cell">{pkg.revenue}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-[0.1em] ${pkg.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                      {pkg.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-colors text-xs flex items-center justify-center shadow-sm">✏</button>
                      <button className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors text-xs flex items-center justify-center shadow-sm">🗑</button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add Package Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setShowModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-[2.5rem] p-10 w-full max-w-lg shadow-premium border border-gray-100"
          >
            <h3 className="text-3xl font-serif font-bold text-dark mb-8">New Package</h3>
            <div className="space-y-5">
              {[
                { label: 'Package Title', placeholder: 'e.g. Romantic Bali Escape' },
                { label: 'Location',      placeholder: 'e.g. Bali, Indonesia' },
                { label: 'Duration',      placeholder: 'e.g. 6 Nights / 7 Days' },
                { label: 'Price Per Adult', placeholder: 'e.g. ₹85,000' },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">{f.label}</label>
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold focus:outline-none focus:border-brand transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Category</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold focus:outline-none focus:border-brand transition-colors cursor-pointer">
                  {['Honeymoon', 'Family', 'Luxury', 'Domestic', 'Wellness'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-gray-200 text-gray-600 py-4 rounded-full font-bold hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => setShowModal(false)} className="flex-1 bg-brand text-white py-4 rounded-full font-bold hover:bg-brand-hover transition-colors shadow-glow">Save Package</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
