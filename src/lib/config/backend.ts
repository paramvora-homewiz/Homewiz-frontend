/**
 * Backend Configuration for HomeWiz
 */

// Check if backend URLs are configured
const backendWsUrl = process.env.NEXT_PUBLIC_BACKEND_WS_URL
const backendApiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL

export const backendConfig = {
  // WebSocket endpoints - Connect to backend for LLM processing
  websocket: {
    chat: backendWsUrl || 'ws://localhost:8000/ws/chat',
  },
  
  // HTTP endpoints - Backend API for LLM and other services
  http: {
    base: process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000',
    chat: process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000/api',
    // Specific endpoints for different services
    query: process.env.NEXT_PUBLIC_BACKEND_API_URL ? `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/query` : 'http://localhost:8000/query',
    queryWeb: process.env.NEXT_PUBLIC_BACKEND_API_URL ? `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/query/web` : 'http://localhost:8000/query/web',
    leads: process.env.NEXT_PUBLIC_BACKEND_API_URL ? `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/leads` : 'http://localhost:8000/leads',
    buildings: process.env.NEXT_PUBLIC_BACKEND_API_URL ? `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/buildings` : 'http://localhost:8000/buildings',
    rooms: process.env.NEXT_PUBLIC_BACKEND_API_URL ? `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/rooms` : 'http://localhost:8000/rooms',
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