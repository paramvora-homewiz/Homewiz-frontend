'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

interface ValidationSummaryProps {
  errors: Record<string, string>
  fileValidationErrors?: Array<{ file: File; error: string }>
  show: boolean
  className?: string
}

export function ValidationSummary({ 
  errors, 
  fileValidationErrors = [], 
  show,
  className = '' 
}: ValidationSummaryProps) {
  const hasErrors = Object.keys(errors).length > 0 || fileValidationErrors.length > 0

  if (!show || !hasErrors) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: 'auto' }}
        exit={{ opacity: 0, y: -10, height: 0 }}
        transition={{ duration: 0.3 }}
        className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800 mb-1">
              Please correct the following {Object.keys(errors).length + fileValidationErrors.length === 1 ? 'error' : 'errors'}
            </h3>
            <ul className="text-sm text-red-700 space-y-1">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field} className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{error}</span>
                </li>
              ))}
              {fileValidationErrors.map(({ file, error }, index) => (
                <li key={`file-${index}`} className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>
                    <strong>{file.name}</strong>: {error}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}