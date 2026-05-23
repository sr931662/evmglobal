import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../../context/AuthContext'

export default function AdminLogin({ onSuccess }) {
  const { login } = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setLoading(true)
    setError('')
    try {
      await login(email, password)
      onSuccess?.()
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-11 h-11 bg-dark rounded-2xl flex items-center justify-center text-white font-bold font-serif shadow-sm text-xl">E</div>
          <div>
            <p className="font-black text-sm tracking-[0.25em] uppercase text-dark">Workspace</p>
            <p className="text-[10px] text-gray-400 font-medium">EMV Global Admin</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm">
          <h1 className="text-3xl font-serif font-bold text-dark mb-1">Welcome back</h1>
          <p className="text-gray-400 text-sm mb-8 font-medium">Sign in to your admin workspace.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@emvglobal.in"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-2 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3.5 text-dark font-bold text-sm focus:outline-none focus:border-brand transition-colors"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-bold px-5 py-3.5 rounded-2xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-dark text-white py-4 rounded-full font-bold text-sm hover:bg-black transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6 font-medium">
          EMV Global · Admin Access Only
        </p>
      </motion.div>
    </div>
  )
}
