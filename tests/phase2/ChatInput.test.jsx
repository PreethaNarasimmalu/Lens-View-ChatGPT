import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ThemeProvider } from '../../src/context/ThemeContext'
import ChatInput from '../../src/components/input/ChatInput'

function renderInput(props = {}) {
  return render(
    <ThemeProvider>
      <ChatInput onSend={() => {}} onLensToggle={() => {}} lensViewActive={false} {...props} />
    </ThemeProvider>
  )
}

describe('ChatInput — Phase 2', () => {
  it('renders the textarea', () => {
    renderInput()
    expect(screen.getByTestId('chat-input')).toBeInTheDocument()
  })

  it('renders the Lens View toggle pill', () => {
    renderInput()
    expect(screen.getByTestId('lens-toggle')).toBeInTheDocument()
  })

  it('send button is disabled when input is empty', () => {
    renderInput()
    expect(screen.getByLabelText('Send message')).toBeDisabled()
  })

  it('send button enables when text is typed', () => {
    renderInput()
    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: 'Hello' } })
    expect(screen.getByLabelText('Send message')).not.toBeDisabled()
  })

  it('calls onSend with trimmed text on button click', () => {
    const onSend = vi.fn()
    renderInput({ onSend })
    fireEvent.change(screen.getByTestId('chat-input'), { target: { value: '  Hello  ' } })
    fireEvent.click(screen.getByLabelText('Send message'))
    expect(onSend).toHaveBeenCalledWith('Hello')
  })

  it('clears input after send', () => {
    renderInput()
    const input = screen.getByTestId('chat-input')
    fireEvent.change(input, { target: { value: 'Hello' } })
    fireEvent.click(screen.getByLabelText('Send message'))
    expect(input.value).toBe('')
  })

  it('calls onSend on Enter key (not Shift+Enter)', () => {
    const onSend = vi.fn()
    renderInput({ onSend })
    const input = screen.getByTestId('chat-input')
    fireEvent.change(input, { target: { value: 'Hello' } })
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false })
    expect(onSend).toHaveBeenCalledWith('Hello')
  })

  it('does not call onSend on Shift+Enter', () => {
    const onSend = vi.fn()
    renderInput({ onSend })
    const input = screen.getByTestId('chat-input')
    fireEvent.change(input, { target: { value: 'Hello' } })
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })
    expect(onSend).not.toHaveBeenCalled()
  })

  it('Lens toggle shows OFF state when lensViewActive=false', () => {
    renderInput({ lensViewActive: false })
    expect(screen.getByTestId('lens-toggle')).toHaveAttribute('aria-pressed', 'false')
  })

  it('Lens toggle shows ON state when lensViewActive=true', () => {
    renderInput({ lensViewActive: true })
    expect(screen.getByTestId('lens-toggle')).toHaveAttribute('aria-pressed', 'true')
  })

  it('calls onLensToggle when pill is clicked', () => {
    const onLensToggle = vi.fn()
    renderInput({ onLensToggle })
    fireEvent.click(screen.getByTestId('lens-toggle'))
    expect(onLensToggle).toHaveBeenCalled()
  })

  it('disables input when disabled=true', () => {
    renderInput({ disabled: true })
    expect(screen.getByTestId('chat-input')).toBeDisabled()
  })
})
