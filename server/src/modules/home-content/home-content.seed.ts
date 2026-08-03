/**
 * Default home page content. Mirrors what the site shipped with, so a fresh
 * database renders exactly the same page. Seeded per-section on first boot —
 * an admin emptying a section will not have it silently repopulated, because
 * seeding only runs when a section has never had any documents.
 */
export const HOME_CONTENT_SEED = {
  trust: [
    { icon: 'shield',  title: 'IATA Accredited',       subtitle: 'Certified travel partner' },
    { icon: 'lock',    title: '100% Secure Payments',  subtitle: 'SSL encrypted checkout' },
    { icon: 'check',   title: 'No Hidden Charges',     subtitle: 'Transparent pricing, always' },
    { icon: 'headset', title: '24/7 Concierge',        subtitle: 'Real humans, always reachable' },
    { icon: 'users',   title: '15,000+ Travellers',    subtitle: 'Trusted since day one' },
    { icon: 'award',   title: 'Award-Winning Service', subtitle: 'Recognised for excellence' },
  ],

  gallery: [
    { image: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&q=80&w=1200', caption: 'Santorini, Greece',    span: 'wide' },
    { image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800',  caption: 'Kyoto, Japan',        span: 'normal' },
    { image: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?auto=format&fit=crop&q=80&w=800',  caption: 'Maldives',            span: 'tall' },
    { image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&q=80&w=800',  caption: 'Swiss Alps',          span: 'normal' },
    { image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&q=80&w=800',  caption: 'Machu Picchu, Peru',  span: 'normal' },
    { image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800',  caption: 'Serengeti, Tanzania', span: 'normal' },
    { image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=1200', caption: 'Bali, Indonesia',     span: 'wide' },
  ],

  testimonial: [
    {
      name: 'Ananya Sharma', trip: 'Maldives · Honeymoon', rating: 5,
      quote: "EMV planned every last detail of our honeymoon — the overwater villa, the sunset cruise, all of it. We didn't have to think about a single thing.",
    },
    {
      name: 'Rohan Mehta', trip: 'Switzerland · Family Trip', rating: 5,
      quote: 'Travelling with two kids can be stressful, but our concierge had backup plans for everything. The itinerary felt tailor-made for our family.',
    },
    {
      name: 'Priya & Karan', trip: 'Bali · Anniversary', rating: 5,
      quote: 'From the private villa to the hidden waterfall tour nobody else knew about — this was the most thoughtfully curated trip we have ever taken.',
    },
    {
      name: 'Vikram Singh', trip: 'Dubai · Business + Leisure', rating: 4,
      quote: 'Seamless coordination between my meetings and leisure days. The 24/7 support genuinely came through when my flight got rescheduled.',
    },
    {
      name: 'Neha Kapoor', trip: 'Vietnam · Solo Trip', rating: 5,
      quote: 'As a solo traveller, safety and flexibility mattered most. EMV built a route that felt personal, not like a packaged tour at all.',
    },
    {
      name: 'The Malhotra Family', trip: 'Europe · Group Tour', rating: 5,
      quote: 'Coordinating 12 of us across 4 countries sounded impossible until EMV took over. Transparent pricing, zero surprises, unforgettable trip.',
    },
  ],

  faq: [
    {
      question: 'How does the trip planning process work?',
      answer: 'Share your travel dream with us — over a call, WhatsApp, or our inquiry form. Your dedicated concierge puts together a bespoke itinerary within 24 hours, which you can refine until it feels exactly right.',
    },
    {
      question: 'Can I get a fully customised itinerary?',
      answer: 'Always. Every EMV trip is built from scratch around your pace, budget, and preferences — we do not sell fixed, one-size-fits-all packages.',
    },
    {
      question: 'What is your cancellation and refund policy?',
      answer: 'Cancellation terms vary by supplier and how close to departure you cancel. Full details are on our',
      linkLabel: 'Cancellation Policy',
      linkTo: '/cancellation-policy',
    },
    {
      question: 'Do you help with visas and travel documentation?',
      answer: 'Yes — our concierge team guides you through visa requirements, documentation, and processing timelines for your destination as part of every booking.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit/debit cards, UPI, and net banking through a secure, encrypted checkout. Payment plans are available for larger bookings.',
    },
    {
      question: 'Is support really available 24/7 during my trip?',
      answer: 'Yes. From the moment you depart to the moment you return, your concierge is one call or WhatsApp message away — day or night.',
    },
  ],
};
