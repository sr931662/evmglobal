import LegalLayout, { Section, Sub, P, Ul, Highlight, Strong } from '../../components/layout/LegalLayout/LegalLayout'

export default function DataProcessingAgreement() {
  return (
    <LegalLayout
      title="Data Processing Agreement"
      subtitle="Global Ease My Vacations (OPC) Private Limited · Effective Date: 11 May 2026"
    >
      <Section title="1. Purpose" />
      <P>This Data Processing Agreement ("DPA") governs the processing of personal data by Ease My Vacations on behalf of business partners, suppliers, affiliates, and enterprise customers.</P>

      <Section title="2. Definitions" />
      <P><Strong>Controller:</Strong> The entity determining the purposes of processing personal data.</P>
      <P><Strong>Processor:</Strong> Ease My Vacations processing data on behalf of the Controller.</P>
      <P><Strong>Personal Data:</Strong> Any information relating to an identified or identifiable individual.</P>

      <Section title="3. Scope of Processing" />
      <P>Ease My Vacations may process personal data for:</P>
      <Ul items={[
        'Travel booking fulfillment', 'Customer support', 'Payment processing',
        'Fraud prevention', 'Analytics and reporting', 'Marketing services where authorized',
      ]} />

      <Section title="4. Obligations of Ease My Vacations" />
      <P>Ease My Vacations agrees to:</P>
      <Ul items={[
        'Process data only on documented instructions',
        'Maintain confidentiality obligations',
        'Implement appropriate security measures',
        'Assist controllers with data subject requests',
        'Notify relevant parties of data breaches where legally required',
      ]} />

      <Section title="5. Security Measures" />
      <P>Ease My Vacations maintains technical and organizational measures including:</P>
      <Ul items={[
        'Encryption', 'Role-based access control',
        'Secure hosting infrastructure', 'Monitoring and incident response procedures',
      ]} />

      <Section title="6. Sub-Processors" />
      <P>Ease My Vacations may engage approved sub-processors including cloud providers, payment processors, and communication service providers. Ease My Vacations remains responsible for compliance obligations of sub-processors.</P>

      <Section title="7. International Transfers" />
      <P>Cross-border data transfers shall be subject to lawful safeguards and applicable regulations including data adequacy assessments where required.</P>

      <Section title="8. Data Retention & Deletion" />
      <P>Upon termination of services, Ease My Vacations shall securely delete or return personal data unless retention is legally required by applicable regulations.</P>

      <Section title="9. Audit Rights" />
      <P>Enterprise customers may request reasonable compliance documentation relating to Ease My Vacations's data processing practices subject to confidentiality requirements.</P>

      <Section title="10. Contact for DPA Matters" />
      <Highlight>
        <Strong>Data Protection Officer</Strong><br />
        Email: <Strong>dpo@easemyvacations.in</Strong>
      </Highlight>
    </LegalLayout>
  )
}
