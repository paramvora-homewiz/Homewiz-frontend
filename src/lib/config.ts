/**
 * HomeWiz Frontend Configuration Management
 * 
 * This module provides comprehensive configuration management for the HomeWiz frontend
 * application with environment-specific settings, validation, and type safety.
 */

import { z } from 'zod'

/**
 * Production-Ready Environment Detection
 * Automatically determines the correct backend URL based on environment
 */
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'
const isDevelopment = process.env.NODE_ENV === 'development'

// Production cloud backend URL
const PRODUCTION_BACKEND_URL = 'https://homewiz-backend-335786120771.us-west2.run.app'
const DEVELOPMENT_BACKEND_URL = 'http://localhost:8000'

// Smart default: use cloud in production, localhost in development
const getDefaultApiUrl = (): string => {
  // 1. Check explicit environment variable
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }

  // 2. Check backend-specific environment variable
  if (process.env.NEXT_PUBLIC_BACKEND_API_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_API_URL
  }

  // 3. Smart default based on environment
  return isProduction ? PRODUCTION_BACKEND_URL : DEVELOPMENT_BACKEND_URL
}

// Environment validation schema
const envSchema = z.object({
  // Environment Configuration
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  VERCEL_ENV: z.enum(['development', 'preview', 'production']).optional(),

  // Backend API Configuration
  NEXT_PUBLIC_API_URL: z.string().optional(),
  NEXT_PUBLIC_BACKEND_API_URL: z.string().optional(),
  NEXT_PUBLIC_CLOUD_API_URL: z.string().url().optional(),
  NEXT_PUBLIC_API_TIMEOUT: z.string().transform(Number).default('30000'),
  NEXT_PUBLIC_DISABLE_BACKEND: z.string().transform(val => val === 'true').default('false'),
  NEXT_PUBLIC_PREFER_CLOUD: z.string().transform(val => val === 'true').default('false'),

  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  
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
    const parsed = envSchema.parse(process.env)
    return parsed
  } catch (error) {
    console.error('❌ Invalid environment configuration:', error)
    throw new Error('Environment configuration validation failed')
  }
}

// Validated environment variables
const env = parseEnv()

// Get the smart default API URL
const smartApiUrl = getDefaultApiUrl()

// Configuration object with typed values
export const config = {
  // Environment
  environment: env.NEXT_PUBLIC_APP_ENV,
  isDevelopment: isDevelopment,
  isStaging: env.NEXT_PUBLIC_APP_ENV === 'staging',
  isProduction: isProduction,

  // Application
  app: {
    name: env.NEXT_PUBLIC_APP_NAME,
    version: env.NEXT_PUBLIC_APP_VERSION,
    demoMode: env.NEXT_PUBLIC_DEMO_MODE,
  },

  // API Configuration
  api: {
    baseUrl: smartApiUrl,
    cloudUrl: env.NEXT_PUBLIC_CLOUD_API_URL || PRODUCTION_BACKEND_URL,
    timeout: env.NEXT_PUBLIC_API_TIMEOUT,
    // Auto-disable backend in production when Supabase is available
    disabled: env.NEXT_PUBLIC_DISABLE_BACKEND || (
      env.NEXT_PUBLIC_APP_ENV === 'production' &&
      env.NEXT_PUBLIC_SUPABASE_URL &&
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_url' &&
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your_supabase_anon_key'
    ),
    preferCloud: env.NEXT_PUBLIC_PREFER_CLOUD,
  },

  // Supabase Configuration
  supabase: {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

export const getActiveApiUrl = async (): Promise<string> => {
  // If backend is disabled, return empty string
  if (config.api.disabled) {
    return ''
  }
  
  // If no cloud URL is configured, use local
  if (!config.api.cloudUrl) {
    return config.api.baseUrl
  }
  
  // Helper function to create timeout signal
  const createTimeoutSignal = (timeoutMs: number) => {
    const controller = new AbortController()
    setTimeout(() => controller.abort(), timeoutMs)
    return controller.signal
  }

  // If prefer cloud is set, try cloud first
  if (config.api.preferCloud) {
    try {
      const cloudBaseUrl = config.api.cloudUrl.replace('/api', '')
      const response = await fetch(`${cloudBaseUrl}/`, {
        method: 'GET',
        mode: 'cors',
        signal: createTimeoutSignal(3000)
      })
      if (response.ok) {
        return config.api.cloudUrl
      }
    } catch (error) {
      console.log('☁️ Cloud backend not available, falling back to local')
    }

    // Fall back to local
    return config.api.baseUrl
  }

  // Default behavior: try local first, then cloud
  try {
    const localBaseUrl = config.api.baseUrl.replace('/api', '')
    const response = await fetch(`${localBaseUrl}/`, {
      method: 'GET',
      mode: 'cors',
      signal: createTimeoutSignal(3000)
    })
    if (response.ok) {
      return config.api.baseUrl
    }
  } catch (error) {
    console.log('🏠 Local backend not available, trying cloud...')
  }

  // Try cloud as fallback
  if (config.api.cloudUrl) {
    try {
      const cloudBaseUrl = config.api.cloudUrl.replace('/api', '')
      const response = await fetch(`${cloudBaseUrl}/`, {
        method: 'GET',
        mode: 'cors',
        signal: createTimeoutSignal(3000)
      })
      if (response.ok) {
        return config.api.cloudUrl
      }
    } catch (error) {
      console.log('☁️ Cloud backend also not available')
    }
  }
  
  // No backend available, return local as fallback
  return config.api.baseUrl
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
  console.log(`📦 Environment: ${config.environment}`)
  console.log(`🏭 NODE_ENV: ${process.env.NODE_ENV}`)
  console.log(`☁️  VERCEL_ENV: ${process.env.VERCEL_ENV || 'not set'}`)
  console.log(`🎯 Demo Mode: ${config.app.demoMode}`)
  console.log(`🌐 API URL (Smart Default): ${config.api.baseUrl}`)
  console.log(`🔌 Backend Disabled: ${config.api.disabled}`)
  console.log(`💾 Supabase URL: ${config.supabase.url ? 'configured' : 'not configured'}`)
  console.log(`🔐 Clerk Configured: ${validateClerkConfig()}`)

  if (!validateApiConfig()) {
    console.warn('⚠️ Invalid API URL configuration')
  }

  if (!config.app.demoMode && !validateClerkConfig()) {
    console.warn('⚠️ Clerk authentication not properly configured')
  }
}

// Client-side configuration logging
if (typeof window !== 'undefined') {
  console.log('🌐 HomeWiz Client Configuration')
  console.log(`API Base URL: ${config.api.baseUrl}`)
  console.log(`Environment: ${config.environment}`)
}

export default config
