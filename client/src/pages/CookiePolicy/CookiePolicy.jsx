import LegalLayout, { Section, Sub, P, Ul } from '../../components/layout/LegalLayout/LegalLayout'

export default function CookiePolicy() {
  return (
    <LegalLayout
      title="Cookie Policy"
      subtitle="Ease My Vacations Global Private Limited · Effective Date: 11 May 2026"
    >
      <Section title="1. Introduction" />
      <P>This Cookie Policy explains how EMV uses cookies and similar technologies across its website, applications, and digital platforms.</P>

      <Section title="2. What Are Cookies?" />
      <P>Cookies are small text files stored on your device when you visit a website. They help websites remember preferences, improve functionality, and analyze usage patterns.</P>

      <Section title="3. Types of Cookies Used" />
      <Sub title="Essential Cookies" />
      <P>Required for platform functionality including bookings, login sessions, and fraud prevention.</P>

      <Sub title="Performance Cookies" />
      <P>Help analyze user behavior and improve website performance.</P>

      <Sub title="Functional Cookies" />
      <P>Remember user preferences such as language, currency, and region.</P>

      <Sub title="Advertising Cookies" />
      <P>Used to deliver personalized advertisements and measure campaign effectiveness.</P>

      <Sub title="Third-Party Cookies" />
      <P>Some cookies may be placed by analytics providers, advertisers, or integrated partners.</P>

      <Section title="4. How EMV Uses Cookies" />
      <P>We use cookies to:</P>
      <Ul items={[
        'Enable booking functionality',
        'Improve user experience',
        'Analyze platform performance',
        'Personalize content and offers',
        'Maintain security',
        'Measure advertising effectiveness',
      ]} />

      <Section title="5. Consent" />
      <P>By continuing to use the Platform, you consent to the use of cookies unless disabled through browser settings.</P>

      <Section title="6. Managing Cookies" />
      <P>Users may control or disable cookies through browser settings. Disabling certain cookies may affect website functionality.</P>

      <Section title="7. Third-Party Analytics" />
      <P>EMV may use third-party tools including analytics and advertising services that collect information through cookies and tracking technologies.</P>

      <Section title="8. Policy Updates" />
      <P>We may revise this Cookie Policy periodically. Updated versions will be posted on the Platform.</P>
    </LegalLayout>
  )
}
