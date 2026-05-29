import { describe, it, expect } from 'vitest'
import { parseLensResponse, hasLensContent } from '../../src/utils/parseLensResponse'

const validJson = JSON.stringify({
  response: [
    { text: 'The Earth orbits the Sun.', type: 'VERIFIED', reason: null, sources: null },
    { text: '97% of scientists agree on climate change.', type: 'UNCERTAIN', reason: 'Percentage varies by study.', sources: null },
    { text: 'This will worsen over time.', type: 'ASSUMPTION', reason: 'Inferred from current trends.', sources: null },
  ],
})

describe('parseLensResponse', () => {
  it('parses valid JSON into segments array', () => {
    const result = parseLensResponse(validJson)
    expect(result).toHaveLength(3)
  })

  it('maps type correctly for all three types', () => {
    const result = parseLensResponse(validJson)
    expect(result[0].type).toBe('VERIFIED')
    expect(result[1].type).toBe('UNCERTAIN')
    expect(result[2].type).toBe('ASSUMPTION')
  })

  it('preserves text content', () => {
    const result = parseLensResponse(validJson)
    expect(result[0].text).toBe('The Earth orbits the Sun.')
    expect(result[1].text).toBe('97% of scientists agree on climate change.')
  })

  it('preserves reason field', () => {
    const result = parseLensResponse(validJson)
    expect(result[1].reason).toBe('Percentage varies by study.')
    expect(result[0].reason).toBeNull()
  })

  it('strips markdown code fences before parsing', () => {
    const fenced = '```json\n' + validJson + '\n```'
    const result = parseLensResponse(fenced)
    expect(result).toHaveLength(3)
    expect(result[0].type).toBe('VERIFIED')
  })

  it('strips plain code fences (no language tag)', () => {
    const fenced = '```\n' + validJson + '\n```'
    const result = parseLensResponse(fenced)
    expect(result).toHaveLength(3)
  })

  it('falls back to single VERIFIED segment on invalid JSON', () => {
    const result = parseLensResponse('This is just plain text, not JSON.')
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('VERIFIED')
    expect(result[0].text).toBe('This is just plain text, not JSON.')
  })

  it('falls back on missing response key', () => {
    const result = parseLensResponse(JSON.stringify({ data: [] }))
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('VERIFIED')
  })

  it('falls back on empty response array', () => {
    const result = parseLensResponse(JSON.stringify({ response: [] }))
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('VERIFIED')
  })

  it('falls back on null/undefined input', () => {
    expect(parseLensResponse(null)[0].type).toBe('VERIFIED')
    expect(parseLensResponse(undefined)[0].type).toBe('VERIFIED')
  })

  it('defaults unknown type to VERIFIED', () => {
    const json = JSON.stringify({ response: [{ text: 'hi', type: 'BOGUS', reason: null }] })
    const result = parseLensResponse(json)
    expect(result[0].type).toBe('VERIFIED')
  })

  it('filters out segments with empty text', () => {
    const json = JSON.stringify({
      response: [
        { text: 'Valid text', type: 'VERIFIED', reason: null },
        { text: '', type: 'UNCERTAIN', reason: 'empty' },
      ],
    })
    const result = parseLensResponse(json)
    expect(result).toHaveLength(1)
    expect(result[0].text).toBe('Valid text')
  })
})

describe('hasLensContent', () => {
  it('returns true when any segment is non-VERIFIED', () => {
    const segs = [
      { text: 'a', type: 'VERIFIED' },
      { text: 'b', type: 'UNCERTAIN' },
    ]
    expect(hasLensContent(segs)).toBe(true)
  })

  it('returns false when all segments are VERIFIED', () => {
    const segs = [{ text: 'a', type: 'VERIFIED' }]
    expect(hasLensContent(segs)).toBe(false)
  })

  it('returns false for null/non-array', () => {
    expect(hasLensContent(null)).toBe(false)
    expect(hasLensContent('string')).toBe(false)
  })
})
