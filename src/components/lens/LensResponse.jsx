import LensText from './LensText'

const TEXT_CLASS = 'text-sm leading-relaxed text-gray-900 dark:text-gray-100 whitespace-pre-wrap'

export default function LensResponse({ segments, rawText, lensViewActive }) {
  if (!lensViewActive || !segments) {
    return (
      <p data-testid="plain-response" className={TEXT_CLASS}>
        {rawText}
      </p>
    )
  }

  return (
    <p data-testid="lens-response" className={TEXT_CLASS}>
      {segments.map((seg, i) => (
        <LensText key={i} segment={seg} />
      ))}
    </p>
  )
}
