'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  HelpCircle, 
  Info, 
  Lightbulb, 
  CheckCircle, 
  AlertTriangle,
  X,
  ChevronRight,
  BookOpen,
  Target,
  Clock,
  Users
} from 'lucide-react'

// Form guidance types
export interface GuidanceStep {
  id: string
  title: string
  description: string
  tips?: string[]
  examples?: string[]
  required?: boolean
  estimatedTime?: string
}

export interface FormGuidanceProps {
  formType: 'operator' | 'building' | 'room' | 'tenant' | 'lead'
  currentStep?: number
  totalSteps?: number
  onStepClick?: (step: number) => void
  className?: string
}

// Form guidance data
const FORM_GUIDANCE: Record<string, GuidanceStep[]> = {
  room: [
    {
      id: 'basic-info',
      title: 'Basic Room Information',
      description: 'Set up the fundamental details about this room',
      tips: [
        'Use a clear, consistent room numbering system',
        'Select the correct building from the dropdown',
        'Set status to "Available" for new rooms ready to rent'
      ],
      examples: ['Room 101', 'A1', '2nd Floor East'],
      required: true,
      estimatedTime: '2 minutes'
    },
    {
      id: 'pricing-capacity',
      title: 'Pricing & Capacity',
      description: 'Configure rent pricing and occupancy limits',
      tips: [
        'Research local market rates for similar rooms',
        'Consider shared room pricing if applicable',
        'Set maximum occupancy based on room size and local regulations'
      ],
      required: true,
      estimatedTime: '3 minutes'
    },
    {
      id: 'amenities-features',
      title: 'Amenities & Features',
      description: 'Detail the room amenities and special features',
      tips: [
        'Be thorough - amenities are key selling points',
        'Include both furniture and appliances',
        'Mention any unique features that set this room apart'
      ],
      estimatedTime: '4 minutes'
    },
    {
      id: 'maintenance-tracking',
      title: 'Maintenance & Tracking',
      description: 'Set up maintenance schedules and booking information',
      tips: [
        'Regular maintenance checks ensure room quality',
        'Track booking types for better management',
        'Keep maintenance records up to date'
      ],
      estimatedTime: '2 minutes'
    }
  ],
  building: [
    {
      id: 'location-details',
      title: 'Location & Basic Details',
      description: 'Enter the building address and basic information',
      tips: [
        'Use the complete, accurate address',
        'Choose a descriptive building name',
        'Verify the address with mapping services'
      ],
      required: true,
      estimatedTime: '3 minutes'
    },
    {
      id: 'capacity-structure',
      title: 'Capacity & Structure',
      description: 'Define the building layout and capacity',
      tips: [
        'Count all rentable rooms accurately',
        'Include common areas in your planning',
        'Consider future expansion possibilities'
      ],
      required: true,
      estimatedTime: '2 minutes'
    },
    {
      id: 'amenities-services',
      title: 'Amenities & Services',
      description: 'List all building amenities and services',
      tips: [
        'Highlight unique amenities that attract tenants',
        'Include both indoor and outdoor facilities',
        'Mention any included utilities or services'
      ],
      estimatedTime: '5 minutes'
    }
  ],
  tenant: [
    {
      id: 'personal-info',
      title: 'Personal Information',
      description: 'Collect basic tenant details and contact information',
      tips: [
        'Verify email address for important communications',
        'Ensure phone number is current and reachable',
        'Double-check spelling of names'
      ],
      required: true,
      estimatedTime: '3 minutes'
    },
    {
      id: 'lease-details',
      title: 'Lease & Room Assignment',
      description: 'Set up lease terms and room assignment',
      tips: [
        'Confirm room availability before assignment',
        'Set realistic lease start and end dates',
        'Calculate deposit based on your policies'
      ],
      required: true,
      estimatedTime: '4 minutes'
    },
    {
      id: 'preferences-additional',
      title: 'Preferences & Additional Info',
      description: 'Configure communication preferences and additional details',
      tips: [
        'Set communication preferences to match tenant needs',
        'Document any special requests or requirements',
        'Enable payment reminders for better collection'
      ],
      estimatedTime: '3 minutes'
    }
  ],
  operator: [
    {
      id: 'basic-profile',
      title: 'Basic Profile',
      description: 'Set up operator profile and contact information',
      tips: [
        'Use professional email address',
        'Ensure contact information is always current',
        'Choose appropriate operator type for permissions'
      ],
      required: true,
      estimatedTime: '2 minutes'
    },
    {
      id: 'permissions-settings',
      title: 'Permissions & Settings',
      description: 'Configure access levels and notification preferences',
      tips: [
        'Set appropriate permissions for the role',
        'Configure notifications to avoid overload',
        'Enable emergency contact if applicable'
      ],
      estimatedTime: '3 minutes'
    }
  ],
  lead: [
    {
      id: 'contact-source',
      title: 'Contact & Source Information',
      description: 'Capture lead contact details and source',
      tips: [
        'Record accurate contact information',
        'Track lead source for marketing insights',
        'Set appropriate lead status'
      ],
      required: true,
      estimatedTime: '2 minutes'
    },
    {
      id: 'preferences-budget',
      title: 'Preferences & Budget',
      description: 'Document housing preferences and budget range',
      tips: [
        'Be specific about budget ranges',
        'Note all preferences to match suitable rooms',
        'Set realistic move-in dates'
      ],
      estimatedTime: '4 minutes'
    },
    {
      id: 'follow-up-notes',
      title: 'Follow-up & Notes',
      description: 'Plan follow-up actions and add relevant notes',
      tips: [
        'Schedule follow-ups based on lead interest level',
        'Keep detailed notes for future reference',
        'Update lead score based on interactions'
      ],
      estimatedTime: '2 minutes'
    }
  ]
}

export default function FormGuidance({
  formType,
  currentStep = 0,
  totalSteps,
  onStepClick,
  className = ''
}: FormGuidanceProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedStep, setSelectedStep] = useState<string | null>(null)
  
  const guidance = FORM_GUIDANCE[formType] || []
  const currentGuidance = guidance[currentStep]

  const getFormIcon = () => {
    switch (formType) {
      case 'operator': return <Users className="h-5 w-5" />
      case 'building': return <Target className="h-5 w-5" />
      case 'room': return <BookOpen className="h-5 w-5" />
      case 'tenant': return <Users className="h-5 w-5" />
      case 'lead': return <Target className="h-5 w-5" />
      default: return <Info className="h-5 w-5" />
    }
  }

  const getTotalEstimatedTime = () => {
    return guidance.reduce((total, step) => {
      const time = step.estimatedTime?.match(/(\d+)/)
      return total + (time ? parseInt(time[1]) : 0)
    }, 0)
  }

  if (!currentGuidance) return null

  return (
    <div className={className}>
      <Card className="border-2 border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                {getFormIcon()}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  {currentGuidance.title}
                  {currentGuidance.required && (
                    <Badge variant="destructive" className="text-xs">Required</Badge>
                  )}
                </h3>
                <p className="text-sm text-gray-600">{currentGuidance.description}</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-blue-700"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress indicator */}
          {totalSteps && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500">
                {currentStep + 1} of {totalSteps}
              </span>
            </div>
          )}

          {/* Quick info */}
          <div className="flex items-center gap-4 text-xs text-gray-600">
            {currentGuidance.estimatedTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{currentGuidance.estimatedTime}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Info className="h-3 w-3" />
              <span>Total: ~{getTotalEstimatedTime()} minutes</span>
            </div>
          </div>

          {/* Expanded content */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 pt-4 border-t border-blue-200"
              >
                {/* Tips */}
                {currentGuidance.tips && currentGuidance.tips.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      Helpful Tips
                    </h4>
                    <ul className="space-y-1">
                      {currentGuidance.tips.map((tip, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <ChevronRight className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Examples */}
                {currentGuidance.examples && currentGuidance.examples.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Examples
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {currentGuidance.examples.map((example, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* All steps overview */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Form Steps</h4>
                  <div className="space-y-2">
                    {guidance.map((step, index) => (
                      <div
                        key={step.id}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          index === currentStep
                            ? 'bg-blue-100 border border-blue-200'
                            : index < currentStep
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                        }`}
                        onClick={() => onStepClick?.(index)}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          index === currentStep
                            ? 'bg-blue-500 text-white'
                            : index < currentStep
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}>
                          {index < currentStep ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${
                            index === currentStep ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {step.title}
                          </p>
                          {step.estimatedTime && (
                            <p className="text-xs text-gray-500">{step.estimatedTime}</p>
                          )}
                        </div>
                        {step.required && (
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </div>
  )
}

// Inline help tooltip component
interface HelpTooltipProps {
  content: string
  examples?: string[]
  className?: string
}

export function HelpTooltip({ content, examples, className = '' }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <HelpCircle className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="absolute z-50 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-lg bottom-full left-1/2 transform -translate-x-1/2 mb-2"
          >
            <div className="text-sm text-gray-700 mb-2">{content}</div>
            
            {examples && examples.length > 0 && (
              <div>
                <div className="text-xs font-medium text-gray-500 mb-1">Examples:</div>
                <div className="flex flex-wrap gap-1">
                  {examples.map((example, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {example}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
