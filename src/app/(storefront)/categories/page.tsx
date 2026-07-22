import type { Metadata } from 'next'
import { LayoutGrid } from 'lucide-react'

import { CategoryGrid, getActiveCategories } from '@/features/products'
import { brandConfig } from '@/shared/config'
import { EmptyState, PageHeader } from '@/shared/ui'

export const metadata: Metadata = {
  title: `All Categories — ${brandConfig.displayName}`,
  description: 'Browse product categories',
}

export const revalidate = 60

export default async function CategoriesPage(): Promise<React.ReactElement> {
  const categories = await getActiveCategories()

  return (
    <div className="customer-shell">
      <PageHeader description={`${categories.length} categories available`} eyebrow="Catalog" title="All categories" />
      {categories.length > 0 ? (
        <CategoryGrid categories={categories} />
      ) : (
        <EmptyState description="Categories will appear here when they are available." icon={LayoutGrid} title="No categories yet" />
      )}
    </div>
  )
}
