import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ChatArea from '../../src/components/chat/ChatArea'

const messages = [
  { id: '1', role: 'user', rawText: 'Hello AI', segments: null, timestamp: 1 },
  { id: '2', role: 'assistant', rawText: 'Hello! How can I help?', segments: null, timestamp: 2 },
]

describe('ChatArea — Phase 2', () => {
  it('renders EmptyState when messages array is empty', () => {
    render(<ChatArea messages={[]} isStreaming={false} onPresetClick={() => {}} />)
    expect(screen.getByText('What can I help with?')).toBeInTheDocument()
  })

  it('does not render EmptyState when messages exist', () => {
    render(<ChatArea messages={messages} isStreaming={false} onPresetClick={() => {}} />)
    expect(screen.queryByText('What can I help with?')).not.toBeInTheDocument()
  })

  it('renders user and assistant message bubbles', () => {
    render(<ChatArea messages={messages} isStreaming={false} onPresetClick={() => {}} />)
    expect(screen.getByTestId('message-user')).toBeInTheDocument()
    expect(screen.getByTestId('message-assistant')).toBeInTheDocument()
  })

  it('renders multiple messages', () => {
    const many = [
      { id: '1', role: 'user', rawText: 'Q1', segments: null, timestamp: 1 },
      { id: '2', role: 'assistant', rawText: 'A1', segments: null, timestamp: 2 },
      { id: '3', role: 'user', rawText: 'Q2', segments: null, timestamp: 3 },
      { id: '4', role: 'assistant', rawText: 'A2', segments: null, timestamp: 4 },
    ]
    render(<ChatArea messages={many} isStreaming={false} onPresetClick={() => {}} />)
    expect(screen.getAllByTestId('message-user')).toHaveLength(2)
    expect(screen.getAllByTestId('message-assistant')).toHaveLength(2)
  })

  it('shows typing indicator on last assistant message when streaming with empty text', () => {
    const streamingMsgs = [
      { id: '1', role: 'user', rawText: 'Hello', segments: null, timestamp: 1 },
      { id: '2', role: 'assistant', rawText: '', segments: null, timestamp: 2 },
    ]
    render(<ChatArea messages={streamingMsgs} isStreaming={true} onPresetClick={() => {}} />)
    expect(screen.getByTestId('typing-indicator')).toBeInTheDocument()
  })
})
