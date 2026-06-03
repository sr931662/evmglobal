import { createContext, useContext, useState, useEffect } from 'react'
import { api, setRememberMe } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check both storages — token may live in either depending on rememberMe preference
    const token = localStorage.getItem('emv_token') || sessionStorage.getItem('emv_token')
    if (!token) { setLoading(false); return }

    api.getProfile()
      .then(data => setUser(data))
      .catch(() => {
        ['emv_token', 'emv_refresh_token'].forEach(k => {
          localStorage.removeItem(k)
          sessionStorage.removeItem(k)
        })
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password, rememberMe = false) => {
    ['emv_c_token', 'emv_c_refresh', 'emv_c_profile', 'emv_quiz_done'].forEach(k => localStorage.removeItem(k))
    setRememberMe(rememberMe)
    const data = await api.login(email, password)
    // setToken / setRefreshToken in api.js now write to the correct store
    const store = rememberMe ? localStorage : sessionStorage
    store.setItem('emv_token',         data.access_token)
    store.setItem('emv_refresh_token', data.refresh_token)
    const profile = await api.getProfile()
    setUser(profile)
    return profile
  }

  const logout = () => {
    ['emv_token', 'emv_refresh_token'].forEach(k => {
      localStorage.removeItem(k)
      sessionStorage.removeItem(k)
    })
    localStorage.removeItem('emv_persist')
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
