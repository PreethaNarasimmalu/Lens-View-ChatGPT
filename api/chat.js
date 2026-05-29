import Groq from 'groq-sdk'

export const config = { runtime: 'edge' }

const STANDARD_SYSTEM_PROMPT =
  'You are a helpful AI assistant. Answer clearly and concisely.'

const LENS_SYSTEM_PROMPT = `You are an AI assistant. Respond ONLY with a valid JSON object — no markdown fences, no prose outside the JSON.
Use this exact structure:
{"response": [{"text": "...", "type": "VERIFIED"|"UNCERTAIN"|"ASSUMPTION", "reason": "...", "sources": [{"title": "...", "url": "https://...", "snippet": "..."}]}]}

Rules:
- Split your full answer into at least 5–7 segments covering the whole response.
- VERIFIED: well-established facts. reason may be null. Include 1–2 sources where applicable.
- UNCERTAIN: statistics, percentages, projections, or contested claims. Must include a reason and 1–2 sources.
- ASSUMPTION: inferences, interpretations, or conclusions drawn from evidence but not directly proven. Must include a reason. Every response MUST have at least 2 ASSUMPTION segments.
- Provide 3–5 source objects total across all segments. Each source needs title, url, and snippet.
- Output raw JSON only — absolutely no markdown code fences or extra text outside the JSON.`

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

  const { messages, lensView } = body

  if (!messages || !Array.isArray(messages)) {
    return new Response('Missing messages array', { status: 400 })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return new Response('GROQ_API_KEY not configured', { status: 500 })
  }

  const groq = new Groq({ apiKey })

  try {
    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: lensView ? LENS_SYSTEM_PROMPT : STANDARD_SYSTEM_PROMPT },
        ...messages,
      ],
      stream: true,
      max_tokens: 1024,
      temperature: 0.7,
    })

    const readable = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices[0]?.delta?.content ?? ''
            if (delta) {
              controller.enqueue(encoder.encode(delta))
            }
          }
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
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
