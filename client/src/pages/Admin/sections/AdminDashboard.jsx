import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { api } from '../../../services/api'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-2xl px-5 py-4 text-sm">
      <p className="font-black text-gray-500 uppercase tracking-widest text-[10px] mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-bold" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

function KpiCard({ label, value, icon, sub, color, i }) {
  const colors = {
    blue:   'bg-blue-50 border-blue-100 text-blue-600',
    green:  'bg-green-50 border-green-100 text-green-600',
    purple: 'bg-purple-50 border-purple-100 text-purple-600',
    orange: 'bg-orange-50 border-orange-100 text-orange-600',
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: i * 0.08 }}
      className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm hover:-translate-y-1 transition-transform duration-300"
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2">{label}</p>
          <p className="text-4xl font-serif font-bold text-dark">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-xl ${colors[color]}`}>
          {icon}
        </div>
      </div>
      {sub && <p className="text-sm font-bold text-gray-400">{sub}</p>}
    </motion.div>
  )
}

export default function AdminDashboard() {
  const [stats,          setStats]          = useState(null)
  const [weeklyActivity, setWeeklyActivity] = useState([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState('')

  useEffect(() => {
    Promise.all([api.getAnalytics(), api.getWeeklyActivity()])
      .then(([analyticsData, weeklyData]) => {
        setStats(analyticsData)
        setWeeklyActivity(Array.isArray(weeklyData) ? weeklyData : [])
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const kpis = stats ? [
    { label: 'Total Leads',    value: stats.total,     icon: '👥', color: 'blue',   sub: `${stats.thisMonth} this month` },
    { label: 'Converted',      value: stats.converted, icon: '✅', color: 'green',  sub: `${stats.conversionRate}% rate` },
    { label: 'Pending Action', value: stats.pending,   icon: '⏳', color: 'orange', sub: 'New + Contacted' },
    { label: 'New This Month', value: stats.thisMonth, icon: '📈', color: 'purple', sub: stats.monthChange != null ? `${stats.monthChange > 0 ? '+' : ''}${stats.monthChange}% vs last month` : 'First month' },
  ] : []

  const quoteKpis = stats?.quotes ? [
    { label: 'Total Quotes',    value: stats.quotes.total,    sub: `${stats.quotes.draft} draft` },
    { label: 'Quotes Sent',     value: stats.quotes.sent,     sub: 'Awaiting client' },
    { label: 'Accepted',        value: stats.quotes.accepted, sub: 'Confirmed bookings' },
    { label: 'Packages Active', value: stats.packages?.active ?? 0, sub: `of ${stats.packages?.total ?? 0} total` },
  ] : []

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-serif font-bold text-dark tracking-tight">Dashboard</h2>
          <p className="text-gray-400 mt-1 font-medium">Welcome back — here's what's happening.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 text-red-500 font-bold px-6 py-4 rounded-2xl">{error}</div>
      ) : (
        <>
          {/* Lead KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((k, i) => <KpiCard key={k.label} i={i} {...k} />)}
          </div>

          {/* Quotes & Packages Summary */}
          {quoteKpis.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {quoteKpis.map((k, i) => (
                <motion.div
                  key={k.label}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.32 + i * 0.06 }}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
                >
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-1.5">{k.label}</p>
                  <p className="text-3xl font-serif font-bold text-dark">{k.value}</p>
                  <p className="text-xs text-gray-400 font-bold mt-1">{k.sub}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Charts Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Monthly Leads */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="xl:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm"
            >
              <div className="mb-8">
                <h3 className="text-xl font-serif font-bold text-dark">Monthly Leads</h3>
                <p className="text-gray-400 text-sm mt-1">Last 12 months — live data</p>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={stats.monthlyData}>
                  <defs>
                    <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#E53935" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#E53935" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="leads" name="Leads" stroke="#E53935" strokeWidth={2.5} fill="url(#leadGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Status Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm"
            >
              <h3 className="text-xl font-serif font-bold text-dark mb-1">Status Mix</h3>
              <p className="text-gray-400 text-sm mb-6">Lead pipeline breakdown</p>
              <div className="space-y-3">
                {Object.entries(stats.byStatus).map(([s, count]) => {
                  const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
                  const barColors = { new: '#60A5FA', contacted: '#FBBF24', qualified: '#A78BFA', converted: '#34D399', rejected: '#F87171' }
                  return (
                    <div key={s}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-bold text-gray-700 capitalize">{s}</span>
                        <span className="font-black text-dark">{count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: barColors[s] || '#E5E7EB' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Weekly Activity — kept as sample */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm"
            >
              <h3 className="text-xl font-serif font-bold text-dark mb-1">Weekly Activity</h3>
              <p className="text-gray-400 text-sm mb-6">Inquiries vs Quotes created — this week</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyActivity} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: '1rem', border: '1px solid #F3F4F6', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                  <Bar dataKey="inquiries" name="Inquiries" fill="#E53935" radius={[6,6,0,0]} />
                  <Bar dataKey="quotes"    name="Quotes"    fill="#FECACA" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Recent Leads */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm"
            >
              <h3 className="text-xl font-serif font-bold text-dark mb-1">Recent Leads</h3>
              <p className="text-gray-400 text-sm mb-6 mt-0.5">Latest inquiries</p>
              <div className="space-y-4">
                {(stats.recent || []).slice(0, 5).map(lead => {
                  const statusColor = {
                    new: 'bg-blue-50 text-blue-700 border-blue-100',
                    contacted: 'bg-yellow-50 text-yellow-700 border-yellow-100',
                    qualified: 'bg-purple-50 text-purple-700 border-purple-100',
                    converted: 'bg-green-50 text-green-700 border-green-100',
                    rejected:  'bg-red-50 text-red-500 border-red-100',
                  }[lead.status] || 'bg-gray-50 text-gray-500 border-gray-100'
                  return (
                    <div key={lead.id || lead._id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="font-bold text-dark text-base">{lead.name}</p>
                        <p className="text-gray-400 text-sm font-medium mt-0.5 truncate max-w-[200px]">{lead.phone}</p>
                      </div>
                      <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-[0.15em] ${statusColor}`}>
                        {lead.status}
                      </span>
                    </div>
                  )
                })}
                {!stats.recent?.length && (
                  <p className="text-gray-400 text-sm font-medium text-center py-4">No leads yet.</p>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  )
}
