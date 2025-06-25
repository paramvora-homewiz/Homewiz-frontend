/**
 * HomeWiz Frontend Configuration Management
 * 
 * This module provides comprehensive configuration management for the HomeWiz frontend
 * application with environment-specific settings, validation, and type safety.
 */

import { z } from 'zod'

// Environment validation schema
const envSchema = z.object({
  // Environment Configuration
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  
  // Backend API Configuration
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:8000/api'),
  NEXT_PUBLIC_API_TIMEOUT: z.string().transform(Number).default('30000'),
  
  // Clerk Authentication Configuration
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),
  CLERK_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default('/sign-in'),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default('/sign-up'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().default('/forms'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().default('/forms'),
  
  // Application Configuration
  NEXT_PUBLIC_APP_NAME: z.string().default('HomeWiz'),
  NEXT_PUBLIC_APP_VERSION: z.string().default('1.0.0'),
  NEXT_PUBLIC_DEMO_MODE: z.string().transform(val => val === 'true').default('false'),
  
  // Security Configuration
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_ENABLE_ERROR_REPORTING: z.string().transform(val => val === 'true').default('true'),
  
  // File Upload Configuration
  NEXT_PUBLIC_MAX_FILE_SIZE: z.string().transform(Number).default('10485760'),
  NEXT_PUBLIC_ALLOWED_FILE_TYPES: z.string().default('pdf,jpg,jpeg,png,doc,docx'),
  
  // Feature Flags
  NEXT_PUBLIC_ENABLE_REAL_TIME_COLLABORATION: z.string().transform(val => val === 'true').default('true'),
  NEXT_PUBLIC_ENABLE_AUTO_SAVE: z.string().transform(val => val === 'true').default('true'),
  NEXT_PUBLIC_ENABLE_SMART_VALIDATION: z.string().transform(val => val === 'true').default('true'),
  
  // Monitoring and Logging
  NEXT_PUBLIC_LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  
  // Rate Limiting
  NEXT_PUBLIC_RATE_LIMIT_REQUESTS: z.string().transform(Number).default('100'),
  NEXT_PUBLIC_RATE_LIMIT_WINDOW: z.string().transform(Number).default('900000'),
  
  // Session Configuration
  SESSION_SECRET: z.string().optional(),
  SESSION_TIMEOUT: z.string().transform(Number).default('86400000'),
  
  // Performance Configuration
  NEXT_PUBLIC_ENABLE_COMPRESSION: z.string().transform(val => val === 'true').default('true'),
  NEXT_PUBLIC_CACHE_TTL: z.string().transform(Number).default('3600'),
})

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    console.error('❌ Invalid environment configuration:', error)
    throw new Error('Environment configuration validation failed')
  }
}

// Validated environment variables
const env = parseEnv()

// Configuration object with typed values
export const config = {
  // Environment
  environment: env.NEXT_PUBLIC_APP_ENV,
  isDevelopment: env.NEXT_PUBLIC_APP_ENV === 'development',
  isStaging: env.NEXT_PUBLIC_APP_ENV === 'staging',
  isProduction: env.NEXT_PUBLIC_APP_ENV === 'production',
  
  // Application
  app: {
    name: env.NEXT_PUBLIC_APP_NAME,
    version: env.NEXT_PUBLIC_APP_VERSION,
    demoMode: env.NEXT_PUBLIC_DEMO_MODE,
  },
  
  // API Configuration
  api: {
    baseUrl: env.NEXT_PUBLIC_API_URL,
    timeout: env.NEXT_PUBLIC_API_TIMEOUT,
  },
  
  // Authentication
  auth: {
    clerk: {
      publishableKey: env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      secretKey: env.CLERK_SECRET_KEY,
      signInUrl: env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
      signUpUrl: env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
      afterSignInUrl: env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL,
      afterSignUpUrl: env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL,
    },
    session: {
      secret: env.SESSION_SECRET,
      timeout: env.SESSION_TIMEOUT,
    },
  },
  
  // Security
  security: {
    enableAnalytics: env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    enableErrorReporting: env.NEXT_PUBLIC_ENABLE_ERROR_REPORTING,
  },
  
  // File Upload
  fileUpload: {
    maxSize: env.NEXT_PUBLIC_MAX_FILE_SIZE,
    allowedTypes: env.NEXT_PUBLIC_ALLOWED_FILE_TYPES.split(',').map(type => type.trim()),
  },
  
  // Feature Flags
  features: {
    realTimeCollaboration: env.NEXT_PUBLIC_ENABLE_REAL_TIME_COLLABORATION,
    autoSave: env.NEXT_PUBLIC_ENABLE_AUTO_SAVE,
    smartValidation: env.NEXT_PUBLIC_ENABLE_SMART_VALIDATION,
  },
  
  // Monitoring
  monitoring: {
    logLevel: env.NEXT_PUBLIC_LOG_LEVEL,
    sentryDsn: env.NEXT_PUBLIC_SENTRY_DSN,
  },
  
  // Rate Limiting
  rateLimit: {
    requests: env.NEXT_PUBLIC_RATE_LIMIT_REQUESTS,
    window: env.NEXT_PUBLIC_RATE_LIMIT_WINDOW,
  },
  
  // Performance
  performance: {
    enableCompression: env.NEXT_PUBLIC_ENABLE_COMPRESSION,
    cacheTtl: env.NEXT_PUBLIC_CACHE_TTL,
  },
} as const

// Type for the configuration object
export type Config = typeof config

// Utility functions
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = config.api.baseUrl.replace(/\/$/, '')
  const cleanEndpoint = endpoint.replace(/^\//, '')
  return `${baseUrl}/${cleanEndpoint}`
}

export const isFeatureEnabled = (feature: keyof typeof config.features): boolean => {
  return config.features[feature]
}

export const getFileUploadConfig = () => ({
  maxSize: config.fileUpload.maxSize,
  allowedTypes: config.fileUpload.allowedTypes,
  accept: config.fileUpload.allowedTypes.map(type => `.${type}`).join(','),
})

// Validation helpers
export const validateClerkConfig = (): boolean => {
  if (config.app.demoMode) return true
  
  return !!(
    config.auth.clerk.publishableKey &&
    config.auth.clerk.secretKey
  )
}

export const validateApiConfig = (): boolean => {
  try {
    new URL(config.api.baseUrl)
    return true
  } catch {
    return false
  }
}

// Configuration validation on module load
if (typeof window === 'undefined') {
  // Server-side validation
  console.log('🔧 HomeWiz Frontend Configuration Loaded')
  console.log(`Environment: ${config.environment}`)
  console.log(`Demo Mode: ${config.app.demoMode}`)
  console.log(`API URL: ${config.api.baseUrl}`)
  console.log(`Clerk Configured: ${validateClerkConfig()}`)

  if (!validateApiConfig()) {
    console.warn('⚠️ Invalid API URL configuration')
  }

  if (!config.app.demoMode && !validateClerkConfig()) {
    console.warn('⚠️ Clerk authentication not properly configured')
  }
}

export default config
