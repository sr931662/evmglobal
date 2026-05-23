import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('emv_token')
    if (!token) { setLoading(false); return }

    api.getProfile()
      .then(data => setUser(data))
      .catch(() => {
        localStorage.removeItem('emv_token')
        localStorage.removeItem('emv_refresh_token')
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const data = await api.login(email, password)
    localStorage.setItem('emv_token',         data.access_token)
    localStorage.setItem('emv_refresh_token', data.refresh_token)
    const profile = await api.getProfile()
    setUser(profile)
    return profile
  }

  const logout = () => {
    localStorage.removeItem('emv_token')
    localStorage.removeItem('emv_refresh_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
