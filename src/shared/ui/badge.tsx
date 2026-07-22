import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/shared/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-small border px-3 py-1 text-label-small focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary-container text-primary-container-foreground',
        secondary: 'border-transparent bg-secondary-container text-secondary-container-foreground',
        success: 'border-success/20 bg-success-container text-success',
        warning: 'border-warning/20 bg-warning-container text-warning',
        information: 'border-information/20 bg-information-container text-information',
        destructive: 'border-destructive/20 bg-destructive-container text-destructive-container-foreground',
        neutral: 'border-neutral/20 bg-neutral-container text-neutral',
        outline: 'border-outline text-on-surface',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps): React.ReactElement {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
