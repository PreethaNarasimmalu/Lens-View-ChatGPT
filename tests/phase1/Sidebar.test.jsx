import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Sidebar from '../../src/components/layout/Sidebar'
import { ThemeProvider } from '../../src/context/ThemeContext'

function renderSidebar(props = {}) {
  return render(
    <ThemeProvider>
      <Sidebar isOpen={true} onClose={() => {}} {...props} />
    </ThemeProvider>
  )
}

describe('Sidebar — Phase 1', () => {
  it('renders the sidebar element', () => {
    renderSidebar()
    expect(screen.getByTestId('sidebar')).toBeInTheDocument()
  })

  it('renders all 7 fake recent chat items', () => {
    renderSidebar()
    expect(screen.getByText('How does AI actually work?')).toBeInTheDocument()
    expect(screen.getByText('Climate change key factors')).toBeInTheDocument()
    expect(screen.getByText('Best Python frameworks 2024')).toBeInTheDocument()
    expect(screen.getByText('Explain quantum entanglement')).toBeInTheDocument()
    expect(screen.getByText('Mediterranean diet benefits')).toBeInTheDocument()
    expect(screen.getByText('How to learn TypeScript fast')).toBeInTheDocument()
    expect(screen.getByText('History of the Roman Empire')).toBeInTheDocument()
  })

  it('renders date group labels', () => {
    renderSidebar()
    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.getByText('Yesterday')).toBeInTheDocument()
    expect(screen.getByText('Previous 7 days')).toBeInTheDocument()
  })

  it('renders new chat button', () => {
    renderSidebar()
    expect(screen.getAllByLabelText('New chat').length).toBeGreaterThan(0)
  })

  it('hides sidebar on mobile via translate class when isOpen=false', () => {
    renderSidebar({ isOpen: false })
    const sidebar = screen.getByTestId('sidebar')
    expect(sidebar.className).toContain('-translate-x-full')
  })

  it('shows sidebar when isOpen=true', () => {
    renderSidebar({ isOpen: true })
    const sidebar = screen.getByTestId('sidebar')
    expect(sidebar.className).toContain('translate-x-0')
  })
})
