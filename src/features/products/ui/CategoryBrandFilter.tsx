import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import type { CatalogBrand } from '@/modules/catalog'
import { cn } from '@/shared/lib/utils'

import { PLACEHOLDER_IMAGE } from '../constants'

interface CategoryBrandFilterProps {
  categorySlug: string
  brands: CatalogBrand[]
  selectedBrandSlug?: string | undefined
}

export function CategoryBrandFilter({ categorySlug, brands, selectedBrandSlug }: CategoryBrandFilterProps): React.ReactElement {
  if (brands.length === 0) return <></>

  return (
    <section aria-labelledby="brand-filter-heading" className="mb-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-title-large text-on-surface" id="brand-filter-heading">Choose a brand</h2>
        {selectedBrandSlug && (
          <Link className="inline-flex min-h-touch items-center gap-2 rounded-medium px-3 text-label-medium text-primary hover:bg-primary-container" href={`/categories/${categorySlug}`}>
            <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Show all brands
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 medium:grid-cols-4 expanded:grid-cols-6">
        {brands.map((brand) => {
          const isActive = brand.slug === selectedBrandSlug
          return (
            <Link
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex min-h-touch flex-col items-center gap-3 rounded-large border p-4 text-center shadow-elevation-0 transition-[border-color,background-color,box-shadow] duration-standard hover:border-primary/50 hover:shadow-elevation-1',
                isActive ? 'border-primary bg-primary-container text-primary-container-foreground shadow-elevation-1' : 'border-outline-variant bg-surface text-on-surface'
              )}
              href={`/categories/${categorySlug}?brand=${brand.slug}`}
              key={brand.id}
            >
              <span className="relative h-12 w-12 overflow-hidden rounded-medium bg-surface-container-lowest">
                <Image alt={brand.name} className="object-contain p-1" fill sizes="48px" src={brand.logoUrl || PLACEHOLDER_IMAGE} />
              </span>
              <span className="text-label-medium">{brand.name}</span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
