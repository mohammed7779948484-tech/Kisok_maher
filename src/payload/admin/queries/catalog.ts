import type { PayloadRequest } from 'payload'

import {
  asRecord,
  readBoolean,
  readID,
  readMedia,
  readNumber,
  readRelationshipLabel,
  readString,
} from '../lib/data'
import type { AdminMediaDTO, CatalogBrandDTO, CatalogCategoryDTO, CatalogDTO } from '../types'
import type { CollectionCRUDPermissions } from '../lib/permissions'

export async function getCatalogData(
  req: PayloadRequest,
  permissions: { brands: CollectionCRUDPermissions; categories: CollectionCRUDPermissions },
): Promise<CatalogDTO> {
  const { payload, user } = req
  if (!user) throw new Error('Authentication is required to manage the catalog')

  const access = { overrideAccess: false as const, req, user }
  const [brandsResult, categoriesResult, mediaResult] = await Promise.all([
    permissions.brands.read ? payload.find({
      ...access,
      collection: 'brands',
      depth: 1,
      limit: 200,
      select: { description: true, is_active: true, logo: true, name: true, sort_order: true },
      sort: 'sort_order',
    }) : Promise.resolve({ docs: [] }),
    permissions.categories.read ? payload.find({
      ...access,
      collection: 'categories',
      depth: 1,
      limit: 200,
      select: { image: true, is_active: true, name: true, parent: true, sort_order: true },
      sort: 'sort_order',
    }) : Promise.resolve({ docs: [] }),
    payload.find({
      ...access,
      collection: 'media',
      depth: 0,
      limit: 200,
      select: { alt: true, cloudinary_secure_url: true, filename: true, url: true },
      sort: '-createdAt',
    }),
  ])

  const brands: CatalogBrandDTO[] = brandsResult.docs.flatMap((doc) => {
    const record = asRecord(doc)
    const id = readID(doc)
    if (!record || id === null) return []
    return [{
      description: readString(record.description) || null,
      id,
      image: readMedia(record.logo),
      isActive: readBoolean(record.is_active, true),
      name: readString(record.name, String(id)),
      sortOrder: readNumber(record.sort_order),
    }]
  })

  const categories: CatalogCategoryDTO[] = categoriesResult.docs.flatMap((doc) => {
    const record = asRecord(doc)
    const id = readID(doc)
    if (!record || id === null) return []
    return [{
      id,
      image: readMedia(record.image),
      isActive: readBoolean(record.is_active, true),
      name: readString(record.name, String(id)),
      parent: readRelationshipLabel(record.parent),
      sortOrder: readNumber(record.sort_order),
    }]
  })

  const media: AdminMediaDTO[] = mediaResult.docs
    .map((doc) => readMedia(doc))
    .filter((item): item is AdminMediaDTO => item !== null)

  return {
    brands,
    categories,
    media,
    permissions: {
      brands: {
        create: permissions.brands.create,
        delete: permissions.brands.delete,
        read: permissions.brands.read,
        update: permissions.brands.update,
      },
      categories: {
        create: permissions.categories.create,
        delete: permissions.categories.delete,
        read: permissions.categories.read,
        update: permissions.categories.update,
      },
    },
  }
}
