import { useState } from 'react'
import { motion } from 'framer-motion'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import styles from './CustomerProfile.module.css'

export default function ProfileSettings() {
  const { customer, updateCustomer, changePassword } = useCustomerAuth()

  const [profileForm, setProfileForm] = useState({
    name:  customer?.name  || '',
    phone: customer?.phone || '',
    city:  customer?.city  || '',
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMsg,     setProfileMsg]     = useState('')
  const [profileError,   setProfileError]   = useState('')

  const [pwForm, setPwForm]   = useState({ old: '', newPw: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMsg,     setPwMsg]     = useState('')
  const [pwError,   setPwError]   = useState('')
  const [showPw,    setShowPw]    = useState(false)

  const p = (k, v) => setProfileForm(prev => ({ ...prev, [k]: v }))
  const w = (k, v) => setPwForm(prev => ({ ...prev, [k]: v }))

  const handleProfileSave = async (e) => {
    e.preventDefault()
    if (!profileForm.name.trim()) { setProfileError('Name is required.'); return }
    setProfileLoading(true); setProfileError(''); setProfileMsg('')
    try {
      await updateCustomer(profileForm)
      setProfileMsg('Profile updated successfully.')
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.')
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (!pwForm.old) { setPwError('Enter your current password.'); return }
    if (pwForm.newPw.length < 8) { setPwError('New password must be at least 8 characters.'); return }
    if (pwForm.newPw !== pwForm.confirm) { setPwError('Passwords do not match.'); return }
    setPwLoading(true); setPwError(''); setPwMsg('')
    try {
      await changePassword(pwForm.old, pwForm.newPw)
      setPwMsg('Password changed successfully.')
      setPwForm({ old: '', newPw: '', confirm: '' })
    } catch (err) {
      setPwError(err.message || 'Failed to change password.')
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <>
      {/* Personal Information */}
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className={styles.cardTitle}>
          <span className={styles.cardIcon}>👤</span> Personal Information
        </h2>
        <form onSubmit={handleProfileSave} className={styles.form}>
          {profileError && <div className={styles.errorBanner}>{profileError}</div>}
          {profileMsg   && <div className={styles.successBanner}>{profileMsg}</div>}

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Full Name *</label>
            <input
              type="text"
              className={styles.input}
              value={profileForm.name}
              onChange={e => p('name', e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Email Address</label>
            <input
              type="email"
              className={`${styles.input} ${styles.inputDisabled}`}
              value={customer?.email || ''}
              disabled
            />
            <p className={styles.hint}>Email cannot be changed.</p>
          </div>

          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>Phone <span className={styles.optionalTag}>(optional)</span></label>
              <input
                type="tel"
                className={styles.input}
                value={profileForm.phone}
                onChange={e => p('phone', e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>City <span className={styles.optionalTag}>(optional)</span></label>
              <input
                type="text"
                className={styles.input}
                value={profileForm.city}
                onChange={e => p('city', e.target.value)}
                placeholder="e.g. Mumbai"
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={profileLoading}
            whileHover={!profileLoading ? { scale: 1.02 } : undefined}
            whileTap={!profileLoading ? { scale: 0.98 } : undefined}
            className={styles.saveBtn}
          >
            {profileLoading ? 'Saving…' : 'Save Changes'}
          </motion.button>
        </form>
      </motion.div>

      {/* Change Password */}
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
      >
        <h2 className={styles.cardTitle}>
          <span className={styles.cardIcon}>🔒</span> Change Password
        </h2>
        <form onSubmit={handlePasswordChange} className={styles.form}>
          {pwError && <div className={styles.errorBanner}>{pwError}</div>}
          {pwMsg   && <div className={styles.successBanner}>{pwMsg}</div>}

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Current Password</label>
            <div className={styles.pwWrap}>
              <input
                type={showPw ? 'text' : 'password'}
                className={styles.input}
                value={pwForm.old}
                onChange={e => w('old', e.target.value)}
                placeholder="Your current password"
                autoComplete="current-password"
                required
              />
              <button type="button" className={styles.pwToggle} onClick={() => setShowPw(v => !v)}>
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>New Password</label>
            <input
              type={showPw ? 'text' : 'password'}
              className={styles.input}
              value={pwForm.newPw}
              onChange={e => w('newPw', e.target.value)}
              placeholder="Min 8 characters"
              autoComplete="new-password"
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label}>Confirm New Password</label>
            <input
              type={showPw ? 'text' : 'password'}
              className={styles.input}
              value={pwForm.confirm}
              onChange={e => w('confirm', e.target.value)}
              placeholder="Repeat new password"
              required
            />
          </div>

          <motion.button
            type="submit"
            disabled={pwLoading}
            whileHover={!pwLoading ? { scale: 1.02 } : undefined}
            whileTap={!pwLoading ? { scale: 0.98 } : undefined}
            className={styles.saveBtn}
          >
            {pwLoading ? 'Changing…' : 'Change Password'}
          </motion.button>
        </form>
      </motion.div>

      {/* Account info strip */}
      <motion.div
        className={styles.infoStrip}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.16 }}
      >
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Member since</span>
          <span className={styles.infoValue}>
            {customer?.created_at
              ? new Date(customer.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : '—'}
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Account type</span>
          <span className={styles.infoValue}>Travel Member</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>Status</span>
          <span className={`${styles.infoValue} ${styles.statusActive}`}>Active</span>
        </div>
      </motion.div>
    </>
  )
}
