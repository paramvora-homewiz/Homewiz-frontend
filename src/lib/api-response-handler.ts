/**
 * API Response Handler for HomeWiz Frontend
 * 
 * This module provides comprehensive API response handling, error management,
 * and data consistency utilities for all API interactions.
 */

import { ApiResponse } from '@/types'
import { DataValidator, DataTransformer, DataCache } from './data-manager'
import config from './config'

// Response status types
export type ResponseStatus = 'success' | 'error' | 'loading' | 'idle'

// Enhanced API response interface
export interface EnhancedApiResponse<T = any> extends ApiResponse<T> {
  status: ResponseStatus
  timestamp: number
  cached?: boolean
  retryCount?: number
  requestId?: string
}

// Error types
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN'
}

// Enhanced error interface
export interface ApiErrorDetails {
  type: ErrorType
  code?: string
  message: string
  details?: any
  timestamp: number
  requestId?: string
  retryable: boolean
}

export class ApiResponseHandler {
  private static requestCounter = 0

  /**
   * Generate unique request ID
   */
  private static generateRequestId(): string {
    return `req_${Date.now()}_${++this.requestCounter}`
  }

  /**
   * Determine error type from status code and message
   */
  private static determineErrorType(status: number, message: string): ErrorType {
    if (status === 0 || message.includes('network') || message.includes('fetch')) {
      return ErrorType.NETWORK
    }
    if (status === 401) return ErrorType.AUTHENTICATION
    if (status === 403) return ErrorType.AUTHORIZATION
    if (status === 404) return ErrorType.NOT_FOUND
    if (status === 408 || message.includes('timeout')) return ErrorType.TIMEOUT
    if (status === 422 || message.includes('validation')) return ErrorType.VALIDATION
    if (status >= 500) return ErrorType.SERVER
    return ErrorType.UNKNOWN
  }

  /**
   * Check if error is retryable
   */
  private static isRetryable(errorType: ErrorType, status: number): boolean {
    const retryableTypes = [ErrorType.NETWORK, ErrorType.SERVER, ErrorType.TIMEOUT]
    const retryableStatuses = [408, 429, 500, 502, 503, 504]
    
    return retryableTypes.includes(errorType) || retryableStatuses.includes(status)
  }

  /**
   * Handle successful API response
   */
  static handleSuccess<T>(
    data: T,
    options: {
      validate?: boolean
      transform?: boolean
      cache?: boolean
      cacheKey?: string
      cacheTtl?: number
    } = {}
  ): EnhancedApiResponse<T> {
    const requestId = this.generateRequestId()
    let processedData = data

    try {
      // Transform data if requested
      if (options.transform) {
        processedData = DataTransformer.transformApiResponse(data)
      }

      // Cache data if requested
      if (options.cache && options.cacheKey) {
        DataCache.set(
          options.cacheKey, 
          processedData, 
          options.cacheTtl || config.performance.cacheTtl
        )
      }

      return {
        success: true,
        data: processedData,
        status: 'success',
        timestamp: Date.now(),
        requestId,
        cached: false
      }
    } catch (error) {
      console.error('Error processing successful response:', error)
      return {
        success: false,
        error: 'Failed to process response data',
        status: 'error',
        timestamp: Date.now(),
        requestId
      }
    }
  }

  /**
   * Handle API error response
   */
  static handleError(
    error: any,
    options: {
      retryCount?: number
      originalRequest?: any
    } = {}
  ): EnhancedApiResponse<null> {
    const requestId = this.generateRequestId()
    let status = 0
    let message = 'Unknown error occurred'
    let details: any = null

    // Extract error information
    if (error.response) {
      // HTTP error response
      status = error.response.status
      message = error.response.data?.message || error.response.data?.error || error.message
      details = error.response.data
    } else if (error.request) {
      // Network error
      message = 'Network error - please check your connection'
      status = 0
    } else {
      // Other error
      message = error.message || 'An unexpected error occurred'
    }

    const errorType = this.determineErrorType(status, message)
    const retryable = this.isRetryable(errorType, status)

    const errorDetails: ApiErrorDetails = {
      type: errorType,
      code: details?.code,
      message,
      details,
      timestamp: Date.now(),
      requestId,
      retryable
    }

    // Log error for monitoring
    this.logError(errorDetails, options)

    return {
      success: false,
      error: message,
      status: 'error',
      timestamp: Date.now(),
      requestId,
      retryCount: options.retryCount || 0
    }
  }

  /**
   * Handle cached response
   */
  static handleCached<T>(data: T, cacheKey: string): EnhancedApiResponse<T> {
    return {
      success: true,
      data,
      status: 'success',
      timestamp: Date.now(),
      cached: true,
      requestId: `cached_${cacheKey}`
    }
  }

  /**
   * Handle loading state
   */
  static handleLoading(): EnhancedApiResponse<null> {
    return {
      success: false,
      status: 'loading',
      timestamp: Date.now(),
      requestId: this.generateRequestId()
    }
  }

  /**
   * Log error for monitoring and debugging
   */
  private static logError(error: ApiErrorDetails, options: any): void {
    const logLevel = error.type === ErrorType.SERVER ? 'error' : 'warn'
    
    console[logLevel]('API Error:', {
      type: error.type,
      message: error.message,
      status: error.details?.status,
      requestId: error.requestId,
      retryCount: options.retryCount,
      timestamp: new Date(error.timestamp).toISOString()
    })

    // Send to monitoring service in production
    if (config.isProduction && config.security.enableErrorReporting) {
      this.sendToMonitoring(error, options)
    }
  }

  /**
   * Send error to monitoring service
   */
  private static sendToMonitoring(error: ApiErrorDetails, options: any): void {
    try {
      // This would integrate with services like Sentry, LogRocket, etc.
      if (config.monitoring.sentryDsn) {
        // Example Sentry integration
        console.log('Would send to Sentry:', error)
      }
    } catch (monitoringError) {
      console.error('Failed to send error to monitoring:', monitoringError)
    }
  }

  /**
   * Validate response data
   */
  static validateResponse<T>(
    data: any,
    validator: (data: any) => { success: boolean; data?: T; errors?: string[] }
  ): { valid: boolean; data?: T; errors?: string[] } {
    try {
      const result = validator(data)
      return {
        valid: result.success,
        data: result.data,
        errors: result.errors
      }
    } catch (error) {
      return {
        valid: false,
        errors: ['Validation failed due to unexpected error']
      }
    }
  }

  /**
   * Create a standardized API response wrapper
   */
  static createResponse<T>(
    success: boolean,
    data?: T,
    error?: string,
    message?: string
  ): ApiResponse<T> {
    return {
      success,
      data,
      error,
      message
    }
  }

  /**
   * Retry failed request with exponential backoff
   */
  static async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<EnhancedApiResponse<T | null>> {
    let lastError: any
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await requestFn()
        return this.handleSuccess(result)
      } catch (error) {
        lastError = error
        
        // Don't retry on last attempt or non-retryable errors
        if (attempt === maxRetries) break
        
        const errorType = this.determineErrorType(
          (error as any).response?.status || 0,
          (error as any).message || ''
        )

        if (!this.isRetryable(errorType, (error as any).response?.status || 0)) {
          break
        }
        
        // Wait before retry with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    return this.handleError(lastError, { retryCount: maxRetries })
  }
}

// Utility functions for common response patterns
export const createSuccessResponse = <T>(data: T, message?: string): ApiResponse<T> => ({
  success: true,
  data,
  message
})

export const createErrorResponse = (error: string): ApiResponse<null> => ({
  success: false,
  error
})

export const createLoadingResponse = (): EnhancedApiResponse<null> => ({
  success: false,
  status: 'loading',
  timestamp: Date.now()
})

// Export the handler as default
export default ApiResponseHandler
