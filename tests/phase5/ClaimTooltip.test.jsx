import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ClaimTooltip from '../../src/components/lens/ClaimTooltip'

const uncertainSeg = { text: 'claim', type: 'UNCERTAIN', reason: 'Not fully verified.', sources: null }
const assumptionSeg = { text: 'guess', type: 'ASSUMPTION', reason: 'Inferred.', sources: null }
const verifiedSeg = { text: 'fact', type: 'VERIFIED', reason: null, sources: null }

describe('ClaimTooltip — Phase 5', () => {
  it('renders with testid claim-tooltip', () => {
    render(<ClaimTooltip segment={uncertainSeg} onClose={() => {}} />)
    expect(screen.getByTestId('claim-tooltip')).toBeInTheDocument()
  })

  it('has role=tooltip', () => {
    render(<ClaimTooltip segment={uncertainSeg} onClose={() => {}} />)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })

  it('shows reason text', () => {
    render(<ClaimTooltip segment={uncertainSeg} onClose={() => {}} />)
    expect(screen.getByText('Not fully verified.')).toBeInTheDocument()
  })

  it('shows UNCERTAIN badge label', () => {
    render(<ClaimTooltip segment={uncertainSeg} onClose={() => {}} />)
    expect(screen.getByText('⚠ Uncertain')).toBeInTheDocument()
  })

  it('shows ASSUMPTION badge label', () => {
    render(<ClaimTooltip segment={assumptionSeg} onClose={() => {}} />)
    expect(screen.getByText('Assumption')).toBeInTheDocument()
  })

  it('shows VERIFIED badge label', () => {
    render(<ClaimTooltip segment={verifiedSeg} onClose={() => {}} />)
    expect(screen.getByText('✓ Verified')).toBeInTheDocument()
  })

  it('calls onClose when dismiss is clicked', () => {
    const onClose = vi.fn()
    render(<ClaimTooltip segment={uncertainSeg} onClose={onClose} />)
    fireEvent.click(screen.getByText('dismiss'))
    expect(onClose).toHaveBeenCalled()
  })
})
