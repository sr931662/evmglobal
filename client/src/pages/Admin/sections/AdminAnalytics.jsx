import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { api } from '../../../services/api'

const STATUS_COLORS = {
  new:       '#60A5FA',
  contacted: '#FBBF24',
  qualified: '#A78BFA',
  converted: '#34D399',
  rejected:  '#F87171',
}

const QUOTE_STATUS_COLORS = {
  Draft:    '#9CA3AF',
  Sent:     '#60A5FA',
  Accepted: '#34D399',
  Rejected: '#F87171',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-2xl px-5 py-4 text-sm min-w-[140px]">
      <p className="font-black text-gray-400 uppercase tracking-widest text-[10px] mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-bold" style={{ color: p.color || p.fill }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

function SectionCard({ title, subtitle, delay = 0, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm"
    >
      <h3 className="text-xl font-serif font-bold text-dark mb-1">{title}</h3>
      {subtitle && <p className="text-gray-400 text-sm mb-6">{subtitle}</p>}
      {children}
    </motion.div>
  )
}

export default function AdminAnalytics() {
  const [stats,    setStats]    = useState(null)
  const [packages, setPackages] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  useEffect(() => {
    Promise.all([api.getAnalytics(), api.getPackages()])
      .then(([analyticsData, pkgsData]) => {
        setStats(analyticsData)
        setPackages(Array.isArray(pkgsData) ? pkgsData : pkgsData?.packages || [])
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="bg-red-50 border border-red-100 text-red-500 font-bold px-6 py-4 rounded-2xl">{error}</div>
  )

  // ── Lead status pie ────────────────────────────────────────────────────────
  const statusPieData = Object.entries(stats.byStatus)
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: STATUS_COLORS[name] || '#E5E7EB',
    }))
    .filter(d => d.value > 0)

  // ── Quote status pie ───────────────────────────────────────────────────────
  const quotePieData = stats.quotes
    ? Object.entries(stats.quotes)
        .filter(([key]) => key !== 'total')
        .map(([name, value]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          value,
          color: QUOTE_STATUS_COLORS[name.charAt(0).toUpperCase() + name.slice(1)] || '#E5E7EB',
        }))
        .filter(d => d.value > 0)
    : []

  // ── Package category breakdown ─────────────────────────────────────────────
  const categoryMap = {}
  packages.forEach(p => {
    if (p.category) categoryMap[p.category] = (categoryMap[p.category] || 0) + 1
  })
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }))

  const topPackages = [...packages]
    .sort((a, b) => (b.bookings || 0) - (a.bookings || 0))
    .slice(0, 6)

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-4xl font-serif font-bold text-dark tracking-tight">Analytics</h2>
        <p className="text-gray-400 mt-1 font-medium">Live data from your business.</p>
      </div>

      {/* ── Lead KPIs ──────────────────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-4">Leads</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: 'Total Leads',    value: stats.total,             sub: `${stats.thisMonth} this month` },
            { label: 'Converted',      value: stats.converted,         sub: `${stats.conversionRate}% rate` },
            { label: 'Pending',        value: stats.pending,           sub: 'New + Contacted' },
            { label: 'New This Month', value: stats.thisMonth,         sub: stats.monthChange != null ? `${stats.monthChange > 0 ? '+' : ''}${stats.monthChange}% vs last month` : 'First month' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
            >
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2">{s.label}</p>
              <p className="text-3xl font-serif font-bold text-dark">{s.value}</p>
              <p className="text-sm text-gray-400 font-bold mt-1">{s.sub}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Quote KPIs ─────────────────────────────────────────────────────── */}
      {stats.quotes && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400 mb-4">Quotes</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: 'Total Quotes', value: stats.quotes.total,    sub: 'All time' },
              { label: 'Draft',        value: stats.quotes.draft,    sub: 'In progress' },
              { label: 'Sent',         value: stats.quotes.sent,     sub: 'Awaiting client' },
              { label: 'Accepted',     value: stats.quotes.accepted, sub: stats.quotes.total > 0 ? `${((stats.quotes.accepted / stats.quotes.total) * 100).toFixed(1)}% acceptance rate` : '0% acceptance rate' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 + i * 0.07 }}
                className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
              >
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2">{s.label}</p>
                <p className="text-3xl font-serif font-bold text-dark">{s.value}</p>
                <p className="text-sm text-gray-400 font-bold mt-1">{s.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── Monthly Leads Trend ────────────────────────────────────────────── */}
      <SectionCard title="Monthly Leads" subtitle="Inquiries over the last 12 months" delay={0.2}>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={stats.monthlyData}>
            <defs>
              <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#E53935" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#E53935" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 700 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="leads" name="Leads" stroke="#E53935" strokeWidth={2.5} fill="url(#leadGrad)" dot={false} activeDot={{ r: 5, fill: '#E53935' }} />
          </AreaChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* ── Status Breakdowns ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Lead Status */}
        <SectionCard title="Lead Pipeline" subtitle="Distribution across lead stages" delay={0.3}>
          {statusPieData.length > 0 ? (
            <div className="flex items-center gap-8">
              <ResponsiveContainer width="55%" height={220}>
                <PieChart>
                  <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={58} outerRadius={86} paddingAngle={4} dataKey="value">
                    {statusPieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-4">
                {statusPieData.map(s => (
                  <div key={s.name}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-bold text-gray-700 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                        {s.name}
                      </span>
                      <span className="font-black text-dark">{s.value}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${stats.total > 0 ? Math.round((s.value / stats.total) * 100) : 0}%`, background: s.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-400 font-bold text-sm text-center py-8">No lead data yet.</p>
          )}
        </SectionCard>

        {/* Quote Status */}
        <SectionCard title="Quote Pipeline" subtitle="Distribution across quote stages" delay={0.35}>
          {quotePieData.length > 0 ? (
            <div className="flex items-center gap-8">
              <ResponsiveContainer width="55%" height={220}>
                <PieChart>
                  <Pie data={quotePieData} cx="50%" cy="50%" innerRadius={58} outerRadius={86} paddingAngle={4} dataKey="value">
                    {quotePieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-4">
                {quotePieData.map(s => (
                  <div key={s.name}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-bold text-gray-700 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                        {s.name}
                      </span>
                      <span className="font-black text-dark">{s.value}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${stats.quotes.total > 0 ? Math.round((s.value / stats.quotes.total) * 100) : 0}%`, background: s.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-400 font-bold text-sm text-center py-8">No quotes created yet.</p>
          )}
        </SectionCard>
      </div>

      {/* ── Packages ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Category Breakdown */}
        <SectionCard title="Packages by Category" subtitle="How your package portfolio is structured" delay={0.4}>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#374151', fontWeight: 700 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ borderRadius: '1rem', border: '1px solid #F3F4F6' }} />
                <Bar dataKey="value" name="Packages" fill="#E53935" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 font-bold text-sm text-center py-8">No packages created yet.</p>
          )}
        </SectionCard>

        {/* Package Stats */}
        <SectionCard title="Package Stats" subtitle="Portfolio at a glance" delay={0.42}>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[
              { label: 'Total Packages', value: stats.packages?.total ?? packages.length },
              { label: 'Active',         value: stats.packages?.active ?? packages.filter(p => p.status === 'Active').length },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-2xl p-5">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                <p className="text-3xl font-serif font-bold text-dark">{s.value}</p>
              </div>
            ))}
          </div>
          {topPackages.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Top by Bookings</p>
              {topPackages.slice(0, 4).map(pkg => (
                <div key={pkg.id || pkg._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="min-w-0">
                    <p className="font-bold text-dark text-sm truncate">{pkg.title}</p>
                    <p className="text-xs text-gray-400">{pkg.category} · {pkg.nights}N · {pkg.price}</p>
                  </div>
                  <span className="font-black text-dark text-sm ml-4 flex-shrink-0">{pkg.bookings ?? 0} bkg</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Recent Leads ──────────────────────────────────────────────────── */}
      <SectionCard title="Recent Leads" subtitle="Latest 5 inquiries" delay={0.5}>
        {stats.recent?.length > 0 ? (
          <div className="space-y-4">
            {stats.recent.slice(0, 5).map(lead => {
              const statusColor = {
                new:       'bg-blue-50 text-blue-700 border-blue-100',
                contacted: 'bg-yellow-50 text-yellow-700 border-yellow-100',
                qualified: 'bg-purple-50 text-purple-700 border-purple-100',
                converted: 'bg-green-50 text-green-700 border-green-100',
                rejected:  'bg-red-50 text-red-500 border-red-100',
              }[lead.status] || 'bg-gray-50 text-gray-500 border-gray-100'
              return (
                <div key={lead.id || lead._id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-bold text-dark">{lead.name}</p>
                    <p className="text-gray-400 text-sm font-medium mt-0.5">{lead.phone}</p>
                  </div>
                  <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-[0.15em] ${statusColor}`}>
                    {lead.status}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-gray-400 font-bold text-sm text-center py-8">No leads yet.</p>
        )}
      </SectionCard>
    </div>
  )
}
