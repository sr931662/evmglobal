import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../../context/AuthContext'
import styles from './AdminLogin.module.css'

// step: 'login' | 'forgot' | 'otp' | 'reset' | 'done'

const slide = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.33, 1, 0.68, 1] } },
  exit:    { opacity: 0, x: -30, transition: { duration: 0.25 } },
}

function EyeIcon({ open }) {
  return open ? (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
    </svg>
  ) : (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
    </svg>
  )
}

// ── OTP input — 6 individual digit boxes ─────────────────────────────────────
function OtpInput({ value, onChange }) {
  const inputs = useRef([])

  const handleKey = (e, i) => {
    if (e.key === 'Backspace') {
      if (value[i]) {
        onChange(value.slice(0, i) + ' ' + value.slice(i + 1))
      } else if (i > 0) {
        inputs.current[i - 1].focus()
      }
      return
    }
    if (e.key === 'ArrowLeft' && i > 0) { inputs.current[i - 1].focus(); return }
    if (e.key === 'ArrowRight' && i < 5) { inputs.current[i + 1].focus(); return }
  }

  const handleChange = (e, i) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1)
    const next = value.split('')
    next[i] = char || ' '
    onChange(next.join(''))
    if (char && i < 5) inputs.current[i + 1].focus()
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length) {
      onChange(pasted.padEnd(6, ' '))
      inputs.current[Math.min(pasted.length, 5)].focus()
    }
    e.preventDefault()
  }

  return (
    <div className={styles.otpRow}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i]?.trim() || ''}
          onChange={e => handleChange(e, i)}
          onKeyDown={e => handleKey(e, i)}
          onPaste={handlePaste}
          className={styles.otpInput}
        />
      ))}
    </div>
  )
}

// ── Logo header ───────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div className={styles.logoRow}>
      <div className={styles.logoBox}>E</div>
      <div>
        <p className={styles.logoTitle}>Workspace</p>
        <p className={styles.logoSub}>EMV Global Admin</p>
      </div>
    </div>
  )
}

// ── Step 1: Login ─────────────────────────────────────────────────────────────
function LoginStep({ onSuccess, onForgot }) {
  const { login } = useAuth()
  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [showPw,     setShowPw]     = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error,      setError]      = useState('')
  const [loading,    setLoading]    = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setLoading(true); setError('')
    try {
      await login(email, password, rememberMe)
      onSuccess?.()
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div key="login" {...slide}>
      <h1 className={styles.title}>Welcome back</h1>
      <p className={styles.subtitle}>Sign in to your admin workspace.</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div>
          <label className={styles.label}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="admin@emvglobal.in" autoComplete="email"
            className={styles.input} />
        </div>

        <div>
          <label className={styles.label}>Password</label>
          <div className={styles.inputWrap}>
            <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete="current-password"
              className={`${styles.input} ${styles.inputPad}`} />
            <button type="button" onClick={() => setShowPw(p => !p)} className={styles.eyeBtn}>
              <EyeIcon open={showPw} />
            </button>
          </div>
        </div>

        {/* Remember me + Forgot password */}
        <div className={styles.rowBetween}>
          <label className={styles.checkboxLabel}>
            <div
              onClick={() => setRememberMe(p => !p)}
              className={`${styles.checkbox} ${rememberMe ? styles.checkboxOn : ''}`}
            >
              {rememberMe && (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className={styles.checkboxText}>Keep me logged in</span>
          </label>
          <button type="button" onClick={onForgot} className={styles.linkBtn}>
            Forgot password?
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button type="submit" disabled={loading} className={`${styles.submit} ${styles.submitMt}`}>
          {loading ? (
            <span className={styles.submitInner}>
              <span className={styles.spinner} />
              Signing in…
            </span>
          ) : 'Sign In'}
        </button>
      </form>
    </motion.div>
  )
}

// ── Step 2: Forgot password — enter email ─────────────────────────────────────
function ForgotStep({ onBack, onSent }) {
  const { forgotPassword } = useAuth()
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) { setError('Please enter your email.'); return }
    setLoading(true); setError('')
    try {
      await forgotPassword(email)
      onSent(email)
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div key="forgot" {...slide}>
      <button onClick={onBack} className={styles.backBtn}>
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
        </svg>
        Back to sign in
      </button>
      <h1 className={styles.title}>Reset password</h1>
      <p className={styles.subtitle}>Enter your admin email and we'll send a 6-digit OTP.</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div>
          <label className={styles.label}>Email Address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="admin@emvglobal.in" autoFocus
            className={styles.input} />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button type="submit" disabled={loading} className={styles.submit}>
          {loading ? (
            <span className={styles.submitInner}>
              <span className={styles.spinner} />
              Sending OTP…
            </span>
          ) : 'Send OTP →'}
        </button>
      </form>
    </motion.div>
  )
}

// ── Step 3: OTP verification ──────────────────────────────────────────────────
function OtpStep({ email, onBack, onVerified }) {
  const { verifyOtp, forgotPassword } = useAuth()
  const [otp,       setOtp]       = useState('      ')
  const [loading,   setLoading]   = useState(false)
  const [resending, setResending] = useState(false)
  const [error,     setError]     = useState('')
  const [resent,    setResent]    = useState(false)
  const [countdown, setCountdown] = useState(120)

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const handleVerify = async (e) => {
    e.preventDefault()
    const code = otp.trim()
    if (code.length !== 6) { setError('Please enter the full 6-digit OTP.'); return }
    setLoading(true); setError('')
    try {
      const data = await verifyOtp(email, code)
      onVerified(data.resetToken)
    } catch (err) {
      setError(err.message || 'Incorrect OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResending(true); setError(''); setResent(false)
    try {
      await forgotPassword(email)
      setOtp('      ')
      setResent(true)
      setCountdown(120)
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.')
    } finally {
      setResending(false)
    }
  }

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <motion.div key="otp" {...slide}>
      <button onClick={onBack} className={styles.backBtn}>
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
        </svg>
        Change email
      </button>
      <h1 className={styles.title}>Enter OTP</h1>
      <p className={styles.subtitleTight}>
        We sent a 6-digit code to <span className={styles.emailStrong}>{email}</span>
      </p>
      <p className={styles.hint}>Check your inbox (and spam folder).</p>

      {resent && (
        <div className={styles.successBox}>
          New OTP sent! Please check your inbox.
        </div>
      )}

      <form onSubmit={handleVerify} className={styles.formWide}>
        <OtpInput value={otp} onChange={setOtp} />

        {error && <div className={styles.error}>{error}</div>}

        <button type="submit" disabled={loading || otp.trim().length !== 6} className={styles.submit}>
          {loading ? (
            <span className={styles.submitInner}>
              <span className={styles.spinner} />
              Verifying…
            </span>
          ) : 'Verify OTP →'}
        </button>

        <div className={styles.center}>
          {countdown > 0 ? (
            <p className={styles.resendText}>Resend OTP in <span className={styles.countStrong}>{fmt(countdown)}</span></p>
          ) : (
            <button type="button" onClick={handleResend} disabled={resending} className={styles.linkBtn}>
              {resending ? 'Sending…' : 'Resend OTP'}
            </button>
          )}
        </div>
      </form>
    </motion.div>
  )
}

// ── Step 4: Reset password ────────────────────────────────────────────────────
function ResetStep({ resetToken, onDone }) {
  const { resetPassword } = useAuth()
  const [newPw,    setNewPw]    = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [showNew,   setShowNew]   = useState(false)
  const [showConf,  setShowConf]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const strength = !newPw ? 0 : newPw.length < 8 ? 1 : /[A-Z]/.test(newPw) && /[0-9]/.test(newPw) ? 3 : 2
  const strengthLabel = ['', 'Weak', 'Good', 'Strong']
  const barColor   = ['', styles.barRed, styles.barYellow, styles.barGreen]
  const labelColor = ['', styles.stRed, styles.stYellow, styles.stGreen]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newPw.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (newPw !== confirmPw) { setError('Passwords do not match.'); return }
    setLoading(true); setError('')
    try {
      await resetPassword(resetToken, newPw, confirmPw)
      onDone()
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div key="reset" {...slide}>
      <h1 className={styles.title}>New password</h1>
      <p className={styles.subtitle}>Choose a strong password for your account.</p>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div>
          <label className={styles.label}>New Password</label>
          <div className={styles.inputWrap}>
            <input type={showNew ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)}
              placeholder="Min. 8 characters" autoFocus
              className={`${styles.input} ${styles.inputPad}`} />
            <button type="button" onClick={() => setShowNew(p => !p)} className={styles.eyeBtn}>
              <EyeIcon open={showNew} />
            </button>
          </div>
          {newPw && (
            <div className={styles.strengthRow}>
              <div className={styles.strengthBars}>
                {[1, 2, 3].map(l => (
                  <div key={l} className={`${styles.strengthBar} ${strength >= l ? barColor[strength] : ''}`} />
                ))}
              </div>
              <span className={`${styles.strengthLabel} ${labelColor[strength]}`}>
                {strengthLabel[strength]}
              </span>
            </div>
          )}
        </div>

        <div>
          <label className={styles.label}>Confirm Password</label>
          <div className={styles.inputWrap}>
            <input type={showConf ? 'text' : 'password'} value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
              placeholder="Repeat your password"
              className={`${styles.input} ${styles.inputPad} ${confirmPw && confirmPw !== newPw ? styles.inputError : ''}`} />
            <button type="button" onClick={() => setShowConf(p => !p)} className={styles.eyeBtn}>
              <EyeIcon open={showConf} />
            </button>
          </div>
          {confirmPw && confirmPw !== newPw && (
            <p className={styles.mismatch}>Passwords do not match</p>
          )}
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <button type="submit" disabled={loading || !newPw || !confirmPw} className={styles.submit}>
          {loading ? (
            <span className={styles.submitInner}>
              <span className={styles.spinner} />
              Updating…
            </span>
          ) : 'Set New Password →'}
        </button>
      </form>
    </motion.div>
  )
}

// ── Step 5: Done ──────────────────────────────────────────────────────────────
function DoneStep({ onLogin }) {
  return (
    <motion.div key="done" {...slide} className={styles.doneWrap}>
      <div className={styles.doneIcon}>✅</div>
      <h1 className={styles.doneTitle}>Password updated!</h1>
      <p className={styles.doneText}>Your password has been reset successfully. You can now sign in with your new password.</p>
      <button onClick={onLogin} className={styles.submit}>
        Sign In Now →
      </button>
    </motion.div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function AdminLogin({ onSuccess }) {
  const [step,       setStep]       = useState('login')
  const [forgotEmail, setForgotEmail] = useState('')
  const [resetToken,  setResetToken]  = useState('')

  const order = ['forgot', 'otp', 'reset', 'done']

  return (
    <div className={styles.page}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
        className={styles.wrap}
      >
        <Logo />

        <div className={styles.card}>
          <AnimatePresence mode="wait">
            {step === 'login' && (
              <LoginStep
                onSuccess={onSuccess}
                onForgot={() => setStep('forgot')}
              />
            )}
            {step === 'forgot' && (
              <ForgotStep
                onBack={() => setStep('login')}
                onSent={(email) => { setForgotEmail(email); setStep('otp') }}
              />
            )}
            {step === 'otp' && (
              <OtpStep
                email={forgotEmail}
                onBack={() => setStep('forgot')}
                onVerified={(token) => { setResetToken(token); setStep('reset') }}
              />
            )}
            {step === 'reset' && (
              <ResetStep
                resetToken={resetToken}
                onDone={() => setStep('done')}
              />
            )}
            {step === 'done' && (
              <DoneStep onLogin={() => setStep('login')} />
            )}
          </AnimatePresence>
        </div>

        {/* Step indicator dots */}
        {step !== 'login' && (
          <div className={styles.dots}>
            {order.map(s => {
              const isActive = step === s
              const isDone = order.indexOf(step) > order.indexOf(s)
              return (
                <div key={s} className={`${styles.dot} ${isActive ? styles.dotActive : isDone ? styles.dotDone : ''}`} />
              )
            })}
          </div>
        )}

        <p className={styles.footer}>
          EMV Global · Admin Access Only
        </p>
      </motion.div>
    </div>
  )
}
