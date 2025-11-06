/**
 * Backend Configuration for HomeWiz
 * Production-ready configuration with smart defaults
 */

// Environment detection
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'

// Production cloud backend URLs
const PRODUCTION_HTTP_URL = 'https://homewiz-backend-335786120771.us-west2.run.app'
const PRODUCTION_WS_URL = 'wss://homewiz-backend-335786120771.us-west2.run.app/ws/chat'

// Development URLs
const DEVELOPMENT_HTTP_URL = 'http://localhost:8000'
const DEVELOPMENT_WS_URL = 'ws://localhost:8000/ws/chat'

// Smart defaults based on environment
const getBackendHttpUrl = (): string => {
  if (process.env.NEXT_PUBLIC_BACKEND_API_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_API_URL
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  return isProduction ? PRODUCTION_HTTP_URL : DEVELOPMENT_HTTP_URL
}

const getBackendWsUrl = (): string => {
  if (process.env.NEXT_PUBLIC_BACKEND_WS_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_WS_URL
  }
  return isProduction ? PRODUCTION_WS_URL : DEVELOPMENT_WS_URL
}

const backendHttpUrl = getBackendHttpUrl()
const backendWsUrl = getBackendWsUrl()

export const backendConfig = {
  // WebSocket endpoints - Connect to backend for LLM processing
  websocket: {
    chat: backendWsUrl,
  },

  // HTTP endpoints - Backend API for LLM and other services
  http: {
    base: backendHttpUrl,
    chat: `${backendHttpUrl}/api`,
    // Specific endpoints for different services
    query: `${backendHttpUrl}/query`,
    queryWeb: `${backendHttpUrl}/query/web`,
    leads: `${backendHttpUrl}/leads`,
    buildings: `${backendHttpUrl}/buildings`,
    rooms: `${backendHttpUrl}/rooms`,
  },
  
  // Connection settings
  connection: {
    timeout: 30000,
    reconnectInterval: 5000,
    maxReconnectAttempts: 5,
  },
  
  // Feature flags
  features: {
    enableWebSocket: process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET !== 'false',
    enableStreaming: process.env.NEXT_PUBLIC_ENABLE_STREAMING !== 'false',
    enableReconnect: process.env.NEXT_PUBLIC_ENABLE_RECONNECT !== 'false',
    enableSupabaseDirect: process.env.NEXT_PUBLIC_ENABLE_SUPABASE_DIRECT === 'true', // Direct Supabase queries
  }
}

export default backendConfig