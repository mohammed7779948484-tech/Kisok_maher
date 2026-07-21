import type { ActionResult, OrderStatus } from '@/modules/orders'

export type { ActionResult }

export interface TrackedOrder {
    orderNumber: string
    status: OrderStatus
    createdAt: string
    items: Array<{
        productName: string
        variantName: string
        quantity: number
    }>
}

export interface TrackOrderResult {
    order: TrackedOrder
}

export interface TrackOrderInput {
    orderNumber: string
}

export interface TimelineStep {
    status: OrderStatus
    label: string
    description: string
    isActive: boolean
    isCompleted: boolean
    timestamp?: string
}
