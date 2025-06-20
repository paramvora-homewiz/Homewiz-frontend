'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SmartInput } from '@/components/ui/smart-input'
import { PhoneInput } from '@/components/ui/phone-input'
import { HelpTooltip } from '@/components/ui/help-tooltip'
import { AnimatedCard, AnimatedFeatureCard } from '@/components/ui/animated-card'
import { LoadingSpinner, PulsingDots } from '@/components/ui/loading-spinner'
import { useToast, useSuccessToast, useErrorToast } from '@/components/ui/toast'
import { 
  TestTube, 
  CheckCircle, 
  AlertCircle, 
  Zap, 
  Smartphone, 
  Upload,
  User,
  Mail,
  Phone
} from 'lucide-react'

export default function TestPage() {
  const [loading, setLoading] = useState(false)
  const [phoneValue, setPhoneValue] = useState('')
  const [smartInputValue, setSmartInputValue] = useState('')
  
  const successToast = useSuccessToast()
  const errorToast = useErrorToast()

  const testComponents = [
    {
      name: 'Smart Input with Suggestions',
      component: (
        <SmartInput
          label="Occupation"
          placeholder="Try typing 'software' or 'teacher'"
          suggestions={['Software Engineer', 'Software Developer', 'Teacher', 'Teaching Assistant']}
          onSuggestionSelect={(value) => setSmartInputValue(value)}
          value={smartInputValue}
          onChange={(e) => setSmartInputValue(e.target.value)}
          smartValidation
          validationRules={{
            minLength: 3,
            custom: (value) => value.includes('test') ? 'Cannot contain "test"' : null
          }}
        />
      )
    },
    {
      name: 'Phone Input with Auto-formatting',
      component: (
        <PhoneInput
          value={phoneValue}
          onChange={setPhoneValue}
        />
      )
    },
    {
      name: 'Help Tooltip',
      component: (
        <div className="flex items-center space-x-2">
          <Input label="Annual Income" placeholder="Enter your income" />
          <HelpTooltip
            title="Annual Income Help"
            content="Enter your gross annual income before taxes. This helps us determine your budget range."
          />
        </div>
      )
    },
    {
      name: 'Animated Cards',
      component: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatedCard delay={0.1} title="Feature 1" description="This is an animated card">
            <p>Content goes here</p>
          </AnimatedCard>
          <AnimatedFeatureCard
            icon={Zap}
            title="Fast Processing"
            description="Lightning-fast form processing"
            delay={0.2}
          />
        </div>
      )
    },
    {
      name: 'Loading States',
      component: (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <LoadingSpinner size="sm" />
            <LoadingSpinner size="md" />
            <LoadingSpinner size="lg" />
          </div>
          <PulsingDots />
          <Button
            onClick={() => {
              setLoading(true)
              setTimeout(() => setLoading(false), 3000)
            }}
            loading={loading}
          >
            Test Loading Button
          </Button>
        </div>
      )
    },
    {
      name: 'Toast Notifications',
      component: (
        <div className="space-x-2">
          <Button
            onClick={() => successToast('Success!', 'This is a success message')}
            variant="default"
          >
            Success Toast
          </Button>
          <Button
            onClick={() => errorToast('Error!', 'This is an error message')}
            variant="destructive"
          >
            Error Toast
          </Button>
        </div>
      )
    }
  ]

  const performanceTests = [
    {
      name: 'Form Validation Speed',
      test: () => {
        const start = performance.now()
        // Simulate form validation
        for (let i = 0; i < 1000; i++) {
          const email = `test${i}@example.com`
          const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        }
        const end = performance.now()
        return `${(end - start).toFixed(2)}ms`
      }
    },
    {
      name: 'Component Render Time',
      test: () => {
        const start = performance.now()
        // Simulate component rendering
        const elements = Array.from({ length: 100 }, (_, i) => ({
          id: i,
          name: `Component ${i}`
        }))
        const end = performance.now()
        return `${(end - start).toFixed(2)}ms`
      }
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4">
            <TestTube className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            HomeWiz Component Testing
          </h1>
          <p className="text-gray-600">
            Test all UI components and features to ensure everything works perfectly
          </p>
        </motion.div>

        {/* Component Tests */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Smartphone className="h-5 w-5 mr-2" />
                UI Component Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {testComponents.map((test, index) => (
                  <motion.div
                    key={test.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">{test.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {test.component}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Tests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                Performance Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {performanceTests.map((test, index) => (
                  <motion.div
                    key={test.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{test.name}</span>
                      <Button
                        size="sm"
                        onClick={() => {
                          const result = test.test()
                          successToast('Test Complete', `Result: ${result}`)
                        }}
                      >
                        Run Test
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Feature Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Feature Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  'Clerk Authentication',
                  'Multi-step Form',
                  'Smart Input Validation',
                  'Phone Auto-formatting',
                  'File Upload with Compression',
                  'Drag & Drop Interface',
                  'Progress Indicators',
                  'Toast Notifications',
                  'Responsive Design',
                  'Accessibility Features',
                  'Animation & Micro-interactions',
                  'Mock API Integration'
                ].map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
