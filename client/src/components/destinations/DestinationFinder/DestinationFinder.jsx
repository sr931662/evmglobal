import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../services/api'
import { openWhatsApp } from '../../../utils/whatsapp'
import { getLenis } from '../../../hooks/useLenis'
import { trackFunnel } from '../../../utils/analytics'
import {
  TRIP_TYPES, BUDGET_BANDS, MONTHS, SCOPES,
  recommendDestinations, budgetSymbol,
} from '../../../utils/destinationMatch'
import styles from './DestinationFinder.module.css'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80&w=400'

const ARROW = (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
)

const STEPS = ['tripTypes', 'month', 'budget', 'scope']

const EMPTY = { tripTypes: [], month: null, budget: null, scope: 'any' }

// Answers the question travellers actually arrive with — "where should we go?"
// — rather than assuming they already know. Opened from anywhere via the
// `open-destination-finder` event.
export default function DestinationFinder() {
  const navigate = useNavigate()
  const [open, setOpen]       = useState(false)
  const [step, setStep]       = useState(0)
  const [answers, setAnswers] = useState(EMPTY)
  const [destinations, setDestinations] = useState([])
  const [showResults, setShowResults]   = useState(false)

  useEffect(() => {
    const handler = () => { setOpen(true); trackFunnel('discovery', { tool: 'destination_finder' }) }
    window.addEventListener('open-destination-finder', handler)
    return () => window.removeEventListener('open-destination-finder', handler)
  }, [])

  useEffect(() => {
    if (!open) return
    api.getDestinations().then(data => {
      setDestinations(Array.isArray(data) ? data : [])
    }).catch(() => setDestinations([]))
  }, [open])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
      getLenis()?.stop()
    } else {
      document.body.style.overflow = ''
      getLenis()?.start()
    }
    return () => {
      document.body.style.overflow = ''
      getLenis()?.start()
    }
  }, [open])

  const results = useMemo(
    () => (showResults ? recommendDestinations(destinations, answers, 3) : []),
    [showResults, destinations, answers]
  )

  const close = () => setOpen(false)

  const restart = () => {
    setAnswers(EMPTY)
    setStep(0)
    setShowResults(false)
  }

  const toggleTripType = (id) => setAnswers(prev => ({
    ...prev,
    tripTypes: prev.tripTypes.includes(id)
      ? prev.tripTypes.filter(t => t !== id)
      : [...prev.tripTypes, id],
  }))

  const currentStep = STEPS[step]
  const canAdvance =
    currentStep === 'tripTypes' ? answers.tripTypes.length > 0
      : currentStep === 'month'  ? true
      : currentStep === 'budget' ? true
      : true

  const advance = () => {
    if (step < STEPS.length - 1) { setStep(step + 1); return }
    setShowResults(true)
    trackFunnel('consideration', {
      tool: 'destination_finder',
      trip_types: answers.tripTypes.join(','),
      month: answers.month || 'any',
      budget: answers.budget || 'any',
    })
  }

  const openDestination = (dest) => {
    close()
    navigate(`/packages?destination=${encodeURIComponent(dest.name)}`)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={close}
        >
          <motion.div
            className={`${styles.panel} modal-scroll`}
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Find the right destination"
          >
            <button onClick={close} className={styles.closeBtn} aria-label="Close">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {showResults ? (
              <>
                <span className={styles.eyebrow}>Our Recommendation</span>
                <h2 className={styles.heading}>
                  {results.length > 0 ? "Based on your answers, we'd suggest:" : 'We need a little more to go on'}
                </h2>

                {results.length > 0 ? (
                  <>
                    <p className={styles.sub}>
                      Three destinations that fit what you described. A travel expert can talk you
                      through any of them.
                    </p>

                    <div className={styles.results}>
                      {results.map((entry, i) => (
                        <button
                          key={entry.dest.id || entry.dest._id || entry.dest.name}
                          onClick={() => openDestination(entry.dest)}
                          className={styles.result}
                        >
                          <span className={styles.resultRank}>{i + 1}</span>
                          <img
                            src={entry.dest.image || FALLBACK_IMG}
                            alt={entry.dest.name}
                            loading="lazy"
                            className={styles.resultImg}
                          />
                          <span className={styles.resultBody}>
                            <span className={styles.resultName}>{entry.dest.name}</span>
                            <span className={styles.resultCountry}>{entry.dest.country}</span>
                            {entry.reasons.length > 0 && (
                              <span className={styles.reasons}>
                                {entry.reasons.map(reason => (
                                  <span key={reason} className={styles.reason}>{reason}</span>
                                ))}
                              </span>
                            )}
                          </span>
                          {budgetSymbol(entry.dest.budgetLevel) && (
                            <span className={styles.resultBudget}>{budgetSymbol(entry.dest.budgetLevel)}</span>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className={styles.resultActions}>
                      <button
                        onClick={() => { close(); window.dispatchEvent(new CustomEvent('open-travel-quiz')) }}
                        className={styles.primaryBtn}
                      >
                        Get My Personalised Quote {ARROW}
                      </button>
                      <button
                        onClick={() => openWhatsApp(results[0]?.dest?.name || '')}
                        className={styles.ghostBtn}
                      >
                        Talk to a Travel Expert
                      </button>
                    </div>
                  </>
                ) : (
                  <div className={styles.empty}>
                    <p className={styles.emptyTitle}>No confident match yet</p>
                    <p className={styles.emptyDesc}>
                      Rather than guess, we&rsquo;d rather have a travel expert talk it through with
                      you — they&rsquo;ll ask a few more questions and come back with real options.
                    </p>
                    <div className={styles.resultActions}>
                      <button onClick={() => openWhatsApp()} className={styles.primaryBtn}>
                        Talk to a Travel Expert
                      </button>
                    </div>
                  </div>
                )}

                <button onClick={restart} className={styles.restart}>← Start over</button>
              </>
            ) : (
              <>
                <span className={styles.eyebrow}>Help Me Choose</span>
                <h2 className={styles.heading}>Not sure where to go?</h2>
                <p className={styles.sub}>
                  Four quick questions and we&rsquo;ll suggest the destinations that fit.
                </p>

                <div className={styles.progress} aria-hidden="true">
                  {STEPS.map((_, i) => (
                    <span key={i} className={`${styles.pip} ${i <= step ? styles.pipOn : ''}`} />
                  ))}
                </div>

                {currentStep === 'tripTypes' && (
                  <>
                    <p className={styles.question}>What kind of holiday do you want?</p>
                    <p className={styles.hint}>Pick as many as apply.</p>
                    <div className={styles.options}>
                      {TRIP_TYPES.map(type => (
                        <button
                          key={type.id}
                          onClick={() => toggleTripType(type.id)}
                          className={`${styles.option} ${answers.tripTypes.includes(type.id) ? styles.optionOn : ''}`}
                        >
                          <span className={styles.optionIcon} aria-hidden="true">{type.icon}</span>
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {currentStep === 'month' && (
                  <>
                    <p className={styles.question}>When are you thinking of travelling?</p>
                    <p className={styles.hint}>Skip this if your dates are flexible.</p>
                    <div className={styles.monthGrid}>
                      {MONTHS.map((name, i) => (
                        <button
                          key={name}
                          onClick={() => setAnswers(p => ({ ...p, month: p.month === i + 1 ? null : i + 1 }))}
                          className={`${styles.month} ${answers.month === i + 1 ? styles.monthOn : ''}`}
                        >
                          {name.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {currentStep === 'budget' && (
                  <>
                    <p className={styles.question}>Roughly what&rsquo;s your budget?</p>
                    <p className={styles.hint}>Per person, excluding flights. Skip if you&rsquo;re unsure.</p>
                    <div className={`${styles.options} ${styles.optionsOne}`}>
                      {BUDGET_BANDS.map(band => (
                        <button
                          key={band.id}
                          onClick={() => setAnswers(p => ({ ...p, budget: p.budget === band.id ? null : band.id }))}
                          className={`${styles.option} ${answers.budget === band.id ? styles.optionOn : ''}`}
                        >
                          <span className={styles.optionIcon} aria-hidden="true">{band.symbol}</span>
                          {band.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {currentStep === 'scope' && (
                  <>
                    <p className={styles.question}>India or international?</p>
                    <p className={styles.hint}>We plan both.</p>
                    <div className={`${styles.options} ${styles.optionsOne}`}>
                      {SCOPES.map(scope => (
                        <button
                          key={scope.id}
                          onClick={() => setAnswers(p => ({ ...p, scope: scope.id }))}
                          className={`${styles.option} ${answers.scope === scope.id ? styles.optionOn : ''}`}
                        >
                          {scope.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <div className={styles.nav}>
                  <button
                    onClick={() => (step > 0 ? setStep(step - 1) : close())}
                    className={styles.backBtn}
                  >
                    {step > 0 ? '← Back' : 'Cancel'}
                  </button>
                  <button onClick={advance} disabled={!canAdvance} className={styles.nextBtn}>
                    {step === STEPS.length - 1 ? 'Show My Destinations' : 'Continue'} {ARROW}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
