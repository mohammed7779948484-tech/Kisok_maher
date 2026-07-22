import { DefaultListView, Gutter, Link } from '@payloadcms/ui'
import { Plus } from 'lucide-react'
import type { ListViewClientProps, ListViewServerProps } from 'payload'
import React from 'react'

import { ProductsTableClient } from '../components/products/ProductsTableClient'
import { ProductsListShell, type ProductsListMode } from '../components/products/ProductsListShell'
import { getCollectionCRUDPermissions, hasCollectionFieldReadPermission } from '../lib/permissions'
import { getProductsListData } from '../queries/products'

export async function ProductsList(props: ListViewServerProps): Promise<React.ReactElement> {
  if (!props.user) throw new Error('Authentication is required to manage products')

  const productPermissions = getCollectionCRUDPermissions(props.permissions, 'products')
  const variantPermissions = getCollectionCRUDPermissions(props.permissions, 'product_variants')
  if (!productPermissions.read) throw new Error('You do not have permission to view products')

  const data = await getProductsListData({
    payload: props.payload,
    permissions: {
      canReadVariantPrice: hasCollectionFieldReadPermission(props.permissions, 'product_variants', 'price'),
      products: productPermissions,
      variants: variantPermissions,
    },
    searchParams: props.searchParams,
    user: props.user,
  })

  const viewParam = props.searchParams?.dragonView
  const mode: ProductsListMode = (Array.isArray(viewParam) ? viewParam[0] : viewParam) === 'payload' ? 'payload' : 'flavors'
  const query = new URLSearchParams()
  for (const [key, rawValue] of Object.entries(props.searchParams ?? {})) {
    if (key === 'dragonView' || rawValue === undefined) continue
    for (const value of Array.isArray(rawValue) ? rawValue : [rawValue]) query.append(key, value)
  }
  const flavorsHref = query.size ? `/admin/collections/products?${query.toString()}` : '/admin/collections/products'
  query.set('dragonView', 'payload')
  const payloadHref = `/admin/collections/products?${query.toString()}`

  const customView = (
    <Gutter>
        <main className="dragon-admin">
          <header className="dragon-page-header">
            <div>
              <p className="dragon-muted mb-1 text-sm font-medium">Unified catalog workspace</p>
              <h1 className="dragon-page-title">Products &amp; flavors</h1>
              <p className="dragon-page-description mt-2">Manage products and every flavor, image, SKU, internal price, and stock value from one screen.</p>
            </div>
            {data.hasCreatePermission ? <Link className="dragon-button dragon-button--primary" href="/admin/collections/products/create"><Plus aria-hidden="true" size={18} />New product</Link> : null}
          </header>
          <ProductsTableClient data={data} />
        </main>
    </Gutter>
  )

  const payloadViewProps: ListViewClientProps = {
    AfterList: props.AfterList,
    AfterListTable: props.AfterListTable,
    BeforeList: props.BeforeList,
    BeforeListTable: props.BeforeListTable,
    collectionSlug: props.collectionSlug,
    columnState: props.columnState,
    Description: props.Description,
    hasCreatePermission: props.hasCreatePermission,
    newDocumentURL: props.newDocumentURL,
    Table: props.Table,
    viewType: props.viewType,
    ...(props.beforeActions === undefined ? {} : { beforeActions: props.beforeActions }),
    ...(props.disableBulkDelete === undefined ? {} : { disableBulkDelete: props.disableBulkDelete }),
    ...(props.disableBulkEdit === undefined ? {} : { disableBulkEdit: props.disableBulkEdit }),
    ...(props.disableQueryPresets === undefined ? {} : { disableQueryPresets: props.disableQueryPresets }),
    ...(props.enableRowSelections === undefined ? {} : { enableRowSelections: props.enableRowSelections }),
    ...(props.hasDeletePermission === undefined ? {} : { hasDeletePermission: props.hasDeletePermission }),
    ...(props.hasTrashPermission === undefined ? {} : { hasTrashPermission: props.hasTrashPermission }),
    ...(props.listMenuItems === undefined ? {} : { listMenuItems: props.listMenuItems }),
    ...(props.queryPreset === undefined ? {} : { queryPreset: props.queryPreset }),
    ...(props.queryPresetPermissions === undefined ? {} : { queryPresetPermissions: props.queryPresetPermissions }),
    ...(props.renderedFilters === undefined ? {} : { renderedFilters: props.renderedFilters }),
    ...(props.resolvedFilterOptions === undefined ? {} : { resolvedFilterOptions: props.resolvedFilterOptions }),
  }
  const payloadView = <DefaultListView {...payloadViewProps} />

  return <ProductsListShell customView={customView} flavorsHref={flavorsHref} mode={mode} payloadHref={payloadHref} payloadView={payloadView} />
}

export default ProductsList
