import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const posts = [
  {
    id: 1,
    category: 'Travel Tips',
    title: 'Best Time to Visit Kashmir: A Season-by-Season Guide',
    excerpt: 'From snow-laden valleys in winter to blooming tulip gardens in spring — discover which season matches your travel style.',
    date: 'Coming Soon',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?w=800&q=80',
  },
  {
    id: 2,
    category: 'Honeymoon',
    title: 'Top 7 Romantic Destinations in India for 2025',
    excerpt: 'From the floating gardens of Dal Lake to the golden beaches of Goa — curated escapes for couples seeking magic.',
    date: 'Coming Soon',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80',
  },
  {
    id: 3,
    category: 'Luxury Travel',
    title: 'How to Plan a Luxury Trip Without the Stress',
    excerpt: 'Our concierge team shares insider secrets on crafting a flawless high-end journey — from transfers to fine dining.',
    date: 'Coming Soon',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80',
  },
  {
    id: 4,
    category: 'Destinations',
    title: 'Hidden Gems of Rajasthan Beyond Jaipur',
    excerpt: 'Explore Bundi, Shekhawati, and the untouched forts that most tourists miss on their golden triangle tours.',
    date: 'Coming Soon',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80',
  },
  {
    id: 5,
    category: 'Family Travel',
    title: 'Family Holidays in India: Complete Packing Guide',
    excerpt: 'Everything you need to pack for a seamless family vacation — from beach getaways to mountain retreats.',
    date: 'Coming Soon',
    readTime: '4 min read',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  },
  {
    id: 6,
    category: 'Wellness',
    title: 'Best Yoga & Wellness Retreats in Rishikesh',
    excerpt: 'The spiritual capital of yoga offers world-class wellness programs — here is how to find the right one for you.',
    date: 'Coming Soon',
    readTime: '5 min read',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
  },
]

const categoryColors = {
  'Travel Tips':    'bg-blue-50 text-blue-700',
  'Honeymoon':      'bg-pink-50 text-pink-700',
  'Luxury Travel':  'bg-purple-50 text-purple-700',
  'Destinations':   'bg-orange-50 text-orange-700',
  'Family Travel':  'bg-green-50 text-green-700',
  'Wellness':       'bg-teal-50 text-teal-700',
}

export default function Blog() {
  return (
    <div className="bg-white min-h-screen pt-[85px] md:pt-[100px]">

      {/* Hero */}
      <section className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12 py-14 md:py-20">
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}>
          <span className="text-brand font-black uppercase tracking-[0.3em] text-[10px] mb-6 flex items-center gap-4">
            <span className="w-12 h-[2px] bg-brand" /> Travel Insights
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[4rem] font-serif font-bold text-dark mb-5 leading-[1.05] tracking-tight">
            Stories, guides &<br />travel inspiration.
          </h1>
          <p className="text-base md:text-lg text-gray-500 max-w-xl leading-relaxed font-light">
            Expert advice, destination guides, and insider tips from the EMV Global concierge team — to help you travel smarter.
          </p>
        </motion.div>
      </section>

      {/* Coming Soon Banner */}
      <section className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12 mb-10">
        <div className="bg-brand/5 border border-brand/20 rounded-3xl px-8 py-5 flex items-center gap-4">
          <span className="text-2xl">✍️</span>
          <div>
            <p className="font-black text-dark text-sm">Blog launching soon</p>
            <p className="text-gray-500 text-xs font-medium mt-0.5">Our travel writers are crafting in-depth guides. Check back shortly or follow us on Instagram for updates.</p>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07, duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
              className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-500"
            >
              <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover img-zoom group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full ${categoryColors[post.category] || 'bg-gray-100 text-gray-600'}`}>
                    {post.category}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold">{post.readTime}</span>
                </div>
                <h2 className="font-serif font-bold text-dark text-lg leading-snug mb-3 group-hover:text-brand transition-colors">{post.title}</h2>
                <p className="text-gray-500 text-sm leading-relaxed font-light mb-5">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">{post.date}</span>
                  <span className="text-[10px] font-black text-brand uppercase tracking-[0.15em] opacity-0 group-hover:opacity-100 transition-opacity">Read More →</span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="bg-dark text-white py-16 md:py-20">
        <div className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Get travel inspiration in your inbox</h2>
            <p className="text-gray-400 mb-8 font-light max-w-md mx-auto">Destination guides, exclusive deals, and curated itineraries — delivered once a month.</p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input type="email" placeholder="Your email address" className="flex-1 bg-white/10 border border-white/20 rounded-full px-6 py-4 text-white placeholder:text-gray-500 font-medium text-sm focus:outline-none focus:border-white/40 transition-colors" />
              <button className="bg-brand text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-brand-hover transition-colors shrink-0">Subscribe</button>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
