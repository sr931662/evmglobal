import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { api } from '../../../services/api'
import styles from './AdminDashboard.module.css'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipLabel}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} className={styles.tooltipVal} style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

const KPI_ICON = {
  blue:   styles.kpiIconBlue,
  green:  styles.kpiIconGreen,
  purple: styles.kpiIconPurple,
  orange: styles.kpiIconOrange,
}

function KpiCard({ label, value, icon, sub, color, i }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: i * 0.08 }}
      className={styles.kpiCard}
    >
      <div className={styles.kpiTop}>
        <div>
          <p className={styles.kpiLabel}>{label}</p>
          <p className={styles.kpiValue}>{value}</p>
        </div>
        <div className={`${styles.kpiIcon} ${KPI_ICON[color]}`}>
          {icon}
        </div>
      </div>
      {sub && <p className={styles.kpiSub}>{sub}</p>}
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
    { label: 'Total Inquiries', value: stats.total,     icon: '👥', color: 'blue',   sub: `${stats.thisMonth} this month` },
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
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Dashboard</h2>
          <p className={styles.subtitle}>Welcome back — here's what's happening.</p>
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
        </div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <>
          {/* Lead KPI Grid */}
          <div className={styles.kpiGrid}>
            {kpis.map((k, i) => <KpiCard key={k.label} i={i} {...k} />)}
          </div>

          {/* Quotes & Packages Summary */}
          {quoteKpis.length > 0 && (
            <div className={styles.quoteGrid}>
              {quoteKpis.map((k, i) => (
                <motion.div
                  key={k.label}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.32 + i * 0.06 }}
                  className={styles.quoteCard}
                >
                  <p className={styles.quoteLabel}>{k.label}</p>
                  <p className={styles.quoteValue}>{k.value}</p>
                  <p className={styles.quoteSub}>{k.sub}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Charts Row */}
          <div className={styles.chartsRow}>
            {/* Monthly Leads */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className={styles.chartCardWide}
            >
              <div className={styles.chartHead}>
                <h3 className={styles.chartTitle}>Monthly Inquiries</h3>
                <p className={styles.chartSub}>Last 12 months — live data</p>
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
              className={styles.chartCard}
            >
              <h3 className={styles.chartTitleTight}>Status Mix</h3>
              <p className={styles.chartSubMb}>Inquiry pipeline breakdown</p>
              <div className={styles.statusList}>
                {Object.entries(stats.byStatus).map(([s, count]) => {
                  const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0
                  const barColors = { new: '#60A5FA', contacted: '#FBBF24', qualified: '#A78BFA', converted: '#34D399', rejected: '#F87171' }
                  return (
                    <div key={s}>
                      <div className={styles.statusRowTop}>
                        <span className={styles.statusName}>{s}</span>
                        <span className={styles.statusCount}>{count}</span>
                      </div>
                      <div className={styles.statusBarTrack}>
                        <div className={styles.statusBar} style={{ width: `${pct}%`, background: barColors[s] || '#E5E7EB' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </div>

          {/* Bottom Row */}
          <div className={styles.bottomRow}>
            {/* Weekly Activity — kept as sample */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className={styles.chartCard}
            >
              <h3 className={styles.chartTitleTight}>Weekly Activity</h3>
              <p className={styles.chartSubMb}>Inquiries vs Quotes created — this week</p>
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
              className={styles.chartCard}
            >
              <h3 className={styles.chartTitleTight}>Recent Inquiries</h3>
              <p className={styles.chartSubMb}>Latest inquiries</p>
              <div className={styles.recentList}>
                {(stats.recent || []).slice(0, 5).map(lead => {
                  const statusColor = {
                    new: styles.badgeNew,
                    contacted: styles.badgeContacted,
                    qualified: styles.badgeQualified,
                    converted: styles.badgeConverted,
                    rejected:  styles.badgeRejected,
                  }[lead.status] || styles.badgeDefault
                  return (
                    <div key={lead.id || lead._id} className={styles.recentRow}>
                      <div>
                        <p className={styles.recentName}>{lead.name}</p>
                        <p className={styles.recentPhone}>{lead.phone}</p>
                      </div>
                      <span className={`${styles.recentBadge} ${statusColor}`}>
                        {lead.status}
                      </span>
                    </div>
                  )
                })}
                {!stats.recent?.length && (
                  <p className={styles.empty}>No inquiries yet.</p>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  )
}
