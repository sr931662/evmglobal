import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api, setCustomerToken, clearCustomerToken, clearAdminToken } from '../services/api'

const CustomerAuthContext = createContext(null)

const SESSION_KEY  = 'emv_active_session'
const PROFILE_KEY  = 'emv_c_profile'
const ADMIN_KEYS   = ['emv_token', 'emv_refresh_token', 'emv_persist']
const LEGACY_KEYS  = ['emv_c_token', 'emv_c_refresh', 'emv_customer']

const saveProfile  = (c) => localStorage.setItem(PROFILE_KEY, JSON.stringify(c))
const clearProfile = () => {
  localStorage.removeItem(PROFILE_KEY)
  localStorage.removeItem('emv_quiz_done')
  LEGACY_KEYS.forEach(k => localStorage.removeItem(k))
}

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(() => {
    try {
      const s = localStorage.getItem(PROFILE_KEY)
      return s ? JSON.parse(s) : null
    } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  const saveCustomer = (c) => { saveProfile(c); setCustomer(c) }

  useEffect(() => {
    // If the last login was an admin session, don't restore customer
    if (localStorage.getItem(SESSION_KEY) === 'admin') {
      clearProfile()
      setCustomer(null)
      setLoading(false)
      return
    }

    api.restoreCustomerSession()
      .then(token => {
        if (!token) { clearProfile(); setCustomer(null); return }
        localStorage.setItem(SESSION_KEY, 'customer')
        return api.customerGetProfile()
          .then(profile => saveCustomer(profile))
          .catch(() => { clearProfile(); setCustomer(null) })
      })
      .catch(() => { clearProfile(); setCustomer(null) })
      .finally(() => setLoading(false))
  }, [])

  const register = useCallback(async ({ name, email, password, phone = '', city = '' }) => {
    // Actively kill the admin session (clears emv_rt httpOnly cookie on server)
    await api.logoutAdminSession()
    ADMIN_KEYS.forEach(k => { localStorage.removeItem(k); sessionStorage.removeItem(k) })
    LEGACY_KEYS.forEach(k => localStorage.removeItem(k))
    clearAdminToken()
    localStorage.setItem(SESSION_KEY, 'customer')

    const data = await api.customerRegister({ name, email, password, phone: phone || undefined, city: city || undefined })
    setCustomerToken(data.access_token)
    saveCustomer(data.customer)
    localStorage.setItem('emv_quiz_done', '1')
    return data.customer
  }, [])

  const loginCustomer = useCallback(async (email, password) => {
    // Actively kill the admin session (clears emv_rt httpOnly cookie on server)
    await api.logoutAdminSession()
    ADMIN_KEYS.forEach(k => { localStorage.removeItem(k); sessionStorage.removeItem(k) })
    LEGACY_KEYS.forEach(k => localStorage.removeItem(k))
    clearAdminToken()
    localStorage.setItem(SESSION_KEY, 'customer')

    const data = await api.customerLogin(email, password)
    setCustomerToken(data.access_token)
    saveCustomer(data.customer)
    localStorage.setItem('emv_quiz_done', '1')
    return data.customer
  }, [])

  const logoutCustomer = useCallback(async () => {
    try { await api.customerLogout() } catch {}
    clearCustomerToken()
    clearProfile()
    localStorage.removeItem(SESSION_KEY)
    setCustomer(null)
  }, [])

  const updateCustomer = useCallback(async (updates) => {
    const profile = await api.customerUpdateProfile(updates)
    saveCustomer(profile)
    return profile
  }, [])

  const changePassword = useCallback((oldPassword, newPassword) =>
    api.customerChangePassword(oldPassword, newPassword), [])

  const forgotPassword = useCallback((email) => api.customerForgotPassword(email), [])
  const verifyOtp      = useCallback((email, otp) => api.customerVerifyOtp(email, otp), [])
  const resetPassword  = useCallback((token, password) => api.customerResetPassword(token, password), [])

  return (
    <CustomerAuthContext.Provider value={{
      customer, loading, register, loginCustomer, logoutCustomer,
      updateCustomer, changePassword, forgotPassword, verifyOtp, resetPassword,
    }}>
      {children}
    </CustomerAuthContext.Provider>
  )
}

export const useCustomerAuth = () => useContext(CustomerAuthContext)
