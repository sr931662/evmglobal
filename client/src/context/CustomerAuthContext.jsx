import { createContext, useContext, useState } from 'react'
import { api } from '../services/api'

const CustomerAuthContext = createContext(null)
const STORAGE_KEY = 'emv_customer'

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY)
      return s ? JSON.parse(s) : null
    } catch { return null }
  })

  const loginCustomer = ({ name, email, phone = '', city = '' }) => {
    const profile = {
      name:      name.trim(),
      email:     email.trim(),
      phone:     phone.trim(),
      city:      city.trim(),
      createdAt: Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    localStorage.setItem('emv_quiz_done', '1')
    setCustomer(profile)

    // Persist to customers collection so admin can track all registered users
    api.registerCustomer({
      name:  profile.name,
      email: profile.email,
      phone: profile.phone || undefined,
      city:  profile.city  || undefined,
    }).catch(() => {})

    return profile
  }

  const updateCustomer = (updates) => {
    const profile = { ...customer, ...updates }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    setCustomer(profile)
  }

  const logoutCustomer = () => {
    localStorage.removeItem(STORAGE_KEY)
    setCustomer(null)
  }

  return (
    <CustomerAuthContext.Provider value={{ customer, loginCustomer, updateCustomer, logoutCustomer }}>
      {children}
    </CustomerAuthContext.Provider>
  )
}

export const useCustomerAuth = () => useContext(CustomerAuthContext)
