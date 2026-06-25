export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { token, userId } = req.body
    if (!token || !userId) return res.status(400).json({ error: 'Missing fields' })

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

    const { data: invite, error: invErr } = await supabase
      .from('group_invites').select('*').eq('token', token).single()
    if (invErr || !invite) return res.status(404).json({ error: 'Invalid or expired invite link' })
    if (invite.accepted_at) return res.status(400).json({ error: 'This invite has already been used' })

    // Add to group
    await supabase.from('group_members').upsert({ group_id: invite.group_id, user_id: userId, role: 'member' })

    // Mark accepted
    await supabase.from('group_invites').update({ accepted_at: new Date().toISOString() }).eq('id', invite.id)

    return res.status(200).json({ success: true, groupId: invite.group_id })
  } catch (err) {
    console.error('join-group error:', err)
    return res.status(500).json({ error: err.message })
  }
}
