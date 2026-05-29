import { render, screen, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { ChatProvider } from '../../src/context/ChatContext'
import { useChat } from '../../src/hooks/useChat'

// Minimal component that exposes chat state + sendMessage
function Harness({ onReady }) {
  const { state, sendMessage } = useChat()
  onReady({ state, sendMessage })
  return (
    <div>
      <div data-testid="msg-count">{state.messages.length}</div>
      <div data-testid="is-streaming">{String(state.isStreaming)}</div>
      <div data-testid="error">{state.error ?? ''}</div>
      {state.messages.map(m => (
        <div key={m.id} data-testid={`msg-${m.role}`}>{m.rawText}</div>
      ))}
    </div>
  )
}

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

afterEach(() => vi.unstubAllGlobals())

function renderHarness() {
  let ref = {}
  render(
    <ChatProvider>
      <Harness onReady={r => { Object.assign(ref, r) }} />
    </ChatProvider>
  )
  return ref
}

describe('useChat — Phase 3', () => {
  it('appends user message immediately on sendMessage', async () => {
    mockFetchOk(['Hello'])
    const ref = renderHarness()
    await act(async () => { await ref.sendMessage('What is AI?') })
    expect(screen.getAllByTestId('msg-user')[0].textContent).toBe('What is AI?')
  })

  it('adds an assistant message after user message', async () => {
    mockFetchOk(['Streaming', ' response'])
    const ref = renderHarness()
    await act(async () => { await ref.sendMessage('Tell me something') })
    await waitFor(() => {
      expect(screen.queryByTestId('msg-assistant')).not.toBeNull()
    })
  })

  it('assembles full streamed text into assistant message', async () => {
    mockFetchOk(['The ', 'answer ', 'is 42.'])
    const ref = renderHarness()
    await act(async () => { await ref.sendMessage('Question') })
    await waitFor(() => {
      expect(screen.getByTestId('msg-assistant').textContent).toBe('The answer is 42.')
    })
  })

  it('sets isStreaming=false after stream completes', async () => {
    mockFetchOk(['Done'])
    const ref = renderHarness()
    await act(async () => { await ref.sendMessage('Hi') })
    await waitFor(() => {
      expect(screen.getByTestId('is-streaming').textContent).toBe('false')
    })
  })

  it('shows error message in assistant bubble on API failure', async () => {
    mockFetchError(500, {})
    const ref = renderHarness()
    await act(async () => { await ref.sendMessage('Fail') })
    await waitFor(() => {
      expect(screen.getByTestId('msg-assistant').textContent).toContain('⚠')
    })
  })

  it('sets error state on API failure', async () => {
    mockFetchError(429, { error: 'rate limit' })
    const ref = renderHarness()
    await act(async () => { await ref.sendMessage('Fail') })
    await waitFor(() => {
      expect(screen.getByTestId('error').textContent).toContain('Too many requests')
    })
  })

  it('total message count is 2 after one exchange', async () => {
    mockFetchOk(['Response'])
    const ref = renderHarness()
    await act(async () => { await ref.sendMessage('Hello') })
    await waitFor(() => {
      expect(screen.getByTestId('msg-count').textContent).toBe('2')
    })
  })
})
