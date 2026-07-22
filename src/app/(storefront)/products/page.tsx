import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { getActiveProducts } from '@/features/products'
import { brandConfig } from '@/shared/config'
import { buttonVariants, PageHeader } from '@/shared/ui'
import { cn } from '@/shared/lib/utils'
import { ProductGrid } from '@/widgets/product-grid'

export const metadata: Metadata = {
  title: `All Products — ${brandConfig.displayName}`,
  description: 'Browse the complete in-store catalog',
}

export const revalidate = 60

interface ProductsPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps): Promise<React.ReactElement> {
  const resolvedSearchParams = await searchParams
  const page = Number(resolvedSearchParams?.page) || 1
  const products = await getActiveProducts({ page, limit: 12 })

  return (
    <div className="customer-shell">
      <PageHeader description={`${products.totalDocs} products available`} eyebrow="Catalog" title="All products" />
      <ProductGrid products={products.docs} />

      {products.totalPages > 1 && (
        <nav aria-label="Product pages" className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {products.hasPrevPage && (
            <Link className={cn(buttonVariants({ variant: 'outline' }))} href={`/products?page=${page - 1}`}><ChevronLeft aria-hidden="true" /> Previous</Link>
          )}
          <span className="flex min-h-touch items-center px-4 text-body-medium text-on-surface-variant tabular-nums">Page {products.page} of {products.totalPages}</span>
          {products.hasNextPage && (
            <Link className={cn(buttonVariants({ variant: 'outline' }))} href={`/products?page=${page + 1}`}>Next <ChevronRight aria-hidden="true" /></Link>
          )}
        </nav>
      )}
    </div>
  )
}
