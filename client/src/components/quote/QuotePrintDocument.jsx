import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  BRAND, COMPANY, LOGO_URL,
  computeQuote, quoteMarkdown, hotelGroups, fmt, num, nightsLabel, durationLabel,
  cityStays, CHILD_AGE_RANGE, formatDate,
} from '../../utils/quote'

/* Inline styles only — this tree is serialised to a standalone print document,
   so nothing but the stylesheet in utils/quote.js travels with it. */
const S = {
  page:      { fontFamily: 'Georgia, serif', color: BRAND.ink, background: '#fff', maxWidth: 860, margin: '0 auto', padding: '28px 32px' },
  sans:      { fontFamily: 'Arial, Helvetica, sans-serif' },
  label:     { fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 20, fontWeight: 700, letterSpacing: 3, color: BRAND.red, marginBottom: 12, textTransform: 'uppercase' },
  section:   { marginBottom: 24 },
  cellSm:    { fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 12, color: '#555', lineHeight: 1.6 },
  // Layout tables must not re-flow their columns around content length
  layout:    { width: '100%', tableLayout: 'fixed' },
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
  const stayOpts = hotelGroups(quote)
  const days     = (quote.itinerary || []).filter(d => d.title || d.description || d.note || d.image)

  const stays     = cityStays(quote)
  const departure = formatDate(quote.startDate)
  const validity  = formatDate(quote.validUntil)

  const recordedAges = (quote.childrenAges || []).filter(a => Number.isFinite(a) && a >= 0)
  const childAgesLabel = recordedAges.length ? `, ages ${recordedAges.join(', ')}` : ''

  const priceRow = (label, meta, amount, key) => (
    <tr key={key} style={{ borderBottom: `1px solid ${BRAND.line}` }}>
      <td style={{ ...S.sans, fontSize: 13, padding: '9px 0', verticalAlign: 'top' }}>
        {label}
        {meta && <div style={{ color: BRAND.faint, fontSize: 11, marginTop: 2 }}>{meta}</div>}
      </td>
      <td style={{ ...S.sans, fontSize: 13, fontWeight: 700, textAlign: 'right', padding: '9px 0', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
        {cur} {fmt(amount)}
      </td>
    </tr>
  )

  return (
    <div id="quote-print" style={S.page}>

      {/* ── Letterhead: logo + company name (left) · quote number (right) ── */}
      {/* The rule and its spacing live on the cells — padding on a <table> is
          dropped once border-collapse applies. */}
      <table className="avoid-break" style={{ ...S.layout, marginBottom: 24 }}>
        <tbody><tr>
          <td style={{ verticalAlign: 'bottom', paddingBottom: 16, borderBottom: `3px solid ${BRAND.red}` }}>
            <table style={{ tableLayout: 'auto' }}><tbody><tr>
              <td style={{ verticalAlign: 'middle', paddingRight: 12, width: 56 }}>
                <img src={LOGO_URL} alt="Ease My Vacations" width="56" height="56" style={{ display: 'block', width: 56, height: 56, objectFit: 'contain' }} />
              </td>
              <td style={{ verticalAlign: 'middle' }}>
                <div style={{ ...S.sans, fontSize: 20, fontWeight: 900, letterSpacing: 0.5, color: BRAND.ink }}>{COMPANY.name}</div>
                <div style={{ ...S.sans, fontSize: 9, fontWeight: 700, letterSpacing: 2, color: BRAND.red, marginTop: 3, textTransform: 'uppercase' }}>{COMPANY.tagline}</div>
              </td>
            </tr></tbody></table>
          </td>
          <td style={{ textAlign: 'right', verticalAlign: 'bottom', paddingBottom: 16, borderBottom: `3px solid ${BRAND.red}` }}>
            <div style={{ ...S.sans, fontSize: 10, fontWeight: 700, letterSpacing: 3, color: BRAND.faint }}>QUOTE NO.</div>
            <div style={{ ...S.sans, fontSize: 20, fontWeight: 900, color: BRAND.red, marginTop: 2 }}>{quote.refNumber || 'DRAFT'}</div>
            {validity && <div style={{ ...S.sans, fontSize: 11, color: '#666', marginTop: 3 }}>Valid until: <strong>{validity}</strong></div>}
            {quote.status && <div style={{ ...S.sans, fontSize: 11, color: '#666' }}>Status: {quote.status}</div>}
          </td>
        </tr></tbody>
      </table>

      {/* ── Client + trip ── */}
      <table className="avoid-break" style={{ ...S.layout, marginBottom: 24 }}>
        <tbody><tr>
          <td width="50%" style={{ verticalAlign: 'top', paddingRight: 16 }}>
            <div style={S.label}>Prepared for</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{quote.clientName}</div>
            {quote.clientPhone && <div style={{ ...S.cellSm, marginTop: 4 }}>{quote.clientPhone}</div>}
            {quote.clientEmail && <div style={S.cellSm}>{quote.clientEmail}</div>}
          </td>
          {/* Trip details sit on the right rail, aligned with the quote number above */}
          <td width="50%" style={{ verticalAlign: 'top', textAlign: 'right' }}>
            <div style={S.label}>Trip details</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{quote.tripTitle}</div>
            {quote.tripType && <div style={{ ...S.cellSm, marginTop: 4 }}>{quote.tripType}</div>}

            {/* Each city with the nights spent there, listed one per line so
                the client can see how the trip is actually split up. */}
            {stays.length > 0 && (
              <div style={{ marginTop: 4 }}>
                {stays.map(stay => (
                  <div key={stay.city} style={S.cellSm}>
                    {stay.city}
                    {stay.nights > 0 && (
                      <span style={{ color: BRAND.faint }}> &mdash; {stay.nights} Night{stay.nights === 1 ? '' : 's'}</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div style={{ ...S.cellSm, marginTop: 4 }}>
              <strong>Duration:</strong> {durationLabel(quote.nights)} ({nightsLabel(quote.nights)})
            </div>
            <div style={S.cellSm}>
              <strong>Travellers:</strong> {calc.adults} Adult{calc.adults === 1 ? '' : 's'}
              {calc.children > 0 && ` + ${calc.children} Child${calc.children === 1 ? '' : 'ren'} (${CHILD_AGE_RANGE}${childAgesLabel})`}
            </div>
            {departure && <div style={S.cellSm}><strong>Departure:</strong> {departure}</div>}
          </td>
        </tr></tbody>
      </table>

      {/* ── Pricing ── */}
      <div className="avoid-break" style={S.section}>
        <div style={S.label}>Price Breakdown</div>
        <table style={S.layout}>
          {/* Fixed columns keep every amount in one right-aligned rail */}
          <colgroup>
            <col style={{ width: '68%' }} />
            <col style={{ width: '32%' }} />
          </colgroup>
          <tbody>
            {calc.adults > 0 && calc.perAdult > 0 &&
              priceRow(`Adult${calc.adults === 1 ? '' : 's'}`, `${calc.adults} × ${cur} ${fmt(calc.perAdult)} per person`, calc.adultTotal, 'ad')}
            {calc.children > 0 && calc.perChild > 0 &&
              priceRow(
                `Child${calc.children === 1 ? '' : 'ren'}`,
                `${calc.children} × ${cur} ${fmt(calc.perChild)} per child · ${CHILD_AGE_RANGE}`,
                calc.childTotal,
                'ch'
              )}
            {calc.extraItems.filter(i => i.description).map((item, i) =>
              priceRow(item.description, null, item.amount, `x${i}`))}

            <tr style={{ borderBottom: `1px solid ${BRAND.line}` }}>
              <td style={{ ...S.sans, fontSize: 13, fontWeight: 700, padding: '9px 0' }}>Subtotal</td>
              <td style={{ ...S.sans, fontSize: 13, fontWeight: 700, textAlign: 'right', padding: '9px 0', whiteSpace: 'nowrap' }}>{cur} {fmt(calc.subtotal)}</td>
            </tr>

            {calc.taxes.map((t, i) => (
              <tr key={`t${i}`} style={{ borderBottom: `1px solid ${BRAND.line}` }}>
                <td style={{ ...S.sans, fontSize: 12, color: '#777', padding: '7px 0' }}>{t.name} @ {t.percent}%</td>
                <td style={{ ...S.sans, fontSize: 12, color: '#777', textAlign: 'right', padding: '7px 0', whiteSpace: 'nowrap' }}>{cur} {fmt(t.amount)}</td>
              </tr>
            ))}

            {/* Everything above, then the discount */}
            {calc.discount.amount > 0 && (
              <tr style={{ borderBottom: `1px solid ${BRAND.line}` }}>
                <td style={{ ...S.sans, fontSize: 13, fontWeight: 700, color: '#15803d', padding: '9px 0' }}>
                  {calc.discount.label}
                  {calc.discount.type === 'percent' && (
                    <span style={{ fontWeight: 400, color: '#777' }}> ({calc.discount.value}% off)</span>
                  )}
                </td>
                <td style={{ ...S.sans, fontSize: 13, fontWeight: 700, color: '#15803d', textAlign: 'right', padding: '9px 0', whiteSpace: 'nowrap' }}>
                  − {cur} {fmt(calc.discount.amount)}
                </td>
              </tr>
            )}

            {/* Highlight band spans the table edge-to-edge so the label and the
                amount stay on the same rails as the rows above. */}
            <tr style={{ background: BRAND.redLight }}>
              <td style={{ ...S.sans, fontSize: 15, fontWeight: 900, padding: '12px 0', verticalAlign: 'middle' }}>
                TOTAL PAYABLE
                <span style={{ fontSize: 11, fontWeight: 400, color: '#777' }}> ({calc.pax} Pax, incl. taxes)</span>
              </td>
              <td style={{ ...S.sans, fontSize: 16, fontWeight: 900, textAlign: 'right', padding: '12px 0', color: BRAND.red, verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
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
              {/* Leg header: direction left, airline right */}
              <table style={{ ...S.layout, marginBottom: 6 }}>
                <tbody><tr>
                  <td style={{ ...S.sans, fontSize: 11, fontWeight: 700, color: BRAND.faint, letterSpacing: 1 }}>
                    {fl.type === 'outbound' ? 'OUTBOUND' : 'RETURN'}
                  </td>
                  <td style={{ ...S.sans, fontSize: 11, fontWeight: 700, color: '#555', textAlign: 'right' }}>
                    {[fl.airline, fl.flightNumber].filter(Boolean).join(' ')}
                  </td>
                </tr></tbody>
              </table>
              {/* Departure · duration · arrival on three fixed rails */}
              <table style={S.layout}>
                <colgroup>
                  <col style={{ width: '37%' }} />
                  <col style={{ width: '26%' }} />
                  <col style={{ width: '37%' }} />
                </colgroup>
                <tbody><tr>
                  <td style={{ ...S.sans, verticalAlign: 'top' }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{fl.departure}</div>
                    <div style={{ fontSize: 12, color: '#555' }}>{fl.from}</div>
                  </td>
                  <td style={{ ...S.sans, verticalAlign: 'top', textAlign: 'center', color: '#777' }}>
                    <div style={{ fontSize: 11 }}>{fl.duration}</div>
                    <div style={{ fontSize: 12, color: BRAND.red, lineHeight: 1 }}>✈</div>
                  </td>
                  <td style={{ ...S.sans, verticalAlign: 'top', textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{fl.arrival}</div>
                    <div style={{ fontSize: 12, color: '#555' }}>{fl.to}</div>
                  </td>
                </tr></tbody>
              </table>
              {(fl.class || fl.baggage) && (
                <div style={{ ...S.sans, fontSize: 11, color: '#888', marginTop: 6 }}>
                  {[fl.class, fl.baggage && `Baggage: ${fl.baggage}`].filter(Boolean).join(' · ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Accommodation — one block per hotel option/category ── */}
      {stayOpts.length > 0 && (
        <div style={S.section}>
          <div style={S.label}>Accommodation</div>
          {stayOpts.map((opt, oi) => {
            const heading = [opt.label, opt.category].filter(Boolean).join(' · ')
            const supp = opt.supplementPerAdult > 0 || opt.supplementPerChild > 0
            return (
              <div key={oi} className="avoid-break" style={{ marginBottom: stayOpts.length > 1 ? 16 : 8 }}>
                {heading && (
                  <table style={{ ...S.layout, background: '#fafafa', marginBottom: 8 }}>
                    <tbody><tr>
                      <td style={{ ...S.sans, fontSize: 11, fontWeight: 900, letterSpacing: 1, color: BRAND.red, padding: '6px 10px', textTransform: 'uppercase' }}>
                        {heading}
                      </td>
                      <td style={{ ...S.sans, fontSize: 11, color: '#777', textAlign: 'right', padding: '6px 10px', whiteSpace: 'nowrap' }}>
                        {supp
                          ? `Upgrade: +${cur} ${fmt(opt.supplementPerAdult)} per adult`
                          : oi === 0 ? 'Included in quoted price' : ''}
                      </td>
                    </tr></tbody>
                  </table>
                )}
                {opt.hotels.map((h, i) => (
                  <div key={i} style={{ borderLeft: `3px solid ${BRAND.red}`, paddingLeft: 14, marginBottom: 10 }}>
                    <table style={S.layout}>
                      <tbody><tr>
                        <td style={{ ...S.sans, fontWeight: 700, fontSize: 14, verticalAlign: 'top' }}>
                          {h.name} <span style={{ color: BRAND.red }}>{'★'.repeat(Math.min(num(h.stars, 3), 5))}</span>
                        </td>
                        <td style={{ ...S.sans, fontSize: 12, color: '#555', textAlign: 'right', verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                          {num(h.nights) ? `${num(h.nights)} Night${num(h.nights) === 1 ? '' : 's'}` : ''}
                        </td>
                      </tr></tbody>
                    </table>
                    <div style={{ ...S.cellSm, marginTop: 3 }}>
                      {[h.location, h.roomCategory, h.mealPlan].filter(Boolean).join(' · ')}
                    </div>
                    {h.address && <div style={{ ...S.sans, fontSize: 11, color: '#888', marginTop: 2 }}>{h.address}</div>}
                  </div>
                ))}
              </div>
            )
          })}
          {stayOpts.length > 1 && (
            <div style={{ ...S.sans, fontSize: 11, color: '#888', marginTop: 2 }}>
              Same itinerary throughout — only the hotel category changes between options.
            </div>
          )}
        </div>
      )}

      {/* ── Itinerary ── */}
      {days.length > 0 && (
        <div className="avoid-break" style={{ ...S.section, marginTop: 28 }}>
          {/* Solid banner (not just a small label) so it's unmistakable where
              the day-wise plan starts, distinct from the Accommodation block above. */}
          <div style={{
            ...S.sans, background: BRAND.red, color: '#fff', borderRadius: 4,
            padding: '12px 16px', marginBottom: 16, fontSize: 24, fontWeight: 900,
            letterSpacing: 2, textTransform: 'uppercase',
          }}>
            ✈ Day-wise Itinerary · {nightsLabel(quote.nights)}
          </div>
          {/* Day labels share one rail; each day is ruled off from the next so a
              long description never runs into the following day. */}
          <table style={S.layout}>
            <colgroup>
              <col style={{ width: 72 }} />
              <col />
            </colgroup>
            <tbody>
              {days.map((day, i) => {
                const cell = {
                  verticalAlign: 'top',
                  paddingTop: i === 0 ? 0 : 16,
                  paddingBottom: 16,
                  borderTop: i === 0 ? 'none' : `1px solid ${BRAND.line}`,
                }
                return (
                  <tr key={day.day} className="avoid-break">
                    <td style={{ ...cell, paddingRight: 12 }}>
                      <div style={{
                        ...S.sans, fontSize: 10, fontWeight: 900, letterSpacing: 1, color: '#fff',
                        background: BRAND.red, borderRadius: 3, padding: '4px 0', textAlign: 'center',
                      }}>
                        DAY {day.day}
                      </div>
                    </td>
                    <td style={cell}>
                      {/* Title first — the reader needs to know what the day is
                          before they look at the picture of it. */}
                      {day.title && (
                        <div style={{ ...S.sans, fontWeight: 700, fontSize: 13, color: BRAND.ink, marginBottom: 6 }}>
                          {day.title}
                        </div>
                      )}
                      {day.image && (
                        <img
                          src={day.image}
                          alt={day.title || `Day ${day.day}`}
                          style={{ display: 'block', width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 4, marginBottom: 6 }}
                        />
                      )}
                      {day.description && (
                        /* pre-line keeps the line breaks the agent typed */
                        <div style={{ ...S.sans, fontSize: 12, color: '#444', lineHeight: 1.75, whiteSpace: 'pre-line' }}>
                          {day.description}
                        </div>
                      )}
                      {day.note && (
                        <div style={{ ...S.sans, fontSize: 11, color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 4, padding: '6px 10px', marginTop: 6, lineHeight: 1.6 }}>
                          <strong>Note:</strong> {day.note}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Inclusions / Exclusions ── */}
      {(md.inclusions.trim() || md.exclusions.trim()) && (
        <table className="avoid-break" style={{ ...S.layout, marginBottom: 24 }}>
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
      <table className="avoid-break" style={{ ...S.layout, marginTop: 14 }}>
        <tbody><tr>
          <td style={{ paddingTop: 12, verticalAlign: 'top', borderTop: `2px solid ${BRAND.red}` }}>
            <div style={{ ...S.sans, fontSize: 11, fontWeight: 700, color: BRAND.ink }}>{COMPANY.legal}</div>
            <div style={{ ...S.sans, fontSize: 10, color: '#888', marginTop: 2 }}>CIN: {COMPANY.cin} · GST: {COMPANY.gst}</div>
          </td>
          <td style={{ paddingTop: 12, textAlign: 'right', verticalAlign: 'top', borderTop: `2px solid ${BRAND.red}` }}>
            <div style={{ ...S.sans, fontSize: 11, fontWeight: 700, color: '#555' }}>Prepared by: {quote.agentName || 'Ease My Vacations Team'}</div>
            <div style={{ ...S.sans, fontSize: 10, color: '#888', marginTop: 2 }}>
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </td>
        </tr></tbody>
      </table>
    </div>
  )
}
