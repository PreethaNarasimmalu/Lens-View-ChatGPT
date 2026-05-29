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
    <div data-testid="lens-response" className={PROSE}>
      <ReactMarkdown
        components={{
          // Replace every paragraph / list-item text node with annotated LensText spans
          p: ({ children }) => <p>{annotateProse(children, segments)}</p>,
          li: ({ children }) => <li>{annotateProse(children, segments)}</li>,
          strong: ({ children }) => <strong>{annotateProse(children, segments)}</strong>,
          em: ({ children }) => <em>{annotateProse(children, segments)}</em>,
        }}
      >
        {buildMarkdown(segments)}
      </ReactMarkdown>
    </div>
  )
}

// Reconstruct a markdown string from segments so lists / paragraphs are preserved
function buildMarkdown(segments) {
  return segments.map(s => s.text).join(' ')
}

// Walk React children, annotating string nodes that match segment texts
function annotateProse(children, segments) {
  const annotatable = segments.filter(s => s.text?.trim())
  const arr = Array.isArray(children) ? children : [children]
  return arr.flatMap((child, ci) => {
    if (typeof child !== 'string') return [child]
    return splitBySegments(child, annotatable, ci)
  })
}

function splitBySegments(str, nonVerified, keyPrefix) {
  const matches = []
  for (const seg of nonVerified) {
    let start = 0
    while (start < str.length) {
      const idx = str.indexOf(seg.text, start)
      if (idx === -1) break
      matches.push({ idx, end: idx + seg.text.length, seg })
      start = idx + seg.text.length
    }
  }
  if (!matches.length) return [str]

  matches.sort((a, b) => a.idx - b.idx)
  const clean = []
  for (const m of matches) {
    if (!clean.length || m.idx >= clean[clean.length - 1].end) clean.push(m)
  }

  const result = []
  let pos = 0
  for (const { idx, end, seg } of clean) {
    if (idx > pos) result.push(str.slice(pos, idx))
    result.push(<LensText key={`${keyPrefix}-${idx}`} segment={seg} />)
    pos = end
  }
  if (pos < str.length) result.push(str.slice(pos))
  return result
}
