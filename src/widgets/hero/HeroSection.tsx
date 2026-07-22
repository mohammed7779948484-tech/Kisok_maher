import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

import { brandConfig } from '@/shared/config'
import { BrandIcon, Button } from '@/shared/ui'

export function HeroSection(): React.ReactElement {
  return (
    <section className="premium-hero customer-section relative overflow-hidden rounded-extra-large border border-primary/30 shadow-elevation-3">
      <div className="grid items-center gap-8 px-6 py-10 medium:grid-cols-[1fr_auto] medium:px-10 expanded:px-12 expanded:py-12">
        <div className="refined-reveal max-w-3xl">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-foreground/15 bg-primary-foreground/10 px-3 py-2 text-label-medium text-primary-foreground shadow-elevation-1 backdrop-blur-sm">
            <Sparkles aria-hidden="true" className="h-4 w-4" />
            Curated in-store selection
          </p>
          <h1 className="text-balance text-display-large text-primary-foreground">A refined way to discover your next favorite at {brandConfig.displayName}</h1>
          <p className="mt-4 max-w-2xl text-body-large text-primary-foreground/75">
            Explore the collection, compare available flavors, and confirm your selection with effortless clarity.
          </p>
          <div className="mt-8 flex flex-col gap-3 medium:flex-row">
            <Button asChild className="bg-primary-foreground text-primary shadow-elevation-2 hover:bg-primary-foreground/90" size="lg"><Link href="#products">Browse products <ArrowRight aria-hidden="true" /></Link></Button>
            <Button asChild className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground hover:text-primary" size="lg" variant="outline"><Link href="/categories">View categories</Link></Button>
          </div>
        </div>
        <BrandIcon aria-hidden="true" className="refined-reveal-delayed hidden h-40 w-40 animate-refined-mark text-primary-foreground/15 medium:block expanded:h-48 expanded:w-48" />
      </div>
    </section>
  )
}
