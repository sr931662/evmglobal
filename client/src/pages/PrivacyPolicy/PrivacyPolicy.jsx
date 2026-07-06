import LegalLayout, { Section, Sub, P, Ul, Highlight, Strong } from '../../components/layout/LegalLayout/LegalLayout'

export default function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="Global Ease My Vacations (OPC) Private Limited · Effective Date: 11 May 2026"
    >
      <Section title="1. Introduction" />
      <P>Global Ease My Vacations (OPC) Private Limited ("EMV", "Ease My Vacations", "Company", "we", "our", or "us") values the privacy of its users and is committed to protecting personal information shared with us through our website, mobile applications, customer support channels, offices, call centers, and partner platforms ("Platform").</P>
      <P>This Privacy Policy explains how we collect, use, process, store, disclose, and protect your personal information when you access or use our travel-related services including flights, hotels, holiday packages, visa services, travel insurance, transportation bookings, and other related offerings.</P>

      <Section title="2. Applicability" />
      <P>This Privacy Policy applies to all users who:</P>
      <Ul items={[
        'Visit or use the EMV Platform',
        'Make inquiries or bookings',
        'Contact customer support',
        'Subscribe to promotional communications',
        'Participate in surveys, campaigns, or loyalty programs',
      ]} />
      <P>By using the Platform, you consent to the collection and processing of your information in accordance with this Privacy Policy.</P>

      <Section title="3. Information We Collect" />
      <Sub title="A. Personal Information" />
      <P>We may collect:</P>
      <Ul items={[
        'Full name', 'Date of birth', 'Gender', 'Nationality',
        'Passport details', 'Government-issued identification documents',
        'Email address', 'Phone number', 'Billing and payment information',
        'Travel preferences', 'Emergency contact details',
      ]} />

      <Sub title="B. Booking & Travel Information" />
      <Ul items={[
        'Flight details', 'Hotel reservations', 'Visa documentation',
        'Insurance information', 'Travel itineraries', 'Loyalty program details',
      ]} />

      <Sub title="C. Technical Information" />
      <Ul items={[
        'IP address', 'Device information', 'Browser type', 'Operating system',
        'Cookies and tracking technologies', 'App usage data', 'Location information',
      ]} />

      <Sub title="D. Communication Information" />
      <P>We may record customer support interactions including emails, chats, and calls for quality assurance and dispute resolution purposes.</P>

      <Section title="4. Purpose of Processing" />
      <P>We use your information for:</P>
      <Ul items={[
        'Processing bookings and payments',
        'Providing customer support',
        'Visa and documentation assistance',
        'Fraud prevention and security verification',
        'Sending booking confirmations and travel updates',
        'Marketing and promotional communication',
        'Improving our products and services',
        'Analytics and personalization',
        'Compliance with legal obligations',
      ]} />

      <Section title="5. Sharing of Information" />
      <P>We may share your information with:</P>
      <Ul items={[
        'Airlines',
        'Hotels and accommodation providers',
        'Visa processing agencies',
        'Insurance providers',
        'Payment gateways',
        'Technology and cloud service providers',
        'Government and regulatory authorities where legally required',
      ]} />
      <P><Strong>We do not sell your personal data to third parties.</Strong></P>

      <Section title="6. International Data Transfers" />
      <P>Your information may be processed or stored outside India where our partners or service providers operate. EMV ensures that appropriate contractual and technical safeguards are implemented for such transfers.</P>

      <Section title="7. Data Retention" />
      <P>We retain personal information only for as long as necessary for:</P>
      <Ul items={[
        'Providing services',
        'Legal and regulatory compliance',
        'Accounting and audit purposes',
        'Fraud prevention and dispute resolution',
      ]} />

      <Section title="8. Security Measures" />
      <P>We implement commercially reasonable administrative, technical, and physical safeguards including:</P>
      <Ul items={[
        'SSL encryption', 'Secure payment gateways', 'Access controls',
        'Firewall protection', 'Internal confidentiality protocols',
      ]} />
      <P>However, no online transmission or storage system can be guaranteed as completely secure.</P>

      <Section title="9. User Rights" />
      <P>Subject to applicable laws, users may request:</P>
      <Ul items={[
        'Access to personal data',
        'Correction of inaccurate information',
        'Deletion of personal information',
        'Restriction of processing',
        'Withdrawal of consent',
        'Data portability where applicable',
      ]} />
      <P>Requests may be sent to: <Strong>privacy@easemyvacations.in</Strong></P>

      <Section title="10. Marketing Communications" />
      <P>Users may opt out of promotional emails and notifications at any time using unsubscribe links or by contacting EMV support.</P>

      <Section title="11. Children's Privacy" />
      <P>Our services are not directed toward minors below 18 years unless bookings are made by parents or guardians.</P>

      <Section title="12. Cookies & Tracking" />
      <P>EMV uses cookies and similar technologies to enhance user experience, personalize services, and analyze traffic. Please review our Cookie Policy for more details.</P>

      <Section title="13. Changes to Policy" />
      <P>EMV may revise this Privacy Policy periodically. Updated versions will be posted on the Platform with revised effective dates.</P>

      <Section title="14. Contact Information" />
      <Highlight>
        <Strong>Data Protection Officer</Strong><br />
        Global Ease My Vacations (OPC) Private Limited<br />
        CIN: U79110HR2026OPC146794 · GST: 06AANCG1457H1Z1<br />
        Enkay Tower, Cyber City, Phase V, Udyog Vihar, Sector 19, Gurugram, Haryana – 122016<br />
        Email: <Strong>info@easemyvacationsglobal.com</Strong>
      </Highlight>
    </LegalLayout>
  )
}
