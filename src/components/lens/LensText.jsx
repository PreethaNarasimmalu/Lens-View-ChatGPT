import { useState, useRef, useEffect } from 'react'
import ClaimTooltip from './ClaimTooltip'

// Color + pattern for each type (colorblind-safe: pattern is secondary signal)
const TYPE_STYLES = {
  // Dotted underline (pattern) + amber (color) + ⚠ icon (shape)
  UNCERTAIN:  'underline decoration-dotted decoration-amber-400 decoration-2 underline-offset-[3px] cursor-pointer bg-amber-400/10 rounded-sm px-0.5',
  // Dashed underline (pattern) + blue (color) + ~ prefix (shape)
  ASSUMPTION: 'underline decoration-dashed decoration-blue-400 decoration-2 underline-offset-[3px] cursor-pointer bg-blue-400/10 rounded-sm px-0.5',
  VERIFIED:   '',
}

// Visible non-color signal for each type (icon or glyph)
const TYPE_PREFIX = {
  UNCERTAIN:  { label: '⚠ ', srOnly: 'Uncertain claim: ' },
  ASSUMPTION: { label: '~ ',  srOnly: 'Assumption: ' },
  VERIFIED:   null,
}

const SR_SUFFIX = {
  UNCERTAIN:  ' (uncertain — click for details)',
  ASSUMPTION: ' (assumption — click for details)',
  VERIFIED:   '',
}

export default function LensText({ segment }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const isInteractive = segment.type !== 'VERIFIED' && segment.reason
  const prefix = TYPE_PREFIX[segment.type]

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

  // Screen-reader-only label injected via aria-label on the wrapper span
  const srLabel = prefix
    ? `${prefix.srOnly}${segment.text}${SR_SUFFIX[segment.type]}`
    : undefined

  if (!isInteractive) {
    return (
      <span
        data-testid={`lens-${segment.type.toLowerCase()}`}
        className={TYPE_STYLES[segment.type]}
        aria-label={srLabel}
      >
        {prefix && (
          <span
            aria-hidden="true"
            data-testid={`lens-icon-${segment.type.toLowerCase()}`}
            className={`mr-0.5 text-xs font-bold ${segment.type === 'UNCERTAIN' ? 'text-amber-400' : 'text-blue-400'}`}
          >
            {prefix.label}
          </span>
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
        aria-label={srLabel ?? `${segment.type} claim — click for reason`}
        onClick={() => setOpen(o => !o)}
        onKeyDown={handleKeyDown}
        className={`${TYPE_STYLES[segment.type]} select-none`}
      >
        {prefix && (
          <span
            aria-hidden="true"
            data-testid={`lens-icon-${segment.type.toLowerCase()}`}
            className={`mr-0.5 text-xs font-bold ${segment.type === 'UNCERTAIN' ? 'text-amber-400' : 'text-blue-400'}`}
          >
            {prefix.label}
          </span>
        )}
        {segment.text}
      </span>
      {open && <ClaimTooltip segment={segment} onClose={() => setOpen(false)} />}
    </span>
  )
}
