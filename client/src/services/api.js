const _rawBase = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '').replace(/\/$/, '')
const BASE = _rawBase ? `${_rawBase}/api` : '/api'

// ── In-memory token storage — never touches localStorage/sessionStorage ───────
let _adminToken    = null
let _customerToken = null

export const setAdminToken     = (t) => { _adminToken = t }
export const clearAdminToken   = () => { _adminToken = null }
export const setCustomerToken  = (t) => { _customerToken = t }
export const clearCustomerToken = () => { _customerToken = null }

// ── Silent refresh via httpOnly cookies (no body needed — cookie auto-sent) ───
async function tryRefresh() {
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
    if (!res.ok) return false
    const data = await res.json()
    setAdminToken(data.access_token)
    return true
  } catch { return false }
}

async function tryCustomerRefresh() {
  try {
    const res = await fetch(`${BASE}/customer-auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
    if (!res.ok) return false
    const data = await res.json()
    setCustomerToken(data.access_token)
    return true
  } catch { return false }
}

async function request(path, opts = {}, retry = true) {
  const isCustomerPath = path.startsWith('/customer-auth')
  const token = isCustomerPath ? _customerToken : _adminToken
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts.headers || {}),
  }

  const res = await fetch(`${BASE}${path}`, { ...opts, headers, credentials: 'include' })

  if (res.status === 401 && retry) {
    if (isCustomerPath && path !== '/customer-auth/login') {
      const refreshed = await tryCustomerRefresh()
      if (refreshed) return request(path, opts, false)
      clearCustomerToken()
      throw new Error('Session expired. Please log in again.')
    } else if (!isCustomerPath && path !== '/auth/login') {
      const refreshed = await tryRefresh()
      if (refreshed) return request(path, opts, false)
      clearAdminToken()
      window.location.href = '/admin/login'
      throw new Error('Session expired. Please log in again.')
    }
  }

  if (res.headers.get('content-type')?.includes('text/csv')) return res

  const text = await res.text()
  const data = text ? JSON.parse(text) : {}
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`)
  return data
}

export const api = {
  // ─── Admin Auth ────────────────────────────────────────────────────────────
  login: (email, password, rememberMe = false) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password, rememberMe }) }),

  logout: () =>
    request('/auth/logout', { method: 'POST' }),

  getProfile: () => request('/auth/profile', { method: 'POST' }),

  restoreAdminSession: async () => {
    const ok = await tryRefresh()
    return ok ? _adminToken : null
  },

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
      headers: { Authorization: _adminToken ? `Bearer ${_adminToken}` : '' },
      credentials: 'include',
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
  getAnalytics:      () => request('/analytics/summary'),
  getWeeklyActivity: () => request('/analytics/weekly-activity'),

  // ─── Settings ──────────────────────────────────────────────────────────────
  getSettings: () => request('/settings'),

  updateSettings: (data) =>
    request('/settings', { method: 'PUT', body: JSON.stringify(data) }),

  // ─── Customer Auth ─────────────────────────────────────────────────────────
  customerRegister: (data) =>
    request('/customer-auth/register', { method: 'POST', body: JSON.stringify(data) }),

  customerLogin: (email, password) =>
    request('/customer-auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  customerLogout: () =>
    request('/customer-auth/logout', { method: 'POST' }),

  restoreCustomerSession: async () => {
    const ok = await tryCustomerRefresh()
    return ok ? _customerToken : null
  },

  customerGetProfile: () =>
    request('/customer-auth/profile'),

  customerUpdateProfile: (data) =>
    request('/customer-auth/profile', { method: 'PATCH', body: JSON.stringify(data) }),

  customerChangePassword: (oldPassword, newPassword) =>
    request('/customer-auth/change-password', { method: 'PATCH', body: JSON.stringify({ oldPassword, newPassword }) }),

  customerForgotPassword: (email) =>
    request('/customer-auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  customerVerifyOtp: (email, otp) =>
    request('/customer-auth/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),

  customerResetPassword: (resetToken, newPassword) =>
    request('/customer-auth/reset-password', { method: 'POST', body: JSON.stringify({ resetToken, newPassword }) }),

  customerGetMyTrips: () =>
    request('/customer-auth/my-trips'),

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
