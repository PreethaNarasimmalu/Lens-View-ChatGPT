import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import MessageBubble from '../../src/components/chat/MessageBubble'
import ErrorBanner from '../../src/components/ui/ErrorBanner'
import { parseLensResponse } from '../../src/utils/parseLensResponse'
import LensResponse from '../../src/components/lens/LensResponse'

// ── Empty response ─────────────────────────────────────────────────────────

describe('Edge case: empty assistant response — Phase 6', () => {
  it('shows "No response received" for empty rawText when stream finished', () => {
    const msg = { id: '1', role: 'assistant', rawText: '', segments: null, timestamp: 1 }
    render(<MessageBubble message={msg} isStreamingThis={false} lensViewActive={false} />)
    expect(screen.getByTestId('empty-response')).toBeInTheDocument()
    expect(screen.getByText('No response received.')).toBeInTheDocument()
  })

  it('shows typing indicator for empty rawText while streaming', () => {
    const msg = { id: '1', role: 'assistant', rawText: '', segments: null, timestamp: 1 }
    render(<MessageBubble message={msg} isStreamingThis={true} lensViewActive={false} />)
    expect(screen.getByTestId('typing-indicator')).toBeInTheDocument()
    expect(screen.queryByTestId('empty-response')).not.toBeInTheDocument()
  })

  it('whitespace-only rawText also shows empty-response state', () => {
    const msg = { id: '1', role: 'assistant', rawText: '   ', segments: null, timestamp: 1 }
    render(<MessageBubble message={msg} isStreamingThis={false} lensViewActive={false} />)
    expect(screen.getByTestId('empty-response')).toBeInTheDocument()
  })
})

// ── Error banner ───────────────────────────────────────────────────────────

describe('Edge case: API error banner — Phase 6', () => {
  it('ErrorBanner renders with role=alert', () => {
    render(<ErrorBanner message="Connection failed" onDismiss={() => {}} />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('ErrorBanner shows the error message', () => {
    render(<ErrorBanner message="Too many requests" onDismiss={() => {}} />)
    expect(screen.getByText('Too many requests')).toBeInTheDocument()
  })

  it('ErrorBanner calls onDismiss when X clicked', () => {
    const onDismiss = vi.fn()
    render(<ErrorBanner message="Error" onDismiss={onDismiss} />)
    fireEvent.click(screen.getByTestId('error-dismiss'))
    expect(onDismiss).toHaveBeenCalled()
  })

  it('ErrorBanner returns null when message is null', () => {
    const { container } = render(<ErrorBanner message={null} onDismiss={() => {}} />)
    expect(container.firstChild).toBeNull()
  })
})

// ── Long responses ─────────────────────────────────────────────────────────

describe('Edge case: long responses — Phase 6', () => {
  it('LensResponse renders very long plain text without crashing', () => {
    const longText = 'word '.repeat(500).trim()
    render(<LensResponse segments={null} rawText={longText} lensViewActive={false} />)
    expect(screen.getByTestId('plain-response')).toBeInTheDocument()
  })

  it('LensResponse renders many segments without crashing', () => {
    const segments = Array.from({ length: 50 }, (_, i) => ({
      text: `Segment ${i + 1}. `,
      type: i % 3 === 0 ? 'UNCERTAIN' : i % 3 === 1 ? 'ASSUMPTION' : 'VERIFIED',
      reason: i % 3 !== 2 ? 'Some reason.' : null,
      sources: null,
    }))
    render(<LensResponse segments={segments} rawText="raw" lensViewActive={true} />)
    expect(screen.getByTestId('lens-response')).toBeInTheDocument()
  })
})

// ── parseLensResponse edge cases ───────────────────────────────────────────

describe('Edge case: parseLensResponse robustness — Phase 6', () => {
  it('handles deeply nested but wrong structure gracefully', () => {
    const weird = JSON.stringify({ result: { data: [] } })
    const segs = parseLensResponse(weird)
    expect(segs[0].type).toBe('VERIFIED')
  })

  it('handles JSON with extra unknown fields without crashing', () => {
    const extra = JSON.stringify({
      response: [{ text: 'hi', type: 'VERIFIED', reason: null, sources: null, extra: 'ignored' }],
    })
    const segs = parseLensResponse(extra)
    expect(segs[0].text).toBe('hi')
  })

  it('handles response with mixed valid and invalid segments', () => {
    const mixed = JSON.stringify({
      response: [
        { text: 'valid', type: 'VERIFIED', reason: null },
        { text: '', type: 'UNCERTAIN', reason: 'empty' }, // filtered out
        { text: 'also valid', type: 'ASSUMPTION', reason: 'inferred' },
      ],
    })
    const segs = parseLensResponse(mixed)
    // Empty text filtered, so 2 remain
    expect(segs).toHaveLength(2)
  })

  it('coerces null reason to null (not undefined)', () => {
    const json = JSON.stringify({ response: [{ text: 'hi', type: 'VERIFIED', reason: null }] })
    const segs = parseLensResponse(json)
    expect(segs[0].reason).toBeNull()
  })
})

// ── Mobile layout ──────────────────────────────────────────────────────────

describe('Mobile: Sidebar visibility — Phase 6', () => {
  it('sidebar has -translate-x-full when isOpen=false (hidden on mobile)', async () => {
    const { default: Sidebar } = await import('../../src/components/layout/Sidebar')
    const { ThemeProvider } = await import('../../src/context/ThemeContext')
    render(
      <ThemeProvider>
        <Sidebar isOpen={false} onClose={() => {}} />
      </ThemeProvider>
    )
    const sidebar = screen.getByTestId('sidebar')
    expect(sidebar.className).toContain('-translate-x-full')
  })
})
