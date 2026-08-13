import { daySummary } from '../../../utils/packageContent'

// One day on the itinerary timeline. Collapsed it shows the day number, title,
// a scannable "A → B → C" preview and chips for location / meals / overnight;
// expanded it shows the full activity list, hotel and any note.
export default function ItineraryDay({ day, hotels = [], styles, defaultOpen = false }) {
  const fullHotel = day.hotel?.name
    ? { ...day.hotel, ...(hotels.find(h => h.name === day.hotel.name) || {}) }
    : null
  const summary = daySummary(day)
  const hasBody = (Array.isArray(day.activities) && day.activities.length > 0) || day.note || fullHotel?.name

  return (
    <details className={styles.dayAccordion} open={defaultOpen}>
      <summary className={styles.daySummary}>
        <span className={styles.dayNum}>{String(day.day).padStart(2, '0')}</span>
        <span className={styles.dayHead}>
          <span className={styles.dayTitle}>{day.title || `Day ${day.day}`}</span>
          {summary && <span className={styles.dayPreview}>{summary}</span>}
          <span className={styles.dayChips}>
            {(fullHotel?.city || fullHotel?.location) && (
              <span className={styles.dayChip}>📍 {fullHotel.city || fullHotel.location}</span>
            )}
            {fullHotel?.mealPlan && <span className={styles.dayChip}>🍽 {fullHotel.mealPlan}</span>}
            {fullHotel?.name && <span className={styles.dayChip}>🌙 {fullHotel.name}</span>}
          </span>
        </span>
        <svg className={styles.dayChevron} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>

      {hasBody && (
        <div className={styles.dayBody}>
          {Array.isArray(day.activities) && day.activities.map((act, i) => (
            <div key={i} className={styles.activity}>
              <span className={styles.actIcon}>{act.icon || '📍'}</span>
              <div>
                {act.time && <span className={styles.actTime}>{act.time}</span>}
                <span className={styles.actDesc}>{act.description}</span>
              </div>
            </div>
          ))}

          {fullHotel?.name && (
            <div className={styles.dayHotel}>
              <span className={styles.dayHotelIcon}>🏨</span>
              <div className={styles.dayHotelInfo}>
                <div className={styles.dayHotelRow}>
                  <p className={styles.dayHotelName}>{fullHotel.name}</p>
                  {fullHotel.stars && (
                    <span className={styles.dayHotelStars}>{'★'.repeat(parseInt(fullHotel.stars) || 4)}</span>
                  )}
                </div>
                <div className={styles.dayHotelBadges}>
                  {fullHotel.roomType && <span className={styles.dayHotelBadge}>{fullHotel.roomType}</span>}
                  {fullHotel.mealPlan && <span className={styles.dayHotelBadgeMeal}>{fullHotel.mealPlan}</span>}
                  {fullHotel.nights && <span className={styles.dayHotelBadgeNights}>🌙 {fullHotel.nights}N</span>}
                </div>
                {(fullHotel.address || fullHotel.location) && (
                  <p className={styles.dayHotelAddress}>📍 {fullHotel.address || fullHotel.location}</p>
                )}
              </div>
            </div>
          )}

          {day.note && (
            <div className={styles.dayNote}>
              <span className={styles.dayNoteIcon}>📝</span>
              <p className={styles.dayNoteText}>{day.note}</p>
            </div>
          )}
        </div>
      )}
    </details>
  )
}
