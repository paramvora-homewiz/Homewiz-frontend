'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  FormLoadingOverlay, 
  ButtonLoadingState, 
  ProgressBar, 
  OperationStatus,
  InlineLoading 
} from '@/components/ui/loading-states'
import ErrorBoundary from '@/components/ui/error-boundary'
import ErrorToastProvider from '@/components/providers/error-toast-provider'
import {
  showSuccessMessage,
  showWarningMessage,
  showInfoMessage,
  handleApiError,
  handleValidationError,
  handleNetworkError,
  handleFileUploadError,
  handleFormSubmissionError
} from '@/lib/error-handler'

function ErrorHandlingDemo() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [operationStatus, setOperationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [formData, setFormData] = useState({ name: '', email: '' })

  const simulateApiCall = async (shouldFail = false, delay = 2000) => {
    setIsLoading(true)
    setOperationStatus('loading')
    setProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, delay / 10)

    try {
      await new Promise(resolve => setTimeout(resolve, delay))
      
      if (shouldFail) {
        throw new Error('Simulated API failure')
      }

      setProgress(100)
      setOperationStatus('success')
      showSuccessMessage(
        'Operation Successful!',
        'Your request has been processed successfully.',
        {
          action: {
            label: 'View Details',
            onClick: () => console.log('View details clicked')
          }
        }
      )
    } catch (error) {
      setOperationStatus('error')
      handleApiError(error, {
        additionalInfo: {
          operation: 'demo_api_call',
          timestamp: new Date().toISOString()
        }
      })
    } finally {
      setIsLoading(false)
      clearInterval(progressInterval)
    }
  }

  const simulateValidationError = () => {
    const validationError = new Error('Email format is invalid')
    validationError.name = 'ValidationError'
    handleValidationError(validationError, {
      additionalInfo: {
        field: 'email',
        value: formData.email
      }
    })
  }

  const simulateNetworkError = () => {
    const networkError = new Error('Failed to connect to server')
    networkError.name = 'NetworkError'
    handleNetworkError(networkError)
  }

  const simulateFileUploadError = () => {
    const uploadError = new Error('File size exceeds limit')
    handleFileUploadError(uploadError, {
      additionalInfo: {
        fileSize: '15MB',
        maxSize: '10MB'
      }
    })
  }

  const simulateFormSubmissionError = () => {
    const formError = new Error('Required fields missing')
    handleFormSubmissionError(formError, {
      additionalInfo: {
        formType: 'demo',
        missingFields: ['name', 'email']
      }
    })
  }

  const throwComponentError = () => {
    throw new Error('This is a component error for testing the error boundary')
  }

  const showDifferentMessages = () => {
    showInfoMessage('Information', 'This is an informational message.')
    
    setTimeout(() => {
      showWarningMessage('Warning', 'This is a warning message with suggestions.', {
        action: {
          label: 'Learn More',
          onClick: () => console.log('Learn more clicked')
        }
      })
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Error Handling & Loading States Demo
          </h1>
          <p className="text-gray-600">
            Demonstration of enhanced error handling, loading states, and user feedback
          </p>
        </div>

        {/* Loading States Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Loading States & Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">API Operations</h4>
                <div className="space-y-2">
                  <ButtonLoadingState
                    isLoading={isLoading}
                    loadingText="Processing..."
                    icon="send"
                    onClick={() => simulateApiCall(false)}
                  >
                    Successful API Call
                  </ButtonLoadingState>
                  
                  <ButtonLoadingState
                    isLoading={isLoading}
                    loadingText="Attempting..."
                    icon="send"
                    onClick={() => simulateApiCall(true)}
                  >
                    Failed API Call
                  </ButtonLoadingState>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Operation Status</h4>
                <OperationStatus
                  status={operationStatus}
                  operation="API Request"
                  message={
                    operationStatus === 'loading' ? 'In progress...' :
                    operationStatus === 'success' ? 'Completed successfully' :
                    operationStatus === 'error' ? 'Failed to complete' :
                    'Ready to start'
                  }
                />
                
                {progress > 0 && (
                  <div className="mt-4">
                    <ProgressBar progress={progress} />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Types Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Error Types Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button onClick={simulateValidationError} variant="outline">
                Validation Error
              </Button>
              <Button onClick={simulateNetworkError} variant="outline">
                Network Error
              </Button>
              <Button onClick={simulateFileUploadError} variant="outline">
                Upload Error
              </Button>
              <Button onClick={simulateFormSubmissionError} variant="outline">
                Form Error
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Success Messages Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Success & Info Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={showDifferentMessages}>
              Show Info & Warning Messages
            </Button>
          </CardContent>
        </Card>

        {/* Form Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Form with Error Handling</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-w-md">
              <Input
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                placeholder="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
              <Button onClick={() => {
                if (!formData.name || !formData.email) {
                  simulateFormSubmissionError()
                } else if (!formData.email.includes('@')) {
                  simulateValidationError()
                } else {
                  showSuccessMessage('Form Submitted', 'Your information has been saved.')
                }
              }}>
                Submit Form
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Boundary Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Error Boundary Demo</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={throwComponentError} variant="destructive">
              Trigger Component Error
            </Button>
            <p className="text-sm text-gray-600 mt-2">
              This will trigger the error boundary to catch and display the error gracefully.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Loading Overlay */}
      <FormLoadingOverlay
        isLoading={isLoading}
        operation="Processing Request"
        progress={progress}
        steps={[
          'Validating data',
          'Sending request',
          'Processing response',
          'Updating interface'
        ]}
        currentStep={Math.floor(progress / 25)}
      />
    </div>
  )
}

export default function ErrorHandlingDemoPage() {
  return (
    <ErrorToastProvider>
      <ErrorBoundary showDetails={true}>
        <ErrorHandlingDemo />
      </ErrorBoundary>
    </ErrorToastProvider>
  )
}
