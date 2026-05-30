import ReactMarkdown from 'react-markdown'
import LensText from './LensText'

const PROSE = 'text-sm leading-relaxed text-gray-900 dark:text-gray-100 prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-li:my-0.5 prose-headings:my-2'

export default function LensResponse({ segments, rawText, formattedText, lensViewActive }) {
  if (!lensViewActive) {
    // If rawText is a Lens JSON blob, use formattedText or reconstruct from segments
    const isJson = rawText?.trimStart().startsWith('{') || rawText?.trimStart().startsWith('[')
    const displayText = isJson
      ? (formattedText || segments?.map(s => s.text).join(' ') || rawText)
      : rawText
    return (
      <div data-testid="plain-response" className={PROSE}>
        <ReactMarkdown>{displayText}</ReactMarkdown>
      </div>
    )
  }

  if (!segments) {
    return (
      <div data-testid="plain-response" className={PROSE}>
        <ReactMarkdown>{rawText}</ReactMarkdown>
      </div>
    )
  }

  // Use the pre-formatted markdown from the model when available, else reconstruct
  const markdownSource = formattedText || segments.map(s => s.text).join(' ')

  // Build a map of segment text → segment for non-VERIFIED annotation
  const segmentMap = new Map()
  for (const seg of segments) {
    if (seg.type !== 'VERIFIED' && seg.text?.trim()) {
      segmentMap.set(seg.text, seg)
    }
  }

  return (
    <div data-testid="lens-response" className={PROSE}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p>{annotateProse(children, segments, segmentMap)}</p>,
          li: ({ children }) => <li>{annotateProse(children, segments, segmentMap)}</li>,
          strong: ({ children }) => <strong>{annotateProse(children, segments, segmentMap)}</strong>,
          em: ({ children }) => <em>{annotateProse(children, segments, segmentMap)}</em>,
        }}
      >
        {markdownSource}
      </ReactMarkdown>
    </div>
  )
}

function annotateProse(children, segments, segmentMap) {
  const arr = Array.isArray(children) ? children : [children]
  return arr.flatMap((child, ci) => {
    if (typeof child !== 'string') return [child]
    return splitBySegments(child, segmentMap, ci)
  })
}

function splitBySegments(str, segmentMap, keyPrefix) {
  const matches = []
  for (const [segText, seg] of segmentMap) {
    let start = 0
    while (start < str.length) {
      const idx = str.indexOf(segText, start)
      if (idx === -1) break
      matches.push({ idx, end: idx + segText.length, seg })
      start = idx + segText.length
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
