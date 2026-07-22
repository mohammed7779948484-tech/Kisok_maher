import type { Metadata } from 'next'
import { SearchCheck } from 'lucide-react'

import { TrackOrderForm } from '@/features/order-tracking'
import { brandConfig } from '@/shared/config'
import { Card, CardContent, PageHeader } from '@/shared/ui'

export const metadata: Metadata = {
  title: `Track Order — ${brandConfig.displayName}`,
  description: 'Track an order by order number',
}

export default function TrackOrderPage(): React.ReactElement {
  return (
    <div className="customer-shell max-w-form">
      <PageHeader description="Enter the order number shown after confirmation." eyebrow="Order status" title="Track your order" />
      <Card>
        <CardContent className="p-6 medium:p-8">
          <div className="mb-6 flex items-center gap-3 rounded-medium bg-information-container p-4 text-information">
            <SearchCheck aria-hidden="true" className="h-5 w-5 shrink-0" />
            <p className="text-body-medium">Order numbers begin with VX and are shown only after an order is confirmed.</p>
          </div>
          <TrackOrderForm />
        </CardContent>
      </Card>
    </div>
  )
}
