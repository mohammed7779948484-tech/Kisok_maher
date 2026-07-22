import { describe, expect, it } from 'vitest'

import { brandConfig } from './brand.config'
import { createDesignTokenVariables, designSystem } from './design-system'

describe('customer design system', () => {
  it('keeps the canonical kisok palette and branding centralized', () => {
    expect(brandConfig.displayName).toBe('kisok')
    expect(designSystem.colors).toMatchObject({
      primary: '25 75 69',
      onPrimary: '255 255 255',
      primaryContainer: '216 232 229',
      surface: '255 255 255',
      onSurface: '24 33 31',
      focusRing: '44 113 104',
    })
  })

  it('emits stable semantic CSS custom properties', () => {
    expect(createDesignTokenVariables()).toMatchObject({
      '--color-primary': '25 75 69',
      '--color-primary-container': '216 232 229',
      '--color-on-surface': '24 33 31',
      '--color-success-container': '216 240 221',
      '--color-focus-ring': '44 113 104',
      '--radius-medium': '12px',
      '--size-touch-target-min': '48px',
      '--motion-standard': '200ms',
      '--motion-easing-emphasized': 'cubic-bezier(0.16, 1, 0.3, 1)',
    })
  })
})
