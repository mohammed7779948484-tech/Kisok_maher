import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getBrandBySlug, getProductsByBrand } from '@/features/products'
import { brandConfig } from '@/shared/config'
import { Breadcrumb, PageHeader } from '@/shared/ui'
import { ProductGrid } from '@/widgets/product-grid'

interface BrandPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params
  const brand = await getBrandBySlug(slug)
  if (!brand) return { title: 'Brand Not Found' }
  return { title: `${brand.name} — ${brandConfig.displayName}`, description: brand.description || `Browse ${brand.name} products` }
}

export const revalidate = 60

export default async function BrandPage({ params }: BrandPageProps): Promise<React.ReactElement> {
  const { slug } = await params
  const brand = await getBrandBySlug(slug)
  if (!brand) notFound()
  const products = await getProductsByBrand(slug, { page: 1, limit: 24 })

  return (
    <div className="customer-shell">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Brands', href: '/brands' }, { label: brand.name }]} />
      <PageHeader description={brand.description || `${products.totalDocs} products available`} eyebrow="Brand" title={brand.name} />
      <ProductGrid emptyMessage={`No products from ${brand.name} yet.`} products={products.docs} />
    </div>
  )
}
