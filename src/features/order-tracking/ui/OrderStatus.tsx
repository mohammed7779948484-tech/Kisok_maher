/**
 * Order Status Component
 *
 * Displays privacy-safe order status and item details.
 * Used on the track-order page after successful order lookup.
 *
 * @see spec.md: FR-032 (status timeline), US4 acceptance criteria
 * @see Constitution: Tailwind only, no inline styles
 */

import { Separator } from '@/shared/ui/separator'

import { STATUS_LABELS, STATUS_DESCRIPTIONS } from '../constants'
import type { TrackedOrder, TimelineStep } from '../types'
import { StatusTimeline } from './_components/StatusTimeline'

interface OrderStatusProps {
    order: TrackedOrder
}

/** Ordered statuses for the timeline (excluding cancelled — handled separately) */
const TIMELINE_STATUSES = ['pending', 'processing', 'completed'] as const

function buildTimelineSteps(order: TrackedOrder): TimelineStep[] {
    const isCancelled = order.status === 'cancelled'

    if (isCancelled) {
        // Show: pending → cancelled
        return [
            {
                status: 'pending',
                label: STATUS_LABELS.pending,
                description: STATUS_DESCRIPTIONS.pending,
                isActive: false,
                isCompleted: true,
                timestamp: order.createdAt,
            },
            {
                status: 'cancelled',
                label: STATUS_LABELS.cancelled,
                description: STATUS_DESCRIPTIONS.cancelled,
                isActive: true,
                isCompleted: false,
            },
        ]
    }

    // Build normal progression timeline
    const statusIndex = TIMELINE_STATUSES.indexOf(
        order.status as (typeof TIMELINE_STATUSES)[number]
    )

    return TIMELINE_STATUSES.map((status, index) => ({
        status,
        label: STATUS_LABELS[status],
        description: STATUS_DESCRIPTIONS[status],
        isActive: index === statusIndex,
        isCompleted: index < statusIndex,
        ...(index === 0 ? { timestamp: order.createdAt } : {}),
    }))
}

export function OrderStatus({ order }: OrderStatusProps): React.ReactElement {
    const steps = buildTimelineSteps(order)

    return (
        <div className="space-y-6">
            {/* Order Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-headline-small text-on-surface tabular-nums">
                        Order {order.orderNumber}
                    </h2>
                    <p className="mt-2 text-body-medium text-on-surface-variant tabular-nums">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </p>
                </div>
            </div>

            <Separator />

            {/* Status Timeline */}
            <div>
                <h3 className="mb-4 text-title-medium text-on-surface">Order status</h3>
                <StatusTimeline steps={steps} />
            </div>

            <Separator />

            {/* Order Items */}
            <div>
                <h3 className="mb-3 text-title-medium text-on-surface">Items ordered</h3>
                <div className="space-y-3">
                    {order.items.map((item) => (
                        <div
                            key={`${item.productName}-${item.variantName}`}
                            className="flex items-center justify-between rounded-medium border border-outline-variant bg-surface-container-low px-4 py-3"
                        >
                            <div>
                                <p className="text-title-small text-on-surface">{item.productName}</p>
                                <p className="mt-1 text-body-small text-on-surface-variant">
                                    {item.variantName} <span className="tabular-nums">× {item.quantity}</span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}
