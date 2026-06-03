import { createContext, useContext, useState, useEffect } from 'react'
import { api, setAdminToken, clearAdminToken, clearCustomerToken } from '../services/api'

const AuthContext = createContext(null)

const SESSION_KEY    = 'emv_active_session'
const CUSTOMER_KEYS  = ['emv_c_token', 'emv_c_refresh', 'emv_c_profile', 'emv_quiz_done', 'emv_customer']

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If the last login was a customer session, don't restore admin
    if (localStorage.getItem(SESSION_KEY) === 'customer') {
      setLoading(false)
      return
    }

    api.restoreAdminSession()
      .then(token => {
        if (!token) return
        localStorage.setItem(SESSION_KEY, 'admin')
        return api.getProfile().then(data => setUser(data))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password, rememberMe = false) => {
    // Actively kill the customer session (clears emv_c_rt httpOnly cookie on server)
    await api.logoutCustomerSession()
    // Clear all customer-side state
    CUSTOMER_KEYS.forEach(k => localStorage.removeItem(k))
    clearCustomerToken()
    localStorage.setItem(SESSION_KEY, 'admin')

    const data = await api.login(email, password, rememberMe)
    setAdminToken(data.access_token)
    const profile = await api.getProfile()
    setUser(profile)
    return profile
  }

  const logout = async () => {
    try { await api.logout() } catch {}
    clearAdminToken()
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  const forgotPassword = (email) => api.forgotPassword(email)
  const verifyOtp = (email, otp) => api.verifyOtp(email, otp)
  const resetPassword = (resetToken, newPassword, confirmPassword) =>
    api.resetPassword(resetToken, newPassword, confirmPassword)

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, forgotPassword, verifyOtp, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
