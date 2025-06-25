/**
 * Error Recovery Mechanisms
 * 
 * This module provides retry logic, offline handling, and recovery options
 * for failed operations with clear user guidance.
 */

import ErrorHandler, { ErrorType, showWarningMessage, showInfoMessage } from './error-handler'

export interface RetryConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
  retryableErrors: ErrorType[]
}

export interface OfflineConfig {
  enableOfflineMode: boolean
  offlineStorageKey: string
  syncOnReconnect: boolean
}

export interface RecoveryOptions {
  retry?: boolean
  offline?: boolean
  fallback?: () => Promise<any>
  userGuidance?: string
}

export class ErrorRecovery {
  private static defaultRetryConfig: RetryConfig = {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    retryableErrors: [
      ErrorType.NETWORK,
      ErrorType.API,
      ErrorType.FILE_UPLOAD
    ]
  }

  private static defaultOfflineConfig: OfflineConfig = {
    enableOfflineMode: true,
    offlineStorageKey: 'homewiz_offline_data',
    syncOnReconnect: true
  }

  private static isOnline = navigator?.onLine ?? true
  private static offlineQueue: Array<{
    id: string
    operation: () => Promise<any>
    data: any
    timestamp: number
  }> = []

  /**
   * Initialize error recovery system
   */
  static initialize() {
    // Monitor online/offline status
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this))
      window.addEventListener('offline', this.handleOffline.bind(this))
      this.isOnline = navigator.onLine
    }

    // Load offline queue from storage
    this.loadOfflineQueue()
  }

  /**
   * Execute operation with retry logic
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {},
    context?: any
  ): Promise<T> {
    const retryConfig = { ...this.defaultRetryConfig, ...config }
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
      try {
        const result = await operation()
        
        // If we succeeded after retries, show success message
        if (attempt > 1) {
          showInfoMessage(
            'Operation Successful',
            `Succeeded after ${attempt} attempts.`
          )
        }
        
        return result
      } catch (error) {
        lastError = error as Error
        const errorDetails = ErrorHandler.handleError(error, context)

        // Check if error is retryable
        if (!retryConfig.retryableErrors.includes(errorDetails.type)) {
          throw error
        }

        // If this was the last attempt, throw the error
        if (attempt === retryConfig.maxAttempts) {
          throw error
        }

        // Calculate delay for next attempt
        const delay = Math.min(
          retryConfig.baseDelay * Math.pow(retryConfig.backoffMultiplier, attempt - 1),
          retryConfig.maxDelay
        )

        // Show retry message
        showWarningMessage(
          `Attempt ${attempt} Failed`,
          `Retrying in ${Math.round(delay / 1000)} seconds... (${retryConfig.maxAttempts - attempt} attempts remaining)`,
          { duration: delay }
        )

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError
  }

  /**
   * Handle offline operations
   */
  static async withOfflineSupport<T>(
    operation: () => Promise<T>,
    data: any,
    options: {
      operationId?: string
      description?: string
      priority?: 'low' | 'medium' | 'high'
    } = {}
  ): Promise<T> {
    if (this.isOnline) {
      try {
        return await operation()
      } catch (error) {
        // If online but operation failed, check if we should queue for later
        const errorDetails = ErrorHandler.handleError(error)
        
        if (errorDetails.type === ErrorType.NETWORK) {
          return this.queueForOffline(operation, data, options)
        }
        
        throw error
      }
    } else {
      return this.queueForOffline(operation, data, options)
    }
  }

  /**
   * Queue operation for when back online
   */
  private static async queueForOffline<T>(
    operation: () => Promise<T>,
    data: any,
    options: {
      operationId?: string
      description?: string
      priority?: 'low' | 'medium' | 'high'
    }
  ): Promise<T> {
    const queueItem = {
      id: options.operationId || `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      operation,
      data,
      timestamp: Date.now(),
      ...options
    }

    this.offlineQueue.push(queueItem)
    this.saveOfflineQueue()

    showWarningMessage(
      'Offline Mode',
      `${options.description || 'Operation'} queued for when connection is restored.`,
      {
        duration: 5000,
        action: {
          label: 'View Queue',
          onClick: () => this.showOfflineQueue()
        }
      }
    )

    // Return a promise that resolves when the operation is eventually executed
    return new Promise((resolve, reject) => {
      // Store resolve/reject for later use
      (queueItem as any).resolve = resolve
      ;(queueItem as any).reject = reject
    })
  }

  /**
   * Handle coming back online
   */
  private static async handleOnline() {
    this.isOnline = true
    
    showInfoMessage(
      'Connection Restored',
      `Processing ${this.offlineQueue.length} queued operations...`
    )

    // Process offline queue
    await this.processOfflineQueue()
  }

  /**
   * Handle going offline
   */
  private static handleOffline() {
    this.isOnline = false
    
    showWarningMessage(
      'Connection Lost',
      'You are now offline. Operations will be queued until connection is restored.',
      { duration: 8000 }
    )
  }

  /**
   * Process queued offline operations
   */
  private static async processOfflineQueue() {
    const queue = [...this.offlineQueue]
    this.offlineQueue = []

    let successCount = 0
    let failureCount = 0

    for (const item of queue) {
      try {
        const result = await item.operation()
        
        // Resolve the original promise if it exists
        if ((item as any).resolve) {
          (item as any).resolve(result)
        }
        
        successCount++
      } catch (error) {
        // Reject the original promise if it exists
        if ((item as any).reject) {
          (item as any).reject(error)
        }
        
        failureCount++
        
        // Re-queue if it's a retryable error
        const errorDetails = ErrorHandler.handleError(error)
        if (this.defaultRetryConfig.retryableErrors.includes(errorDetails.type)) {
          this.offlineQueue.push(item)
        }
      }
    }

    this.saveOfflineQueue()

    // Show summary
    if (successCount > 0) {
      showInfoMessage(
        'Sync Complete',
        `${successCount} operations completed successfully.${failureCount > 0 ? ` ${failureCount} failed and will be retried.` : ''}`
      )
    }
  }

  /**
   * Save offline queue to storage
   */
  private static saveOfflineQueue() {
    if (typeof window !== 'undefined') {
      try {
        const queueData = this.offlineQueue.map(item => ({
          id: item.id,
          data: item.data,
          timestamp: item.timestamp
        }))
        localStorage.setItem(this.defaultOfflineConfig.offlineStorageKey, JSON.stringify(queueData))
      } catch (error) {
        console.warn('Failed to save offline queue:', error)
      }
    }
  }

  /**
   * Load offline queue from storage
   */
  private static loadOfflineQueue() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.defaultOfflineConfig.offlineStorageKey)
        if (stored) {
          const queueData = JSON.parse(stored)
          // Note: We can't restore the operation functions, so this is mainly for data persistence
          console.log('Loaded offline queue data:', queueData)
        }
      } catch (error) {
        console.warn('Failed to load offline queue:', error)
      }
    }
  }

  /**
   * Show offline queue status
   */
  private static showOfflineQueue() {
    const queueInfo = this.offlineQueue.map(item => ({
      id: item.id,
      timestamp: new Date(item.timestamp).toLocaleString(),
      data: item.data
    }))

    console.log('Offline Queue:', queueInfo)
    
    showInfoMessage(
      'Offline Queue',
      `${this.offlineQueue.length} operations queued. Check console for details.`,
      {
        action: {
          label: 'Clear Queue',
          onClick: () => this.clearOfflineQueue()
        }
      }
    )
  }

  /**
   * Clear offline queue
   */
  private static clearOfflineQueue() {
    this.offlineQueue = []
    this.saveOfflineQueue()
    showInfoMessage('Queue Cleared', 'All queued operations have been removed.')
  }

  /**
   * Get recovery suggestions for an error
   */
  static getRecoverySuggestions(error: any): string[] {
    const errorDetails = ErrorHandler.handleError(error)
    
    const suggestions: string[] = []
    
    switch (errorDetails.type) {
      case ErrorType.NETWORK:
        suggestions.push(
          'Check your internet connection',
          'Try again in a few moments',
          'Switch to a different network if available'
        )
        break
        
      case ErrorType.API:
        suggestions.push(
          'Wait a moment and try again',
          'Check if the service is under maintenance',
          'Contact support if the issue persists'
        )
        break
        
      case ErrorType.VALIDATION:
        suggestions.push(
          'Review the highlighted fields',
          'Check the format requirements',
          'Ensure all required fields are filled'
        )
        break
        
      case ErrorType.FILE_UPLOAD:
        suggestions.push(
          'Check file size and format',
          'Try uploading a different file',
          'Ensure stable internet connection'
        )
        break
        
      default:
        suggestions.push(
          'Refresh the page and try again',
          'Clear browser cache if issues persist',
          'Contact support with error details'
        )
    }
    
    return suggestions
  }

  /**
   * Check if error is recoverable
   */
  static isRecoverable(error: any): boolean {
    const errorDetails = ErrorHandler.handleError(error)
    return this.defaultRetryConfig.retryableErrors.includes(errorDetails.type)
  }

  /**
   * Get current online status
   */
  static getOnlineStatus(): boolean {
    return this.isOnline
  }

  /**
   * Get offline queue length
   */
  static getOfflineQueueLength(): number {
    return this.offlineQueue.length
  }
}

// Initialize on module load
if (typeof window !== 'undefined') {
  ErrorRecovery.initialize()
}

export default ErrorRecovery
