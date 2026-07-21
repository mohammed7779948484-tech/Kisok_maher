import type { PayloadRequest } from 'payload'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { find, create } = vi.hoisted(() => ({
    find: vi.fn(),
    create: vi.fn(),
}))

vi.mock('@/lib/payload', () => ({
    getPayloadClient: vi.fn().mockResolvedValue({ find, create }),
}))

import { OrderService } from './order.service'

describe('OrderService kiosk snapshots', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        find.mockResolvedValue({ totalDocs: 0, docs: [] })
        create
            .mockResolvedValueOnce({ id: 'order-1' })
            .mockResolvedValue({ id: 1 })
    })

    it('preserves null and zero unit prices without legacy totals or customer data', async () => {
        const service = new OrderService()
        const result = await service.createOrder({
            sessionId: 'session-1',
            cartId: 7,
            idempotencyKey: '63e08b39-7952-4df0-a0be-c34800ce4486',
            confirmationToken: 'token',
            confirmationTokenExpiresAt: '2026-07-22T00:00:00.000Z',
            items: [
                { variantId: 1, productName: 'A', variantName: 'One', quantity: 1, unitPrice: null },
                { variantId: 2, productName: 'B', variantName: 'Two', quantity: 2, unitPrice: 0 },
            ],
        }, {} as PayloadRequest)

        const orderData = create.mock.calls[0]?.[0].data
        expect(orderData).not.toHaveProperty('customer_name')
        expect(orderData).not.toHaveProperty('customer_phone')
        expect(orderData).not.toHaveProperty('total_amount')

        expect(create.mock.calls[1]?.[0].data).toMatchObject({ unit_price: null })
        expect(create.mock.calls[2]?.[0].data).toMatchObject({ unit_price: 0 })
        expect(create.mock.calls[1]?.[0].data).not.toHaveProperty('total_price')
        expect(result.confirmationToken).toBe('token')
    })
})
