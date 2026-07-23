/**
 * Environment Configuration - Validated with Zod
 *
 * Features:
 * - Strict validation of all environment variables at startup
 * - Type-safe access throughout the application
 * - Clear error messages for missing/invalid variables
 * - Fail-fast on misconfiguration
 */

import { z } from 'zod'

/** Transform empty strings to undefined so optional() works correctly. */
const emptyToUndefined = z.string().transform((val) => val === '' ? undefined : val)

const envSchema = z.object({
  // Database
  DATABASE_URL: z
    .string()
    .url()
    .startsWith('postgresql://', 'Must be a PostgreSQL connection string'),

  // Payload CMS
  PAYLOAD_SECRET: z
    .string()
    .min(32, 'PAYLOAD_SECRET must be at least 32 characters'),

  NEXT_PUBLIC_SERVER_URL: z
    .string()
    .url()
    .default('http://localhost:3000'),

  // Authentication
  SESSION_SECRET: z
    .string()
    .min(32, 'SESSION_SECRET must be at least 32 characters'),

  GATE_PASSWORD: z
    .string()
    .min(6, 'GATE_PASSWORD must be at least 6 characters'),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'Cloudinary Cloud Name is required'),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: emptyToUndefined.pipe(z.string().min(1).optional()).optional(),
  CLOUDINARY_API_KEY: z.string().min(1, 'Cloudinary API Key is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'Cloudinary API Secret is required'),

  // Sentry (optional monitoring)
  SENTRY_DSN: emptyToUndefined.pipe(z.string().url().optional()).optional(),
  NEXT_PUBLIC_SENTRY_DSN: emptyToUndefined.pipe(z.string().url().optional()).optional(),

  // Cron (optional until background jobs are needed)
  CRON_SECRET: emptyToUndefined.optional(),

  // App
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  PORT: z
    .string()
    .default('3000'),

  LOG_LEVEL: z
    .enum(['debug', 'info', 'warn', 'error'])
    .default('info'),

  // Optional: Seed credentials
  SEED_ADMIN_EMAIL: z.string().email().optional(),
  SEED_ADMIN_PASSWORD: z.string().optional(),
  WHATSAPP_NUMBER: z.string().optional(),
}).superRefine((values, context) => {
  if (
    values.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    values.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME !== values.CLOUDINARY_CLOUD_NAME
  ) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Public and server Cloudinary cloud names must match',
      path: ['NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME'],
    })
  }
})

/**
 * Parse and validate environment variables.
 * Throws an error if any required variables are missing or invalid.
 */
function parseEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.errors
        .filter((entry) => entry.message.includes('Required'))
        .map((entry) => entry.path.join('.'))

      const invalid = error.errors
        .filter((entry) => !entry.message.includes('Required'))
        .map((entry) => `${entry.path.join('.')}: ${entry.message}`)

      console.error('\n❌ Environment Validation Failed\n')

      if (missing.length > 0) {
        console.error('Missing required variables:')
        missing.forEach((variable) => console.error(`  - ${variable}`))
      }

      if (invalid.length > 0) {
        console.error('\nInvalid variables:')
        invalid.forEach((variable) => console.error(`  - ${variable}`))
      }

      console.error('\nPlease check your .env.local file\n')
    }
    throw error
  }
}

/** Validated environment variables. */
export const env = parseEnv()

/** Type for environment variables. */
export type Env = z.infer<typeof envSchema>

/** Check if running in production. */
export const isProduction = env.NODE_ENV === 'production'

/** Check if running in development. */
export const isDevelopment = env.NODE_ENV === 'development'

/** Check if running in test environment. */
export const isTest = env.NODE_ENV === 'test'
