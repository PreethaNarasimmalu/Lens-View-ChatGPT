import ReactMarkdown from 'react-markdown'
import LensText from './LensText'

const PROSE = 'text-sm leading-relaxed text-gray-900 dark:text-gray-100 prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-li:my-0.5 prose-headings:my-2'

export default function LensResponse({ segments, rawText, formattedText, lensViewActive }) {
  // formattedText is the clean Pass-1 markdown answer (always readable).
  // rawText may be that same text, or legacy JSON from old single-pass approach.
  const displayText = formattedText || rawText

  if (!lensViewActive || !segments) {
    return (
      <div data-testid="plain-response" className={PROSE}>
        <ReactMarkdown>{displayText}</ReactMarkdown>
      </div>
    )
  }

  // Build annotation map — only non-VERIFIED segments need highlighting
  const segmentMap = new Map()
  for (const seg of segments) {
    if (seg.type !== 'VERIFIED' && seg.text?.trim()) {
      segmentMap.set(seg.text, seg)
    }
  }

  // If displayText doesn't contain the segment texts (e.g. legacy or test data),
  // reconstruct markdown source from segments so annotations still appear.
  const hasMatch = [...segmentMap.keys()].some(t => displayText.includes(t))
  const markdownSource = hasMatch ? displayText : segments.map(s => s.text).join(' ')

  return (
    <div data-testid="lens-response" className={PROSE}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p>{annotate(children, segmentMap)}</p>,
          li: ({ children }) => <li>{annotate(children, segmentMap)}</li>,
          strong: ({ children }) => <strong>{annotate(children, segmentMap)}</strong>,
          em: ({ children }) => <em>{annotate(children, segmentMap)}</em>,
        }}
      >
        {markdownSource}
      </ReactMarkdown>
    </div>
  )
}

function annotate(children, segmentMap) {
  const arr = Array.isArray(children) ? children : [children]
  return arr.flatMap((child, ci) =>
    typeof child === 'string' ? splitBySegments(child, segmentMap, ci) : [child]
  )
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
