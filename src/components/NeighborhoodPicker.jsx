import { useState } from 'react'

export const BOROUGH_NEIGHBORHOODS = {
  Manhattan: [
    'Battery Park City','Financial District','TriBeCa','SoHo','NoHo','Little Italy','Chinatown',
    'Lower East Side','East Village','West Village','Greenwich Village','NoMad','Flatiron',
    'Chelsea','Hell\'s Kitchen','Midtown','Murray Hill','Kips Bay','Gramercy','Stuyvesant Town',
    'Upper East Side','Upper West Side','Lincoln Square','Morningside Heights',
    'Harlem','East Harlem','Washington Heights','Inwood',
  ],
  Brooklyn: [
    'Williamsburg','Greenpoint','DUMBO','Brooklyn Heights','Cobble Hill','Carroll Gardens',
    'Boerum Hill','Fort Greene','Clinton Hill','Park Slope','Prospect Heights','Crown Heights',
    'Bushwick','Bed-Stuy','Flatbush','Sunset Park','Bay Ridge','Bensonhurst','Coney Island',
    'Brighton Beach','Sheepshead Bay','Canarsie','East New York','Red Hook',
  ],
  Queens: [
    'Astoria','Long Island City','Sunnyside','Woodside','Jackson Heights','Elmhurst',
    'Forest Hills','Rego Park','Flushing','Bayside','Jamaica','Richmond Hill',
    'Howard Beach','Far Rockaway','Ridgewood','Maspeth','Middle Village',
  ],
  Bronx: [
    'Riverdale','Kingsbridge','Fordham','University Heights','Concourse','South Bronx',
    'Mott Haven','Hunts Point','Pelham Bay','Throgs Neck','Co-op City','Morris Park',
  ],
  NJ: ['Jersey City','Hoboken'],
}

const BOROUGH_COLORS = {
  Manhattan: { bg:'#EFF6FF', active:'#2563EB', text:'#2563EB' },
  Brooklyn:  { bg:'#F0FDF4', active:'#16A34A', text:'#16A34A' },
  Queens:    { bg:'#FFF7ED', active:'#EA580C', text:'#EA580C' },
  Bronx:     { bg:'#FDF4FF', active:'#9333EA', text:'#9333EA' },
  NJ:        { bg:'#FFF1F2', active:'#E11D48', text:'#E11D48' },
}

export default function NeighborhoodPicker({ value = [], onChange }) {
  const [openBorough, setOpenBorough] = useState(null)

  function toggle(n) {
    onChange(value.includes(n) ? value.filter(x => x !== n) : [...value, n])
  }

  function toggleBorough(borough) {
    setOpenBorough(prev => prev === borough ? null : borough)
  }

  const boroughs = Object.keys(BOROUGH_NEIGHBORHOODS)

  return (
    <div>
      {/* Borough pills */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem', marginBottom:'0.75rem' }}>
        {boroughs.map(b => {
          const c = BOROUGH_COLORS[b]
          const isOpen = openBorough === b
          const selectedCount = BOROUGH_NEIGHBORHOODS[b].filter(n => value.includes(n)).length
          return (
            <button
              key={b}
              type="button"
              onClick={() => toggleBorough(b)}
              style={{
                fontSize:'0.82rem', fontWeight:700, fontFamily:'inherit',
                padding:'0.4rem 1rem', borderRadius:100, border:'1.5px solid',
                cursor:'pointer', transition:'all 0.15s',
                background: isOpen ? c.active : c.bg,
                color: isOpen ? '#fff' : c.text,
                borderColor: isOpen ? c.active : c.active + '55',
                display:'flex', alignItems:'center', gap:'0.35rem',
              }}
            >
              {b}
              {selectedCount > 0 && (
                <span style={{
                  background: isOpen ? 'rgba(255,255,255,0.3)' : c.active,
                  color: '#fff', fontSize:'0.68rem', fontWeight:800,
                  borderRadius:100, padding:'0 0.4rem', lineHeight:'1.5',
                }}>
                  {selectedCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Neighborhood list for open borough */}
      {openBorough && (
        <div style={{
          background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:10,
          padding:'0.85rem', marginBottom:'0.75rem',
          display:'flex', flexWrap:'wrap', gap:'0.35rem',
        }}>
          {BOROUGH_NEIGHBORHOODS[openBorough].map(n => {
            const sel = value.includes(n)
            return (
              <button
                key={n}
                type="button"
                onClick={() => toggle(n)}
                style={{
                  fontSize:'0.78rem', fontWeight:600, fontFamily:'inherit',
                  padding:'0.25rem 0.7rem', borderRadius:100, border:'1.5px solid',
                  cursor:'pointer', transition:'all 0.12s',
                  background: sel ? 'var(--teal-pale)' : '#fff',
                  color: sel ? 'var(--teal)' : 'var(--slate)',
                  borderColor: sel ? 'var(--teal)' : '#CBD5E1',
                }}
              >
                {sel ? '✓ ' : ''}{n}
              </button>
            )
          })}
        </div>
      )}

      {/* Selected chips */}
      {value.length > 0 && (
        <div style={{ display:'flex', flexWrap:'wrap', gap:'0.35rem' }}>
          {value.map(n => (
            <span
              key={n}
              onClick={() => toggle(n)}
              style={{
                fontSize:'0.75rem', fontWeight:600, padding:'0.2rem 0.6rem',
                borderRadius:100, background:'var(--navy)', color:'#fff',
                cursor:'pointer', display:'flex', alignItems:'center', gap:'0.3rem',
              }}
            >
              {n} <span style={{ opacity:0.6, fontSize:'0.8rem' }}>×</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
