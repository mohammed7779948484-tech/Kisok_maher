/** Privacy-safe order reads for confirmation and tracking. */

import { getPayloadClient } from '@/lib/payload'
import type { OrderStatus } from '../constants'

export interface OrderWithItems {
    id: string
    orderNumber: string
    status: OrderStatus
    createdAt: string
    items: Array<{
        productName: string
        variantName: string
        quantity: number
    }>
}

export class OrderQueryService {
    async getOrderById(orderId: string): Promise<OrderWithItems | null> {
        const payload = await getPayloadClient()
        const order = await payload.findByID({
            collection: 'orders',
            id: orderId,
            depth: 0,
            overrideAccess: true,
        })
        if (!order) return null
        return this.projectOrder(order.id, order.order_number, order.status, order.createdAt)
    }

    async getOrderByNumber(orderNumber: string): Promise<OrderWithItems | null> {
        const payload = await getPayloadClient()
        const result = await payload.find({
            collection: 'orders',
            where: { order_number: { equals: orderNumber } },
            limit: 1,
            depth: 0,
            overrideAccess: true,
        })
        const order = result.docs[0]
        if (!order) return null
        return this.projectOrder(order.id, order.order_number, order.status, order.createdAt)
    }

    async getOrderByConfirmationToken(token: string): Promise<OrderWithItems | null> {
        const payload = await getPayloadClient()
        const result = await payload.find({
            collection: 'orders',
            where: {
                and: [
                    { confirmation_token: { equals: token } },
                    { confirmation_token_expires_at: { greater_than: new Date().toISOString() } },
                ],
            },
            limit: 1,
            depth: 0,
            overrideAccess: true,
        })
        const order = result.docs[0]
        if (!order) return null
        return this.projectOrder(order.id, order.order_number, order.status, order.createdAt)
    }

    private async projectOrder(
        orderId: string | number,
        orderNumber: string,
        status: OrderStatus,
        createdAt: string
    ): Promise<OrderWithItems> {
        const payload = await getPayloadClient()
        const items = await payload.find({
            collection: 'order_items',
            where: { order: { equals: orderId } },
            limit: 100,
            depth: 0,
            overrideAccess: true,
        })

        return {
            id: String(orderId),
            orderNumber,
            status,
            createdAt,
            items: items.docs.map((item) => ({
                productName: item.product_name,
                variantName: item.variant_name,
                quantity: item.quantity,
            })),
        }
    }
}
