import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { monthlyData, topDestinations, leadSources, funnelData, categoryData } from '../../../data/analytics'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 shadow-lg rounded-2xl px-5 py-4 text-sm min-w-[160px]">
      <p className="font-black text-gray-400 uppercase tracking-widest text-[10px] mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-bold" style={{ color: p.color || p.fill }}>
          {p.name}: {typeof p.value === 'number' && p.name?.toLowerCase().includes('rev')
            ? `₹${(p.value / 100000).toFixed(1)}L`
            : p.value}
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
  const totalRevenue = monthlyData.reduce((s, m) => s + m.revenue, 0)
  const totalLeads   = monthlyData.reduce((s, m) => s + m.leads, 0)
  const totalConv    = monthlyData.reduce((s, m) => s + m.conversions, 0)
  const avgBookings  = (totalLeads / 12).toFixed(0)

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-4xl font-serif font-bold text-dark tracking-tight">Analytics</h2>
        <p className="text-gray-400 mt-1 font-medium">Deep-dive into your business performance.</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: 'Annual Revenue',   value: `₹${(totalRevenue / 10000000).toFixed(1)}Cr`, sub: 'FY 2025-26' },
          { label: 'Total Inquiries',  value: totalLeads,  sub: '12-month total' },
          { label: 'Total Conversions', value: totalConv,  sub: `${((totalConv / totalLeads) * 100).toFixed(1)}% rate` },
          { label: 'Avg Monthly Leads', value: avgBookings, sub: 'Per month' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
          >
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2">{s.label}</p>
            <p className="text-3xl font-serif font-bold text-dark">{s.value}</p>
            <p className="text-sm text-gray-400 font-bold mt-1">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue Trend */}
      <SectionCard title="Revenue Trend" subtitle="Monthly revenue over the past 12 months" delay={0.2}>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="revGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#E53935" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#E53935" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 700 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={52} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#E53935" strokeWidth={3} fill="url(#revGrad2)" dot={false} activeDot={{ r: 5, fill: '#E53935' }} />
          </AreaChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Leads vs Conversions */}
      <SectionCard title="Leads & Conversions" subtitle="Monthly inquiry volume with conversion count" delay={0.3}>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: 700 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="l" orientation="left"  tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="c" orientation="right" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
            <Line yAxisId="l" type="monotone" dataKey="leads"       name="Leads"       stroke="#60A5FA" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            <Line yAxisId="c" type="monotone" dataKey="conversions" name="Conversions" stroke="#34D399" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* 2-col charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Destinations */}
        <SectionCard title="Top Destinations" subtitle="Bookings by destination (last 12 months)" delay={0.35}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={topDestinations} layout="vertical" margin={{ left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#374151', fontWeight: 700 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ borderRadius: '1rem', border: '1px solid #F3F4F6' }} />
              <Bar dataKey="bookings" name="Bookings" fill="#E53935" radius={[0,6,6,0]} />
            </BarChart>
          </ResponsiveContainer>
        </SectionCard>

        {/* Lead Sources */}
        <SectionCard title="Lead Sources" subtitle="Where clients are coming from" delay={0.4}>
          <div className="flex items-center gap-8">
            <ResponsiveContainer width="55%" height={220}>
              <PieChart>
                <Pie data={leadSources} cx="50%" cy="50%" innerRadius={60} outerRadius={88} paddingAngle={4} dataKey="value">
                  {leadSources.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`, '']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-4">
              {leadSources.map((s) => (
                <div key={s.name}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-bold text-gray-700 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                      {s.name}
                    </span>
                    <span className="font-black text-dark">{s.value}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${s.value}%`, background: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Conversion Funnel */}
      <SectionCard title="Conversion Funnel" subtitle="Visitor to booking journey" delay={0.45}>
        <div className="space-y-4 py-2">
          {funnelData.map((stage, i) => (
            <div key={stage.stage} className="flex items-center gap-6">
              <div className="w-32 text-sm font-bold text-gray-600 text-right shrink-0">{stage.stage}</div>
              <div className="flex-1 relative">
                <div
                  className="h-12 rounded-2xl flex items-center px-6 relative overflow-hidden transition-all"
                  style={{ width: `${stage.pct}%`, minWidth: 120, background: `rgba(229,57,53,${0.9 - i * 0.18})` }}
                >
                  <span className="text-white font-black text-sm relative z-10">
                    {stage.value.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="w-16 text-right text-sm font-black text-gray-500">{stage.pct}%</div>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-400 font-black uppercase tracking-widest">Inquiry Rate</p>
            <p className="text-2xl font-serif font-bold text-dark mt-1">10.4%</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 font-black uppercase tracking-widest">Quote Rate</p>
            <p className="text-2xl font-serif font-bold text-dark mt-1">53.5%</p>
          </div>
          <div>
            <p className="text-sm text-gray-400 font-black uppercase tracking-widest">Close Rate</p>
            <p className="text-2xl font-serif font-bold text-dark mt-1">15.7%</p>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}
