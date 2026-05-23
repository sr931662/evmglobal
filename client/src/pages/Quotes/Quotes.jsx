import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../../services/api'
import { openWhatsApp } from '../../utils/whatsapp'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n) {
  return Number(n || 0).toLocaleString('en-IN')
}

function nightsLabel(n) {
  return `${n || 0}N${(n || 0) + 1}D`
}

function computeTotal(costItems = [], taxPercent = 5) {
  const sub = costItems.reduce((s, i) => s + (Number(i.amount) || 0), 0)
  return { subtotal: sub, tax: Math.round(sub * taxPercent / 100), total: Math.round(sub + sub * taxPercent / 100) }
}

const statusStyle = {
  Sent:     { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500'   },
  Accepted: { bg: 'bg-green-50',  text: 'text-green-700',  dot: 'bg-green-500'  },
  Draft:    { bg: 'bg-gray-100',  text: 'text-gray-600',   dot: 'bg-gray-400'   },
  Rejected: { bg: 'bg-red-50',    text: 'text-red-600',    dot: 'bg-red-400'    },
}

// ─── Print helper ─────────────────────────────────────────────────────────────
function printQuoteHTML(html, ref) {
  const full = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${ref}</title>
    <style>
      @page { size: A4; margin: 18mm; }
      * { box-sizing: border-box; }
      body { margin: 0; background: #fff; font-family: Georgia, serif; color: #111; }
    </style>
  </head><body>${html}</body></html>`
  const blob = new Blob([full], { type: 'text/html;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const w    = window.open(url, '_blank')
  w?.addEventListener('load', () => { w.print(); URL.revokeObjectURL(url) })
}

// ─── Quote display component ──────────────────────────────────────────────────
function QuoteView({ quote }) {
  const printRef = useRef(null)
  const { subtotal, tax, total } = computeTotal(quote.costItems, quote.taxPercent)
  const outbound = quote.flights?.find(f => f.type === 'outbound')
  const ret      = quote.flights?.find(f => f.type === 'return')
  const st       = statusStyle[quote.status] || statusStyle.Sent

  function handlePrint() {
    if (!printRef.current) return
    printQuoteHTML(printRef.current.innerHTML, quote.refNumber)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1] }}
      className="max-w-[900px] mx-auto"
    >
      {/* Quote header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-sm font-bold text-gray-500">{quote.refNumber}</span>
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${st.bg} ${st.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
              {quote.status}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-dark">{quote.tripTitle}</h2>
          <p className="text-gray-500 text-sm mt-1">
            {quote.destinations?.join(' · ')} · {nightsLabel(quote.nights)} · {quote.pax} Pax · {quote.tripType}
            {quote.startDate && ` · Departure: ${quote.startDate}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span>🖨</span> Download PDF
          </button>
          <button
            onClick={() => openWhatsApp(`Hi, I'm viewing my quote ${quote.refNumber} — ${quote.tripTitle}`)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark text-white text-sm font-bold hover:bg-dark/90 transition-colors"
          >
            <span className="text-whatsapp">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.112.555 4.094 1.523 5.813L0 24l6.336-1.499A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.946 0-3.77-.51-5.338-1.4l-.382-.225-3.961.937.997-3.868-.249-.401A9.942 9.942 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
              </svg>
            </span>
            Chat with Us
          </button>
        </div>
      </div>

      {/* Quote card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden mb-8">

        {/* Cost summary */}
        <div className="p-6 sm:p-8 border-b border-gray-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Cost Breakdown</p>
          <div className="space-y-2">
            {quote.costItems?.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{item.description}</span>
                <span className="font-bold text-dark">{quote.currency || 'INR'} {fmt(item.amount)}</span>
              </div>
            ))}
            {quote.taxPercent > 0 && (
              <div className="flex justify-between items-center text-sm text-gray-400 border-t border-gray-100 pt-2 mt-2">
                <span>Tax &amp; Markup ({quote.taxPercent}%)</span>
                <span>{quote.currency || 'INR'} {fmt(tax)}</span>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm font-black uppercase tracking-widest text-dark">Total ({quote.pax} Pax)</span>
            <span className="text-2xl font-serif font-bold text-brand">{quote.currency || 'INR'} {fmt(total)}</span>
          </div>
          {quote.validUntil && (
            <p className="text-xs text-gray-400 mt-3">Quote valid until: <strong className="text-gray-600">{quote.validUntil}</strong></p>
          )}
        </div>

        {/* Flights */}
        {(outbound || ret) && (
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Flight Details</p>
            <div className="space-y-3">
              {[outbound, ret].filter(Boolean).map((fl, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${fl.type === 'outbound' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                      {fl.type === 'outbound' ? '↗ Outbound' : '↙ Return'}
                    </span>
                    <span className="text-sm font-bold text-dark">{fl.airline} {fl.flightNumber}</span>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap text-sm">
                    <div className="text-center">
                      <div className="font-black text-lg text-dark">{fl.departure}</div>
                      <div className="text-xs text-gray-500 font-bold">{fl.from}</div>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <div className="text-xs text-gray-400">{fl.duration}</div>
                      <div className="w-full flex items-center gap-1 mt-1">
                        <div className="flex-1 h-px bg-gray-300" />
                        <div className="text-gray-400 text-xs">✈</div>
                        <div className="flex-1 h-px bg-gray-300" />
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">{fl.class} · {fl.baggage}</div>
                    </div>
                    <div className="text-center">
                      <div className="font-black text-lg text-dark">{fl.arrival}</div>
                      <div className="text-xs text-gray-500 font-bold">{fl.to}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hotels */}
        {quote.hotels?.filter(h => h.name).length > 0 && (
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Accommodation</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quote.hotels.filter(h => h.name).map((h, i) => (
                <div key={i} className="border border-gray-200 rounded-2xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-dark text-sm">{h.name}</p>
                      <p className="text-amber-500 text-sm">{'★'.repeat(h.stars || 3)}</p>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 px-2 py-1 rounded-lg">{h.mealPlan}</span>
                  </div>
                  <div className="text-xs text-gray-500 space-y-0.5">
                    {h.location && <p>📍 {h.location}</p>}
                    {h.nights && <p>🌙 {h.nights} night{h.nights > 1 ? 's' : ''}</p>}
                    {h.roomCategory && <p>🛏 {h.roomCategory}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Itinerary */}
        {quote.itinerary?.filter(d => d.title || d.description).length > 0 && (
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Day-wise Itinerary</p>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />
              <div className="space-y-6">
                {quote.itinerary.filter(d => d.title || d.description).map((day) => (
                  <div key={day.day} className="flex gap-5">
                    <div className="w-8 h-8 rounded-full bg-dark text-white text-xs font-black flex items-center justify-center flex-shrink-0 relative z-10">
                      {day.day}
                    </div>
                    <div className="flex-1 pb-2">
                      {day.title && <p className="font-bold text-dark mb-1">{day.title}</p>}
                      {day.description && <p className="text-sm text-gray-500 leading-relaxed">{day.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Inclusions / Exclusions */}
        {(quote.inclusions?.filter(Boolean).length > 0 || quote.exclusions?.filter(Boolean).length > 0) && (
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {quote.inclusions?.filter(Boolean).length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-green-700 mb-3">✓ What's Included</p>
                  <ul className="space-y-2">
                    {quote.inclusions.filter(Boolean).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-green-500 font-bold mt-0.5 flex-shrink-0">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {quote.exclusions?.filter(Boolean).length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-3">✗ Not Included</p>
                  <ul className="space-y-2">
                    {quote.exclusions.filter(Boolean).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
                        <span className="text-red-400 font-bold mt-0.5 flex-shrink-0">✗</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {quote.notes?.filter(Boolean).length > 0 && (
          <div className="p-6 sm:p-8 border-b border-gray-100 bg-amber-50/40">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 mb-3">⚠ Important Notes</p>
            <ul className="space-y-2">
              {quote.notes.filter(Boolean).map((note, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-amber-500 flex-shrink-0 mt-0.5">•</span>
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Terms */}
        {quote.terms?.filter(Boolean).length > 0 && (
          <div className="p-6 sm:p-8">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Terms &amp; Conditions</p>
            <ol className="space-y-1.5">
              {quote.terms.filter(Boolean).map((term, i) => (
                <li key={i} className="text-xs text-gray-500 leading-relaxed">
                  {i + 1}. {term}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>

      {/* CTA strip */}
      <div className="bg-dark rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <p className="font-serif font-bold text-white text-lg mb-1">Ready to confirm?</p>
          <p className="text-gray-400 text-sm">Our concierge is available 24/7 to answer questions and lock in your booking.</p>
        </div>
        <button
          onClick={() => openWhatsApp(`I'd like to confirm my quote ${quote.refNumber} — ${quote.tripTitle}`)}
          className="flex-shrink-0 flex items-center gap-2.5 px-6 py-3.5 bg-white text-dark rounded-2xl font-bold text-sm hover:bg-gray-100 transition-colors shadow-sm"
        >
          <span className="text-whatsapp text-lg">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.112.555 4.094 1.523 5.813L0 24l6.336-1.499A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.946 0-3.77-.51-5.338-1.4l-.382-.225-3.961.937.997-3.868-.249-.401A9.942 9.942 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
            </svg>
          </span>
          Confirm on WhatsApp
        </button>
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-gray-400 pb-8">
        Generated by EMV CRM · Ease My Vacations Global Private Limited · Prepared by {quote.agentName || 'EMV Team'}
      </p>

      {/* Hidden print node */}
      <div ref={printRef} style={{ display: 'none' }}>
        <QuotePrintTemplate quote={quote} subtotal={subtotal} tax={tax} total={total} outbound={outbound} ret={ret} />
      </div>
    </motion.div>
  )
}

// ─── Print template (inline styles only) ─────────────────────────────────────
function QuotePrintTemplate({ quote, subtotal, tax, total, outbound, ret }) {
  return (
    <div style={{ fontFamily: 'Georgia, serif', color: '#111', background: '#fff', maxWidth: 860, margin: '0 auto' }}>
      <table width="100%" style={{ borderBottom: '3px solid #c9a96e', paddingBottom: 20, marginBottom: 24 }}>
        <tbody><tr>
          <td>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 28, fontWeight: 900, letterSpacing: 2 }}>EMV</div>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 4, color: '#888', marginTop: 2 }}>GLOBAL</div>
          </td>
          <td style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 20, fontWeight: 700 }}>TRAVEL QUOTE</div>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, color: '#666', marginTop: 4 }}>Ref: <strong>{quote.refNumber}</strong></div>
            {quote.validUntil && <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, color: '#666' }}>Valid: {quote.validUntil}</div>}
          </td>
        </tr></tbody>
      </table>

      <table width="100%" style={{ marginBottom: 24 }}>
        <tbody><tr>
          <td width="50%" style={{ verticalAlign: 'top' }}>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#c9a96e', marginBottom: 6 }}>PREPARED FOR</div>
            <div style={{ fontSize: 17, fontWeight: 700 }}>{quote.clientName}</div>
            {quote.clientPhone && <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#555', marginTop: 3 }}>{quote.clientPhone}</div>}
          </td>
          <td width="50%" style={{ verticalAlign: 'top' }}>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#c9a96e', marginBottom: 6 }}>TRIP DETAILS</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{quote.tripTitle}</div>
            <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#555', marginTop: 3 }}>
              {[quote.destinations?.join(' · '), nightsLabel(quote.nights), `${quote.pax} Pax`].filter(Boolean).join(' | ')}
            </div>
          </td>
        </tr></tbody>
      </table>

      {/* Costs */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#c9a96e', marginBottom: 8 }}>COST BREAKDOWN</div>
        <table width="100%" style={{ borderCollapse: 'collapse' }}>
          <tbody>
            {quote.costItems?.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ fontFamily: 'Arial, sans-serif', fontSize: 13, padding: '7px 0' }}>{item.description}</td>
                <td style={{ fontFamily: 'Arial, sans-serif', fontSize: 13, fontWeight: 700, textAlign: 'right', padding: '7px 0' }}>{quote.currency || 'INR'} {fmt(item.amount)}</td>
              </tr>
            ))}
            {quote.taxPercent > 0 && (
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#777', padding: '7px 0' }}>Tax & Markup ({quote.taxPercent}%)</td>
                <td style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#777', textAlign: 'right', padding: '7px 0' }}>{quote.currency || 'INR'} {fmt(tax)}</td>
              </tr>
            )}
            <tr style={{ background: '#f9f5ee' }}>
              <td style={{ fontFamily: 'Arial, sans-serif', fontSize: 14, fontWeight: 900, padding: '10px 8px' }}>TOTAL ({quote.pax} Pax)</td>
              <td style={{ fontFamily: 'Arial, sans-serif', fontSize: 14, fontWeight: 900, textAlign: 'right', padding: '10px 8px', color: '#c9a96e' }}>{quote.currency || 'INR'} {fmt(total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Flights */}
      {(outbound || ret) && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#c9a96e', marginBottom: 8 }}>FLIGHT DETAILS</div>
          {[outbound, ret].filter(Boolean).map((fl, i) => (
            <div key={i} style={{ background: '#f9f9f9', borderRadius: 6, padding: '10px 14px', marginBottom: 6 }}>
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, fontWeight: 700, color: '#888', marginBottom: 4 }}>{fl.type === 'outbound' ? 'OUTBOUND' : 'RETURN'} · {fl.airline} {fl.flightNumber}</div>
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 13 }}>
                <strong>{fl.from}</strong> {fl.departure} → <strong>{fl.to}</strong> {fl.arrival}
                {fl.duration && <span style={{ color: '#777' }}> · {fl.duration}</span>}
                {fl.class && <span style={{ color: '#777' }}> · {fl.class}</span>}
                {fl.baggage && <span style={{ color: '#777' }}> · {fl.baggage}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hotels */}
      {quote.hotels?.filter(h => h.name).length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#c9a96e', marginBottom: 8 }}>ACCOMMODATION</div>
          {quote.hotels.filter(h => h.name).map((h, i) => (
            <div key={i} style={{ borderLeft: '3px solid #c9a96e', paddingLeft: 12, marginBottom: 10 }}>
              <div style={{ fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 13 }}>{h.name} {'★'.repeat(h.stars || 3)}</div>
              <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#555', marginTop: 2 }}>
                {[h.location, `${h.nights}N`, h.roomCategory, h.mealPlan].filter(Boolean).join(' · ')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Itinerary */}
      {quote.itinerary?.filter(d => d.title || d.description).length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#c9a96e', marginBottom: 8 }}>ITINERARY</div>
          {quote.itinerary.filter(d => d.title || d.description).map(day => (
            <div key={day.day} style={{ marginBottom: 8 }}>
              <div style={{ fontFamily: 'Arial, sans-serif', fontWeight: 700, fontSize: 13 }}>Day {day.day}{day.title ? ` — ${day.title}` : ''}</div>
              {day.description && <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, color: '#444', lineHeight: 1.6, marginTop: 2 }}>{day.description}</div>}
            </div>
          ))}
        </div>
      )}

      {/* Inclusions / Exclusions */}
      {(quote.inclusions?.filter(Boolean).length > 0 || quote.exclusions?.filter(Boolean).length > 0) && (
        <table width="100%" style={{ marginBottom: 24 }}>
          <tbody><tr>
            {quote.inclusions?.filter(Boolean).length > 0 && (
              <td width="50%" style={{ verticalAlign: 'top', paddingRight: 16 }}>
                <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#c9a96e', marginBottom: 6 }}>INCLUSIONS</div>
                {quote.inclusions.filter(Boolean).map((item, i) => (
                  <div key={i} style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, marginBottom: 4 }}><span style={{ color: '#2e7d32', fontWeight: 700 }}>✓</span> {item}</div>
                ))}
              </td>
            )}
            {quote.exclusions?.filter(Boolean).length > 0 && (
              <td width="50%" style={{ verticalAlign: 'top' }}>
                <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#c9a96e', marginBottom: 6 }}>EXCLUSIONS</div>
                {quote.exclusions.filter(Boolean).map((item, i) => (
                  <div key={i} style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, marginBottom: 4 }}><span style={{ color: '#c62828', fontWeight: 700 }}>✗</span> {item}</div>
                ))}
              </td>
            )}
          </tr></tbody>
        </table>
      )}

      {/* Notes */}
      {quote.notes?.filter(Boolean).length > 0 && (
        <div style={{ marginBottom: 20, background: '#fffdf7', border: '1px solid #e8d9b5', borderRadius: 6, padding: '14px 18px' }}>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#c9a96e', marginBottom: 6 }}>IMPORTANT NOTES</div>
          {quote.notes.filter(Boolean).map((n, i) => (
            <div key={i} style={{ fontFamily: 'Arial, sans-serif', fontSize: 12, marginBottom: 4, color: '#333' }}>• {n}</div>
          ))}
        </div>
      )}

      {/* Terms */}
      {quote.terms?.filter(Boolean).length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 3, color: '#c9a96e', marginBottom: 6 }}>TERMS & CONDITIONS</div>
          {quote.terms.filter(Boolean).map((t, i) => (
            <div key={i} style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, marginBottom: 4, color: '#555' }}>{i + 1}. {t}</div>
          ))}
        </div>
      )}

      <div style={{ borderTop: '2px solid #c9a96e', paddingTop: 14, marginTop: 14, display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, color: '#888' }}>Generated by EMV CRM · Ease My Vacations Global Private Limited</div>
        <div style={{ fontFamily: 'Arial, sans-serif', fontSize: 11, fontWeight: 700, color: '#555' }}>Agent: {quote.agentName || 'EMV Team'}</div>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function QuotesPage() {
  const [ref, setRef]       = useState('')
  const [phone, setPhone]   = useState('')
  const [loading, setLoading] = useState(false)
  const [quote, setQuote]   = useState(null)
  const [error, setError]   = useState(null)

  async function handleLookup(e) {
    e.preventDefault()
    if (!ref.trim()) return
    setLoading(true)
    setError(null)
    setQuote(null)
    try {
      const data = await api.lookupQuote(ref.trim(), phone.trim())
      setQuote(data)
    } catch (err) {
      setError('Quote not found. Please check your reference number and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white min-h-screen pt-[85px] md:pt-[100px]">

      {/* Hero */}
      <section className="bg-dark py-14 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, white 0, transparent 50%), radial-gradient(circle at 80% 20%, white 0, transparent 40%)'
        }} />
        <div className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
          >
            <span className="text-brand font-black uppercase tracking-[0.3em] text-[10px] mb-6 flex items-center justify-center gap-3">
              <span className="w-8 h-[2px] bg-brand" /> Travel Quotes <span className="w-8 h-[2px] bg-brand" />
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-5 tracking-tight">
              Your personalised<br className="hidden sm:block" /> journey awaits.
            </h1>
            <p className="text-gray-400 font-light text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              Enter your quote reference number below to view your custom travel proposal, cost breakdown, itinerary, and more.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Lookup form */}
      <section className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12 -mt-8 relative z-10 mb-12">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleLookup}
          className="bg-white rounded-3xl shadow-float border border-gray-100 p-6 sm:p-8 max-w-2xl mx-auto"
        >
          <h2 className="font-serif font-bold text-xl text-dark mb-1">View Your Quote</h2>
          <p className="text-sm text-gray-500 mb-6">Your reference number is in the format <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">EMV-Q-YYYY-NNN</code></p>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1.5">Quote Reference Number *</label>
              <input
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-mono font-bold text-dark focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all placeholder-gray-400 uppercase"
                placeholder="EMV-Q-2026-001"
                value={ref}
                onChange={e => setRef(e.target.value.toUpperCase())}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-1.5">Phone Number <span className="font-medium normal-case tracking-normal text-gray-400">(optional, for verification)</span></label>
              <input
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-dark focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all placeholder-gray-400"
                placeholder="+91 99999 99999"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                type="tel"
              />
            </div>

            {error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
                <span className="text-base">⚠</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !ref.trim()}
              className="w-full py-3.5 bg-dark text-white rounded-xl font-bold text-sm hover:bg-dark/90 disabled:opacity-50 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {loading
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Looking up…</>
                : 'View My Quote →'
              }
            </button>
          </div>
        </motion.form>
      </section>

      {/* Quote result */}
      <AnimatePresence>
        {quote && (
          <section className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12 pb-16">
            <QuoteView quote={quote} />
          </section>
        )}
      </AnimatePresence>

      {/* No quote shown — bottom callout */}
      {!quote && (
        <section className="max-w-[95rem] mx-auto px-5 sm:px-8 lg:px-12 pb-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-5xl mb-4">✈</div>
            <h3 className="font-serif font-bold text-2xl text-dark mb-3">Don't have a quote yet?</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Chat with our travel concierge on WhatsApp and we'll craft a personalised quote for your dream trip — usually within a few hours.
            </p>
            <button
              onClick={() => openWhatsApp('I would like a travel quote')}
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-dark text-white rounded-full font-bold text-sm hover:bg-dark/90 transition-colors shadow-float"
            >
              <span className="text-whatsapp text-xl">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.112.555 4.094 1.523 5.813L0 24l6.336-1.499A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.946 0-3.77-.51-5.338-1.4l-.382-.225-3.961.937.997-3.868-.249-.401A9.942 9.942 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
              </span>
              Request a Quote on WhatsApp
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
