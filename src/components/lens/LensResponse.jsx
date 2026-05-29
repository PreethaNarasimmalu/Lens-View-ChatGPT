import LensText from './LensText'

export default function LensResponse({ segments, rawText, lensViewActive }) {
  // Lens View OFF — always plain text
  if (!lensViewActive || !segments) {
    return (
      <p data-testid="plain-response" className="text-sm leading-relaxed text-gray-100 whitespace-pre-wrap">
        {rawText}
      </p>
    )
  }

  return (
    <p data-testid="lens-response" className="text-sm leading-relaxed text-gray-100 whitespace-pre-wrap">
      {segments.map((seg, i) => (
        <LensText key={i} segment={seg} />
      ))}
    </p>
  )
}
