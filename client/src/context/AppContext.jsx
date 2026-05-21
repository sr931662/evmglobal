import { createContext, useContext } from 'react'

export const AppContext = createContext({
  openWhatsApp: () => {},
})

export const useApp = () => useContext(AppContext)
