import { Gutter, Link } from '@payloadcms/ui'
import {
  AlertTriangle,
  Boxes,
  ClipboardList,
  Layers3,
  PackagePlus,
  Settings,
  ShoppingBag,
} from 'lucide-react'
import type { AdminViewServerProps } from 'payload'
import React from 'react'

import { StatusBadge } from '../components/shared/StatusBadge'
import { getCollectionCRUDPermissions, getGlobalPermissions } from '../lib/permissions'
import { getDashboardData } from '../queries/dashboard'

function formatDate(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Unknown time'
    : new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date)
}

export async function Dashboard(props: AdminViewServerProps): Promise<React.ReactElement> {
  const { initPageResult } = props
  const permissions = initPageResult.permissions
  const orders = getCollectionCRUDPermissions(permissions, 'orders')
  const products = getCollectionCRUDPermissions(permissions, 'products')
  const variants = getCollectionCRUDPermissions(permissions, 'product_variants')
  const brands = getCollectionCRUDPermissions(permissions, 'brands')
  const categories = getCollectionCRUDPermissions(permissions, 'categories')
  const media = getCollectionCRUDPermissions(permissions, 'media')
  const siteSettings = getGlobalPermissions(permissions, 'site-settings')
  const data = await getDashboardData(initPageResult.req)

  return (
      <Gutter>
        <main className="dragon-admin">
          <header className="dragon-page-header">
            <div>
              <p className="dragon-muted mb-1 text-sm font-medium">Dragon operations</p>
              <h1 className="dragon-page-title">Store overview</h1>
              <p className="dragon-page-description mt-2">
                Orders, catalog health, and the inventory items that need attention today.
              </p>
            </div>
            {products.create ? <Link className="dragon-button dragon-button--primary" href="/admin/collections/products/create">
              <PackagePlus aria-hidden="true" size={18} />
              New product
            </Link> : null}
          </header>

          <section aria-label="Store metrics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.metrics.map((metric, index) => (
              <article className="dragon-card" key={metric.label}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="dragon-muted m-0 text-sm font-medium">{metric.label}</p>
                  {index < 3 ? <ShoppingBag aria-hidden="true" size={18} /> : <Boxes aria-hidden="true" size={18} />}
                </div>
                <p className="m-0 text-3xl font-semibold tabular-nums">{metric.value}</p>
                <p className="dragon-muted mb-0 mt-2 text-xs">{metric.description}</p>
              </article>
            ))}
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
            {orders.read ? <section className="dragon-card p-0" aria-labelledby="recent-orders-heading">
              <div className="dragon-section-header">
                <div>
                  <h2 className="dragon-card-title" id="recent-orders-heading">Recent orders</h2>
                  <p className="dragon-muted mb-0 mt-1 text-sm">Newest kiosk confirmations</p>
                </div>
                <Link className="dragon-button" href="/admin/collections/orders">View all</Link>
              </div>
              {data.recentOrders.length ? (
                <div className="overflow-x-auto">
                  <table className="dragon-table min-w-[560px]">
                    <thead><tr><th>Order</th><th>Status</th><th>Items</th><th>Created</th></tr></thead>
                    <tbody>
                      {data.recentOrders.map((order) => (
                        <tr className="dragon-row" key={String(order.id)}>
                          <td><Link href={`/admin/collections/orders/${order.id}`}>#{order.orderNumber}</Link></td>
                          <td><StatusBadge status={order.status} /></td>
                          <td>{order.itemCount}</td>
                          <td className="dragon-muted">{formatDate(order.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <div className="dragon-empty m-5"><ClipboardList aria-hidden="true" size={28} /><p className="m-0 font-medium">No orders yet</p></div>}
            </section> : null}

            {variants.read ? <section className="dragon-card" aria-labelledby="inventory-heading">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 className="dragon-card-title" id="inventory-heading">Inventory watch</h2>
                  <p className="dragon-muted mb-0 mt-1 text-sm">Lowest active variant stock</p>
                </div>
                <AlertTriangle aria-hidden="true" size={20} />
              </div>
              {data.inventoryAlerts.length ? (
                <ul className="m-0 grid list-none gap-3 p-0">
                  {data.inventoryAlerts.map((item) => (
                    <li className="flex items-center justify-between gap-4 rounded-lg border p-3" key={String(item.id)}>
                      <div className="min-w-0">
                        <p className="m-0 truncate font-medium">{item.productName}</p>
                        <p className="dragon-muted mb-0 mt-1 truncate text-xs">{item.variantName}{item.sku ? ` · ${item.sku}` : ''}</p>
                      </div>
                      <StatusBadge label={`${item.stockQuantity} left`} status={item.stockQuantity === 0 ? 'out-of-stock' : 'low-stock'} />
                    </li>
                  ))}
                </ul>
              ) : <div className="dragon-empty min-h-40"><Boxes aria-hidden="true" size={26} /><p className="m-0 font-medium">No inventory alerts</p></div>}
            </section> : null}
          </div>

          <section className="dragon-card" aria-labelledby="quick-actions-heading">
            <h2 className="dragon-card-title" id="quick-actions-heading">Quick actions</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {orders.read ? <Link className="dragon-button" href="/admin/collections/orders"><ClipboardList aria-hidden="true" size={17} />Orders</Link> : null}
              {products.read ? <Link className="dragon-button" href="/admin/collections/products"><Boxes aria-hidden="true" size={17} />Products</Link> : null}
              {brands.read || categories.read ? <Link className="dragon-button" href="/admin/catalog"><Layers3 aria-hidden="true" size={17} />Catalog</Link> : null}
              {media.read ? <Link className="dragon-button" href="/admin/collections/media"><Boxes aria-hidden="true" size={17} />Media</Link> : null}
              {siteSettings.read ? <Link className="dragon-button" href="/admin/globals/site-settings"><Settings aria-hidden="true" size={17} />Store settings</Link> : null}
            </div>
          </section>
        </main>
      </Gutter>
  )
}

export default Dashboard
