// Returns group members with their doc upload status for the calling user's group
const TENANT_REQUIRED = ['t1','t2','t3','t4']
const GUARANTOR_REQUIRED = ['g1','g2','g3','g4','g5']

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const userId = req.query.userId
    if (!userId) return res.status(400).json({ error: 'Missing userId' })

    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

    // Find the group this user belongs to
    const { data: membership } = await supabase
      .from('group_members').select('group_id').eq('user_id', userId).single()
    if (!membership) return res.status(200).json({ members: [] })

    // Get all members of the group
    const { data: members } = await supabase
      .from('group_members')
      .select('user_id, role, joined_at')
      .eq('group_id', membership.group_id)
      .order('joined_at', { ascending: true })

    if (!members?.length) return res.status(200).json({ members: [] })

    // Fetch profiles for all members
    const userIds = members.map(m => m.user_id)
    const { data: profiles } = await supabase
      .from('profiles').select('id, full_name, email').in('id', userIds)

    // Fetch doc records for all members
    const { data: allDocs } = await supabase
      .from('user_documents').select('user_id, doc_id, doc_role').in('user_id', userIds)

    const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]))

    const result = members.map(m => {
      const profile = profileMap[m.user_id] || {}
      const userDocs = (allDocs || []).filter(d => d.user_id === m.user_id)

      // Determine doc role from what they uploaded (tenant, guarantor, or both)
      const hasTenantDocs = userDocs.some(d => d.doc_role === 'tenant')
      const hasGuarantorDocs = userDocs.some(d => d.doc_role === 'guarantor')
      const docRole = hasTenantDocs && hasGuarantorDocs ? 'both'
        : hasTenantDocs ? 'tenant'
        : hasGuarantorDocs ? 'guarantor'
        : null

      // Doc status per role
      function roleStatus(requiredIds, role) {
        const uploaded = userDocs.filter(d => d.doc_role === role).map(d => d.doc_id)
        const uploadedRequired = requiredIds.filter(id => uploaded.includes(id))
        if (uploadedRequired.length === 0) return { status: 'incomplete', uploaded: 0, total: requiredIds.length }
        if (uploadedRequired.length < requiredIds.length) return { status: 'partial', uploaded: uploadedRequired.length, total: requiredIds.length }
        return { status: 'complete', uploaded: uploadedRequired.length, total: requiredIds.length }
      }

      return {
        userId: m.user_id,
        groupRole: m.role,   // owner | member
        name: profile.full_name || profile.email || 'Unknown',
        email: profile.email,
        docRole,
        tenant: hasTenantDocs ? roleStatus(TENANT_REQUIRED, 'tenant') : null,
        guarantor: hasGuarantorDocs ? roleStatus(GUARANTOR_REQUIRED, 'guarantor') : null,
      }
    })

    return res.status(200).json({ members: result, groupId: membership.group_id })
  } catch (err) {
    console.error('group-status error:', err)
    return res.status(500).json({ error: err.message })
  }
}
