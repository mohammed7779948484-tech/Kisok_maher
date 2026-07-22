import type { AdminEntityID, AdminMediaDTO } from '../types'

export function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null
}

export function readBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback
}

export function readID(value: unknown): AdminEntityID | null {
  if (typeof value === 'number' || typeof value === 'string') return value

  const record = asRecord(value)
  const id = record?.id
  return typeof id === 'number' || typeof id === 'string' ? id : null
}

export function readNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

export function readNullableNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

export function readString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

export function readMedia(value: unknown): AdminMediaDTO | null {
  const record = asRecord(value)
  const id = readID(record)
  if (!record || id === null) return null

  const url = readString(record.url) || readString(record.cloudinary_secure_url)

  return {
    alt: readString(record.alt) || null,
    filename: readString(record.filename) || null,
    id,
    url: url || null,
  }
}

export function readRelationshipLabel(
  value: unknown,
  labelField = 'name',
): { id: AdminEntityID; name: string } | null {
  const record = asRecord(value)
  const id = readID(value)
  if (!record || id === null) return null

  return {
    id,
    name: readString(record[labelField], String(id)),
  }
}
