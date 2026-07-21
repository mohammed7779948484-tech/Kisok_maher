import { beforeEach, describe, expect, it, vi } from 'vitest'

const { getCartBySession, create, update, removeMany, commit, rollback } = vi.hoisted(() => ({
    getCartBySession: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    removeMany: vi.fn(),
    commit: vi.fn(),
    rollback: vi.fn(),
}))

vi.mock('./queries', () => ({
    getCartBySession,
    getCartItemCount: vi.fn(),
}))

vi.mock('@/lib/payload', () => ({
    getPayloadClient: vi.fn().mockResolvedValue({
        create,
        update,
        delete: removeMany,
        db: {
            beginTransaction: vi.fn().mockResolvedValue('tx-1'),
            commitTransaction: commit,
            rollbackTransaction: rollback,
        },
    }),
}))

import { getOrCreateCart } from './mutations'

describe('reusable tablet cart', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        getCartBySession.mockResolvedValue({
            id: 42,
            session_id: 'tablet-session',
            expires_at: '2020-01-01T00:00:00.000Z',
            processing_key: null,
            processing_started_at: null,
        })
        removeMany.mockResolvedValue({ docs: [{ id: 1 }] })
        update.mockResolvedValue({ id: 42, expires_at: '2026-07-21T00:20:00.000Z' })
    })

    it('clears expired contents and reuses the same cart row', async () => {
        const cart = await getOrCreateCart('tablet-session')

        expect(create).not.toHaveBeenCalled()
        expect(removeMany).toHaveBeenCalledWith(expect.objectContaining({
            where: { cart: { equals: 42 } },
        }))
        expect(update).toHaveBeenCalledWith(expect.objectContaining({ id: 42 }))
        expect(commit).toHaveBeenCalledWith('tx-1')
        expect(rollback).not.toHaveBeenCalled()
        expect(cart.id).toBe(42)
    })
})
