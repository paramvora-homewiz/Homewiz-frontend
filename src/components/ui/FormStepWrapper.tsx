'use client'

import { Suspense } from 'react'
import { LoadingSpinner } from './loading-spinner'

interface FormStepWrapperProps {
  children: React.ReactNode
}

function FormStepFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner className="w-8 h-8 mx-auto mb-4" />
        <p className="text-gray-600">Loading form...</p>
      </div>
    </div>
  )
}

export function FormStepWrapper({ children }: FormStepWrapperProps) {
  return (
    <Suspense fallback={<FormStepFallback />}>
      {children}
    </Suspense>
  )
}