import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import { ThemeProvider } from '../../src/context/ThemeContext'
import ThemeToggle from '../../src/components/ui/ThemeToggle'

function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  )
}

describe('ThemeToggle — Phase 1', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.classList.remove('dark', 'light')
  })

  it('renders the toggle button', () => {
    renderToggle()
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('has an accessible aria-label', () => {
    renderToggle()
    expect(screen.getByRole('button')).toHaveAttribute('aria-label')
  })

  it('starts in light mode by default (no dark class on html)', () => {
    renderToggle()
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('toggles to dark mode on click — adds dark class', () => {
    renderToggle()
    fireEvent.click(screen.getByRole('button'))
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('toggles back to light mode on second click', () => {
    renderToggle()
    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    fireEvent.click(btn)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('persists theme to localStorage', () => {
    renderToggle()
    const btn = screen.getByRole('button')
    fireEvent.click(btn)
    expect(localStorage.getItem('lv-theme')).toBe('dark')
    fireEvent.click(btn)
    expect(localStorage.getItem('lv-theme')).toBe('light')
  })
})
