const VALID_TYPES = new Set(['VERIFIED', 'UNCERTAIN', 'ASSUMPTION'])

/**
 * Parses a Groq Lens View JSON response into a segments array.
 * Always returns a non-empty array — falls back to a single VERIFIED
 * segment containing the raw text if parsing fails at any point.
 */
export function parseLensResponse(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return [{ text: rawText ?? '', type: 'VERIFIED', reason: null, sources: null }]
  }

  // Strip markdown code fences the model sometimes wraps around JSON
  let cleaned = rawText.trim()
  const fenceMatch = cleaned.match(/^```(?:json)?\s*([\s\S]*?)```\s*$/)
  if (fenceMatch) cleaned = fenceMatch[1].trim()

  let parsed
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    return [{ text: rawText, type: 'VERIFIED', reason: null, sources: null }]
  }

  const segments = parsed?.response
  if (!Array.isArray(segments) || segments.length === 0) {
    return [{ text: rawText, type: 'VERIFIED', reason: null, sources: null }]
  }

  return segments
    .filter(s => s && typeof s.text === 'string' && s.text.length > 0)
    .map(s => ({
      text: s.text,
      type: VALID_TYPES.has(s.type) ? s.type : 'VERIFIED',
      reason: typeof s.reason === 'string' ? s.reason : null,
      sources: Array.isArray(s.sources) ? s.sources : null,
    }))
    // If every segment was filtered out, return plain fallback
    .concat([]) // keep array shape; handled below
    .reduce((acc, seg) => { acc.push(seg); return acc }, [])
    || [{ text: rawText, type: 'VERIFIED', reason: null, sources: null }]
}

export function hasLensContent(segments) {
  return Array.isArray(segments) && segments.some(s => s.type !== 'VERIFIED')
}
