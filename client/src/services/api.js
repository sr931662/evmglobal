// In production VITE_API_URL = Cloud Run origin (with or without trailing /api)
// In dev it is unset — requests stay relative and are proxied by Vite to localhost:3000
const _rawBase = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '').replace(/\/$/, '')
const BASE = _rawBase ? `${_rawBase}/api` : '/api'

// ── Token storage — respects "remember me" preference ─────────────────────────
// emv_persist flag (localStorage) drives where tokens live:
//   true  → localStorage  (survives browser restart)
//   false → sessionStorage (cleared when tab/browser closes)
const isPersistent = () => localStorage.getItem('emv_persist') === 'true'
const _store = () => isPersistent() ? localStorage : sessionStorage

const getToken        = () => _store().getItem('emv_token') || sessionStorage.getItem('emv_token') || localStorage.getItem('emv_token')
const getRefreshToken = () => _store().getItem('emv_refresh_token') || sessionStorage.getItem('emv_refresh_token') || localStorage.getItem('emv_refresh_token')

const setToken = (t) => _store().setItem('emv_token', t)
const setRefreshToken = (t) => _store().setItem('emv_refresh_token', t)

const clearTokens = () => {
  ['emv_token', 'emv_refresh_token'].forEach(k => {
    localStorage.removeItem(k)
    sessionStorage.removeItem(k)
  })
  localStorage.removeItem('emv_persist')
}

export const setRememberMe = (remember) => {
  if (remember) {
    localStorage.setItem('emv_persist', 'true')
  } else {
    localStorage.removeItem('emv_persist')
  }
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

  forgotPassword: (email) =>
    request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  verifyOtp: (email, otp) =>
    request('/auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),

  resetPassword: (resetToken, newPassword, confirmPassword) =>
    request('/auth/reset-password', { method: 'POST', body: JSON.stringify({ resetToken, newPassword, confirmPassword }) }),

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

  // ─── Customers ─────────────────────────────────────────────────────────────
  registerCustomer: (data) =>
    request('/customers/register', { method: 'POST', body: JSON.stringify(data) }),

  getCustomers: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString()
    return request(`/customers${qs ? `?${qs}` : ''}`)
  },

  getCustomerStats: () => request('/customers/stats'),

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

  // ─── Blogs ─────────────────────────────────────────────────────────────────
  getBlogs: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString()
    return request(`/blogs${qs ? `?${qs}` : ''}`)
  },

  getBlog: (id) => request(`/blogs/${id}`),

  createBlog: (data) =>
    request('/blogs', { method: 'POST', body: JSON.stringify(data) }),

  updateBlog: (id, data) =>
    request(`/blogs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteBlog: (id) =>
    request(`/blogs/${id}`, { method: 'DELETE' }),

  // ─── Careers ───────────────────────────────────────────────────────────────
  getCareers: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString()
    return request(`/careers${qs ? `?${qs}` : ''}`)
  },

  createCareer: (data) =>
    request('/careers', { method: 'POST', body: JSON.stringify(data) }),

  updateCareer: (id, data) =>
    request(`/careers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteCareer: (id) =>
    request(`/careers/${id}`, { method: 'DELETE' }),

  // ─── Team ──────────────────────────────────────────────────────────────────
  getTeam: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ''))
    ).toString()
    return request(`/team${qs ? `?${qs}` : ''}`)
  },

  createTeamMember: (data) =>
    request('/team', { method: 'POST', body: JSON.stringify(data) }),

  updateTeamMember: (id, data) =>
    request(`/team/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteTeamMember: (id) =>
    request(`/team/${id}`, { method: 'DELETE' }),

  // ─── WhatsApp ──────────────────────────────────────────────────────────────
  getWhatsAppLink: (phone, message = '') => {
    const qs = new URLSearchParams({ phone, ...(message ? { message } : {}) }).toString()
    return request(`/whatsapp/link?${qs}`)
  },
}
