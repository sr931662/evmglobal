import { useState } from 'react'
import InquirySection from '../../components/home/InquirySection/InquirySection'
import { usePageMeta } from '../../hooks/usePageMeta'
import styles from './TravelInquiry.module.css'

const PAGE_URL = 'https://www.easemyvacationsglobal.com/travel-inquiry'
const OG_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=1200&h=630'

export default function TravelInquiry() {
  const [copied, setCopied] = useState(false)

  usePageMeta(
    'Travel Inquiry Form | Ease My Vacations Global',
    'Share this EMV inquiry page on social media, WhatsApp, or with partners so leads come directly into your EMV dashboard.',
    { image: OG_IMAGE, url: PAGE_URL, type: 'website' }
  )

  async function handleShare() {
    const shareData = {
      title: 'EMV Travel Inquiry Form',
      text: 'Share your travel requirement with EMV and get a personalised itinerary.',
      url: PAGE_URL,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        return
      }
    } catch (err) {
      if (err?.name === 'AbortError') return
    }

    try {
      await navigator.clipboard.writeText(PAGE_URL)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2400)
    } catch {}
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.kicker}>Shareable Lead Page</span>
          <h1 className={styles.title}>One simple link for social media, WhatsApp, partner referrals, and direct lead capture.</h1>
          <p className={styles.copy}>
            Every submission on this page goes straight into your existing leads dashboard automatically, so the team
            does not need to import those external leads manually.
          </p>
          <div className={styles.actions}>
            <button type="button" onClick={handleShare} className={styles.shareBtn}>
              {copied ? 'Link Copied' : 'Share / Copy Link'}
            </button>
            <a href={PAGE_URL} className={styles.linkPill}>{PAGE_URL}</a>
          </div>
        </div>
      </section>

      <InquirySection
        eyebrow="Direct Lead Capture"
        heading={<>Collect travel leads from<br />any channel.</>}
        description="Use this dedicated page in Instagram bio, ad creatives, WhatsApp outreach, or partner referrals. The submitted trip brief appears automatically in the same EMV leads dashboard."
        formTitle="Share Your Travel Plan"
        formSub="Ideal for social media, referral, and campaign traffic."
        successTitle="Lead Captured Successfully!"
        successMessage="Thanks for sharing your requirement. The EMV team will receive this lead directly in the dashboard and follow up shortly."
        submitLabel="Submit Travel Requirement"
        defaultSource="Shared Lead Page"
        showSourceField={false}
      />
    </main>
  )
}
