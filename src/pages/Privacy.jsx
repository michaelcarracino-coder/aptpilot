const SECTIONS = [
  {
    num: '01',
    title: 'Information We Collect',
    body: (
      <>
        <p>We collect information you provide directly when you create an account or submit a search:</p>
        <ul>
          <li>Name and email address</li>
          <li>Apartment search criteria (budget, neighborhoods, move-in date, bedroom count)</li>
          <li>Rental application documents you upload (pay stubs, tax returns, bank statements, ID)</li>
          <li>Preferred tour availability windows</li>
        </ul>
        <p>We also collect limited technical data automatically: IP address, browser type, pages visited, and the referring URL. We use cookies only for session authentication.</p>
      </>
    ),
  },
  {
    num: '02',
    title: 'How We Use Your Information',
    body: (
      <>
        <ul>
          <li>To perform your apartment search — contacting listing agents, scheduling tours, and submitting applications on your behalf</li>
          <li>To send you transactional emails (tour confirmations, agent outreach updates, application status)</li>
          <li>To process your payment via Stripe</li>
          <li>To improve our service and detect abuse</li>
        </ul>
        <p>We do not sell your personal information. We do not use your data for advertising.</p>
      </>
    ),
  },
  {
    num: '03',
    title: 'Document Storage',
    body: (
      <p>Documents you upload are stored in a private Supabase Storage bucket. Access is restricted to your account only. Documents are used solely to complete rental applications you authorize and are never shared with third parties beyond the agents and landlords involved in your specific search.</p>
    ),
  },
  {
    num: '04',
    title: 'Third-Party Services',
    body: (
      <>
        <p>We use the following third-party providers, each with their own privacy policies:</p>
        <ul>
          <li><strong>Supabase</strong> — database and file storage</li>
          <li><strong>Stripe</strong> — payment processing (we never store your card details)</li>
          <li><strong>Resend</strong> — transactional email delivery</li>
          <li><strong>Twilio</strong> — SMS outreach to listing agents</li>
          <li><strong>Vercel</strong> — hosting and serverless functions</li>
        </ul>
      </>
    ),
  },
  {
    num: '05',
    title: 'Data Retention',
    body: (
      <p>We retain your account data and uploaded documents for as long as your account is active. You may request deletion at any time by emailing <a href="mailto:support@aptpilot.com">support@aptpilot.com</a>. We will delete your data within 30 days of a verified request.</p>
    ),
  },
  {
    num: '06',
    title: 'Security',
    body: (
      <p>All data is encrypted in transit (TLS 1.2+) and at rest. We use row-level security policies in our database to ensure users can only access their own records. Stripe handles all payment data under PCI DSS compliance.</p>
    ),
  },
  {
    num: '07',
    title: 'Your Rights',
    body: (
      <p>You have the right to access, correct, or delete your personal data at any time. To exercise any of these rights, contact us at <a href="mailto:support@aptpilot.com">support@aptpilot.com</a>.</p>
    ),
  },
  {
    num: '08',
    title: 'Changes to This Policy',
    body: (
      <p>We may update this policy from time to time. We will notify you of material changes via email. Continued use of AptPilot after a change constitutes acceptance of the updated policy.</p>
    ),
  },
  {
    num: '09',
    title: 'Contact',
    body: (
      <p>Questions about this policy? Email us at <a href="mailto:support@aptpilot.com">support@aptpilot.com</a>.</p>
    ),
  },
]

const css = `
.legal-wrap { background: var(--surface); min-height: 100vh; }
.legal-hero {
  background: var(--navy);
  padding: 7rem 2rem 4rem;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.legal-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 60% 60% at 50% -10%, rgba(10,191,191,0.18) 0%, transparent 70%);
  pointer-events: none;
}
.legal-hero-badge {
  display: inline-flex; align-items: center; gap: 0.4rem;
  background: rgba(10,191,191,0.12); border: 1px solid rgba(10,191,191,0.25);
  color: #0ABFBF; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em;
  text-transform: uppercase; padding: 0.35rem 0.9rem; border-radius: 100px;
  margin-bottom: 1.25rem;
}
.legal-hero h1 {
  font-family: 'Inter', sans-serif;
  font-size: clamp(2.2rem, 5vw, 3.2rem);
  color: #fff; margin-bottom: 0.75rem; line-height: 1.15;
}
.legal-hero-sub { font-size: 0.9rem; color: rgba(255,255,255,0.45); }
.legal-body { max-width: 760px; margin: 0 auto; padding: 3.5rem 1.5rem 6rem; }
.legal-intro {
  background: #fff; border-radius: 14px; padding: 1.5rem 1.75rem;
  border-left: 3px solid var(--teal); box-shadow: var(--shadow);
  font-size: 0.93rem; color: var(--slate); line-height: 1.8;
  margin-bottom: 2.5rem;
}
.legal-section {
  display: flex; gap: 1.5rem;
  padding: 2rem 0;
  border-bottom: 1px solid var(--surface-mid);
}
.legal-section:last-of-type { border-bottom: none; }
.legal-num {
  font-family: 'Inter', sans-serif;
  font-size: 2rem; font-weight: 700;
  color: rgba(10,191,191,0.22); line-height: 1;
  flex-shrink: 0; width: 2.5rem; padding-top: 0.1rem;
  user-select: none;
}
.legal-content { flex: 1; }
.legal-content h2 {
  font-family: 'Inter', sans-serif;
  font-size: 1.15rem; color: var(--navy);
  margin-bottom: 0.75rem;
}
.legal-content p, .legal-content li {
  font-size: 0.9rem; color: var(--slate); line-height: 1.85;
}
.legal-content p + p { margin-top: 0.6rem; }
.legal-content ul { padding-left: 1.2rem; margin: 0.5rem 0; }
.legal-content li { margin-bottom: 0.3rem; }
.legal-content a { color: var(--teal); text-decoration: none; }
.legal-content a:hover { text-decoration: underline; }
.legal-content strong { color: var(--navy); font-weight: 600; }
.legal-footer-note {
  background: var(--navy); color: rgba(255,255,255,0.45);
  border-radius: 14px; padding: 1.25rem 1.5rem;
  font-size: 0.8rem; line-height: 1.7; margin-top: 2.5rem;
  display: flex; gap: 0.75rem; align-items: flex-start;
}
.legal-footer-note a { color: #0ABFBF; }
@media(max-width:540px){
  .legal-section { flex-direction: column; gap: 0.4rem; }
  .legal-num { font-size: 0.9rem; width: auto; }
}
`

export default function Privacy() {
  return (
    <>
      <style>{css}</style>
      <div className="legal-wrap">
        <div className="legal-hero">
          <div className="legal-hero-badge">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Legal
          </div>
          <h1>Privacy Policy</h1>
          <p className="legal-hero-sub">Last updated June 22, 2026 &nbsp;·&nbsp; AptPilot, New York City</p>
        </div>

        <div className="legal-body">
          <div className="legal-intro">
            AptPilot ("we," "us," or "our") operates aptpilot.vercel.app. This policy explains what information we collect, how we use it, and your rights regarding that information.
          </div>

          {SECTIONS.map(s => (
            <div className="legal-section" key={s.num}>
              <div className="legal-num">{s.num}</div>
              <div className="legal-content">
                <h2>{s.title}</h2>
                {s.body}
              </div>
            </div>
          ))}

          <div className="legal-footer-note">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0ABFBF" strokeWidth="2" style={{flexShrink:0,marginTop:1}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>
              This policy applies to all AptPilot users. For questions, contact <a href="mailto:support@aptpilot.com">support@aptpilot.com</a>. See also our <a href="/terms">Terms of Service</a>.
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
