const VALID_TYPES = new Set(['VERIFIED', 'UNCERTAIN', 'ASSUMPTION'])

function parseJson(rawText) {
  if (!rawText || typeof rawText !== 'string') return null
  let cleaned = rawText.trim()
  const fenceMatch = cleaned.match(/^```(?:json)?\s*([\s\S]*?)```\s*$/)
  if (fenceMatch) cleaned = fenceMatch[1].trim()
  try { return JSON.parse(cleaned) } catch { return null }
}

/**
 * Parses a Groq Lens View JSON response into a segments array.
 * Always returns a non-empty array — falls back to a single VERIFIED
 * segment containing the raw text if parsing fails at any point.
 */
export function parseLensResponse(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return [{ text: rawText ?? '', type: 'VERIFIED', reason: null, sources: null }]
  }

  const parsed = parseJson(rawText)
  if (!parsed) {
    return [{ text: rawText, type: 'VERIFIED', reason: null, sources: null }]
  }

  const segments = parsed?.response
  if (!Array.isArray(segments) || segments.length === 0) {
    return [{ text: rawText, type: 'VERIFIED', reason: null, sources: null }]
  }

  const mapped = segments
    .filter(s => s && typeof s.text === 'string' && s.text.length > 0)
    .map(s => ({
      text: s.text,
      type: VALID_TYPES.has(s.type) ? s.type : 'VERIFIED',
      reason: typeof s.reason === 'string' ? s.reason : null,
      verify_by: typeof s.verify_by === 'string' ? s.verify_by.trim() : null,
      sources: null,
    }))

  return mapped.length > 0
    ? mapped
    : [{ text: rawText, type: 'VERIFIED', reason: null, sources: null }]
}

/** Extracts the pre-formatted markdown text from a Lens View JSON response. */
export function parseFormattedText(rawText) {
  const parsed = parseJson(rawText)
  return typeof parsed?.formatted === 'string' && parsed.formatted.trim()
    ? parsed.formatted
    : null
}

export function hasLensContent(segments) {
  return Array.isArray(segments) && segments.some(s => s.type !== 'VERIFIED')
}
