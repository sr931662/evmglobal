import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

const CustomerAuthContext = createContext(null)

const TOKEN_KEY         = 'emv_c_token'
const REFRESH_TOKEN_KEY = 'emv_c_refresh'
const CUSTOMER_KEY      = 'emv_c_profile'

const getToken        = () => localStorage.getItem(TOKEN_KEY)
const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY)

const saveTokens = (access, refresh) => {
  localStorage.setItem(TOKEN_KEY, access)
  if (refresh) localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
}

const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(CUSTOMER_KEY)
  localStorage.removeItem('emv_quiz_done')
}

// Inject customer token into api requests when needed
export const getCustomerToken = getToken
export const getCustomerRefreshToken = getRefreshToken

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(() => {
    try {
      const s = localStorage.getItem(CUSTOMER_KEY)
      return s ? JSON.parse(s) : null
    } catch { return null }
  })
  const [loading, setLoading] = useState(!!getToken())

  const saveCustomer = (c) => {
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(c))
    setCustomer(c)
  }

  // On mount, if token exists validate it
  useEffect(() => {
    const token = getToken()
    if (!token) { setLoading(false); return }

    api.customerGetProfile()
      .then(profile => { saveCustomer(profile); setLoading(false) })
      .catch(async () => {
        const rt = getRefreshToken()
        if (!rt) { clearTokens(); setCustomer(null); setLoading(false); return }
        try {
          const data = await api.customerRefresh(rt)
          saveTokens(data.access_token, data.refresh_token)
          const profile = await api.customerGetProfile()
          saveCustomer(profile)
        } catch {
          clearTokens()
          setCustomer(null)
        } finally {
          setLoading(false)
        }
      })
  }, [])

  const register = useCallback(async ({ name, email, password, phone = '', city = '' }) => {
    const data = await api.customerRegister({ name, email, password, phone: phone || undefined, city: city || undefined })
    saveTokens(data.access_token, data.refresh_token)
    saveCustomer(data.customer)
    localStorage.setItem('emv_quiz_done', '1')
    return data.customer
  }, [])

  const loginCustomer = useCallback(async (email, password) => {
    const data = await api.customerLogin(email, password)
    saveTokens(data.access_token, data.refresh_token)
    saveCustomer(data.customer)
    localStorage.setItem('emv_quiz_done', '1')
    return data.customer
  }, [])

  const logoutCustomer = useCallback(() => {
    clearTokens()
    setCustomer(null)
  }, [])

  const updateCustomer = useCallback(async (updates) => {
    const profile = await api.customerUpdateProfile(updates)
    saveCustomer(profile)
    return profile
  }, [])

  const changePassword = useCallback((oldPassword, newPassword) => {
    return api.customerChangePassword(oldPassword, newPassword)
  }, [])

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
