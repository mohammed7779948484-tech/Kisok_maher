import type { HTMLAttributes } from 'react'
import { BadgeCheck, CircleAlert, CircleHelp, Info } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'

type StatusTone = 'success' | 'warning' | 'information' | 'destructive' | 'neutral'

interface StatusBadgeProps extends HTMLAttributes<HTMLDivElement> {
  tone: StatusTone
}

const ICONS = {
  success: BadgeCheck,
  warning: CircleAlert,
  information: Info,
  destructive: CircleAlert,
  neutral: CircleHelp,
} as const

export function StatusBadge({ children, tone, ...props }: StatusBadgeProps): React.ReactElement {
  const Icon = ICONS[tone]

  return (
    <Badge variant={tone} {...props}>
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {children}
    </Badge>
  )
}
