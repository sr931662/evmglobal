import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../../services/api'
import styles from './CustomerProfile.module.css'

const STATUS_CLASS = {
  Sent: styles.statusSent,
  Accepted: styles.statusAccepted,
  Rejected: styles.statusRejected,
}

function Stars({ count }) {
  return <span className={styles.hotelStars}>{'*'.repeat(Math.min(count || 0, 5))}</span>
}

function TripCard({ trip }) {
  const [open, setOpen] = useState(false)

  const hasFlights = trip.flights?.length > 0
  const hasHotels = trip.hotels?.length > 0
  const hasItinerary = trip.itinerary?.length > 0
  const hasInclusions = trip.inclusions?.length > 0
  const hasExclusions = trip.exclusions?.length > 0
  const hasDetails = hasFlights || hasHotels || hasItinerary || hasInclusions || hasExclusions

  const startLabel = trip.startDate
    ? new Date(trip.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  return (
    <div className={styles.tripCard}>
      <div className={styles.tripCardHeader} onClick={() => hasDetails && setOpen((value) => !value)}>
        <div className={styles.tripTopRow}>
          <div>
            <p className={styles.tripRef}>{trip.refNumber}</p>
            <h3 className={styles.tripTitle}>{trip.tripTitle}</h3>
          </div>
          <span className={`${styles.statusBadge} ${STATUS_CLASS[trip.status] || styles.statusSent}`}>
            {trip.status}
          </span>
        </div>

        {trip.destinations?.length > 0 && (
          <div className={styles.destPills}>
            {trip.destinations.map((destination, index) => (
              <span key={index} className={styles.destPill}>{destination}</span>
            ))}
          </div>
        )}

        <div className={styles.tripMeta}>
          {startLabel && (
            <span className={styles.tripMetaItem}>
              <span className={styles.tripMetaIcon}>Date</span>
              {startLabel}
            </span>
          )}
          {trip.nights > 0 && (
            <span className={styles.tripMetaItem}>
              <span className={styles.tripMetaIcon}>Stay</span>
              {trip.nights} night{trip.nights !== 1 ? 's' : ''}
            </span>
          )}
          {trip.pax > 0 && (
            <span className={styles.tripMetaItem}>
              <span className={styles.tripMetaIcon}>Pax</span>
              {trip.pax} traveller{trip.pax !== 1 ? 's' : ''}
            </span>
          )}
          {trip.tripType && (
            <span className={styles.tripMetaItem}>
              <span className={styles.tripMetaIcon}>Type</span>
              {trip.tripType}
            </span>
          )}
        </div>
      </div>

      {hasDetails && (
        <div className={styles.expandRow} onClick={() => setOpen((value) => !value)}>
          <button className={styles.expandBtn}>
            {open ? 'Hide Details' : 'View Full Details'}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              className={`${styles.expandArrow} ${open ? styles.expandArrowOpen : ''}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {trip.validUntil && !open && (
            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
              Valid until {trip.validUntil}
            </span>
          )}
        </div>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.tripDetails}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
            style={{ overflow: 'hidden' }}
          >
            {hasFlights && (
              <div className={styles.detailSection}>
                <p className={styles.detailSectionTitle}>Flights</p>
                <div className={styles.flightList}>
                  {trip.flights.map((flight, index) => (
                    <div key={index} className={styles.flightRow}>
                      <div className={styles.flightDir}>
                        {flight.type === 'return' ? 'RT' : 'FL'}
                      </div>
                      <div className={styles.flightInfo}>
                        <p className={styles.flightRoute}>
                          {flight.from} to {flight.to}
                        </p>
                        <p className={styles.flightMeta}>
                          {[flight.airline, flight.flightNumber, flight.departure].filter(Boolean).join(' | ')}
                          {flight.duration ? ` | ${flight.duration}` : ''}
                          {flight.baggage ? ` | ${flight.baggage}` : ''}
                        </p>
                      </div>
                      {flight.class && <span className={styles.flightClass}>{flight.class}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasHotels && (
              <div className={styles.detailSection}>
                <p className={styles.detailSectionTitle}>Accommodation</p>
                <div className={styles.hotelList}>
                  {trip.hotels.map((hotel, index) => (
                    <div key={index} className={styles.hotelRow}>
                      <span className={styles.hotelIcon}>HT</span>
                      <div className={styles.hotelInfo}>
                        <p className={styles.hotelName}>
                          {hotel.name}
                          {hotel.stars > 0 && <> &nbsp;<Stars count={hotel.stars} /></>}
                        </p>
                        <p className={styles.hotelMeta}>
                          {[
                            hotel.location,
                            hotel.nights ? `${hotel.nights} night${hotel.nights !== 1 ? 's' : ''}` : null,
                            hotel.roomCategory,
                            hotel.mealPlan,
                          ].filter(Boolean).join(' | ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasItinerary && (
              <div className={styles.detailSection}>
                <p className={styles.detailSectionTitle}>Day-by-Day Itinerary</p>
                <div className={styles.itineraryList}>
                  {trip.itinerary.map((day, index) => (
                    <div key={index} className={styles.itineraryDay}>
                      <span className={styles.dayLabel}>Day {day.day}</span>
                      <div>
                        {day.title && <p className={styles.dayTitle}>{day.title}</p>}
                        {day.description && <p className={styles.dayDesc}>{day.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(hasInclusions || hasExclusions) && (
              <div className={styles.detailSection}>
                <p className={styles.detailSectionTitle}>What's Covered</p>
                <div className={styles.listGrid}>
                  {hasInclusions && (
                    <div className={styles.listBox}>
                      <p className={`${styles.listBoxTitle} ${styles.listBoxTitleGreen}`}>Included</p>
                      {trip.inclusions.map((item, index) => (
                        <div key={index} className={styles.listItem}>
                          <span className={styles.listItemDot} style={{ color: '#15803d' }}>+</span>
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                  {hasExclusions && (
                    <div className={styles.listBox}>
                      <p className={`${styles.listBoxTitle} ${styles.listBoxTitleRed}`}>Not Included</p>
                      {trip.exclusions.map((item, index) => (
                        <div key={index} className={styles.listItem}>
                          <span className={styles.listItemDot} style={{ color: '#dc2626' }}>-</span>
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {trip.terms?.length > 0 && (
              <div className={styles.detailSection}>
                <p className={styles.detailSectionTitle}>Terms & Conditions</p>
                <div className={styles.listBox} style={{ background: '#fffbeb' }}>
                  {trip.terms.map((term, index) => (
                    <div key={index} className={styles.listItem}>
                      <span className={styles.listItemDot} style={{ color: '#92400e' }}>-</span>
                      {term}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function TripHistory() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.customerGetMyTrips()
      .then(setTrips)
      .catch((err) => setError(err.message || 'Could not load trips.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className={styles.tripsHeader}>
        <h2 className={styles.tripsTitle}>My Trips</h2>
        <p className={styles.tripsSubtitle}>Your confirmed travel itineraries and journey records.</p>
      </div>

      {loading && (
        <div className={styles.spinner}>
          <div className={styles.spinnerDot} />
        </div>
      )}

      {!loading && error && (
        <div className={styles.errorBanner} style={{ marginBottom: '1rem' }}>{error}</div>
      )}

      {!loading && !error && trips.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>TR</div>
          <h3 className={styles.emptyTitle}>No trips yet</h3>
          <p className={styles.emptyText}>
            Your confirmed travel itineraries will appear here once your first quote is sent.
            <br />Reach out to us to start planning your perfect escape.
          </p>
        </div>
      )}

      {!loading && !error && trips.map((trip) => (
        <TripCard key={trip.id} trip={trip} />
      ))}
    </motion.div>
  )
}
