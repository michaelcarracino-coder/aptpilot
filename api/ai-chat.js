import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const SYSTEM_PROMPT = `You are the AptPilot support assistant — a knowledgeable, friendly helper for renters navigating the NYC rental market.

AptPilot is a no-broker-fee apartment search service. After a user pays a flat fee, the AptPilot team manually sources listings, contacts agents, and schedules tours on their behalf. Users can upload documents, download a collated PDF application package, and generate an applicant summary sheet from their dashboard.

You help users with:
- Questions about their search status, listings, and tours
- NYC rental process (income requirements, credit, guarantors, applications)
- Document questions (what to upload, why it's needed)
- How AptPilot works
- Neighborhood questions

Tone: concise, warm, professional. Never make up specific details about a user's listings or tour schedule — only reference what's provided in their context. If you don't know something specific to their account, tell them to reach out to the team directly.

Keep responses short — 2-4 sentences unless a detailed answer is clearly needed. Never write walls of text.`

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { userId, message, conversationHistory } = req.body
  if (!userId || !message) return res.status(400).json({ error: 'Missing userId or message' })

  try {
    // Fetch user context
    const [{ data: profile }, { data: search }, { data: listings }, { data: docs }] = await Promise.all([
      supabase.from('profiles').select('full_name').eq('id', userId).single(),
      supabase.from('searches').select('min_budget, max_budget, min_bed, max_bed, move_in, neighborhoods, tier').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single(),
      supabase.from('listings').select('address, status, price').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
      supabase.from('user_documents').select('doc_id, doc_role').eq('user_id', userId),
    ])

    const contextBlock = [
      profile?.full_name ? `User: ${profile.full_name}` : '',
      search ? `Search: $${search.min_budget}–$${search.max_budget}/mo, ${search.min_bed}–${search.max_bed} bed, move-in ${search.move_in || 'ASAP'}, neighborhoods: ${(search.neighborhoods || []).join(', ')}` : '',
      listings?.length ? `Listings (${listings.length}): ${listings.map(l => `${l.address} (${l.status}, $${l.price}/mo)`).join(' | ')}` : 'No listings yet',
      docs?.length ? `Docs uploaded: ${docs.length} files` : 'No documents uploaded yet',
    ].filter(Boolean).join('\n')

    // Build messages array for Claude
    const history = (conversationHistory || []).slice(-10).map(m => ({
      role: m.from_admin ? 'assistant' : 'user',
      content: m.body,
    }))

    const messages = [
      ...history,
      { role: 'user', content: message },
    ]

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: SYSTEM_PROMPT + (contextBlock ? `\n\nUser context:\n${contextBlock}` : ''),
      messages,
    })

    const reply = response.content[0].text

    // Persist both messages to DB
    await supabase.from('messages').insert({ user_id: userId, body: message, from_admin: false })
    const { data: savedReply } = await supabase.from('messages').insert({ user_id: userId, body: reply, from_admin: true }).select().single()

    return res.status(200).json({ reply, messageId: savedReply?.id })
  } catch (err) {
    console.error('AI chat error:', err)
    return res.status(500).json({ error: 'AI response failed' })
  }
}
