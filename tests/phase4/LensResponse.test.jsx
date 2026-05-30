import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LensResponse from '../../src/components/lens/LensResponse'

const segments = [
  { text: 'The Earth orbits the Sun.', type: 'VERIFIED', reason: null, sources: null },
  { text: '97% agree.', type: 'UNCERTAIN', reason: 'Varies by study.', sources: null },
  { text: 'It will worsen.', type: 'ASSUMPTION', reason: 'Inferred.', sources: null },
]

describe('LensResponse — Phase 4', () => {
  it('renders plain-response when lensViewActive=false', () => {
    render(<LensResponse segments={segments} rawText="plain text" lensViewActive={false} />)
    expect(screen.getByTestId('plain-response')).toBeInTheDocument()
    expect(screen.queryByTestId('lens-response')).not.toBeInTheDocument()
  })

  it('renders plain-response when segments is null even if lensViewActive=true', () => {
    render(<LensResponse segments={null} rawText="plain text" lensViewActive={true} />)
    expect(screen.getByTestId('plain-response')).toBeInTheDocument()
  })

  it('renders lens-response when lensViewActive=true and segments exist', () => {
    render(<LensResponse segments={segments} rawText="raw" lensViewActive={true} />)
    expect(screen.getByTestId('lens-response')).toBeInTheDocument()
    expect(screen.queryByTestId('plain-response')).not.toBeInTheDocument()
  })

  it('renders UNCERTAIN and ASSUMPTION segments with annotation in lens mode', () => {
    render(<LensResponse segments={segments} rawText="raw" lensViewActive={true} />)
    // VERIFIED segments are plain text (no annotation wrapper) — only non-VERIFIED get LensText
    expect(screen.getByTestId('lens-uncertain')).toBeInTheDocument()
    expect(screen.getByTestId('lens-assumption')).toBeInTheDocument()
  })

  it('plain-response shows rawText when lensView is off', () => {
    render(<LensResponse segments={segments} rawText="The raw answer" lensViewActive={false} />)
    expect(screen.getByText('The raw answer')).toBeInTheDocument()
  })

  it('toggle from false to true switches rendering', () => {
    const { rerender } = render(
      <LensResponse segments={segments} rawText="raw" lensViewActive={false} />
    )
    expect(screen.getByTestId('plain-response')).toBeInTheDocument()
    rerender(<LensResponse segments={segments} rawText="raw" lensViewActive={true} />)
    expect(screen.getByTestId('lens-response')).toBeInTheDocument()
  })

  it('toggle from true to false switches rendering back', () => {
    const { rerender } = render(
      <LensResponse segments={segments} rawText="raw" lensViewActive={true} />
    )
    expect(screen.getByTestId('lens-response')).toBeInTheDocument()
    rerender(<LensResponse segments={segments} rawText="raw" lensViewActive={false} />)
    expect(screen.getByTestId('plain-response')).toBeInTheDocument()
  })
})
