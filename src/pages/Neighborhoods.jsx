import { useState } from 'react'
import SEO from '../components/SEO'
import PaywallGate from '../components/PaywallGate'

const css = `
.nbhd-page { max-width: 920px; margin: 0 auto; padding: 5rem 1.5rem 6rem; }
.nbhd-hero { margin-bottom: 3.5rem; }
.nbhd-hero h1 { font-family: 'Fraunces', Georgia, serif; font-size: 2.8rem; color: var(--navy); line-height: 1.15; margin-bottom: 0.75rem; }
.nbhd-hero .lead { font-size: 1.05rem; color: var(--slate); line-height: 1.75; max-width: 640px; }


.nbhd-section { margin-bottom: 4rem; scroll-margin-top: 88px; }
.nbhd-section h2 { font-family: 'Fraunces', Georgia, serif; font-size: 1.75rem; color: var(--navy); margin-bottom: 0.4rem; padding-bottom: 0.6rem; border-bottom: 2px solid var(--teal); display: inline-block; }
.nbhd-section .section-intro { font-size: 0.94rem; color: var(--slate); line-height: 1.8; margin: 0.75rem 0 1.5rem; }

.nbhd-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }
.nbhd-card { background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 1.2rem 1.3rem; }
.nbhd-card h3 { font-family: 'Fraunces', Georgia, serif; font-size: 1.1rem; color: var(--navy); margin-bottom: 0.25rem; }
.nbhd-card .vibe { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; color: var(--teal); margin-bottom: 0.65rem; }
.nbhd-card p { font-size: 0.87rem; color: var(--slate); line-height: 1.7; margin: 0 0 0.75rem; }
.nbhd-card .tidbit { font-size: 0.82rem; color: var(--text-muted); background: var(--paper-deep); border-left: 2px solid var(--clay); border-radius: 0 6px 6px 0; padding: 0.5rem 0.75rem; line-height: 1.55; }
.nbhd-card .price-tag { display: inline-block; font-size: 0.75rem; font-weight: 600; background: var(--paper-deep); color: var(--text-muted); border-radius: 100px; padding: 2px 10px; margin-bottom: 0.6rem; }


.apt-cta { background: var(--forest); border-radius: 16px; padding: 2.5rem; text-align: center; margin-top: 4rem; }
.apt-cta h3 { font-family: 'Fraunces', Georgia, serif; font-size: 1.7rem; color: #fff; margin-bottom: 0.6rem; }
.apt-cta p { font-size: 0.94rem; color: rgba(255,255,255,0.7); margin-bottom: 1.5rem; }
.apt-cta a { display: inline-block; background: var(--paper); color: var(--forest); font-weight: 600; font-size: 0.95rem; padding: 0.8rem 2rem; border-radius: 3px; text-decoration: none; }
`

// The old version of this was a hand-drawn polygon SVG of the boroughs in
// baby blue and mint. It was the cheapest-looking element on the site and it
// wasn't an accurate map of anything. This keeps the useful part — jump to a
// borough — as a typographic index with the numbers a renter actually wants.
const BOROUGH_INDEX = [
  { id: 'manhattan',  label: 'Manhattan',              note: 'Highest rents, shortest commutes',    range: '$2,800–$9,000' },
  { id: 'harlem',     label: 'Harlem & Upper Manhattan', note: 'Pre-war space, real value uptown',  range: '$2,000–$4,500' },
  { id: 'brooklyn',   label: 'Brooklyn',               note: 'Brownstones and the fastest market',  range: '$2,400–$7,500' },
  { id: 'queens',     label: 'Queens',                 note: 'The best value near a Manhattan commute', range: '$1,900–$4,200' },
  { id: 'bronx',      label: 'The Bronx',              note: 'Lowest rents in the five boroughs',   range: '$1,600–$3,000' },
  { id: 'hoboken-jc', label: 'Hoboken & Jersey City',  note: 'Across the river, often a PATH away', range: '$2,200–$4,800' },
]

function BoroughIndex() {
  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div style={{ margin: '0 0 4rem', borderTop: '1px solid var(--line)' }}>
      {BOROUGH_INDEX.map(b => (
        <button
          key={b.id}
          onClick={() => scrollTo(b.id)}
          style={{
            width: '100%', display: 'grid', gridTemplateColumns: '1.1fr 1.4fr auto',
            gap: '1.5rem', alignItems: 'baseline', textAlign: 'left',
            padding: '1.35rem 0.25rem', background: 'none',
            border: 'none', borderBottom: '1px solid var(--line)', cursor: 'pointer',
            transition: 'background 0.15s, padding 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--paper-deep)'; e.currentTarget.style.paddingLeft = '0.9rem' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.paddingLeft = '0.25rem' }}
        >
          <span className="display" style={{ fontSize: '1.35rem', color: 'var(--text)' }}>{b.label}</span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{b.note}</span>
          <span style={{ fontSize: '0.88rem', color: 'var(--clay)', fontWeight: 500, whiteSpace: 'nowrap' }}>{b.range}</span>
        </button>
      ))}
    </div>
  )
}

function Card({ name, vibe, price, description, tidbit }) {
  return (
    <div className="nbhd-card">
      <h3>{name}</h3>
      <div className="vibe">{vibe}</div>
      <span className="price-tag">{price}</span>
      <p>{description}</p>
      <div className="tidbit">{tidbit}</div>
    </div>
  )
}

export default function Neighborhoods() {
  return (
    <>
      <SEO
        title="NYC Neighborhood Guide for Renters | AptPilot"
        description="A renter's guide to every major NYC neighborhood — Manhattan, Brooklyn, Queens, the Bronx, Harlem, Hoboken, and Jersey City. Rent ranges, vibes, and real estate tips."
      />
      <style>{css}</style>
      <div className="nbhd-page">

        <div className="nbhd-hero">
          <h1>NYC Neighborhood Guide</h1>
          <p className="lead">
            New York City is a collection of hundreds of distinct neighborhoods, each with its own personality, price point, and tradeoffs. This guide breaks down the most popular rental markets so you can zero in on the right fit before your search begins.
          </p>
        </div>

        <BoroughIndex />


        {/* ── Manhattan ── */}
        <div className="nbhd-section" id="manhattan">
          <h2>Manhattan</h2>
          <p className="section-intro">
            Manhattan is the financial and cultural center of NYC. Rents are the highest in the city, but so is the concentration of jobs, transit, restaurants, and nightlife. Most neighborhoods below 96th Street are highly competitive — apartments move in hours, not days.
          </p>
          <div className="nbhd-grid">
            <Card
              name="Upper East Side"
              vibe="Established · Family-friendly"
              price="$2,800–$6,500/mo"
              description="Classic, tree-lined blocks between Central Park and the East River. Home to the Museum Mile, top-tier private schools, and a more traditional NYC feel. Quieter than downtown but well-connected via the 4/5/6 and Q trains."
              tidbit="The Second and Third Avenue corridors offer better value than the Park and Madison Avenue blocks just steps away. Pre-war co-ops dominate — but most rentals are in newer doorman buildings."
            />
            <Card
              name="Upper West Side"
              vibe="Cultural · Relaxed · Walkable"
              price="$2,800–$6,000/mo"
              description="Facing Central Park from the west, the UWS has a laid-back intellectual energy with proximity to Lincoln Center, Riverside Park, and Columbia University. Strong family presence and excellent public schools."
              tidbit="Broadway between 72nd and 86th Street is a renter's sweet spot — competitive pricing for large pre-war units with original details. The 1/2/3 trains make Midtown commutes very fast."
            />
            <Card
              name="Midtown"
              vibe="Central · Convenient · No-frills"
              price="$3,000–$6,500/mo"
              description="The geographic and business center of Manhattan. Commuting doesn't get easier — you can walk to most jobs in Midtown and reach anywhere in the city in under 20 minutes. Residential living here trades neighborhood character for pure convenience."
              tidbit="Hell's Kitchen (west of 8th Ave, 34th–59th) is Midtown's best-kept residential secret — more personality, lower prices, and walking distance to everything. Murray Hill (east side) skews toward young professionals in newer high-rises."
            />
            <Card
              name="Chelsea"
              vibe="Arts · Trendy · Vibrant"
              price="$3,200–$7,000/mo"
              description="Home to world-class art galleries, the High Line, and Chelsea Market. The neighborhood is vibrant, walkable, and centrally located on the west side. A mix of newer luxury buildings and older walk-ups."
              tidbit="The far west blocks near the Hudson River Yards can yield better pricing than the gallery district — and the 7 train extension puts Hudson Yards itself minutes from Midtown and Queens."
            />
            <Card
              name="West Village"
              vibe="Charming · Upscale · Cobblestone"
              price="$3,500–$9,000/mo"
              description="The West Village is the most picturesque neighborhood in Manhattan — winding streets, Federal-style townhouses, and a restaurant scene that punches well above its size. It's consistently one of the city's most desirable and competitive markets."
              tidbit="Units here rarely sit vacant. Having your full application and first/security deposit ready to wire same-day is almost a requirement. Expect bidding wars at popular price points."
            />
            <Card
              name="Greenwich Village / NYU Area"
              vibe="Historic · Student-heavy · Lively"
              price="$3,000–$7,000/mo"
              description="The Village has deep cultural history and remains one of Manhattan's most coveted addresses. NYU's campus creates a younger energy around Washington Square Park, while the blocks further south toward SoHo are quieter and more residential."
              tidbit="Landlords in this area are accustomed to student and guarantor applications — income requirements are well-understood. But faculty and non-student applicants often win out on competitive units."
            />
            <Card
              name="East Village"
              vibe="Gritty · Creative · Nightlife"
              price="$2,600–$5,500/mo"
              description="The EV has some of Manhattan's best dining, bars, and independent culture. It's younger and edgier than its western counterpart, with a mix of longtime residents and recent transplants. More affordable than the West Village with the same central location."
              tidbit="Avenue A, B, and C (Alphabet City) offer more square footage for the price than the blocks closer to Broadway. The L train at 1st Ave is a key transit artery — factor in the commute if your job is in Midtown or further."
            />
            <Card
              name="Lower East Side"
              vibe="Eclectic · Nightlife · Evolving"
              price="$2,400–$5,000/mo"
              description="One of Manhattan's historically working-class neighborhoods, now a buzzy mix of new condos, art spaces, and old-school delicatessens. Younger renter demographic. The F/M/J/Z trains provide solid connectivity."
              tidbit="The blocks near the Williamsburg Bridge connect seamlessly to Brooklyn — many residents treat the LES and Williamsburg as one extended neighborhood. Pricing is generally lower than nearby NoHo or SoHo."
            />
            <Card
              name="SoHo / NoHo / Nolita"
              vibe="Upscale · Fashion · Loft-heavy"
              price="$4,000–$12,000/mo"
              description="Cast-iron loft buildings, designer boutiques, and upscale restaurants define these adjacent neighborhoods. Among the priciest and most fashionable rental markets in the city. True lofts with original industrial details command significant premiums."
              tidbit="Many SoHo units are technically artist lofts with specific occupancy rules — verify legality before signing. The neighborhood has limited subway access compared to other parts of Manhattan."
            />
            <Card
              name="Tribeca"
              vibe="Wealthy · Quiet · Family"
              price="$4,500–$15,000/mo"
              description="Tribeca is among the most expensive neighborhoods in NYC — a quiet, residential enclave with converted warehouse lofts, celebrity neighbors, and some of the city's best restaurants. Very family-oriented."
              tidbit="Street-level retail is sparse; this is a neighborhood for those who want space, quiet, and prestige. Transit is surprisingly good — A/C/E and 1/2/3 trains within walking distance."
            />
            <Card
              name="Financial District"
              vibe="Commuter · Sleek · Revitalized"
              price="$2,800–$5,500/mo"
              description="Once purely a 9-to-5 office district, FiDi has evolved into a genuine residential neighborhood over the past decade. Newer luxury towers, waterfront access at the Seaport, and lower rents than comparable Midtown buildings."
              tidbit="FiDi offers some of Manhattan's best value for large, amenity-rich apartments. The trade-off is a quieter weekend scene — though the Seaport and Fulton Center have improved that significantly."
            />
          </div>
        </div>

        <PaywallGate
          title="Unlock the full NYC neighborhood guide"
          subtitle="Sign up free to explore Harlem, Brooklyn, Queens, the Bronx, Hoboken, and Jersey City — with rent ranges, vibe breakdowns, and insider tips for every area."
        >
        {/* ── Harlem ── */}
        <div className="nbhd-section" id="harlem">
          <h2>Harlem & Upper Manhattan</h2>
          <p className="section-intro">
            North of 96th Street, Manhattan shifts considerably — more space, more character, and meaningfully lower prices. These neighborhoods have seen significant investment over the past decade while retaining their distinct cultural identities.
          </p>
          <div className="nbhd-grid">
            <Card
              name="Central Harlem"
              vibe="Historic · Vibrant · Evolving"
              price="$1,800–$3,800/mo"
              description="The Apollo Theater, Marcus Garvey Park, and 125th Street anchor a neighborhood with deep history and a rapidly changing rental market. Brownstones, pre-war walkups, and new condo buildings coexist."
              tidbit="Harlem has seen some of Manhattan's fastest rent appreciation. Areas around Frederick Douglass Boulevard and 125th Street are especially competitive. The 2/3 express trains make Midtown a 15-minute commute."
            />
            <Card
              name="East Harlem (El Barrio)"
              vibe="Authentic · Affordable · Underrated"
              price="$1,600–$3,200/mo"
              description="East Harlem has an incredible food scene and a tight-knit community feel. More affordable than Central Harlem with easy access to the 4/5/6 trains and the Upper East Side across 96th Street."
              tidbit="Lexington Avenue above 96th offers some of Manhattan's most undervalued rentals. The area is developing, but more gradually than Central Harlem — better for renters who want space over status."
            />
            <Card
              name="Washington Heights"
              vibe="Spacious · Community · Affordable"
              price="$1,500–$2,800/mo"
              description="One of the most affordable Manhattan neighborhoods, Washington Heights offers large pre-war apartments, Hudson River views, Fort Tryon Park, and the Cloisters. Warm community feel with an excellent food scene."
              tidbit="You can get a 3-bedroom here for what a studio costs in the West Village. The A express train gets you to Midtown in under 25 minutes — making this one of Manhattan's best commuter value plays."
            />
            <Card
              name="Inwood"
              vibe="Hidden gem · Wooded · Quiet"
              price="$1,400–$2,600/mo"
              description="Manhattan's northernmost neighborhood sits beside Inwood Hill Park — actual old-growth forest in the middle of the city. Large pre-war apartments at prices that feel impossible for Manhattan. Strong sense of community."
              tidbit="The A train to Midtown is around 30 minutes express. Inwood is ideal for renters prioritizing space and green space over nightlife proximity. Rents have risen but remain significantly below the rest of Manhattan."
            />
            <Card
              name="Morningside Heights"
              vibe="Academic · Quiet · Columbia University"
              price="$2,000–$4,000/mo"
              description="Columbia University anchors this intellectually vibrant neighborhood between Harlem and the Upper West Side. Cathedral of Saint John the Divine sits at its edge. Very safe, walkable, and popular with academics, students, and healthcare professionals (Columbia Medical Center is nearby)."
              tidbit="Non-Columbia renters often find better deals here than in the UWS with similar building quality. The 1 train provides a direct shot to Midtown in about 20 minutes."
            />
          </div>
        </div>

        {/* ── Brooklyn ── */}
        <div className="nbhd-section" id="brooklyn">
          <h2>Brooklyn</h2>
          <p className="section-intro">
            Brooklyn has evolved from a cheaper Manhattan alternative into a destination in its own right. Many parts of North Brooklyn now rival Manhattan prices, while Central and South Brooklyn still offer genuine value. The borough has its own distinct energy — slower pace, wider sidewalks, more greenery.
          </p>
          <div className="nbhd-grid">
            <Card
              name="Williamsburg"
              vibe="Trendy · Nightlife · Tech + Creative"
              price="$2,800–$6,000/mo"
              description="North Brooklyn's flagship neighborhood. Packed with restaurants, music venues, rooftop bars, and new luxury towers along the waterfront. The L train to Manhattan is both a lifeline and a choke point — know your commute before signing."
              tidbit="The Bedford Ave corridor is the most expensive. Heading east toward Graham and Grand Aves gives you the same neighborhood access at 15–25% lower rent. The waterfront towers command premiums for Manhattan skyline views."
            />
            <Card
              name="Greenpoint"
              vibe="Artsy · Residential · Quieter"
              price="$2,500–$5,000/mo"
              description="Just north of Williamsburg, Greenpoint has a quieter, more residential feel with a growing creative class and excellent cafes and restaurants. Manhattan Avenue is the main commercial strip. G and L train access."
              tidbit="Greenpoint often prices 10–20% below Williamsburg for equivalent apartments. The G train is the only subway line, which keeps prices lower — but the ferry on the East River waterfront is an underrated commute option."
            />
            <Card
              name="DUMBO"
              vibe="Luxury · Manhattan views · Cobblestone"
              price="$3,200–$8,000/mo"
              description="Down Under the Manhattan Bridge Overpass is one of Brooklyn's most visually stunning neighborhoods — cobblestone streets framed by the Manhattan and Brooklyn Bridges. A dense creative and tech office scene plus high-end residential towers."
              tidbit="DUMBO has some of the best direct Manhattan access in Brooklyn via the A/C trains at High St. Parking is extremely limited and expensive. Units with bridge views carry significant premiums."
            />
            <Card
              name="Brooklyn Heights"
              vibe="Brownstone · Prestigious · Quiet"
              price="$2,800–$6,500/mo"
              description="The oldest neighborhood in Brooklyn — a landmarked district of Federal and Greek Revival brownstones overlooking the Manhattan skyline from the Promenade. Very residential, family-oriented, and prestigious."
              tidbit="The Brooklyn Bridge Park at its waterfront is one of the city's best. Transit is excellent — multiple A/C/2/3/4/5 lines. Rental inventory is tight because so many buildings are owner-occupied."
            />
            <Card
              name="Cobble Hill / Carroll Gardens"
              vibe="Family · Brownstone · Community"
              price="$2,600–$5,500/mo"
              description="Two adjacent neighborhoods known for their leafy streets, excellent restaurants, and strong community feel. Both are popular with young families and offer some of Brooklyn's most charming blocks."
              tidbit="Smith Street is one of Brooklyn's best restaurant rows. The F/G trains provide Manhattan access. These neighborhoods command a premium over nearby Gowanus — where rents are lower but the Superfund site cleanup is ongoing."
            />
            <Card
              name="Park Slope"
              vibe="Family-friendly · Leafy · Green"
              price="$2,500–$5,500/mo"
              description="Famously family-friendly, Park Slope lines the western edge of Prospect Park with Victorian brownstones and an excellent commercial strip on 5th and 7th Avenues. Among Brooklyn's most consistently in-demand neighborhoods."
              tidbit="The 2/3 express and B/Q trains offer fast Manhattan access. Schools here are among Brooklyn's best, driving family demand. The blocks nearest Prospect Park West carry the highest premiums."
            />
            <Card
              name="Crown Heights"
              vibe="Up-and-coming · Diverse · Spacious"
              price="$1,900–$3,500/mo"
              description="A neighborhood with deep roots and a rapidly evolving restaurant and retail scene, now attracting a new wave of renters priced out of Park Slope and Prospect Heights. Large pre-war apartments with good bones."
              tidbit="The Kingston Ave and Utica Ave corridors have seen significant commercial development. The 3 and 4 express trains get you to Midtown in under 30 minutes. Eastern Parkway is one of Brooklyn's grandest boulevards."
            />
            <Card
              name="Bed-Stuy (Bedford-Stuyvesant)"
              vibe="Historic · Brownstone revival · Evolving"
              price="$1,800–$3,800/mo"
              description="Brooklyn's largest neighborhood by population has one of the city's finest stocks of intact brownstone rowhouses. Bed-Stuy has undergone significant revitalization over the past decade with new restaurants, cafes, and retail alongside longtime residents."
              tidbit="Fulton Street and Nostrand Ave are the main commercial corridors. The A/C trains at Nostrand and Utica Ave provide express service to Manhattan. The western blocks near Clinton Hill command higher prices than the eastern reaches."
            />
            <Card
              name="Bushwick"
              vibe="Street art · DIY · Nightlife"
              price="$1,700–$3,200/mo"
              description="Brooklyn's most creative and youthful neighborhood — every building seems to be covered in murals, and the nightlife is among NYC's most underground. Industrial warehouses sit alongside traditional rowhouses and newer condo conversions."
              tidbit="Bushwick is L train dependent — plan your commute accordingly. The border with Ridgewood (Queens) blurs seamlessly. Rent has risen significantly over the past decade but remains lower than Williamsburg."
            />
            <Card
              name="Bay Ridge"
              vibe="Suburban feel · Spacious · Quiet"
              price="$1,600–$2,800/mo"
              description="At Brooklyn's southwestern tip, Bay Ridge has a surprisingly suburban feel with lower density, single-family homes, tree-lined streets, and a lively restaurant scene along Third and Fifth Avenues. Excellent for families who want space and quiet."
              tidbit="The R train to Manhattan is slow (40–50 min), making Bay Ridge better suited for local Brooklyn jobs or remote workers. The Verrazano-Narrows Bridge makes Staten Island and New Jersey accessible. Some of Brooklyn's lowest rents for large apartments."
            />
          </div>
        </div>

        {/* ── Queens ── */}
        <div className="nbhd-section" id="queens">
          <h2>Queens</h2>
          <p className="section-intro">
            Queens is one of NYC's best-kept secrets for renters. You get more space, an incredible variety of food and culture, and lower prices than comparable Manhattan or Brooklyn apartments — often with excellent subway access.
          </p>
          <div className="nbhd-grid">
            <Card
              name="Astoria"
              vibe="Laid-back · Diverse · Great food"
              price="$2,000–$3,800/mo"
              description="One of Queens' most popular neighborhoods with renters. Astoria has a thriving restaurant and bar scene, Astoria Park on the East River, and a mix of young professionals and longtime residents. Strong transit connections and a genuine neighborhood feel."
              tidbit="The N/W trains get you to Midtown in 20–25 minutes — one of the best commute-to-rent ratios in the metro area. Steinway Street and Ditmars Blvd are the main commercial corridors. Larger apartments for less than comparable Brooklyn neighborhoods."
            />
            <Card
              name="Long Island City (LIC)"
              vibe="Luxury high-rises · Fast commute · Art"
              price="$2,600–$5,500/mo"
              description="LIC has transformed into a luxury rental market over the past decade. Glass towers with amenities line the East River waterfront with jaw-dropping Manhattan skyline views. MoMA PS1 anchors a serious arts scene."
              tidbit="The 7 train gets you to Times Square in 5 minutes — the fastest Queens-to-Midtown commute available. Newer buildings often have months of free rent as concessions. Amazon's near-miss with HQ2 raised prices significantly; some softening has since occurred."
            />
            <Card
              name="Jackson Heights"
              vibe="Authentic · Affordable · Incredible food"
              price="$1,500–$2,600/mo"
              description="One of the most culinarily vibrant neighborhoods in the city — 74th Street alone has some of NYC's best South Asian, South American, and Southeast Asian food. Warm community feel, large apartments, and prices well below comparable areas."
              tidbit="The 7, E, F, M, and R trains converge here — exceptional transit coverage for the price. Expect large apartments with older finishes. Jackson Heights is ideal for renters who prioritize authentic culture and value over amenities."
            />
            <Card
              name="Ridgewood"
              vibe="Emerging · Artsy · Brooklyn adjacent"
              price="$1,700–$3,000/mo"
              description="Straddling the Brooklyn-Queens border, Ridgewood has absorbed much of the creative community priced out of Bushwick and Bed-Stuy. Beautiful early 20th-century brick rowhouses, good coffee shops, and a still-developing bar and restaurant scene."
              tidbit="L and M train access. Ridgewood is one of the last neighborhoods where you can get a true deal on a large, prewar apartment within easy reach of Brooklyn's best neighborhoods. Rents are rising quickly — timing matters."
            />
            <Card
              name="Sunnyside & Woodside"
              vibe="Underrated · Commuter-friendly · Community"
              price="$1,600–$2,800/mo"
              description="Two adjacent Queens neighborhoods with great value and a genuine community feel. Sunnyside has some of the borough's most charming block associations and community gardens. Woodside is quieter and more family-oriented."
              tidbit="The 7 train provides fast access to Midtown. One of the city's best value propositions for renters who don't need to be in Manhattan or Brooklyn. Queens Blvd is a major commercial artery."
            />
            <Card
              name="Forest Hills & Rego Park"
              vibe="Suburban · Safe · Quiet"
              price="$1,700–$3,200/mo"
              description="Forest Hills feels more like a suburban town than an NYC neighborhood — wide streets, Tudor-style architecture, excellent restaurants on Austin Street, and a genuine sense of community. Rego Park sits just to the north with more high-rise options."
              tidbit="The E/F express trains get you to Midtown in about 30 minutes. One of Queens' safest and most livable neighborhoods. Forest Hills Gardens is a private planned community — coveted but pricey and mostly owner-occupied."
            />
          </div>
        </div>

        {/* ── Bronx ── */}
        <div className="nbhd-section" id="bronx">
          <h2>The Bronx</h2>
          <p className="section-intro">
            The Bronx offers some of the most affordable rentals in the entire New York metropolitan area. Often overlooked by renters fixated on Manhattan and Brooklyn, the borough has several genuinely excellent neighborhoods with strong communities and fast transit connections.
          </p>
          <div className="nbhd-grid">
            <Card
              name="Riverdale"
              vibe="Suburban enclave · Hilly · Spacious"
              price="$1,600–$3,200/mo"
              description="The Bronx's most affluent neighborhood sits on wooded bluffs above the Hudson River. It feels far more like Westchester than the Bronx — quiet residential streets, large apartment buildings, and top private schools. Popular with families and retirees."
              tidbit="The 1 train at 231st Street and Metro-North at Spuyten Duyvil offer two commute options. Riverdale offers some of NYC's best apartment value for families needing space and good schools."
            />
            <Card
              name="Mott Haven"
              vibe="Emerging · Art scene · South Bronx"
              price="$1,500–$2,800/mo"
              description="Just north of Harlem, Mott Haven has attracted artists, galleries, and young professionals with below-market rents and an improving restaurant scene. Newer condo and rental developments have brought added investment in recent years."
              tidbit="The 6 train gets you to Midtown in about 25 minutes. Mott Haven is the Bronx's most rapidly changing neighborhood — early movers have seen strong value. The Bruckner Blvd waterfront is being developed."
            />
            <Card
              name="Fordham / Belmont"
              vibe="University town · Food market · Community"
              price="$1,200–$2,200/mo"
              description="Fordham University anchors a neighborhood with a strong community feel and one of NYC's best food market streets — Arthur Avenue has been a culinary destination for generations, far less touristy than comparable Manhattan options."
              tidbit="Among the cheapest large apartments you'll find within 30 minutes of Midtown. The D/B trains and Metro-North's Harlem Line run through the area. Belmont's Arthur Avenue is worth the trip alone."
            />
            <Card
              name="Pelham Bay & City Island"
              vibe="Waterfront · Quiet · Outer borough feel"
              price="$1,400–$2,400/mo"
              description="The northeastern Bronx offers a genuinely suburban lifestyle within city limits — Pelham Bay Park is the largest park in NYC (three times the size of Central Park). City Island is a literal New England-style fishing village accessible by bridge."
              tidbit="The 6 train terminates at Pelham Bay Park. This is ideal for renters who want quiet, green space, and low rents and don't mind a longer commute. Almost no one from Manhattan considers this area — which is exactly why it's a value."
            />
          </div>
        </div>

        {/* ── Hoboken / JC ── */}
        <div className="nbhd-section" id="hoboken-jc">
          <h2>Hoboken & Jersey City</h2>
          <p className="section-intro">
            Just across the Hudson River, Hoboken and Jersey City are legitimate alternatives to Manhattan for many renters — especially those working in Midtown or Lower Manhattan. Lower prices, more space, and surprisingly fast commutes via PATH train. The trade-off: you're technically in New Jersey.
          </p>
          <div className="nbhd-grid">
            <Card
              name="Hoboken"
              vibe="Young professionals · Brownstones · Walk to PATH"
              price="$2,200–$4,500/mo"
              description="A one-square-mile city directly across from Midtown Manhattan. Hoboken is dense, walkable, and packed with young professionals who commute into the city. Washington Street is the main commercial strip — bars, brunch spots, and boutiques. Miles of Hudson River waterfront."
              tidbit="PATH trains to World Trade Center run 24/7 and take about 10 minutes. Hoboken is one of the few places where you can pay less than Manhattan, get a bigger apartment, and still have a shorter commute than many Brooklyn renters."
            />
            <Card
              name="Jersey City – Downtown / Paulus Hook"
              vibe="Manhattan views · Luxury · Fast PATH"
              price="$2,400–$5,000/mo"
              description="The Grove Street and Exchange Place corridors have become a mini-Manhattan across the river. Luxury towers with amenities, excellent restaurants, and one of the best skyline views in the metro area. Popular with finance workers who cross to Lower Manhattan daily."
              tidbit="Exchange Place PATH to World Trade Center takes under 5 minutes — faster than most Manhattan subway commutes. The neighborhood has seen significant investment. Light Rail connects to Hoboken and Bayonne."
            />
            <Card
              name="Jersey City – Journal Square"
              vibe="Emerging · Diverse · Affordable"
              price="$1,600–$2,800/mo"
              description="Jersey City's transit hub is undergoing rapid development, with new high-rises and restaurants transforming what was once a purely utilitarian commuter stop. Strong South Asian community, diverse food options, and some of the area's best value."
              tidbit="Journal Square PATH to Midtown Manhattan is direct and takes about 20 minutes. New developments offer Manhattan-style amenities at a significant discount. The area is 5–10 years behind Downtown JC in its transformation."
            />
            <Card
              name="Jersey City Heights"
              vibe="Artsy · Panoramic views · Value"
              price="$1,500–$2,600/mo"
              description="Perched on the Palisades above the rest of Jersey City, the Heights offers some of the most dramatic Manhattan skyline views in the entire metro area — at prices well below anything comparable in NYC itself. Strong arts community, excellent Dominican food scene."
              tidbit="No PATH train directly in Heights — most residents take buses or rideshare to Journal Square or Hoboken. Worth it for the price-to-space ratio if you're a remote worker or don't commute daily. Some of the best value large apartments in the metro area."
            />
          </div>
        </div>

        </PaywallGate>

        <div className="apt-cta">
          <h3>Know your neighborhood?</h3>
          <p>Tell AptPilot where you want to live and we'll search every listing, schedule tours, and handle applications — all for a flat fee.</p>
          <a href="/signup">Start your search →</a>
        </div>

      </div>
    </>
  )
}
