export const monthlyData = [
  { month: 'Jun', revenue: 1450000, leads: 24, conversions: 2 },
  { month: 'Jul', revenue: 1890000, leads: 31, conversions: 3 },
  { month: 'Aug', revenue: 2210000, leads: 38, conversions: 3 },
  { month: 'Sep', revenue: 1780000, leads: 29, conversions: 2 },
  { month: 'Oct', revenue: 2560000, leads: 42, conversions: 4 },
  { month: 'Nov', revenue: 3120000, leads: 55, conversions: 5 },
  { month: 'Dec', revenue: 3890000, leads: 67, conversions: 6 },
  { month: 'Jan', revenue: 2980000, leads: 48, conversions: 4 },
  { month: 'Feb', revenue: 3340000, leads: 58, conversions: 5 },
  { month: 'Mar', revenue: 4210000, leads: 71, conversions: 6 },
  { month: 'Apr', revenue: 3890000, leads: 65, conversions: 6 },
  { month: 'May', revenue: 4560000, leads: 78, conversions: 7 },
]

export const categoryData = [
  { name: 'Honeymoon', value: 38, color: '#E53935' },
  { name: 'Family',    value: 27, color: '#FF7043' },
  { name: 'Corporate', value: 18, color: '#8E24AA' },
  { name: 'Domestic',  value: 17, color: '#1E88E5' },
]

export const topDestinations = [
  { name: 'Maldives',     bookings: 89, revenue: 7565000 },
  { name: 'Switzerland',  bookings: 76, revenue: 9120000 },
  { name: 'Dubai',        bookings: 68, revenue: 5576000 },
  { name: 'Bali',         bookings: 54, revenue: 2430000 },
  { name: 'Paris',        bookings: 47, revenue: 6909000 },
  { name: 'Thailand',     bookings: 43, revenue: 2322000 },
]

export const funnelData = [
  { stage: 'Visitors',   value: 12400, pct: 100 },
  { stage: 'Inquiries',  value: 1284,  pct: 10.4 },
  { stage: 'Quoted',     value: 687,   pct: 5.5 },
  { stage: 'Converted',  value: 108,   pct: 0.87 },
]

export const leadSources = [
  { name: 'WhatsApp',  value: 42, color: '#25D366' },
  { name: 'Organic',   value: 28, color: '#1E88E5' },
  { name: 'Referral',  value: 19, color: '#8E24AA' },
  { name: 'Instagram', value: 11, color: '#E53935' },
]

export const weeklyActivity = [
  { day: 'Mon', inquiries: 8,  quotes: 5 },
  { day: 'Tue', inquiries: 12, quotes: 7 },
  { day: 'Wed', inquiries: 9,  quotes: 6 },
  { day: 'Thu', inquiries: 15, quotes: 10 },
  { day: 'Fri', inquiries: 18, quotes: 12 },
  { day: 'Sat', inquiries: 22, quotes: 14 },
  { day: 'Sun', inquiries: 11, quotes: 8 },
]

export const kpis = {
  totalLeads:       { value: '1,284', change: '+18%', up: true },
  revenueMonth:     { value: '₹45.6L', change: '+17%', up: true },
  conversionRate:   { value: '8.4%',   change: '+1.2%', up: true },
  avgBookingValue:  { value: '₹1.47L', change: '+5%', up: true },
  activePackages:   { value: '48',     change: '+3',  up: true },
  repeatClients:    { value: '34%',    change: '-2%', up: false },
}

export const mockPackages = [
  { id: 1, title: 'Romantic European Escapade', category: 'Honeymoon', nights: 6, price: '₹1.47L', bookings: 47, revenue: '₹69.1L', status: 'Active' },
  { id: 2, title: 'Dubai Extravagance',         category: 'Luxury',    nights: 5, price: '₹81.9k', bookings: 68, revenue: '₹55.7L', status: 'Active' },
  { id: 3, title: 'Meghalaya Abode of Clouds',  category: 'Domestic',  nights: 5, price: '₹28.0k', bookings: 31, revenue: '₹8.7L',  status: 'Active' },
  { id: 4, title: 'Maldives Overwater Escape',  category: 'Honeymoon', nights: 7, price: '₹2.1L',  bookings: 29, revenue: '₹60.9L', status: 'Active' },
  { id: 5, title: 'Swiss Alps Adventure',        category: 'Family',    nights: 8, price: '₹1.8L',  bookings: 22, revenue: '₹39.6L', status: 'Draft' },
  { id: 6, title: 'Bali Wellness Retreat',       category: 'Wellness',  nights: 6, price: '₹65.0k', bookings: 18, revenue: '₹11.7L', status: 'Active' },
]
