import type { ActionResult, OrderStatus } from '@/modules/orders'

export type { ActionResult }

export interface OrderConfirmationData {
    orderNumber: string
    status: OrderStatus
    createdAt: string
    items: Array<{
        productName: string
        variantName: string
        quantity: number
    }>
}
