import type { PayloadRequest } from 'payload'

import { asRecord, readID, readNumber, readRelationshipLabel, readString } from '../lib/data'
import type { DashboardDTO, InventoryAlertDTO, RecentOrderDTO } from '../types'

const LOW_STOCK_THRESHOLD = 5

export async function getDashboardData(req: PayloadRequest): Promise<DashboardDTO> {
  const { payload, user } = req

  if (!user) {
    throw new Error('Authentication is required to view the dashboard')
  }

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)

  const access = {
    overrideAccess: false as const,
    req,
    user,
  }

  const [
    ordersToday,
    pendingOrders,
    processingOrders,
    activeProducts,
    activeVariants,
    lowStockVariants,
    outOfStockVariants,
    recentOrdersResult,
    inventoryResult,
  ] = await Promise.all([
    payload.count({
      ...access,
      collection: 'orders',
      where: { createdAt: { greater_than_equal: startOfToday.toISOString() } },
    }),
    payload.count({ ...access, collection: 'orders', where: { status: { equals: 'pending' } } }),
    payload.count({ ...access, collection: 'orders', where: { status: { equals: 'processing' } } }),
    payload.count({ ...access, collection: 'products', where: { is_active: { equals: true } } }),
    payload.count({ ...access, collection: 'product_variants', where: { is_active: { equals: true } } }),
    payload.count({
      ...access,
      collection: 'product_variants',
      where: {
        and: [
          { is_active: { equals: true } },
          { stock_quantity: { greater_than: 0 } },
          { stock_quantity: { less_than_equal: LOW_STOCK_THRESHOLD } },
        ],
      },
    }),
    payload.count({
      ...access,
      collection: 'product_variants',
      where: { and: [{ is_active: { equals: true } }, { stock_quantity: { equals: 0 } }] },
    }),
    payload.find({
      ...access,
      collection: 'orders',
      depth: 0,
      limit: 6,
      select: { createdAt: true, order_number: true, status: true },
      sort: '-createdAt',
    }),
    payload.find({
      ...access,
      collection: 'product_variants',
      depth: 1,
      limit: 6,
      select: {
        product: true,
        sku: true,
        stock_quantity: true,
        variant_name: true,
      },
      sort: 'stock_quantity',
      where: { is_active: { equals: true } },
    }),
  ])

  const recentOrderIDs = recentOrdersResult.docs
    .map((doc) => readID(doc))
    .filter((id): id is number | string => id !== null)

  const orderItemsResult = recentOrderIDs.length
    ? await payload.find({
        ...access,
        collection: 'order_items',
        depth: 0,
        limit: 200,
        select: { order: true },
        where: { order: { in: recentOrderIDs } },
      })
    : { docs: [] }

  const itemCounts = new Map<string, number>()
  for (const item of orderItemsResult.docs) {
    const orderID = readID(asRecord(item)?.order)
    if (orderID !== null) {
      const key = String(orderID)
      itemCounts.set(key, (itemCounts.get(key) ?? 0) + 1)
    }
  }

  const recentOrders: RecentOrderDTO[] = recentOrdersResult.docs.flatMap((doc) => {
    const record = asRecord(doc)
    const id = readID(doc)
    if (!record || id === null) return []

    return [{
      createdAt: readString(record.createdAt),
      id,
      itemCount: itemCounts.get(String(id)) ?? 0,
      orderNumber: readString(record.order_number, String(id)),
      status: readString(record.status, 'pending'),
    }]
  })

  const inventoryAlerts: InventoryAlertDTO[] = inventoryResult.docs.flatMap((doc) => {
    const record = asRecord(doc)
    const id = readID(doc)
    if (!record || id === null) return []

    return [{
      id,
      productName: readRelationshipLabel(record.product)?.name ?? 'Unknown product',
      sku: readString(record.sku),
      stockQuantity: readNumber(record.stock_quantity),
      variantName: readString(record.variant_name, String(id)),
    }]
  })

  return {
    inventoryAlerts,
    metrics: [
      { description: 'Created since midnight', label: 'Orders today', value: ordersToday.totalDocs },
      { description: 'Waiting for staff action', label: 'New / pending', value: pendingOrders.totalDocs },
      { description: 'Currently being prepared', label: 'Processing', value: processingOrders.totalDocs },
      { description: 'Visible in the kiosk catalog', label: 'Active products', value: activeProducts.totalDocs },
      { description: 'Active flavors and options', label: 'Active variants', value: activeVariants.totalDocs },
      { description: `Between 1 and ${LOW_STOCK_THRESHOLD} units`, label: 'Low stock', value: lowStockVariants.totalDocs },
      { description: 'Active variants with no stock', label: 'Out of stock', value: outOfStockVariants.totalDocs },
    ],
    recentOrders,
  }
}
