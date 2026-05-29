import { useState, useRef, useEffect } from 'react'
import ClaimTooltip from './ClaimTooltip'

const TYPE_STYLES = {
  UNCERTAIN: 'underline decoration-dotted decoration-amber-400 underline-offset-3 cursor-pointer',
  ASSUMPTION: 'underline decoration-dashed decoration-blue-400 underline-offset-3 cursor-pointer',
  VERIFIED: '',
}

const TYPE_ICON = {
  UNCERTAIN: '⚠',
  ASSUMPTION: null,
  VERIFIED: null,
}

export default function LensText({ segment }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const isInteractive = segment.type !== 'VERIFIED' && segment.reason

  // Close tooltip when clicking outside
  useEffect(() => {
    if (!open) return
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(o => !o) }
    if (e.key === 'Escape') setOpen(false)
  }

  if (!isInteractive) {
    return (
      <span
        data-testid={`lens-${segment.type.toLowerCase()}`}
        className={TYPE_STYLES[segment.type]}
      >
        {TYPE_ICON[segment.type] && (
          <span aria-hidden="true" className="mr-0.5 text-amber-400 text-xs">{TYPE_ICON[segment.type]}</span>
        )}
        {segment.text}
      </span>
    )
  }

  return (
    <span ref={ref} className="relative inline">
      <span
        data-testid={`lens-${segment.type.toLowerCase()}`}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-label={`${segment.type} claim — click for reason`}
        onClick={() => setOpen(o => !o)}
        onKeyDown={handleKeyDown}
        className={`${TYPE_STYLES[segment.type]} select-none`}
      >
        {TYPE_ICON[segment.type] && (
          <span aria-hidden="true" className="mr-0.5 text-amber-400 text-xs">{TYPE_ICON[segment.type]}</span>
        )}
        {segment.text}
      </span>
      {open && <ClaimTooltip segment={segment} onClose={() => setOpen(false)} />}
    </span>
  )
}
