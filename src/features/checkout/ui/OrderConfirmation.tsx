'use client'

import Link from 'next/link'
import { useState } from 'react'

import { Separator } from '@/shared/ui/separator'
import type { OrderConfirmationData } from '../types'

interface OrderConfirmationProps {
    order: OrderConfirmationData
}

export function OrderConfirmation({ order }: OrderConfirmationProps): React.ReactElement {
    const [revealed, setRevealed] = useState(false)

    return (
        <div className="mx-auto max-w-lg space-y-8 text-center">
            <div className="flex justify-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 text-4xl text-primary" aria-hidden="true">✓</div>
            </div>
            <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">Order Confirmed</h1>
                <p className="text-muted-foreground">The cart is empty and ready for the next customer.</p>
            </div>

            <div className="rounded-lg border border-primary/20 bg-primary/5 p-6">
                <p className="text-sm text-muted-foreground">Order Number</p>
                {revealed ? (
                    <p className="mt-2 text-3xl font-bold tracking-wider text-primary">{order.orderNumber}</p>
                ) : (
                    <button
                        type="button"
                        onClick={() => setRevealed(true)}
                        className="mt-3 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground"
                    >
                        Tap to reveal
                    </button>
                )}
                <p className="mt-3 text-xs text-muted-foreground">Save this number to track the order.</p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 text-left">
                <h2 className="text-lg font-semibold">Items</h2>
                <Separator className="my-4" />
                <div className="space-y-3">
                    {order.items.map((item, index) => (
                        <div key={`${item.productName}-${item.variantName}-${index}`}>
                            <p className="text-sm font-medium">{item.productName}</p>
                            <p className="text-xs text-muted-foreground">{item.variantName} × {item.quantity}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link href="/track-order" className="rounded-lg border border-input px-6 py-2.5 text-sm font-medium hover:bg-accent">Track Order</Link>
                <Link href="/" className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">Next Customer</Link>
            </div>
        </div>
    )
}
