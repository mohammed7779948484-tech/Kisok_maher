import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import { getVisibleEntities } from '@payloadcms/ui/shared'
import { redirect } from 'next/navigation'
import type { AdminViewServerProps } from 'payload'
import React from 'react'

import { CatalogClient } from '../components/catalog/CatalogClient'
import { getCatalogData } from '../queries/catalog'
import { getCollectionCRUDPermissions } from '../lib/permissions'

export async function Catalog(props: AdminViewServerProps): Promise<React.ReactElement> {
  const { initPageResult } = props
  const { req } = initPageResult
  if (!req.user) redirect('/admin/login?redirect=%2Fadmin%2Fcatalog')
  const brandPermissions = getCollectionCRUDPermissions(initPageResult.permissions, 'brands')
  const categoryPermissions = getCollectionCRUDPermissions(initPageResult.permissions, 'categories')
  if (!brandPermissions.read && !categoryPermissions.read) throw new Error('You do not have permission to view the catalog')
  const data = await getCatalogData(req, { brands: brandPermissions, categories: categoryPermissions })
  const visibleEntities = getVisibleEntities({ req })
  return (
    <DefaultTemplate
      {...props}
      {...(initPageResult.locale ? { locale: initPageResult.locale } : {})}
      i18n={req.i18n}
      permissions={initPageResult.permissions}
      req={req}
      user={req.user}
      visibleEntities={{
        collections: [...visibleEntities.collections],
        globals: [...visibleEntities.globals],
      }}
    >
      <Gutter><main className="dragon-admin"><header><p className="dragon-muted mb-1 text-sm font-medium">Catalog structure</p><h1 className="dragon-page-title">Brands &amp; categories</h1><p className="dragon-page-description mt-2">Manage the taxonomy used by products and the kiosk storefront from one searchable workspace.</p></header><CatalogClient data={data} /></main></Gutter>
    </DefaultTemplate>
  )
}

export default Catalog
