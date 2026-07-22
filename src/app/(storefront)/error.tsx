'use client'

import { CircleAlert } from 'lucide-react'

import { Button, EmptyState } from '@/shared/ui'

interface StorefrontErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function StorefrontError({ error: _error, reset }: StorefrontErrorProps): React.ReactElement {
  return (
    <div className="customer-shell">
      <EmptyState
        action={<Button onClick={reset} type="button">Try again</Button>}
        description="The page could not be loaded. Check the connection and try again."
        icon={CircleAlert}
        title="Something went wrong"
      />
    </div>
  )
}
