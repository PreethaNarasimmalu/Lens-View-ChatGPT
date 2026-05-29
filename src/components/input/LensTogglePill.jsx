export default function LensTogglePill({ active, onToggle }) {
  return (
    <button
      data-testid="lens-toggle"
      onClick={onToggle}
      aria-pressed={active}
      aria-label={`Lens View ${active ? 'on' : 'off'}`}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
        border transition-all duration-200 shrink-0
        ${active
          ? 'bg-violet-600 border-violet-500 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]'
          : 'bg-transparent border-white/20 text-gray-400 hover:border-white/40 hover:text-gray-300'
        }
      `}
    >
      {/* Lens icon */}
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="11" cy="11" r="7" />
        <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
        <path strokeLinecap="round" d="M11 8v6M8 11h6" />
      </svg>
      Lens View
      <span className={`text-[10px] font-semibold tracking-wide ${active ? 'text-violet-200' : 'text-gray-600'}`}>
        {active ? 'ON' : 'OFF'}
      </span>
    </button>
  )
}
