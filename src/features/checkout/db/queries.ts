/**
 * Checkout Queries
 *
 * Read operations for order data. Delegates to OrderQueryService in modules/orders
 * for shared logic. These thin wrappers maintain the feature's public API.
 *
 * @see Constitution Line 482: Logic used by 2+ features → MODULE
 * @see Constitution Line 257: overrideAccess: true for system queries
 * @see data-model.md: orders and order_items collections
 */

import { OrderQueryService } from '@/modules/orders'
import type { OrderWithItems } from '@/modules/orders'

/** Re-export types for backward compatibility */
export type { OrderWithItems }

const orderQueryService = new OrderQueryService()

/**
 * Get order by UUID ID with items.
 *
 * @param orderId - Order UUID
 * @returns Order with items or null
 */
export async function getOrderById(orderId: string): Promise<OrderWithItems | null> {
    return orderQueryService.getOrderById(orderId)
}

/**
 * Get order by order number (VX-XXXXXX).
 *
 * @param orderNumber - Human-readable order number
 * @returns Order with items or null
 */
export async function getOrderByNumber(orderNumber: string): Promise<OrderWithItems | null> {
    return orderQueryService.getOrderByNumber(orderNumber)
}

export async function getOrderByConfirmationToken(token: string): Promise<OrderWithItems | null> {
    return orderQueryService.getOrderByConfirmationToken(token)
}
