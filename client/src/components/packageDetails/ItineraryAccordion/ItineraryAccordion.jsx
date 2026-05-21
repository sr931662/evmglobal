import { useState } from 'react'
import { itinerary } from '../../../data/packages'
import styles from './ItineraryAccordion.module.css'

export default function ItineraryAccordion() {
  const [activeId, setActiveId] = useState(1)

  return (
    <div className="space-y-8">
      {itinerary.map(day => (
        <div
          key={day.id}
          className={`bg-white rounded-[3rem] border border-gray-200 shadow-glass overflow-hidden group ${activeId === day.id ? 'accordion-active' : ''}`}
        >
          <div
            className="p-10 md:p-12 cursor-pointer flex items-center justify-between hover:bg-gray-50/50 transition-colors"
            onClick={() => setActiveId(activeId === day.id ? null : day.id)}
          >
            <div className="flex items-center gap-8">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center font-bold text-3xl border ${activeId === day.id ? 'bg-brand/5 text-brand border-brand/10 shadow-sm' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                {day.day}
              </div>
              <div>
                <h3 className="text-3xl font-serif font-bold text-dark mb-2 tracking-tight">{day.title}</h3>
                <p className="text-sm text-gray-500 font-black uppercase tracking-[0.3em]">{day.date}</p>
              </div>
            </div>
            <div className="accordion-icon transition-transform duration-700 text-gray-400 bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center border border-gray-100 group-hover:border-gray-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/></svg>
            </div>
          </div>

          <div className="accordion-content border-t border-gray-100 bg-gray-50/30">
            <div>
              {day.activities.length > 1 ? (
                <div className="p-10 md:p-14 space-y-12 relative">
                  <div className="absolute left-[4.5rem] md:left-[5.5rem] top-14 bottom-14 w-[2px] bg-gray-200 rounded-full" />
                  {day.activities.map((act, i) => (
                    <div key={i} className="flex gap-10 relative z-10">
                      <div className="w-16 flex flex-col items-center flex-shrink-0">
                        <div className={`w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-md border ${i === 0 ? 'border-blue-100 text-blue-600' : i === 1 ? 'border-green-100 text-green-600' : 'border-brand/20 text-brand'} text-2xl`}>
                          {i === 0 ? '✈' : i === 1 ? '🚗' : '⛵'}
                        </div>
                      </div>
                      <div className={`flex-1 ${i < day.activities.length - 1 ? 'pb-4' : ''}`}>
                        <h4 className="font-bold text-dark mb-4 text-xl font-serif">{act.title}</h4>
                        <p className="text-gray-600 text-lg leading-relaxed font-light bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">{act.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 md:p-14">
                  <p className="text-gray-600 text-lg leading-relaxed font-light bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">{day.activities[0].description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
