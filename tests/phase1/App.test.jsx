import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { ThemeProvider } from '../../src/context/ThemeContext'
import App from '../../src/App'

function renderApp() {
  return render(
    <ThemeProvider>
      <App />
    </ThemeProvider>
  )
}

describe('App — Phase 1 Foundation', () => {
  it('renders without crashing', () => {
    renderApp()
    expect(document.body).toBeTruthy()
  })

  it('renders the sidebar', () => {
    renderApp()
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
  })

  it('renders the chat area', () => {
    renderApp()
    expect(screen.getByTestId('chat-area')).toBeInTheDocument()
  })

  it('renders the chat input', () => {
    renderApp()
    expect(screen.getByTestId('chat-input')).toBeInTheDocument()
  })

  it('renders all 4 preset questions', () => {
    renderApp()
    // Some titles appear in both sidebar and preset cards, so use getAllByText
    expect(screen.getAllByText('How does AI actually work?').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('What caused climate change?').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Are multivitamins effective?')).toBeInTheDocument()
    expect(screen.getByText('Will AI replace most jobs?')).toBeInTheDocument()
  })

  it('renders the "What can I help with?" heading', () => {
    renderApp()
    expect(screen.getByText('What can I help with?')).toBeInTheDocument()
  })
})
