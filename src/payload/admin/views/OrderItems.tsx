import { Gutter } from '@payloadcms/ui'
import { PackageOpen } from 'lucide-react'
import type { DocumentViewServerProps } from 'payload'
import React from 'react'

import { StatusBadge } from '../components/shared/StatusBadge'
import { getCollectionCRUDPermissions } from '../lib/permissions'
import { getOrderItemsViewData } from '../queries/order-items'

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Unknown date'
    : new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export async function OrderItems(props: DocumentViewServerProps): Promise<React.ReactElement> {
  const orderID = props.initPageResult.docID
  if (orderID === undefined) {
    return (
      <Gutter>
        <div className="dragon-empty">
          <p className="m-0 font-semibold">Save the order before viewing its items.</p>
        </div>
      </Gutter>
    )
  }

  const itemPermissions = getCollectionCRUDPermissions(
    props.initPageResult.permissions,
    'order_items',
  )
  if (!itemPermissions.read) {
    return (
      <Gutter>
        <div className="dragon-empty">
          <p className="m-0 font-semibold">You do not have permission to view order items.</p>
        </div>
      </Gutter>
    )
  }

  const data = await getOrderItemsViewData(props.initPageResult.req, orderID)

  return (
    <Gutter>
      <main className="dragon-admin">
        <header>
          <p className="dragon-muted mb-1 text-sm font-medium">Order contents</p>
          <h1 className="dragon-page-title">Order #{data.orderNumber}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <StatusBadge status={data.status} />
            <span className="dragon-muted text-sm">{formatDate(data.createdAt)}</span>
            <span className="dragon-muted text-sm tabular-nums">
              {data.items.length} line{data.items.length === 1 ? '' : 's'} · {data.totalQuantity} unit{data.totalQuantity === 1 ? '' : 's'}
            </span>
          </div>
        </header>

        {data.items.length ? (
          <div className="dragon-table-wrap">
            <table aria-label={`Items in order ${data.orderNumber}`} className="dragon-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Flavor</th>
                  <th className="text-right">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr className="dragon-row" key={String(item.id)}>
                    <td className="font-medium">{item.productName}</td>
                    <td className="dragon-muted">{item.variantName}</td>
                    <td className="text-right font-medium tabular-nums">{item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="dragon-empty">
            <PackageOpen aria-hidden="true" size={30} />
            <p className="m-0 font-semibold">No items were found for this order.</p>
            <p className="dragon-muted m-0 text-sm">The order exists, but it has no linked item snapshots.</p>
          </div>
        )}
      </main>
    </Gutter>
  )
}

export default OrderItems
