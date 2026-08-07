import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCustomerAuth } from '../../context/CustomerAuthContext'
import styles from './CustomerLogin.module.css'

const BENEFITS = [
  { icon: '🗺️', title: 'Full Day-by-Day Itineraries', desc: 'Unlock detailed itineraries for every package — free.' },
  { icon: '💼', title: 'Personalised Quotes', desc: 'Get custom travel quotes crafted to your style and budget.' },
  { icon: '⚡', title: 'Instant Trip Planning', desc: 'Save your preferences and resume your trip plan anytime.' },
]

// step: 'register' | 'login' | 'forgot' | 'otp' | 'reset' | 'success'

export default function CustomerLogin() {
  const { register, loginCustomer, forgotPassword, verifyOtp, resetPassword } = useCustomerAuth()
  const navigate     = useNavigate()
  const [params]     = useSearchParams()
  const next         = params.get('next') || '/'

  const [mode,    setMode]    = useState('login') // 'login' | 'register'
  const [step,    setStep]    = useState('main')  // 'main' | 'forgot' | 'otp' | 'reset' | 'done'
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw,  setShowPw]  = useState(false)

  // Register form
  const [reg, setReg] = useState({ name: '', email: '', password: '', phone: '', city: '' })
  // Login form
  const [log, setLog] = useState({ email: '', password: '' })
  // Forgot password flow
  const [fpEmail,     setFpEmail]     = useState('')
  const [otp,         setOtp]         = useState('')
  const [resetToken,  setResetToken]  = useState('')
  const [newPw,       setNewPw]       = useState('')
  const [confirmPw,   setConfirmPw]   = useState('')

  const r = (k, v) => setReg(p => ({ ...p, [k]: v }))
  const l = (k, v) => setLog(p => ({ ...p, [k]: v }))

  const go = (s) => { setStep(s); setError('') }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!reg.name.trim() || !reg.email.trim() || !reg.password || !reg.phone.trim() || !reg.city.trim()) {
      setError('Name, email, password, phone and city are required.'); return
    }
    if (!/\S+@\S+\.\S+/.test(reg.email)) {
      setError('Please enter a valid email address.'); return
    }
    if (reg.password.length < 8) {
      setError('Password must be at least 8 characters.'); return
    }
    setLoading(true); setError('')
    try {
      await register(reg)
      navigate(next, { replace: true })
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!log.email.trim() || !log.password) {
      setError('Email and password are required.'); return
    }
    setLoading(true); setError('')
    try {
      await loginCustomer(log.email, log.password)
      navigate(next, { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgot = async (e) => {
    e.preventDefault()
    if (!fpEmail.trim()) { setError('Please enter your email.'); return }
    setLoading(true); setError('')
    try {
      await forgotPassword(fpEmail.trim())
      go('otp')
    } catch (err) {
      setError(err.message || 'Failed to send OTP.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtp = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) { setError('Enter the 6-digit OTP.'); return }
    setLoading(true); setError('')
    try {
      const data = await verifyOtp(fpEmail.trim(), otp)
      setResetToken(data.resetToken)
      go('reset')
    } catch (err) {
      setError(err.message || 'OTP verification failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    if (newPw.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (newPw !== confirmPw) { setError('Passwords do not match.'); return }
    setLoading(true); setError('')
    try {
      await resetPassword(resetToken, newPw)
      go('done')
    } catch (err) {
      setError(err.message || 'Password reset failed.')
    } finally {
      setLoading(false)
    }
  }

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.33, 1, 0.68, 1] } },
    exit:    { opacity: 0, y: -12, transition: { duration: 0.25 } },
  }

  return (
    <div className={styles.page}>

      {/* Left panel */}
      <div className={styles.left}>
        <div className={styles.leftBg} />
        <div className={styles.leftOverlay} />
        <div className={styles.leftContent}>
          <div className={styles.leftBody}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}>
              <p className={styles.leftEyebrow}><span className={styles.eyebrowLine} /> Free Account</p>
              <h2 className={styles.leftHeading}>Unlock your perfect<br />journey today.</h2>
              <div className={styles.benefits}>
                {BENEFITS.map((b, i) => (
                  <motion.div key={b.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1, duration: 0.6, ease: [0.33, 1, 0.68, 1] }} className={styles.benefit}>
                    <div className={styles.benefitIcon}>{b.icon}</div>
                    <div>
                      <p className={styles.benefitTitle}>{b.title}</p>
                      <p className={styles.benefitDesc}>{b.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
          <p className={styles.leftFooter}>© {new Date().getFullYear()} Global Ease My Vacations (OPC) Private Limited.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className={styles.right}>
        <motion.div className={styles.card} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}>

          {/* Mobile logo */}
          <div className={styles.mobileLogoStrip}>
            <div className={styles.mobileLogoMark}>E</div>
            <span className={styles.mobileWordmark}>EMV Global</span>
          </div>

          <button onClick={() => step !== 'main' ? go('main') : navigate(-1)} className={styles.backBtn}>
            <svg className={styles.backBtnIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            {step !== 'main' ? 'Back' : 'Go back'}
          </button>

          <AnimatePresence mode="wait">

            {/* ── Main: Login / Register ── */}
            {step === 'main' && (
              <motion.div key="main" variants={cardVariants} initial="initial" animate="animate" exit="exit">
                <p className={styles.eyebrow}><span className={styles.eyebrowDot} /> It's completely free</p>
                <h1 className={styles.heading}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
                <p className={styles.subheading}>
                  {mode === 'login'
                    ? 'Sign in to access your itineraries and trip history.'
                    : 'Join EMV Global to unlock full itineraries and personalised quotes.'}
                </p>

                {/* Tabs */}
                <div className={styles.tabs}>
                  <button className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`} onClick={() => { setMode('login'); setError('') }}>Sign In</button>
                  <button className={`${styles.tab} ${mode === 'register' ? styles.tabActive : ''}`} onClick={() => { setMode('register'); setError('') }}>Create Account</button>
                </div>

                <AnimatePresence mode="wait">
                  {mode === 'register' ? (
                    <motion.form key="reg" variants={cardVariants} initial="initial" animate="animate" exit="exit" onSubmit={handleRegister} className={styles.form}>
                      {error && <div className={styles.errorBanner}>{error}</div>}

                      <div className={styles.fieldRow}>
                        <div className={styles.fieldGroup}>
                          <label className={styles.label}>Full Name *</label>
                          <input type="text" className={styles.input} placeholder="Your full name" value={reg.name} onChange={e => r('name', e.target.value)} autoComplete="name" required />
                        </div>
                        <div className={styles.fieldGroup}>
                          <label className={styles.label}>Email *</label>
                          <input type="email" className={styles.input} placeholder="your@email.com" value={reg.email} onChange={e => r('email', e.target.value)} autoComplete="email" required />
                        </div>
                      </div>

                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>Password *</label>
                        <div className={styles.pwWrap}>
                          <input type={showPw ? 'text' : 'password'} className={styles.input} placeholder="Min 8 characters" value={reg.password} onChange={e => r('password', e.target.value)} autoComplete="new-password" required />
                          <button type="button" className={styles.pwToggle} onClick={() => setShowPw(p => !p)}>{showPw ? '🙈' : '👁️'}</button>
                        </div>
                      </div>

                      <div className={styles.fieldRow}>
                        <div className={styles.fieldGroup}>
                          <label className={styles.label}>Phone *</label>
                          <input type="tel" className={styles.input} placeholder="+91 70705 95907" value={reg.phone} onChange={e => r('phone', e.target.value)} autoComplete="tel" required />
                        </div>
                        <div className={styles.fieldGroup}>
                          <label className={styles.label}>City *</label>
                          <input type="text" className={styles.input} placeholder="e.g. Mumbai" value={reg.city} onChange={e => r('city', e.target.value)} autoComplete="address-level2" required />
                        </div>
                      </div>

                      <motion.button type="submit" disabled={loading} whileHover={!loading ? { scale: 1.02 } : undefined} whileTap={!loading ? { scale: 0.98 } : undefined} className={styles.submitBtn}>
                        {loading ? 'Creating account…' : 'Create Account →'}
                      </motion.button>
                      <p className={styles.note}>By registering, you agree to our Terms of Service. 🔒</p>
                    </motion.form>
                  ) : (
                    <motion.form key="log" variants={cardVariants} initial="initial" animate="animate" exit="exit" onSubmit={handleLogin} className={styles.form}>
                      {error && <div className={styles.errorBanner}>{error}</div>}

                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>Email *</label>
                        <input type="email" className={styles.input} placeholder="your@email.com" value={log.email} onChange={e => l('email', e.target.value)} autoComplete="email" required />
                      </div>

                      <div className={styles.fieldGroup}>
                        <label className={styles.label}>Password *</label>
                        <div className={styles.pwWrap}>
                          <input type={showPw ? 'text' : 'password'} className={styles.input} placeholder="Your password" value={log.password} onChange={e => l('password', e.target.value)} autoComplete="current-password" required />
                          <button type="button" className={styles.pwToggle} onClick={() => setShowPw(p => !p)}>{showPw ? '🙈' : '👁️'}</button>
                        </div>
                      </div>

                      <button type="button" className={styles.forgotLink} onClick={() => { setFpEmail(log.email); go('forgot') }}>
                        Forgot password?
                      </button>

                      <motion.button type="submit" disabled={loading} whileHover={!loading ? { scale: 1.02 } : undefined} whileTap={!loading ? { scale: 0.98 } : undefined} className={styles.submitBtn}>
                        {loading ? 'Signing in…' : 'Sign In →'}
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── Forgot Password ── */}
            {step === 'forgot' && (
              <motion.div key="forgot" variants={cardVariants} initial="initial" animate="animate" exit="exit">
                <p className={styles.eyebrow}><span className={styles.eyebrowDot} /> Password Reset</p>
                <h1 className={styles.heading}>Forgot your password?</h1>
                <p className={styles.subheading}>Enter your registered email and we'll send a one-time code.</p>
                <form onSubmit={handleForgot} className={styles.form}>
                  {error && <div className={styles.errorBanner}>{error}</div>}
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Email Address</label>
                    <input type="email" className={styles.input} placeholder="your@email.com" value={fpEmail} onChange={e => setFpEmail(e.target.value)} required />
                  </div>
                  <motion.button type="submit" disabled={loading} whileHover={!loading ? { scale: 1.02 } : undefined} whileTap={!loading ? { scale: 0.98 } : undefined} className={styles.submitBtn}>
                    {loading ? 'Sending OTP…' : 'Send OTP →'}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* ── OTP Verify ── */}
            {step === 'otp' && (
              <motion.div key="otp" variants={cardVariants} initial="initial" animate="animate" exit="exit">
                <p className={styles.eyebrow}><span className={styles.eyebrowDot} /> Check your inbox</p>
                <h1 className={styles.heading}>Enter your OTP</h1>
                <p className={styles.subheading}>We sent a 6-digit code to <strong>{fpEmail}</strong>. Valid for 10 minutes.</p>
                <form onSubmit={handleOtp} className={styles.form}>
                  {error && <div className={styles.errorBanner}>{error}</div>}
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>6-Digit OTP</label>
                    <input type="text" inputMode="numeric" maxLength={6} className={`${styles.input} ${styles.otpInput}`} placeholder="000000" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} required />
                  </div>
                  <motion.button type="submit" disabled={loading || otp.length !== 6} whileHover={!loading ? { scale: 1.02 } : undefined} whileTap={!loading ? { scale: 0.98 } : undefined} className={styles.submitBtn}>
                    {loading ? 'Verifying…' : 'Verify OTP →'}
                  </motion.button>
                  <button type="button" className={styles.forgotLink} onClick={() => go('forgot')}>Didn't get the code? Resend</button>
                </form>
              </motion.div>
            )}

            {/* ── Reset Password ── */}
            {step === 'reset' && (
              <motion.div key="reset" variants={cardVariants} initial="initial" animate="animate" exit="exit">
                <p className={styles.eyebrow}><span className={styles.eyebrowDot} /> Almost done</p>
                <h1 className={styles.heading}>Set new password</h1>
                <p className={styles.subheading}>Choose a strong password of at least 8 characters.</p>
                <form onSubmit={handleReset} className={styles.form}>
                  {error && <div className={styles.errorBanner}>{error}</div>}
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>New Password</label>
                    <div className={styles.pwWrap}>
                      <input type={showPw ? 'text' : 'password'} className={styles.input} placeholder="Min 8 characters" value={newPw} onChange={e => setNewPw(e.target.value)} autoComplete="new-password" required />
                      <button type="button" className={styles.pwToggle} onClick={() => setShowPw(p => !p)}>{showPw ? '🙈' : '👁️'}</button>
                    </div>
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label}>Confirm Password</label>
                    <input type={showPw ? 'text' : 'password'} className={styles.input} placeholder="Repeat password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} required />
                  </div>
                  <motion.button type="submit" disabled={loading} whileHover={!loading ? { scale: 1.02 } : undefined} whileTap={!loading ? { scale: 0.98 } : undefined} className={styles.submitBtn}>
                    {loading ? 'Resetting…' : 'Reset Password →'}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* ── Success ── */}
            {step === 'done' && (
              <motion.div key="done" variants={cardVariants} initial="initial" animate="animate" exit="exit" className={styles.successCard}>
                <div className={styles.successIcon}>✓</div>
                <h1 className={styles.heading}>Password reset!</h1>
                <p className={styles.subheading}>Your password has been updated. You can now sign in with your new password.</p>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={styles.submitBtn} onClick={() => { setMode('login'); go('main') }}>
                  Go to Sign In →
                </motion.button>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
