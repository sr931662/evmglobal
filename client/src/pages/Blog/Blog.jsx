import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '../../services/api'

const categoryColors = {
  'Travel Tips':         'bg-blue-50 text-blue-700',
  'Honeymoon':           'bg-pink-50 text-pink-700',
  'Luxury Travel':       'bg-purple-50 text-purple-700',
  'Destinations':        'bg-orange-50 text-orange-700',
  'Family Travel':       'bg-green-50 text-green-700',
  'Wellness':            'bg-teal-50 text-teal-700',
  'Behind the Scenes':   'bg-yellow-50 text-yellow-700',
  'News':                'bg-gray-100 text-gray-700',
  'Culture':             'bg-rose-50 text-rose-700',
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Blog() {
  const [posts,   setPosts]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getBlogs({ status: 'published', limit: 20 })
      .then(data => setPosts(data.blogs || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

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

      {/* Posts Grid */}
      <section className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12 pb-20">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-brand/5 border border-brand/20 rounded-3xl px-8 py-10 flex items-center gap-4">
            <span className="text-2xl">✍️</span>
            <div>
              <p className="font-black text-dark text-sm">Blog launching soon</p>
              <p className="text-gray-500 text-xs font-medium mt-0.5">Our travel writers are crafting in-depth guides. Check back shortly or follow us on Instagram for updates.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, i) => {
              const id = post._id || post.id
              return (
                <motion.article
                  key={id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.07, duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
                  className="group bg-white rounded-3xl border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-500"
                >
                  {post.coverImage ? (
                    <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                      <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                  ) : (
                    <div className="aspect-[16/10] bg-gray-50 flex items-center justify-center text-gray-200 text-4xl">✈</div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full ${categoryColors[post.category] || 'bg-gray-100 text-gray-600'}`}>
                        {post.category}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">{post.author}</span>
                    </div>
                    <h2 className="font-serif font-bold text-dark text-lg leading-snug mb-3 group-hover:text-brand transition-colors">{post.title}</h2>
                    <p className="text-gray-500 text-sm leading-relaxed font-light mb-5">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">{formatDate(post.publishedAt)}</span>
                      <span className="text-[10px] font-black text-brand uppercase tracking-[0.15em] opacity-0 group-hover:opacity-100 transition-opacity">Read More →</span>
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </div>
        )}
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
