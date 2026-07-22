import plugin from 'tailwindcss/plugin'
import type { Config } from 'tailwindcss'

import { createDesignTokenVariables, designSystem } from './src/shared/config/design-system'

const rgb = (token: string): string => `rgb(var(${token}) / <alpha-value>)`

const typography: Record<string, [string, { lineHeight: string; fontWeight: string }]> = Object.fromEntries(
  Object.entries(designSystem.typography).map(([name, [fontSize, lineHeight, fontWeight]]) => [
    name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`),
    [fontSize, { lineHeight, fontWeight }],
  ])
)

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/widgets/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/**/*.{js,ts,jsx,tsx,mdx}',
    './src/payload/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: rgb('--color-primary'),
          foreground: rgb('--color-on-primary'),
          container: rgb('--color-primary-container'),
          'container-foreground': rgb('--color-on-primary-container'),
        },
        secondary: {
          DEFAULT: rgb('--color-secondary'),
          foreground: rgb('--color-on-secondary'),
          container: rgb('--color-secondary-container'),
          'container-foreground': rgb('--color-on-secondary-container'),
        },
        tertiary: {
          DEFAULT: rgb('--color-tertiary'),
          foreground: rgb('--color-on-tertiary'),
        },
        surface: {
          DEFAULT: rgb('--color-surface'),
          lowest: rgb('--color-surface-container-lowest'),
          low: rgb('--color-surface-container-low'),
          container: rgb('--color-surface-container'),
          high: rgb('--color-surface-container-high'),
          highest: rgb('--color-surface-container-highest'),
        },
        'on-surface': rgb('--color-on-surface'),
        'on-surface-variant': rgb('--color-on-surface-variant'),
        outline: {
          DEFAULT: rgb('--color-outline'),
          variant: rgb('--color-outline-variant'),
        },
        success: {
          DEFAULT: rgb('--color-success-foreground'),
          container: rgb('--color-success-container'),
        },
        warning: {
          DEFAULT: rgb('--color-warning-foreground'),
          container: rgb('--color-warning-container'),
        },
        information: {
          DEFAULT: rgb('--color-information-foreground'),
          container: rgb('--color-information-container'),
        },
        destructive: {
          DEFAULT: rgb('--color-destructive-foreground'),
          foreground: rgb('--color-on-error'),
          container: rgb('--color-destructive-container'),
          'container-foreground': rgb('--color-on-error-container'),
        },
        neutral: {
          DEFAULT: rgb('--color-neutral-foreground'),
          container: rgb('--color-neutral-container'),
        },
        'focus-ring': rgb('--color-focus-ring'),
        shadow: rgb('--color-shadow'),
        scrim: rgb('--color-scrim'),
        background: rgb('--color-surface-container-low'),
        foreground: rgb('--color-on-surface'),
        card: {
          DEFAULT: rgb('--color-surface'),
          foreground: rgb('--color-on-surface'),
        },
        popover: {
          DEFAULT: rgb('--color-surface'),
          foreground: rgb('--color-on-surface'),
        },
        muted: {
          DEFAULT: rgb('--color-surface-container'),
          foreground: rgb('--color-on-surface-variant'),
        },
        accent: {
          DEFAULT: rgb('--color-primary-container'),
          foreground: rgb('--color-on-primary-container'),
        },
        border: rgb('--color-outline-variant'),
        input: rgb('--color-outline'),
        ring: rgb('--color-focus-ring'),
      },
      spacing: Object.fromEntries(
        Object.entries(designSystem.spacing).map(([key, value]) => [key, `var(--space-${key}, ${value})`])
      ),
      borderRadius: {
        small: 'var(--radius-small)',
        medium: 'var(--radius-medium)',
        large: 'var(--radius-large)',
        'extra-large': 'var(--radius-extra-large)',
        full: 'var(--radius-full)',
        sm: 'var(--radius-small)',
        md: 'var(--radius-medium)',
        lg: 'var(--radius-large)',
        xl: 'var(--radius-extra-large)',
      },
      boxShadow: {
        'elevation-0': 'var(--elevation-0)',
        'elevation-1': 'var(--elevation-1)',
        'elevation-2': 'var(--elevation-2)',
        'elevation-3': 'var(--elevation-3)',
        'elevation-4': 'var(--elevation-4)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: typography,
      minHeight: {
        touch: 'var(--size-touch-target-min)',
        field: 'var(--size-field-height-min)',
      },
      minWidth: {
        touch: 'var(--size-touch-target-min)',
      },
      height: {
        touch: 'var(--size-touch-target-min)',
        button: 'var(--size-button-height-standard)',
        prominent: 'var(--size-button-height-prominent)',
        field: 'var(--size-field-height-min)',
        'icon-button': 'var(--size-icon-button-size)',
      },
      width: {
        touch: 'var(--size-touch-target-min)',
        'icon-button': 'var(--size-icon-button-size)',
      },
      maxWidth: {
        content: 'var(--size-content-max-width)',
        dialog: 'var(--size-dialog-max-width)',
        form: 'var(--size-form-max-width)',
      },
      transitionDuration: {
        fast: 'var(--motion-fast)',
        standard: 'var(--motion-standard)',
        emphasized: 'var(--motion-emphasized)',
      },
      transitionTimingFunction: {
        standard: 'var(--motion-easing-standard)',
        emphasized: 'var(--motion-easing-emphasized)',
      },
      keyframes: {
        'refined-reveal': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'refined-mark': {
          from: { opacity: '0', transform: 'translateY(8px) rotate(-3deg)' },
          to: { opacity: '1', transform: 'translateY(0) rotate(0)' },
        },
      },
      animation: {
        'refined-reveal': 'refined-reveal var(--motion-emphasized) var(--motion-easing-emphasized) both',
        'refined-mark': 'refined-mark var(--motion-emphasized) var(--motion-easing-emphasized) both',
      },
      screens: {
        compact: { max: designSystem.breakpoints.compactMax },
        medium: designSystem.breakpoints.mediumMin,
        expanded: designSystem.breakpoints.expandedMin,
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    plugin(({ addBase }) => {
      addBase({ ':root': createDesignTokenVariables() })
    }),
  ],
}

export default config
