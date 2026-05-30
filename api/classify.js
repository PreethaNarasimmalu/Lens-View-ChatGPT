import Groq from 'groq-sdk'

export const config = { runtime: 'edge' }

const CRITIC_PROMPT = `You are a critical fact-checker reviewing an AI-generated response. Your only job is to identify claims that are genuinely uncertain or clearly inferential.

Read the response carefully. Return a JSON object:
{"response": [{"text": "...", "type": "UNCERTAIN"|"ASSUMPTION", "reason": "...", "sources": [...]}]}

Rules:
- "text" must be an exact substring copied verbatim from the response — do not paraphrase.
- UNCERTAIN: specific statistics, percentages, dates, named studies, or scientific claims that could vary by source or be wrong. Include 1–2 sources (title, url, snippet).
- ASSUMPTION: conclusions or inferences presented as likely but not directly proven. Include a reason, sources optional.
- Flag only 2–5 claims. Do NOT flag obvious facts, common knowledge, or well-established consensus.
- If the response has no uncertain or inferential claims worth flagging, return {"response": []}.
- Return raw JSON only — no markdown fences, no extra text.`

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
