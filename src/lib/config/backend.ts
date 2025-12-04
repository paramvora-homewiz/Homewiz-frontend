/**
 * Backend Configuration for HomeWiz
 *
 * Production deployment requires NEXT_PUBLIC_BACKEND_API_URL and
 * NEXT_PUBLIC_BACKEND_WS_URL to be set in environment variables.
 */

// Detect if running in production (Vercel sets this)
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'

// Check if backend URLs are configured
const backendWsUrl = process.env.NEXT_PUBLIC_BACKEND_WS_URL
const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL

// Warn in production if URLs are not configured
if (isProduction && typeof window === 'undefined') {
  if (!backendApiUrl) {
    console.warn('⚠️ NEXT_PUBLIC_BACKEND_API_URL not set in production')
  }
  if (!backendWsUrl) {
    console.warn('⚠️ NEXT_PUBLIC_BACKEND_WS_URL not set in production')
  }
}

// Get safe default URLs (empty in production if not configured)
const getHttpBase = () => {
  if (backendApiUrl) return backendApiUrl
  if (isProduction) return '' // Don't use localhost in production
  return 'http://localhost:8002'
}

const getWsUrl = () => {
  if (backendWsUrl) return backendWsUrl
  if (isProduction) return '' // Don't use localhost in production
  return 'ws://localhost:8002/ws/chat'
}

const httpBase = getHttpBase()

export const backendConfig = {
  // WebSocket endpoints - Connect to backend for LLM processing
  websocket: {
    chat: getWsUrl(),
  },

  // HTTP endpoints - Backend API for LLM and other services
  http: {
    base: httpBase,
    chat: httpBase ? `${httpBase}/api` : '',
    // Specific endpoints for different services
    query: httpBase ? `${httpBase}/query` : '',
    queryWeb: httpBase ? `${httpBase}/query/web` : '',
    leads: httpBase ? `${httpBase}/leads` : '',
    buildings: httpBase ? `${httpBase}/buildings` : '',
    rooms: httpBase ? `${httpBase}/rooms` : '',
  },

  // Flag to check if backend is configured
  isConfigured: !!httpBase,
  
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