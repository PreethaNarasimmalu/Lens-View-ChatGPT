import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import RationalePanel from '../../src/components/lens/RationalePanel'

const msgWithAll = {
  id: '1',
  role: 'assistant',
  rawText: 'full text',
  segments: [
    { text: 'Fact.', type: 'VERIFIED', reason: null, sources: null },
    {
      text: '97% agree.',
      type: 'UNCERTAIN',
      reason: 'Varies by study.',
      verify_by: 'Check a peer-reviewed meta-analysis on this topic.',
      sources: null,
    },
    { text: 'Will worsen.', type: 'ASSUMPTION', reason: 'Inferred from trends.', verify_by: null, sources: null },
    { text: 'No basis here.', type: 'ASSUMPTION', reason: null, verify_by: null, sources: null },
  ],
}

const msgNoSegments = {
  id: '2',
  role: 'assistant',
  rawText: 'plain',
  segments: [],
}

describe('RationalePanel — Phase 5', () => {
  it('renders the panel with testid rationale-panel', () => {
    render(<RationalePanel message={msgWithAll} onClose={() => {}} />)
    expect(screen.getByTestId('rationale-panel')).toBeInTheDocument()
  })

  it('renders the backdrop', () => {
    render(<RationalePanel message={msgWithAll} onClose={() => {}} />)
    expect(screen.getByTestId('rationale-backdrop')).toBeInTheDocument()
  })

  it('renders the close button', () => {
    render(<RationalePanel message={msgWithAll} onClose={() => {}} />)
    expect(screen.getByTestId('rationale-close')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<RationalePanel message={msgWithAll} onClose={onClose} />)
    fireEvent.click(screen.getByTestId('rationale-close'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn()
    render(<RationalePanel message={msgWithAll} onClose={onClose} />)
    fireEvent.click(screen.getByTestId('rationale-backdrop'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onClose on Escape key', () => {
    const onClose = vi.fn()
    render(<RationalePanel message={msgWithAll} onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('renders verify_by hint when present', () => {
    render(<RationalePanel message={msgWithAll} onClose={() => {}} />)
    expect(screen.getByText('Check a peer-reviewed meta-analysis on this topic.')).toBeInTheDocument()
  })

  it('renders assumptions section', () => {
    render(<RationalePanel message={msgWithAll} onClose={() => {}} />)
    expect(screen.getByTestId('assumptions-section')).toBeInTheDocument()
  })

  it('renders assumption text', () => {
    render(<RationalePanel message={msgWithAll} onClose={() => {}} />)
    expect(screen.getByText('"Will worsen."')).toBeInTheDocument()
  })


  it('renders uncertain section', () => {
    render(<RationalePanel message={msgWithAll} onClose={() => {}} />)
    expect(screen.getByTestId('uncertain-section')).toBeInTheDocument()
  })

  it('renders uncertain claim text', () => {
    render(<RationalePanel message={msgWithAll} onClose={() => {}} />)
    expect(screen.getByText('"97% agree."')).toBeInTheDocument()
  })

  it('renders uncertainty reason', () => {
    render(<RationalePanel message={msgWithAll} onClose={() => {}} />)
    expect(screen.getByText('Varies by study.')).toBeInTheDocument()
  })

  it('shows empty state message when no flagged claims', () => {
    render(<RationalePanel message={msgNoSegments} onClose={() => {}} />)
    expect(screen.getByText('No flagged claims in this response.')).toBeInTheDocument()
  })

  it('returns null when message is null', () => {
    const { container } = render(<RationalePanel message={null} onClose={() => {}} />)
    expect(container.firstChild).toBeNull()
  })

  it('panel has role=dialog for accessibility', () => {
    render(<RationalePanel message={msgWithAll} onClose={() => {}} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})
