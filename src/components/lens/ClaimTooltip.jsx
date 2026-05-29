const BADGE_STYLES = {
  UNCERTAIN: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  ASSUMPTION: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  VERIFIED: 'bg-green-500/20 text-green-300 border-green-500/30',
}

const LABEL = {
  UNCERTAIN: '⚠ Uncertain',
  ASSUMPTION: 'Assumption',
  VERIFIED: '✓ Verified',
}

export default function ClaimTooltip({ segment, onClose }) {
  return (
    <span
      role="tooltip"
      data-testid="claim-tooltip"
      className="
        absolute z-50 left-0 top-full mt-1
        w-64 p-3 rounded-xl
        bg-[#1a1a1a] border border-white/10
        shadow-xl text-xs text-gray-300
        flex flex-col gap-2
      "
    >
      <span className={`self-start px-2 py-0.5 rounded-full border text-[10px] font-semibold ${BADGE_STYLES[segment.type]}`}>
        {LABEL[segment.type]}
      </span>
      {segment.reason && <span className="leading-relaxed">{segment.reason}</span>}
      <button
        onClick={onClose}
        className="self-end text-gray-500 hover:text-gray-300 transition-colors text-[10px]"
      >
        dismiss
      </button>
    </span>
  )
}
