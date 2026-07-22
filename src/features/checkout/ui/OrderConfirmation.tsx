'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CheckCircle2, Eye, RotateCcw, SearchCheck } from 'lucide-react'

import { Button, Card, CardContent, Separator } from '@/shared/ui'

import type { OrderConfirmationData } from '../types'

interface OrderConfirmationProps {
  order: OrderConfirmationData
}

export function OrderConfirmation({ order }: OrderConfirmationProps): React.ReactElement {
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="mx-auto max-w-dialog space-y-8 text-center">
      <div>
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success-container text-success" aria-hidden="true">
          <CheckCircle2 className="h-10 w-10" />
        </span>
        <h1 className="mt-6 text-headline-large text-on-surface">Order confirmed</h1>
        <p className="mt-3 text-body-large text-on-surface-variant">The cart is empty and ready for the next customer.</p>
      </div>

      <Card className="border-primary/25 bg-primary-container/50 shadow-elevation-2">
        <CardContent className="p-6 medium:p-8">
          <p className="text-label-medium uppercase tracking-wider text-on-surface-variant">Order number</p>
          <Button
            aria-label={revealed ? `Order number ${order.orderNumber}` : 'Reveal order number'}
            aria-pressed={revealed}
            className="mt-4 max-w-full"
            onClick={() => setRevealed(true)}
            size="lg"
            type="button"
            variant={revealed ? 'outline' : 'default'}
          >
            <span aria-live="polite" className={revealed ? 'break-all text-title-large tracking-wider text-primary tabular-nums' : 'inline-flex items-center gap-2'}>
              {revealed ? order.orderNumber : <><Eye aria-hidden="true" /> Tap to reveal</>}
            </span>
          </Button>
          <p className="mt-4 text-body-small text-on-surface-variant">Save this number to track the order.</p>
        </CardContent>
      </Card>

      <Card className="text-left">
        <CardContent className="p-6">
          <h2 className="text-title-medium text-on-surface">Items</h2>
          <Separator className="my-4" />
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div className="rounded-medium bg-surface-container-low p-4" key={`${item.productName}-${item.variantName}-${index}`}>
                <p className="text-title-small text-on-surface">{item.productName}</p>
                <p className="mt-1 text-body-small text-on-surface-variant">{item.variantName} <span className="tabular-nums">× {item.quantity}</span></p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 medium:grid-cols-2">
        <Button asChild size="lg" variant="outline"><Link href="/track-order"><SearchCheck aria-hidden="true" /> Track order</Link></Button>
        <Button asChild size="lg"><Link href="/"><RotateCcw aria-hidden="true" /> Next customer</Link></Button>
      </div>
    </div>
  )
}
