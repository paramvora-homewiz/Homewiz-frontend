/**
 * Legacy API Client - Compatibility Layer
 * 
 * This file provides backward compatibility for the old lib/api.ts implementation.
 * All functionality has been migrated to the unified API client in lib/api-client.ts
 * 
 * @deprecated Use lib/api-client.ts instead
 */

// Re-export everything from the unified API client
export * from './api-client'

// Legacy exports for backward compatibility
export { ApiError } from './api-client'
export { apiClient as ApiClient } from './api-client'

console.warn(
  'Warning: You are using the legacy API client from lib/api.ts. Please migrate to lib/api-client.ts'
)