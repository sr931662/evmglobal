import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { useJsonLd } from './useJsonLd'

// Site-level structured data: who the company is, that the site has a search,
// and where the current page sits in the hierarchy. Page-specific markup
// (Article, FAQPage) is emitted by the pages themselves.
//
// Every claim here maps to something a visitor can actually see on the site —
// no invented ratings, no unverifiable awards.

const SITE_NAME = 'Ease My Vacations'
const LEGAL_NAME = 'Global Ease My Vacations (OPC) Private Limited'

const SOCIAL = [
  'https://www.facebook.com/easemyvacationsofficial',
  'https://www.instagram.com/easemyvacationsofficial',
  'https://www.youtube.com/easemyvacationsofficial',
  'https://x.com/_emvofficial',
  'https://www.linkedin.com/company/easemyvacationsofficial',
]

// Human-readable names for the route segments we surface in breadcrumbs.
const SEGMENT_LABELS = {
  'destinations':    'Destinations',
  'packages':        'Holidays',
  'package-details': 'Holidays',
  'blog':            'Travel Journal',
  'about':           'About',
  'contact':         'Contact',
  'quotes':          'Quotes',
  'careers':         'Careers',
}

function titleCase(slug) {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function useSiteSchema(enabled = true) {
  const { pathname } = useLocation()

  const schema = useMemo(() => {
    if (!enabled || typeof window === 'undefined') return null
    const origin = window.location.origin

    const graph = [
      {
        '@type': 'TravelAgency',
        '@id': `${origin}/#organization`,
        name: SITE_NAME,
        legalName: LEGAL_NAME,
        url: origin,
        logo: `${origin}/logo.png`,
        foundingDate: '2022',
        areaServed: 'Worldwide',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Gurugram',
          addressCountry: 'IN',
        },
        sameAs: SOCIAL,
      },
      {
        '@type': 'WebSite',
        '@id': `${origin}/#website`,
        url: origin,
        name: SITE_NAME,
        publisher: { '@id': `${origin}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${origin}/blog?q={search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
      },
    ]

    // Breadcrumbs, but only where there's an actual hierarchy to describe.
    const segments = pathname.split('/').filter(Boolean)
    if (segments.length > 0) {
      const items = [{ '@type': 'ListItem', position: 1, name: 'Home', item: origin }]
      let path = ''
      segments.forEach((segment, i) => {
        path += `/${segment}`
        items.push({
          '@type': 'ListItem',
          position: i + 2,
          name: SEGMENT_LABELS[segment] || titleCase(decodeURIComponent(segment)),
          item: `${origin}${path}`,
        })
      })
      graph.push({ '@type': 'BreadcrumbList', itemListElement: items })
    }

    return { '@context': 'https://schema.org', '@graph': graph }
  }, [enabled, pathname])

  useJsonLd('site-schema', schema)
}
