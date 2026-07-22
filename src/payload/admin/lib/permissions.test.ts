import { describe, expect, it } from 'vitest'

import { getCollectionCRUDPermissions, getGlobalPermissions, hasCollectionFieldReadPermission } from './permissions'

describe('getCollectionCRUDPermissions', () => {
  it('returns only permissions explicitly granted by Payload', () => {
    const result = getCollectionCRUDPermissions({
      collections: {
        products: {
          create: true,
          fields: true,
          read: true,
        },
      },
    }, 'products')

    expect(result).toEqual({ create: true, delete: false, read: true, update: false })
  })

  it('denies every operation when the collection is absent', () => {
    expect(getCollectionCRUDPermissions(undefined, 'products')).toEqual({
      create: false,
      delete: false,
      read: false,
      update: false,
    })
  })

  it('reads field-level permission without assuming access', () => {
    expect(hasCollectionFieldReadPermission({ collections: { product_variants: { fields: { price: true } } } }, 'product_variants', 'price')).toBe(true)
    expect(hasCollectionFieldReadPermission({ collections: { product_variants: { fields: {} } } }, 'product_variants', 'price')).toBe(false)
  })

  it('derives global permissions without role checks', () => {
    expect(getGlobalPermissions({
      globals: {
        'site-settings': { fields: true, read: true },
      },
    }, 'site-settings')).toEqual({ read: true, update: false })
  })
})
