'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Home } from 'lucide-react'
import { Button } from './button'
import { FormType, getBackNavigationUrl } from '@/lib/form-workflow'
import { WorkflowProgress } from './WorkflowProgress'

interface FormHeaderProps {
  title?: string
  subtitle?: string
  showBackButton?: boolean
  onBack?: () => void
  fallbackUrl?: string
  className?: string
  currentForm?: FormType // Add current form type for workflow navigation
  showWorkflowProgress?: boolean // Show workflow progress indicator
}

export function FormHeader({
  title,
  subtitle,
  showBackButton = true,
  onBack,
  fallbackUrl = '/forms',
  className = '',
  currentForm,
  showWorkflowProgress = false
}: FormHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
      return
    }

    // Use workflow-based navigation if currentForm is provided
    if (currentForm) {
      const workflowBackUrl = getBackNavigationUrl(currentForm)
      router.push(workflowBackUrl)
      return
    }

    // Fallback to browser history or default URL
    const canGoBack = window.history.length > 1 && document.referrer !== ''

    if (canGoBack) {
      try {
        // Check if the referrer is from the same origin to avoid external redirects
        const referrerUrl = new URL(document.referrer)
        const currentUrl = new URL(window.location.href)

        if (referrerUrl.origin === currentUrl.origin) {
          router.back()
        } else {
          // External referrer, use fallback
          router.push(fallbackUrl)
        }
      } catch (error) {
        console.warn('Could not navigate back, using fallback URL:', error)
        router.push(fallbackUrl)
      }
    } else {
      // No valid history or referrer, use fallback
      router.push(fallbackUrl)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Back button */}
          <div className="flex items-center gap-4">
            {showBackButton && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 font-medium"
                  title="Go back to previous page"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
              </motion.div>
            )}
            
            {/* Title and subtitle */}
            {(title || subtitle) && (
              <div className="flex flex-col">
                {title && (
                  <h1 className="text-lg font-semibold text-gray-900 truncate">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-600 truncate">
                    {subtitle}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right side - Home button */}
          <div className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/forms')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 font-medium"
                title="Go to forms dashboard"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Workflow Progress */}
      {showWorkflowProgress && currentForm && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
          <WorkflowProgress currentForm={currentForm} compact />
        </div>
      )}
    </motion.div>
  )
}

export default FormHeader
