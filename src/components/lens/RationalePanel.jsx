import { useEffect, useRef } from 'react'

function SourceCard({ source, index }) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors">
      <div className="flex items-start gap-2">
        <span className="shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-semibold text-gray-400">
          {index + 1}
        </span>
        <a
          href={source.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors leading-snug line-clamp-2"
        >
          {source.title}
        </a>
      </div>
      {source.snippet && (
        <p className="text-xs text-gray-400 leading-relaxed pl-7 line-clamp-3">{source.snippet}</p>
      )}
    </div>
  )
}

function AssumptionRow({ segment }) {
  const isBaseless = !segment.reason
  return (
    <div className="flex items-start gap-2 py-1.5">
      <span
        aria-label={isBaseless ? 'baseless assumption' : 'assumption'}
        className={`shrink-0 mt-1 w-2 h-2 rounded-full ${isBaseless ? 'bg-amber-400' : 'bg-blue-400'}`}
      />
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-gray-200 leading-snug">"{segment.text}"</span>
        {segment.reason && (
          <span className="text-[11px] text-gray-500 leading-snug">{segment.reason}</span>
        )}
        {isBaseless && (
          <span className="text-[11px] text-amber-400 font-medium">No supporting reason provided</span>
        )}
      </div>
    </div>
  )
}

export default function RationalePanel({ message, onClose }) {
  const panelRef = useRef(null)

  // Trap focus inside panel and close on Escape
  useEffect(() => {
    panelRef.current?.focus()
    function handler(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  if (!message) return null

  const segments = message.segments ?? []

  // Collect top 3 unique sources across all segments
  const allSources = segments
    .flatMap(s => s.sources ?? [])
    .filter(Boolean)
    .slice(0, 3)

  const assumptions = segments.filter(s => s.type === 'ASSUMPTION')
  const uncertainItems = segments.filter(s => s.type === 'UNCERTAIN')

  return (
    /* Backdrop */
    <div
      data-testid="rationale-backdrop"
      className="fixed inset-0 z-40 flex items-end justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Dim overlay */}
      <div className="absolute inset-0 bg-black/40 animate-[fadeIn_0.2s_ease]" aria-hidden="true" />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-label="Response rationale"
        aria-modal="true"
        data-testid="rationale-panel"
        className="
          relative z-50 w-full max-w-2xl mx-4 mb-4
          bg-[#1e1e1e] border border-white/10 rounded-2xl
          shadow-2xl outline-none
          animate-[slideUp_0.25s_cubic-bezier(0.16,1,0.3,1)]
          max-h-[80vh] overflow-y-auto
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 sticky top-0 bg-[#1e1e1e] rounded-t-2xl">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h2 className="text-sm font-semibold text-gray-100">Response Rationale</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close rationale panel"
            data-testid="rationale-close"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-200 hover:bg-white/10 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Sources */}
          {allSources.length > 0 && (
            <section data-testid="sources-section">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Sources referenced
              </h3>
              <div className="space-y-2">
                {allSources.map((src, i) => (
                  <SourceCard key={i} source={src} index={i} />
                ))}
              </div>
            </section>
          )}

          {/* Assumptions */}
          {assumptions.length > 0 && (
            <section data-testid="assumptions-section">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                Assumptions made
                <span className="px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-semibold">
                  {assumptions.length}
                </span>
              </h3>
              <div className="divide-y divide-white/5">
                {assumptions.map((seg, i) => (
                  <AssumptionRow key={i} segment={seg} />
                ))}
              </div>
            </section>
          )}

          {/* Uncertain claims */}
          {uncertainItems.length > 0 && (
            <section data-testid="uncertain-section">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                Uncertain claims
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-semibold">
                  {uncertainItems.length}
                </span>
              </h3>
              <div className="divide-y divide-white/5">
                {uncertainItems.map((seg, i) => (
                  <div key={i} className="flex items-start gap-2 py-1.5">
                    <span aria-hidden="true" className="shrink-0 mt-1 text-amber-400 text-xs">⚠</span>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-gray-200 leading-snug">"{seg.text}"</span>
                      {seg.reason && (
                        <span className="text-[11px] text-gray-500 leading-snug">{seg.reason}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Empty state */}
          {allSources.length === 0 && assumptions.length === 0 && uncertainItems.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No flagged claims in this response.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
