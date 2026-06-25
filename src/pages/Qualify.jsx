import SEO from '../components/SEO'

const css = `
.qualify-page { max-width: 860px; margin: 0 auto; padding: 5rem 1.5rem 6rem; }
.qualify-hero { margin-bottom: 3.5rem; }
.qualify-hero h1 { font-family: 'Playfair Display', serif; font-size: 2.8rem; color: var(--navy); line-height: 1.15; margin-bottom: 0.75rem; }
.qualify-hero .lead { font-size: 1.05rem; color: var(--slate); line-height: 1.75; max-width: 640px; }
.qualify-toc { background: #f8fafb; border: 1px solid #e5eaef; border-radius: 12px; padding: 1.25rem 1.5rem; margin-bottom: 3rem; }
.qualify-toc p { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--slate); font-weight: 600; margin-bottom: 0.6rem; }
.qualify-toc ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px; }
.qualify-toc li a { font-size: 0.9rem; color: var(--teal); text-decoration: none; font-weight: 500; }
.qualify-toc li a:hover { text-decoration: underline; }

.q-section { margin-bottom: 3.5rem; scroll-margin-top: 88px; }
.q-section h2 { font-family: 'Playfair Display', serif; font-size: 1.75rem; color: var(--navy); margin-bottom: 1rem; padding-bottom: 0.6rem; border-bottom: 2px solid var(--teal); display: inline-block; }
.q-section p { font-size: 0.94rem; color: var(--slate); line-height: 1.8; margin-bottom: 0.9rem; }
.q-section ul, .q-section ol { padding-left: 1.4rem; margin: 0.5rem 0 0.9rem; }
.q-section li { font-size: 0.94rem; color: var(--slate); line-height: 1.8; margin-bottom: 0.3rem; }
.q-section strong { color: var(--navy); font-weight: 600; }
.q-section a { color: var(--teal); }

.stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin: 1.5rem 0; }
.stat-card { background: #fff; border: 1px solid #e5eaef; border-radius: 12px; padding: 1.25rem; text-align: center; }
.stat-card .num { font-family: 'Playfair Display', serif; font-size: 2rem; color: var(--teal); font-weight: 700; line-height: 1; margin-bottom: 4px; }
.stat-card .lbl { font-size: 0.82rem; color: var(--slate); line-height: 1.4; }

.callout { border-left: 4px solid var(--teal); background: #f0fafa; border-radius: 0 10px 10px 0; padding: 1rem 1.25rem; margin: 1.25rem 0; }
.callout p { margin: 0; font-size: 0.91rem; color: #1a3a3a; line-height: 1.7; }
.callout strong { color: var(--navy); }

.warn-callout { border-left: 4px solid #f59e0b; background: #fffbeb; border-radius: 0 10px 10px 0; padding: 1rem 1.25rem; margin: 1.25rem 0; }
.warn-callout p { margin: 0; font-size: 0.91rem; color: #5c4000; line-height: 1.7; }

.doc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1.25rem 0; }
@media(max-width:560px){ .doc-grid { grid-template-columns: 1fr; } .stat-grid { grid-template-columns: 1fr 1fr; } }
.doc-card { background: #fff; border: 1px solid #e5eaef; border-radius: 10px; padding: 1rem 1.1rem; }
.doc-card h4 { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.07em; color: var(--teal); font-weight: 700; margin-bottom: 0.6rem; }
.doc-card ul { padding-left: 1.1rem; margin: 0; }
.doc-card li { font-size: 0.88rem; color: var(--slate); line-height: 1.7; }

.compare-table { width: 100%; border-collapse: collapse; margin: 1.25rem 0; font-size: 0.88rem; }
.compare-table th { background: var(--navy); color: #fff; padding: 10px 14px; text-align: left; font-weight: 600; }
.compare-table th:first-child { border-radius: 8px 0 0 0; }
.compare-table th:last-child { border-radius: 0 8px 0 0; }
.compare-table td { padding: 9px 14px; border-bottom: 1px solid #e5eaef; color: var(--slate); }
.compare-table tr:last-child td { border-bottom: none; }
.compare-table tr:nth-child(even) td { background: #f8fafb; }

.guarantee-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1.25rem 0; }
.g-card { background: #fff; border: 1px solid #e5eaef; border-radius: 10px; padding: 1rem 1.1rem; }
.g-card h4 { font-size: 0.9rem; font-weight: 700; color: var(--navy); margin-bottom: 4px; }
.g-card .g-type { font-size: 0.78rem; color: var(--teal); font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.5rem; }
.g-card p { font-size: 0.85rem; color: var(--slate); line-height: 1.6; margin: 0; }

.timeline { display: flex; flex-direction: column; gap: 0; margin: 1.25rem 0; }
.tl-row { display: flex; gap: 16px; }
.tl-line { display: flex; flex-direction: column; align-items: center; }
.tl-dot { width: 12px; height: 12px; border-radius: 50%; background: var(--teal); flex-shrink: 0; margin-top: 4px; }
.tl-bar { width: 2px; background: #d1e8e8; flex: 1; min-height: 28px; }
.tl-row:last-child .tl-bar { display: none; }
.tl-content { padding-bottom: 20px; }
.tl-content strong { font-size: 0.9rem; color: var(--navy); display: block; margin-bottom: 2px; }
.tl-content span { font-size: 0.85rem; color: var(--slate); line-height: 1.6; }

.apt-cta { background: linear-gradient(135deg, #0C1628 0%, #0a2a3a 100%); border-radius: 16px; padding: 2.5rem; text-align: center; margin-top: 4rem; }
.apt-cta h3 { font-family: 'Playfair Display', serif; font-size: 1.7rem; color: #fff; margin-bottom: 0.6rem; }
.apt-cta p { font-size: 0.94rem; color: rgba(255,255,255,0.7); margin-bottom: 1.5rem; }
.apt-cta a { display: inline-block; background: var(--teal); color: #0C1628; font-weight: 700; font-size: 0.95rem; padding: 0.75rem 2rem; border-radius: 100px; text-decoration: none; }
`

export default function Qualify() {
  return (
    <>
      <SEO
        title="How to Qualify for a NYC Rental Apartment | AptPilot"
        description="Everything you need to know about qualifying for a rental apartment in New York City — income requirements, credit scores, documents, guarantors, and more."
      />
      <style>{css}</style>
      <div className="qualify-page">

        <div className="qualify-hero">
          <h1>Qualifying for a Rental<br />Apartment in NYC</h1>
          <p className="lead">
            New York City has some of the strictest rental qualification standards in the country. Landlords and management companies use a consistent set of financial benchmarks to evaluate applicants — knowing them before you start your search puts you ahead of the competition.
          </p>
        </div>

        <div className="qualify-toc">
          <p>On this page</p>
          <ul>
            <li><a href="#income">Income requirements (the 40x rule)</a></li>
            <li><a href="#credit">Credit score standards</a></li>
            <li><a href="#employment">Employment & self-employment</a></li>
            <li><a href="#documents">Documents you'll need</a></li>
            <li><a href="#guarantors">Guarantors & co-signers</a></li>
            <li><a href="#guarantor-programs">Institutional guarantor programs</a></li>
            <li><a href="#groups">Applying as a group</a></li>
            <li><a href="#timeline">The application timeline</a></li>
            <li><a href="#tips">Tips to strengthen your application</a></li>
          </ul>
        </div>

        {/* ── Income ── */}
        <div className="q-section" id="income">
          <h2>Income Requirements</h2>
          <p>
            The most universally applied rule in NYC rentals is the <strong>40x rent rule</strong>: your gross annual income must be at least 40 times the monthly rent. This is a hard cutoff at most buildings, not a suggestion.
          </p>

          <div className="stat-grid">
            <div className="stat-card">
              <div className="num">40x</div>
              <div className="lbl">Monthly rent × 40 = minimum annual income</div>
            </div>
            <div className="stat-card">
              <div className="num">$3,500</div>
              <div className="lbl">Rent requires $140,000/yr income minimum</div>
            </div>
            <div className="stat-card">
              <div className="num">$5,000</div>
              <div className="lbl">Rent requires $200,000/yr income minimum</div>
            </div>
          </div>

          <p>
            For group applications (roommates), most landlords <strong>combine all applicants' incomes</strong> to meet the 40x threshold. So two tenants each earning $80,000/yr ($160,000 combined) can qualify for a $4,000/month apartment.
          </p>

          <div className="callout">
            <p><strong>Tip:</strong> Always calculate against gross income (pre-tax), not take-home. If your W-2 says $120,000, that's what landlords use — not the $85,000 that hits your bank account.</p>
          </div>

          <p>
            Some luxury buildings and private landlords apply a stricter <strong>50x rule</strong>, especially for higher-priced units. It's worth confirming with the listing agent before applying.
          </p>
        </div>

        {/* ── Credit ── */}
        <div className="q-section" id="credit">
          <h2>Credit Score Standards</h2>
          <p>
            Most NYC landlords pull a full credit report as part of the application. There's no single citywide minimum, but the practical thresholds look like this:
          </p>

          <table className="compare-table">
            <thead>
              <tr><th>Credit score</th><th>Typical outcome</th></tr>
            </thead>
            <tbody>
              <tr><td>750+</td><td>Strong approval — the gold standard for competitive buildings</td></tr>
              <tr><td>700–749</td><td>Generally approved with solid income and clean history</td></tr>
              <tr><td>650–699</td><td>May be approved with solid income and a clean rental history</td></tr>
              <tr><td>620–649</td><td>Difficult — guarantor often required, or additional deposit</td></tr>
              <tr><td>Below 620</td><td>Most institutional landlords will decline; private landlords vary</td></tr>
            </tbody>
          </table>

          <p>
            Beyond the number, landlords look at the <strong>full credit report</strong>: any history of evictions, collections, or late payments will be scrutinized regardless of your score. A single eviction on record is disqualifying at most buildings.
          </p>

          <div className="warn-callout">
            <p><strong>Note:</strong> Each application typically triggers a hard inquiry on your credit. If you're applying at multiple apartments, try to cluster applications within a 14-day window — credit bureaus treat multiple inquiries in that window as a single event.</p>
          </div>
        </div>

        {/* ── Employment ── */}
        <div className="q-section" id="employment">
          <h2>Employment & Self-Employment</h2>
          <p>
            Landlords want to see stable, verifiable income. The verification method depends on how you earn:
          </p>

          <p><strong>Salaried employees</strong> have the easiest time — two recent pay stubs, a W-2, and an employer verification letter is typically all that's needed. Landlords want to see you've been employed for at least 6–12 months.</p>

          <p><strong>Self-employed applicants</strong> face higher scrutiny. Expect to provide two years of tax returns (personal and business), recent bank statements showing consistent deposits, and sometimes a CPA letter attesting to your income. Some buildings require 1–2 years of self-employment history before they'll consider an application.</p>

          <p><strong>Freelancers and contractors</strong> fall in between — 1099 forms, client contracts, and 3–6 months of bank statements showing regular income are the standard package.</p>

          <p><strong>Students and recent graduates</strong> rarely qualify on income alone and almost always need a guarantor. The same applies to applicants relocating from out of state who haven't yet started their new job — an offer letter helps but many landlords won't accept it in lieu of pay stubs.</p>

          <div className="callout">
            <p><strong>Starting a new job?</strong> Bring the offer letter showing your salary and start date. Some landlords will approve based on it; others require your first pay stub. It never hurts to ask the agent before applying.</p>
          </div>
        </div>

        {/* ── Documents ── */}
        <div className="q-section" id="documents">
          <h2>Documents You'll Need</h2>
          <p>
            Competitive NYC apartments move fast — often same-day. Having your full document package ready to submit instantly is a genuine competitive advantage.
          </p>

          <div className="doc-grid">
            <div className="doc-card">
              <h4>Identity</h4>
              <ul>
                <li>Government-issued photo ID (passport, driver's license, or state ID)</li>
              </ul>
            </div>
            <div className="doc-card">
              <h4>Income verification</h4>
              <ul>
                <li>2 most recent pay stubs</li>
                <li>Most recent W-2 or 1099</li>
                <li>Offer letter (if newly employed)</li>
                <li>2 years of tax returns (self-employed)</li>
              </ul>
            </div>
            <div className="doc-card">
              <h4>Bank statements</h4>
              <ul>
                <li>2–3 most recent months of checking/savings statements</li>
                <li>Investment/brokerage statements (if using assets to qualify)</li>
              </ul>
            </div>
            <div className="doc-card">
              <h4>Employment verification</h4>
              <ul>
                <li>Employer verification letter on company letterhead</li>
                <li>HR contact or employment portal access</li>
              </ul>
            </div>
            <div className="doc-card">
              <h4>Reference letters</h4>
              <ul>
                <li>Letter from current landlord (if renting)</li>
                <li>Personal reference letter (some buildings require)</li>
              </ul>
            </div>
            <div className="doc-card">
              <h4>Application forms</h4>
              <ul>
                <li>Completed building application (varies by landlord)</li>
                <li>Application fee ($20–$100 typical)</li>
                <li>First month + security deposit ready to wire</li>
              </ul>
            </div>
          </div>

          <p>
            AptPilot organizes all of these into a single collated PDF you can submit in seconds. <a href="/intake">Upload your documents once</a> and we handle the rest.
          </p>
        </div>

        {/* ── Guarantors ── */}
        <div className="q-section" id="guarantors">
          <h2>Guarantors & Co-Signers</h2>
          <p>
            If you don't meet the income or credit requirements on your own, a <strong>guarantor</strong> (also called a co-signer) agrees to be financially responsible for the lease if you fail to pay. This is extremely common in NYC — especially for students, recent graduates, and anyone relocating from out of state.
          </p>

          <p><strong>Who can be a guarantor?</strong> Any creditworthy individual — a parent, relative, or close friend. Most landlords require guarantors to:</p>
          <ul>
            <li>Be a US citizen or permanent resident</li>
            <li>Earn at least <strong>80x the monthly rent</strong> annually (double the standard for tenants)</li>
            <li>Have a credit score of 700+ (some buildings require 750+)</li>
            <li>Provide their own complete financial document package</li>
          </ul>

          <div className="warn-callout">
            <p><strong>Important:</strong> The 80x rule is not universal — some landlords accept 60x for guarantors, others require 100x. Always confirm the building's specific requirement with the listing agent.</p>
          </div>

          <p>
            Guarantors take on real legal liability. If you stop paying rent, the landlord can pursue the guarantor for the full remaining balance of the lease. Make sure whoever is co-signing fully understands what they're agreeing to.
          </p>
        </div>

        {/* ── Guarantor programs ── */}
        <div className="q-section" id="guarantor-programs">
          <h2>Institutional Guarantor Programs</h2>
          <p>
            If you don't have a personal guarantor who meets the financial requirements, several companies offer <strong>institutional guaranty services</strong> — they co-sign your lease for a fee, typically a percentage of annual rent paid upfront.
          </p>

          <div className="guarantee-grid">
            <div className="g-card">
              <div className="g-type">Most widely accepted</div>
              <h4>Insurent</h4>
              <p>Accepted at thousands of NYC buildings. Fee is roughly 70–90% of one month's rent for US applicants; more for international. Strong track record since 2008.</p>
            </div>
            <div className="g-card">
              <div className="g-type">Widely accepted</div>
              <h4>The Guarantors</h4>
              <p>Works with both individual renters and larger portfolios. Often accepted at newer luxury buildings. Fee varies by applicant profile.</p>
            </div>
            <div className="g-card">
              <div className="g-type">International friendly</div>
              <h4>Rhino</h4>
              <p>Insurance-based deposit replacement product. Primarily replaces the security deposit rather than acting as a lease co-signer — best for reducing upfront cash.</p>
            </div>
            <div className="g-card">
              <div className="g-type">Newer entrant</div>
              <h4>Leap Easy</h4>
              <p>Focuses on renters who don't meet income requirements. Accepts a wider range of income types including freelance and international income.</p>
            </div>
          </div>

          <div className="callout">
            <p><strong>Heads up:</strong> Not all landlords accept every institutional guarantor. Confirm which programs a specific building accepts <em>before</em> paying any fee. Some buildings only accept Insurent; others accept all of the above.</p>
          </div>
        </div>

        {/* ── Groups ── */}
        <div className="q-section" id="groups">
          <h2>Applying as a Group</h2>
          <p>
            Group applications — roommates applying together for one unit — are very common in NYC. Here's how the qualification math changes:
          </p>

          <ul>
            <li><strong>Combined income:</strong> All applicants' gross incomes are added together to meet the 40x threshold. This makes it significantly easier to qualify for larger or pricier units.</li>
            <li><strong>Weakest link matters:</strong> Each applicant is individually evaluated for credit and rental history. One person with a low score or prior eviction can sink the entire application.</li>
            <li><strong>Guarantors per person:</strong> If one roommate needs a guarantor, that guarantor is added to the lease and must meet the 80x requirement based on that roommate's share of the rent — not the total rent.</li>
            <li><strong>Everyone signs the lease:</strong> All tenants are jointly and severally liable — each person is on the hook for the full rent, not just their share.</li>
          </ul>

          <div className="callout">
            <p><strong>AptPilot group search:</strong> When one person pays for AptPilot, the whole group gets access. Invite your roommates and guarantors to upload their documents directly — our system tracks everyone's status and packages all documents together automatically.</p>
          </div>
        </div>

        {/* ── Timeline ── */}
        <div className="q-section" id="timeline">
          <h2>The Application Timeline</h2>
          <p>
            NYC apartments rent fast — especially in spring and summer. Understanding the typical timeline helps you avoid losing units while you're still gathering paperwork.
          </p>

          <div className="timeline">
            <div className="tl-row">
              <div className="tl-line"><div className="tl-dot" /><div className="tl-bar" /></div>
              <div className="tl-content">
                <strong>Tour the apartment</strong>
                <span>Typically scheduled same-day or next-day for active listings. Bring nothing — tours are informal.</span>
              </div>
            </div>
            <div className="tl-row">
              <div className="tl-line"><div className="tl-dot" /><div className="tl-bar" /></div>
              <div className="tl-content">
                <strong>Submit your application (same day if possible)</strong>
                <span>Hot apartments get multiple applications within hours. Submitting immediately after a tour — with your full document package already prepared — dramatically improves your odds.</span>
              </div>
            </div>
            <div className="tl-row">
              <div className="tl-line"><div className="tl-dot" /><div className="tl-bar" /></div>
              <div className="tl-content">
                <strong>Application review (1–3 business days)</strong>
                <span>Landlords verify income, run credit, and check rental history. Large management companies may take longer; private landlords often decide same-day.</span>
              </div>
            </div>
            <div className="tl-row">
              <div className="tl-line"><div className="tl-dot" /><div className="tl-bar" /></div>
              <div className="tl-content">
                <strong>Approval and lease signing (1–2 days)</strong>
                <span>Once approved, expect to sign the lease and wire first month's rent + security deposit within 24–48 hours. Delays here can cost you the unit.</span>
              </div>
            </div>
            <div className="tl-row">
              <div className="tl-line"><div className="tl-dot" /><div className="tl-bar" /></div>
              <div className="tl-content">
                <strong>Move-in</strong>
                <span>Usually on or after the lease start date. Confirm move-in procedures (elevator reservation, freight entrance, etc.) with the building super at least a week out.</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tips ── */}
        <div className="q-section" id="tips">
          <h2>Tips to Strengthen Your Application</h2>
          <p>When you're competing against multiple applicants, these factors can put your application on top:</p>

          <ol>
            <li><strong>Have documents ready before you tour.</strong> The ability to submit within an hour of a tour is a genuine advantage. Most renters take days to gather paperwork — you won't.</li>
            <li><strong>Consider an institutional guarantor if your financials are borderline.</strong> Services like Insurent or The Guarantors can step in as a co-signer for a fee, making you a competitive applicant even if you fall short on income or credit.</li>
            <li><strong>Write a brief personal cover letter.</strong> It sounds old-fashioned, but a short note explaining your situation (new job, relocating, stable employment history) can humanize your application to a private landlord.</li>
            <li><strong>Check your credit before applying.</strong> Dispute any errors on your report through Experian, Equifax, or TransUnion before your search. A single erroneous collection account can drop your score significantly.</li>
            <li><strong>Line up your guarantor in advance.</strong> If you think you might need one, have the conversation early and get their documents ready. Waiting until after a landlord asks is too slow.</li>
            <li><strong>Be responsive.</strong> Landlords and agents move fast. Responding to requests within the hour — not the day — signals that you're a serious applicant.</li>
            <li><strong>Know your number before touring.</strong> Walking into a tour uncertain about whether you can qualify wastes everyone's time. Calculate your 40x threshold and only tour apartments you can realistically qualify for.</li>
          </ol>
        </div>

        {/* ── CTA ── */}
        <div className="apt-cta">
          <h3>Ready to start your search?</h3>
          <p>AptPilot handles the outreach, tours, and application submissions — so you can focus on finding the right place, not chasing down agents.</p>
          <a href="/signup">Get started →</a>
        </div>

      </div>
    </>
  )
}
