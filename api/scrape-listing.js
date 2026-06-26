// Scrapes a StreetEasy listing URL and returns structured listing data
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { url } = req.body
  if (!url || !url.includes('streeteasy.com')) {
    return res.status(400).json({ error: 'Invalid StreetEasy URL' })
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })

    if (!response.ok) return res.status(502).json({ error: 'Could not fetch listing page' })

    const html = await response.text()

    // Extract from JSON-LD structured data
    const jsonLdMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
    let jsonLd = null
    if (jsonLdMatch) {
      try { jsonLd = JSON.parse(jsonLdMatch[1]) } catch {}
    }

    // Extract from meta tags
    const getMeta = (prop) => {
      const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]+content=["']([^"']+)["']`))
        || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${prop}["']`))
      return m?.[1] || ''
    }

    const title = getMeta('og:title') || jsonLd?.name || ''
    const description = getMeta('og:description') || ''

    // Parse address from title — StreetEasy titles are like "245 E 63rd St, Apt 8C in Lenox Hill"
    let address = '', unit = ''
    const addrMatch = title.match(/^([^,|]+?)(?:,\s*(Apt [^,|]+))?(?:\s+in\s+|\s*\|)/i)
    if (addrMatch) {
      address = addrMatch[1].trim()
      unit = addrMatch[2] || ''
    }

    // Parse price — look for "$X,XXX/month" patterns
    let price = ''
    const priceMatch = html.match(/\$([0-9,]+)\s*(?:\/\s*mo|per month|a month)/i)
      || description.match(/\$([0-9,]+)\s*(?:\/\s*mo)/i)
    if (priceMatch) price = priceMatch[1].replace(/,/g, '')

    // Parse beds/baths from description or title
    let bedrooms = '', bathrooms = ''
    const bedMatch = (description + title).match(/(\d+)\s*(?:bed|br|bedroom)/i)
    const bathMatch = (description + title).match(/(\d+(?:\.\d)?)\s*(?:bath|ba|bathroom)/i)
    if (bedMatch) bedrooms = bedMatch[1] + ' bed'
    if (bathMatch) bathrooms = bathMatch[1] + ' bath'

    // Agent info — StreetEasy renders this client-side so it usually won't be in static HTML.
    // We extract what we can from any embedded data blobs.
    let agent_name = '', agent_email = '', agent_phone = ''
    const agentNameMatch = html.match(/"agentName"\s*:\s*"([^"]+)"/)
      || html.match(/data-agent-name="([^"]+)"/)
    if (agentNameMatch) agent_name = agentNameMatch[1]

    const agentPhoneMatch = html.match(/"phone"\s*:\s*"([^"]+)"/)
      || html.match(/data-agent-phone="([^"]+)"/)
    if (agentPhoneMatch) agent_phone = agentPhoneMatch[1]

    // Sqft
    let sqft = ''
    const sqftMatch = (description + html.slice(0, 5000)).match(/([0-9,]+)\s*(?:sq\.?\s*ft|sqft|square feet)/i)
    if (sqftMatch) sqft = sqftMatch[1].replace(/,/g, '') + ' sqft'

    return res.status(200).json({
      address,
      unit,
      price,
      bedrooms,
      bathrooms,
      sqft,
      agent_name,
      agent_email,
      agent_phone,
      listing_url: url,
    })
  } catch (err) {
    console.error('Scrape error:', err)
    return res.status(500).json({ error: 'Failed to scrape listing' })
  }
}
