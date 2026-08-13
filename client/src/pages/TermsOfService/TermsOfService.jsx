import LegalLayout, { Section, P, Ul } from '../../components/layout/LegalLayout/LegalLayout'

export default function TermsOfService() {
  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="Global Ease My Vacations (OPC) Private Limited · Effective Date: 11 May 2026"
    >
      <Section title="1. Scope" />
      <P>These Terms of Service govern the use of all Ease My Vacations digital platforms, services, APIs, and associated travel services.</P>

      <Section title="2. Eligibility" />
      <P>Users must be legally competent to enter into binding contracts under applicable law.</P>

      <Section title="3. Account Registration" />
      <P>Users may be required to create accounts to access certain services. Users are responsible for maintaining account security and confidentiality of login credentials.</P>

      <Section title="4. Prohibited Activities" />
      <P>Users shall not:</P>
      <Ul items={[
        'Use bots or automated scraping tools',
        'Attempt unauthorized access',
        'Upload malicious content',
        'Conduct fraudulent transactions',
        'Misuse promotional offers',
      ]} />

      <Section title="5. Supplier Terms" />
      <P>Travel products are provided by third-party suppliers whose terms and conditions additionally apply to your bookings.</P>

      <Section title="6. Pricing & Taxes" />
      <P>Displayed prices may include taxes and fees where applicable. Final payable amounts shall be shown clearly during checkout.</P>

      <Section title="7. Force Majeure" />
      <P>Ease My Vacations shall not be liable for delays or failures caused by circumstances beyond reasonable control including pandemics, natural disasters, war, or government actions.</P>

      <Section title="8. Service Modifications" />
      <P>Ease My Vacations reserves the right to modify or discontinue services without prior notice.</P>

      <Section title="9. Dispute Resolution" />
      <P>Users agree to attempt amicable resolution before initiating formal legal proceedings.</P>

      <Section title="10. Entire Agreement" />
      <P>These Terms, together with the Privacy Policy, Cookie Policy, and related policies, constitute the complete agreement between users and Ease My Vacations.</P>
    </LegalLayout>
  )
}
