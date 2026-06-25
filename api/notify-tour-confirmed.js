export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { listing, userEmail, userName, searchId, scheduledAt } = req.body
    if (!userEmail || !listing || !searchId) return res.status(400).json({ error: 'Missing fields' })

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

    // Mark listing confirmed and save time to the tours row
    await supabase.from('listings').update({ status: 'confirmed' }).eq('id', listing.id)

    if (scheduledAt) {
      const { data: existing } = await supabase
        .from('tours').select('id').eq('listing_id', listing.id).single()
      if (existing) {
        await supabase.from('tours')
          .update({ status: 'confirmed', scheduled_at: scheduledAt })
          .eq('id', existing.id)
      } else {
        await supabase.from('tours').insert({
          listing_id: listing.id,
          search_id: searchId,
          user_id: listing.user_id,
          status: 'confirmed',
          scheduled_at: scheduledAt,
        })
      }
    }

    // Fetch all confirmed tours for this search (including the one just confirmed)
    const { data: confirmedTours } = await supabase
      .from('tours')
      .select('*, listings(*)')
      .eq('search_id', searchId)
      .eq('status', 'confirmed')
      .order('scheduled_at', { ascending: true })

    const tours = confirmedTours || []

    // Send the agenda email
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'AptPilot <onboarding@resend.dev>',
        to: [userEmail],
        subject: tours.length === 1
          ? `Tour confirmed: ${listing.address}${listing.unit ? ', ' + listing.unit : ''}`
          : `Your tour agenda is ready — ${tours.length} tours confirmed`,
        html: buildAgendaEmail({ tours, userName, totalConfirmed: tours.length }),
      }),
    })

    return res.status(200).json({ success: true, toursInAgenda: tours.length })
  } catch (err) {
    console.error('Tour confirm error:', err)
    return res.status(500).json({ error: err.message })
  }
}

function formatDateTime(iso) {
  if (!iso) return null
  const d = new Date(iso)
  const date = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  return { date, time, full: `${date} at ${time}` }
}

function mapsUrl(address, unit) {
  const q = encodeURIComponent(`${address}${unit ? ' ' + unit : ''}, New York, NY`)
  return `https://www.google.com/maps/search/?api=1&query=${q}`
}

function buildAgendaEmail({ tours, userName, totalConfirmed }) {
  const firstName = userName?.split(' ')[0] || 'there'

  const tourBlocks = tours.map((t, i) => {
    const l = t.listings
    if (!l) return ''
    const address = `${l.address}${l.unit ? ', ' + l.unit : ''}`
    const dt = formatDateTime(t.scheduled_at)
    const maps = mapsUrl(l.address, l.unit)

    return `
      <div style="margin-bottom:1.25rem;border-radius:14px;overflow:hidden;border:1.5px solid #E8EDF5;">
        <!-- Tour header -->
        <div style="background:#0C1628;padding:1rem 1.25rem;display:flex;align-items:center;justify-content:space-between;gap:1rem;">
          <div style="display:flex;align-items:center;gap:0.75rem;">
            <div style="width:32px;height:32px;border-radius:50%;background:#0ABFBF;color:#0C1628;font-weight:700;font-size:0.88rem;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${i + 1}</div>
            <div>
              <div style="color:#fff;font-weight:700;font-size:0.95rem;">${address}</div>
              ${dt ? `<div style="color:#0ABFBF;font-size:0.8rem;margin-top:0.15rem;">${dt.date} · ${dt.time}</div>` : '<div style="color:rgba(255,255,255,0.4);font-size:0.8rem;margin-top:0.15rem;">Time TBD</div>'}
            </div>
          </div>
          ${l.price ? `<div style="font-family:Georgia,serif;font-size:1.2rem;color:#0ABFBF;font-weight:700;white-space:nowrap;">$${Number(l.price).toLocaleString()}<span style="font-family:sans-serif;font-size:0.72rem;color:rgba(255,255,255,0.4);font-weight:400;">/mo</span></div>` : ''}
        </div>
        <!-- Tour details -->
        <div style="background:#fff;padding:1rem 1.25rem;">
          <table style="width:100%;border-collapse:collapse;font-size:0.84rem;">
            ${l.bedrooms ? `<tr><td style="color:#6B7FA0;padding:0.28rem 0;width:110px;">Size</td><td style="color:#0C1628;font-weight:600;">${l.bedrooms}${l.bathrooms ? ' · ' + l.bathrooms : ''}${l.sqft ? ' · ' + l.sqft + ' sqft' : ''}</td></tr>` : ''}
            ${l.agent_name ? `<tr><td style="color:#6B7FA0;padding:0.28rem 0;">Agent</td><td style="color:#0C1628;font-weight:600;">${l.agent_name}${l.agent_phone ? ' · ' + l.agent_phone : ''}</td></tr>` : ''}
            ${l.notes ? `<tr><td style="color:#6B7FA0;padding:0.28rem 0;">Notes</td><td style="color:#0C1628;">${l.notes}</td></tr>` : ''}
          </table>
          <div style="margin-top:0.85rem;display:flex;gap:0.6rem;flex-wrap:wrap;">
            <a href="${maps}" style="display:inline-block;background:#F2F5FA;color:#0C1628;font-size:0.78rem;font-weight:600;padding:0.4rem 0.85rem;border-radius:100px;text-decoration:none;">📍 Get Directions</a>
            ${l.listing_url ? `<a href="${l.listing_url}" style="display:inline-block;background:#F2F5FA;color:#0C1628;font-size:0.78rem;font-weight:600;padding:0.4rem 0.85rem;border-radius:100px;text-decoration:none;">🔗 View Listing</a>` : ''}
          </div>
        </div>
      </div>
    `
  }).join('')

  // Group tours by date for the summary line
  const dates = [...new Set(tours.map(t => {
    if (!t.scheduled_at) return null
    return new Date(t.scheduled_at).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  }).filter(Boolean))]

  const summaryLine = dates.length === 1
    ? `${totalConfirmed} tour${totalConfirmed !== 1 ? 's' : ''} on ${dates[0]}`
    : `${totalConfirmed} tour${totalConfirmed !== 1 ? 's' : ''} across ${dates.length} days`

  return `
    <div style="font-family:sans-serif;max-width:580px;margin:0 auto;padding:2rem;background:#F2F5FA;">

      <!-- Header -->
      <div style="background:#0C1628;border-radius:16px;padding:2rem;margin-bottom:1.25rem;text-align:center;">
        <div style="display:inline-flex;align-items:center;gap:0.5rem;margin-bottom:1.25rem;">
          <div style="width:34px;height:34px;border-radius:9px;background:linear-gradient(135deg,#0ABFBF,#00E5CC);display:flex;align-items:center;justify-content:center;font-weight:900;color:#0C1628;font-size:1rem;">A</div>
          <span style="font-family:Georgia,serif;font-size:1.2rem;font-weight:700;color:#fff;">Apt<span style="color:#0ABFBF;">Pilot</span></span>
        </div>
        <h1 style="color:#fff;font-family:Georgia,serif;font-size:1.85rem;margin:0 0 0.5rem;line-height:1.2;">Your tour agenda is ready.</h1>
        <p style="color:#0ABFBF;margin:0;font-size:0.88rem;font-weight:600;">${summaryLine}</p>
      </div>

      <!-- Intro -->
      <p style="color:#6B7FA0;font-size:0.9rem;line-height:1.7;margin:0 0 1.25rem;">
        Hi ${firstName} — here's your complete tour agenda. All confirmed stops are listed below in order. Save this email so you have everything you need on tour day.
      </p>

      <!-- Tour blocks -->
      ${tourBlocks}

      <!-- Tips box -->
      <div style="background:#fff;border-radius:12px;padding:1.1rem 1.25rem;margin-bottom:1.25rem;border:1.5px solid #E8EDF5;">
        <p style="font-weight:700;color:#0C1628;font-size:0.85rem;margin:0 0 0.6rem;">Tips for tour day</p>
        <ul style="margin:0;padding-left:1.25rem;color:#6B7FA0;font-size:0.82rem;line-height:1.8;">
          <li>Bring a government-issued ID to every showing</li>
          <li>Take photos and note anything that needs repair</li>
          <li>Ask the agent about utilities, move-in fees, and lease length</li>
          <li>If you love an apartment, let us know — we'll submit your application the same day</li>
        </ul>
      </div>

      <!-- CTA -->
      <a href="https://aptpilot.vercel.app/dashboard" style="display:block;text-align:center;background:#0ABFBF;color:#0C1628;font-weight:700;padding:0.9rem 2rem;border-radius:100px;text-decoration:none;font-size:0.95rem;margin-bottom:1rem;">View Live Dashboard →</a>

      <p style="color:#94A3B8;font-size:0.77rem;text-align:center;margin:0;">
        More tours may be added as agents respond. Your dashboard always has the latest.
        <br>Questions? Reply to this email.
      </p>
    </div>
  `
}
