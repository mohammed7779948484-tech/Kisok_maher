import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MousePointerClick, PackageOpen } from 'lucide-react'

import { CategoryBrandFilter, CategoryGrid, getActiveProducts, getBrandsByCategory, getCategoryBySlug } from '@/features/products'
import { brandConfig } from '@/shared/config'
import { Breadcrumb, EmptyState, PageHeader } from '@/shared/ui'
import { ProductGrid } from '@/widgets/product-grid'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ brand?: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return { title: 'Category Not Found' }
  return { title: `${category.name} — ${brandConfig.displayName}`, description: `Browse ${category.name} products` }
}

export const revalidate = 60

export default async function CategoryPage({ params, searchParams }: CategoryPageProps): Promise<React.ReactElement> {
  const { slug } = await params
  const { brand: selectedBrandSlug } = await searchParams
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const brands = await getBrandsByCategory(slug)
  const products = selectedBrandSlug
    ? await getActiveProducts({ page: 1, limit: 24, categorySlug: slug, brandSlug: selectedBrandSlug })
    : null
  const selectedBrand = brands.find((brand) => brand.slug === selectedBrandSlug)

  return (
    <div className="customer-shell">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Categories', href: '/categories' }, { label: category.name }]} />
      <PageHeader description={selectedBrand ? `Showing ${selectedBrand.name} products` : 'Choose a brand to view its available products.'} eyebrow="Category" title={category.name} />

      {category.children && category.children.length > 0 && !selectedBrandSlug && (
        <section aria-labelledby="subcategories-heading" className="mb-8">
          <h2 className="mb-4 text-title-large text-on-surface" id="subcategories-heading">Subcategories</h2>
          <CategoryGrid categories={category.children} />
        </section>
      )}

      <CategoryBrandFilter brands={brands} categorySlug={slug} selectedBrandSlug={selectedBrandSlug} />

      {selectedBrandSlug && products && (
        <section aria-labelledby="filtered-products-heading">
          <h2 className="mb-4 text-title-large text-on-surface" id="filtered-products-heading">{selectedBrand?.name} — {category.name}</h2>
          <ProductGrid emptyMessage={`No ${selectedBrand?.name || ''} products in ${category.name} yet.`} products={products.docs} />
        </section>
      )}

      {!selectedBrandSlug && brands.length > 0 && (!category.children || category.children.length === 0) && (
        <EmptyState description="Choose one of the brands above to continue browsing." icon={MousePointerClick} title="Select a brand" />
      )}

      {brands.length === 0 && <EmptyState description={`Products will appear here when they are added to ${category.name}.`} icon={PackageOpen} title="No products yet" />}
    </div>
  )
}
