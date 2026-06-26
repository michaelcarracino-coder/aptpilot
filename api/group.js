import crypto from 'crypto'

const TENANT_REQUIRED = ['t1','t2','t3','t4']
const GUARANTOR_REQUIRED = ['g1','g2','g3','g4','g5']

async function handleStatus(req, res, supabase) {
  const userId = req.query.userId
  if (!userId) return res.status(400).json({ error: 'Missing userId' })

  const { data: membership } = await supabase
    .from('group_members').select('group_id').eq('user_id', userId).single()
  if (!membership) return res.status(200).json({ members: [] })

  const { data: members } = await supabase
    .from('group_members')
    .select('user_id, role, joined_at')
    .eq('group_id', membership.group_id)
    .order('joined_at', { ascending: true })

  if (!members?.length) return res.status(200).json({ members: [] })

  const userIds = members.map(m => m.user_id)
  const { data: profiles } = await supabase
    .from('profiles').select('id, full_name, email').in('id', userIds)

  const { data: allDocs } = await supabase
    .from('user_documents').select('user_id, doc_id, doc_role').in('user_id', userIds)

  const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]))

  const result = members.map(m => {
    const profile = profileMap[m.user_id] || {}
    const userDocs = (allDocs || []).filter(d => d.user_id === m.user_id)

    const hasTenantDocs = userDocs.some(d => d.doc_role === 'tenant')
    const hasGuarantorDocs = userDocs.some(d => d.doc_role === 'guarantor')
    const docRole = hasTenantDocs && hasGuarantorDocs ? 'both'
      : hasTenantDocs ? 'tenant'
      : hasGuarantorDocs ? 'guarantor'
      : null

    function roleStatus(requiredIds, role) {
      const uploaded = userDocs.filter(d => d.doc_role === role).map(d => d.doc_id)
      const uploadedRequired = requiredIds.filter(id => uploaded.includes(id))
      if (uploadedRequired.length === 0) return { status: 'incomplete', uploaded: 0, total: requiredIds.length }
      if (uploadedRequired.length < requiredIds.length) return { status: 'partial', uploaded: uploadedRequired.length, total: requiredIds.length }
      return { status: 'complete', uploaded: uploadedRequired.length, total: requiredIds.length }
    }

    return {
      userId: m.user_id,
      groupRole: m.role,
      name: profile.full_name || profile.email || 'Unknown',
      email: profile.email,
      docRole,
      tenant: hasTenantDocs ? roleStatus(TENANT_REQUIRED, 'tenant') : null,
      guarantor: hasGuarantorDocs ? roleStatus(GUARANTOR_REQUIRED, 'guarantor') : null,
    }
  })

  return res.status(200).json({ members: result, groupId: membership.group_id })
}

async function handleInvite(req, res, supabase) {
  const { inviterUserId, inviterName, inviterEmail, emails } = req.body
  if (!inviterUserId || !emails?.length) return res.status(400).json({ error: 'Missing fields' })

  let groupId
  const { data: existingMember } = await supabase
    .from('group_members').select('group_id').eq('user_id', inviterUserId).eq('role', 'owner').single()

  if (existingMember) {
    groupId = existingMember.group_id
  } else {
    const { data: newGroup, error: gErr } = await supabase
      .from('groups').insert({ owner_id: inviterUserId }).select('id').single()
    if (gErr) throw gErr
    groupId = newGroup.id
    await supabase.from('group_members').insert({ group_id: groupId, user_id: inviterUserId, role: 'owner' })
  }

  const results = []
  for (const email of emails) {
    const token = crypto.randomBytes(24).toString('hex')
    const siteUrl = process.env.SITE_URL || 'https://aptpilot.vercel.app'
    const joinUrl = `${siteUrl}/join?token=${token}`

    await supabase.from('group_invites').insert({
      group_id: groupId, email, token, invited_by: inviterUserId,
    })

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'AptPilot <onboarding@resend.dev>',
        to: [email],
        subject: `${inviterName || 'Someone'} invited you to their AptPilot apartment search`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:2rem;background:#F2F5FA;">
            <div style="background:#0C1628;border-radius:14px;padding:2rem;margin-bottom:1.25rem;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:0.5rem;margin-bottom:1.25rem;">
                <div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#0ABFBF,#00E5CC);display:inline-flex;align-items:center;justify-content:center;font-weight:900;color:#0C1628;font-size:0.95rem;">A</div>
                <span style="font-family:Georgia,serif;font-size:1.15rem;font-weight:700;color:#fff;">Apt<span style="color:#0ABFBF;">Pilot</span></span>
              </div>
              <h1 style="color:#fff;font-family:Georgia,serif;font-size:1.5rem;margin:0 0 0.4rem;">You've been invited</h1>
              <p style="color:rgba(255,255,255,0.5);font-size:0.85rem;margin:0;">Join ${inviterName || inviterEmail}'s apartment search group</p>
            </div>
            <div style="background:#fff;border-radius:12px;padding:1.5rem;margin-bottom:1rem;">
              <p style="color:#6B7FA0;font-size:0.9rem;line-height:1.7;margin:0 0 1.25rem;">
                <strong style="color:#0C1628;">${inviterName || inviterEmail}</strong> is using AptPilot to find an apartment in NYC and has added you to their group.
              </p>
              <a href="${joinUrl}" style="display:block;text-align:center;background:#0ABFBF;color:#0C1628;font-weight:700;padding:0.9rem 2rem;border-radius:100px;text-decoration:none;font-size:0.95rem;">
                Join the Group →
              </a>
            </div>
            <p style="color:#94A3B8;font-size:0.77rem;text-align:center;margin:0;">If you didn't expect this, you can safely ignore it.</p>
          </div>
        `,
      }),
    })

    results.push({ email, token })
  }

  return res.status(200).json({ success: true, groupId, invited: results.length })
}

async function handleJoin(req, res, supabase) {
  const { token, userId } = req.body
  if (!token || !userId) return res.status(400).json({ error: 'Missing fields' })

  const { data: invite, error: invErr } = await supabase
    .from('group_invites').select('*').eq('token', token).single()
  if (invErr || !invite) return res.status(404).json({ error: 'Invalid or expired invite link' })
  if (invite.accepted_at) return res.status(400).json({ error: 'This invite has already been used' })

  await supabase.from('group_members').upsert({ group_id: invite.group_id, user_id: userId, role: 'member' })
  await supabase.from('group_invites').update({ accepted_at: new Date().toISOString() }).eq('id', invite.id)

  return res.status(200).json({ success: true, groupId: invite.group_id })
}

export default async function handler(req, res) {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

    const action = req.query.action || req.body?.action

    if (req.method === 'GET' || action === 'status') return await handleStatus(req, res, supabase)
    if (action === 'invite') return await handleInvite(req, res, supabase)
    if (action === 'join') return await handleJoin(req, res, supabase)

    return res.status(400).json({ error: 'Unknown action' })
  } catch (err) {
    console.error('group error:', err)
    return res.status(500).json({ error: err.message })
  }
}
