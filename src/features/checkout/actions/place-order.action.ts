'use server'

import { randomBytes } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import type { PayloadRequest } from 'payload'
import { z } from 'zod'

import { verifySession } from '@/core/auth/session'
import { AppError } from '@/core/errors'
import { Logger } from '@/core/logger'
import { checkoutRateLimiter } from '@/core/rate-limit'
import {
    claimCart,
    getCartItemsForOrderCreation,
    getOrCreateCart,
    recoverStaleCartClaim,
    resetCartAfterOrder,
} from '@/features/cart'
import { getPayloadClient } from '@/lib/payload'
import { OrderService, StockService } from '@/modules/orders'
import type { ActionResult, CheckoutResult, CreateOrderInput } from '@/modules/orders'

const inputSchema = z.object({
    idempotencyKey: z.string().uuid(),
})

const logger = new Logger()
const orderService = new OrderService()
const stockService = new StockService()

export async function placeOrderAction(input: unknown): Promise<ActionResult<CheckoutResult>> {
    let transactionID: string | number | null | undefined

    try {
        const session = await verifySession()
        if (!session) {
            return { success: false, error: 'Session expired', code: 'UNAUTHORIZED' }
        }

        const parsed = inputSchema.safeParse(input)
        if (!parsed.success) {
            return { success: false, error: 'Invalid order attempt', code: 'VALIDATION_ERROR' }
        }
        const { idempotencyKey } = parsed.data

        try {
            checkoutRateLimiter.check(session.sessionId)
        } catch {
            return { success: false, error: 'Please wait before trying again', code: 'RATE_LIMITED' }
        }

        const existing = await orderService.findByIdempotencyKey(idempotencyKey)
        if (existing) return { success: true, data: existing }

        const cart = await getOrCreateCart(session.sessionId)
        const payload = await getPayloadClient()
        transactionID = await payload.db.beginTransaction()
        if (!transactionID) {
            return { success: false, error: 'Could not start order', code: 'INTERNAL_ERROR' }
        }
        const req = { transactionID } as PayloadRequest

        await recoverStaleCartClaim(cart.id, req)
        const claimed = await claimCart(cart.id, idempotencyKey, req)
        if (!claimed) {
            await payload.db.rollbackTransaction(transactionID as string)
            transactionID = null
            const duplicate = await orderService.findByIdempotencyKey(idempotencyKey)
            return duplicate
                ? { success: true, data: duplicate }
                : { success: false, error: 'Order is already being submitted', code: 'ORDER_IN_PROGRESS' }
        }

        const items = await getCartItemsForOrderCreation(cart.id, req)
        if (items.length === 0) {
            throw new AppError('Cart is empty', 400, 'VALIDATION_ERROR')
        }
        if (items.some((item) => !item.isActive)) {
            throw new AppError('Remove unavailable items before ordering', 400, 'VALIDATION_ERROR')
        }

        await stockService.decrementStock(
            items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
            req
        )

        const confirmationToken = randomBytes(32).toString('base64url')
        const orderInput: CreateOrderInput = {
            sessionId: session.sessionId,
            cartId: cart.id,
            idempotencyKey,
            confirmationToken,
            confirmationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            items: items.map((item) => ({
                variantId: item.variantId,
                productName: item.productName,
                variantName: item.variantName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
            })),
        }

        const result = await orderService.createOrder(orderInput, req)
        await resetCartAfterOrder(cart.id, idempotencyKey, req)
        await payload.db.commitTransaction(transactionID as string)
        transactionID = null

        revalidatePath('/', 'layout')
        logger.info(`Kiosk order completed: ${result.orderNumber}`, {
            sessionId: session.sessionId,
            orderId: result.orderId,
        })
        return { success: true, data: result }
    } catch (error) {
        if (transactionID) {
            try {
                const payload = await getPayloadClient()
                await payload.db.rollbackTransaction(transactionID as string)
            } catch (rollbackError) {
                logger.error(rollbackError as Error, { context: 'Order rollback failed' })
            }
        }

        const parsed = inputSchema.safeParse(input)
        if (parsed.success) {
            const duplicate = await orderService.findByIdempotencyKey(parsed.data.idempotencyKey)
            if (duplicate) return { success: true, data: duplicate }
        }

        logger.error(error as Error, { context: 'placeOrderAction failed' })
        if (error instanceof AppError) {
            return { success: false, error: error.message, code: error.code }
        }
        return { success: false, error: 'Could not place order', code: 'INTERNAL_ERROR' }
    }
}
