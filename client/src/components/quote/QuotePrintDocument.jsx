import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  BRAND, COMPANY, LOGO_URL,
  computeQuote, quoteMarkdown, fmt, num, nightsLabel, durationLabel,
} from '../../utils/quote'

/* Inline styles only — this tree is serialised to a standalone print document,
   so nothing but the stylesheet in utils/quote.js travels with it. */
const S = {
  page:      { fontFamily: 'Georgia, serif', color: BRAND.ink, background: '#fff', maxWidth: 860, margin: '0 auto', padding: '28px 32px' },
  sans:      { fontFamily: 'Arial, Helvetica, sans-serif' },
  label:     { fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 10, fontWeight: 700, letterSpacing: 3, color: BRAND.red, marginBottom: 8, textTransform: 'uppercase' },
  section:   { marginBottom: 24 },
  cellSm:    { fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 12, color: '#555' },
}

function MD({ children }) {
  if (!children?.trim()) return null
  return (
    <div className="md">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  )
}

export default function QuotePrintDocument({ quote }) {
  const calc = computeQuote(quote)
  const md   = quoteMarkdown(quote)
  const cur  = calc.currency

  const outbound = quote.flights?.find(f => f.type === 'outbound')
  const ret      = quote.flights?.find(f => f.type === 'return')
  const hotels   = (quote.hotels || []).filter(h => h.name)
  const days     = (quote.itinerary || []).filter(d => d.title || d.description)

  const priceRow = (label, meta, amount, key) => (
    <tr key={key} style={{ borderBottom: `1px solid ${BRAND.line}` }}>
      <td style={{ ...S.sans, fontSize: 13, padding: '8px 0' }}>
        {label}
        {meta && <span style={{ color: BRAND.faint, fontSize: 12 }}> · {meta}</span>}
      </td>
      <td style={{ ...S.sans, fontSize: 13, fontWeight: 700, textAlign: 'right', padding: '8px 0' }}>
        {cur} {fmt(amount)}
      </td>
    </tr>
  )

  return (
    <div id="quote-print" style={S.page}>

      {/* ── Letterhead: logo + company name (left) · quote number (right) ── */}
      <table width="100%" className="avoid-break" style={{ borderBottom: `3px solid ${BRAND.red}`, paddingBottom: 18, marginBottom: 24 }}>
        <tbody><tr>
          <td style={{ verticalAlign: 'middle' }}>
            <table><tbody><tr>
              <td style={{ verticalAlign: 'middle', paddingRight: 12 }}>
                <img src={LOGO_URL} alt="EMV" width="56" height="56" style={{ display: 'block', width: 56, height: 56, objectFit: 'contain' }} />
              </td>
              <td style={{ verticalAlign: 'middle' }}>
                <div style={{ ...S.sans, fontSize: 20, fontWeight: 900, letterSpacing: 0.5, color: BRAND.ink }}>{COMPANY.name}</div>
                <div style={{ ...S.sans, fontSize: 9, fontWeight: 700, letterSpacing: 3, color: BRAND.red, marginTop: 3 }}>TRAVEL · TOURS · HOLIDAYS</div>
              </td>
            </tr></tbody></table>
          </td>
          <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>
            <div style={{ ...S.sans, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: BRAND.faint }}>QUOTE NO.</div>
            <div style={{ ...S.sans, fontSize: 20, fontWeight: 900, color: BRAND.red, marginTop: 2 }}>{quote.refNumber || 'DRAFT'}</div>
            {quote.validUntil && <div style={{ ...S.sans, fontSize: 11, color: '#666', marginTop: 3 }}>Valid until: <strong>{quote.validUntil}</strong></div>}
            {quote.status && <div style={{ ...S.sans, fontSize: 11, color: '#666' }}>Status: {quote.status}</div>}
          </td>
        </tr></tbody>
      </table>

      {/* ── Client + trip ── */}
      <table width="100%" className="avoid-break" style={{ marginBottom: 24 }}>
        <tbody><tr>
          <td width="50%" style={{ verticalAlign: 'top', paddingRight: 16 }}>
            <div style={S.label}>Prepared for</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{quote.clientName}</div>
            {quote.clientPhone && <div style={{ ...S.cellSm, marginTop: 4 }}>{quote.clientPhone}</div>}
            {quote.clientEmail && <div style={S.cellSm}>{quote.clientEmail}</div>}
          </td>
          <td width="50%" style={{ verticalAlign: 'top' }}>
            <div style={S.label}>Trip details</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{quote.tripTitle}</div>
            <div style={{ ...S.cellSm, marginTop: 4 }}>
              {[quote.destinations?.filter(Boolean).join(' · '), quote.tripType].filter(Boolean).join(' | ')}
            </div>
            <div style={S.cellSm}>
              <strong>Duration:</strong> {durationLabel(quote.nights)} ({nightsLabel(quote.nights)})
            </div>
            <div style={S.cellSm}>
              <strong>Travellers:</strong> {calc.adults} Adult{calc.adults === 1 ? '' : 's'}
              {calc.children > 0 && ` + ${calc.children} Child${calc.children === 1 ? '' : 'ren'}`}
            </div>
            {quote.startDate && <div style={S.cellSm}><strong>Departure:</strong> {quote.startDate}</div>}
          </td>
        </tr></tbody>
      </table>

      {/* ── Pricing ── */}
      <div className="avoid-break" style={S.section}>
        <div style={S.label}>Price Breakdown</div>
        <table width="100%">
          <tbody>
            {calc.adults > 0 && calc.perAdult > 0 &&
              priceRow(`Adult${calc.adults === 1 ? '' : 's'}`, `${calc.adults} × ${cur} ${fmt(calc.perAdult)} per person`, calc.adultTotal, 'ad')}
            {calc.children > 0 && calc.perChild > 0 &&
              priceRow(`Child${calc.children === 1 ? '' : 'ren'}`, `${calc.children} × ${cur} ${fmt(calc.perChild)} per child`, calc.childTotal, 'ch')}
            {calc.extraItems.filter(i => i.description).map((item, i) =>
              priceRow(item.description, null, item.amount, `x${i}`))}

            <tr style={{ borderBottom: `1px solid ${BRAND.line}` }}>
              <td style={{ ...S.sans, fontSize: 13, fontWeight: 700, padding: '8px 0' }}>Subtotal</td>
              <td style={{ ...S.sans, fontSize: 13, fontWeight: 700, textAlign: 'right', padding: '8px 0' }}>{cur} {fmt(calc.subtotal)}</td>
            </tr>

            {calc.taxes.map((t, i) => (
              <tr key={`t${i}`} style={{ borderBottom: `1px solid ${BRAND.line}` }}>
                <td style={{ ...S.sans, fontSize: 12, color: '#777', padding: '7px 0' }}>{t.name} @ {t.percent}%</td>
                <td style={{ ...S.sans, fontSize: 12, color: '#777', textAlign: 'right', padding: '7px 0' }}>{cur} {fmt(t.amount)}</td>
              </tr>
            ))}

            <tr style={{ background: BRAND.redLight }}>
              <td style={{ ...S.sans, fontSize: 15, fontWeight: 900, padding: '12px 10px' }}>
                TOTAL PAYABLE
                <span style={{ fontSize: 11, fontWeight: 400, color: '#777' }}> ({calc.pax} Pax, incl. taxes)</span>
              </td>
              <td style={{ ...S.sans, fontSize: 16, fontWeight: 900, textAlign: 'right', padding: '12px 10px', color: BRAND.red }}>
                {cur} {fmt(calc.total)}
              </td>
            </tr>
          </tbody>
        </table>
        {calc.pax > 0 && (
          <div style={{ ...S.sans, fontSize: 11, color: '#777', marginTop: 6, textAlign: 'right' }}>
            Works out to {cur} {fmt(calc.perPerson)} per person (incl. taxes)
          </div>
        )}
      </div>

      {/* ── Flights ── */}
      {(outbound || ret) && (
        <div className="avoid-break" style={S.section}>
          <div style={S.label}>Flight Details</div>
          {[outbound, ret].filter(Boolean).map((fl, i) => (
            <div key={i} style={{ background: '#fafafa', borderLeft: `3px solid ${BRAND.red}`, borderRadius: 4, padding: '10px 14px', marginBottom: 8 }}>
              <div style={{ ...S.sans, fontSize: 11, fontWeight: 700, color: BRAND.faint, letterSpacing: 1, marginBottom: 4 }}>
                {fl.type === 'outbound' ? 'OUTBOUND' : 'RETURN'} · {fl.airline} {fl.flightNumber}
              </div>
              <div style={{ ...S.sans, fontSize: 13 }}>
                <strong>{fl.from}</strong> {fl.departure} → <strong>{fl.to}</strong> {fl.arrival}
                {fl.duration && <span style={{ color: '#777' }}> · {fl.duration}</span>}
                {fl.class && <span style={{ color: '#777' }}> · {fl.class}</span>}
                {fl.baggage && <span style={{ color: '#777' }}> · Baggage: {fl.baggage}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Hotels ── */}
      {hotels.length > 0 && (
        <div className="avoid-break" style={S.section}>
          <div style={S.label}>Accommodation</div>
          {hotels.map((h, i) => (
            <div key={i} style={{ borderLeft: `3px solid ${BRAND.red}`, paddingLeft: 14, marginBottom: 12 }}>
              <div style={{ ...S.sans, fontWeight: 700, fontSize: 14 }}>
                {h.name} <span style={{ color: BRAND.red }}>{'★'.repeat(Math.min(num(h.stars, 3), 5))}</span>
              </div>
              <div style={{ ...S.cellSm, marginTop: 3 }}>
                {[h.location, num(h.nights) ? `${num(h.nights)}N` : '', h.roomCategory, h.mealPlan].filter(Boolean).join(' · ')}
              </div>
              {h.address && <div style={{ ...S.sans, fontSize: 11, color: '#888', marginTop: 2 }}>{h.address}</div>}
            </div>
          ))}
        </div>
      )}

      {/* ── Itinerary ── */}
      {days.length > 0 && (
        <div style={S.section}>
          <div style={S.label}>Day-wise Itinerary · {nightsLabel(quote.nights)}</div>
          {days.map(day => (
            <div key={day.day} className="avoid-break" style={{ marginBottom: 10 }}>
              <div style={{ ...S.sans, fontWeight: 700, fontSize: 13, marginBottom: 3, color: BRAND.ink }}>
                <span style={{ color: BRAND.red }}>Day {day.day}</span>{day.title ? ` — ${day.title}` : ''}
              </div>
              {day.description && <div style={{ ...S.sans, fontSize: 12, color: '#444', lineHeight: 1.7 }}>{day.description}</div>}
            </div>
          ))}
        </div>
      )}

      {/* ── Inclusions / Exclusions ── */}
      {(md.inclusions.trim() || md.exclusions.trim()) && (
        <table width="100%" className="avoid-break" style={{ marginBottom: 24 }}>
          <tbody><tr>
            {md.inclusions.trim() && (
              <td width="50%" style={{ verticalAlign: 'top', paddingRight: 18 }}>
                <div style={{ ...S.label, color: '#2e7d32' }}>✓ Inclusions</div>
                <MD>{md.inclusions}</MD>
              </td>
            )}
            {md.exclusions.trim() && (
              <td width="50%" style={{ verticalAlign: 'top' }}>
                <div style={{ ...S.label, color: '#c62828' }}>✗ Exclusions</div>
                <MD>{md.exclusions}</MD>
              </td>
            )}
          </tr></tbody>
        </table>
      )}

      {/* ── Important notes ── */}
      {md.notes.trim() && (
        <div className="avoid-break" style={{ marginBottom: 20, background: '#fffaf9', border: `1px solid ${BRAND.redLight}`, borderLeft: `4px solid ${BRAND.red}`, borderRadius: 6, padding: '14px 18px' }}>
          <div style={S.label}>⚠ Important Notes</div>
          <MD>{md.notes}</MD>
        </div>
      )}

      {/* ── Policy / terms ── */}
      {md.terms.trim() && (
        <div className="avoid-break" style={{ marginBottom: 20, background: '#fafafa', border: `1px solid ${BRAND.line}`, borderRadius: 6, padding: '14px 18px' }}>
          <div style={{ ...S.label, color: '#4b5563' }}>§ Policy &amp; Terms</div>
          <MD>{md.terms}</MD>
        </div>
      )}

      {/* ── Footer ── */}
      <table width="100%" className="avoid-break" style={{ borderTop: `2px solid ${BRAND.red}`, marginTop: 14 }}>
        <tbody><tr>
          <td style={{ paddingTop: 12, verticalAlign: 'top' }}>
            <div style={{ ...S.sans, fontSize: 11, fontWeight: 700, color: BRAND.ink }}>{COMPANY.legal}</div>
            <div style={{ ...S.sans, fontSize: 10, color: '#888', marginTop: 2 }}>CIN: {COMPANY.cin} · GST: {COMPANY.gst}</div>
          </td>
          <td style={{ paddingTop: 12, textAlign: 'right', verticalAlign: 'top' }}>
            <div style={{ ...S.sans, fontSize: 11, fontWeight: 700, color: '#555' }}>Prepared by: {quote.agentName || 'EMV Team'}</div>
            <div style={{ ...S.sans, fontSize: 10, color: '#888', marginTop: 2 }}>
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </td>
        </tr></tbody>
      </table>
    </div>
  )
}
