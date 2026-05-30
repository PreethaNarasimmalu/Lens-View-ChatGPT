import Groq from 'groq-sdk'

export const config = { runtime: 'edge' }

const CRITIC_PROMPT = `You are a critical fact-checker reviewing an AI-generated response. Identify only claims that a thoughtful reader should genuinely question or verify.

Return a JSON object:
{"response": [{"text": "...", "type": "UNCERTAIN"|"ASSUMPTION", "reason": "...", "sources": [...]}]}

WHAT TO FLAG:

UNCERTAIN — flag these:
- Specific statistics or percentages (e.g. "80% of users", "saves 3 hours/week")
- Specific predictions with numbers or timelines (e.g. "by 2030, AI will...")
- Scientific claims where expert opinion is genuinely divided
- Claims about which option is "better", "faster", "more popular" without clear basis

ASSUMPTION — flag these:
- Causal reasoning that isn't directly proven (e.g. "because X, users will Y")
- Sweeping generalizations (e.g. "most people", "users typically", "everyone knows")
- Recommendations that only hold under unstated conditions (e.g. "you should use X" — depends on context)
- Implied guarantees (e.g. "this will help you", "this approach ensures")

DO NOT FLAG:
- Well-known product names, tools, courses, or institutions (TensorFlow, Coursera, Stanford, etc.)
- Established historical facts
- Definitions or descriptions of what something is
- Things that are simply recommendations without false certainty

SOURCES:
- Only include a source if you can provide a real, specific title AND a real URL (not a placeholder)
- If you cannot provide a real URL, omit the sources array entirely — do not invent URLs
- Each source must have: title (real name), url (real https:// link), snippet (1 sentence why relevant)

LIMITS:
- Flag 2–4 claims maximum. Quality over quantity.
- If nothing genuinely warrants flagging, return {"response": []}
- "text" must be copied verbatim as an exact substring of the response
- Return raw JSON only — no markdown fences`

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  let body
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const { answer, question } = body
  if (!answer || typeof answer !== 'string') {
    return new Response('Missing answer field', { status: 400 })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return new Response('GROQ_API_KEY not configured', { status: 500 })
  }

  const groq = new Groq({ apiKey })

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: CRITIC_PROMPT },
        {
          role: 'user',
          content: `Question asked: ${question || '(not provided)'}\n\nAI response to review:\n${answer}`,
        },
      ],
      stream: false,
      max_tokens: 1024,
      temperature: 0.2,
    })

    const text = completion.choices[0]?.message?.content ?? '{"response":[]}'
    return new Response(text, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (err) {
    const status = err?.status ?? 500
    const message = err?.message ?? 'Groq API error'
    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
