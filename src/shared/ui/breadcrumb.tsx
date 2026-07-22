/**
 * Breadcrumb Component
 *
 * Generic breadcrumb navigation for storefront pages.
 * Renders a trail of clickable links separated by chevrons.
 * Server Component — no client-side state needed.
 *
 * @see Constitution: shared/ui/ = dumb, primitive UI components
 */

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
    label: string
    href?: string | undefined
}

interface BreadcrumbProps {
    items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps): React.ReactElement {
    return (
        <nav aria-label="Breadcrumb" className="mb-6">
            <ol className="flex flex-wrap items-center gap-1 text-body-medium text-on-surface-variant">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1

                    return (
                        <li key={`${item.label}-${index}`} className="flex items-center gap-1">
                            {/* Separator */}
                            {index > 0 && <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-outline" />}

                            {/* Breadcrumb item */}
                            {isLast || !item.href ? (
                                <span aria-current="page" className="px-2 py-3 text-label-medium text-on-surface">
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    href={item.href}
                                    className="inline-flex min-h-touch items-center rounded-small px-2 text-label-medium transition-colors duration-fast hover:bg-surface-container hover:text-on-surface"
                                >
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}
