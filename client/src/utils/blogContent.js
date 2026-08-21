// Derives the display bits an article needs — reading time, freshness, the
// destination it sells — from the article's own content. Nothing is invented:
// where the source data isn't there, these return null and the caller hides
// that piece rather than guessing.

const WORDS_PER_MINUTE = 225

// "12 min read", measured off the actual body copy.
export function readingMinutes(post) {
  const text = `${post?.content || ''} ${post?.excerpt || ''}`
    .replace(/```[\s\S]*?```/g, ' ')   // fenced code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // link text only
    .replace(/[#>*_~`|-]/g, ' ')
    .trim()

  if (!text) return null
  const words = text.split(/\s+/).filter(Boolean).length
  if (words < 30) return null
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}

function toDate(value) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

const DATE_FMT = { day: 'numeric', month: 'long', year: 'numeric' }

// Travel content goes stale, so an article that has genuinely been revised
// says "Updated"; one that hasn't says "Published". We never claim a review
// that didn't happen — the threshold stops a typo-fix on publication day from
// masquerading as a refresh.
const MEANINGFUL_EDIT_MS = 1000 * 60 * 60 * 24 // one day

export function freshness(post) {
  const published = toDate(post?.publishedAt) || toDate(post?.created_at)
  const updated   = toDate(post?.updated_at)

  if (published && updated && updated - published > MEANINGFUL_EDIT_MS) {
    return { label: 'Updated', date: updated.toLocaleDateString('en-IN', DATE_FMT), iso: updated.toISOString() }
  }
  if (published) {
    return { label: 'Published', date: published.toLocaleDateString('en-IN', DATE_FMT), iso: published.toISOString() }
  }
  return null
}

// Which destination an article is about — the explicit field first, then a tag
// or the title matched against the live destination list.
export function articleDestination(post, destinationNames = []) {
  if (post?.destination) return post.destination

  const tags = Array.isArray(post?.tags) ? post.tags : []
  const byTag = destinationNames.find(name =>
    tags.some(tag => (tag || '').toLowerCase().trim() === name.toLowerCase().trim())
  )
  if (byTag) return byTag

  const haystack = `${post?.title || ''} ${post?.excerpt || ''}`.toLowerCase()
  return destinationNames.find(name => haystack.includes(name.toLowerCase())) || null
}

// Scores another article for the "You may also like" rail. Same destination
// beats same category beats shared tags, so a Thailand reader gets more
// Thailand rather than a random Kashmir piece.
export function relatedScore(candidate, current, destinationNames = []) {
  if (!candidate || !current) return 0
  const id  = candidate.id || candidate._id
  const own = current.id || current._id
  if (id === own) return 0

  let score = 0

  const currentDest   = articleDestination(current, destinationNames)
  const candidateDest = articleDestination(candidate, destinationNames)
  if (currentDest && candidateDest && currentDest.toLowerCase() === candidateDest.toLowerCase()) {
    score += 5
  }

  if (candidate.category && candidate.category === current.category) score += 2

  const currentTags = new Set((Array.isArray(current.tags) ? current.tags : []).map(t => (t || '').toLowerCase()))
  const shared = (Array.isArray(candidate.tags) ? candidate.tags : [])
    .filter(t => currentTags.has((t || '').toLowerCase())).length
  score += shared

  return score
}

// Splits markdown roughly in half at a paragraph break, so an in-article
// package card can sit at a natural pause rather than mid-sentence.
export function splitAtMidpoint(markdown) {
  const text = markdown || ''
  const blocks = text.split(/\n{2,}/)
  if (blocks.length < 6) return [text, '']

  const target = Math.floor(text.length * 0.45)
  let runningLength = 0
  let cutIndex = Math.floor(blocks.length / 2)

  for (let i = 0; i < blocks.length; i++) {
    runningLength += blocks[i].length + 2
    if (runningLength >= target) { cutIndex = i + 1; break }
  }

  return [
    blocks.slice(0, cutIndex).join('\n\n'),
    blocks.slice(cutIndex).join('\n\n'),
  ]
}

// A "---" written straight under a line of text is a setext heading in
// markdown, not a horizontal rule — which is why dividers inserted from the
// editor vanished once the article was published. Editors write them fixed
// now; this repairs the ones already stored.
const DIVIDER_LINE = /^\s{0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/

export function normalizeMarkdown(markdown) {
  const text = markdown || ''
  if (!text.includes('---') && !text.includes('***') && !text.includes('___')) return text

  const lines = text.split('\n')
  const out   = []
  let inFence = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // Never touch anything inside a fenced code block.
    if (/^\s*(?:```|~~~)/.test(line)) inFence = !inFence

    const previous = out[out.length - 1]
    if (
      !inFence &&
      DIVIDER_LINE.test(line) &&
      previous !== undefined &&
      previous.trim() !== '' &&
      // A "---" row directly under a table header belongs to the table.
      !previous.trim().startsWith('|')
    ) {
      out.push('')
    }
    out.push(line)
  }

  return out.join('\n')
}
