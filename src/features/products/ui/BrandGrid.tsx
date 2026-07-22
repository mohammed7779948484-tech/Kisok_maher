import { Tags } from 'lucide-react'

import { EmptyState } from '@/shared/ui'

import { BrandCard } from './BrandCard'
import type { BrandGridProps } from '../types'

export function BrandGrid({ brands }: BrandGridProps): React.ReactElement {
  if (brands.length === 0) return <EmptyState description="Brands will appear here when available." icon={Tags} title="No brands available" />

  return (
    <div className="grid grid-cols-2 gap-4 medium:grid-cols-4 expanded:grid-cols-5">
      {brands.map((brand) => <BrandCard brand={brand} key={brand.id} />)}
    </div>
  )
}
