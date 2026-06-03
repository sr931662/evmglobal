import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api, setCustomerToken, clearCustomerToken, clearAdminToken } from '../services/api'

const CustomerAuthContext = createContext(null)

const PROFILE_KEY   = 'emv_c_profile'
const ADMIN_KEYS    = ['emv_token', 'emv_refresh_token', 'emv_persist']
// Legacy keys from old versions of the app — cleared on login/register
const LEGACY_KEYS   = ['emv_c_token', 'emv_c_refresh', 'emv_customer']

const saveProfile = (c) => localStorage.setItem(PROFILE_KEY, JSON.stringify(c))
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

  const saveCustomer = (c) => {
    saveProfile(c)
    setCustomer(c)
  }

  useEffect(() => {
    // Silently restore customer session via httpOnly refresh cookie
    api.restoreCustomerSession()
      .then(token => {
        if (!token) {
          // No valid session — clear any stale profile data
          clearProfile()
          setCustomer(null)
          return
        }
        return api.customerGetProfile()
          .then(profile => saveCustomer(profile))
          .catch(() => { clearProfile(); setCustomer(null) })
      })
      .catch(() => { clearProfile(); setCustomer(null) })
      .finally(() => setLoading(false))
  }, [])

  const register = useCallback(async ({ name, email, password, phone = '', city = '' }) => {
    // Clear any existing admin session
    ADMIN_KEYS.forEach(k => { localStorage.removeItem(k); sessionStorage.removeItem(k) })
    clearAdminToken()
    // Clear legacy keys
    LEGACY_KEYS.forEach(k => localStorage.removeItem(k))

    const data = await api.customerRegister({ name, email, password, phone: phone || undefined, city: city || undefined })
    setCustomerToken(data.access_token)
    saveCustomer(data.customer)
    localStorage.setItem('emv_quiz_done', '1')
    return data.customer
  }, [])

  const loginCustomer = useCallback(async (email, password) => {
    // Clear any existing admin session
    ADMIN_KEYS.forEach(k => { localStorage.removeItem(k); sessionStorage.removeItem(k) })
    clearAdminToken()
    // Clear legacy keys
    LEGACY_KEYS.forEach(k => localStorage.removeItem(k))

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
      customer,
      loading,
      register,
      loginCustomer,
      logoutCustomer,
      updateCustomer,
      changePassword,
      forgotPassword,
      verifyOtp,
      resetPassword,
    }}>
      {children}
    </CustomerAuthContext.Provider>
  )
}

export const useCustomerAuth = () => useContext(CustomerAuthContext)
