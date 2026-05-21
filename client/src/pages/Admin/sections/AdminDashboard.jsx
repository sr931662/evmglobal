import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { kpis, monthlyData, categoryData, topDestinations, weeklyActivity } from '../../../data/analytics'
import { leads } from '../../../data/leads'
import { exportToCSV } from '../../../utils/csv'

const kpiCards = [
  { label: 'Total Leads',       key: 'totalLeads',      icon: '👥', color: 'blue'   },
  { label: 'Revenue (Month)',   key: 'revenueMonth',    icon: '💰', color: 'green'  },
  { label: 'Conversion Rate',   key: 'conversionRate',  icon: '📈', color: 'purple' },
  { label: 'Avg Booking Value', key: 'avgBookingValue', icon: '🎯', color: 'orange' },
]

const colorMap = {
  blue:   { bg: 'bg-blue-50 border-blue-100',   text: 'text-blue-600',   bar: 'bg-blue-500'   },
  green:  { bg: 'bg-green-50 border-green-100', text: 'text-green-600',  bar: 'bg-green-500'  },
  purple: { bg: 'bg-purple-50 border-purple-100', text: 'text-purple-600', bar: 'bg-purple-500' },
  orange: { bg: 'bg-orange-50 border-orange-100', text: 'text-orange-600', bar: 'bg-orange-500' },
}

function KpiCard({ card, i }) {
  const kpi = kpis[card.key]
  const c = colorMap[card.color]
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: i * 0.08 }}
      className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm hover:-translate-y-1 transition-transform duration-300"
    >
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2">{card.label}</p>
          <p className="text-4xl font-serif font-bold text-dark">{kpi.value}</p>
        </div>
        <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-xl ${c.bg}`}>
          {card.icon}
        </div>
      </div>
      <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-full ${kpi.up ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
        {kpi.up ? '↑' : '↓'} {kpi.change} vs last month
      </span>
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-2xl px-5 py-4 text-sm">
      <p className="font-black text-gray-500 uppercase tracking-widest text-[10px] mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-bold" style={{ color: p.color }}>
          {p.name}: {p.name === 'revenue' ? `₹${(p.value / 100000).toFixed(1)}L` : p.value}
        </p>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-serif font-bold text-dark tracking-tight">Dashboard</h2>
          <p className="text-gray-400 mt-1 font-medium">Welcome back — here's what's happening.</p>
        </div>
        <button
          onClick={() => exportToCSV(leads, 'EMV_Leads.csv')}
          className="bg-dark text-white px-7 py-3.5 rounded-full text-sm font-bold flex items-center gap-3 hover:bg-black transition-colors shadow-sm"
        >
          ⬇ Export Report
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, i) => <KpiCard key={card.key} card={card} i={i} />)}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Revenue + Leads Area Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="xl:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-serif font-bold text-dark">Revenue & Leads Trend</h3>
              <p className="text-gray-400 text-sm mt-1">Last 12 months performance</p>
            </div>
            <div className="flex gap-4 text-sm font-bold">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-brand inline-block" />Revenue</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-400 inline-block" />Leads</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#E53935" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#E53935" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#60A5FA" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="rev" orientation="left"  hide />
              <YAxis yAxisId="lead" orientation="right" hide />
              <Tooltip content={<CustomTooltip />} />
              <Area yAxisId="rev"  type="monotone" dataKey="revenue"     name="revenue" stroke="#E53935" strokeWidth={2.5} fill="url(#revGrad)"  dot={false} />
              <Area yAxisId="lead" type="monotone" dataKey="leads"       name="leads"   stroke="#60A5FA" strokeWidth={2.5} fill="url(#leadGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Donut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm"
        >
          <h3 className="text-xl font-serif font-bold text-dark mb-1">Booking Mix</h3>
          <p className="text-gray-400 text-sm mb-6">By category</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-3 mt-2">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2.5 font-medium text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  {item.name}
                </span>
                <span className="font-black text-dark">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Weekly Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm"
        >
          <h3 className="text-xl font-serif font-bold text-dark mb-1">Weekly Activity</h3>
          <p className="text-gray-400 text-sm mb-6">Inquiries vs Quotes this week</p>
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
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-serif font-bold text-dark">Recent Leads</h3>
              <p className="text-gray-400 text-sm mt-0.5">Latest 3 inquiries</p>
            </div>
          </div>
          <div className="space-y-4">
            {leads.slice(0, 3).map((lead) => (
              <div key={lead.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-bold text-dark text-base">{lead.client}</p>
                  <p className="text-gray-400 text-sm font-bold mt-0.5 uppercase tracking-widest">{lead.journey}</p>
                </div>
                <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-[0.15em] ${
                  lead.status === 'Converted' ? 'bg-green-50 text-green-700 border-green-100' :
                  lead.status === 'Quoted'    ? 'bg-brand/5 text-brand border-brand/20' :
                  'bg-yellow-50 text-yellow-700 border-yellow-100'
                }`}>{lead.status}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
