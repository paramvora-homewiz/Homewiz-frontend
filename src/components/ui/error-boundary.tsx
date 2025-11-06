'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home, Bug, Copy, CheckCircle } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import ErrorHandler, { ErrorType, ErrorSeverity } from '@/lib/error-handler'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
  enableReporting?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string | null
  copied: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      copied: false
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })

    // Log error using our error handler
    const errorDetails = ErrorHandler.handleError(error, {
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.CRITICAL,
      additionalInfo: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
        errorId: this.state.errorId
      }
    })

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // Show error toast
    ErrorHandler.showErrorToast(errorDetails, {
      showSuggestions: true,
      customAction: {
        label: 'Reload Page',
        onClick: () => window.location.reload()
      }
    })
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      copied: false
    })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleReload = () => {
    window.location.reload()
  }

  handleCopyError = async () => {
    if (!this.state.error) return

    const errorDetails = {
      message: this.state.error.message,
      stack: this.state.error.stack,
      componentStack: this.state.errorInfo?.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    try {
      await navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      this.setState({ copied: true })
      setTimeout(() => this.setState({ copied: false }), 2000)
    } catch (err) {
      console.error('Failed to copy error details:', err)
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const userFriendlyError = ErrorHandler.getUserFriendlyError(this.state.error)

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-2xl"
          >
            <Card className="shadow-xl border-red-200">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <CardTitle className="text-2xl text-red-800">
                  {userFriendlyError.title}
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  {userFriendlyError.message}
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Suggestions */}
                {userFriendlyError.suggestions && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-800 mb-2">What you can try:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {userFriendlyError.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button onClick={this.handleRetry} className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </Button>
                  
                  <Button onClick={this.handleReload} variant="outline" className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Reload Page
                  </Button>
                  
                  <Button onClick={this.handleGoHome} variant="outline" className="flex items-center gap-2">
                    <Home className="w-4 h-4" />
                    Go Home
                  </Button>
                </div>

                {/* Error Details (for development/debugging) */}
                {(this.props.showDetails || process.env.NODE_ENV === 'development') && this.state.error && (
                  <details className="bg-gray-100 border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-700 flex items-center gap-2">
                      <Bug className="w-4 h-4" />
                      Technical Details
                    </summary>
                    <div className="mt-3 space-y-3">
                      <div>
                        <h5 className="font-medium text-gray-700">Error ID:</h5>
                        <code className="text-xs bg-white p-2 rounded border block">
                          {this.state.errorId}
                        </code>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-gray-700">Error Message:</h5>
                        <code className="text-xs bg-white p-2 rounded border block">
                          {this.state.error.message}
                        </code>
                      </div>
                      
                      {this.state.error.stack && (
                        <div>
                          <h5 className="font-medium text-gray-700">Stack Trace:</h5>
                          <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-40">
                            {this.state.error.stack}
                          </pre>
                        </div>
                      )}
                      
                      <Button
                        onClick={this.handleCopyError}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        {this.state.copied ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy Error Details
                          </>
                        )}
                      </Button>
                    </div>
                  </details>
                )}

                {/* Error ID for support */}
                <div className="text-center text-sm text-gray-500">
                  Error ID: <code className="bg-gray-100 px-2 py-1 rounded">{this.state.errorId}</code>
                  <br />
                  Please include this ID when contacting support.
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

export default ErrorBoundary
