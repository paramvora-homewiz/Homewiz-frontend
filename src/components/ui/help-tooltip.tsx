'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HelpTooltipProps {
  title: string
  content: string | React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function HelpTooltip({ 
  title, 
  content, 
  position = 'top', 
  size = 'md',
  className 
}: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)

  const sizeClasses = {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96'
  }

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  }

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-800',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-800',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-800'
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center justify-center w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors",
          className
        )}
        aria-label="Help"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black bg-opacity-25 md:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "absolute z-50 bg-gray-800 text-white rounded-lg shadow-lg p-4",
                sizeClasses[size],
                positionClasses[position],
                // Mobile positioning
                "md:relative md:transform-none",
                "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 md:absolute md:top-auto md:left-auto"
              )}
            >
              {/* Arrow */}
              <div 
                className={cn(
                  "absolute w-0 h-0 border-4 hidden md:block",
                  arrowClasses[position]
                )}
              />

              {/* Close button for mobile */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-2 right-2 text-gray-300 hover:text-white md:hidden"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Content */}
              <div className="pr-6 md:pr-0">
                <h4 className="font-semibold text-sm mb-2">{title}</h4>
                <div className="text-sm text-gray-200 leading-relaxed">
                  {content}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// Predefined help content for common form fields
export const helpContent = {
  income: {
    title: "Annual Income",
    content: (
      <div className="space-y-2">
        <p>Enter your gross annual income before taxes.</p>
        <p><strong>Include:</strong></p>
        <ul className="list-disc list-inside text-xs space-y-1">
          <li>Salary or wages</li>
          <li>Bonuses and commissions</li>
          <li>Investment income</li>
          <li>Other regular income</li>
        </ul>
      </div>
    )
  },
  budget: {
    title: "Budget Range",
    content: (
      <div className="space-y-2">
        <p>Set your comfortable monthly rent range.</p>
        <p className="text-xs"><strong>Tip:</strong> Most landlords prefer tenants whose rent is no more than 30% of their gross monthly income.</p>
      </div>
    )
  },
  documents: {
    title: "Required Documents",
    content: (
      <div className="space-y-2">
        <p>Upload clear, readable copies of:</p>
        <ul className="list-disc list-inside text-xs space-y-1">
          <li><strong>ID:</strong> Driver's license, passport, or state ID</li>
          <li><strong>Income:</strong> Recent pay stubs, employment letter, or tax returns</li>
          <li><strong>References:</strong> Letters from previous landlords or employers</li>
        </ul>
      </div>
    )
  },
  visa: {
    title: "Visa Status",
    content: (
      <div className="space-y-2">
        <p>This helps us understand your legal status for renting.</p>
        <p className="text-xs">Don't worry - we work with tenants of all visa types and citizenship statuses.</p>
      </div>
    )
  },
  leadSource: {
    title: "How did you find us?",
    content: (
      <div className="space-y-2">
        <p>This helps us understand which marketing channels are most effective.</p>
        <p className="text-xs">Your answer helps us improve our services and reach more people like you.</p>
      </div>
    )
  }
}
