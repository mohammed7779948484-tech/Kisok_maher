import type { HTMLAttributes } from 'react'

import { cn } from '@/shared/lib/utils'

interface PageHeaderProps extends HTMLAttributes<HTMLDivElement> {
  description?: string
  eyebrow?: string
  title: string
}

export function PageHeader({ className, description, eyebrow, title, ...props }: PageHeaderProps): React.ReactElement {
  return (
    <header className={cn('mb-8 max-w-3xl', className)} {...props}>
      {eyebrow ? <p className="mb-2 text-label-medium uppercase tracking-wider text-primary">{eyebrow}</p> : null}
      <h1 className="break-words text-headline-large text-on-surface">{title}</h1>
      {description ? <p className="mt-3 text-body-large text-on-surface-variant">{description}</p> : null}
    </header>
  )
}
