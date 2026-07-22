import type { PayloadRequest } from 'payload'

import {
  asRecord,
  readBoolean,
  readID,
  readMedia,
  readNullableNumber,
  readNumber,
  readString,
} from '../lib/data'
import type { AdminMediaDTO, ProductVariantsViewDTO, ProductVariantDTO } from '../types'
import type { CollectionCRUDPermissions } from '../lib/permissions'

export async function getProductVariantsViewData(
  req: PayloadRequest,
  productID: number | string,
  permissions: CollectionCRUDPermissions,
  canReadPrice: boolean,
): Promise<ProductVariantsViewDTO> {
  const { payload, user } = req
  if (!user) throw new Error('Authentication is required to manage variants')

  const access = { overrideAccess: false as const, req, user }
  const [product, variantsResult, mediaResult] = await Promise.all([
    payload.findByID({
      ...access,
      collection: 'products',
      depth: 0,
      id: productID,
      select: { name: true },
    }),
    payload.find({
      ...access,
      collection: 'product_variants',
      depth: 1,
      limit: 200,
      select: {
        images: true,
        is_active: true,
        option_value: true,
        price: true,
        sku: true,
        sort_order: true,
        stock_quantity: true,
        variant_name: true,
      },
      sort: 'sort_order',
      where: { product: { equals: productID } },
    }),
    payload.find({
      ...access,
      collection: 'media',
      depth: 0,
      limit: 200,
      select: { alt: true, cloudinary_secure_url: true, filename: true, url: true },
      sort: '-createdAt',
    }),
  ])

  const productRecord = asRecord(product)
  const variants: ProductVariantDTO[] = variantsResult.docs.flatMap((doc) => {
    const record = asRecord(doc)
    const id = readID(doc)
    if (!record || id === null) return []
    const images = Array.isArray(record.images) ? record.images : []
    return [{
      id,
      image: readMedia(asRecord(images[0])?.image),
      isActive: readBoolean(record.is_active, true),
      name: readString(record.variant_name, String(id)),
      optionValue: readString(record.option_value),
      price: canReadPrice ? readNullableNumber(record.price) : null,
      sku: readString(record.sku),
      sortOrder: readNumber(record.sort_order),
      stockQuantity: readNumber(record.stock_quantity),
    }]
  })

  const media: AdminMediaDTO[] = mediaResult.docs
    .map((doc) => readMedia(doc))
    .filter((item): item is AdminMediaDTO => item !== null)

  return {
    canReadPrice,
    canCreate: permissions.create,
    canDelete: permissions.delete,
    canUpdate: permissions.update,
    media,
    productID,
    productName: readString(productRecord?.name, String(productID)),
    variants,
  }
}
