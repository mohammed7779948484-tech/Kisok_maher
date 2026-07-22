import type { Metadata } from 'next'
import { Tags } from 'lucide-react'

import { BrandGrid, getActiveBrands } from '@/features/products'
import { brandConfig } from '@/shared/config'
import { EmptyState, PageHeader } from '@/shared/ui'

export const metadata: Metadata = {
  title: `All Brands — ${brandConfig.displayName}`,
  description: 'Browse available product brands',
}

export const revalidate = 60

export default async function BrandsPage(): Promise<React.ReactElement> {
  const brands = await getActiveBrands()

  return (
    <div className="customer-shell">
      <PageHeader description={`${brands.length} brands available`} eyebrow="Catalog" title="All brands" />
      {brands.length > 0 ? (
        <BrandGrid brands={brands} />
      ) : (
        <EmptyState description="Brands will appear here when they are available." icon={Tags} title="No brands yet" />
      )}
    </div>
  )
}
