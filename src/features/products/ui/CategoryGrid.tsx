import { LayoutGrid } from 'lucide-react'

import { EmptyState } from '@/shared/ui'

import { CategoryCard } from './CategoryCard'
import type { CategoryGridProps } from '../types'

export function CategoryGrid({ categories }: CategoryGridProps): React.ReactElement {
  if (categories.length === 0) return <EmptyState description="Categories will appear here when available." icon={LayoutGrid} title="No categories available" />

  return (
    <div className="grid grid-cols-1 gap-4 medium:grid-cols-2 expanded:grid-cols-3">
      {categories.map((category) => <CategoryCard category={category} key={category.id} />)}
    </div>
  )
}
