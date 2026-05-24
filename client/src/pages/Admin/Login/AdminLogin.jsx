import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../../context/AuthContext'

// step: 'login' | 'forgot' | 'otp' | 'reset' | 'done'

const slide = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.33, 1, 0.68, 1] } },
  exit:    { opacity: 0, x: -30, transition: { duration: 0.25 } },
}

function EyeIcon({ open }) {
  return open ? (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <div className="flex gap-3 justify-center">
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
          className="w-12 h-14 text-center text-2xl font-black text-dark bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-brand transition-colors"
        />
      ))}
    </div>
  )
}

// ── Logo header ───────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div className="flex items-center gap-3 mb-10 justify-center">
      <div className="w-11 h-11 bg-dark rounded-2xl flex items-center justify-center text-white font-bold font-serif shadow-sm text-xl">E</div>
      <div>
        <p className="font-black text-sm tracking-[0.25em] uppercase text-dark">Workspace</p>
        <p className="text-[10px] text-gray-400 font-medium">EMV Global Admin</p>
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
      <h1 className="text-3xl font-serif font-bold text-dark mb-1">Welcome back</h1>
      <p className="text-gray-400 text-sm mb-8 font-medium">Sign in to your admin workspace.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="admin@emvglobal.in" autoComplete="email"
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors" />
        </div>

        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Password</label>
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" autoComplete="current-password"
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 pr-12 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors" />
            <button type="button" onClick={() => setShowPw(p => !p)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark transition-colors">
              <EyeIcon open={showPw} />
            </button>
          </div>
        </div>

        {/* Remember me + Forgot password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2.5 cursor-pointer select-none group">
            <div
              onClick={() => setRememberMe(p => !p)}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${rememberMe ? 'bg-dark border-dark' : 'border-gray-300 group-hover:border-gray-400'}`}
            >
              {rememberMe && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-xs font-bold text-gray-600">Keep me logged in</span>
          </label>
          <button type="button" onClick={onForgot}
            className="text-xs font-bold text-brand hover:underline transition-colors">
            Forgot password?
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-bold px-5 py-3.5 rounded-2xl">{error}</div>
        )}

        <button type="submit" disabled={loading}
          className="w-full bg-dark text-white py-4 rounded-full font-bold text-sm hover:bg-black transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
      <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-dark mb-6 transition-colors">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
        </svg>
        Back to sign in
      </button>
      <h1 className="text-3xl font-serif font-bold text-dark mb-1">Reset password</h1>
      <p className="text-gray-400 text-sm mb-8 font-medium">Enter your admin email and we'll send a 6-digit OTP.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Email Address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="admin@emvglobal.in" autoFocus
            className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors" />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-bold px-5 py-3.5 rounded-2xl">{error}</div>
        )}

        <button type="submit" disabled={loading}
          className="w-full bg-dark text-white py-4 rounded-full font-bold text-sm hover:bg-black transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
      <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-dark mb-6 transition-colors">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
        </svg>
        Change email
      </button>
      <h1 className="text-3xl font-serif font-bold text-dark mb-1">Enter OTP</h1>
      <p className="text-gray-400 text-sm mb-2 font-medium">
        We sent a 6-digit code to <span className="text-dark font-bold">{email}</span>
      </p>
      <p className="text-xs text-gray-400 font-medium mb-8">Check your inbox (and spam folder).</p>

      {resent && (
        <div className="bg-green-50 border border-green-100 text-green-700 text-sm font-bold px-5 py-3 rounded-2xl mb-5">
          New OTP sent! Please check your inbox.
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-6">
        <OtpInput value={otp} onChange={setOtp} />

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-bold px-5 py-3.5 rounded-2xl">{error}</div>
        )}

        <button type="submit" disabled={loading || otp.trim().length !== 6}
          className="w-full bg-dark text-white py-4 rounded-full font-bold text-sm hover:bg-black transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Verifying…
            </span>
          ) : 'Verify OTP →'}
        </button>

        <div className="text-center">
          {countdown > 0 ? (
            <p className="text-xs text-gray-400 font-medium">Resend OTP in <span className="font-black text-dark">{fmt(countdown)}</span></p>
          ) : (
            <button type="button" onClick={handleResend} disabled={resending}
              className="text-xs font-bold text-brand hover:underline disabled:opacity-50">
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
  const strengthColor = ['', 'bg-red-400', 'bg-yellow-400', 'bg-green-500']

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
      <h1 className="text-3xl font-serif font-bold text-dark mb-1">New password</h1>
      <p className="text-gray-400 text-sm mb-8 font-medium">Choose a strong password for your account.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">New Password</label>
          <div className="relative">
            <input type={showNew ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)}
              placeholder="Min. 8 characters" autoFocus
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 pr-12 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors" />
            <button type="button" onClick={() => setShowNew(p => !p)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark transition-colors">
              <EyeIcon open={showNew} />
            </button>
          </div>
          {newPw && (
            <div className="mt-2 flex items-center gap-3">
              <div className="flex gap-1 flex-1">
                {[1, 2, 3].map(l => (
                  <div key={l} className={`h-1 flex-1 rounded-full transition-colors ${strength >= l ? strengthColor[strength] : 'bg-gray-200'}`} />
                ))}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wide ${strength === 1 ? 'text-red-500' : strength === 2 ? 'text-yellow-600' : 'text-green-600'}`}>
                {strengthLabel[strength]}
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Confirm Password</label>
          <div className="relative">
            <input type={showConf ? 'text' : 'password'} value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
              placeholder="Repeat your password"
              className={`w-full bg-gray-50 border rounded-2xl px-5 py-3.5 pr-12 text-dark font-bold text-sm focus:outline-none transition-colors ${confirmPw && confirmPw !== newPw ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-brand'}`} />
            <button type="button" onClick={() => setShowConf(p => !p)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark transition-colors">
              <EyeIcon open={showConf} />
            </button>
          </div>
          {confirmPw && confirmPw !== newPw && (
            <p className="text-red-500 text-xs font-bold mt-1.5">Passwords do not match</p>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-bold px-5 py-3.5 rounded-2xl">{error}</div>
        )}

        <button type="submit" disabled={loading || !newPw || !confirmPw}
          className="w-full bg-dark text-white py-4 rounded-full font-bold text-sm hover:bg-black transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
    <motion.div key="done" {...slide} className="text-center py-4">
      <div className="w-20 h-20 bg-green-50 border border-green-100 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">✅</div>
      <h1 className="text-2xl font-serif font-bold text-dark mb-2">Password updated!</h1>
      <p className="text-gray-400 text-sm font-medium mb-8">Your password has been reset successfully. You can now sign in with your new password.</p>
      <button onClick={onLogin}
        className="w-full bg-dark text-white py-4 rounded-full font-bold text-sm hover:bg-black transition-colors shadow-sm">
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

  return (
    <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
        className="w-full max-w-md"
      >
        <Logo />

        <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm overflow-hidden">
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
          <div className="flex justify-center gap-2 mt-5">
            {['forgot', 'otp', 'reset', 'done'].map(s => (
              <div key={s} className={`w-2 h-2 rounded-full transition-colors ${
                step === s ? 'bg-dark' :
                ['forgot', 'otp', 'reset', 'done'].indexOf(step) > ['forgot', 'otp', 'reset', 'done'].indexOf(s) ? 'bg-gray-400' : 'bg-gray-200'
              }`} />
            ))}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-5 font-medium">
          EMV Global · Admin Access Only
        </p>
      </motion.div>
    </div>
  )
}
