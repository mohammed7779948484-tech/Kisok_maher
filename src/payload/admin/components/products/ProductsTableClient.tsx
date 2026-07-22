'use client'

import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, PackageOpen, Plus, Search } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import React, { useMemo, useState, useTransition } from 'react'
import { toast } from '@payloadcms/ui'

import type { ProductListItemDTO, ProductsListDTO, ProductVariantDTO } from '../../types'
import { AdminImage } from '../shared/AdminImage'
import { ProductsTableSkeleton } from '../shared/AdminSkeleton'
import { StatusBadge } from '../shared/StatusBadge'
import { FlavorActionMenu, ProductActionMenu } from './ProductActionMenu'
import { ProductPreviewDialog } from './ProductPreviewDialog'
import { VariantEditorDrawer } from './VariantEditorDrawer'

interface ProductsTableClientProps {
  data: ProductsListDTO
}

interface FlavorEditorState {
  product: ProductListItemDTO
  variant: ProductVariantDTO | null
}

function getStockStatus(stock: number): { label: string; status: string } {
  if (stock === 0) return { label: 'Out of stock', status: 'out-of-stock' }
  if (stock <= 5) return { label: `${stock} low`, status: 'low-stock' }
  return { label: `${stock} in stock`, status: 'in-stock' }
}

export function ProductsTableClient({ data }: ProductsTableClientProps): React.ReactElement {
  const pathname = usePathname()
  const router = useRouter()
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(data.docs.map((product) => String(product.id))))
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [flavorEditor, setFlavorEditor] = useState<FlavorEditorState | null>(null)
  const [previewProduct, setPreviewProduct] = useState<ProductListItemDTO | null>(null)
  const [isMutating, setIsMutating] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isNavigating, setIsNavigating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const initialFilters = useMemo(() => data.filters, [data.filters])
  const activeFilterCount = [data.filters.brand, data.filters.category, data.filters.search, data.filters.status, data.filters.stock].filter(Boolean).length

  function navigate(updates: Record<string, string>): void {
    const params = new URLSearchParams()
    const next = { ...initialFilters, ...updates }
    for (const [key, value] of Object.entries(next)) {
      if (value && !(key === 'page' && String(value) === '1')) params.set(key, String(value))
    }
    setIsNavigating(true)
    window.location.assign(`${pathname}?${params.toString()}`)
  }

  function refresh(): void {
    startTransition(() => router.refresh())
  }

  function toggleExpanded(id: string): void {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function deleteProduct(id: string, name: string): Promise<void> {
    if (!window.confirm(`Delete “${name}”? This cannot be undone.`)) return
    setError(null)
    setIsMutating(true)
    const response = await fetch(`/api/products/${id}`, { method: 'DELETE' })
    setIsMutating(false)
    if (!response.ok) {
      const message = 'The product could not be deleted. Remove unreferenced flavors first and check your permissions.'
      setError(message)
      toast.error('Product was not deleted', { description: message })
      return
    }
    toast.success('Product deleted', { description: name })
    refresh()
  }

  async function deleteFlavor(variant: ProductVariantDTO): Promise<void> {
    if (!window.confirm(`Delete flavor “${variant.name}”? This cannot be undone.`)) return
    setError(null)
    setIsMutating(true)
    const response = await fetch(`/api/product_variants/${variant.id}`, { method: 'DELETE' })
    setIsMutating(false)
    if (!response.ok) {
      const message = 'The flavor could not be deleted. It may be referenced by an order or your role may not allow deletion.'
      setError(message)
      toast.error('Flavor was not deleted', { description: message })
      return
    }
    toast.success('Flavor deleted', { description: variant.name })
    refresh()
  }

  async function bulkSetActive(isActive: boolean): Promise<void> {
    if (!selected.size || isMutating) return
    setError(null)
    setIsMutating(true)
    const responses = await Promise.all(Array.from(selected, (id) => fetch(`/api/products/${id}`, {
      body: JSON.stringify({ is_active: isActive }),
      headers: { 'Content-Type': 'application/json' },
      method: 'PATCH',
    })))
    setIsMutating(false)
    if (responses.some((response) => !response.ok)) {
      const message = 'One or more products could not be updated. Refresh and check your permissions.'
      setError(message)
      toast.error('Bulk update incomplete', { description: message })
      return
    }
    toast.success(`${selected.size} products updated`, { description: isActive ? 'Products are active.' : 'Products are inactive.' })
    setSelected(new Set())
    refresh()
  }

  return (
    <div className="relative grid gap-5">
      {isPending || isMutating || isNavigating ? <ProductsTableSkeleton /> : null}

      <section className="dragon-toolbar" aria-label="Product filters">
        <div className="dragon-toolbar__summary">
          <div><span className="dragon-toolbar__number">{data.totalDocs}</span><span className="dragon-muted text-sm">products</span></div>
          <span className="dragon-toolbar__divider" />
          <div><span className="dragon-toolbar__number">{data.docs.reduce((sum, product) => sum + product.variants.length, 0)}</span><span className="dragon-muted text-sm">flavors on this page</span></div>
          <div className="ml-auto flex items-center gap-2"><button className="dragon-button min-h-8 px-3 py-1" onClick={() => setExpanded(new Set(data.docs.map((product) => String(product.id))))} type="button">Expand all</button><button className="dragon-button min-h-8 px-3 py-1" onClick={() => setExpanded(new Set())} type="button">Collapse all</button></div>
        </div>
        <form
          className="dragon-filter-grid"
          onSubmit={(event) => {
            event.preventDefault()
            const form = new FormData(event.currentTarget)
            navigate({ page: '1', search: String(form.get('search') ?? '') })
          }}
        >
          <label className="relative lg:col-span-2">
            <span className="sr-only">Search products, flavors, or SKUs</span>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3" size={17} />
            <input className="dragon-control pl-10" defaultValue={data.filters.search} name="search" placeholder="Search products, flavors, or SKUs…" />
          </label>
          <select aria-label="Filter by brand" className="dragon-control" onChange={(event) => navigate({ brand: event.target.value, page: '1' })} value={data.filters.brand}><option value="">All brands</option>{data.brands.map((brand) => <option key={String(brand.id)} value={String(brand.id)}>{brand.name}</option>)}</select>
          <select aria-label="Filter by category" className="dragon-control" onChange={(event) => navigate({ category: event.target.value, page: '1' })} value={data.filters.category}><option value="">All categories</option>{data.categories.map((category) => <option key={String(category.id)} value={String(category.id)}>{category.name}</option>)}</select>
          <select aria-label="Filter by status" className="dragon-control" onChange={(event) => navigate({ page: '1', status: event.target.value })} value={data.filters.status}><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
          <select aria-label="Filter by stock" className="dragon-control" onChange={(event) => navigate({ page: '1', stock: event.target.value })} value={data.filters.stock}><option value="">All stock</option><option value="in">In stock</option><option value="low">Low stock</option><option value="out">Out of stock</option></select>
          <select aria-label="Sort products" className="dragon-control" onChange={(event) => navigate({ page: '1', sort: event.target.value })} value={data.filters.sort}><option value="sort_order">Manual order</option><option value="name">Name A–Z</option><option value="-name">Name Z–A</option><option value="-createdAt">Newest</option><option value="createdAt">Oldest</option></select>
          <button className="dragon-button" onClick={() => navigate({ brand: '', category: '', page: '1', search: '', sort: 'sort_order', status: '', stock: '' })} type="button">Clear{activeFilterCount ? ` (${activeFilterCount})` : ''}</button>
        </form>
      </section>

      {selected.size ? <div className="dragon-selection-bar"><p className="m-0 flex-1 text-sm font-medium">{selected.size} products selected</p><button className="dragon-button" disabled={isMutating} onClick={() => void bulkSetActive(true)} type="button">Set active</button><button className="dragon-button" disabled={isMutating} onClick={() => void bulkSetActive(false)} type="button">Set inactive</button></div> : null}
      {error ? <p className="m-0 rounded-lg border p-3 text-sm dragon-badge--danger" role="alert">{error}</p> : null}

      {data.docs.length ? (
        <div className="dragon-table-wrap dragon-product-table">
          <table className="dragon-table min-w-[1080px]">
            <thead><tr><th className="w-10"><input aria-label="Select all products on this page" checked={data.docs.length > 0 && data.docs.every((product) => selected.has(String(product.id)))} disabled={!data.hasUpdatePermission} onChange={(event) => setSelected(event.target.checked ? new Set(data.docs.map((product) => String(product.id))) : new Set())} type="checkbox" /></th><th>Product</th><th>Brand &amp; category</th><th>Flavors</th><th>Inventory</th><th>Status</th><th className="text-right">Product actions</th></tr></thead>
            <tbody>{data.docs.map((product) => {
              const key = String(product.id)
              const isExpanded = expanded.has(key)
              const stock = getStockStatus(product.totalStock)
              return <React.Fragment key={key}>
                <tr className="dragon-row dragon-product-row">
                  <td><input aria-label={`Select ${product.name}`} checked={selected.has(key)} disabled={!data.hasUpdatePermission} onChange={(event) => setSelected((current) => { const next = new Set(current); if (event.target.checked) next.add(key); else next.delete(key); return next })} type="checkbox" /></td>
                  <td><button aria-expanded={isExpanded} aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${product.name} flavors`} className="dragon-product-name" onClick={() => toggleExpanded(key)} type="button"><span className="dragon-icon-button h-8 w-8">{isExpanded ? <ChevronUp aria-hidden="true" size={16} /> : <ChevronDown aria-hidden="true" size={16} />}</span><AdminImage className="h-12 w-12" fallback={product.name} media={product.image} size={48} /><span className="min-w-0 text-left"><span className="block truncate font-semibold">{product.name}</span><span className="dragon-muted mt-1 block text-xs">#{product.id}</span></span></button></td>
                  <td><span className="block font-medium">{product.brand?.name ?? 'No brand'}</span><span className="dragon-muted mt-1 block max-w-56 truncate text-xs">{product.categories.map((category) => category.name).join(', ') || 'Uncategorized'}</span></td>
                  <td><span className="dragon-count-badge">{product.variants.length}</span></td>
                  <td><StatusBadge label={stock.label} status={stock.status} /></td>
                  <td><StatusBadge status={product.isActive ? 'active' : 'inactive'} /></td>
                  <td><div className="flex justify-end"><ProductActionMenu canCreateFlavor={data.hasVariantCreatePermission} canDelete={data.hasDeletePermission} canUpdate={data.hasUpdatePermission} onAddFlavor={() => setFlavorEditor({ product, variant: null })} onDelete={() => void deleteProduct(key, product.name)} onPreview={() => setPreviewProduct(product)} product={product} /></div></td>
                </tr>
                {isExpanded ? <tr className="dragon-subrow"><td colSpan={7}><section className="dragon-variant-workspace" aria-label={`${product.name} flavors`}><div className="dragon-variant-workspace__header"><div><h3 className="m-0 text-sm font-semibold">Flavors &amp; inventory</h3><p className="dragon-muted mb-0 mt-1 text-xs">Manage every sellable option under {product.name}.</p></div>{data.hasVariantCreatePermission ? <button className="dragon-button dragon-button--primary min-h-8 px-3 py-1" onClick={() => setFlavorEditor({ product, variant: null })} type="button"><Plus aria-hidden="true" size={15} />Add flavor</button> : null}</div>{product.variants.length ? <div className="dragon-flavor-grid">{product.variants.map((variant) => { const flavorStock = getStockStatus(variant.stockQuantity); return <article className="dragon-flavor-card" key={String(variant.id)}><div className="flex items-start gap-3"><AdminImage className="h-12 w-12" fallback={variant.name} media={variant.image ?? product.image} size={48} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h4 className="m-0 truncate text-sm font-semibold">{variant.name}</h4>{variant.optionValue ? <span className="dragon-badge">{variant.optionValue}</span> : null}</div><p className="dragon-muted mb-0 mt-1 truncate font-mono text-[11px]">{variant.sku}</p></div><StatusBadge status={variant.isActive ? 'active' : 'inactive'} /></div><div className="dragon-flavor-card__meta"><span><span className="dragon-muted block text-[10px] uppercase tracking-wide">Stock</span><StatusBadge label={flavorStock.label} status={flavorStock.status} /></span>{data.canReadVariantPrice ? <span><span className="dragon-muted block text-[10px] uppercase tracking-wide">Internal price</span><strong className="mt-1 block text-sm">{variant.price === null ? 'Not set' : variant.price.toFixed(2)}</strong></span> : null}<span className="ml-auto flex items-end"><FlavorActionMenu canDelete={data.hasVariantDeletePermission} canUpdate={data.hasVariantUpdatePermission} onDelete={() => void deleteFlavor(variant)} onEdit={() => setFlavorEditor({ product, variant })} variant={variant} /></span></div></article> })}</div> : <div className="dragon-empty min-h-36"><PackageOpen aria-hidden="true" size={26} /><p className="m-0 font-medium">This product has no flavors yet</p>{data.hasVariantCreatePermission ? <button className="dragon-button dragon-button--primary mt-1" onClick={() => setFlavorEditor({ product, variant: null })} type="button"><Plus aria-hidden="true" size={16} />Add first flavor</button> : null}</div>}</section></td></tr> : null}
              </React.Fragment>
            })}</tbody>
          </table>
        </div>
      ) : <div className="dragon-empty"><PackageOpen aria-hidden="true" size={32} /><p className="m-0 font-semibold">No products match these filters</p><p className="dragon-muted m-0 text-sm">Clear the filters or create a product to start its flavor inventory.</p></div>}

      <footer className="dragon-pagination"><p className="dragon-muted m-0 text-sm">{data.totalDocs} products · Page {data.page} of {Math.max(data.totalPages, 1)}</p><div className="flex gap-2"><button className="dragon-button" disabled={!data.hasPrevPage} onClick={() => navigate({ page: String(data.page - 1) })} type="button"><ChevronLeft aria-hidden="true" size={16} />Previous</button><button className="dragon-button" disabled={!data.hasNextPage} onClick={() => navigate({ page: String(data.page + 1) })} type="button">Next<ChevronRight aria-hidden="true" size={16} /></button></div></footer>

      <VariantEditorDrawer canReadPrice={data.canReadVariantPrice} media={data.media} onClose={() => setFlavorEditor(null)} onSaved={refresh} open={flavorEditor !== null} productID={flavorEditor?.product.id ?? null} productName={flavorEditor?.product.name ?? ''} variant={flavorEditor?.variant ?? null} />
      <ProductPreviewDialog onOpenChange={(open) => { if (!open) setPreviewProduct(null) }} open={previewProduct !== null} product={previewProduct} />
    </div>
  )
}
