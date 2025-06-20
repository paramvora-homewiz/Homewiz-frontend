'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { OnboardingFormData } from '@/types'
import { useSmartDefaults } from '@/hooks/useSmartDefaults'
import { PersonalInfoStep } from './steps/PersonalInfoStepNew'
import { ProfessionalInfoStep } from './steps/ProfessionalInfoStep'
import { HousingPreferencesStep } from './steps/HousingPreferencesStep'
import { PropertySelectionStep } from './steps/PropertySelectionStep'
import { DocumentUploadStep } from './steps/DocumentUploadStep'
import { ReviewStep } from './steps/ReviewStep'
import { Home, ArrowLeft, ArrowRight, CheckCircle, Building } from 'lucide-react'

const formSchema = z.object({
  // System Generated Fields
  tenant_id: z.string().optional(),
  lead_id: z.string().optional(),

  // Personal Information
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  email: z.string().email('Invalid email address').max(255, 'Email is too long'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(20, 'Phone number is too long'),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  preferred_communication: z.enum(['EMAIL', 'SMS', 'PHONE', 'BOTH']).default('EMAIL').optional(),

  // Emergency Contact Information
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_relation: z.string().optional(),

  // Professional Information
  occupation: z.string().min(1, 'Occupation is required'),
  company: z.string().optional(),
  annual_income: z.number().min(0, 'Annual income must be positive').optional(),
  visa_status: z.string().optional(),
  lead_source: z.enum(['WEBSITE', 'REFERRAL', 'ADVERTISEMENT', 'SOCIAL_MEDIA', 'OTHER']).optional(),
  booking_type: z.enum(['LEASE', 'SHORT_TERM', 'MONTH_TO_MONTH', 'CORPORATE']).default('LEASE'),

  // Housing Preferences
  budget_min: z.number().min(100, 'Minimum budget must be at least $100').max(10000, 'Budget seems unreasonably high'),
  budget_max: z.number().min(100, 'Maximum budget must be at least $100').max(10000, 'Budget seems unreasonably high'),
  preferred_move_in_date: z.string().min(1, 'Move-in date is required').refine((dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }, 'Move-in date must be today or in the future'),
  preferred_lease_term: z.number().min(1, 'Lease term must be at least 1 month').max(24, 'Lease term cannot exceed 24 months'),

  // Property Selection (Required for Tenant Creation)
  selected_room_id: z.string().min(1, 'Room selection is required for application'),
  selected_building_id: z.string().min(1, 'Building selection is required for application'),
  room_number: z.string().optional(),

  // Lease Information
  lease_start_date: z.string().optional(),
  lease_end_date: z.string().optional(),
  deposit_amount: z.number().min(0, 'Deposit amount must be positive').optional(),
  payment_status: z.enum(['PENDING', 'PAID', 'PARTIAL', 'OVERDUE']).default('PENDING'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'TERMINATED']).default('PENDING').optional(),

  // Additional Information
  special_requests: z.string().optional(),
  operator_id: z.number().optional(),

  // Lead-specific fields
  rooms_interested: z.array(z.string()).optional(),
  showing_dates: z.array(z.string()).optional(),
  planned_move_out: z.string().optional(),
  notes: z.string().optional(),
  lead_score: z.number().min(0).max(100).optional(),
  last_contacted: z.string().optional(),
  next_follow_up: z.string().optional(),

  // Room Preferences
  room_type: z.string().optional(),
  bathroom_type: z.string().optional(),
  floor_preference: z.string().optional(),
  view_preference: z.string().optional(),

  // Amenity Preferences
  amenity_wifi: z.boolean().default(false),
  amenity_laundry: z.boolean().default(false),
  amenity_parking: z.boolean().default(false),
  amenity_security: z.boolean().default(false),
  amenity_gym: z.boolean().default(false),
  amenity_common_area: z.boolean().default(false),
  amenity_rooftop: z.boolean().default(false),
  amenity_bike_storage: z.boolean().default(false),

  // Vehicle Information
  has_vehicles: z.boolean().default(false),
  vehicle_details: z.string().optional(),

  // Insurance Information
  has_renters_insurance: z.boolean().default(false),
  insurance_details: z.string().optional(),

  // Lifestyle Information
  pets: z.boolean().default(false),
  pet_details: z.string().optional(),
  smoking: z.boolean().default(false),
  additional_preferences: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

const steps = [
  { id: 'personal', title: 'Personal Info', description: 'Tell us about yourself' },
  { id: 'professional', title: 'Professional', description: 'Your work and income' },
  { id: 'housing', title: 'Housing Preferences', description: 'What you\'re looking for' },
  { id: 'property', title: 'Property Selection', description: 'Choose your room and building' },
  { id: 'documents', title: 'Documents', description: 'Upload required files' },
  { id: 'review', title: 'Review', description: 'Confirm your information' },
]

export function OnboardingForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const form = useForm<FormData>({
    // TODO: Fix Zod schema type compatibility
    // resolver: zodResolver(formSchema),
    defaultValues: {
      // Personal Information
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      preferred_communication: 'EMAIL',

      // Professional Information
      occupation: '',
      booking_type: 'LEASE',
      lead_source: 'WEBSITE',

      // Housing Preferences
      budget_min: 0,
      budget_max: 0,
      preferred_move_in_date: '',
      preferred_lease_term: 12,

      // Status and Payment
      payment_status: 'PENDING',
      status: 'PENDING',

      // Preferences and Features
      pets: false,
      smoking: false,
      has_vehicles: false,
      has_renters_insurance: false,

      // Amenities
      amenity_wifi: false,
      amenity_laundry: false,
      amenity_parking: false,
      amenity_security: false,
      amenity_gym: false,
      amenity_common_area: false,
      amenity_rooftop: false,
      amenity_bike_storage: false,

      // Arrays
      rooms_interested: [],
      showing_dates: [],
    },
  })

  // Initialize smart defaults
  useSmartDefaults({ form })

  const progress = ((currentStep + 1) / steps.length) * 100

  const validateCurrentStep = (): boolean => {
    const formData = form.getValues()

    switch (currentStep) {
      case 0: // Personal Info
        return !!(formData.firstName && formData.lastName && formData.email && formData.phone)
      case 1: // Professional Info
        return !!(formData.occupation)
      case 2: // Housing Preferences
        return !!(formData.budget_min > 0 && formData.budget_max > 0 && formData.preferred_move_in_date && formData.preferred_lease_term)
      case 3: // Property Selection
        return !!(formData.selected_room_id && formData.selected_building_id)
      case 4: // Documents
        return true // Documents are optional
      default:
        return true
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      if (validateCurrentStep()) {
        setCompletedSteps(prev => new Set([...prev, currentStep]))
        setCurrentStep(currentStep + 1)
      } else {
        alert('Please complete all required fields before proceeding.')
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      // Import API and form utils
      const { api } = await import('@/lib/api')
      const { generateTenantId, generateLeadId, validateTenantRequiredFields } = await import('@/lib/form-utils')

      // Generate IDs if not present
      if (!data.tenant_id) {
        data.tenant_id = generateTenantId()
      }
      if (!data.lead_id) {
        data.lead_id = generateLeadId()
      }

      // Auto-calculate lease dates if not set
      if (!data.lease_start_date && data.preferred_move_in_date) {
        data.lease_start_date = data.preferred_move_in_date
      }
      if (!data.lease_end_date && data.lease_start_date && data.preferred_lease_term) {
        const startDate = new Date(data.lease_start_date)
        const endDate = new Date(startDate)
        endDate.setMonth(endDate.getMonth() + data.preferred_lease_term)
        data.lease_end_date = endDate.toISOString().split('T')[0]
      }

      console.log('Submitting form data:', { ...data, documents: uploadedFiles })

      // Submit application
      const response = await api.submitApplication(data as any, uploadedFiles)

      if (response.success) {
        alert(`Application submitted successfully! ${response.message}`)
        // You could redirect to a success page here
        // router.push('/application-success')
      } else {
        throw new Error(response.error || 'Failed to submit application')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert(`Error submitting application: ${error instanceof Error ? error.message : 'Please try again.'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <PersonalInfoStep form={form} />
      case 1:
        return <ProfessionalInfoStep form={form} />
      case 2:
        return <HousingPreferencesStep form={form} />
      case 3:
        return <PropertySelectionStep form={form} />
      case 4:
        return <DocumentUploadStep uploadedFiles={uploadedFiles} setUploadedFiles={setUploadedFiles} />
      case 5:
        return <ReviewStep form={form} uploadedFiles={uploadedFiles} onEditStep={setCurrentStep} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
              <Home className="h-8 w-8 text-white" />
            </div>
            <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              HomeWiz
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Application
          </h1>
          <p className="text-gray-600">
            Step {currentStep + 1} of {steps.length}: {steps[currentStep].description}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      index < currentStep
                        ? 'bg-green-500 text-white'
                        : index === currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="text-xs mt-2 text-center max-w-20">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded-full transition-colors ${
                      index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Form Content */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">
              {steps[currentStep].title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Previous
                </Button>

                {currentStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="gradient"
                    loading={isSubmitting}
                    className="flex items-center"
                  >
                    Submit Application
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="gradient"
                    onClick={nextStep}
                    className="flex items-center"
                  >
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
