import LegalLayout, { Section, P, Ul, Strong } from '../../components/layout/LegalLayout/LegalLayout'

export default function UserAgreement() {
  return (
    <LegalLayout
      title="User Agreement"
      subtitle="Ease My Vacations Global Private Limited · Effective Date: 11 May 2026"
    >
      <Section title="1. Acceptance of Terms" />
      <P>By accessing or using the EMV Platform, you agree to comply with this User Agreement, Privacy Policy, and all applicable laws and regulations.</P>

      <Section title="2. Services Offered" />
      <P>EMV facilitates booking and management of:</P>
      <Ul items={[
        'Flights', 'Hotels', 'Holiday packages', 'Buses and transportation',
        'Visa services', 'Travel insurance', 'Activities and experiences',
      ]} />
      <P>EMV acts as an intermediary between users and travel service providers unless otherwise specified.</P>

      <Section title="3. User Responsibilities" />
      <P>Users agree to:</P>
      <Ul items={[
        'Provide accurate information',
        'Maintain confidentiality of login credentials',
        'Use the Platform lawfully',
        'Not engage in fraudulent or abusive activities',
      ]} />

      <Section title="4. Booking & Payments" />
      <P>Bookings are subject to availability and supplier terms. Prices may change until payment confirmation is completed. Users authorize EMV to process payments through authorized payment gateways.</P>

      <Section title="5. Cancellations & Refunds" />
      <P>Refunds and cancellations are governed by airline, hotel, and supplier policies. Service fees may be non-refundable. Processing timelines depend on suppliers and banking systems.</P>

      <Section title="6. Travel Documentation" />
      <P>Users are solely responsible for:</P>
      <Ul items={[
        'Valid passports', 'Visas', 'Vaccination requirements', 'Compliance with immigration laws',
      ]} />
      <P>EMV shall not be liable for denied boarding, visa rejection, or immigration issues.</P>

      <Section title="7. Intellectual Property" />
      <P>All content, trademarks, logos, graphics, and software on the Platform are owned by or licensed to EMV and protected under applicable intellectual property laws.</P>

      <Section title="8. Limitation of Liability" />
      <P>EMV shall not be liable for:</P>
      <Ul items={[
        'Supplier failures', 'Flight delays or cancellations', 'Force majeure events',
        'Government restrictions', 'Losses arising from inaccurate user information',
      ]} />
      <P>EMV's aggregate liability shall not exceed the amount paid for the booking in dispute.</P>

      <Section title="9. Indemnification" />
      <P>Users agree to indemnify EMV against claims arising from misuse of the Platform or violation of this Agreement.</P>

      <Section title="10. Suspension & Termination" />
      <P>EMV reserves the right to suspend accounts or refuse services in cases of fraud, abuse, or policy violations.</P>

      <Section title="11. Governing Law" />
      <P>This Agreement shall be governed by the laws of India. Courts in <Strong>Gurugram, Haryana</Strong> shall have exclusive jurisdiction.</P>
    </LegalLayout>
  )
}
