import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../../services/api'

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full transition-colors duration-300 relative flex-shrink-0 ${checked ? 'bg-brand' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  )
}

function SettingsSection({ title, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm"
    >
      <h3 className="text-xl font-serif font-bold text-dark mb-6 pb-5 border-b border-gray-100">{title}</h3>
      {children}
    </motion.div>
  )
}

const defaultProfile = { businessName: '', email: '', phone: '', website: '', address: '', whatsappNumber: '', whatsappTemplate: '' }
const defaultNotifs  = { newLead: true, dailyDigest: true, conversionAlert: true, weeklyReport: false, lowStock: false }

export default function AdminSettings() {
  const [profile,  setProfile]  = useState(defaultProfile)
  const [notifs,   setNotifs]   = useState(defaultNotifs)
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [error,    setError]    = useState('')

  useEffect(() => {
    api.getSettings()
      .then(data => {
        setProfile({
          businessName:      data.businessName      || '',
          email:             data.email             || '',
          phone:             data.phone             || '',
          website:           data.website           || '',
          address:           data.address           || '',
          whatsappNumber:    data.whatsappNumber    || '',
          whatsappTemplate:  data.whatsappTemplate  || '',
        })
        if (data.notifications) {
          setNotifs({
            newLead:         data.notifications.newLead         ?? true,
            dailyDigest:     data.notifications.dailyDigest     ?? true,
            conversionAlert: data.notifications.conversionAlert ?? true,
            weeklyReport:    data.notifications.weeklyReport    ?? false,
            lowStock:        data.notifications.lowStock        ?? false,
          })
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      await api.updateSettings({ ...profile, notifications: notifs })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setProfile(defaultProfile)
    setNotifs(defaultNotifs)
  }

  const p = (k, v) => setProfile(prev => ({ ...prev, [k]: v }))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-4xl font-serif font-bold text-dark tracking-tight">Settings</h2>
        <p className="text-gray-400 mt-1 font-medium">Manage your workspace preferences.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-500 font-bold px-6 py-4 rounded-2xl text-sm">{error}</div>
      )}

      {/* Business Profile */}
      <SettingsSection title="Business Profile" delay={0.05}>
        <div className="space-y-5">
          {[
            { label: 'Business Name',        key: 'businessName',  placeholder: 'EaseMyVacations Global' },
            { label: 'Email Address',        key: 'email',         placeholder: 'concierge@emvglobal.in' },
            { label: 'Phone / WhatsApp',     key: 'phone',         placeholder: '+91 98765 43210' },
            { label: 'Website',              key: 'website',       placeholder: 'www.emvglobal.in' },
            { label: 'Registered Address',   key: 'address',       placeholder: 'Mumbai, Maharashtra, India' },
          ].map(f => (
            <div key={f.key} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] sm:w-40 shrink-0">{f.label}</label>
              <input
                value={profile[f.key]}
                onChange={e => p(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors"
              />
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection title="Notifications" delay={0.15}>
        <div className="space-y-5">
          {[
            { key: 'newLead',           label: 'New Inquiry Alert',         sub: 'Get notified immediately when a new inquiry is submitted' },
            { key: 'dailyDigest',       label: 'Daily Digest',              sub: 'Receive a daily summary of all inquiries and activity' },
            { key: 'conversionAlert',   label: 'Conversion Alert',          sub: 'Alert when a lead is marked as converted' },
            { key: 'weeklyReport',      label: 'Weekly Performance Report', sub: 'Receive weekly analytics and KPI report via email' },
            { key: 'lowStock',          label: 'Package Availability',      sub: 'Notify when a package has limited availability' },
          ].map(n => (
            <div key={n.key} className="flex items-start justify-between gap-6">
              <div>
                <p className="font-bold text-dark text-sm">{n.label}</p>
                <p className="text-gray-400 text-sm mt-0.5">{n.sub}</p>
              </div>
              <Toggle checked={notifs[n.key]} onChange={v => setNotifs(prev => ({ ...prev, [n.key]: v }))} />
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* WhatsApp Config */}
      <SettingsSection title="WhatsApp Integration" delay={0.2}>
        <div className="space-y-5">
          <div className="flex items-center gap-4 p-5 bg-[#25D366]/5 rounded-2xl border border-[#25D366]/20">
            <div className="w-10 h-10 bg-[#25D366] rounded-xl flex items-center justify-center text-white text-lg">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.112.555 4.094 1.523 5.813L0 24l6.336-1.499A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.946 0-3.77-.51-5.338-1.4l-.382-.225-3.961.937.997-3.868-.249-.401A9.942 9.942 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
            </div>
            <div>
              <p className="font-bold text-dark text-sm">WhatsApp Business</p>
              <p className="text-[#25D366] text-sm font-bold">{profile.whatsappNumber || 'Not configured'}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] sm:w-40 shrink-0">Business Number</label>
            <input
              value={profile.whatsappNumber}
              onChange={e => p('whatsappNumber', e.target.value)}
              placeholder="+919876543210"
              className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">Default Message Template</label>
            <textarea
              value={profile.whatsappTemplate}
              onChange={e => p('whatsappTemplate', e.target.value)}
              placeholder="Hi! I'd like to enquire about {packageName}. Please share details and availability."
              rows={3}
              className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-medium text-sm focus:outline-none focus:border-brand transition-colors resize-none"
            />
          </div>
        </div>
      </SettingsSection>

      {/* Save */}
      <div className="flex justify-end gap-4 pb-4">
        <button onClick={handleReset} className="px-8 py-3.5 rounded-full border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors text-sm">Reset</button>
        <button
          onClick={handleSave}
          disabled={saving}
          className={`px-10 py-3.5 rounded-full font-bold text-sm transition-all disabled:opacity-50 ${saved ? 'bg-green-500 text-white' : 'bg-dark text-white hover:bg-black shadow-sm'}`}
        >
          {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
