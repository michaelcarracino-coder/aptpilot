const css = `
.legal-page { max-width: 740px; margin: 0 auto; padding: 7rem 1.5rem 5rem; }
.legal-page h1 { font-family: 'Playfair Display', serif; font-size: 2.4rem; color: var(--navy); margin-bottom: 0.4rem; }
.legal-page .updated { font-size: 0.83rem; color: var(--slate); margin-bottom: 2.5rem; }
.legal-page h2 { font-family: 'Playfair Display', serif; font-size: 1.2rem; color: var(--navy); margin: 2rem 0 0.6rem; }
.legal-page p, .legal-page li { font-size: 0.93rem; color: var(--slate); line-height: 1.8; }
.legal-page ul { padding-left: 1.4rem; margin: 0.5rem 0; }
.legal-page a { color: var(--teal); }
`

export default function Privacy() {
  return (
    <>
      <style>{css}</style>
      <div className="legal-page">
        <h1>Privacy Policy</h1>
        <p className="updated">Last updated: June 22, 2026</p>

        <p>AptPilot ("we," "us," or "our") operates aptpilot.vercel.app. This policy explains what information we collect, how we use it, and your rights regarding that information.</p>

        <h2>1. Information We Collect</h2>
        <p>We collect information you provide directly when you create an account or submit a search:</p>
        <ul>
          <li>Name and email address</li>
          <li>Apartment search criteria (budget, neighborhoods, move-in date, bedroom count)</li>
          <li>Rental application documents you upload (pay stubs, tax returns, bank statements, ID)</li>
          <li>Preferred tour availability windows</li>
        </ul>
        <p>We also collect limited technical data automatically: IP address, browser type, pages visited, and the referring URL. We use cookies only for session authentication.</p>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To perform your apartment search — contacting listing agents, scheduling tours, and submitting applications on your behalf</li>
          <li>To send you transactional emails (tour confirmations, agent outreach updates, application status)</li>
          <li>To process your payment via Stripe</li>
          <li>To improve our service and detect abuse</li>
        </ul>
        <p>We do not sell your personal information. We do not use your data for advertising.</p>

        <h2>3. Document Storage</h2>
        <p>Documents you upload are stored in a private Supabase Storage bucket. Access is restricted to your account only. Documents are used solely to complete rental applications you authorize and are never shared with third parties beyond the agents and landlords involved in your specific search.</p>

        <h2>4. Third-Party Services</h2>
        <p>We use the following third-party providers, each with their own privacy policies:</p>
        <ul>
          <li><strong>Supabase</strong> — database and file storage</li>
          <li><strong>Stripe</strong> — payment processing (we never store your card details)</li>
          <li><strong>Resend</strong> — transactional email delivery</li>
          <li><strong>Twilio</strong> — SMS outreach to listing agents</li>
          <li><strong>Vercel</strong> — hosting and serverless functions</li>
        </ul>

        <h2>5. Data Retention</h2>
        <p>We retain your account data and uploaded documents for as long as your account is active. You may request deletion at any time by emailing <a href="mailto:support@aptpilot.com">support@aptpilot.com</a>. We will delete your data within 30 days of a verified request.</p>

        <h2>6. Security</h2>
        <p>All data is encrypted in transit (TLS 1.2+) and at rest. We use row-level security policies in our database to ensure users can only access their own records. Stripe handles all payment data under PCI DSS compliance.</p>

        <h2>7. Your Rights</h2>
        <p>You have the right to access, correct, or delete your personal data at any time. To exercise any of these rights, contact us at <a href="mailto:support@aptpilot.com">support@aptpilot.com</a>.</p>

        <h2>8. Changes to This Policy</h2>
        <p>We may update this policy from time to time. We will notify you of material changes via email. Continued use of AptPilot after a change constitutes acceptance of the updated policy.</p>

        <h2>9. Contact</h2>
        <p>Questions about this policy? Email us at <a href="mailto:support@aptpilot.com">support@aptpilot.com</a>.</p>
      </div>
    </>
  )
}
