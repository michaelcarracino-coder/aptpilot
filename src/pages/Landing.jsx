import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import SEO from '../components/SEO'
import { PLAN, BROKER_COST, brokerFloor, brokerTypical } from '../lib/stripe'

/* ─────────────────────────────────────────────────────────────
   Photography (Pexels — all URLs verified reachable).
   Used at full strength, not as 0.35-opacity wallpaper. The cold
   blue night-skyline shot was dropped: it fought the warm palette
   and was the main reason the hero read as flat and technical.
   ───────────────────────────────────────────────────────────── */
const px = (id, w = 1400) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`
const PHOTOS = {
  brownstones: px(30726437, 1200), // warm Brooklyn brownstone row — hero
  street:      px(16920867, 1200), // Midtown street level
  aerial:      px(10633466, 1600), // hazy Manhattan aerial — dark band
}

const FAQS = [
  {
    q: 'What does AptPilot actually do for me?',
    a: 'It handles the parts of a New York rental search that are confusing, slow, or easy to get wrong. It tells you what you actually qualify for instead of leaving you to guess at the 40x rule and guarantor thresholds. It tracks every document a landlord will demand and collates them into one package. And it texts you the moment a listing matches, so you are early with your paperwork already done.',
  },
  {
    q: 'Didn’t the FARE Act already fix renting in NYC?',
    a: 'It fixed the fee. Since June 2025 the landlord’s broker bills the landlord, and on most listings you owe nothing — that part genuinely got better. What it did not touch is the hard part. Vacancy is around 1.4%, a good listing draws dozens of inquiries in its first hour, and the agent stops reading once two or three complete applications land. The bill went away. The scramble did not.',
  },
  {
    q: 'Why not just hire a broker?',
    a: `You can, and if you want someone physically walking you through viewings it may be worth it. It costs ${BROKER_COST.floorLabel} — $${BROKER_COST.medianRent.toLocaleString()} on the median apartment, and up to ${BROKER_COST.percentRange} of the annual rent depending on the broker. AptPilot is for everyone who wants the guidance without the price tag, which until now meant doing it alone.`,
  },
  {
    q: 'Why pay when StreetEasy and Zillow are free?',
    a: 'Because they are listing portals and this is not. They will show you an apartment; they will not tell you whether you qualify for it, what your guarantor needs to earn, which of your documents a landlord will reject, or whether your file is ready to send. Use them for browsing. Renters lose apartments on the paperwork, not the browsing.',
  },
  {
    q: 'Is AptPilot a brokerage?',
    a: 'No. AptPilot is software. We don’t represent landlords, we take no commission, and we have no reason to push you toward a pricier apartment — the price is the same whatever you sign. You contact the listing agent directly.',
  },
  {
    q: 'What if I don’t find a place?',
    a: 'Nothing changes — there is no clock running. You pay once, so a search that takes twelve weeks costs exactly what one that takes two costs. And the account is still yours the next time you move.',
  },
]

/* ─── Text-message artifact: what the product actually does ─── */
function AlertMessage() {
  return (
    <div style={{
      background: '#fff', borderRadius: 10, padding: '1.15rem 1.25rem 1.3rem',
      boxShadow: '0 20px 56px rgba(31,26,20,0.20)', border: '1px solid var(--line)',
      width: '100%', maxWidth: 340,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingBottom: '0.7rem', marginBottom: '0.85rem', borderBottom: '1px solid var(--paper-deep)',
      }}>
        <span style={{ fontSize: '0.74rem', fontWeight: 600, color: 'var(--text)', letterSpacing: '0.02em' }}>AptPilot</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>now</span>
      </div>
      <div style={{
        background: 'var(--paper-deep)', borderRadius: '10px 10px 10px 3px',
        padding: '0.8rem 0.95rem', fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text)',
      }}>
        Match — <strong style={{ fontWeight: 600 }}>$2,850</strong>, 1 bed in Williamsburg, listed 4 minutes
        ago. You clear 40x on this one and your documents are ready to send.
      </div>
      <div style={{ marginTop: '0.7rem', fontSize: '0.79rem', color: 'var(--clay)', fontWeight: 500 }}>
        View listing →
      </div>
    </div>
  )
}

function FaqItem({ q, a, open, toggle }) {
  return (
    <div style={{ borderBottom: '1px solid var(--line)' }}>
      <button
        onClick={toggle}
        aria-expanded={open}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          padding: '1.5rem 0', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left', gap: '2rem',
        }}
      >
        <span style={{ fontSize: '1.06rem', fontWeight: 500, color: 'var(--text)', lineHeight: 1.45, letterSpacing: '-0.01em' }}>{q}</span>
        <span style={{
          color: 'var(--clay)', fontSize: '1.25rem', flexShrink: 0, lineHeight: 1,
          transition: 'transform 0.25s ease', transform: open ? 'rotate(45deg)' : 'none',
        }}>+</span>
      </button>
      <div style={{ maxHeight: open ? 340 : 0, overflow: 'hidden', transition: 'max-height 0.32s ease' }}>
        <p style={{ padding: '0 3rem 1.6rem 0', color: 'var(--text-muted)', fontSize: '0.96rem', lineHeight: 1.8 }}>{a}</p>
      </div>
    </div>
  )
}

/* ─── Section 3: what help costs today ───
   Not a savings calculator. The renter is not being charged a fee they can
   avoid — since the FARE Act most pay nothing on a landlord's listing. What
   this prices is HELP: the only guidance currently for sale runs a month's
   rent at the floor, and this shows what that means at their number. */
function TheMath({ navigate }) {
  const [rent, setRent] = useState(3500)
  const floor   = brokerFloor(rent)     // one month's rent — the floor ask
  const typical = brokerTypical(rent)   // the upper end, 15% of the year
  const ratio   = Math.round(floor / PLAN.price)

  return (
    <section style={{ position: 'relative', background: 'var(--forest)', overflow: 'hidden' }}>
      <img
        src={PHOTOS.aerial}
        alt=""
        aria-hidden="true"
        loading="lazy"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', opacity: 0.16, filter: 'saturate(0.5)',
        }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(100deg, var(--forest) 30%, rgba(30,61,51,0.82) 100%)' }} />

      <div className="wrap" style={{ position: 'relative', padding: '7rem 2rem' }}>
        <div style={{ maxWidth: 560, marginBottom: '3.5rem' }}>
          <div className="eyebrow" style={{ color: 'var(--sand)' }}>The arithmetic</div>
          <h2 className="display display-lg" style={{ color: 'var(--paper)', marginTop: '1.1rem' }}>
            What help costs today.
          </h2>
        </div>

        <div className="math-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div>
            <label htmlFor="rent-slider" style={{ display: 'block', fontSize: '0.74rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(250,246,239,0.55)', marginBottom: '0.9rem' }}>
              Monthly rent
            </label>
            <div className="display" style={{ fontSize: '3.4rem', color: 'var(--paper)', marginBottom: '1.6rem', lineHeight: 1 }}>
              ${rent.toLocaleString()}
            </div>
            <input
              id="rent-slider"
              type="range" min={1500} max={15000} step={100}
              value={rent}
              onChange={e => setRent(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--clay)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'rgba(250,246,239,0.45)', marginTop: '0.6rem' }}>
              <span>$1,500</span><span>$15,000</span>
            </div>
            <p style={{ marginTop: '2.2rem', fontSize: '0.9rem', color: 'rgba(250,246,239,0.62)', lineHeight: 1.75, maxWidth: 420 }}>
              The FARE Act ended forced tenant-paid fees in June 2025, so on a landlord’s listing you very
              likely owe nothing. What it did not do is make any of this easier. The listing agent is paid by
              the landlord and works for the landlord — and a broker of your own, the only guidance actually
              for sale, still starts at a month’s rent and runs to {BROKER_COST.percentRange} of the year.
            </p>
          </div>

          <div style={{ borderLeft: '1px solid rgba(250,246,239,0.16)', paddingLeft: '3rem' }}>
            {[
              { label: 'Go it alone', val: 'Free' },
              { label: 'A broker of your own, at the floor', val: `$${floor.toLocaleString()}` },
              { label: `The same broker at ${BROKER_COST.upperPercent}% of the year`, val: `$${typical.toLocaleString()}` },
              { label: 'AptPilot, paid once', val: `$${PLAN.price}` },
              { label: 'Every search after this one', val: '$0' },
            ].map(row => (
              <div key={row.label} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                padding: '1.1rem 0', borderBottom: '1px solid rgba(250,246,239,0.1)', gap: '1.5rem',
              }}>
                <span style={{ fontSize: '0.9rem', color: 'rgba(250,246,239,0.6)' }}>{row.label}</span>
                <span style={{ fontSize: '1.05rem', color: 'var(--paper)', fontWeight: 500, whiteSpace: 'nowrap' }}>{row.val}</span>
              </div>
            ))}
            <div style={{ paddingTop: '1.8rem' }}>
              <div style={{ fontSize: '0.8rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--sand)', marginBottom: '0.6rem' }}>
                Same help, priced apart
              </div>
              <div className="display" style={{ fontSize: '3.2rem', color: 'var(--paper)', lineHeight: 1 }}>
                {ratio}×
              </div>
              <p style={{ fontSize: '0.85rem', color: 'rgba(250,246,239,0.55)', marginTop: '0.7rem', lineHeight: 1.6, maxWidth: 300 }}>
                What a broker asks at ${rent.toLocaleString()}/mo, against what AptPilot asks — and you can
                still hire a broker later if you want one.
              </p>
              <button className="btn btn-cream btn-lg" onClick={() => navigate('/signup')} style={{ marginTop: '1.8rem' }}>
                Get lifetime access
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState(0)

  return (
    <div style={{ background: 'var(--paper)' }}>
      <SEO
        title="AptPilot — Renting in NYC, without doing it alone"
        description={`Renting in New York means going in blind or paying a broker a month's rent. AptPilot is the third option: know what you qualify for, get every document landlord-ready, and hear the moment a listing matches. $${PLAN.price} once, no subscription.`}
        canonical="https://aptpilot.vercel.app/"
      />

      <style>{`
        @media (max-width: 940px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 3rem !important; }
          .hero-figure { max-width: 520px; }
          .math-grid { grid-template-columns: 1fr !important; gap: 3rem !important; }
          .math-grid > div:last-child { border-left: none !important; padding-left: 0 !important; }
          .steps-grid { grid-template-columns: 1fr !important; gap: 2.75rem !important; }
          .close-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          /* Full-height hero padding leaves the headline stranded below the
             fold on a phone; tighten it and pull the message card back over
             the photo instead of floating it off the edge. */
          .hero-section { padding: 4.5rem 0 4rem !important; }
          .hero-sms { position: static !important; margin: -3.5rem auto 0 !important; }
          .hero-figure img { height: 400px !important; }
        }
      `}</style>

      {/* ── 1. HERO ─────────────────────────────────────────── */}
      <section className="hero-section" style={{ padding: '9rem 0 6.5rem' }}>
        <div className="wrap">
          <div className="hero-grid" style={{ display: 'grid', gridTemplateColumns: '1.12fr 0.88fr', gap: '5rem', alignItems: 'center' }}>
            <div className="fade-up">
              <div className="eyebrow">New York City</div>
              {/* Lines kept short deliberately: at display-xl this column is
                  ~580px, and the longest line here measures 521px in Fraunces
                  and 567px on the Georgia fallback. Anything wordier breaks to
                  four lines on desktop. */}
              <h1 className="display display-xl" style={{ margin: '1.5rem 0 1.6rem' }}>
                Do it alone,<br />or pay a broker.
              </h1>
              <p className="lede" style={{ maxWidth: 470 }}>
                Those are the two options for renting in New York. Go in blind against a
                {' '}{BROKER_COST.vacancyRate}% vacancy rate — or hand a broker {BROKER_COST.floorLabel},
                {' '}${BROKER_COST.medianRent.toLocaleString()} on the median apartment, to steer you through it.
              </p>
              <p className="lede" style={{ maxWidth: 470, marginTop: '1.1rem' }}>
                AptPilot is the third one. <strong style={{ color: 'var(--text)', fontWeight: 600 }}>${PLAN.price}</strong>, once.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', margin: '2.4rem 0 1.1rem' }}>
                <button className="btn btn-primary btn-lg" onClick={() => navigate('/signup')}>
                  Get started
                </button>
                <button className="btn btn-outline btn-lg" onClick={() => navigate('/pricing')}>
                  See pricing
                </button>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-faint)' }}>
                ${PLAN.price} once · no subscription · nothing to cancel
              </p>
            </div>

            {/* Figure: photograph with the product artifact overlapping it */}
            <div className="hero-figure fade-up" style={{ position: 'relative', animationDelay: '0.08s' }}>
              <img
                src={PHOTOS.brownstones}
                alt="A row of Brooklyn brownstones with stoops and window boxes"
                style={{
                  width: '100%', height: 540, objectFit: 'cover', borderRadius: 6,
                  boxShadow: 'var(--shadow-lg)', display: 'block',
                }}
              />
              {/* Sits low and left so it breaks the photo's edge without
                  covering the stoops and doorways that carry the image. */}
              <div className="hero-sms" style={{ position: 'absolute', left: '-3.5rem', bottom: '-3rem' }}>
                <AlertMessage />
              </div>
            </div>
          </div>

          {/* Quiet fact line — replaces the old four-tile stat strip */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '3rem',
            marginTop: '7rem', paddingTop: '2.2rem', borderTop: '1px solid var(--line)',
          }}>
            {[
              [`${BROKER_COST.vacancyRate}%`,
               'Vacancy across the five boroughs — the tightest New York has been in decades, and the reason a good listing is gone the day it posts'],
              [`$${BROKER_COST.medianRent.toLocaleString()}`,
               `One month’s rent on the median apartment — what a tenant-side broker asks to guide you through this`],
              [`$${PLAN.price}`,
               'What AptPilot asks. Paid once, and the account is still yours at your next lease'],
            ].map(([v, l]) => (
              <div key={l} style={{ flex: '1 1 200px', maxWidth: 300 }}>
                <div className="display" style={{ fontSize: '1.85rem', marginBottom: '0.5rem' }}>{v}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. HOW IT WORKS ─────────────────────────────────── */}
      <section id="how-it-works" style={{ background: 'var(--paper-deep)', padding: '7rem 0' }}>
        <div className="wrap">
          <div style={{ maxWidth: 560, marginBottom: '4.5rem' }}>
            <div className="eyebrow">How it works</div>
            <h2 className="display display-lg" style={{ marginTop: '1.1rem' }}>
              The parts that lose people apartments.
            </h2>
          </div>

          <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3.5rem' }}>
            {[
              { n: 'One', t: 'Tell us what you want', d: 'Budget, bedrooms, neighborhoods, move-in window. About two minutes, and you can change any of it later. That is the last form you fill in blind.' },
              { n: 'Two', t: 'Find out where you stand', d: 'Whether your income clears 40x, whether you need a guarantor, what a guarantor has to earn, what happens if you are combining incomes. Ask anything, any hour — this is the part renters usually guess at.' },
              { n: 'Three', t: 'Go in with your file done', d: 'Every document a landlord will demand, tracked and checked before they ask, collated into one package. Then we text you the moment something matches, so you are early with paperwork already finished.' },
            ].map(step => (
              <div key={step.n}>
                <div className="display" style={{ fontSize: '1.5rem', color: 'var(--clay)', marginBottom: '1.1rem' }}>
                  {step.n}
                </div>
                <div style={{ height: 1, background: 'var(--line)', marginBottom: '1.4rem' }} />
                <h3 style={{ fontSize: '1.12rem', fontWeight: 600, marginBottom: '0.8rem', letterSpacing: '-0.01em' }}>{step.t}</h3>
                <p style={{ fontSize: '0.94rem', color: 'var(--text-muted)', lineHeight: 1.75 }}>{step.d}</p>
              </div>
            ))}
          </div>

          <figure style={{ marginTop: '5rem' }}>
            <img
              src={PHOTOS.street}
              alt="A Midtown Manhattan street corner on a clear morning"
              loading="lazy"
              style={{ width: '100%', height: 380, objectFit: 'cover', objectPosition: 'center 62%', borderRadius: 6, display: 'block' }}
            />
            <figcaption className="caption" style={{ marginTop: '0.9rem' }}>
              We cover all five boroughs. You pick the neighborhoods —{' '}
              <button
                onClick={() => navigate('/neighborhoods')}
                style={{ background: 'none', border: 'none', padding: 0, color: 'var(--clay)', fontWeight: 500, cursor: 'pointer', fontSize: 'inherit', fontFamily: 'inherit' }}
              >
                browse the map
              </button>.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ── 3. THE MATH ─────────────────────────────────────── */}
      <TheMath navigate={navigate} />

      {/* ── 4. QUESTIONS + CLOSE ────────────────────────────── */}
      <section style={{ padding: '7rem 0 0' }}>
        {/* Uses the same .wrap as every other section so the left edge lines
            up with the hero, the steps and the closing card; the list itself
            is width-limited for readability rather than centred. */}
        <div className="wrap">
          <div style={{ marginBottom: '2.5rem' }}>
            <div className="eyebrow">Questions</div>
            <h2 className="display display-lg" style={{ marginTop: '1.1rem' }}>Before you sign up.</h2>
          </div>
          <div style={{ maxWidth: 780 }}>
            {FAQS.map((f, i) => (
              <FaqItem
                key={f.q}
                q={f.q}
                a={f.a}
                open={openFaq === i}
                toggle={() => setOpenFaq(openFaq === i ? -1 : i)}
              />
            ))}
          </div>
        </div>

        {/* Closing */}
        <div className="wrap" style={{ padding: '7rem 2rem 0' }}>
          <div className="close-grid" style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'stretch',
            borderRadius: 6, overflow: 'hidden', boxShadow: 'var(--shadow-lg)',
          }}>
            <div style={{ background: 'var(--forest)', padding: '4.5rem 3.5rem' }}>
              <h2 className="display display-md" style={{ color: 'var(--paper)' }}>
                Stop doing this alone.
              </h2>
              <p style={{ color: 'rgba(250,246,239,0.65)', fontSize: '0.98rem', lineHeight: 1.75, margin: '1.2rem 0 2.2rem', maxWidth: 380 }}>
                Two minutes to set up. ${PLAN.price} once, and the account stays yours —
                through this lease and the next one.
              </p>
              <button className="btn btn-cream btn-lg" onClick={() => navigate('/signup')}>
                Create your search
              </button>
            </div>
            <img
              src={PHOTOS.brownstones}
              alt="Brownstone façades in Brooklyn"
              loading="lazy"
              style={{ width: '100%', height: '100%', minHeight: 340, objectFit: 'cover', display: 'block' }}
            />
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer style={{ marginTop: '7rem', borderTop: '1px solid var(--line)', padding: '3.5rem 0 4rem' }}>
        <div className="wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: '2.5rem', justifyContent: 'space-between' }}>
          <div style={{ maxWidth: 300 }}>
            <div className="display" style={{ fontSize: '1.3rem', marginBottom: '0.7rem' }}>
              Apt<span style={{ color: 'var(--clay)' }}>Pilot</span>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              Instant alerts for no-fee New York City rentals, the moment they list.
            </p>
          </div>

          {[
            { title: 'Product', links: [['Pricing', '/pricing'], ['Neighborhoods', '/neighborhoods'], ['How to qualify', '/qualify']] },
            { title: 'Read', links: [['Journal', '/blog']] },
            { title: 'Company', links: [['Privacy', '/privacy'], ['Terms', '/terms'], ['Log in', '/login']] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '1.1rem' }}>
                {col.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {col.links.map(([label, path]) => (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', fontSize: '0.89rem', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="wrap" style={{ marginTop: '3rem', paddingTop: '1.6rem', borderTop: '1px solid var(--line)' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-faint)' }}>
            © {new Date().getFullYear()} AptPilot. Not a licensed real estate brokerage. Listing data sourced from public listings.
          </p>
        </div>
      </footer>
    </div>
  )
}
