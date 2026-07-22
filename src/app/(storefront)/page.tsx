import { BrandGrid, CategoryGrid, getActiveBrands, getActiveCategories, getActiveProducts } from '@/features/products'
import { HeroSection } from '@/widgets/hero'
import { ProductGrid } from '@/widgets/product-grid'
import { TrackOrderSection } from '@/widgets/track-order-section'

export const revalidate = 60

export default async function HomePage(): Promise<React.ReactElement> {
  const [products, brands, categories] = await Promise.all([
    getActiveProducts({ page: 1, limit: 8 }),
    getActiveBrands(),
    getActiveCategories(),
  ])

  return (
    <div className="customer-shell">
      <HeroSection />

      {brands.length > 0 && (
        <section aria-labelledby="brands-heading" className="customer-section">
          <div className="mb-8 text-center">
            <h2 className="text-headline-medium text-on-surface" id="brands-heading">Curated brands</h2>
            <p className="mx-auto mt-2 max-w-xl text-body-medium text-on-surface-variant">Explore the brands available in store today.</p>
          </div>
          <BrandGrid brands={brands} />
        </section>
      )}

      {categories.length > 0 && (
        <section aria-labelledby="categories-heading" className="customer-section">
          <div className="mb-8 text-center">
            <h2 className="text-headline-medium text-on-surface" id="categories-heading">Shop by category</h2>
            <p className="mx-auto mt-2 max-w-xl text-body-medium text-on-surface-variant">Move quickly from category to brand and available products.</p>
          </div>
          <CategoryGrid categories={categories} />
        </section>
      )}

      <section aria-labelledby="products-heading" className="customer-section scroll-mt-24" id="products">
        <div className="mb-8 text-center">
          <h2 className="text-headline-medium text-on-surface" id="products-heading">Latest arrivals</h2>
          <p className="mx-auto mt-2 max-w-xl text-body-medium text-on-surface-variant">Browse the newest additions to the in-store catalog.</p>
        </div>
        <ProductGrid emptyMessage="No products yet. Check back soon!" products={products.docs} />
      </section>

      <TrackOrderSection />
    </div>
  )
}
