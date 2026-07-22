'use client'

import { useState, useTransition } from 'react'
import { CircleAlert, Loader2, Search } from 'lucide-react'

import { Button, Input, Label, Separator } from '@/shared/ui'

import { trackOrderAction } from '../actions/track-order.action'
import type { TrackedOrder } from '../types'
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
          <Label htmlFor="orderNumber">Order number</Label>
          <Input autoComplete="off" className="uppercase tracking-wider tabular-nums" disabled={isPending} id="orderNumber" name="orderNumber" placeholder="VX-XXXXXX" required type="text" />
        </div>
        <Button className="w-full" disabled={isPending} size="lg" type="submit">
          {isPending ? <><Loader2 aria-hidden="true" className="animate-spin" /> Searching…</> : <><Search aria-hidden="true" /> Track order</>}
        </Button>
      </form>
      {error && (
        <div className="flex items-start gap-3 rounded-medium border border-destructive/20 bg-destructive-container p-4 text-body-medium text-destructive-container-foreground" role="alert">
          <CircleAlert aria-hidden="true" className="mt-1 h-5 w-5 shrink-0" /> {error}
        </div>
      )}
      {trackedOrder && <><Separator /><OrderStatus order={trackedOrder} /></>}
    </div>
  )
}
