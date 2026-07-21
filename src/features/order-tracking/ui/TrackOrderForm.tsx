'use client'

import { useState, useTransition } from 'react'

import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Separator } from '@/shared/ui/separator'
import type { TrackedOrder } from '../types'
import { trackOrderAction } from '../actions/track-order.action'
import { OrderStatus } from './OrderStatus'

export function TrackOrderForm(): React.ReactElement {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [trackedOrder, setTrackedOrder] = useState<TrackedOrder | null>(null)

    function handleSubmit(formData: FormData): void {
        setError(null)
        setTrackedOrder(null)
        startTransition(async () => {
            const orderNumber = String(formData.get('orderNumber') ?? '').trim()
            const result = await trackOrderAction({ orderNumber })
            if (result.success && result.data) setTrackedOrder(result.data.order)
            else setError(result.error ?? 'Order not found')
        })
    }

    return (
        <div className="space-y-6">
            <form action={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="orderNumber">Order Number</Label>
                    <Input
                        id="orderNumber"
                        name="orderNumber"
                        type="text"
                        placeholder="VX-XXXXXX"
                        required
                        disabled={isPending}
                        autoComplete="off"
                        className="uppercase tracking-wider"
                    />
                </div>
                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? 'Searching…' : 'Track Order'}
                </Button>
            </form>
            {error && <div role="alert" className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}
            {trackedOrder && <><Separator /><OrderStatus order={trackedOrder} /></>}
        </div>
    )
}
