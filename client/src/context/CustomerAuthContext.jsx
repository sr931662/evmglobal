import { createContext, useContext, useState } from 'react'

const CustomerAuthContext = createContext(null)
const STORAGE_KEY = 'emv_customer'

export function CustomerAuthProvider({ children }) {
  const [customer, setCustomer] = useState(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY)
      return s ? JSON.parse(s) : null
    } catch { return null }
  })

  const loginCustomer = ({ name, email, phone = '' }) => {
    const profile = {
      name:      name.trim(),
      email:     email.trim(),
      phone:     phone.trim(),
      createdAt: Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    localStorage.setItem('emv_quiz_done', '1')
    setCustomer(profile)
    window.dispatchEvent(new CustomEvent('emv-quiz-completed'))
    return profile
  }

  const logoutCustomer = () => {
    localStorage.removeItem(STORAGE_KEY)
    setCustomer(null)
  }

  return (
    <CustomerAuthContext.Provider value={{ customer, loginCustomer, logoutCustomer }}>
      {children}
    </CustomerAuthContext.Provider>
  )
}

export const useCustomerAuth = () => useContext(CustomerAuthContext)
