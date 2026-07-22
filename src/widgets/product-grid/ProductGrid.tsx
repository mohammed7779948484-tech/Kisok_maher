import { PackageOpen } from 'lucide-react'

import { ProductCard } from '@/features/products'
import type { ProductCardData } from '@/features/products'
import { EmptyState } from '@/shared/ui'

interface ProductGridProps {
  products: ProductCardData[]
  emptyMessage?: string
}

export function ProductGrid({ products, emptyMessage = 'No products found.' }: ProductGridProps): React.ReactElement {
  if (products.length === 0) return <EmptyState description={emptyMessage} icon={PackageOpen} title="No products found" />

  return (
    <div className="grid grid-cols-1 gap-4 medium:grid-cols-3 expanded:grid-cols-4">
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  )
}
