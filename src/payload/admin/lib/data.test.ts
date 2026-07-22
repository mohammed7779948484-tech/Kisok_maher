import { describe, expect, it } from 'vitest'

import { readMedia, readNullableNumber, readRelationshipLabel } from './data'

describe('Payload Admin DTO readers', () => {
  it('preserves the distinction between a missing internal price and explicit zero', () => {
    expect(readNullableNumber(undefined)).toBeNull()
    expect(readNullableNumber(null)).toBeNull()
    expect(readNullableNumber(0)).toBe(0)
    expect(readNullableNumber(12.5)).toBe(12.5)
  })

  it('prefers the standard Payload media URL and falls back to the existing cloud URL', () => {
    expect(readMedia({
      alt: 'Bottle',
      cloudinary_secure_url: 'https://example.com/fallback.webp',
      id: 7,
      url: 'https://example.com/payload.webp',
    })).toEqual({
      alt: 'Bottle',
      filename: null,
      id: 7,
      url: 'https://example.com/payload.webp',
    })
    expect(readMedia({ cloudinary_secure_url: 'https://example.com/fallback.webp', id: 'media-8' })?.url)
      .toBe('https://example.com/fallback.webp')
  })

  it('normalizes populated relationships without serializing full documents', () => {
    expect(readRelationshipLabel({ id: 4, name: 'Dragon Labs', private_note: 'ignored' }))
      .toEqual({ id: 4, name: 'Dragon Labs' })
  })
})
