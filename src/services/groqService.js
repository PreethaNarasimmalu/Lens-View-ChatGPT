const ENDPOINT = '/api/chat'

/**
 * Streams a response from the Groq proxy.
 * Yields string chunks as they arrive.
 * Throws on network errors or non-2xx responses.
 */
export async function* streamResponse({ messages, lensView = false }) {
  let res
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, lensView }),
    })
  } catch (err) {
    throw new Error('Network error — check your connection and try again.')
  }

  if (!res.ok) {
    let detail = ''
    try {
      const json = await res.json()
      detail = json.error ?? ''
    } catch {}
    if (res.status === 429) throw new Error('Too many requests — please wait a moment.')
    if (res.status === 500) throw new Error('Server error — the API key may not be configured.')
    throw new Error(detail || `Request failed (${res.status})`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    if (chunk) yield chunk
  }
}
