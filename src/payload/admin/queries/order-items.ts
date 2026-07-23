import type { PayloadRequest } from 'payload'

import { asRecord, readID, readNumber, readString } from '../lib/data'
import type { OrderItemDetailDTO, OrderItemsViewDTO } from '../types'

export async function getOrderItemsViewData(
  req: PayloadRequest,
  orderID: number | string,
): Promise<OrderItemsViewDTO> {
  const { payload, user } = req
  if (!user) throw new Error('Authentication is required to view order items')

  const access = { overrideAccess: false as const, req, user }
  const [order, itemsResult] = await Promise.all([
    payload.findByID({
      ...access,
      collection: 'orders',
      depth: 0,
      id: orderID,
      select: {
        createdAt: true,
        order_number: true,
        status: true,
      },
    }),
    payload.find({
      ...access,
      collection: 'order_items',
      depth: 0,
      limit: 200,
      select: {
        product_name: true,
        quantity: true,
        variant_name: true,
      },
      sort: 'id',
      where: {
        order: { equals: orderID },
      },
    }),
  ])

  const orderRecord = asRecord(order)
  const items: OrderItemDetailDTO[] = itemsResult.docs.flatMap((doc) => {
    const record = asRecord(doc)
    const id = readID(doc)
    if (!record || id === null) return []

    return [{
      id,
      productName: readString(record.product_name, 'Unknown product'),
      quantity: readNumber(record.quantity),
      variantName: readString(record.variant_name, 'Unknown flavor'),
    }]
  })

  return {
    createdAt: readString(orderRecord?.createdAt),
    items,
    orderID,
    orderNumber: readString(orderRecord?.order_number, String(orderID)),
    status: readString(orderRecord?.status, 'pending'),
    totalQuantity: items.reduce((total, item) => total + item.quantity, 0),
  }
}
