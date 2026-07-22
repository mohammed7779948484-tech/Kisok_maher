import { Gutter } from '@payloadcms/ui'
import type { ListViewServerProps } from 'payload'
import React from 'react'

import { OrdersTableClient } from '../components/orders/OrdersTableClient'
import { getCollectionCRUDPermissions } from '../lib/permissions'
import { getOrdersListData } from '../queries/orders'

export async function OrdersList(props: ListViewServerProps): Promise<React.ReactElement> {
  if (!props.user) throw new Error('Authentication is required to view orders')
  const orderPermissions = getCollectionCRUDPermissions(props.permissions, 'orders')
  if (!orderPermissions.read) throw new Error('You do not have permission to view orders')
  const data = await getOrdersListData({ payload: props.payload, searchParams: props.searchParams, user: props.user })
  return <Gutter><main className="dragon-admin"><header><p className="dragon-muted mb-1 text-sm font-medium">Kiosk operations</p><h1 className="dragon-page-title">Orders</h1><p className="dragon-page-description mt-2">Review in-store confirmations, item counts, and fulfillment status.</p></header><OrdersTableClient data={data} /></main></Gutter>
}

export default OrdersList
