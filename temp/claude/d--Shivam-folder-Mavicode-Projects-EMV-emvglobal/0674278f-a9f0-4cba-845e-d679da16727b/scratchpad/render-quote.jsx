import { renderToStaticMarkup } from 'react-dom/server'
import QuotePrintDocument from '../../../../../client/src/components/quote/QuotePrintDocument.jsx'

const quote = {
  refNumber: 'EMV-Q-2026-001',
  clientName: 'Rahul Sharma',
  clientPhone: '+91 98765 43210',
  clientEmail: 'rahul@example.com',
  agentName: 'Priya (EMV)',
  validUntil: '31 Aug 2026',
  tripTitle: 'Dubai Family Escape',
  destinations: ['Dubai', 'Abu Dhabi'],
  startDate: '15 Sep 2026',
  nights: '5',                       // string, as it arrives from a number input
  adults: 2, children: 1,
  perAdult: 45000, perChild: 28000,
  tripType: 'International',
  currency: 'INR',
  costItems: [{ description: 'Visa fees', amount: 6500 }],
  taxes: [{ name: 'GST', percent: 5 }, { name: 'TCS', percent: 5 }],
  status: 'Sent',
  flights: [{ type: 'outbound', airline: 'Emirates', flightNumber: 'EK 500', from: 'BOM', to: 'DXB', departure: '08:30', arrival: '11:00', duration: '3h 30m', class: 'Economy', baggage: '30 kg' }],
  hotels: [{ name: 'Atlantis The Palm', stars: 5, location: 'Dubai', nights: 5, roomCategory: 'Deluxe', mealPlan: 'BB', address: 'Crescent Rd, Palm Jumeirah' }],
  itinerary: [{ day: 1, title: 'Arrival & Desert Safari', description: 'Airport pickup, check-in, evening desert safari.' }],
  inclusionsMd: '- Return airfare\n- **Daily breakfast**\n- Airport transfers',
  exclusionsMd: '- Visa fees\n- Travel insurance',
  notesMd: '### Please note\n- Check-in **14:00**, check-out **12:00**\n- Tourism dirham payable at hotel',
  termsMd: '1. 25% advance to confirm\n2. Balance 30 days before departure',
}

const legacy = {
  refNumber: 'EMV-Q-2025-042',
  clientName: 'Old Client', tripTitle: 'Goa Getaway',
  nights: 3, pax: 4, currency: 'INR',
  costItems: [{ description: 'Land Package', amount: 80000 }],
  taxPercent: 5,
  inclusions: ['Hotel stay', 'Breakfast'],
  notes: ['Rates subject to availability'],
  terms: ['50% advance'],
}

const html = renderToStaticMarkup(<QuotePrintDocument quote={quote} />)
const html2 = renderToStaticMarkup(<QuotePrintDocument quote={legacy} />)
console.log('=== NEW QUOTE ===')
console.log(html.replace(/></g, '>\n<'))
console.log('=== LEGACY QUOTE ===')
console.log(html2.replace(/></g, '>\n<'))
