import LegalLayout, { Section, Sub, P, Ul, Highlight, Strong } from '../../components/layout/LegalLayout/LegalLayout'

export default function CancellationPolicy() {
  return (
    <LegalLayout
      title="Cancellation & Refund Policy"
      subtitle="Global Ease My Vacations (OPC) Private Limited · Effective Date: 11 May 2026"
    >
      <Section title="1. Introduction" />
      <P>At Ease My Vacations, we strive to provide exceptional travel services and customer satisfaction. This Cancellation &amp; Refund Policy outlines the terms and conditions governing cancellations, amendments, and refunds for bookings made through our website, mobile platforms, customer support channels, or authorized representatives.</P>
      <P>By making a booking with Ease My Vacations, you acknowledge and agree to the terms stated in this policy.</P>

      <Section title="2. Booking Cancellation by Customer" />
      <P>All cancellation requests must be submitted in writing via email to our customer support team at: <Strong>info@easemyvacationsglobal.com</Strong></P>
      <P>A cancellation request shall be considered effective only upon receipt and written acknowledgment from Ease My Vacations.</P>
      <P>Cancellation charges may vary depending on the type of service booked, supplier policies, airline rules, hotel terms, visa processing status, and package inclusions.</P>

      <Sub title="Holiday Packages" />
      <div style={{ overflowX: 'auto', margin: '1rem 0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: 'var(--color-brand, #e07b39)', color: '#fff' }}>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600 }}>Cancellation Period</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600 }}>Cancellation Charges</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['More than 45 days before departure', '10% of total booking value or Rs. 5,000/- (whichever is higher)'],
              ['31–45 days before departure',         '25% of total booking value'],
              ['15–30 days before departure',         '50% of total booking value'],
              ['Less than 15 days before departure',  '100% of total booking value'],
            ].map(([period, charge], i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.03)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <td style={{ padding: '0.7rem 1rem' }}>{period}</td>
                <td style={{ padding: '0.7rem 1rem', fontWeight: 500 }}>{charge}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <P>Certain promotional, discounted, special event, festival, group departure, and non-refundable packages may attract higher cancellation charges.</P>

      <Section title="3. Flight Ticket Cancellation" />
      <P>Air ticket cancellations are governed by the respective airline's cancellation and refund policies. In addition to airline-imposed charges, Ease My Vacations may charge a service fee for processing cancellations.</P>
      <P>Refund eligibility shall depend upon:</P>
      <Ul items={[
        'Fare type booked',
        'Airline rules',
        'Timing of cancellation',
        'No-show status',
        'Promotional or discounted fares',
      ]} />
      <P>Non-refundable airline tickets will not qualify for refunds except where permitted by the airline.</P>

      <Section title="4. Hotel Booking Cancellation" />
      <P>Hotel cancellation charges shall be governed by the respective hotel's cancellation policy communicated at the time of booking.</P>
      <P>Certain hotel reservations, promotional rates, peak-season bookings, and special offers may be fully non-refundable.</P>

      <Section title="5. Visa Services" />
      <P>Visa processing fees, embassy fees, service charges, courier charges, and documentation fees are strictly non-refundable once the application process has commenced.</P>
      <P>Visa approval or rejection is solely at the discretion of the concerned embassy, consulate, or immigration authority. Ease My Vacations acts only as a facilitator and cannot guarantee visa approval.</P>

      <Section title="6. Travel Insurance" />
      <P>Travel insurance premiums are subject to the insurer's cancellation and refund policy. Once an insurance policy has been issued, refunds may not be available.</P>

      <Section title="7. No-Show Policy" />
      <P>No refunds shall be provided in cases where:</P>
      <Ul items={[
        'The traveler fails to arrive for the scheduled departure',
        'The traveler misses flights, transfers, tours, or hotel check-ins',
        'Required travel documents are not available at the time of travel',
        'Entry is denied by immigration or government authorities',
      ]} />

      <Section title="8. Refund Processing" />
      <P>Eligible refunds shall be processed only after receiving the refund amount from airlines, hotels, transport providers, destination management companies, or other suppliers, wherever applicable.</P>

      <Sub title="Refund Timeline" />
      <Ul items={[
        'Domestic Services: 7–15 business days',
        'International Services: 15–45 business days',
        'Credit Card Refunds: Subject to issuing bank processing timelines',
        'UPI / Bank Transfer Refunds: Subject to banking network timelines',
      ]} />
      <P>Refunds shall be credited through the original mode of payment wherever feasible.</P>

      <Section title="9. Non-Refundable Charges" />
      <P>The following charges are non-refundable under all circumstances:</P>
      <Ul items={[
        'Convenience fees',
        'Service charges',
        'Processing fees',
        'Payment gateway charges',
        'Taxes already remitted to statutory authorities',
        'Third-party supplier charges',
      ]} />
      <P>Where applicable, payment gateway charges may be deducted from the refundable amount.</P>

      <Section title="10. Cancellation by Ease My Vacations" />
      <P>Ease My Vacations reserves the right to cancel any booking due to:</P>
      <Ul items={[
        'Operational constraints',
        'Supplier non-availability',
        'Government regulations',
        'Safety concerns',
        'Fraudulent transactions',
        'Pricing errors',
        'Force majeure events',
      ]} />
      <P>In such cases, customers shall be entitled to an alternative arrangement or refund as determined by the applicable supplier policies.</P>

      <Section title="11. Force Majeure" />
      <P>Ease My Vacations shall not be held liable for cancellations, delays, interruptions, or inability to provide services arising from circumstances beyond reasonable control, including but not limited to:</P>
      <Ul items={[
        'Natural disasters, floods, earthquakes',
        'Pandemics or health emergencies',
        'Government restrictions or political unrest',
        'Terrorism or war',
        'Airline strikes or weather disruptions',
      ]} />
      <P>Any refund in such circumstances shall be subject to recoveries received from suppliers and service providers.</P>

      <Section title="12. Fraud Prevention and Chargebacks" />
      <P>Ease My Vacations reserves the right to investigate and reject refund claims arising from suspected fraudulent transactions, misuse of payment instruments, chargeback abuse, or violations of company policies.</P>
      <P>Customers are encouraged to contact our support team before initiating chargebacks with banks or payment providers.</P>

      <Section title="13. Contact Information" />
      <Highlight>
        <Strong>Global Ease My Vacations (OPC) Private Limited</Strong><br />
        Brand: Ease My Vacations<br /><br />
        Email: <Strong>info@easemyvacationsglobal.com</Strong><br />
        Phone: <Strong>+91-7070595907</Strong><br />
        Website: <Strong>www.easemyvacationsglobal.com</Strong><br /><br />
        For cancellation, refund, or booking-related assistance, please contact us through the above channels during business hours.
      </Highlight>
    </LegalLayout>
  )
}
