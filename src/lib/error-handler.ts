/**
 * Error Handling Utilities for HomeWiz Frontend
 * 
 * This module provides comprehensive error handling, logging,
 * and user-friendly error message utilities.
 */

import config from './config'

// Error types and interfaces
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NETWORK = 'NETWORK',
  API = 'API',
  FILE_UPLOAD = 'FILE_UPLOAD',
  FORM_SUBMISSION = 'FORM_SUBMISSION',
  DATA_PROCESSING = 'DATA_PROCESSING',
  UNKNOWN = 'UNKNOWN'
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface ErrorDetails {
  type: ErrorType
  severity: ErrorSeverity
  message: string
  code?: string
  details?: any
  timestamp: number
  userId?: string
  sessionId?: string
  userAgent?: string
  url?: string
  stack?: string
}

export interface UserFriendlyError {
  title: string
  message: string
  action?: string
  actionLabel?: string
  retryable: boolean
}

export class ErrorHandler {
  private static errorLog: ErrorDetails[] = []
  private static maxLogSize = 100

  /**
   * Handle and log errors with context
   */
  static handleError(
    error: Error | any,
    context: {
      type?: ErrorType
      severity?: ErrorSeverity
      userId?: string
      additionalInfo?: any
    } = {}
  ): ErrorDetails {
    const errorDetails: ErrorDetails = {
      type: context.type || this.determineErrorType(error),
      severity: context.severity || this.determineSeverity(error),
      message: this.extractMessage(error),
      code: error.code || error.status?.toString(),
      details: {
        originalError: error.message,
        stack: error.stack,
        ...context.additionalInfo
      },
      timestamp: Date.now(),
      userId: context.userId,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      stack: error.stack
    }

    // Log error
    this.logError(errorDetails)

    // Send to monitoring service in production
    if (config.isProduction && config.security.enableErrorReporting) {
      this.sendToMonitoring(errorDetails)
    }

    return errorDetails
  }

  /**
   * Determine error type from error object
   */
  private static determineErrorType(error: any): ErrorType {
    if (error.name === 'ValidationError' || error.type === 'validation') {
      return ErrorType.VALIDATION
    }
    if (error.status === 401 || error.message?.includes('unauthorized')) {
      return ErrorType.AUTHENTICATION
    }
    if (error.status === 403 || error.message?.includes('forbidden')) {
      return ErrorType.AUTHORIZATION
    }
    if (error.name === 'NetworkError' || error.message?.includes('network')) {
      return ErrorType.NETWORK
    }
    if (error.name === 'ApiError' || error.response) {
      return ErrorType.API
    }
    if (error.message?.includes('file') || error.message?.includes('upload')) {
      return ErrorType.FILE_UPLOAD
    }
    return ErrorType.UNKNOWN
  }

  /**
   * Determine error severity
   */
  private static determineSeverity(error: any): ErrorSeverity {
    if (error.status >= 500) return ErrorSeverity.CRITICAL
    if (error.status === 401 || error.status === 403) return ErrorSeverity.HIGH
    if (error.status >= 400) return ErrorSeverity.MEDIUM
    if (error.name === 'ValidationError') return ErrorSeverity.LOW
    return ErrorSeverity.MEDIUM
  }

  /**
   * Extract meaningful message from error
   */
  private static extractMessage(error: any): string {
    if (typeof error === 'string') return error
    if (error.message) return error.message
    if (error.error) return error.error
    if (error.detail) return error.detail
    return 'An unexpected error occurred'
  }

  /**
   * Log error to console and internal log
   */
  private static logError(errorDetails: ErrorDetails): void {
    // Add to internal log
    this.errorLog.unshift(errorDetails)
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize)
    }

    // Console logging based on severity
    const logMethod = errorDetails.severity === ErrorSeverity.CRITICAL ? 'error' :
                     errorDetails.severity === ErrorSeverity.HIGH ? 'error' :
                     errorDetails.severity === ErrorSeverity.MEDIUM ? 'warn' : 'info'

    console[logMethod]('Error:', {
      type: errorDetails.type,
      severity: errorDetails.severity,
      message: errorDetails.message,
      timestamp: new Date(errorDetails.timestamp).toISOString(),
      details: errorDetails.details
    })
  }

  /**
   * Send error to monitoring service
   */
  private static sendToMonitoring(errorDetails: ErrorDetails): void {
    try {
      // This would integrate with services like Sentry, LogRocket, etc.
      if (config.monitoring.sentryDsn) {
        // Example: Sentry.captureException(errorDetails)
        console.log('Would send to monitoring service:', errorDetails)
      }
    } catch (monitoringError) {
      console.error('Failed to send error to monitoring:', monitoringError)
    }
  }

  /**
   * Get user-friendly error message
   */
  static getUserFriendlyError(error: ErrorDetails | Error | any): UserFriendlyError {
    const errorDetails = error instanceof Error ? this.handleError(error) : error

    const errorType = errorDetails.type || this.determineErrorType(error)
    
    switch (errorType) {
      case ErrorType.VALIDATION:
        return {
          title: 'Validation Error',
          message: 'Please check your input and try again.',
          retryable: true,
          action: 'retry',
          actionLabel: 'Try Again'
        }

      case ErrorType.AUTHENTICATION:
        return {
          title: 'Authentication Required',
          message: 'Please sign in to continue.',
          retryable: true,
          action: 'signin',
          actionLabel: 'Sign In'
        }

      case ErrorType.AUTHORIZATION:
        return {
          title: 'Access Denied',
          message: 'You don\'t have permission to perform this action.',
          retryable: false
        }

      case ErrorType.NETWORK:
        return {
          title: 'Connection Error',
          message: 'Please check your internet connection and try again.',
          retryable: true,
          action: 'retry',
          actionLabel: 'Retry'
        }

      case ErrorType.API:
        return {
          title: 'Server Error',
          message: 'Something went wrong on our end. Please try again later.',
          retryable: true,
          action: 'retry',
          actionLabel: 'Try Again'
        }

      case ErrorType.FILE_UPLOAD:
        return {
          title: 'Upload Failed',
          message: 'Failed to upload file. Please check the file size and format.',
          retryable: true,
          action: 'retry',
          actionLabel: 'Try Again'
        }

      case ErrorType.FORM_SUBMISSION:
        return {
          title: 'Submission Failed',
          message: 'Failed to submit form. Please check your input and try again.',
          retryable: true,
          action: 'retry',
          actionLabel: 'Submit Again'
        }

      default:
        return {
          title: 'Unexpected Error',
          message: 'An unexpected error occurred. Please try again or contact support.',
          retryable: true,
          action: 'retry',
          actionLabel: 'Try Again'
        }
    }
  }

  /**
   * Get error log for debugging
   */
  static getErrorLog(): ErrorDetails[] {
    return [...this.errorLog]
  }

  /**
   * Clear error log
   */
  static clearErrorLog(): void {
    this.errorLog = []
  }

  /**
   * Check if error is retryable
   */
  static isRetryable(error: ErrorDetails | Error | any): boolean {
    const errorType = error.type || this.determineErrorType(error)
    const retryableTypes = [
      ErrorType.NETWORK,
      ErrorType.API,
      ErrorType.FILE_UPLOAD,
      ErrorType.FORM_SUBMISSION
    ]
    return retryableTypes.includes(errorType)
  }

  /**
   * Format error for display
   */
  static formatErrorForDisplay(error: ErrorDetails | Error | any): string {
    const userFriendlyError = this.getUserFriendlyError(error)
    return `${userFriendlyError.title}: ${userFriendlyError.message}`
  }
}

// Utility functions for common error scenarios
export const handleApiError = (error: any, context?: any) => {
  return ErrorHandler.handleError(error, {
    type: ErrorType.API,
    ...context
  })
}

export const handleValidationError = (error: any, context?: any) => {
  return ErrorHandler.handleError(error, {
    type: ErrorType.VALIDATION,
    severity: ErrorSeverity.LOW,
    ...context
  })
}

export const handleNetworkError = (error: any, context?: any) => {
  return ErrorHandler.handleError(error, {
    type: ErrorType.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    ...context
  })
}

export const handleAuthError = (error: any, context?: any) => {
  return ErrorHandler.handleError(error, {
    type: ErrorType.AUTHENTICATION,
    severity: ErrorSeverity.HIGH,
    ...context
  })
}

// Export the main handler as default
export default ErrorHandler
