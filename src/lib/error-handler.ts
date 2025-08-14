/**
 * Error Handling Utilities for HomeWiz Frontend
 *
 * This module provides comprehensive error handling, logging,
 * and user-friendly error message utilities with toast integration.
 */

import config from './config'

// Toast integration interface
export interface ToastNotification {
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// Global toast handler - will be set by the app
let globalToastHandler: ((toast: ToastNotification) => void) | null = null

export const setGlobalToastHandler = (handler: (toast: ToastNotification) => void) => {
  globalToastHandler = handler
}

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
  severity?: 'low' | 'medium' | 'high' | 'critical'
  category?: string
  suggestions?: string[]
  recoveryActions?: {
    label: string
    action: () => void
  }[]
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
   * Get user-friendly error message with enhanced details
   */
  static getUserFriendlyError(error: ErrorDetails | Error | any): UserFriendlyError {
    const errorDetails = error instanceof Error ? this.handleError(error) : error
    const errorType = errorDetails.type || this.determineErrorType(error)
    const severity = this.mapSeverityToUserLevel(errorDetails.severity || this.determineSeverity(error))

    switch (errorType) {
      case ErrorType.VALIDATION:
        return {
          title: 'Validation Error',
          message: this.getSpecificValidationMessage(errorDetails) || 'Please check your input and try again.',
          retryable: true,
          action: 'retry',
          actionLabel: 'Fix and Try Again',
          severity: 'low',
          category: 'validation',
          suggestions: [
            'Check required fields are filled',
            'Verify email format is correct',
            'Ensure phone numbers are valid',
            'Check date formats'
          ]
        }

      case ErrorType.AUTHENTICATION:
        return {
          title: 'Authentication Required',
          message: 'Your session has expired. Please sign in to continue.',
          retryable: true,
          action: 'signin',
          actionLabel: 'Sign In',
          severity: 'high',
          category: 'auth',
          suggestions: [
            'Check your credentials',
            'Clear browser cache if issues persist',
            'Contact support if you forgot your password'
          ]
        }

      case ErrorType.AUTHORIZATION:
        return {
          title: 'Access Denied',
          message: 'You don\'t have permission to perform this action.',
          retryable: false,
          severity: 'medium',
          category: 'auth',
          suggestions: [
            'Contact your administrator for access',
            'Verify you\'re signed in with the correct account'
          ]
        }

      case ErrorType.NETWORK:
        return {
          title: 'Connection Error',
          message: 'Unable to connect to the server. Please check your internet connection.',
          retryable: true,
          action: 'retry',
          actionLabel: 'Retry',
          severity: 'medium',
          category: 'network',
          suggestions: [
            'Check your internet connection',
            'Try refreshing the page',
            'Disable VPN if using one',
            'Contact IT support if problem persists'
          ]
        }

      case ErrorType.API:
        return {
          title: 'Server Error',
          message: this.getSpecificApiMessage(errorDetails) || 'Something went wrong on our end. Please try again later.',
          retryable: true,
          action: 'retry',
          actionLabel: 'Try Again',
          severity: 'high',
          category: 'server',
          suggestions: [
            'Wait a moment and try again',
            'Check if the service is under maintenance',
            'Contact support if the issue persists'
          ]
        }

      case ErrorType.FILE_UPLOAD:
        return {
          title: 'Upload Failed',
          message: this.getSpecificFileUploadMessage(errorDetails) || 'Failed to upload file. Please check the file size and format.',
          retryable: true,
          action: 'retry',
          actionLabel: 'Try Again',
          severity: 'medium',
          category: 'upload',
          suggestions: [
            'Check file size is under 10MB',
            'Ensure file format is supported (JPG, PNG, PDF)',
            'Try uploading a different file',
            'Check your internet connection'
          ]
        }

      case ErrorType.FORM_SUBMISSION:
        return {
          title: 'Submission Failed',
          message: 'Failed to submit form. Please check your input and try again.',
          retryable: true,
          action: 'retry',
          actionLabel: 'Submit Again',
          severity: 'medium',
          category: 'form',
          suggestions: [
            'Review all required fields',
            'Check for validation errors',
            'Save your work before retrying',
            'Try refreshing the page if issues persist'
          ]
        }

      case ErrorType.DATA_PROCESSING:
        return {
          title: 'Processing Error',
          message: 'Failed to process your data. Please try again.',
          retryable: true,
          action: 'retry',
          actionLabel: 'Try Again',
          severity: 'medium',
          category: 'processing',
          suggestions: [
            'Check your data format',
            'Ensure all required information is provided',
            'Try with a smaller dataset'
          ]
        }

      default:
        return {
          title: 'Unexpected Error',
          message: 'An unexpected error occurred. Please try again or contact support.',
          retryable: true,
          action: 'retry',
          actionLabel: 'Try Again',
          severity: 'high',
          category: 'unknown',
          suggestions: [
            'Try refreshing the page',
            'Clear your browser cache',
            'Contact support with error details'
          ]
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

  /**
   * Show error as toast notification
   */
  static showErrorToast(error: ErrorDetails | Error | any, options: {
    showSuggestions?: boolean
    includeRetryAction?: boolean
    customAction?: { label: string; onClick: () => void }
  } = {}): void {
    const userFriendlyError = this.getUserFriendlyError(error)

    if (!globalToastHandler) {
      console.warn('Toast handler not set. Falling back to console error.')
      console.error(userFriendlyError.title, userFriendlyError.message)
      return
    }

    let message = userFriendlyError.message
    if (options.showSuggestions && userFriendlyError.suggestions?.length) {
      message += '\n\nSuggestions:\n• ' + userFriendlyError.suggestions.slice(0, 2).join('\n• ')
    }

    globalToastHandler({
      type: 'error',
      title: userFriendlyError.title,
      message,
      duration: userFriendlyError.severity === 'critical' ? 10000 : 7000,
      action: options.customAction || (options.includeRetryAction && userFriendlyError.retryable ? {
        label: userFriendlyError.actionLabel || 'Retry',
        onClick: () => console.log('Retry action triggered')
      } : undefined)
    })
  }

  /**
   * Show success message as toast
   */
  static showSuccessToast(title: string, message?: string, options: {
    duration?: number
    action?: { label: string; onClick: () => void }
  } = {}): void {
    if (!globalToastHandler) {
      console.log('✅', title, message)
      return
    }

    globalToastHandler({
      type: 'success',
      title,
      message,
      duration: options.duration || 4000,
      action: options.action
    })
  }

  /**
   * Show warning message as toast
   */
  static showWarningToast(title: string, message?: string, options: {
    duration?: number
    action?: { label: string; onClick: () => void }
  } = {}): void {
    if (!globalToastHandler) {
      console.warn('⚠️', title, message)
      return
    }

    globalToastHandler({
      type: 'warning',
      title,
      message,
      duration: options.duration || 6000,
      action: options.action
    })
  }

  /**
   * Show info message as toast
   */
  static showInfoToast(title: string, message?: string, options: {
    duration?: number
    action?: { label: string; onClick: () => void }
  } = {}): void {
    if (!globalToastHandler) {
      console.info('ℹ️', title, message)
      return
    }

    globalToastHandler({
      type: 'info',
      title,
      message,
      duration: options.duration || 5000,
      action: options.action
    })
  }

  /**
   * Map error severity to user-friendly level
   */
  private static mapSeverityToUserLevel(severity: ErrorSeverity): 'low' | 'medium' | 'high' | 'critical' {
    switch (severity) {
      case ErrorSeverity.LOW: return 'low'
      case ErrorSeverity.MEDIUM: return 'medium'
      case ErrorSeverity.HIGH: return 'high'
      case ErrorSeverity.CRITICAL: return 'critical'
      default: return 'medium'
    }
  }

  /**
   * Get specific validation error message
   */
  private static getSpecificValidationMessage(errorDetails: any): string | null {
    if (errorDetails.details?.field) {
      const field = errorDetails.details.field
      if (field.includes('email')) return 'Please enter a valid email address.'
      if (field.includes('phone')) return 'Please enter a valid phone number.'
      if (field.includes('date')) return 'Please enter a valid date.'
      if (field.includes('required')) return 'This field is required.'
    }
    return null
  }

  /**
   * Get specific API error message
   */
  private static getSpecificApiMessage(errorDetails: any): string | null {
    const status = errorDetails.code || errorDetails.details?.status
    if (status === 429) return 'Too many requests. Please wait a moment before trying again.'
    if (status === 503) return 'Service temporarily unavailable. Please try again later.'
    if (status === 500) return 'Internal server error. Our team has been notified.'
    return null
  }

  /**
   * Get specific file upload error message
   */
  private static getSpecificFileUploadMessage(errorDetails: any): string | null {
    const message = errorDetails.message?.toLowerCase() || ''
    if (message.includes('size')) return 'File size too large. Please choose a file under 10MB.'
    if (message.includes('format') || message.includes('type')) return 'File format not supported. Please use JPG, PNG, or PDF.'
    if (message.includes('network')) return 'Upload failed due to connection issues. Please try again.'
    return null
  }
}

// Enhanced utility functions for common error scenarios
export const handleApiError = (error: any, context?: any, showToast = true) => {
  const errorDetails = ErrorHandler.handleError(error, {
    type: ErrorType.API,
    ...context
  })

  if (showToast) {
    ErrorHandler.showErrorToast(errorDetails, {
      showSuggestions: true,
      includeRetryAction: true
    })
  }

  return errorDetails
}

export const handleValidationError = (error: any, context?: any, showToast = true) => {
  const errorDetails = ErrorHandler.handleError(error, {
    type: ErrorType.VALIDATION,
    severity: ErrorSeverity.LOW,
    ...context
  })

  if (showToast) {
    ErrorHandler.showErrorToast(errorDetails, {
      showSuggestions: true
    })
  }

  return errorDetails
}

export const handleNetworkError = (error: any, context?: any, showToast = true) => {
  const errorDetails = ErrorHandler.handleError(error, {
    type: ErrorType.NETWORK,
    severity: ErrorSeverity.MEDIUM,
    ...context
  })

  if (showToast) {
    ErrorHandler.showErrorToast(errorDetails, {
      showSuggestions: true,
      includeRetryAction: true
    })
  }

  return errorDetails
}

export const handleAuthError = (error: any, context?: any, showToast = true) => {
  const errorDetails = ErrorHandler.handleError(error, {
    type: ErrorType.AUTHENTICATION,
    severity: ErrorSeverity.HIGH,
    ...context
  })

  if (showToast) {
    ErrorHandler.showErrorToast(errorDetails, {
      showSuggestions: true
    })
  }

  return errorDetails
}

export const handleFileUploadError = (error: any, context?: any, showToast = true) => {
  const errorDetails = ErrorHandler.handleError(error, {
    type: ErrorType.FILE_UPLOAD,
    severity: ErrorSeverity.MEDIUM,
    ...context
  })

  if (showToast) {
    ErrorHandler.showErrorToast(errorDetails, {
      showSuggestions: true,
      includeRetryAction: true
    })
  }

  return errorDetails
}

export const handleFormSubmissionError = (error: any, context?: any, showToast = true) => {
  const errorDetails = ErrorHandler.handleError(error, {
    type: ErrorType.FORM_SUBMISSION,
    severity: ErrorSeverity.MEDIUM,
    ...context
  })

  if (showToast) {
    ErrorHandler.showErrorToast(errorDetails, {
      showSuggestions: true,
      includeRetryAction: true
    })
  }

  return errorDetails
}

// Success message utilities
export const showSuccessMessage = (title: string, message?: string, options?: {
  duration?: number
  action?: { label: string; onClick: () => void }
}) => {
  ErrorHandler.showSuccessToast(title, message, options)
}

export const showWarningMessage = (title: string, message?: string, options?: {
  duration?: number
  action?: { label: string; onClick: () => void }
}) => {
  ErrorHandler.showWarningToast(title, message, options)
}

export const showInfoMessage = (title: string, message?: string, options?: {
  duration?: number
  action?: { label: string; onClick: () => void }
}) => {
  ErrorHandler.showInfoToast(title, message, options)
}

// Form-specific success messages
export const showFormSuccessMessage = (formType: string, action = 'saved') => {
  const formNames: Record<string, string> = {
    operator: 'Operator',
    building: 'Building',
    room: 'Room',
    tenant: 'Tenant',
    lead: 'Lead'
  }

  const formName = formNames[formType] || formType
  showSuccessMessage(
    `${formName} ${action} successfully!`,
    `Your ${formName.toLowerCase()} information has been ${action} and is now available in the system.`,
    {
      duration: 5000,
      action: {
        label: 'View Details',
        onClick: () => console.log(`Navigate to ${formType} details`)
      }
    }
  )
}

// Export the main handler as default
export default ErrorHandler
