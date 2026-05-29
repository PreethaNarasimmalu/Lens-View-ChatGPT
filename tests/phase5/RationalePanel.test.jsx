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
      sources: [
        { title: 'Nature Study', url: 'https://nature.com', snippet: 'Scientists find...' },
        { title: 'MIT Report', url: 'https://mit.edu', snippet: 'Research shows...' },
      ],
    },
    { text: 'Will worsen.', type: 'ASSUMPTION', reason: 'Inferred from trends.', sources: null },
    { text: 'No basis here.', type: 'ASSUMPTION', reason: null, sources: null },
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

  it('renders sources section when sources exist', () => {
    render(<RationalePanel message={msgWithAll} onClose={() => {}} />)
    expect(screen.getByTestId('sources-section')).toBeInTheDocument()
  })

  it('renders source titles', () => {
    render(<RationalePanel message={msgWithAll} onClose={() => {}} />)
    expect(screen.getByText('Nature Study')).toBeInTheDocument()
    expect(screen.getByText('MIT Report')).toBeInTheDocument()
  })

  it('renders source snippets', () => {
    render(<RationalePanel message={msgWithAll} onClose={() => {}} />)
    expect(screen.getByText('Scientists find...')).toBeInTheDocument()
  })

  it('renders assumptions section', () => {
    render(<RationalePanel message={msgWithAll} onClose={() => {}} />)
    expect(screen.getByTestId('assumptions-section')).toBeInTheDocument()
  })

  it('renders assumption text', () => {
    render(<RationalePanel message={msgWithAll} onClose={() => {}} />)
    expect(screen.getByText('"Will worsen."')).toBeInTheDocument()
  })

  it('flags baseless assumption (no reason) with amber dot', () => {
    render(<RationalePanel message={msgWithAll} onClose={() => {}} />)
    const baselessDots = screen.getAllByLabelText('baseless assumption')
    expect(baselessDots.length).toBeGreaterThan(0)
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
