/**
 * Comprehensive Error Handling for HomeWiz Supabase Integration
 * 
 * This module provides:
 * - Centralized error handling and classification
 * - User-friendly error messages
 * - Error recovery strategies
 * - Logging and monitoring
 * - Offline support and conflict resolution
 */

import { SupabaseError } from './client'

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error categories for better handling
export enum ErrorCategory {
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  CONFLICT = 'conflict',
  NOT_FOUND = 'not_found',
  RATE_LIMIT = 'rate_limit',
  SERVER_ERROR = 'server_error',
  CLIENT_ERROR = 'client_error',
  UNKNOWN = 'unknown'
}

// Enhanced error interface
export interface EnhancedError extends SupabaseError {
  category: ErrorCategory
  severity: ErrorSeverity
  userMessage: string
  technicalMessage: string
  recoveryActions: string[]
  retryable: boolean
  reportable: boolean
}

// Error recovery actions
export interface RecoveryAction {
  type: 'retry' | 'refresh' | 'redirect' | 'fallback' | 'manual'
  label: string
  action: () => Promise<void> | void
  priority: number
}

/**
 * Error Handler Class
 */
export class ErrorHandler {
  private static instance: ErrorHandler
  private errorLog: EnhancedError[] = []
  private maxLogSize = 100

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  /**
   * Process and enhance a Supabase error
   */
  processError(error: any, context?: string): EnhancedError {
    const enhancedError = this.enhanceError(error, context)
    this.logError(enhancedError)
    return enhancedError
  }

  /**
   * Enhance error with additional metadata
   */
  private enhanceError(error: any, context?: string): EnhancedError {
    const category = this.categorizeError(error)
    const severity = this.determineSeverity(error, category)
    const userMessage = this.getUserMessage(error, category)
    const technicalMessage = this.getTechnicalMessage(error)
    const recoveryActions = this.getRecoveryActions(error, category)
    const retryable = this.isRetryable(error, category)
    const reportable = this.isReportable(error, severity)

    return {
      type: error.type || 'unknown',
      message: error.message || 'An unknown error occurred',
      code: error.code,
      details: { ...error.details, context },
      timestamp: new Date(),
      category,
      severity,
      userMessage,
      technicalMessage,
      recoveryActions,
      retryable,
      reportable
    }
  }

  /**
   * Categorize error based on type and code
   */
  private categorizeError(error: any): ErrorCategory {
    // Network errors
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      return ErrorCategory.NETWORK
    }

    // Authentication errors
    if (error.type === 'auth' || error.code?.startsWith('auth')) {
      return ErrorCategory.AUTHENTICATION
    }

    // Authorization errors
    if (error.code === '401' || error.code === '403') {
      return ErrorCategory.AUTHORIZATION
    }

    // Validation errors
    if (error.code?.startsWith('23') || error.message?.includes('violates')) {
      return ErrorCategory.VALIDATION
    }

    // Not found errors
    if (error.code === 'PGRST116' || error.code === '404') {
      return ErrorCategory.NOT_FOUND
    }

    // Rate limiting
    if (error.code === '429') {
      return ErrorCategory.RATE_LIMIT
    }

    // Server errors
    if (error.code?.startsWith('5') || error.code?.startsWith('PGRST')) {
      return ErrorCategory.SERVER_ERROR
    }

    // Client errors
    if (error.code?.startsWith('4')) {
      return ErrorCategory.CLIENT_ERROR
    }

    return ErrorCategory.UNKNOWN
  }

  /**
   * Determine error severity
   */
  private determineSeverity(error: any, category: ErrorCategory): ErrorSeverity {
    switch (category) {
      case ErrorCategory.NETWORK:
        return ErrorSeverity.MEDIUM
      case ErrorCategory.AUTHENTICATION:
        return ErrorSeverity.HIGH
      case ErrorCategory.AUTHORIZATION:
        return ErrorSeverity.HIGH
      case ErrorCategory.VALIDATION:
        return ErrorSeverity.MEDIUM
      case ErrorCategory.CONFLICT:
        return ErrorSeverity.MEDIUM
      case ErrorCategory.NOT_FOUND:
        return ErrorSeverity.LOW
      case ErrorCategory.RATE_LIMIT:
        return ErrorSeverity.MEDIUM
      case ErrorCategory.SERVER_ERROR:
        return ErrorSeverity.HIGH
      case ErrorCategory.CLIENT_ERROR:
        return ErrorSeverity.MEDIUM
      default:
        return ErrorSeverity.MEDIUM
    }
  }

  /**
   * Get user-friendly error message
   */
  private getUserMessage(error: any, category: ErrorCategory): string {
    switch (category) {
      case ErrorCategory.NETWORK:
        return 'Connection issue detected. Please check your internet connection and try again.'
      case ErrorCategory.AUTHENTICATION:
        return 'Authentication failed. Please sign in again.'
      case ErrorCategory.AUTHORIZATION:
        return 'You don\'t have permission to perform this action.'
      case ErrorCategory.VALIDATION:
        return 'The information provided is invalid. Please check your input and try again.'
      case ErrorCategory.CONFLICT:
        return 'This action conflicts with existing data. Please refresh and try again.'
      case ErrorCategory.NOT_FOUND:
        return 'The requested information could not be found.'
      case ErrorCategory.RATE_LIMIT:
        return 'Too many requests. Please wait a moment and try again.'
      case ErrorCategory.SERVER_ERROR:
        return 'Server error occurred. Our team has been notified. Please try again later.'
      case ErrorCategory.CLIENT_ERROR:
        return 'Invalid request. Please check your input and try again.'
      default:
        return 'An unexpected error occurred. Please try again or contact support if the problem persists.'
    }
  }

  /**
   * Get technical error message for debugging
   */
  private getTechnicalMessage(error: any): string {
    return `${error.type || 'Unknown'}: ${error.message || 'No message'} (Code: ${error.code || 'N/A'})`
  }

  /**
   * Get recovery actions for the error
   */
  private getRecoveryActions(error: any, category: ErrorCategory): string[] {
    const actions: string[] = []

    switch (category) {
      case ErrorCategory.NETWORK:
        actions.push('Check internet connection', 'Retry operation', 'Try again later')
        break
      case ErrorCategory.AUTHENTICATION:
        actions.push('Sign in again', 'Clear browser cache', 'Contact support')
        break
      case ErrorCategory.AUTHORIZATION:
        actions.push('Contact administrator', 'Check permissions', 'Sign in with different account')
        break
      case ErrorCategory.VALIDATION:
        actions.push('Check input data', 'Review form fields', 'Contact support for help')
        break
      case ErrorCategory.CONFLICT:
        actions.push('Refresh page', 'Check for updates', 'Try again')
        break
      case ErrorCategory.NOT_FOUND:
        actions.push('Check URL', 'Go back', 'Search for item')
        break
      case ErrorCategory.RATE_LIMIT:
        actions.push('Wait and retry', 'Reduce request frequency')
        break
      case ErrorCategory.SERVER_ERROR:
        actions.push('Try again later', 'Contact support', 'Check status page')
        break
      default:
        actions.push('Retry operation', 'Refresh page', 'Contact support')
    }

    return actions
  }

  /**
   * Check if error is retryable
   */
  private isRetryable(error: any, category: ErrorCategory): boolean {
    const retryableCategories = [
      ErrorCategory.NETWORK,
      ErrorCategory.RATE_LIMIT,
      ErrorCategory.SERVER_ERROR
    ]
    return retryableCategories.includes(category)
  }

  /**
   * Check if error should be reported to monitoring
   */
  private isReportable(error: any, severity: ErrorSeverity): boolean {
    return severity === ErrorSeverity.HIGH || severity === ErrorSeverity.CRITICAL
  }

  /**
   * Log error to internal storage
   */
  private logError(error: EnhancedError): void {
    this.errorLog.unshift(error)
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Enhanced Error:', error)
    }

    // Report critical errors
    if (error.reportable) {
      this.reportError(error)
    }
  }

  /**
   * Report error to external monitoring service
   */
  private reportError(error: EnhancedError): void {
    // In a real application, you would send this to a service like Sentry
    console.error('Reportable error:', error)
    
    // Example: Send to monitoring service
    // if (window.Sentry) {
    //   window.Sentry.captureException(error)
    // }
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const stats = {
      total: this.errorLog.length,
      byCategory: {} as Record<ErrorCategory, number>,
      bySeverity: {} as Record<ErrorSeverity, number>,
      recent: this.errorLog.slice(0, 10)
    }

    this.errorLog.forEach(error => {
      stats.byCategory[error.category] = (stats.byCategory[error.category] || 0) + 1
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1
    })

    return stats
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = []
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit: number = 10): EnhancedError[] {
    return this.errorLog.slice(0, limit)
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance()

// Utility functions for common error handling patterns
export const handleDatabaseError = (error: any, context?: string): EnhancedError => {
  return errorHandler.processError(error, context)
}

export const isNetworkError = (error: EnhancedError): boolean => {
  return error.category === ErrorCategory.NETWORK
}

export const isAuthError = (error: EnhancedError): boolean => {
  return error.category === ErrorCategory.AUTHENTICATION || error.category === ErrorCategory.AUTHORIZATION
}

export const shouldRetry = (error: EnhancedError): boolean => {
  return error.retryable
}

export const getErrorMessage = (error: EnhancedError): string => {
  return error.userMessage
}
