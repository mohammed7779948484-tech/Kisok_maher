import { LockKeyhole } from 'lucide-react'

import { BrandLogo, Card, CardContent } from '@/shared/ui'
import { brandConfig } from '@/shared/config'

import { GateForm } from './GateForm'

export function GateScreen(): React.ReactElement {
  return (
    <main className="premium-canvas flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="refined-reveal w-full max-w-dialog">
        <div className="mb-8 text-center">
          <BrandLogo className="justify-center" iconClassName="h-16 w-16" />
          <h1 className="mt-6 text-headline-large text-on-surface">Welcome to {brandConfig.displayName}</h1>
          <p className="mx-auto mt-3 max-w-sm text-body-large text-on-surface-variant">
            Enter the shared store password to begin a private kiosk session.
          </p>
        </div>

        <Card className="rounded-extra-large shadow-elevation-3">
          <CardContent className="p-6 medium:p-8">
            <div className="mb-6 flex items-center gap-3 rounded-medium bg-information-container p-4 text-information">
              <LockKeyhole aria-hidden="true" className="h-5 w-5 shrink-0" />
              <p className="text-body-medium">Access is limited to authorized store visitors.</p>
            </div>
            <GateForm />
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-body-small text-on-surface-variant">This is a private storefront.</p>
      </div>
    </main>
  )
}
