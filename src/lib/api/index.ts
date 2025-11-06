/**
 * Backend API Service Layer
 *
 * This replaces Supabase direct database access with backend API calls.
 * All services use the existing ApiClient for error handling, retry logic, and caching.
 */

export { buildingsApi } from './buildings-api'
export { roomsApi } from './rooms-api'
export { tenantsApi } from './tenants-api'
export { operatorsApi } from './operators-api'
export { leadsApi } from './leads-api'
export { storageApi } from './storage-api'
export { realtimePolling } from './realtime-polling'

// Re-export types
export type * from './types'
