import { Gutter } from '@payloadcms/ui'
import type { DocumentViewServerProps } from 'payload'
import React from 'react'

import { ProductVariantsClient } from '../components/products/ProductVariantsClient'
import { getProductVariantsViewData } from '../queries/product-variants'
import { getCollectionCRUDPermissions, hasCollectionFieldReadPermission } from '../lib/permissions'

export async function ProductVariants(props: DocumentViewServerProps): Promise<React.ReactElement> {
  const productID = props.initPageResult.docID
  if (productID === undefined) {
    return <Gutter><div className="dragon-empty"><p className="m-0 font-semibold">Save the product before adding variants.</p><p className="dragon-muted m-0 text-sm">The variants workspace becomes available after the product has an ID.</p></div></Gutter>
  }
  const variantPermissions = getCollectionCRUDPermissions(props.initPageResult.permissions, 'product_variants')
  if (!variantPermissions.read) return <Gutter><div className="dragon-empty"><p className="m-0 font-semibold">You do not have permission to view flavors.</p></div></Gutter>
  const data = await getProductVariantsViewData(
    props.initPageResult.req,
    productID,
    variantPermissions,
    hasCollectionFieldReadPermission(props.initPageResult.permissions, 'product_variants', 'price'),
  )
  return <Gutter><ProductVariantsClient data={data} /></Gutter>
}

export default ProductVariants
