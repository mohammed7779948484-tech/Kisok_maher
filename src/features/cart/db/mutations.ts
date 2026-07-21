/** Cart writes through Payload Local API. */

import type { PayloadRequest } from 'payload'

import { AppError } from '@/core/errors'
import { getPayloadClient } from '@/lib/payload'
import {
    CART_EXPIRY_MS,
    CART_FULL_MESSAGE,
    CART_PROCESSING_TIMEOUT_MS,
    MAX_CART_ITEMS,
    MAX_QUANTITY,
} from '@/modules/orders'
import { getCartBySession, getCartItemCount } from './queries'

function nextExpiry(): string {
    return new Date(Date.now() + CART_EXPIRY_MS).toISOString()
}

function isExpired(value: unknown): boolean {
    return typeof value !== 'string' || new Date(value).getTime() <= Date.now()
}

function isRecentClaim(startedAt: unknown): boolean {
    return typeof startedAt === 'string'
        && Date.now() - new Date(startedAt).getTime() < CART_PROCESSING_TIMEOUT_MS
}

/** Find, recover, or create the single reusable cart for this tablet session. */
export async function getOrCreateCart(sessionId: string) {
    const payload = await getPayloadClient()
    const existing = await getCartBySession(sessionId)

    if (!existing) {
        return payload.create({
            collection: 'carts',
            data: {
                session_id: sessionId,
                expires_at: nextExpiry(),
            },
            depth: 0,
            overrideAccess: true,
        })
    }

    if (!isExpired(existing.expires_at)) return existing

    if (existing.processing_key && isRecentClaim(existing.processing_started_at)) {
        return existing
    }

    const transactionID = await payload.db.beginTransaction()
    if (!transactionID) {
        throw new AppError('Could not recover cart', 500, 'INTERNAL_ERROR')
    }
    const req = { transactionID } as PayloadRequest

    try {
        await clearCart(existing.id, req)
        const recovered = await payload.update({
            collection: 'carts',
            id: existing.id,
            data: {
                expires_at: nextExpiry(),
                processing_key: null,
                processing_started_at: null,
            },
            depth: 0,
            overrideAccess: true,
            context: { skipRevalidation: true },
            req,
        })
        await payload.db.commitTransaction(transactionID as string)
        return recovered
    } catch (error) {
        await payload.db.rollbackTransaction(transactionID as string)
        throw error
    }
}

export async function addItemToCart(
    cartId: string | number,
    variantId: number,
    quantity: number
) {
    const payload = await getPayloadClient()
    const existing = await payload.find({
        collection: 'cart_items',
        where: {
            and: [
                { cart: { equals: cartId } },
                { variant: { equals: variantId } },
            ],
        },
        limit: 1,
        depth: 0,
        overrideAccess: true,
    })

    if (existing.docs[0]) {
        const existingItem = existing.docs[0]
        return payload.update({
            collection: 'cart_items',
            id: existingItem.id,
            data: {
                quantity: Math.min(Number(existingItem.quantity) + quantity, MAX_QUANTITY),
            },
            depth: 0,
            overrideAccess: true,
        })
    }

    if (await getCartItemCount(cartId) >= MAX_CART_ITEMS) {
        throw new AppError(CART_FULL_MESSAGE, 400, 'CART_FULL')
    }

    return payload.create({
        collection: 'cart_items',
        data: {
            cart: cartId,
            variant: variantId,
            quantity: Math.min(quantity, MAX_QUANTITY),
        },
        depth: 0,
        overrideAccess: true,
    })
}

export async function updateCartItem(
    cartId: string | number,
    cartItemId: number,
    quantity: number
) {
    const payload = await getPayloadClient()
    const owned = await findOwnedItem(cartId, cartItemId)
    if (!owned) throw new AppError('Cart item not found', 404, 'NOT_FOUND')

    return payload.update({
        collection: 'cart_items',
        id: cartItemId,
        data: { quantity: Math.min(Math.max(quantity, 1), MAX_QUANTITY) },
        depth: 0,
        overrideAccess: true,
    })
}

export async function removeCartItem(
    cartId: string | number,
    cartItemId: number
): Promise<void> {
    const payload = await getPayloadClient()
    const owned = await findOwnedItem(cartId, cartItemId)
    if (!owned) throw new AppError('Cart item not found', 404, 'NOT_FOUND')

    await payload.delete({
        collection: 'cart_items',
        id: cartItemId,
        overrideAccess: true,
    })
}

async function findOwnedItem(cartId: string | number, cartItemId: number) {
    const payload = await getPayloadClient()
    const result = await payload.find({
        collection: 'cart_items',
        where: {
            and: [
                { id: { equals: cartItemId } },
                { cart: { equals: cartId } },
            ],
        },
        limit: 1,
        depth: 0,
        overrideAccess: true,
    })
    return result.docs[0] ?? null
}

export async function clearCart(
    cartId: string | number,
    req?: PayloadRequest
): Promise<number> {
    const payload = await getPayloadClient()
    const result = await payload.delete({
        collection: 'cart_items',
        where: { cart: { equals: cartId } },
        overrideAccess: true,
        ...(req ? { req } : {}),
    })
    return result.docs?.length ?? 0
}

export async function extendExpiration(
    cartId: string | number,
    req?: PayloadRequest
): Promise<void> {
    const payload = await getPayloadClient()
    await payload.update({
        collection: 'carts',
        id: cartId,
        data: { expires_at: nextExpiry() },
        depth: 0,
        overrideAccess: true,
        context: { skipRevalidation: true },
        ...(req ? { req } : {}),
    })
}

/** Atomically claim an available cart for one idempotent order attempt. */
export async function claimCart(
    cartId: string | number,
    processingKey: string,
    req: PayloadRequest
): Promise<boolean> {
    const payload = await getPayloadClient()
    const result = await payload.update({
        collection: 'carts',
        where: {
            and: [
                { id: { equals: cartId } },
                { processing_key: { exists: false } },
            ],
        },
        limit: 1,
        data: {
            processing_key: processingKey,
            processing_started_at: new Date().toISOString(),
        },
        depth: 0,
        overrideAccess: true,
        context: { skipRevalidation: true },
        req,
    })
    return result.docs.length === 1 && result.errors.length === 0
}

/** Release only claims older than the documented timeout. */
export async function recoverStaleCartClaim(
    cartId: string | number,
    req: PayloadRequest
): Promise<void> {
    const payload = await getPayloadClient()
    const staleBefore = new Date(Date.now() - CART_PROCESSING_TIMEOUT_MS).toISOString()
    await payload.update({
        collection: 'carts',
        where: {
            and: [
                { id: { equals: cartId } },
                { processing_key: { exists: true } },
                { processing_started_at: { less_than: staleBefore } },
            ],
        },
        limit: 1,
        data: {
            processing_key: null,
            processing_started_at: null,
        },
        depth: 0,
        overrideAccess: true,
        context: { skipRevalidation: true },
        req,
    })
}

/** Clear this attempt's claim without touching another request's claim. */
export async function releaseCartClaim(
    cartId: string | number,
    processingKey: string,
    req: PayloadRequest
): Promise<void> {
    const payload = await getPayloadClient()
    await payload.update({
        collection: 'carts',
        where: {
            and: [
                { id: { equals: cartId } },
                { processing_key: { equals: processingKey } },
            ],
        },
        limit: 1,
        data: {
            processing_key: null,
            processing_started_at: null,
            expires_at: nextExpiry(),
        },
        depth: 0,
        overrideAccess: true,
        context: { skipRevalidation: true },
        req,
    })
}

export async function resetCartAfterOrder(
    cartId: string | number,
    processingKey: string,
    req: PayloadRequest
): Promise<void> {
    await clearCart(cartId, req)
    await releaseCartClaim(cartId, processingKey, req)
}
