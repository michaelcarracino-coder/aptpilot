const SECTIONS = [
  {
    num: '01',
    title: 'The Service',
    body: (
      <>
        <p>AptPilot is a concierge apartment search service. Upon payment, we will:</p>
        <ul>
          <li>Search NYC listings matching your submitted criteria</li>
          <li>Contact listing agents to inquire about availability and schedule tours</li>
          <li>Send you listings and tour confirmations via your AptPilot dashboard and email</li>
          <li>Organize your application documents so you're ready to apply for listings you select</li>
        </ul>
        <p>AptPilot acts as your search assistant. We do not guarantee any specific listing will be available, that any agent will respond, or that you will sign a lease. We do guarantee our effort and the money-back commitment described in Section 04.</p>
      </>
    ),
  },
  {
    num: '02',
    title: 'Eligibility',
    body: (
      <p>You must be at least 18 years old and have the legal capacity to enter into contracts. By using AptPilot, you represent that all information you provide — including search criteria and application documents — is accurate and truthful.</p>
    ),
  },
  {
    num: '03',
    title: 'Payment',
    body: (
      <p>The Service requires a one-time flat fee paid via Stripe at checkout. Pricing is displayed at the time of purchase. All prices are in USD. Your search begins after payment is confirmed. We do not charge broker fees or commissions — ever.</p>
    ),
  },
  {
    num: '04',
    title: 'Refund Policy',
    body: (
      <>
        <p>If AptPilot fails to schedule at least one in-person or virtual tour within 7 calendar days of your search launching — and your search criteria are reasonable (not so narrow as to make matches effectively impossible) — you are entitled to a full refund.</p>
        <p>To request a refund, email <a href="mailto:support@aptpilot.com">support@aptpilot.com</a> with your account email. We will review and process eligible refunds within 5 business days.</p>
        <p>Refunds are not available if: (a) a tour was successfully scheduled, regardless of whether you attended; (b) your criteria were unreasonably restrictive; or (c) you provided inaccurate information that prevented outreach.</p>
      </>
    ),
  },
  {
    num: '05',
    title: 'Your Responsibilities',
    body: (
      <ul>
        <li>Provide accurate search criteria and contact information</li>
        <li>Upload only documents you have the right to share</li>
        <li>Respond to tour scheduling requests in a timely manner</li>
        <li>Not use AptPilot for any unlawful purpose</li>
        <li>Keep your account credentials secure</li>
      </ul>
    ),
  },
  {
    num: '06',
    title: 'Intellectual Property',
    body: (
      <p>The AptPilot platform, design, and software are owned by AptPilot. You are granted a limited, non-transferable license to use the Service for your personal apartment search. You may not copy, reverse-engineer, or resell any part of the Service.</p>
    ),
  },
  {
    num: '07',
    title: 'Limitation of Liability',
    body: (
      <p>AptPilot is not a licensed real estate broker and does not represent landlords or building owners. We are not responsible for the condition, accuracy, or legality of any listing, or for the conduct of any agent or landlord. To the maximum extent permitted by law, AptPilot's liability to you is limited to the amount you paid for the Service.</p>
    ),
  },
  {
    num: '08',
    title: 'Disclaimer of Warranties',
    body: (
      <p>The Service is provided "as is." We make no warranty that the Service will be uninterrupted, error-free, or that any particular apartment will be secured. The NYC rental market is competitive and outcomes are not guaranteed beyond our refund commitment.</p>
    ),
  },
  {
    num: '09',
    title: 'Termination',
    body: (
      <p>We may suspend or terminate your account if you violate these Terms or engage in fraud, abuse, or misrepresentation. You may close your account at any time by contacting <a href="mailto:support@aptpilot.com">support@aptpilot.com</a>.</p>
    ),
  },
  {
    num: '10',
    title: 'Governing Law',
    body: (
      <p>These Terms are governed by the laws of the State of New York, without regard to conflict of law principles. Any disputes shall be resolved in the state or federal courts located in New York County, NY.</p>
    ),
  },
  {
    num: '11',
    title: 'Changes to These Terms',
    body: (
      <p>We may update these Terms from time to time. We will notify you of material changes via email at least 14 days before they take effect. Continued use of the Service after that date constitutes acceptance.</p>
    ),
  },
  {
    num: '12',
    title: 'Contact',
    body: (
      <p>Questions about these Terms? Email <a href="mailto:support@aptpilot.com">support@aptpilot.com</a>.</p>
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
  font-family: 'Playfair Display', serif;
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
  font-family: 'Playfair Display', serif;
  font-size: 2rem; font-weight: 700;
  color: rgba(10,191,191,0.22); line-height: 1;
  flex-shrink: 0; width: 2.5rem; padding-top: 0.1rem;
  user-select: none;
}
.legal-content { flex: 1; }
.legal-content h2 {
  font-family: 'Playfair Display', serif;
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

export default function Terms() {
  return (
    <>
      <style>{css}</style>
      <div className="legal-wrap">
        <div className="legal-hero">
          <div className="legal-hero-badge">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Legal
          </div>
          <h1>Terms of Service</h1>
          <p className="legal-hero-sub">Last updated June 22, 2026 &nbsp;·&nbsp; AptPilot, New York City</p>
        </div>

        <div className="legal-body">
          <div className="legal-intro">
            These Terms of Service ("Terms") govern your use of AptPilot ("Service"), operated by AptPilot ("we," "us"). By creating an account or making a purchase, you agree to these Terms.
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
              These Terms were last updated June 22, 2026. For questions, contact <a href="mailto:support@aptpilot.com">support@aptpilot.com</a>. See also our <a href="/privacy">Privacy Policy</a>.
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
