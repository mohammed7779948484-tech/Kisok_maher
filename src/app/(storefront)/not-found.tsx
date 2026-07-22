import Link from 'next/link'
import { SearchX } from 'lucide-react'

import { Button, EmptyState } from '@/shared/ui'

export default function StorefrontNotFound(): React.ReactElement {
  return (
    <div className="customer-shell">
      <EmptyState
        action={<Button asChild><Link href="/">Return home</Link></Button>}
        description="The requested catalog page is unavailable or no longer exists."
        icon={SearchX}
        title="Page not found"
      />
    </div>
  )
}
