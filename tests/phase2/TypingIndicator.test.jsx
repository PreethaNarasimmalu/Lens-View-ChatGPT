import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import TypingIndicator from '../../src/components/chat/TypingIndicator'

describe('TypingIndicator — Phase 2', () => {
  it('renders with testid typing-indicator', () => {
    render(<TypingIndicator />)
    expect(screen.getByTestId('typing-indicator')).toBeInTheDocument()
  })

  it('renders 3 animated dots', () => {
    render(<TypingIndicator />)
    const dots = screen.getByTestId('typing-indicator').querySelectorAll('span')
    expect(dots).toHaveLength(3)
  })

  it('each dot has animate-bounce class', () => {
    render(<TypingIndicator />)
    const dots = screen.getByTestId('typing-indicator').querySelectorAll('span')
    dots.forEach(dot => {
      expect(dot.className).toContain('animate-bounce')
    })
  })
})
