import { designSystem } from '@/shared/config'

const duration = (value: string): number => Number.parseInt(value, 10) / 1000

export const easeStandard = [0.2, 0, 0, 1] as const

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: duration(designSystem.motion.fast),
    },
  },
}

export const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration(designSystem.motion.standard),
      ease: easeStandard,
    },
  },
}

export const scaleTap = {
  hover: { scale: 1.01, transition: { duration: duration(designSystem.motion.fast), ease: easeStandard } },
  tap: { scale: 0.98, transition: { duration: duration(designSystem.motion.fast), ease: easeStandard } },
}

export const glowHover = {
  rest: { scale: 1 },
  hover: {
    scale: 1.01,
    transition: {
      duration: duration(designSystem.motion.standard),
      ease: easeStandard,
    },
  },
}

export const slideInRight = {
  hidden: { x: '100%', opacity: 0 },
  show: {
    x: 0,
    opacity: 1,
    transition: {
      duration: duration(designSystem.motion.emphasized),
      ease: easeStandard,
    },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: {
      duration: duration(designSystem.motion.standard),
      ease: easeStandard,
    },
  },
}
