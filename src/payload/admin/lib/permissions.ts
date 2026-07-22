import type { SanitizedPermissions } from 'payload'

export interface CollectionCRUDPermissions {
  create: boolean
  delete: boolean
  read: boolean
  update: boolean
}

export interface GlobalPermissions {
  read: boolean
  update: boolean
}

export function getCollectionCRUDPermissions(
  permissions: SanitizedPermissions | undefined,
  collectionSlug: string,
): CollectionCRUDPermissions {
  const collection = permissions?.collections?.[collectionSlug]
  return {
    create: collection?.create === true,
    delete: collection?.delete === true,
    read: collection?.read === true,
    update: collection?.update === true,
  }
}

export function getGlobalPermissions(
  permissions: SanitizedPermissions | undefined,
  globalSlug: string,
): GlobalPermissions {
  const global = permissions?.globals?.[globalSlug]
  return {
    read: global?.read === true,
    update: global?.update === true,
  }
}

export function hasCollectionFieldReadPermission(
  permissions: SanitizedPermissions | undefined,
  collectionSlug: string,
  fieldName: string,
): boolean {
  const fields = permissions?.collections?.[collectionSlug]?.fields
  if (fields === true) return true
  const field = fields?.[fieldName]
  return field === true || field?.read === true
}
