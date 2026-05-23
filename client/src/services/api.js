// In production VITE_API_URL = full Cloud Run origin, e.g. https://api.evmglobal.com
// In dev it is unset, so requests stay relative and are proxied by Vite to localhost:3000
const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'

const getToken        = () => localStorage.getItem('emv_token')
const getRefreshToken = () => localStorage.getItem('emv_refresh_token')
const setToken        = (t) => localStorage.setItem('emv_token', t)
const setRefreshToken = (t) => localStorage.setItem('emv_refresh_token', t)
const clearTokens     = () => {
  localStorage.removeItem('emv_token')
  localStorage.removeItem('emv_refresh_token')
}

async function tryRefresh() {
  const rt = getRefreshToken()
  if (!rt) return false
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    })
    if (!res.ok) return false
    const data = await res.json()
    setToken(data.access_token)
    if (data.refresh_token) setRefreshToken(data.refresh_token)
    return true
  } catch {
    return false
  }
}

async function request(path, opts = {}, retry = true) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts.headers || {}),
  }

  const res = await fetch(`${BASE}${path}`, { ...opts, headers })

  if (res.status === 401 && retry && path !== '/auth/login') {
    const refreshed = await tryRefresh()
    if (refreshed) return request(path, opts, false)
    clearTokens()
    window.location.hash = '#/admin/login'
    throw new Error('Session expired. Please log in again.')
  }

  if (res.headers.get('content-type')?.includes('text/csv')) return res

  const text = await res.text()
  const data = text ? JSON.parse(text) : {}

  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`)
  return data
}

export const api = {
  // ─── Auth ──────────────────────────────────────────────────────────────────
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  getProfile: () => request('/auth/profile', { method: 'POST' }),

  // ─── Leads ─────────────────────────────────────────────────────────────────
  getLeads: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString()
    return request(`/leads${qs ? `?${qs}` : ''}`)
  },

  updateLeadStatus: (id, status) =>
    request(`/leads/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  updateLead: (id, data) =>
    request(`/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteLead: (id) =>
    request(`/leads/${id}`, { method: 'DELETE' }),

  submitLead: (data) =>
    request('/leads', { method: 'POST', body: JSON.stringify(data) }),

  exportLeads: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString()
    return fetch(`${BASE}/export/leads${qs ? `?${qs}` : ''}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
  },

  // ─── Packages ──────────────────────────────────────────────────────────────
  getPackages: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString()
    return request(`/packages${qs ? `?${qs}` : ''}`)
  },

  getPackage: (id) => request(`/packages/${id}`),

  getPackageStats: () => request('/packages/stats'),

  createPackage: (data) =>
    request('/packages', { method: 'POST', body: JSON.stringify(data) }),

  updatePackage: (id, data) =>
    request(`/packages/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deletePackage: (id) =>
    request(`/packages/${id}`, { method: 'DELETE' }),

  // ─── Analytics ─────────────────────────────────────────────────────────────
  getAnalytics:       () => request('/analytics/summary'),
  getWeeklyActivity:  () => request('/analytics/weekly-activity'),

  // ─── Settings ──────────────────────────────────────────────────────────────
  getSettings: () => request('/settings'),

  updateSettings: (data) =>
    request('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // ─── Destinations ──────────────────────────────────────────────────────────
  getDestinations: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString()
    return request(`/destinations${qs ? `?${qs}` : ''}`)
  },

  createDestination: (data) =>
    request('/destinations', { method: 'POST', body: JSON.stringify(data) }),

  updateDestination: (id, data) =>
    request(`/destinations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteDestination: (id) =>
    request(`/destinations/${id}`, { method: 'DELETE' }),

  // ─── Quotes ────────────────────────────────────────────────────────────────
  lookupQuote: (ref, phone = '') => {
    const qs = new URLSearchParams({ ref, ...(phone ? { phone } : {}) }).toString()
    return request(`/quotes/lookup?${qs}`)
  },

  getQuotes: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString()
    return request(`/quotes${qs ? `?${qs}` : ''}`)
  },

  getQuote: (id) => request(`/quotes/${id}`),

  getQuoteStats: () => request('/quotes/stats'),

  createQuote: (data) =>
    request('/quotes', { method: 'POST', body: JSON.stringify(data) }),

  updateQuote: (id, data) =>
    request(`/quotes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteQuote: (id) =>
    request(`/quotes/${id}`, { method: 'DELETE' }),

  // ─── WhatsApp ──────────────────────────────────────────────────────────────
  getWhatsAppLink: (phone, message = '') => {
    const qs = new URLSearchParams({ phone, ...(message ? { message } : {}) }).toString()
    return request(`/whatsapp/link?${qs}`)
  },
}
