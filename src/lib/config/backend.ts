/**
 * Backend Configuration for HomeWiz
 */

// Check if backend URLs are configured
const backendWsUrl = process.env.NEXT_PUBLIC_BACKEND_WS_URL
const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL

export const backendConfig = {
  // WebSocket endpoints - Connect to backend for LLM processing
  websocket: {
    chat: backendWsUrl || 'ws://localhost:8002/ws/chat',
  },

  // HTTP endpoints - Backend API for LLM and other services
  http: {
    base: backendApiUrl || 'http://localhost:8002',
    chat: backendApiUrl ? `${backendApiUrl}/api` : 'http://localhost:8002/api',
    // Specific endpoints for different services
    query: backendApiUrl ? `${backendApiUrl}/query` : 'http://localhost:8002/query',
    queryWeb: backendApiUrl ? `${backendApiUrl}/query/web` : 'http://localhost:8002/query/web',
    leads: backendApiUrl ? `${backendApiUrl}/leads` : 'http://localhost:8002/leads',
    buildings: backendApiUrl ? `${backendApiUrl}/buildings` : 'http://localhost:8002/buildings',
    rooms: backendApiUrl ? `${backendApiUrl}/rooms` : 'http://localhost:8002/rooms',
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