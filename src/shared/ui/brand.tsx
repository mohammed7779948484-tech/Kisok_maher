import type { HTMLAttributes, SVGAttributes } from 'react'

import { brandConfig } from '@/shared/config'
import { cn } from '@/shared/lib/utils'

export interface BrandIconProps extends SVGAttributes<SVGSVGElement> {
  title?: string
}

export function BrandIcon({ className, title, ...props }: BrandIconProps): React.ReactElement {
  return (
    <svg
      aria-hidden={title ? undefined : true}
      className={cn('shrink-0', className)}
      fill="none"
      role={title ? 'img' : undefined}
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <path
        d="M11 7.5v33"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="5"
      />
      <path
        d="m13.5 25 18-17.5M13.5 23l19 17.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="5"
      />
      <path d="M34 9.5h5v5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
    </svg>
  )
}

export interface BrandLogoProps extends HTMLAttributes<HTMLSpanElement> {
  iconClassName?: string
  showName?: boolean
}

export function BrandLogo({ className, iconClassName, showName = true, ...props }: BrandLogoProps): React.ReactElement {
  return (
    <span className={cn('inline-flex items-center gap-3 text-primary', className)} {...props}>
      <BrandIcon className={cn('h-10 w-10', iconClassName)} />
      {showName ? (
        <span className="text-title-large tracking-[-0.04em] text-on-surface">{brandConfig.displayName}</span>
      ) : null}
    </span>
  )
}
