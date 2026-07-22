import type { Payload, TypedUser, Where } from 'payload'

import {
  asRecord,
  readBoolean,
  readID,
  readMedia,
  readNullableNumber,
  readNumber,
  readRelationshipLabel,
  readString,
} from '../lib/data'
import type {
  AdminMediaDTO,
  ProductFilterOptionDTO,
  ProductListItemDTO,
  ProductsListDTO,
  ProductVariantDTO,
} from '../types'
import type { CollectionCRUDPermissions } from '../lib/permissions'

const PAGE_SIZE = 15
const MAX_PREFILTER_VARIANTS = 1000

interface ProductsListArgs {
  payload: Payload
  permissions: {
    canReadVariantPrice: boolean
    products: CollectionCRUDPermissions
    variants: CollectionCRUDPermissions
  }
  searchParams: Record<string, string | string[] | undefined> | undefined
  user: TypedUser
}

function getParam(
  searchParams: ProductsListArgs['searchParams'],
  name: string,
): string {
  const value = searchParams?.[name]
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '')
}

function getSafeSort(value: string): string {
  const allowed = new Set(['name', '-name', 'createdAt', '-createdAt', 'sort_order', '-sort_order'])
  return allowed.has(value) ? value : 'sort_order'
}

function mapFilterOptions(docs: unknown[]): ProductFilterOptionDTO[] {
  return docs.flatMap((doc) => {
    const record = asRecord(doc)
    const id = readID(doc)
    if (!record || id === null) return []
    return [{ id, name: readString(record.name, String(id)) }]
  })
}

function mapVariant(doc: unknown, canReadPrice: boolean): ProductVariantDTO | null {
  const record = asRecord(doc)
  const id = readID(doc)
  if (!record || id === null) return null

  const images = Array.isArray(record.images) ? record.images : []
  const firstImage = asRecord(images[0])

  return {
    id,
    image: readMedia(firstImage?.image),
    isActive: readBoolean(record.is_active, true),
    name: readString(record.variant_name, String(id)),
    optionValue: readString(record.option_value),
    price: canReadPrice ? readNullableNumber(record.price) : null,
    sku: readString(record.sku),
    sortOrder: readNumber(record.sort_order),
    stockQuantity: readNumber(record.stock_quantity),
  }
}

export async function getProductsListData({
  payload,
  permissions,
  searchParams,
  user,
}: ProductsListArgs): Promise<ProductsListDTO> {
  const filters = {
    brand: getParam(searchParams, 'brand'),
    category: getParam(searchParams, 'category'),
    page: Math.max(1, Number.parseInt(getParam(searchParams, 'page') || '1', 10) || 1),
    search: getParam(searchParams, 'search').trim(),
    sort: getSafeSort(getParam(searchParams, 'sort')),
    status: getParam(searchParams, 'status'),
    stock: getParam(searchParams, 'stock'),
  }

  const access = { overrideAccess: false as const, user }
  let variantProductIDs: Array<number | string> | null = null

  if (filters.search || filters.stock) {
    const variantWhere: Where = { and: [] }
    if (filters.search) {
      variantWhere.and?.push({
        or: [
          { variant_name: { contains: filters.search } },
          { sku: { contains: filters.search } },
        ],
      })
    }

    if (filters.stock === 'out') {
      variantWhere.and?.push({ stock_quantity: { equals: 0 } })
    } else if (filters.stock === 'low') {
      variantWhere.and?.push({
        and: [
          { stock_quantity: { greater_than: 0 } },
          { stock_quantity: { less_than_equal: 5 } },
        ],
      })
    } else if (filters.stock === 'in') {
      variantWhere.and?.push({ stock_quantity: { greater_than: 5 } })
    }

    const variants = await payload.find({
      ...access,
      collection: 'product_variants',
      depth: 0,
      limit: MAX_PREFILTER_VARIANTS,
      select: { product: true },
      where: variantWhere,
    })

    variantProductIDs = Array.from(new Set(
      variants.docs
        .map((doc) => readID(asRecord(doc)?.product))
        .filter((id): id is number | string => id !== null),
    ))
  }

  const clauses: Where[] = []
  if (filters.search) {
    const or: Where[] = [
      { name: { contains: filters.search } },
      { slug: { contains: filters.search } },
    ]
    if (variantProductIDs?.length) or.push({ id: { in: variantProductIDs } })
    clauses.push({ or })
  }
  if (filters.stock) clauses.push({ id: { in: variantProductIDs ?? [] } })
  if (filters.brand) clauses.push({ brand: { equals: filters.brand } })
  if (filters.category) clauses.push({ categories: { contains: filters.category } })
  if (filters.status === 'active') clauses.push({ is_active: { equals: true } })
  if (filters.status === 'inactive') clauses.push({ is_active: { equals: false } })

  const where: Where = clauses.length ? { and: clauses } : {}
  const [productsResult, brandsResult, categoriesResult, mediaResult] = await Promise.all([
    payload.find({
      ...access,
      collection: 'products',
      depth: 1,
      limit: PAGE_SIZE,
      page: filters.page,
      select: {
        brand: true,
        categories: true,
        image: true,
        is_active: true,
        name: true,
      },
      sort: filters.sort,
      where,
    }),
    payload.find({
      ...access,
      collection: 'brands',
      depth: 0,
      limit: 200,
      select: { name: true },
      sort: 'name',
    }),
    payload.find({
      ...access,
      collection: 'categories',
      depth: 0,
      limit: 200,
      select: { name: true },
      sort: 'name',
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

  const productIDs = productsResult.docs
    .map((doc) => readID(doc))
    .filter((id): id is number | string => id !== null)

  const variantsResult = productIDs.length
    ? await payload.find({
        ...access,
        collection: 'product_variants',
        depth: 1,
        limit: Math.max(100, productIDs.length * 30),
        select: {
          images: true,
          is_active: true,
          option_value: true,
          price: true,
          product: true,
          sku: true,
          sort_order: true,
          stock_quantity: true,
          variant_name: true,
        },
        sort: 'sort_order',
        where: { product: { in: productIDs } },
      })
    : { docs: [] }

  const variantsByProduct = new Map<string, ProductVariantDTO[]>()
  for (const doc of variantsResult.docs) {
    const productID = readID(asRecord(doc)?.product)
    const variant = mapVariant(doc, permissions.canReadVariantPrice)
    if (productID === null || !variant) continue
    const key = String(productID)
    const current = variantsByProduct.get(key) ?? []
    current.push(variant)
    variantsByProduct.set(key, current)
  }

  const docs: ProductListItemDTO[] = productsResult.docs.flatMap((doc) => {
    const record = asRecord(doc)
    const id = readID(doc)
    if (!record || id === null) return []
    const variants = variantsByProduct.get(String(id)) ?? []
    const relationships = Array.isArray(record.categories) ? record.categories : []

    return [{
      brand: readRelationshipLabel(record.brand),
      categories: relationships
        .map((value) => readRelationshipLabel(value))
        .filter((value): value is { id: number | string; name: string } => value !== null),
      id,
      image: readMedia(record.image),
      isActive: readBoolean(record.is_active, true),
      name: readString(record.name, String(id)),
      totalStock: variants.reduce((sum, variant) => sum + variant.stockQuantity, 0),
      variants,
    }]
  })

  return {
    brands: mapFilterOptions(brandsResult.docs),
    canReadVariantPrice: permissions.canReadVariantPrice,
    categories: mapFilterOptions(categoriesResult.docs),
    docs,
    filters,
    hasCreatePermission: permissions.products.create,
    hasDeletePermission: permissions.products.delete,
    hasUpdatePermission: permissions.products.update,
    hasVariantCreatePermission: permissions.variants.create,
    hasVariantDeletePermission: permissions.variants.delete,
    hasVariantUpdatePermission: permissions.variants.update,
    hasNextPage: productsResult.hasNextPage,
    hasPrevPage: productsResult.hasPrevPage,
    page: productsResult.page ?? filters.page,
    media: mediaResult.docs
      .map((doc) => readMedia(doc))
      .filter((item): item is AdminMediaDTO => item !== null),
    totalDocs: productsResult.totalDocs,
    totalPages: productsResult.totalPages,
  }
}

export function getMediaURL(media: AdminMediaDTO | null): string | null {
  return media?.url ?? null
}
