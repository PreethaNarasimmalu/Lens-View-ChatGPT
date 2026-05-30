import Groq from 'groq-sdk'

export const config = { runtime: 'edge' }

const CRITIC_PROMPT = `You are a critical fact-checker reviewing an AI-generated response. Identify only claims that a thoughtful reader should genuinely question or verify.

Return a JSON object:
{"response": [{"text": "...", "type": "UNCERTAIN"|"ASSUMPTION", "reason": "...", "verify_by": "..."}]}

WHAT TO FLAG:

UNCERTAIN — flag these:
- Specific statistics or percentages (e.g. "80% of users", "saves 3 hours/week")
- Specific predictions with numbers or timelines (e.g. "by 2030, AI will...")
- Scientific claims where expert opinion is genuinely divided
- Claims about which option is "better", "faster", "more popular" without clear basis

ASSUMPTION — flag these:
- Causal reasoning that isn't directly proven (e.g. "because X, users will Y")
- Sweeping generalizations (e.g. "most people", "users typically", "always")
- Recommendations that only hold under unstated conditions
- Implied guarantees (e.g. "this will help you", "this approach ensures")

DO NOT FLAG:
- Well-known product names, tools, courses, or institutions
- Established historical facts or definitions
- Simple recommendations stated as suggestions (not guarantees)

FIELDS:
- "text": exact verbatim substring from the response — do not paraphrase
- "reason": 1–2 sentences explaining why this is uncertain or an assumption
- "verify_by": 1 sentence telling the user what kind of source or action would confirm or refute this claim (e.g. "Check a peer-reviewed meta-analysis on multivitamin efficacy" or "Look up the original McKinsey report on job automation")

LIMITS:
- Flag 2–4 claims maximum. Quality over quantity.
- If nothing genuinely warrants flagging, return {"response": []}
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
