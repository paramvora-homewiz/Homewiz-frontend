'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Loader2, CheckCircle, AlertCircle, Clock, Upload, Save, Send } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <Loader2 className={cn('animate-spin', sizeClasses[size], className)} />
  )
}

interface ProgressBarProps {
  progress: number
  className?: string
  showPercentage?: boolean
  color?: 'blue' | 'green' | 'yellow' | 'red'
}

export function ProgressBar({ 
  progress, 
  className, 
  showPercentage = true,
  color = 'blue' 
}: ProgressBarProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="flex justify-between items-center mb-1">
        {showPercentage && (
          <span className="text-sm font-medium text-gray-700">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div
          className={cn('h-2 rounded-full', colorClasses[color])}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

interface OperationStatusProps {
  status: 'idle' | 'loading' | 'success' | 'error'
  operation: string
  message?: string
  className?: string
}

export function OperationStatus({ 
  status, 
  operation, 
  message, 
  className 
}: OperationStatusProps) {
  const getIcon = () => {
    switch (status) {
      case 'loading':
        return <LoadingSpinner size="sm" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-600'
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {getIcon()}
      <span className={cn('text-sm font-medium', getStatusColor())}>
        {operation}
      </span>
      {message && (
        <span className="text-sm text-gray-500">- {message}</span>
      )}
    </div>
  )
}

interface FormLoadingOverlayProps {
  isLoading: boolean
  operation?: string
  progress?: number
  steps?: string[]
  currentStep?: number
}

export function FormLoadingOverlay({ 
  isLoading, 
  operation = 'Processing',
  progress,
  steps,
  currentStep = 0
}: FormLoadingOverlayProps) {
  if (!isLoading) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
      >
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {operation}
          </h3>
          
          {progress !== undefined && (
            <div className="mb-4">
              <ProgressBar progress={progress} />
            </div>
          )}
          
          {steps && (
            <div className="space-y-2 text-left">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-center gap-2 text-sm',
                    index < currentStep ? 'text-green-600' :
                    index === currentStep ? 'text-blue-600' :
                    'text-gray-400'
                  )}
                >
                  {index < currentStep ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : index === currentStep ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                  {step}
                </div>
              ))}
            </div>
          )}
          
          <p className="text-sm text-gray-500 mt-4">
            Please wait while we process your request...
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

interface ButtonLoadingStateProps {
  isLoading: boolean
  children: React.ReactNode
  loadingText?: string
  icon?: 'save' | 'send' | 'upload' | 'default'
  className?: string
  disabled?: boolean
}

export function ButtonLoadingState({ 
  isLoading, 
  children, 
  loadingText,
  icon = 'default',
  className,
  disabled
}: ButtonLoadingStateProps) {
  const getIcon = () => {
    if (isLoading) return <LoadingSpinner size="sm" />
    
    switch (icon) {
      case 'save':
        return <Save className="w-4 h-4" />
      case 'send':
        return <Send className="w-4 h-4" />
      case 'upload':
        return <Upload className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <button
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors',
        'bg-blue-600 hover:bg-blue-700 text-white',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      disabled={isLoading || disabled}
    >
      {getIcon()}
      {isLoading ? (loadingText || 'Processing...') : children}
    </button>
  )
}

interface InlineLoadingProps {
  text: string
  className?: string
}

export function InlineLoading({ text, className }: InlineLoadingProps) {
  return (
    <div className={cn('flex items-center gap-2 text-sm text-gray-600', className)}>
      <LoadingSpinner size="sm" />
      {text}
    </div>
  )
}

interface SkeletonProps {
  className?: string
  lines?: number
}

export function Skeleton({ className, lines = 1 }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'bg-gray-200 rounded',
            i === 0 ? 'h-4' : 'h-3 mt-2',
            i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  )
}

export default {
  LoadingSpinner,
  ProgressBar,
  OperationStatus,
  FormLoadingOverlay,
  ButtonLoadingState,
  InlineLoading,
  Skeleton
}
