'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import RoomForm from '@/components/forms/RoomForm'
import TemplateSelector from '@/components/forms/TemplateSelector'
import TemplateSaveDialog from '@/components/forms/TemplateSaveDialog'
import FormGuidance from '@/components/forms/FormGuidance'
import { ValidationSummary } from '@/components/forms/EnhancedValidation'
import { useFormTemplates } from '@/hooks/useFormTemplates'
import { RoomFormData, FormTemplate, RecentSubmission } from '@/types'
import { showFormSuccessMessage } from '@/lib/error-handler'
import {
  LayoutTemplate,
  Sparkles,
  TestTube,
  CheckCircle,
  AlertCircle,
  Info,
  Lightbulb
} from 'lucide-react'

export default function TemplateDemoPage() {
  const [activeDemo, setActiveDemo] = useState<'templates' | 'validation' | 'guidance' | 'full-form'>('templates')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [demoFormData, setDemoFormData] = useState<RoomFormData>({
    room_number: 'Demo Room 101',
    building_id: 'demo-building-1',
    ready_to_rent: true,
    status: 'AVAILABLE',
    active_tenants: 0,
    maximum_people_in_room: 2,
    private_room_rent: 850,
    floor_number: 1,
    bed_count: 1,
    bathroom_type: 'Shared',
    bed_size: 'Queen',
    bed_type: 'Single',
    view: 'Garden',
    sq_footage: 250,
    mini_fridge: true,
    sink: false,
    bedding_provided: true,
    work_desk: true,
    work_chair: true,
    heating: true,
    air_conditioning: false,
    cable_tv: true,
    room_storage: 'Built-in Closet'
  })

  const {
    templates,
    recentSubmissions,
    saveTemplate,
    saveRecentSubmission
  } = useFormTemplates({ formType: 'room' })

  // Mock buildings data
  const mockBuildings = [
    { building_id: 'demo-building-1', building_name: 'Sunset Apartments' },
    { building_id: 'demo-building-2', building_name: 'Ocean View Residence' },
    { building_id: 'demo-building-3', building_name: 'Downtown Lofts' }
  ]

  // Mock validation errors for demo
  const mockErrors = {
    room_number: 'Room number is required',
    private_room_rent: 'Rent must be greater than $0'
  }

  const handleTemplateSelect = (template: FormTemplate) => {
    setDemoFormData(prev => ({ ...prev, ...template.data }))
  }

  const handleRecentSelect = (submission: RecentSubmission) => {
    setDemoFormData(prev => ({ ...prev, ...submission.data }))
  }

  const handleFormSubmit = async (data: RoomFormData) => {
    console.log('Demo form submitted:', data)
    
    // Save to recent submissions
    const preview = `${data.room_number} - ${data.bed_count} bed, ${data.bathroom_type}, $${data.private_room_rent}/month`
    await saveRecentSubmission(data, preview)
    
    showFormSuccessMessage('room', 'saved')
  }

  const createSampleTemplate = async () => {
    const sampleTemplate = {
      name: 'Standard Single Room',
      formType: 'room' as const,
      data: {
        ready_to_rent: true,
        status: 'AVAILABLE',
        maximum_people_in_room: 1,
        bed_count: 1,
        bathroom_type: 'Shared',
        bed_size: 'Twin',
        bed_type: 'Single',
        mini_fridge: true,
        work_desk: true,
        work_chair: true,
        heating: true,
        bedding_provided: true,
        private_room_rent: 750
      },
      description: 'Standard configuration for single occupancy rooms',
      tags: ['standard', 'single', 'shared-bathroom'],
      isDefault: true
    }

    await saveTemplate(sampleTemplate)
    alert('Sample template created!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <TestTube className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Form Templating System Demo
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the enhanced form system with templates, validation, and guidance features
          </p>
        </motion.div>

        {/* Demo Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-md">
            {[
              { id: 'templates', label: 'Templates', icon: LayoutTemplate },
              { id: 'validation', label: 'Validation', icon: AlertCircle },
              { id: 'guidance', label: 'Guidance', icon: Lightbulb },
              { id: 'full-form', label: 'Full Form', icon: CheckCircle }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveDemo(id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeDemo === id
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Demo Content */}
        <div className="space-y-6">
          {/* Templates Demo */}
          {activeDemo === 'templates' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <LayoutTemplate className="h-6 w-6 text-blue-500" />
                  Template Management Demo
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3">Template Selector</h3>
                    <TemplateSelector
                      formType="room"
                      onTemplateSelect={handleTemplateSelect}
                      onRecentSelect={handleRecentSelect}
                    />
                    
                    <div className="mt-4 space-y-2">
                      <Button onClick={createSampleTemplate} variant="outline" size="sm">
                        Create Sample Template
                      </Button>
                      <Button onClick={() => setShowSaveDialog(true)} variant="outline" size="sm">
                        Test Save Dialog
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Current Form Data Preview</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="text-xs text-gray-700 overflow-auto max-h-64">
                        {JSON.stringify(demoFormData, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Template Features
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Save form configurations as reusable templates</li>
                    <li>• Quick access to recent submissions (last 5)</li>
                    <li>• Smart template naming and tagging</li>
                    <li>• Default templates for common configurations</li>
                    <li>• Template usage tracking and statistics</li>
                  </ul>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Validation Demo */}
          {activeDemo === 'validation' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="h-6 w-6 text-red-500" />
                  Enhanced Validation Demo
                </h2>
                
                <ValidationSummary
                  errors={mockErrors}
                  warnings={{ room_storage: 'Consider adding more storage options' }}
                />

                <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                  <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Validation Features
                  </h4>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• Real-time field validation with debouncing</li>
                    <li>• Inline error messages with helpful icons</li>
                    <li>• Validation summary with grouped messages</li>
                    <li>• Warning messages for best practices</li>
                    <li>• Success indicators for valid fields</li>
                  </ul>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Guidance Demo */}
          {activeDemo === 'guidance' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <Lightbulb className="h-6 w-6 text-amber-500" />
                  Form Guidance Demo
                </h2>
                
                <FormGuidance
                  formType="room"
                  currentStep={0}
                  totalSteps={4}
                />

                <div className="mt-6 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Guidance Features
                  </h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• Step-by-step form guidance with progress tracking</li>
                    <li>• Contextual tips and best practices</li>
                    <li>• Time estimates for each section</li>
                    <li>• Examples and suggestions for form fields</li>
                    <li>• Interactive step navigation</li>
                  </ul>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Full Form Demo */}
          {activeDemo === 'full-form' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <RoomForm
                initialData={demoFormData}
                onSubmit={handleFormSubmit}
                buildings={mockBuildings}
              />
            </motion.div>
          )}
        </div>

        {/* Template Save Dialog */}
        <TemplateSaveDialog
          isOpen={showSaveDialog}
          onClose={() => setShowSaveDialog(false)}
          formType="room"
          formData={demoFormData}
          onSave={async (template) => {
            await saveTemplate(template)
            console.log('Template saved:', template.name)
          }}
        />
      </div>
    </div>
  )
}
