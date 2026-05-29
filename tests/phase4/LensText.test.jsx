import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LensText from '../../src/components/lens/LensText'

const verified = { text: 'The sky is blue.', type: 'VERIFIED', reason: null, sources: null }
const uncertain = { text: '97% of scientists agree.', type: 'UNCERTAIN', reason: 'Percentage varies by study.', sources: null }
const assumption = { text: 'This will continue.', type: 'ASSUMPTION', reason: 'Inferred from trend data.', sources: null }

describe('LensText — Phase 4', () => {
  it('renders VERIFIED segment with testid lens-verified', () => {
    render(<LensText segment={verified} />)
    expect(screen.getByTestId('lens-verified')).toBeInTheDocument()
  })

  it('VERIFIED segment has no underline class', () => {
    render(<LensText segment={verified} />)
    const el = screen.getByTestId('lens-verified')
    expect(el.className).not.toContain('underline')
  })

  it('renders UNCERTAIN segment with testid lens-uncertain', () => {
    render(<LensText segment={uncertain} />)
    expect(screen.getByTestId('lens-uncertain')).toBeInTheDocument()
  })

  it('UNCERTAIN segment has dotted amber underline classes', () => {
    render(<LensText segment={uncertain} />)
    const el = screen.getByTestId('lens-uncertain')
    expect(el.className).toContain('decoration-dotted')
    expect(el.className).toContain('decoration-amber-400')
  })

  it('UNCERTAIN segment renders ⚠ icon', () => {
    render(<LensText segment={uncertain} />)
    expect(screen.getByText('⚠')).toBeInTheDocument()
  })

  it('renders ASSUMPTION segment with testid lens-assumption', () => {
    render(<LensText segment={assumption} />)
    expect(screen.getByTestId('lens-assumption')).toBeInTheDocument()
  })

  it('ASSUMPTION segment has dashed blue underline classes', () => {
    render(<LensText segment={assumption} />)
    const el = screen.getByTestId('lens-assumption')
    expect(el.className).toContain('decoration-dashed')
    expect(el.className).toContain('decoration-blue-400')
  })

  it('ASSUMPTION segment does not render ⚠ icon', () => {
    render(<LensText segment={assumption} />)
    expect(screen.queryByText('⚠')).not.toBeInTheDocument()
  })

  it('tooltip hidden by default', () => {
    render(<LensText segment={uncertain} />)
    expect(screen.queryByTestId('claim-tooltip')).not.toBeInTheDocument()
  })

  it('clicking UNCERTAIN opens tooltip with reason', () => {
    render(<LensText segment={uncertain} />)
    fireEvent.click(screen.getByTestId('lens-uncertain'))
    expect(screen.getByTestId('claim-tooltip')).toBeInTheDocument()
    expect(screen.getByText('Percentage varies by study.')).toBeInTheDocument()
  })

  it('clicking ASSUMPTION opens tooltip with reason', () => {
    render(<LensText segment={assumption} />)
    fireEvent.click(screen.getByTestId('lens-assumption'))
    expect(screen.getByTestId('claim-tooltip')).toBeInTheDocument()
    expect(screen.getByText('Inferred from trend data.')).toBeInTheDocument()
  })

  it('clicking dismiss closes tooltip', () => {
    render(<LensText segment={uncertain} />)
    fireEvent.click(screen.getByTestId('lens-uncertain'))
    fireEvent.click(screen.getByText('dismiss'))
    expect(screen.queryByTestId('claim-tooltip')).not.toBeInTheDocument()
  })

  it('VERIFIED segment with no reason is not clickable (no role=button)', () => {
    render(<LensText segment={verified} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
