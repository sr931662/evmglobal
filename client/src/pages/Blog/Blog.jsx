import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { api } from '../../services/api'
import { formatPrice } from '../../utils/currency'
import { readingMinutes, freshness, articleDestination } from '../../utils/blogContent'
import { usePageMeta } from '../../hooks/usePageMeta'
import styles from './Blog.module.css'

const LIMIT = 9

// Reader-facing groupings. `match` maps each one onto the categories that
// already exist in the CMS, so nothing has to be re-tagged to use this.
const CATEGORIES = [
  { label: 'All',            match: null },
  { label: 'Destinations',   match: ['Destinations'] },
  { label: 'Travel Guides',  match: ['Travel Guides', 'Culture'] },
  { label: 'Holiday Ideas',  match: ['Honeymoon', 'Family Travel', 'Luxury Travel', 'Wellness'] },
  { label: 'Travel Tips',    match: ['Travel Tips'] },
  { label: 'Visa & Entry',   match: ['Visa & Entry'] },
  { label: 'Travel News',    match: ['News', 'Behind the Scenes'] },
]

const ARROW = (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className={styles.arrow}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
)

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=1200'

function metaLine(post) {
  const mins  = readingMinutes(post)
  const fresh = freshness(post)
  return [mins && `${mins} min read`, fresh && `${fresh.label} ${fresh.date}`]
    .filter(Boolean)
    .join(' · ')
}

// ── Cards ────────────────────────────────────────────────────────────────────

function ArticleCard({ post, onOpen, delay = 0 }) {
  const mins = readingMinutes(post)
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, delay, ease: [0.33, 1, 0.68, 1] }}
      className={styles.card}
      onClick={onOpen}
    >
      <div className={styles.cardImgWrap}>
        {post.coverImage
          ? <img src={post.coverImage} alt={post.coverAlt || post.title} loading="lazy" className={styles.cardImg} />
          : <div className={styles.cardImgFallback} aria-hidden="true" />}
        {post.category && <span className={styles.cardCategory}>{post.category}</span>}
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{post.title}</h3>
        {post.excerpt && <p className={styles.cardExcerpt}>{post.excerpt}</p>}
        <div className={styles.cardFooter}>
          {mins && <span className={styles.cardMeta}>{mins} min read</span>}
          <span className={styles.cardLink}>Read More {ARROW}</span>
        </div>
      </div>
    </motion.article>
  )
}

function CompactCard({ post, onOpen }) {
  return (
    <button className={styles.compact} onClick={onOpen}>
      {post.coverImage
        ? <img src={post.coverImage} alt={post.coverAlt || post.title} loading="lazy" className={styles.compactImg} />
        : <span className={styles.compactImgFallback} aria-hidden="true" />}
      <span className={styles.compactBody}>
        {post.category && <span className={styles.compactCategory}>{post.category}</span>}
        <span className={styles.compactTitle}>{post.title}</span>
        {readingMinutes(post) && (
          <span className={styles.compactMeta}>{readingMinutes(post)} min read</span>
        )}
      </span>
    </button>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Blog() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const activeCategory    = searchParams.get('category') || 'All'
  const activeDestination = searchParams.get('destination') || ''
  const queryParam        = searchParams.get('q') || ''
  const page              = Math.max(parseInt(searchParams.get('page'), 10) || 1, 1)

  const [searchInput, setSearchInput] = useState(queryParam)
  const [posts,    setPosts]    = useState([])
  const [total,    setTotal]    = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [featured, setFeatured] = useState(null)
  const [trending, setTrending] = useState([])
  const [picks,    setPicks]    = useState([])
  const [packages, setPackages] = useState([])
  const [destinations, setDestinations] = useState([])

  // Keep the search box in step when the URL changes underneath it.
  const [lastQuery, setLastQuery] = useState(queryParam)
  if (lastQuery !== queryParam) {
    setLastQuery(queryParam)
    setSearchInput(queryParam)
  }

  const isFiltered = activeCategory !== 'All' || !!activeDestination || !!queryParam

  usePageMeta(
    'The Ease My Vacations Travel Journal | Destination Guides & Travel Advice',
    'Travel inspiration, destination guides and expert advice for your next journey — trip costs, visa guidance, itineraries and holiday ideas from the Ease My Vacations travel team.',
    {
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=2800',
      url: typeof window !== 'undefined' ? `${window.location.origin}/blog` : '',
      type: 'website',
    }
  )

  const setParams = useCallback((changes) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value)
      else next.delete(key)
    })
    if (!('page' in changes)) next.delete('page')
    setSearchParams(next)
  }, [searchParams, setSearchParams])

  // Main listing — reruns whenever a filter or the page changes.
  useEffect(() => {
    setLoading(true)
    const params = { status: 'published', page, limit: LIMIT }

    const category = CATEGORIES.find(c => c.label === activeCategory)
    if (category?.match?.length === 1) params.category = category.match[0]
    if (activeDestination) params.destination = activeDestination
    if (queryParam)        params.q = queryParam

    api.getBlogs(params)
      .then(data => {
        let list = data.blogs || []
        // Multi-category groupings are narrowed client-side, since the API
        // filters on a single category.
        if (category?.match && category.match.length > 1) {
          list = list.filter(p => category.match.includes(p.category))
        }
        setPosts(list)
        setTotal(data.pagination?.total || 0)
      })
      .catch(() => { setPosts([]); setTotal(0) })
      .finally(() => setLoading(false))
  }, [activeCategory, activeDestination, queryParam, page])

  // Editorial rails and the commercial cross-sell — loaded once.
  useEffect(() => {
    let cancelled = false

    Promise.all([
      api.getBlogs({ status: 'published', featured: 'true', limit: 1 }).catch(() => null),
      api.getBlogs({ status: 'published', sort: 'views', limit: 4 }).catch(() => null),
      api.getBlogs({ status: 'published', editorsPick: 'true', limit: 5 }).catch(() => null),
      api.getPackages({ status: 'Active', limit: 3 }).catch(() => null),
      api.getDestinations().catch(() => []),
    ]).then(([featuredData, trendingData, picksData, pkgData, destData]) => {
      if (cancelled) return

      const featuredList = featuredData?.blogs || []
      setFeatured(featuredList[0] || null)
      setTrending(trendingData?.blogs || [])
      setPicks(picksData?.blogs || [])
      setPackages(
        Array.isArray(pkgData?.packages) ? pkgData.packages.slice(0, 3)
          : (Array.isArray(pkgData) ? pkgData.slice(0, 3) : [])
      )
      setDestinations(Array.isArray(destData) ? destData : [])
    })

    return () => { cancelled = true }
  }, [])

  // Only offer destinations we actually have. Falls back to the ones our
  // articles mention when the destinations CMS is empty.
  const destinationChips = useMemo(() => {
    const fromCms = destinations.map(d => d.name).filter(Boolean)
    if (fromCms.length) return fromCms.slice(0, 10)
    const fromPosts = new Set()
    ;[...posts, ...trending].forEach(p => {
      const d = articleDestination(p, [])
      if (d) fromPosts.add(d)
    })
    return [...fromPosts].slice(0, 10)
  }, [destinations, posts, trending])

  // "Trending" is ranked on real read counts. With no reads yet the ordering
  // is meaningless, so the rail is labelled for what it actually is.
  const hasRealViews = trending.some(p => (p.views || 0) > 0)
  const trendingLabel = hasRealViews ? 'Trending Now' : 'Latest Guides'
  const trendingList  = trending.filter(p => (p.id || p._id) !== (featured?.id || featured?._id)).slice(0, 3)

  const openPost = (post) => navigate(`/blog/${post.slug || post._id || post.id}`)
  const totalPages = Math.ceil(total / LIMIT)

  const submitSearch = (e) => {
    e.preventDefault()
    setParams({ q: searchInput.trim() || null })
  }

  return (
    <div className={styles.page}>

      {/* ── Masthead ────────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.inner}>
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
            className={styles.heroInner}
          >
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowLine} /> Explore. Plan. Travel with confidence.
            </span>
            <h1 className={styles.heroHeading}>
              The Ease My Vacations<br />Travel Journal
            </h1>
            <p className={styles.heroSub}>
              Travel inspiration, destination guides and expert advice for your next journey.
            </p>

            <form onSubmit={submitSearch} className={styles.searchForm} role="search">
              <span className={styles.searchIcon} aria-hidden="true">🔍</span>
              <input
                type="search"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search destinations, guides & tips…"
                aria-label="Search the travel journal"
                className={styles.searchInput}
              />
              <button type="submit" className={styles.searchBtn}>Search</button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* ── Category rail ───────────────────────────────────────── */}
      <nav className={styles.categoryBar} aria-label="Article categories">
        <div className={`${styles.inner} ${styles.categoryScroll} no-scrollbar`}>
          {CATEGORIES.map(category => (
            <button
              key={category.label}
              onClick={() => setParams({ category: category.label === 'All' ? null : category.label, destination: null })}
              className={`${styles.categoryBtn} ${activeCategory === category.label ? styles.categoryBtnActive : ''}`}
              aria-current={activeCategory === category.label ? 'true' : undefined}
            >
              {category.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Featured guide ──────────────────────────────────────── */}
      {featured && !isFiltered && (
        <section className={styles.section}>
          <div className={styles.inner}>
            <motion.article
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1] }}
              className={styles.featured}
              onClick={() => openPost(featured)}
            >
              <div className={styles.featuredImgWrap}>
                <img
                  src={featured.coverImage || FALLBACK_IMG}
                  alt={featured.coverAlt || featured.title}
                  className={styles.featuredImg}
                />
              </div>
              <div className={styles.featuredBody}>
                <span className={styles.featuredEyebrow}>Featured Guide</span>
                <h2 className={styles.featuredTitle}>{featured.title}</h2>
                <p className={styles.featuredMeta}>
                  {[featured.category, metaLine(featured)].filter(Boolean).join(' · ')}
                </p>
                {featured.excerpt && <p className={styles.featuredExcerpt}>{featured.excerpt}</p>}
                <span className={styles.featuredLink}>Read Guide {ARROW}</span>
              </div>
            </motion.article>
          </div>
        </section>
      )}

      {/* ── Trending / latest ───────────────────────────────────── */}
      {trendingList.length > 0 && !isFiltered && (
        <section className={styles.sectionTint}>
          <div className={styles.inner}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionHeading}>{trendingLabel}</h2>
            </div>
            <div className={styles.grid3}>
              {trendingList.map((post, i) => (
                <ArticleCard key={post.id || post._id} post={post} delay={i * 0.06} onOpen={() => openPost(post)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Explore by destination ──────────────────────────────── */}
      {destinationChips.length > 0 && (
        <section className={styles.section}>
          <div className={styles.inner}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionHeading}>Explore by Destination</h2>
              <p className={styles.sectionSub}>
                Every guide, tip and cost breakdown we&rsquo;ve written for a place, in one view.
              </p>
            </div>
            <div className={styles.destRow}>
              {destinationChips.map(name => (
                <button
                  key={name}
                  onClick={() => setParams({ destination: name, category: null })}
                  className={`${styles.destChip} ${activeDestination === name ? styles.destChipActive : ''}`}
                >
                  {name}
                </button>
              ))}
              {activeDestination && (
                <button onClick={() => setParams({ destination: null })} className={styles.destClear}>
                  Clear ✕
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Listing ─────────────────────────────────────────────── */}
      <section className={styles.sectionTint}>
        <div className={styles.inner}>
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionHeading}>
              {queryParam        ? `Results for “${queryParam}”`
                : activeDestination ? `${activeDestination} Travel Guides`
                : activeCategory !== 'All' ? activeCategory
                : 'All Articles'}
            </h2>
            {!loading && total > 0 && (
              <p className={styles.sectionSub}>
                {total} article{total === 1 ? '' : 's'}
                {totalPages > 1 && ` · page ${page} of ${totalPages}`}
              </p>
            )}
          </div>

          {loading ? (
            <div className={styles.skeletonGrid}>
              {[0, 1, 2, 3, 4, 5].map(i => <div key={i} className={styles.skeleton} />)}
            </div>
          ) : posts.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>
                {isFiltered ? 'Nothing here yet' : 'The journal is just getting started'}
              </p>
              <p className={styles.emptyDesc}>
                {isFiltered
                  ? 'Try a different destination or search term — or tell us what you want to read about.'
                  : 'Our travel team is writing the first guides. In the meantime, a travel expert can answer your questions directly.'}
              </p>
              <div className={styles.emptyBtns}>
                {isFiltered && (
                  <button onClick={() => setSearchParams({})} className={styles.ghostBtn}>
                    Show all articles
                  </button>
                )}
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('open-travel-quiz'))}
                  className={styles.primaryBtn}
                >
                  Plan My Trip {ARROW}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.grid3}>
                {posts.map((post, i) => (
                  <ArticleCard key={post.id || post._id} post={post} delay={(i % 3) * 0.06} onOpen={() => openPost(post)} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    onClick={() => setParams({ page: String(page - 1) })}
                    disabled={page === 1}
                    className={styles.pageBtn}
                  >
                    ← Previous
                  </button>
                  <span className={styles.pageCount}>Page {page} of {totalPages}</span>
                  <button
                    onClick={() => setParams({ page: String(page + 1) })}
                    disabled={page === totalPages}
                    className={styles.pageBtn}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Editor's picks ──────────────────────────────────────── */}
      {picks.length > 0 && (
        <section className={styles.section}>
          <div className={styles.inner}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionHeading}>Editor&rsquo;s Picks</h2>
              <p className={styles.sectionSub}>The guides our travel team sends to customers most often.</p>
            </div>
            <div className={styles.picksList}>
              {picks.map(post => (
                <CompactCard key={post.id || post._id} post={post} onOpen={() => openPost(post)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Popular holiday ideas — the blog → package bridge ───── */}
      {packages.length > 0 && (
        <section className={styles.sectionTint}>
          <div className={styles.inner}>
            <div className={styles.sectionHead}>
              <h2 className={styles.sectionHeading}>Popular Holiday Ideas</h2>
              <p className={styles.sectionSub}>
                Read about a place, then let us build the trip around your dates.
              </p>
            </div>
            <div className={styles.grid3}>
              {packages.map(pkg => {
                const id = pkg.slug || pkg.id || pkg._id
                const price = formatPrice(pkg.priceValue, pkg.price)
                const nights = Number(pkg.nights) || 0
                return (
                  <article key={id} className={styles.pkgCard} onClick={() => navigate(`/package-details/${id}`)}>
                    <div className={styles.cardImgWrap}>
                      <img src={pkg.image || FALLBACK_IMG} alt={pkg.title} loading="lazy" className={styles.cardImg} />
                    </div>
                    <div className={styles.cardBody}>
                      {nights > 0 && <p className={styles.pkgDuration}>{nights} Nights / {nights + 1} Days</p>}
                      <h3 className={styles.cardTitle}>{pkg.title}</h3>
                      {price && <p className={styles.pkgPrice}>From <strong>{price}</strong> / person</p>}
                      <span className={styles.cardLink}>View Package {ARROW}</span>
                    </div>
                  </article>
                )
              })}
            </div>
            <div className={styles.sectionCta}>
              <Link to="/packages" className={styles.linkBtn}>Explore All Holidays {ARROW}</Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Need help planning ──────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.inner}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
            className={styles.planCta}
          >
            <h2 className={styles.planHeading}>Need Help Planning?</h2>
            <p className={styles.planSub}>
              Tell us where you want to go. We&rsquo;ll create the journey around you.
            </p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-travel-quiz'))}
              className={styles.primaryBtn}
            >
              Plan My Trip {ARROW}
            </button>
          </motion.div>
        </div>
      </section>

      {/* ── Newsletter ──────────────────────────────────────────── */}
      <section className={styles.sectionTint}>
        <div className={styles.inner}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
            className={styles.newsletter}
          >
            <div>
              <h2 className={styles.newsletterHeading}>Get Travel Inspiration in Your Inbox</h2>
              <p className={styles.newsletterSub}>
                New destinations, travel deals, visa updates and holiday ideas &mdash; occasionally,
                not constantly.
              </p>
            </div>
            <form className={styles.newsletterForm} onSubmit={e => e.preventDefault()}>
              <input
                type="email"
                required
                placeholder="Your email address"
                aria-label="Email address"
                className={styles.newsletterInput}
              />
              <button type="submit" className={styles.primaryBtn}>Get Travel Updates {ARROW}</button>
            </form>
          </motion.div>
        </div>
      </section>

    </div>
  )
}
