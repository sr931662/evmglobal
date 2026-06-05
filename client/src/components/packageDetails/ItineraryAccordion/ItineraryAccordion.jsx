import { useState } from 'react'
import { itinerary } from '../../../data/packages'
import styles from './ItineraryAccordion.module.css'

const ACT_ICON_CLASS = [styles.actIconBlue, styles.actIconGreen, styles.actIconBrand]
const ACT_EMOJI = ['✈', '🚗', '⛵']

export default function ItineraryAccordion() {
  const [activeId, setActiveId] = useState(1)

  return (
    <div className={styles.list}>
      {itinerary.map(day => {
        const open = activeId === day.id
        return (
          <div key={day.id} className={styles.item}>
            <div
              className={styles.header}
              onClick={() => setActiveId(open ? null : day.id)}
            >
              <div className={styles.headerLeft}>
                <div className={`${styles.dayBadge} ${open ? styles.dayBadgeActive : ''}`}>
                  {day.day}
                </div>
                <div>
                  <h3 className={styles.title}>{day.title}</h3>
                  <p className={styles.date}>{day.date}</p>
                </div>
              </div>
              <div className={`${styles.icon} ${open ? styles.iconOpen : ''}`}>
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/></svg>
              </div>
            </div>

            {open && (
              <div className={styles.content}>
                {day.activities.length > 1 ? (
                  <div className={styles.timeline}>
                    <div className={styles.timelineLine} />
                    {day.activities.map((act, i) => (
                      <div key={i} className={styles.activity}>
                        <div className={styles.actIconCol}>
                          <div className={`${styles.actIcon} ${ACT_ICON_CLASS[i] || styles.actIconBrand}`}>
                            {ACT_EMOJI[i] || '⛵'}
                          </div>
                        </div>
                        <div className={`${styles.actBody} ${i < day.activities.length - 1 ? styles.actBodySpaced : ''}`}>
                          <h4 className={styles.actTitle}>{act.title}</h4>
                          <p className={styles.actDesc}>{act.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.single}>
                    <p className={styles.actDesc}>{day.activities[0].description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
