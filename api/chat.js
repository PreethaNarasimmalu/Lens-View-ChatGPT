import Groq from 'groq-sdk'

export const config = { runtime: 'edge' }

const STANDARD_SYSTEM_PROMPT =
  'You are a helpful AI assistant. Answer clearly and concisely.'

const LENS_SYSTEM_PROMPT = `You are an AI assistant. Respond ONLY with a valid JSON object — no markdown fences, no extra text outside the JSON.
Use this exact structure:
{"formatted": "full markdown answer here", "response": [...]}

- "formatted": Write the complete, well-structured answer as proper markdown (use numbered lists, bold headers, paragraphs as appropriate). This is what the user reads.
- "response": Array of 3–5 claim objects selected from the most significant claims in "formatted". Only include claims that are genuinely uncertain or clearly inferential — do NOT annotate obvious facts or routine statements.

Each claim object: {"text": "exact sentence from formatted", "type": "UNCERTAIN"|"ASSUMPTION", "reason": "1–2 sentence explanation", "sources": [{"title": "...", "url": "https://...", "snippet": "..."}]}

Rules:
- UNCERTAIN: ONLY for specific statistics, percentages, disputed scientific claims, or predictions that vary by source. Must have a reason and 1–2 sources.
- ASSUMPTION: ONLY for clear inferences drawn from evidence but not directly proven. Must have a reason.
- Do NOT use VERIFIED — omit routine facts entirely from the response array.
- The "text" value must be an exact substring of "formatted" so it can be highlighted.
- 3–5 sources total across all claims. Each source needs title, url, snippet.
- Output raw JSON only — no markdown code fences.`

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
