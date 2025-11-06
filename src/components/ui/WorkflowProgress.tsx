'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Circle, ArrowRight } from 'lucide-react'
import { FormType, FORM_WORKFLOW, getWorkflowProgress } from '@/lib/form-workflow'

interface WorkflowProgressProps {
  currentForm: FormType
  className?: string
  showLabels?: boolean
  compact?: boolean
}

export function WorkflowProgress({ 
  currentForm, 
  className = '', 
  showLabels = true,
  compact = false 
}: WorkflowProgressProps) {
  const progress = getWorkflowProgress(currentForm)
  const currentIndex = FORM_WORKFLOW.findIndex(step => step.id === currentForm)

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="text-sm text-gray-600">
          Step {progress.currentStep} of {progress.totalSteps}
        </div>
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress.progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="text-sm font-medium text-gray-900">
          {Math.round(progress.progress)}%
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">Form Workflow Progress</h3>
        <div className="text-sm text-gray-600">
          {progress.currentStep} of {progress.totalSteps} completed
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        {FORM_WORKFLOW.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = index === currentIndex
          const isUpcoming = index > currentIndex
          
          return (
            <React.Fragment key={step.id}>
              <motion.div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                  isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : isCurrent
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-400'
                }`}
                initial={{ scale: 0.8 }}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
                transition={{ duration: 0.3 }}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </motion.div>
              
              {index < FORM_WORKFLOW.length - 1 && (
                <div className={`flex-1 h-0.5 transition-colors duration-200 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              )}
            </React.Fragment>
          )
        })}
      </div>
      
      {showLabels && (
        <div className="grid grid-cols-5 gap-2 text-xs">
          {FORM_WORKFLOW.map((step, index) => {
            const isCompleted = index < currentIndex
            const isCurrent = index === currentIndex
            
            return (
              <div
                key={step.id}
                className={`text-center transition-colors duration-200 ${
                  isCompleted
                    ? 'text-green-600 font-medium'
                    : isCurrent
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-400'
                }`}
              >
                {step.title.split(' ')[0]}
              </div>
            )
          })}
        </div>
      )}
      
      <div className="mt-3 bg-gray-200 rounded-full h-2">
        <motion.div
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress.progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  )
}

export default WorkflowProgress
