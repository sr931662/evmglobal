export const packages = [
  {
    id: 1,
    title: 'Romantic European Escapade',
    location: 'France & Switzerland',
    nights: 6,
    pricePerAdult: '₹1.47L',
    priceLabel: 'Per Adult',
    badge: 'Honeymoon',
    badgeVariant: 'brand',
    image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&q=80&w=1000',
    description: 'Experience the magic of Paris and Switzerland with private dinners, exclusive tours, and luxury stays.',
    amenities: [
      { icon: 'plane', label: 'Flights' },
      { icon: 'hotel', label: '4★ Hotels' },
      { icon: 'car', label: 'Transfers' },
    ],
  },
  {
    id: 2,
    title: 'Dubai Extravagance',
    location: 'United Arab Emirates',
    nights: 5,
    pricePerAdult: '₹81.9k',
    priceLabel: 'Per Adult',
    badge: null,
    image: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&q=80&w=1000',
    description: 'Burj Khalifa, Desert Safari with BBQ, Dhow Cruise, and premium experiences in the heart of Dubai.',
    amenities: [
      { icon: 'plane', label: 'Flights' },
      { icon: 'hotel', label: '5★ Atlantis' },
      { icon: 'ticket', label: 'Activities' },
    ],
  },
  {
    id: 3,
    title: 'Meghalaya Abode of Clouds',
    location: 'North East India',
    nights: 5,
    pricePerAdult: '₹28.0k',
    priceLabel: 'Per Adult (Land)',
    badge: 'Domestic',
    badgeVariant: 'dark',
    image: 'https://images.unsplash.com/photo-1571536701639-6548e65e6488?auto=format&fit=crop&q=80&w=1000',
    description: 'Shillong (2N) - Cherrapunji (2N) - Guwahati (1N). Discover living root bridges and crystal rivers.',
    amenities: [
      { icon: 'hotel', label: 'Premium Stays' },
      { icon: 'car', label: 'Private SUV' },
      { icon: 'utensils', label: 'Breakfast' },
    ],
  },
]

export const itinerary = [
  {
    id: 1,
    day: '01',
    title: 'Arrival & Seine Cruise',
    date: '15 June 2026',
    isActive: true,
    activities: [
      { icon: 'plane-arrival', color: 'blue', title: 'Flight Arrival: Emirates EK 500', description: 'Arrive at Charles de Gaulle Airport (CDG) at 11:00 AM. Fast-track immigration and meet & greet by our luxury representative.' },
      { icon: 'car', color: 'green', title: 'Private Transfer to Hotel', description: 'Mercedes S-Class or similar. Maximum waiting time 15 minutes. Drop off at Hotel Le Marais with VIP check-in.' },
      { icon: 'ship', color: 'brand', title: 'Evening: Gastronomic Dinner Cruise', description: 'Enjoy a 3-course gastronomic dinner with panoramic views of the Eiffel Tower and Parisian monuments illuminated at night. Window seating guaranteed.' },
    ],
  },
  {
    id: 2,
    day: '02',
    title: 'Louvre & Montmartre',
    date: '16 June 2026',
    isActive: false,
    activities: [
      { description: 'Skip the lines with a private art historian guide at the Louvre. Afternoon free to explore Montmartre, ending with sunset views from Sacré-Cœur.' },
    ],
  },
]

export const inclusions = [
  'Return airfare (economy class)',
  '4★ Premium Hotel accommodation',
  'Daily buffet breakfast',
  'Private Airport transfers (Luxury)',
  'High-speed train (Paris - Zurich)',
]

export const exclusions = [
  'Visa fees & processing',
  'City Taxes (payable at hotel)',
  'Personal expenses & shopping',
  'Tips & gratuities',
]
