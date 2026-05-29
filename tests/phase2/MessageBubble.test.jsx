import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import MessageBubble from '../../src/components/chat/MessageBubble'

const userMsg = { id: '1', role: 'user', rawText: 'Hello world', segments: null, timestamp: 1 }
const assistantMsg = { id: '2', role: 'assistant', rawText: 'I am the assistant', segments: null, timestamp: 2 }
const emptyAssistant = { id: '3', role: 'assistant', rawText: '', segments: null, timestamp: 3 }

describe('MessageBubble — Phase 2', () => {
  it('renders user message with testid message-user', () => {
    render(<MessageBubble message={userMsg} isStreamingThis={false} />)
    expect(screen.getByTestId('message-user')).toBeInTheDocument()
  })

  it('user message has justify-end alignment class', () => {
    render(<MessageBubble message={userMsg} isStreamingThis={false} />)
    expect(screen.getByTestId('message-user').className).toContain('justify-end')
  })

  it('renders user message text', () => {
    render(<MessageBubble message={userMsg} isStreamingThis={false} />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('renders assistant message with testid message-assistant', () => {
    render(<MessageBubble message={assistantMsg} isStreamingThis={false} />)
    expect(screen.getByTestId('message-assistant')).toBeInTheDocument()
  })

  it('assistant message has justify-start alignment class', () => {
    render(<MessageBubble message={assistantMsg} isStreamingThis={false} />)
    expect(screen.getByTestId('message-assistant').className).toContain('justify-start')
  })

  it('renders assistant message text', () => {
    render(<MessageBubble message={assistantMsg} isStreamingThis={false} />)
    expect(screen.getByText('I am the assistant')).toBeInTheDocument()
  })

  it('shows TypingIndicator when streaming and rawText is empty', () => {
    render(<MessageBubble message={emptyAssistant} isStreamingThis={true} />)
    expect(screen.getByTestId('typing-indicator')).toBeInTheDocument()
  })

  it('does not show TypingIndicator when not streaming', () => {
    render(<MessageBubble message={assistantMsg} isStreamingThis={false} />)
    expect(screen.queryByTestId('typing-indicator')).not.toBeInTheDocument()
  })

  it('does not show TypingIndicator when streaming but rawText is non-empty', () => {
    render(<MessageBubble message={assistantMsg} isStreamingThis={true} />)
    expect(screen.queryByTestId('typing-indicator')).not.toBeInTheDocument()
  })
})
