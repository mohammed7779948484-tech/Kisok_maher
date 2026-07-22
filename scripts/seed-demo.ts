#!/usr/bin/env tsx
/**
 * Demo Seed Script
 *
 * Creates a small catalog for kiosk smoke testing:
 *   - 2 brands
 *   - 2 categories
 *   - 3 products
 *   - 8–9 variants (2–3 per product)
 *     - one with a normal internal price
 *     - one with an explicit price of 0
 *     - one with no price (null/omitted)
 *
 * Idempotent — re-running updates or reuses matching records by slug/SKU.
 * Does NOT touch users, carts, orders, site settings, or media.
 *
 * Usage:
 *   pnpm seed:demo
 *   or
 *   npx tsx scripts/seed-demo.ts
 */

import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(import.meta.dirname, '../.env.local') })

const { getPayload } = await import('payload')
const { default: config } = await import('../src/payload/payload.config')

/* ------------------------------------------------------------------ */
/*  Seed data                                                          */
/* ------------------------------------------------------------------ */

const BRANDS = [
  { name: 'VaporTech', slug: 'vaportech', sort_order: 0, is_active: true },
  { name: 'CloudNine', slug: 'cloudnine', sort_order: 1, is_active: true },
] as const

const CATEGORIES = [
  { name: 'Disposables', slug: 'disposables', sort_order: 0, is_active: true },
  { name: 'E-Liquids', slug: 'e-liquids', sort_order: 1, is_active: true },
] as const

const PRODUCTS = [
  {
    name: 'VaporTech Pro Disposable',
    slug: 'vaportech-pro-disposable',
    brand_slug: 'vaportech',
    category_slugs: ['disposables'],
    unit_label: 'Piece',
    sort_order: 0,
    is_active: true,
  },
  {
    name: 'CloudNine Fusion 5000',
    slug: 'cloudnine-fusion-5000',
    brand_slug: 'cloudnine',
    category_slugs: ['disposables'],
    unit_label: 'Piece',
    sort_order: 1,
    is_active: true,
  },
  {
    name: 'VaporTech Classic Eliquid',
    slug: 'vaportech-classic-eliquid',
    brand_slug: 'vaportech',
    category_slugs: ['e-liquids'],
    unit_label: 'Bottle',
    sort_order: 2,
    is_active: true,
  },
] as const

const VARIANTS = [
  // VaporTech Pro Disposable — 3 variants
  {
    variant_name: 'Strawberry Ice',
    sku: 'VT-PRO-STR-ICE',
    product_slug: 'vaportech-pro-disposable',
    price: 25.0,
    stock_quantity: 20,
    option_value: '50mg',
    sort_order: 0,
    is_active: true,
  },
  {
    variant_name: 'Mint Blast',
    sku: 'VT-PRO-MNT-BLS',
    product_slug: 'vaportech-pro-disposable',
    price: 0,
    stock_quantity: 15,
    option_value: '30mg',
    sort_order: 1,
    is_active: true,
  },
  {
    variant_name: 'Blueberry Rush',
    sku: 'VT-PRO-BLU-RSH',
    product_slug: 'vaportech-pro-disposable',
    // no price — null
    stock_quantity: 10,
    option_value: '50mg',
    sort_order: 2,
    is_active: true,
  },

  // CloudNine Fusion 5000 — 3 variants
  {
    variant_name: 'Mango Tango',
    sku: 'CN-FUS-MNG-TNG',
    product_slug: 'cloudnine-fusion-5000',
    price: 30.0,
    stock_quantity: 12,
    option_value: '50mg',
    sort_order: 0,
    is_active: true,
  },
  {
    variant_name: 'Watermelon Chill',
    sku: 'CN-FUS-WTM-CHL',
    product_slug: 'cloudnine-fusion-5000',
    price: 0,
    stock_quantity: 8,
    option_value: '30mg',
    sort_order: 1,
    is_active: true,
  },
  {
    variant_name: 'Lush Ice',
    sku: 'CN-FUS-LSH-ICE',
    product_slug: 'cloudnine-fusion-5000',
    stock_quantity: 5,
    option_value: '50mg',
    sort_order: 2,
    is_active: true,
  },

  // VaporTech Classic Eliquid — 2 variants
  {
    variant_name: 'Tobacco Blend',
    sku: 'VT-CLC-TBC-BLD',
    product_slug: 'vaportech-classic-eliquid',
    price: 18.5,
    stock_quantity: 25,
    option_value: '30ml',
    sort_order: 0,
    is_active: true,
  },
  {
    variant_name: 'Vanilla Custard',
    sku: 'VT-CLC-VNL-CSD',
    product_slug: 'vaportech-classic-eliquid',
    stock_quantity: 18,
    option_value: '30ml',
    sort_order: 1,
    is_active: true,
  },
] as const

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

async function findBrand(payload: Awaited<ReturnType<typeof getPayload>>, slug: string) {
  const { docs } = await payload.find({
    collection: 'brands',
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  })
  return docs[0] ?? null
}

async function findCategory(
  payload: Awaited<ReturnType<typeof getPayload>>,
  slug: string,
) {
  const { docs } = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  })
  return docs[0] ?? null
}

async function findProduct(
  payload: Awaited<ReturnType<typeof getPayload>>,
  slug: string,
) {
  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  })
  return docs[0] ?? null
}

async function findVariant(
  payload: Awaited<ReturnType<typeof getPayload>>,
  sku: string,
) {
  const { docs } = await payload.find({
    collection: 'product_variants',
    where: { sku: { equals: sku } },
    limit: 1,
    overrideAccess: true,
  })
  return docs[0] ?? null
}

/* ------------------------------------------------------------------ */
/*  Main seed                                                          */
/* ------------------------------------------------------------------ */

async function seed() {
  console.log('\n📦 Starting demo seed...\n')

  try {
    const payload = await getPayload({ config })

    /* ---- Brands ---- */
    console.log('--- Brands ---')
    for (const b of BRANDS) {
      const existing = await findBrand(payload, b.slug)
      if (existing) {
        await payload.update({
          collection: 'brands',
          id: String(existing.id),
          overrideAccess: true,
          data: { name: b.name, sort_order: b.sort_order, is_active: b.is_active },
        })
        console.log(`  ↻ Updated brand: ${b.name} (${b.slug})`)
      } else {
        await payload.create({
          collection: 'brands',
          overrideAccess: true,
          data: { name: b.name, slug: b.slug, sort_order: b.sort_order, is_active: b.is_active },
        })
        console.log(`  + Created brand: ${b.name} (${b.slug})`)
      }
    }

    /* ---- Categories ---- */
    console.log('\n--- Categories ---')
    const catMap = new Map<string, string>()
    for (const c of CATEGORIES) {
      const existing = await findCategory(payload, c.slug)
      if (existing) {
        catMap.set(c.slug, String(existing.id))
        await payload.update({
          collection: 'categories',
          id: String(existing.id),
          overrideAccess: true,
          data: { name: c.name, sort_order: c.sort_order, is_active: c.is_active },
        })
        console.log(`  ↻ Updated category: ${c.name} (${c.slug})`)
      } else {
        const created = await payload.create({
          collection: 'categories',
          overrideAccess: true,
          data: {
            name: c.name,
            slug: c.slug,
            sort_order: c.sort_order,
            is_active: c.is_active,
          },
        })
        catMap.set(c.slug, String(created.id))
        console.log(`  + Created category: ${c.name} (${c.slug})`)
      }
    }

    /* ---- Products ---- */
    console.log('\n--- Products ---')
    const productMap = new Map<string, string>()
    for (const p of PRODUCTS) {
      const existing = await findProduct(payload, p.slug)

      // Resolve brand relationship
      const brand = await findBrand(payload, p.brand_slug)
      const brandId = brand ? String(brand.id) : null

      // Resolve category relationships
      const categoryIds = p.category_slugs
        .map((s) => catMap.get(s))
        .filter((id): id is string => typeof id === 'string')

      const productData = {
        name: p.name,
        brand: brandId,
        categories: categoryIds,
        unit_label: p.unit_label,
        sort_order: p.sort_order,
        is_active: p.is_active,
      }

      if (existing) {
        await payload.update({
          collection: 'products',
          id: String(existing.id),
          overrideAccess: true,
          data: productData,
        })
        productMap.set(p.slug, String(existing.id))
        console.log(`  ↻ Updated product: ${p.name} (${p.slug})`)
      } else {
        const created = await payload.create({
          collection: 'products',
          overrideAccess: true,
          data: { ...productData, slug: p.slug },
        })
        productMap.set(p.slug, String(created.id))
        console.log(`  + Created product: ${p.name} (${p.slug})`)
      }
    }

    /* ---- Variants ---- */
    console.log('\n--- Variants ---')
    for (const v of VARIANTS) {
      const existing = await findVariant(payload, v.sku)
      const productId = productMap.get(v.product_slug)

      if (!productId) {
        console.log(`  ⚠ Skipped variant ${v.sku}: product "${v.product_slug}" not found`)
        continue
      }

      // Only include `price` key when it is defined (not undefined/null).
      // Omitting the key entirely stores null in the DB.
      const variantData: Record<string, unknown> = {
        product: productId,
        variant_name: v.variant_name,
        stock_quantity: v.stock_quantity,
        option_value: v.option_value,
        sort_order: v.sort_order,
        is_active: v.is_active,
      }
      if ('price' in v) {
        variantData.price = v.price
      }

      const priceLabel =
        'price' in v
          ? v.price === 0
            ? 'price=0'
            : `price=${v.price}`
          : 'price=null'

      if (existing) {
        await payload.update({
          collection: 'product_variants',
          id: String(existing.id),
          overrideAccess: true,
          data: variantData,
        })
        console.log(`  ↻ Updated variant: ${v.variant_name} (${v.sku}) [${priceLabel}, stock=${v.stock_quantity}]`)
      } else {
        await payload.create({
          collection: 'product_variants',
          overrideAccess: true,
          data: { ...variantData, sku: v.sku },
        })
        console.log(`  + Created variant: ${v.variant_name} (${v.sku}) [${priceLabel}, stock=${v.stock_quantity}]`)
      }
    }

    /* ---- Summary ---- */
    console.log('\n--- Record counts ---')
    const [brands, categories, products, variants] = await Promise.all([
      payload.find({ collection: 'brands', overrideAccess: true }),
      payload.find({ collection: 'categories', overrideAccess: true }),
      payload.find({ collection: 'products', overrideAccess: true }),
      payload.find({ collection: 'product_variants', overrideAccess: true }),
    ])

    console.log(`  Brands:    ${brands.totalDocs}`)
    console.log(`  Categories: ${categories.totalDocs}`)
    console.log(`  Products:   ${products.totalDocs}`)
    console.log(`  Variants:   ${variants.totalDocs}`)

    console.log('\n🎉 Demo seed completed successfully!\n')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Demo seed failed:')
    console.error(error)
    console.log('')
    process.exit(1)
  }
}

// Run seed (ESM-compatible — no require.main check needed)
seed()

export { seed }