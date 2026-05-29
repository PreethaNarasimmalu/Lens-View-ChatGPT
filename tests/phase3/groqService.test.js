import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { streamResponse } from '../../src/services/groqService'

function makeStream(chunks) {
  const encoder = new TextEncoder()
  let idx = 0
  return new ReadableStream({
    pull(controller) {
      if (idx < chunks.length) {
        controller.enqueue(encoder.encode(chunks[idx++]))
      } else {
        controller.close()
      }
    },
  })
}

function mockFetchOk(chunks) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    body: makeStream(chunks),
  }))
}

function mockFetchError(status, body = {}) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: false,
    status,
    json: () => Promise.resolve(body),
  }))
}

function mockFetchNetworkFailure() {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
}

afterEach(() => vi.unstubAllGlobals())

describe('groqService.streamResponse', () => {
  it('yields chunks from a successful stream', async () => {
    mockFetchOk(['Hello', ' world', '!'])
    const chunks = []
    for await (const chunk of streamResponse({ messages: [{ role: 'user', content: 'hi' }] })) {
      chunks.push(chunk)
    }
    expect(chunks).toEqual(['Hello', ' world', '!'])
  })

  it('assembles full text from chunks', async () => {
    mockFetchOk(['The ', 'sky ', 'is ', 'blue.'])
    let full = ''
    for await (const chunk of streamResponse({ messages: [] })) {
      full += chunk
    }
    expect(full).toBe('The sky is blue.')
  })

  it('calls /api/chat with correct method and headers', async () => {
    mockFetchOk(['ok'])
    for await (const _ of streamResponse({ messages: [], lensView: false })) {}
    expect(fetch).toHaveBeenCalledWith('/api/chat', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }))
  })

  it('passes lensView flag in request body', async () => {
    mockFetchOk(['ok'])
    for await (const _ of streamResponse({ messages: [], lensView: true })) {}
    const body = JSON.parse(fetch.mock.calls[0][1].body)
    expect(body.lensView).toBe(true)
  })

  it('passes messages in request body', async () => {
    mockFetchOk(['ok'])
    const msgs = [{ role: 'user', content: 'test' }]
    for await (const _ of streamResponse({ messages: msgs })) {}
    const body = JSON.parse(fetch.mock.calls[0][1].body)
    expect(body.messages).toEqual(msgs)
  })

  it('throws rate limit error on 429', async () => {
    mockFetchError(429, { error: 'rate limited' })
    await expect(async () => {
      for await (const _ of streamResponse({ messages: [] })) {}
    }).rejects.toThrow('Too many requests')
  })

  it('throws server error on 500', async () => {
    mockFetchError(500, {})
    await expect(async () => {
      for await (const _ of streamResponse({ messages: [] })) {}
    }).rejects.toThrow('Server error')
  })

  it('throws generic error on other non-ok status', async () => {
    mockFetchError(403, { error: 'Forbidden' })
    await expect(async () => {
      for await (const _ of streamResponse({ messages: [] })) {}
    }).rejects.toThrow('Forbidden')
  })

  it('throws network error when fetch rejects', async () => {
    mockFetchNetworkFailure()
    await expect(async () => {
      for await (const _ of streamResponse({ messages: [] })) {}
    }).rejects.toThrow('Network error')
  })
})
