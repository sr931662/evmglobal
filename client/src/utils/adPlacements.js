// Keep in sync with AD_PLACEMENTS in server/src/modules/ads/schemas/ad.schema.ts.
// Each entry is a real slot rendered somewhere on the site — add one here only
// after wiring the matching placement into the page that shows it.
export const AD_PLACEMENTS = [
  { value: 'home-top',              label: 'Home — below the hero' },
  { value: 'home-region-packages',  label: 'Home — under the destinations row' },
  { value: 'home-mid',              label: 'Home — before travel inspiration' },
  { value: 'home-bottom',           label: 'Home — above the closing enquiry' },
  { value: 'packages-list',         label: 'Packages — above the results' },
  { value: 'blog-list',             label: 'Blog — above the articles' },
]

// How wide the creative sits in its slot. 'full' matches how banners behaved
// before sizing existed, so it stays the default.
export const AD_WIDTHS = [
  { value: 'full',   label: 'Full width',        maxWidth: '100%'  },
  { value: 'wide',   label: 'Wide (1200px)',     maxWidth: '75rem' },
  { value: 'medium', label: 'Medium (900px)',    maxWidth: '56rem' },
  { value: 'narrow', label: 'Narrow (600px)',    maxWidth: '37rem' },
]

export const AD_RATIOS = [
  { value: 'auto', label: "Auto — the image's own shape" },
  { value: '21:9', label: '21:9 — cinematic strip' },
  { value: '16:9', label: '16:9 — widescreen' },
  { value: '4:1',  label: '4:1 — thin banner' },
  { value: '3:1',  label: '3:1 — banner' },
  { value: '2:1',  label: '2:1 — half-height' },
  { value: '1:1',  label: '1:1 — square' },
]

/** Inline styles for a banner's frame, from the sizing chosen in the admin. */
export function adFrameStyle(ad = {}) {
  const width = AD_WIDTHS.find(w => w.value === ad.width) || AD_WIDTHS[0]
  const style = { maxWidth: width.maxWidth }

  if (ad.aspectRatio && ad.aspectRatio !== 'auto') {
    style.aspectRatio = ad.aspectRatio.replace(':', ' / ')
  }
  if (ad.rounded === false) style.borderRadius = 0
  return style
}

/** How the creative fills that frame. */
export function adImageStyle(ad = {}) {
  const fitted = ad.aspectRatio && ad.aspectRatio !== 'auto'
  return {
    objectFit: ad.objectFit === 'contain' ? 'contain' : 'cover',
    height: fitted ? '100%' : 'auto',
  }
}
