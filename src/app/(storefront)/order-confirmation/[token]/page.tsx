import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getOrderByConfirmationToken } from '@/features/checkout'
import { OrderConfirmation } from '@/features/checkout/ui/OrderConfirmation'

export const metadata: Metadata = {
    title: 'Order Confirmed — Dragon',
    description: 'Your kiosk order was placed successfully',
}

interface Props {
    params: Promise<{ token: string }>
}

export default async function OrderConfirmationPage({ params }: Props): Promise<React.ReactElement> {
    const { token } = await params
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) notFound()

    const order = await getOrderByConfirmationToken(token)
    if (!order) notFound()

    return (
        <div className="mx-auto max-w-3xl px-4 py-12">
            <OrderConfirmation order={order} />
        </div>
    )
}
