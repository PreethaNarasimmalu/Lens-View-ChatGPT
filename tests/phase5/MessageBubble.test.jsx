import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import MessageBubble from '../../src/components/chat/MessageBubble'

const segments = [
  { text: 'Fact.', type: 'VERIFIED', reason: null, sources: null },
  { text: 'Maybe.', type: 'UNCERTAIN', reason: 'Not sure.', sources: null },
  { text: 'Guess.', type: 'ASSUMPTION', reason: 'Inferred.', sources: null },
]

const assistantMsg = {
  id: '1', role: 'assistant', rawText: 'Full response', segments, timestamp: 1,
}

const assistantMsgNoSegments = {
  id: '2', role: 'assistant', rawText: 'Plain response', segments: null, timestamp: 2,
}

describe('MessageBubble Rationale Button — Phase 5', () => {
  it('shows Rationale button when lensViewActive=true and segments exist and not streaming', () => {
    render(
      <MessageBubble
        message={assistantMsg}
        isStreamingThis={false}
        lensViewActive={true}
        onOpenRationale={() => {}}
      />
    )
    expect(screen.getByTestId('rationale-button')).toBeInTheDocument()
  })

  it('does not show Rationale button when lensViewActive=false', () => {
    render(
      <MessageBubble
        message={assistantMsg}
        isStreamingThis={false}
        lensViewActive={false}
        onOpenRationale={() => {}}
      />
    )
    expect(screen.queryByTestId('rationale-button')).not.toBeInTheDocument()
  })

  it('does not show Rationale button when segments is null', () => {
    render(
      <MessageBubble
        message={assistantMsgNoSegments}
        isStreamingThis={false}
        lensViewActive={true}
        onOpenRationale={() => {}}
      />
    )
    expect(screen.queryByTestId('rationale-button')).not.toBeInTheDocument()
  })

  it('does not show Rationale button while still streaming', () => {
    render(
      <MessageBubble
        message={assistantMsg}
        isStreamingThis={true}
        lensViewActive={true}
        onOpenRationale={() => {}}
      />
    )
    expect(screen.queryByTestId('rationale-button')).not.toBeInTheDocument()
  })

  it('calls onOpenRationale with message when Rationale button is clicked', () => {
    const onOpenRationale = vi.fn()
    render(
      <MessageBubble
        message={assistantMsg}
        isStreamingThis={false}
        lensViewActive={true}
        onOpenRationale={onOpenRationale}
      />
    )
    fireEvent.click(screen.getByTestId('rationale-button'))
    expect(onOpenRationale).toHaveBeenCalledWith(assistantMsg)
  })
})
