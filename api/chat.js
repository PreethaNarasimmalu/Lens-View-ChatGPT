import Groq from 'groq-sdk'

export const config = { runtime: 'edge' }

const STANDARD_SYSTEM_PROMPT =
  'You are a helpful AI assistant. Answer clearly and concisely.'

const LENS_SYSTEM_PROMPT = `You are an AI assistant. When responding, return a JSON object with this structure:
{"response": [{"text": string, "type": "VERIFIED"|"UNCERTAIN"|"ASSUMPTION", "reason": string|null, "sources": [{"title": string, "url": string, "snippet": string}]|null}]}
Mark any statistical claims, percentages, or unverified facts as UNCERTAIN with a reason.
Mark any inferred or extrapolated information as ASSUMPTION with a reason.
Mark confirmed facts as VERIFIED. Keep reasons concise, 1-2 sentences.`

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
