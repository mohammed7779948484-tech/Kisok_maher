import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/shared/lib/utils'

const buttonVariants = cva(
  'premium-interactive inline-flex min-h-touch items-center justify-center gap-2 whitespace-nowrap rounded-medium px-5 text-label-large focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none [&_svg]:pointer-events-none [&_svg]:h-5 [&_svg]:w-5 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-elevation-1 hover:bg-primary/94 hover:shadow-elevation-2 active:bg-primary/86',
        destructive: 'bg-destructive text-destructive-foreground shadow-elevation-1 hover:bg-destructive/90',
        outline: 'border border-outline bg-surface/95 text-primary shadow-elevation-1 hover:border-primary/50 hover:bg-primary-container hover:text-primary-container-foreground hover:shadow-elevation-2',
        secondary: 'bg-secondary-container text-secondary-container-foreground hover:bg-secondary-container/75',
        ghost: 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
        link: 'min-h-touch px-2 text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-button',
        sm: 'h-touch px-4 text-label-medium',
        lg: 'h-prominent px-8',
        icon: 'h-icon-button w-icon-button p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, className, size, variant, ...props }, ref) => {
    const Component = asChild ? Slot : 'button'

    return (
      <Component
        className={cn(buttonVariants({ className, size, variant }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
