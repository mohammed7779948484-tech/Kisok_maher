import { Check } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import type { TimelineStep } from '../../types'

interface StatusTimelineProps {
  steps: TimelineStep[]
}

function getStepStyle(step: TimelineStep, isCancelled: boolean): string {
  if (isCancelled && step.status === 'cancelled') return 'border-destructive bg-destructive text-destructive-foreground'
  if (step.isCompleted) return 'border-success bg-success text-primary-foreground'
  if (step.isActive) return 'border-information bg-information text-primary-foreground'
  return 'border-outline bg-neutral-container text-neutral'
}

function getConnectorStyle(isCompleted: boolean): string {
  return isCompleted ? 'bg-success' : 'bg-outline-variant'
}

export function StatusTimeline({ steps }: StatusTimelineProps): React.ReactElement {
  const isCancelled = steps.some((step) => step.status === 'cancelled')

  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        return (
          <li className="flex gap-4" key={step.status}>
            <div className="flex flex-col items-center" aria-hidden="true">
              <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-label-small transition-colors duration-standard', getStepStyle(step, isCancelled))}>
                {step.isCompleted ? <Check className="h-4 w-4" /> : index + 1}
              </span>
              {!isLast && <span className={cn('h-12 w-0.5 transition-colors duration-standard', getConnectorStyle(step.isCompleted))} />}
            </div>
            <div className="pb-8 pt-1">
              <p className={cn('text-title-small', step.isActive || step.isCompleted ? 'text-on-surface' : 'text-on-surface-variant')}>{step.label}</p>
              <p className="mt-1 text-body-small text-on-surface-variant">{step.description}</p>
              {step.timestamp && <p className="mt-1 text-body-small text-on-surface-variant tabular-nums">{new Date(step.timestamp).toLocaleString()}</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
