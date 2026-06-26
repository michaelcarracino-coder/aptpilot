const css = `
.legal-page { max-width: 740px; margin: 0 auto; padding: 7rem 1.5rem 5rem; }
.legal-page h1 { font-family: 'Playfair Display', serif; font-size: 2.4rem; color: var(--navy); margin-bottom: 0.4rem; }
.legal-page .updated { font-size: 0.83rem; color: var(--slate); margin-bottom: 2.5rem; }
.legal-page h2 { font-family: 'Playfair Display', serif; font-size: 1.2rem; color: var(--navy); margin: 2rem 0 0.6rem; }
.legal-page p, .legal-page li { font-size: 0.93rem; color: var(--slate); line-height: 1.8; }
.legal-page ul { padding-left: 1.4rem; margin: 0.5rem 0; }
.legal-page a { color: var(--teal); }
`

export default function Terms() {
  return (
    <>
      <style>{css}</style>
      <div className="legal-page">
        <h1>Terms of Service</h1>
        <p className="updated">Last updated: June 22, 2026</p>

        <p>These Terms of Service ("Terms") govern your use of AptPilot ("Service"), operated by AptPilot ("we," "us"). By creating an account or making a purchase, you agree to these Terms.</p>

        <h2>1. The Service</h2>
        <p>AptPilot is a concierge apartment search service. Upon payment, we will:</p>
        <ul>
          <li>Search NYC listings matching your submitted criteria</li>
          <li>Contact listing agents to inquire about availability and schedule tours</li>
          <li>Send you listings and tour confirmations via your AptPilot dashboard and email</li>
          <li>Organize your application documents so you're ready to apply for listings you select</li>
        </ul>
        <p>AptPilot acts as your search assistant. We do not guarantee any specific listing will be available, that any agent will respond, or that you will sign a lease. We do guarantee our effort and the money-back commitment described in Section 4.</p>

        <h2>2. Eligibility</h2>
        <p>You must be at least 18 years old and have the legal capacity to enter into contracts. By using AptPilot, you represent that all information you provide — including search criteria and application documents — is accurate and truthful.</p>

        <h2>3. Payment</h2>
        <p>The Service requires a one-time flat fee paid via Stripe at checkout. Pricing is displayed at the time of purchase. All prices are in USD. Your search begins after payment is confirmed. We do not charge broker fees or commissions — ever.</p>

        <h2>4. Refund Policy</h2>
        <p>If AptPilot fails to schedule at least one in-person or virtual tour within 7 calendar days of your search launching — and your search criteria are reasonable (not so narrow as to make matches effectively impossible) — you are entitled to a full refund.</p>
        <p>To request a refund, email <a href="mailto:support@aptpilot.com">support@aptpilot.com</a> with your account email. We will review and process eligible refunds within 5 business days.</p>
        <p>Refunds are not available if: (a) a tour was successfully scheduled, regardless of whether you attended; (b) your criteria were unreasonably restrictive; or (c) you provided inaccurate information that prevented outreach.</p>

        <h2>5. Your Responsibilities</h2>
        <ul>
          <li>Provide accurate search criteria and contact information</li>
          <li>Upload only documents you have the right to share</li>
          <li>Respond to tour scheduling requests in a timely manner</li>
          <li>Not use AptPilot for any unlawful purpose</li>
          <li>Keep your account credentials secure</li>
        </ul>

        <h2>6. Intellectual Property</h2>
        <p>The AptPilot platform, design, and software are owned by AptPilot. You are granted a limited, non-transferable license to use the Service for your personal apartment search. You may not copy, reverse-engineer, or resell any part of the Service.</p>

        <h2>7. Limitation of Liability</h2>
        <p>AptPilot is not a licensed real estate broker and does not represent landlords or building owners. We are not responsible for the condition, accuracy, or legality of any listing, or for the conduct of any agent or landlord. To the maximum extent permitted by law, AptPilot's liability to you is limited to the amount you paid for the Service.</p>

        <h2>8. Disclaimer of Warranties</h2>
        <p>The Service is provided "as is." We make no warranty that the Service will be uninterrupted, error-free, or that any particular apartment will be secured. The NYC rental market is competitive and outcomes are not guaranteed beyond our refund commitment.</p>

        <h2>9. Termination</h2>
        <p>We may suspend or terminate your account if you violate these Terms or engage in fraud, abuse, or misrepresentation. You may close your account at any time by contacting <a href="mailto:support@aptpilot.com">support@aptpilot.com</a>.</p>

        <h2>10. Governing Law</h2>
        <p>These Terms are governed by the laws of the State of New York, without regard to conflict of law principles. Any disputes shall be resolved in the state or federal courts located in New York County, NY.</p>

        <h2>11. Changes to These Terms</h2>
        <p>We may update these Terms from time to time. We will notify you of material changes via email at least 14 days before they take effect. Continued use of the Service after that date constitutes acceptance.</p>

        <h2>12. Contact</h2>
        <p>Questions about these Terms? Email <a href="mailto:support@aptpilot.com">support@aptpilot.com</a>.</p>
      </div>
    </>
  )
}
