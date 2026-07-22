import { SearchCheck } from 'lucide-react'

import { TrackOrderForm } from '@/features/order-tracking'
import { Card, CardContent } from '@/shared/ui'

export function TrackOrderSection(): React.ReactElement {
  return (
    <section className="customer-section" aria-labelledby="track-order-heading">
      <div className="mb-8 text-center">
        <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-information-container text-information">
          <SearchCheck aria-hidden="true" className="h-6 w-6" />
        </span>
        <h2 className="text-headline-medium text-on-surface" id="track-order-heading">Track your order</h2>
        <p className="mx-auto mt-2 max-w-xl text-body-medium text-on-surface-variant">Enter the order number shown after confirmation.</p>
      </div>
      <Card className="mx-auto max-w-form"><CardContent className="p-6 medium:p-8"><TrackOrderForm /></CardContent></Card>
    </section>
  )
}
