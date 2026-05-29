import ReactMarkdown from 'react-markdown'
import LensText from './LensText'

const PROSE = 'text-sm leading-relaxed text-gray-900 dark:text-gray-100 prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-li:my-0.5 prose-headings:my-2'

export default function LensResponse({ segments, rawText, lensViewActive }) {
  if (!lensViewActive || !segments) {
    return (
      <div data-testid="plain-response" className={PROSE}>
        <ReactMarkdown>{rawText}</ReactMarkdown>
      </div>
    )
  }

  return (
    <p data-testid="lens-response" className="text-sm leading-relaxed text-gray-900 dark:text-gray-100">
      {segments.map((seg, i) => (
        <LensText key={i} segment={seg} />
      ))}
    </p>
  )
}
