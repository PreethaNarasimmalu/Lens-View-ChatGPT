import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LensText from '../../src/components/lens/LensText'
import LensTogglePill from '../../src/components/input/LensTogglePill'
import RationalePanel from '../../src/components/lens/RationalePanel'

const uncertainSeg = { text: 'Stats say 97%.', type: 'UNCERTAIN', reason: 'Varies by source.', sources: null }
const assumptionSeg = { text: 'Will continue.', type: 'ASSUMPTION', reason: 'Inferred.', sources: null }
const verifiedSeg  = { text: 'Water boils at 100°C.', type: 'VERIFIED', reason: null, sources: null }

const msgWithSegments = {
  id: '1', role: 'assistant', rawText: 'text',
  segments: [
    { text: 'fact', type: 'VERIFIED', reason: null, sources: null },
    { text: 'maybe', type: 'UNCERTAIN', reason: 'reason', sources: null },
  ],
}

// ── Color-independent signals ──────────────────────────────────────────────

describe('A11y: non-color signals alongside color — Phase 6', () => {
  it('UNCERTAIN has ⚠ icon (shape signal alongside amber color)', () => {
    render(<LensText segment={uncertainSeg} />)
    expect(screen.getByTestId('lens-icon-uncertain')).toBeInTheDocument()
  })

  it('ASSUMPTION has ~ glyph (pattern signal alongside blue color)', () => {
    render(<LensText segment={assumptionSeg} />)
    expect(screen.getByTestId('lens-icon-assumption')).toBeInTheDocument()
  })

  it('VERIFIED has no icon (baseline — no decoration needed)', () => {
    render(<LensText segment={verifiedSeg} />)
    expect(screen.queryByTestId('lens-icon-verified')).not.toBeInTheDocument()
  })

  it('UNCERTAIN span has dotted underline (pattern signal)', () => {
    render(<LensText segment={uncertainSeg} />)
    expect(screen.getByTestId('lens-uncertain').className).toContain('decoration-dotted')
  })

  it('ASSUMPTION span has dashed underline (pattern signal)', () => {
    render(<LensText segment={assumptionSeg} />)
    expect(screen.getByTestId('lens-assumption').className).toContain('decoration-dashed')
  })

  it('UNCERTAIN aria-label contains screen-reader description', () => {
    render(<LensText segment={uncertainSeg} />)
    const el = screen.getByTestId('lens-uncertain')
    expect(el.getAttribute('aria-label')).toContain('Uncertain')
  })

  it('ASSUMPTION aria-label contains screen-reader description', () => {
    render(<LensText segment={assumptionSeg} />)
    const el = screen.getByTestId('lens-assumption')
    expect(el.getAttribute('aria-label')).toContain('Assumption')
  })
})

// ── Keyboard navigation ────────────────────────────────────────────────────

describe('A11y: keyboard navigation — Phase 6', () => {
  it('UNCERTAIN is focusable (tabIndex=0)', () => {
    render(<LensText segment={uncertainSeg} />)
    expect(screen.getByTestId('lens-uncertain')).toHaveAttribute('tabindex', '0')
  })

  it('Enter key opens tooltip', () => {
    render(<LensText segment={uncertainSeg} />)
    const el = screen.getByTestId('lens-uncertain')
    fireEvent.keyDown(el, { key: 'Enter' })
    expect(screen.getByTestId('claim-tooltip')).toBeInTheDocument()
  })

  it('Space key opens tooltip', () => {
    render(<LensText segment={uncertainSeg} />)
    const el = screen.getByTestId('lens-uncertain')
    fireEvent.keyDown(el, { key: ' ' })
    expect(screen.getByTestId('claim-tooltip')).toBeInTheDocument()
  })

  it('Escape key closes tooltip', () => {
    render(<LensText segment={uncertainSeg} />)
    const el = screen.getByTestId('lens-uncertain')
    fireEvent.keyDown(el, { key: 'Enter' })
    expect(screen.getByTestId('claim-tooltip')).toBeInTheDocument()
    fireEvent.keyDown(el, { key: 'Escape' })
    expect(screen.queryByTestId('claim-tooltip')).not.toBeInTheDocument()
  })

  it('LensTogglePill has aria-pressed attribute', () => {
    render(<LensTogglePill active={false} onToggle={() => {}} />)
    expect(screen.getByTestId('lens-toggle')).toHaveAttribute('aria-pressed', 'false')
  })

  it('RationalePanel has role=dialog', () => {
    render(<RationalePanel message={msgWithSegments} onClose={() => {}} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('RationalePanel has aria-modal=true', () => {
    render(<RationalePanel message={msgWithSegments} onClose={() => {}} />)
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })
})
