// Geocodes two addresses via Nominatim and returns commute estimates for 5 modes
// Uses haversine distance + NYC-calibrated speed profiles

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

async function geocode(address) {
  // Strip unit/apt numbers — geocoders can't resolve individual apartments
  const clean = address.replace(/,?\s*(apt|apartment|unit|suite|ste|floor|fl|#)\s*[\w-]*/gi, '').trim()
  const q = encodeURIComponent(`${clean}, New York City, NY`)
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=us`
  const res = await fetch(url, { headers: { 'User-Agent': 'AptPilot/1.0 (michael.carracino@compass.com)' } })
  if (!res.ok) throw new Error(`Nominatim returned ${res.status}`)
  const data = await res.json()
  if (!data?.length) return null
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), display: data[0].display_name }
}

function mapsUrl(from, to, mode) {
  const base = 'https://www.google.com/maps/dir/?api=1'
  return `${base}&origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}&travelmode=${mode}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { from, to } = req.body
  if (!from || !to) return res.status(400).json({ error: 'Missing from or to' })

  try {
    const [fromGeo, toGeo] = await Promise.all([geocode(from), geocode(to)])
    if (!fromGeo) return res.status(422).json({ error: `Address not found: "${from}" — try adding the borough (e.g. "245 W 14th St, Manhattan")` })
    if (!toGeo)   return res.status(422).json({ error: `Work address not found: "${to}" — try a more specific address` })

    const km = haversineKm(fromGeo.lat, fromGeo.lon, toGeo.lat, toGeo.lon)
    const miles = km * 0.621371

    // NYC speed profiles (door-to-door avg mph including wait/walk time)
    const WALK_MPH    = 3.0   // viable <1.5 mi
    const BIKE_MPH    = 9.0   // NYC cycling avg
    const TRANSIT_MPH = 12.0  // subway/bus door-to-door avg
    const BUS_MPH     = 7.0   // surface bus slower
    const DRIVE_MPH   = miles < 3 ? 8 : 14  // Manhattan congestion vs outer borough

    const mins = (mph) => Math.round((miles / mph) * 60)

    const modes = [
      {
        id: 'subway',
        label: 'Subway',
        emoji: '🚇',
        minutes: mins(TRANSIT_MPH),
        note: miles > 10 ? 'Long ride — consider express' : null,
        url: mapsUrl(from, to, 'transit'),
      },
      {
        id: 'bus',
        label: 'Bus',
        emoji: '🚌',
        minutes: mins(BUS_MPH),
        note: miles < 1 ? 'Short trip — walking may be faster' : null,
        url: mapsUrl(from, to, 'transit'),
      },
      {
        id: 'bike',
        label: 'Bike',
        emoji: '🚲',
        minutes: mins(BIKE_MPH),
        note: miles > 5 ? 'Far for cycling' : null,
        url: mapsUrl(from, to, 'bicycling'),
      },
      {
        id: 'walk',
        label: 'Walk',
        emoji: '🚶',
        minutes: mins(WALK_MPH),
        practical: miles <= 1.5,
        note: miles > 1.5 ? `${miles.toFixed(1)} mi — not recommended` : null,
        url: mapsUrl(from, to, 'walking'),
      },
      {
        id: 'drive',
        label: 'Drive',
        emoji: '🚗',
        minutes: mins(DRIVE_MPH),
        note: miles < 1 ? 'Very short — parking may take longer' : null,
        url: mapsUrl(from, to, 'driving'),
      },
    ]

    return res.status(200).json({
      from: fromGeo.display,
      to: toGeo.display,
      distanceMiles: parseFloat(miles.toFixed(2)),
      modes,
    })
  } catch (err) {
    console.error('commute error:', err)
    return res.status(500).json({ error: err.message })
  }
}
