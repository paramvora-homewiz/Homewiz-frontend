/**
 * API Client - Unified Client Proxy
 * 
 * This file now serves as a proxy to the unified API client for backward compatibility.
 * All functionality has been consolidated into api-client.ts for better maintainability.
 * 
 * @deprecated Use api-client.ts for new development
 */

// Re-export everything from the unified API client for backward compatibility
export * from './api-client'

// Legacy class name mapping for backward compatibility
export { apiClient as ApiClient } from './api-client'

// Migration notice
console.warn(
  'Notice: lib/api.ts has been migrated to lib/api-client.ts. Please update your imports for better performance and maintainability.'
)