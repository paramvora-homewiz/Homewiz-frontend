'use client'

import { useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useFormStepNavigation } from '@/hooks/useFormStepNavigation'
import { Home, User, Mail, Phone, Briefcase, DollarSign, Upload, CheckCircle } from 'lucide-react'
import { showSuccessMessage } from '@/lib/error-handler'

function SimplePageContent() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    occupation: '',
    budget: ''
  })

  const steps = [
    { title: 'Personal Info', icon: User },
    { title: 'Professional', icon: Briefcase },
    { title: 'Budget', icon: DollarSign },
    { title: 'Complete', icon: CheckCircle }
  ]

  // Use form step navigation hook
  const { currentStep, nextStep, prevStep, canGoNext, canGoPrev } = useFormStepNavigation({
    totalSteps: steps.length
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
              <Home className="h-8 w-8 text-white" />
            </div>
            <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              HomeWiz
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to HomeWiz! 🏠
          </h1>
          <p className="text-gray-600">
            Your amazing rental application form is working perfectly!
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step, index) => (
              <div key={step.title} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    index <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  <step.icon className="h-5 w-5" />
                </div>
                <span className="text-xs mt-2 text-center">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl">
              {steps[currentStep].title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 0 && (
                <div className="space-y-4">
                  <Input
                    label="First Name"
                    placeholder="Enter your first name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    icon={<User className="h-4 w-4" />}
                  />
                  <Input
                    label="Last Name"
                    placeholder="Enter your last name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    icon={<User className="h-4 w-4" />}
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    icon={<Mail className="h-4 w-4" />}
                  />
                  <Input
                    label="Phone"
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    icon={<Phone className="h-4 w-4" />}
                  />
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <Input
                    label="Occupation"
                    placeholder="e.g., Software Engineer"
                    value={formData.occupation}
                    onChange={(e) => handleInputChange('occupation', e.target.value)}
                    icon={<Briefcase className="h-4 w-4" />}
                  />
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-700">
                      💡 <strong>Smart Feature:</strong> In the full version, this field provides auto-suggestions based on your input!
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <Input
                    label="Monthly Budget"
                    placeholder="e.g., 2500"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    icon={<DollarSign className="h-4 w-4" />}
                  />
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-700">
                      🎯 <strong>Smart Feature:</strong> The full version calculates budget suggestions based on your income!
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    🎉 Congratulations!
                  </h3>
                  <p className="text-gray-600">
                    You've successfully tested the HomeWiz application form!
                  </p>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">✨ Full Version Features:</h4>
                    <ul className="text-sm text-blue-700 space-y-1 text-left">
                      <li>• Drag & drop document upload</li>
                      <li>• Smart auto-complete suggestions</li>
                      <li>• Phone number auto-formatting</li>
                      <li>• Budget calculations</li>
                      <li>• File compression & preview</li>
                      <li>• Role-based access control</li>
                      <li>• Real-time validation</li>
                      <li>• Mobile-responsive design</li>
                    </ul>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Navigation */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={!canGoPrev}
              >
                Previous
              </Button>
              
              {canGoNext ? (
                <Button
                  variant="gradient"
                  onClick={nextStep}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="gradient"
                  onClick={() => showSuccessMessage('Demo Completed!', '🎉 The full version would submit to your backend.', { duration: 4000 })}
                >
                  Complete Demo
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Features Showcase */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="text-center p-4">
            <Upload className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-semibold">File Upload</h4>
            <p className="text-sm text-gray-600">Drag & drop with compression</p>
          </Card>
          <Card className="text-center p-4">
            <Briefcase className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-semibold">Smart Suggestions</h4>
            <p className="text-sm text-gray-600">Auto-complete for faster input</p>
          </Card>
          <Card className="text-center p-4">
            <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-semibold">Real-time Validation</h4>
            <p className="text-sm text-gray-600">Instant feedback & help</p>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function SimplePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading form...</p>
        </div>
      </div>
    }>
      <SimplePageContent />
    </Suspense>
  )
}
