/**
 * Supabase Client Configuration for HomeWiz
 * 
 * This module provides a comprehensive Supabase client with:
 * - Connection management and retry logic
 * - Error handling and edge case management
 * - Type safety and validation
 * - Offline support and caching
 * - Real-time subscriptions
 */

import { createClient, SupabaseClient, AuthError, PostgrestError } from '@supabase/supabase-js'
import { Database } from './types'

// Environment variables with validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if Supabase is disabled for development or using dummy credentials
// Allow localhost URLs for local development
const isSupabaseDisabled = !supabaseUrl ||
  supabaseUrl === 'disabled_for_development' ||
  supabaseUrl.includes('dummy.supabase.co') ||
  !supabaseAnonKey ||
  supabaseAnonKey === 'disabled_for_development' ||
  supabaseAnonKey === 'dummy_key' ||
  supabaseAnonKey.startsWith('dummy')

// Validate required environment variables only if not disabled
if (!isSupabaseDisabled) {
  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

  if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  }

  // Validate URL format
  try {
    new URL(supabaseUrl)
  } catch {
    throw new Error('Invalid NEXT_PUBLIC_SUPABASE_URL format')
  }
} else {
  console.log('🔧 Supabase validation skipped - using dummy credentials or disabled for development')
  console.log(`   URL: ${supabaseUrl}`)
  console.log(`   Key: ${supabaseAnonKey ? supabaseAnonKey.substring(0, 10) + '...' : 'undefined'}`)
}

// Connection status enum
export enum ConnectionStatus {
  CONNECTED = 'connected',
  CONNECTING = 'connecting',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
  OFFLINE = 'offline'
}

// Error types for better error handling
export interface SupabaseError {
  type: 'auth' | 'database' | 'network' | 'validation' | 'unknown'
  message: string
  code?: string
  details?: any
  timestamp: Date
}

// Client configuration options
interface SupabaseClientConfig {
  retryAttempts?: number
  retryDelay?: number
  timeout?: number
  enableRealtime?: boolean
  enableOfflineSupport?: boolean
}

// Default configuration
const defaultConfig: Required<SupabaseClientConfig> = {
  retryAttempts: 3,
  retryDelay: 1000,
  timeout: 30000,
  enableRealtime: true,
  enableOfflineSupport: true
}

/**
 * Enhanced Supabase Client with comprehensive error handling
 */
class EnhancedSupabaseClient {
  public client: SupabaseClient<Database>
  private config: Required<SupabaseClientConfig>
  private connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED
  private retryCount: number = 0
  private offlineQueue: Array<() => Promise<any>> = []
  private isOnline: boolean = true

  constructor(config: SupabaseClientConfig = {}) {
    this.config = { ...defaultConfig, ...config }

    // Only create Supabase client if not disabled
    if (!isSupabaseDisabled) {
      // Create Supabase client with enhanced configuration
      this.client = createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          flowType: 'pkce'
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        },
        global: {
          headers: {
            'X-Client-Info': 'homewiz-frontend'
          }
        }
      })

      this.initializeClient()
      this.setupNetworkMonitoring()
    } else {
      console.log('🔧 Supabase client disabled - storage features unavailable')
      this.connectionStatus = ConnectionStatus.DISCONNECTED
      // Create a mock client to prevent errors
      this.client = {} as SupabaseClient<Database>
    }
  }

  /**
   * Initialize client and setup event listeners
   */
  private async initializeClient(): Promise<void> {
    if (isSupabaseDisabled) {
      console.log('🔧 Supabase initialization skipped - using dummy credentials')
      return
    }

    console.log('🔄 Initializing Supabase connection...')

    try {
      this.connectionStatus = ConnectionStatus.CONNECTING

      // Test connection
      await this.testConnection()

      this.connectionStatus = ConnectionStatus.CONNECTED
      this.retryCount = 0
      console.log('✅ Supabase connection established successfully')

      // Process offline queue if any
      if (this.offlineQueue.length > 0) {
        await this.processOfflineQueue()
      }

    } catch (error) {
      this.connectionStatus = ConnectionStatus.ERROR
      this.handleConnectionError(error)
    }
  }

  /**
   * Test database connection
   */
  private async testConnection(): Promise<void> {
    if (isSupabaseDisabled) {
      return
    }

    try {
      const { error } = await this.client
        .from('buildings')
        .select('count')
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned", which is okay
        throw new Error(`Database connection test failed: ${error.message} (Code: ${error.code})`)
      }
    } catch (error: any) {
      // Re-throw with more context
      if (error.message?.includes('fetch')) {
        throw new Error('Network error: Unable to reach Supabase server. Check your internet connection and Supabase URL.')
      } else if (error.message?.includes('JWT') || error.message?.includes('auth')) {
        throw new Error('Authentication error: Invalid Supabase API key or permissions.')
      } else {
        throw new Error(`Connection test failed: ${error.message || 'Unknown error'}`)
      }
    }
  }

  /**
   * Setup network monitoring for offline support
   */
  private setupNetworkMonitoring(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true
        this.initializeClient()
      })

      window.addEventListener('offline', () => {
        this.isOnline = false
        this.connectionStatus = ConnectionStatus.OFFLINE
      })

      // Initial online status
      this.isOnline = navigator.onLine
    }
  }

  /**
   * Handle connection errors with retry logic
   */
  private async handleConnectionError(error: any): Promise<void> {
    // Create a more informative error message
    const errorMessage = error?.message || error?.toString() || 'Unknown connection error'
    const errorCode = error?.code || 'NO_CODE'
    
    console.error('Supabase connection error:', {
      message: errorMessage,
      code: errorCode,
      url: supabaseUrl,
      isDisabled: isSupabaseDisabled,
      originalError: error
    })
    
    // If using dummy credentials, don't retry - just log and set to disabled
    if (supabaseUrl?.includes('dummy') || supabaseAnonKey?.includes('dummy')) {
      console.warn('🔧 Supabase connection failed due to dummy credentials. Storage features disabled.')
      this.connectionStatus = ConnectionStatus.DISCONNECTED
      return
    }
    
    if (this.retryCount < this.config.retryAttempts) {
      this.retryCount++
      const delay = this.config.retryDelay * Math.pow(2, this.retryCount - 1) // Exponential backoff
      
      console.log(`Retrying Supabase connection in ${delay}ms (attempt ${this.retryCount}/${this.config.retryAttempts})`)
      
      setTimeout(() => {
        this.initializeClient()
      }, delay)
    } else {
      this.connectionStatus = ConnectionStatus.ERROR
      console.error('Max Supabase retry attempts reached. Connection failed permanently.')
    }
  }

  /**
   * Process queued operations when coming back online
   */
  private async processOfflineQueue(): Promise<void> {
    console.log(`Processing ${this.offlineQueue.length} queued operations`)
    
    const queue = [...this.offlineQueue]
    this.offlineQueue = []
    
    for (const operation of queue) {
      try {
        await operation()
      } catch (error) {
        console.error('Failed to process queued operation:', error)
        // Re-queue failed operations
        this.offlineQueue.push(operation)
      }
    }
  }

  /**
   * Execute operation with retry logic and offline support
   */
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string = 'database operation'
  ): Promise<T> {
    // If Supabase is disabled, throw a descriptive error
    if (isSupabaseDisabled) {
      throw new Error(`Supabase is disabled for development - cannot execute ${operationName}`)
    }

    // If offline and offline support is enabled, queue the operation
    if (!this.isOnline && this.config.enableOfflineSupport) {
      return new Promise((resolve, reject) => {
        this.offlineQueue.push(async () => {
          try {
            const result = await operation()
            resolve(result)
          } catch (error) {
            reject(error)
          }
        })
      })
    }

    let lastError: any

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error

        if (attempt === this.config.retryAttempts) {
          break
        }

        // Check if error is retryable
        if (this.isRetryableError(error)) {
          const delay = this.config.retryDelay * Math.pow(2, attempt - 1)
          console.warn(`${operationName} failed (attempt ${attempt}), retrying in ${delay}ms:`, error)
          await new Promise(resolve => setTimeout(resolve, delay))
        } else {
          break
        }
      }
    }

    throw this.createSupabaseError(lastError, operationName)
  }

  /**
   * Check if an error is retryable
   */
  private isRetryableError(error: any): boolean {
    // Network errors are retryable
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      return true
    }
    
    // Temporary server errors are retryable
    if (error.code === '503' || error.code === '502' || error.code === '504') {
      return true
    }
    
    // Rate limiting is retryable
    if (error.code === '429') {
      return true
    }
    
    return false
  }

  /**
   * Create standardized error object
   */
  private createSupabaseError(error: any, context: string): SupabaseError {
    let type: SupabaseError['type'] = 'unknown'
    
    if (error instanceof AuthError) {
      type = 'auth'
    } else if (error.code?.startsWith('PGRST')) {
      type = 'database'
    } else if (error.message?.includes('fetch') || error.message?.includes('network')) {
      type = 'network'
    }
    
    return {
      type,
      message: error.message || 'An unknown error occurred',
      code: error.code,
      details: { context, originalError: error },
      timestamp: new Date()
    }
  }

  /**
   * Get the underlying Supabase client
   */
  getClient(): SupabaseClient<Database> {
    if (isSupabaseDisabled) {
      throw new Error('Supabase client is disabled for development. Database operations are not available.')
    }
    return this.client
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus
  }

  /**
   * Get client statistics
   */
  getStats() {
    return {
      connectionStatus: this.connectionStatus,
      retryCount: this.retryCount,
      isOnline: this.isOnline,
      queuedOperations: this.offlineQueue.length,
      config: this.config
    }
  }

  /**
   * Manually reconnect
   */
  async reconnect(): Promise<void> {
    this.retryCount = 0
    await this.initializeClient()
  }
}

// Create singleton instance
export const supabaseClient = new EnhancedSupabaseClient()

// Export the underlying client for direct access when needed (with error handling)
export const supabase = isSupabaseDisabled ? null : supabaseClient.client

// Export helper to check if Supabase is available
export const isSupabaseAvailable = () => !isSupabaseDisabled && supabase !== null

// Export helper to get Supabase status information
export const getSupabaseStatus = () => ({
  isAvailable: isSupabaseAvailable(),
  isDisabled: isSupabaseDisabled,
  connectionStatus: supabaseClient.getConnectionStatus(),
  url: supabaseUrl,
  hasValidKey: !!(supabaseAnonKey && !supabaseAnonKey.includes('dummy')),
  isDummyCredentials: supabaseUrl?.includes('dummy') || supabaseAnonKey?.includes('dummy')
})

// Export types and utilities
export type { Database }
export { EnhancedSupabaseClient }
