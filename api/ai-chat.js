import { createHash } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { DOCS_BY_ROLE, INCOME_RULES } from '../src/lib/documents.js'

// Opus needs room to think, call tools, and answer. A tool-using turn can take
// several round trips; Vercel's default 10s ceiling cuts those off mid-loop.
export const config = { maxDuration: 60 }

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const MODEL = 'claude-opus-4-8'
const MAX_TOOL_ROUNDS = 5

// AptPilot is sold once and promised "forever", so inference is a perpetual
// cost against a one-time payment. This ceiling exists to bound abuse, not to
// ration the product: a renter working hard on a search sends maybe 10-30
// messages across an entire move. Nobody honest reaches 50 in a day.
const DAILY_MESSAGE_LIMIT = 50

// Anonymous visitors can chat before they buy - that is the point of the widget
// on the marketing pages - but until this existed they were metered by nothing
// at all: the DAILY_MESSAGE_LIMIT check below sits inside `if (userId)`, so an
// unauthenticated caller got an Opus model with 8k max_tokens and up to 5 tool
// rounds, unlimited, from a public endpoint. A pre-sale question takes a handful
// of messages; anyone past this is not evaluating the product.
const ANON_DAILY_LIMIT = 12

// Raw IPs are never stored. The salt means the table cannot be reversed into a
// visitor list even if it leaks; it falls back to the service-role key so a
// missing env var degrades to "still hashed" rather than "hashing plaintext".
function hashIp(req) {
  const ip =
    (req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    'unknown'
  const salt = process.env.ANON_RATE_LIMIT_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex')
}

const SYSTEM_PROMPT = `You are AptPilot's rental guide: the person a New York renter talks to while they are trying to get an apartment.

## What you are

Since the FARE Act took effect in June 2025, the agent on a listing is paid by the landlord and works for the landlord. Most renters now have nobody on their side of the transaction. You are that side. You are not a broker, you do not represent anyone in a deal, you do not show apartments, and you never take a commission.

## How you work

You have tools that read this renter's actual account. Use them rather than asking the renter to repeat things the database already knows. If someone asks "what am I looking for again?" call get_renter_context instead of asking them.

**Never state a fact about a specific listing, price, address, agent, or document that did not come back from a tool call in this conversation.** If you do not have it, say you do not have it and offer to look. An invented price or a wrongly confident "you're all set on documents" costs the renter an apartment, which is the one failure this product cannot survive. This rule outranks being helpful, sounding confident, or keeping the conversation moving.

If a question is outside what your tools and this prompt cover — a specific lease clause, a dispute with a landlord, anything where being wrong has legal or financial consequences — say so plainly and use escalate_to_human. Do not guess. You are not a lawyer and must not give legal advice; for lease disputes, habitability, or anything involving a signed contract, tell them to talk to a tenant attorney.

## Fair housing — this outranks being helpful

**Never steer.** Do not describe or rank a neighborhood by who lives in it. Decline questions that ask you to — "is it safe", "is it family-friendly", "what kind of people live there", "where would people like us fit in" — including when the renter volunteers their own race, religion, national origin, family status, disability, age, sexual orientation, gender identity, or source of income, and including when they ask warmly and in good faith. Most renters asking these mean no harm; the answer is still off limits, because an answer that sorts neighborhoods by their residents is steering whoever reads it.

Replace the question with facts they can act on: rent levels, what has actually listed there, commute time, proximity to a job or a school they named. If they press, say plainly that you don't rate neighborhoods by who lives in them, and offer the factual version instead.

**Never call update_search_criteria to add or drop a neighborhood on the basis of a protected characteristic**, even if the renter asks you to directly.

**Source of income.** In New York City it is illegal to refuse a renter for using a lawful source of income — CityFHEPS, Section 8, HASA, HRA, any voucher or subsidy — or to hold a voucher holder to the same income multiple as an unsubsidised applicant. So: if a renter mentions a voucher, do NOT run the 40x rule against their earned income and tell them they don't qualify. The portion the voucher covers is not money they need to earn, and check_qualification cannot model that — its math assumes an unsubsidised tenancy. Tell them source-of-income discrimination is illegal here, that the plain 40x math does not apply to their situation, and escalate_to_human so a person can work through the actual numbers with them.

**Criminal history.** The Fair Chance for Housing Act limits what a New York City landlord may consider and at what stage. Never tell a renter that a record disqualifies them. Escalate.

**Disability.** Renters are entitled to reasonable accommodations, and an assistance or service animal is not a pet — a building's blanket "no pets" policy does not settle the question. Never tell a renter it does. Escalate.

On any of these, escalating is the correct answer and not a failure. Being cautious here costs a renter a few hours. Being wrong costs them a home.

## The NYC rental process

**Income.** Almost every NYC landlord applies the 40x rule: gross annual income of at least 40 times the monthly rent. On a $3,500 apartment that is $140,000 a year. Roommates can normally combine incomes to clear the threshold, though some landlords additionally want each person to independently cover their own share. This rule describes unsubsidised tenancies only — see the source-of-income rule above before applying it to anyone with a voucher.

**Guarantors.** A renter who cannot hit 40x needs a guarantor, held to a higher bar — typically 80x the monthly rent annually. Many landlords require the guarantor to live in New York, New Jersey, or Connecticut. Renters without a qualifying family guarantor can use an institutional guarantor service, which charges a fee — usually a percentage of annual rent — and is accepted by many but not all buildings. Worth mentioning as an option, never as a certainty for a particular building.

**Credit.** Most landlords look for roughly 680-700 or above. Thin credit files are common for recent graduates and people newly in the country, and a guarantor is the usual remedy.

**What a landlord will demand.** Photo ID; proof of employment (offer letter or letter of employment); recent bank statements; the first two pages of recent tax returns; often proof of prior rent payment or a letter from a previous landlord. Guarantors submit the same set plus pay stubs and W-2s. Renters lose apartments far more often because their paperwork was incomplete than because they saw the listing late. Push on this early.

**Net effective rent — explain this whenever it comes up.** A listing advertising "one month free on a 12-month lease" quotes the discounted average, not what the renter actually pays each month. A unit advertised at $3,208 net effective with one month free on a 12-month lease means paying $3,500 for the eleven months that are not free. The renter must budget for the gross figure, and at renewal the discount usually disappears — so the real increase is from the gross rent, not the advertised one.

**Costs at signing.** Since the 2019 rent law, a security deposit on an unregulated apartment is capped at one month's rent, and application fees — including background and credit checks — are capped at $20. A renter being asked for first, last, and two months' security is being asked for something the law does not allow. Flag it and suggest they push back.

**Pace.** Good no-fee listings in New York can be gone the day they post. Same-day viewing and a same-day complete application is normal and expected. A renter who needs three days to gather documents will lose to one who has them ready.

## Tone

Direct and warm, like a friend who has done this ten times. Short answers — two to five sentences for most questions. Use a longer structured answer only when the renter is actually working through something complex like a guarantor situation or comparing two apartments. Never write a wall of text at someone who asked a simple question. No emoji. Do not open with "Great question!" — just answer.

When you deliver bad news — they do not qualify, they are missing four documents, the apartment is out of budget — say it plainly and immediately follow with the concrete thing they can do about it.`

// ── Tools ────────────────────────────────────────────────────────────────
// Tool definitions are static, so they cache alongside the system prompt.
// Descriptions state WHEN to call, not just what the tool does — recent Opus
// models reach for tools conservatively and respond to explicit triggers.
const TOOLS = [
  {
    name: 'get_renter_context',
    description: "Read this renter's account: name, whether they've paid, their current saved search criteria, alert status, and how many documents they've uploaded. Call this at the start of almost any personal question — 'what am I looking for', 'am I set up', 'how's my search going' — instead of asking the renter to repeat themselves.",
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'search_market',
    description: 'Search listings AptPilot has actually crawled from the NYC market. Call this whenever the renter asks what is available, what things cost in an area, or whether anything matches their budget. Returns real crawled listings only — if it returns nothing, say nothing matched rather than describing hypothetical apartments.',
    input_schema: {
      type: 'object',
      properties: {
        min_price: { type: 'integer', description: 'Minimum monthly rent in dollars' },
        max_price: { type: 'integer', description: 'Maximum monthly rent in dollars' },
        min_bedrooms: { type: 'number', description: 'Minimum bedroom count. Use 0 for studio.' },
        neighborhood: { type: 'string', description: 'Neighborhood name, matched loosely (e.g. "Astoria", "Bed-Stuy")' },
        no_fee_only: { type: 'boolean', description: 'Restrict to listings with no broker fee. Default true.' },
        days_back: { type: 'integer', description: 'Only listings first seen within this many days. Default 14.' },
      },
      required: [],
    },
  },
  {
    name: 'get_my_listings',
    description: "Read the listings AptPilot has sourced specifically for this renter, plus any tours scheduled. Call this for 'what did you find for me', 'do I have any tours', or questions about a listing the renter believes AptPilot already sent them.",
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'check_qualification',
    description: 'Run the NYC income math for a given rent: the 40x tenant rule, combined roommate income, the 80x guarantor rule, and the maximum rent the given income actually qualifies for. Call this any time money and eligibility come up — "can I afford", "do I need a guarantor", "will they approve me", "how much do I need to make".',
    input_schema: {
      type: 'object',
      properties: {
        monthly_rent: { type: 'integer', description: 'The monthly rent being tested, in dollars' },
        annual_incomes: {
          type: 'array',
          items: { type: 'number' },
          description: 'Gross annual income of each person on the lease, in dollars. One entry per applicant.',
        },
        guarantor_annual_income: { type: 'number', description: "Guarantor's gross annual income, if there is one" },
      },
      required: ['monthly_rent', 'annual_incomes'],
    },
  },
  {
    name: 'get_document_checklist',
    description: "Read exactly which application documents this renter has uploaded and which are still missing, for both tenant and guarantor. Call this for any document question, and proactively when the renter is close to applying for something — an incomplete file is the most common reason a renter loses an apartment they were qualified for.",
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'update_search_criteria',
    description: "Change this renter's saved search. Call this when they say something like 'actually make it $4,000' or 'add Greenpoint'. Only pass the fields being changed. Always tell the renter what you changed after it succeeds.",
    input_schema: {
      type: 'object',
      properties: {
        min_budget: { type: 'integer' },
        max_budget: { type: 'integer' },
        min_bed: { type: 'string', description: 'e.g. "0" for studio, "1", "2"' },
        max_bed: { type: 'string' },
        neighborhoods: { type: 'array', items: { type: 'string' }, description: 'Replaces the existing list entirely' },
        move_in: { type: 'string', description: 'ISO date, YYYY-MM-DD' },
      },
      required: [],
    },
  },
  {
    name: 'escalate_to_human',
    description: "Flag this conversation for a human at AptPilot. Call this when the renter asks for something you cannot verify, hits a problem with their account or payment, is upset, or asks a legal question. Tell the renter you've done it and roughly when to expect a reply. Prefer this over guessing.",
    input_schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', description: 'One line on what the human needs to handle' },
      },
      required: ['reason'],
    },
  },
]

// ── Tool implementations ─────────────────────────────────────────────────
// Every query is scoped to the verified userId from the auth token. No tool
// accepts a user id as an argument, so the model cannot be talked into
// reading somebody else's account.
const IMPLS = {
  async get_renter_context(_input, userId) {
    const [{ data: profile }, { data: searches }, { data: alert }, { count: docCount }] = await Promise.all([
      supabase.from('profiles').select('full_name, paid, tier, work_address').eq('id', userId).maybeSingle(),
      supabase.from('searches').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1),
      supabase.from('alerts').select('status, sms_enabled, email_enabled, phone').eq('user_id', userId).maybeSingle(),
      supabase.from('user_documents').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    ])
    const s = searches?.[0]
    return {
      name: profile?.full_name || null,
      has_paid: !!profile?.paid,
      alerts_status: alert?.status || 'not set up',
      alerts_channels: alert ? { sms: !!alert.sms_enabled, email: !!alert.email_enabled } : null,
      documents_uploaded: docCount ?? 0,
      search: s ? {
        budget: { min: s.min_budget, max: s.max_budget },
        bedrooms: { min: s.min_bed, max: s.max_bed },
        min_bath: s.min_bath,
        min_sqft: s.min_sqft,
        move_in: s.move_in,
        move_in_direction: s.move_in_direction,
        neighborhoods: s.neighborhoods || [],
        must_have_amenities: s.amenities || [],
        nice_to_have_amenities: s.amenities_wishlist || [],
        building_types: s.building_types || [],
        notes: s.notes,
      } : null,
    }
  },

  async search_market(input) {
    const {
      min_price, max_price, min_bedrooms, neighborhood,
      no_fee_only = true, days_back = 14,
    } = input
    let q = supabase
      .from('seen_listings')
      .select('address, neighborhood, price, bedrooms, bathrooms, no_fee, listing_url, first_seen')
      .gte('first_seen', new Date(Date.now() - days_back * 86400000).toISOString())
      .order('first_seen', { ascending: false })
      .limit(20)

    if (typeof min_price === 'number') q = q.gte('price', min_price)
    if (typeof max_price === 'number') q = q.lte('price', max_price)
    if (typeof min_bedrooms === 'number') q = q.gte('bedrooms', min_bedrooms)
    if (neighborhood) q = q.ilike('neighborhood', `%${neighborhood}%`)
    if (no_fee_only) q = q.eq('no_fee', true)

    const { data, error } = await q
    if (error) return { error: 'Listing search failed.' }
    return {
      count: data.length,
      window_days: days_back,
      listings: data,
      note: data.length === 0
        ? 'Nothing crawled matches these filters in this window. Do not describe hypothetical listings — tell the renter nothing matched and suggest widening the budget, area, or window.'
        : undefined,
    }
  },

  async get_my_listings(_input, userId) {
    const [{ data: listings }, { data: tours }] = await Promise.all([
      supabase.from('listings')
        .select('address, unit, bedrooms, bathrooms, price, status, subway_lines, listing_url, notes')
        .eq('user_id', userId).order('created_at', { ascending: false }).limit(25),
      supabase.from('tours')
        .select('scheduled_at, status, agent_response, listing_id')
        .eq('user_id', userId).order('scheduled_at', { ascending: true }).limit(25),
    ])
    return {
      listings: listings || [],
      tours: tours || [],
      note: (listings || []).length === 0
        ? 'AptPilot has not sourced any listings for this renter yet.'
        : undefined,
    }
  },

  // Pure math, no database. Same rules the /qualify calculator uses.
  async check_qualification(input) {
    const { monthly_rent, annual_incomes = [], guarantor_annual_income } = input
    const { tenantAnnualMultiple: T, guarantorAnnualMultiple: G } = INCOME_RULES

    const combined = annual_incomes.reduce((a, b) => a + (Number(b) || 0), 0)
    const requiredIncome = monthly_rent * T
    const qualifies = combined >= requiredIncome
    const maxRent = Math.floor(combined / T)

    const result = {
      monthly_rent,
      combined_annual_income: combined,
      required_annual_income: requiredIncome,
      qualifies_without_guarantor: qualifies,
      max_monthly_rent_at_this_income: maxRent,
      shortfall: qualifies ? 0 : requiredIncome - combined,
      rule: `${T}x monthly rent in gross annual income`,
    }

    if (!qualifies) {
      result.guarantor_required_annual_income = monthly_rent * G
      result.guarantor_rule = `${G}x monthly rent, and many landlords require the guarantor to live in NY, NJ, or CT`
      if (typeof guarantor_annual_income === 'number') {
        result.guarantor_qualifies = guarantor_annual_income >= monthly_rent * G
        result.guarantor_shortfall = Math.max(0, monthly_rent * G - guarantor_annual_income)
      }
    }
    return result
  },

  async get_document_checklist(_input, userId) {
    const { data: rows } = await supabase
      .from('user_documents').select('doc_id, doc_role, file_name').eq('user_id', userId)
    const uploaded = rows || []

    const byRole = {}
    for (const role of Object.keys(DOCS_BY_ROLE)) {
      const have = new Set(uploaded.filter(r => r.doc_role === role).map(r => r.doc_id))
      const slots = DOCS_BY_ROLE[role]
      byRole[role] = {
        missing_required: slots.filter(d => !d.optional && !have.has(d.id)).map(d => d.label),
        missing_optional: slots.filter(d => d.optional && !have.has(d.id)).map(d => d.label),
        uploaded: slots.filter(d => have.has(d.id)).map(d => d.label),
      }
    }
    return {
      ...byRole,
      upload_url: '/documents',
      note: 'A guarantor set is only needed if the renter does not clear the 40x rule on their own.',
    }
  },

  async update_search_criteria(input, userId) {
    const { data: searches } = await supabase
      .from('searches').select('id').eq('user_id', userId)
      .order('created_at', { ascending: false }).limit(1)
    const search = searches?.[0]
    if (!search) return { error: 'This renter has no saved search yet — send them to /intake to create one.' }

    const patch = {}
    for (const k of ['min_budget', 'max_budget', 'min_bed', 'max_bed', 'neighborhoods', 'move_in']) {
      if (input[k] !== undefined) patch[k] = input[k]
    }
    if (Object.keys(patch).length === 0) return { error: 'No fields to update.' }

    const { error } = await supabase.from('searches').update(patch).eq('id', search.id)
    if (error) return { error: 'Could not save the change.' }
    return { updated: patch, note: 'Alerts now use these criteria going forward.' }
  },

  async escalate_to_human(input, userId) {
    const { error } = await supabase.from('messages').insert({
      user_id: userId,
      body: `[ESCALATED BY ASSISTANT] ${input.reason}`,
      from_admin: false,
      read: false,
    })
    if (error) return { error: 'Could not flag this conversation.' }
    return { escalated: true, note: 'Tell the renter a human will follow up, typically within a business day.' }
  },
}

async function callClaude(messages) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8000,
      // Adaptive is NOT the default on Opus 4.8 — omitting `thinking` runs
      // with no thinking at all, and the model then tends to write its
      // reasoning into the visible reply.
      thinking: { type: 'adaptive' },
      // Chat latency matters more here than maximum depth.
      output_config: { effort: 'medium' },
      // Tools render before system, so this one breakpoint caches both.
      // Renter context deliberately does NOT live in the system prompt: that
      // would give every user a different cache prefix and nothing would ever
      // be shared. It arrives through get_renter_context instead.
      system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
      tools: TOOLS,
      messages,
    }),
  })
  const data = await res.json()
  if (!res.ok) {
    console.error('Anthropic error:', JSON.stringify(data))
    throw new Error('anthropic_failed')
  }
  return data
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { message, conversationHistory } = req.body || {}
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing message' })
  }

  // Identity comes from the bearer token, never from the request body. The
  // previous version trusted a userId the browser supplied, which let anyone
  // read any account's search, listings, and documents by guessing a uuid.
  let userId = null
  const authHeader = req.headers.authorization || ''
  if (authHeader.startsWith('Bearer ')) {
    const { data, error } = await supabase.auth.getUser(authHeader.slice(7))
    if (!error && data?.user) userId = data.user.id
  }

  try {
    if (userId) {
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('from_admin', false)
        .gte('created_at', new Date(Date.now() - 86400000).toISOString())
      if ((count ?? 0) >= DAILY_MESSAGE_LIMIT) {
        return res.status(200).json({
          reply: "You've hit today's message limit — it resets in 24 hours. If something urgent is going on with your search, reply to your welcome email and a human will pick it up.",
        })
      }
    } else {
      // Meter anonymous callers by IP before spending a single token on them.
      // Fail CLOSED: if the counter is unavailable we refuse rather than hand an
      // unauthenticated caller an unmetered Opus endpoint, which is the exact
      // hole this closes.
      const { data: used, error: rlErr } = await supabase.rpc('bump_anon_chat', {
        p_ip_hash: hashIp(req),
      })
      if (rlErr) {
        console.error('anon rate limit unavailable:', rlErr.message)
        return res.status(503).json({ error: 'Chat is briefly unavailable. Try again in a moment.' })
      }
      if ((used ?? 0) > ANON_DAILY_LIMIT) {
        return res.status(200).json({
          reply: "That's as much as I can cover before you have an account — create one and I can see your actual search, your documents, and what you qualify for.",
        })
      }
    }

    const history = (conversationHistory || []).slice(-10)
      .filter(m => m?.body && m.id !== 'intro')
      .map(m => ({ role: m.from_admin ? 'assistant' : 'user', content: m.body }))

    const messages = [...history, { role: 'user', content: message }]

    let reply = ''
    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
      const data = await callClaude(messages)

      if (round === 0) {
        // Zero cache reads across repeated turns means the prefix is being
        // invalidated somewhere and every conversation is paying full price.
        console.log('ai-chat usage:', JSON.stringify({
          cache_read: data.usage?.cache_read_input_tokens,
          cache_write: data.usage?.cache_creation_input_tokens,
          input: data.usage?.input_tokens,
          output: data.usage?.output_tokens,
        }))
      }

      if (data.stop_reason === 'refusal') {
        reply = "I can't help with that one. If it's about your search or your application, ask me again in those terms and I'll dig in."
        break
      }

      const toolUses = (data.content || []).filter(b => b.type === 'tool_use')
      const text = (data.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim()

      if (data.stop_reason !== 'tool_use' || toolUses.length === 0) {
        reply = text
        break
      }

      // Anonymous visitors get the NYC knowledge but no account tools.
      const results = await Promise.all(toolUses.map(async (t) => {
        if (!userId && t.name !== 'search_market' && t.name !== 'check_qualification') {
          return {
            type: 'tool_result', tool_use_id: t.id,
            content: JSON.stringify({ error: 'Not signed in. Ask them to log in for anything account-specific.' }),
          }
        }
        try {
          const out = await IMPLS[t.name](t.input || {}, userId)
          return { type: 'tool_result', tool_use_id: t.id, content: JSON.stringify(out) }
        } catch (err) {
          console.error(`tool ${t.name} failed:`, err)
          return {
            type: 'tool_result', tool_use_id: t.id, is_error: true,
            content: JSON.stringify({ error: `${t.name} failed. Do not invent the answer — tell the renter it could not be looked up.` }),
          }
        }
      }))

      messages.push({ role: 'assistant', content: data.content })
      // All results go back in ONE user message; splitting them trains the
      // model out of making parallel tool calls.
      messages.push({ role: 'user', content: results })

      if (round === MAX_TOOL_ROUNDS) {
        reply = text || "I'm having trouble pulling that together right now. Try asking a more specific question, or reply to your welcome email and a human will help."
      }
    }

    if (!reply) reply = "Sorry — I didn't get that. Could you rephrase?"

    if (userId) {
      await supabase.from('messages').insert([
        { user_id: userId, body: message, from_admin: false },
        { user_id: userId, body: reply, from_admin: true },
      ])
    }

    return res.status(200).json({ reply })
  } catch (err) {
    console.error('ai-chat error:', err)
    return res.status(500).json({ error: 'AI response failed' })
  }
}
