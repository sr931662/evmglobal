import LegalLayout, { Section, Sub, P, Ul, Highlight, Strong } from '../../components/layout/LegalLayout/LegalLayout'

export default function CancellationPolicy() {
  return (
    <LegalLayout
      title="Cancellation, Refund & Chargeback Policy"
      subtitle="Global Ease My Vacations (OPC) Private Limited · Effective Date: 21 June 2025"
    >
      <Section title="1. Purpose" />
      <P>This Cancellation, Refund &amp; Chargeback Policy governs all travel-related bookings, reservations, and services purchased through Ease My Vacations. By making a booking, the customer acknowledges and agrees to the terms outlined herein.</P>
      <P>This policy applies to:</P>
      <Ul items={[
        'Domestic and International Holiday Packages',
        'Flight Reservations',
        'Hotel Reservations',
        'Visa Assistance Services',
        'Travel Insurance',
        'Transfers and Sightseeing',
        'Cruises',
        'Corporate Travel Services',
        'Any other travel-related products offered by Ease My Vacations',
      ]} />

      <Section title="2. Booking Confirmation" />
      <P>A booking shall be considered confirmed only upon:</P>
      <Ul items={[
        'Successful receipt of payment;',
        'Issuance of a booking confirmation, invoice, or voucher by Ease My Vacations;',
        'Availability confirmation from relevant suppliers.',
      ]} />
      <P>Ease My Vacations reserves the right to decline or cancel any booking prior to confirmation and refund the amount received, if applicable.</P>

      <Section title="3. Advance Payment and Booking Deposit" />
      <P>Certain bookings may require an advance payment, token amount, or booking deposit to secure reservations.</P>
      <P>Unless otherwise stated in writing:</P>
      <Ul items={[
        'Booking deposits and advance payments may be non-refundable.',
        'The applicable cancellation charges shall be calculated on the total booking value and not merely on the advance amount paid.',
        'Confirmation of services remains subject to receipt of the required advance or full payment as communicated by Ease My Vacations.',
      ]} />

      <Section title="4. Customer Cancellation Requests" />
      <P>All cancellation requests must be submitted in writing via email to:</P>
      <Highlight>
        <Strong>Email: info@easemyvacationsglobal.com</Strong>
      </Highlight>
      <P>The date and time of receipt of the cancellation request by Ease My Vacations shall determine the applicable cancellation charges.</P>
      <P>Verbal requests made over phone calls, messaging applications, or social media channels shall not be treated as valid cancellation requests unless confirmed in writing by the Company.</P>

      <Section title="5. Holiday Package Cancellation Charges" />
      <P>Unless otherwise specified in writing, the following cancellation charges shall apply:</P>
      <div style={{ overflowX: 'auto', margin: '1rem 0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: 'var(--brand)', color: '#fff' }}>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600 }}>Days Before Departure</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600 }}>Cancellation Charge</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['More than 45 Days',  '10% of Total Package Cost'],
              ['31–45 Days',         '25% of Total Package Cost'],
              ['15–30 Days',         '50% of Total Package Cost'],
              ['8–14 Days',          '75% of Total Package Cost'],
              ['0–7 Days',           '100% of Total Package Cost'],
              ['No Show',            '100% of Total Package Cost'],
            ].map(([period, charge], i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.03)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <td style={{ padding: '0.7rem 1rem' }}>{period}</td>
                <td style={{ padding: '0.7rem 1rem', fontWeight: 500 }}>{charge}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <P>Special departures, group tours, charter services, cruises, peak-season bookings, event-based departures, and promotional offers may have separate cancellation terms which shall supersede the above schedule.</P>

      <Section title="6. Flight Ticket Cancellations" />
      <P>Flight ticket cancellations are governed by the fare rules and cancellation policies of the respective airline. The refund amount, if any, shall be subject to:</P>
      <Ul items={[
        'Airline cancellation charges',
        'Airline service fees',
        'Fare restrictions',
        'No-show conditions',
        'Applicable taxes refundable by the airline',
      ]} />
      <P>Ease My Vacations may levy additional service and processing charges for handling cancellation requests. Certain promotional and low-cost carrier fares may be wholly non-refundable.</P>

      <Section title="7. Hotel Booking Cancellations" />
      <P>Hotel booking cancellations shall be governed by the cancellation policy of the respective hotel, resort, villa, apartment, or accommodation provider. Customers acknowledge that:</P>
      <Ul items={[
        'Certain hotel rates are non-refundable;',
        'Peak season and event-period bookings may have stricter cancellation policies;',
        'Refund approval remains subject to supplier confirmation.',
      ]} />

      <Section title="8. Visa Services" />
      <P>Visa assistance fees, consultation fees, service charges, documentation fees, courier charges, and embassy fees are strictly non-refundable once processing has commenced.</P>
      <P>Visa issuance remains solely at the discretion of the relevant embassy, consulate, or immigration authority. Ease My Vacations acts only as a facilitator and does not guarantee visa approval, processing timelines, or immigration clearance.</P>

      <Section title="9. Travel Insurance" />
      <P>Travel insurance products are governed by the terms and conditions of the issuing insurer. Refund requests, where permissible, shall be processed strictly in accordance with the insurer's cancellation and refund policies.</P>

      <Section title="10. Amendments and Rescheduling" />
      <P>Requests for date changes, name corrections, destination changes, hotel modifications, and itinerary revisions shall be subject to:</P>
      <Ul items={[
        'Supplier approval',
        'Availability',
        'Fare differences',
        'Additional taxes',
        'Applicable amendment fees',
      ]} />
      <P>Ease My Vacations does not guarantee approval of amendment requests.</P>

      <Section title="11. Customer Travel Documentation Responsibility" />
      <P>The customer is solely responsible for obtaining and carrying all required travel documentation, including but not limited to:</P>
      <Ul items={[
        'Valid Passport',
        'Visa',
        'Identity Proof',
        'Travel Permits',
        'Vaccination Certificates',
        'Foreign Exchange Documents',
        'Travel Insurance Documents',
      ]} />
      <P>Ease My Vacations shall not be liable for losses, cancellations, denied boarding, denied entry, delays, or additional expenses arising from incomplete, incorrect, expired, or invalid documentation. No refund shall be payable in such cases.</P>

      <Section title="12. No-Show Policy" />
      <P>No refunds shall be payable where a traveler:</P>
      <Ul items={[
        'Fails to report for departure',
        'Misses a flight, train, bus, cruise, transfer, or sightseeing activity',
        'Fails to check into accommodation',
        'Is denied boarding by an airline',
        'Is denied entry by immigration authorities',
        'Lacks valid travel documentation',
      ]} />
      <P>Such cases shall be treated as a No-Show and may attract cancellation charges up to 100% of the booking value.</P>

      <Section title="13. Refund Processing" />
      <P>Approved refunds shall be processed only after receipt of the refundable amount from the concerned supplier, airline, hotel, destination management company, insurer, transporter, or service provider, wherever applicable.</P>

      <Sub title="Standard Refund Timelines" />
      <div style={{ overflowX: 'auto', margin: '1rem 0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: 'var(--brand)', color: '#fff' }}>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600 }}>Service Type</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600 }}>Estimated Processing Time</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Domestic Bookings',            '7–15 Business Days'],
              ['International Bookings',        '15–45 Business Days'],
              ['Airline Refunds',               'Subject to Airline Processing'],
              ['Credit/Debit Card Refunds',     'Subject to Issuing Bank Timelines'],
              ['UPI and Bank Transfer Refunds', 'Subject to Banking Network Timelines'],
            ].map(([type, time], i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.03)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <td style={{ padding: '0.7rem 1rem' }}>{type}</td>
                <td style={{ padding: '0.7rem 1rem', fontWeight: 500 }}>{time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <P>These timelines are indicative and may vary depending on supplier and banking procedures.</P>

      <Section title="14. Refund Method" />
      <P>Refunds shall ordinarily be processed through the original payment method used for the booking.</P>
      <P>Where refunding through the original payment method is not feasible due to technical, regulatory, or banking constraints, Ease My Vacations may request alternative bank account details from the customer and process the refund accordingly after verification.</P>

      <Section title="15. Duplicate Payments" />
      <P>In the event that a customer makes a duplicate payment due to technical error, payment gateway malfunction, network interruption, or banking issues, the excess amount received shall be refunded after verification. Refunds for duplicate transactions shall generally be processed within 7–15 business days.</P>

      <Section title="16. Non-Refundable Charges" />
      <P>Unless mandated by applicable law, the following charges shall not be refunded:</P>
      <Ul items={[
        'Convenience Fees',
        'Service Charges',
        'Consultation Charges',
        'Visa Service Fees',
        'Documentation Charges',
        'Payment Gateway Charges',
        'Processing Charges',
        'Bank Charges',
        'Foreign Exchange Conversion Charges',
        'Courier Charges',
        'Taxes already remitted to statutory authorities',
      ]} />

      <Section title="17. Promotional Offers and Discounted Bookings" />
      <P>Bookings made under Flash Sales, Festival Promotions, Group Deals, Early Bird Offers, Last-Minute Deals, or Limited-Time Campaigns may be wholly or partially non-refundable, as specified at the time of booking.</P>

      <Section title="18. Supplier Dependency" />
      <P>Ease My Vacations acts as an intermediary between customers and third-party suppliers, including airlines, hotels, transport providers, cruise operators, insurers, embassies, and destination management companies.</P>
      <P>Refunds remain subject to supplier policies and approval. Ease My Vacations shall not be responsible for supplier insolvency, operational disruptions, or refusal to provide refunds.</P>

      <Section title="19. Pricing Errors and Technical Glitches" />
      <P>Despite reasonable efforts to ensure accuracy, errors may occasionally occur due to technical glitches, system malfunctions, human errors, supplier pricing discrepancies, or currency conversion issues.</P>
      <P>Ease My Vacations reserves the right to cancel bookings resulting from such errors. In such cases, customers shall be entitled to a full refund of the amount actually paid, and no additional compensation or liability shall arise against the Company.</P>

      <Section title="20. Fraud Prevention and Chargebacks" />
      <P>Customers agree to contact Ease My Vacations before initiating any chargeback, payment dispute, or payment reversal request through their bank, card issuer, or payment service provider.</P>
      <P>Ease My Vacations reserves the right to:</P>
      <Ul items={[
        'Contest fraudulent or unjustified chargebacks',
        'Recover losses, penalties, and associated costs',
        'Suspend future bookings',
        'Take legal action where necessary',
      ]} />
      <P>Fraudulent transactions or abuse of payment systems may be reported to relevant authorities.</P>

      <Section title="21. Force Majeure" />
      <P>Ease My Vacations shall not be liable for any cancellation, delay, interruption, alteration, or inability to provide services due to circumstances beyond its reasonable control, including:</P>
      <Ul items={[
        'Natural Disasters, Floods, Earthquakes, Cyclones',
        'Pandemics or Epidemics',
        'Government Restrictions or Political Unrest',
        'Civil Disturbances, War, or Terrorist Activities',
        'Airline Strikes, Weather Disruptions, or Transportation Interruptions',
      ]} />
      <P>Any refund in such situations shall be subject to recoveries obtained from suppliers.</P>

      <Section title="22. Company-Initiated Cancellation" />
      <P>Ease My Vacations reserves the right to cancel any booking due to:</P>
      <Ul items={[
        'Operational constraints',
        'Supplier non-availability',
        'Regulatory requirements',
        'Safety concerns',
        'Suspected fraudulent activity',
        'Pricing errors',
        'Technical issues',
      ]} />
      <P>Where applicable, customers shall receive an alternative arrangement or refund, subject to supplier policies and applicable laws.</P>

      <Section title="23. Dispute Resolution and Governing Law" />
      <P>This Policy shall be governed and interpreted in accordance with the laws of India. Any dispute arising from bookings, payments, cancellations, refunds, or services shall be subject to the exclusive jurisdiction of the competent courts located in <Strong>Gurugram, Haryana, India</Strong>.</P>

      <Section title="24. Grievance Redressal" />
      <P>For any concerns relating to cancellations, refunds, payments, or services, customers may contact:</P>
      <Highlight>
        <Strong>Customer Support</Strong><br />
        Email: <Strong>info@easemyvacationsglobal.com</Strong><br />
        Phone: <Strong>+91-7070595907</Strong><br /><br />
        <Strong>Grievance Officer</Strong><br />
        Name: GAO<br />
        Email: <Strong>grievances@easemyvacationsglobal.com</Strong><br /><br />
        The Company shall endeavor to acknowledge and respond to grievances within 7 business days from receipt.
      </Highlight>

      <Section title="25. Policy Updates" />
      <P>Global Ease My Vacations (OPC) Private Limited reserves the right to amend, modify, update, or replace this Policy at any time without prior notice. The latest version published on the Company's website shall supersede all previous versions and shall become effective immediately upon publication.</P>

      <Highlight>
        <Strong>Global Ease My Vacations (OPC) Private Limited</Strong><br />
        Ease My Vacations<br /><br />
        By making a booking, the customer confirms that they have read, understood, and agreed to this Cancellation, Refund &amp; Chargeback Policy.
      </Highlight>
    </LegalLayout>
  )
}
