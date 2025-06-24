'use client'

import React, { useState, useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useFormData } from '@/components/forms/FormDataProvider'

interface BasicInformationStepProps {
  form: UseFormReturn<any>
}

// Building name suggestions from the image
const BUILDING_NAME_SUGGESTIONS = [
  'Sunset Apartments',
  'Downtown Lofts', 
  'Garden View Residences',
  'Metro Heights'
]

// Description templates
const DESCRIPTION_TEMPLATES = [
  {
    id: 1,
    label: 'Template 1',
    text: 'Modern apartment complex with excellent amenities and convenient location.'
  },
  {
    id: 2,
    label: 'Template 2', 
    text: 'Luxury residential building featuring state-of-the-art facilities and premium finishes.'
  },
  {
    id: 3,
    label: 'Template 3',
    text: 'Comfortable living spaces in a vibrant neighborhood with easy access to transportation.'
  },
  {
    id: 4,
    label: 'Template 4',
    text: 'Contemporary housing with modern design and comprehensive resident services.'
  },
  {
    id: 5,
    label: 'Template 5',
    text: 'Well-maintained property offering quality accommodations in a desirable area.'
  }
]

export function BasicInformationStep({ form }: BasicInformationStepProps) {
  const { register, watch, setValue, formState: { errors } } = form
  const { operators, operatorsLoading } = useFormData()
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)

  const buildingName = watch('building_name')
  const buildingDescription = watch('building_description')

  // Filter building name suggestions based on input
  useEffect(() => {
    if (buildingName && buildingName.length > 0) {
      const filtered = BUILDING_NAME_SUGGESTIONS.filter(suggestion =>
        suggestion.toLowerCase().includes(buildingName.toLowerCase())
      )
      setFilteredSuggestions(filtered)
      setShowSuggestions(filtered.length > 0 && buildingName !== '')
    } else {
      setFilteredSuggestions(BUILDING_NAME_SUGGESTIONS)
      setShowSuggestions(false)
    }
  }, [buildingName])

  const handleSuggestionClick = (suggestion: string) => {
    setValue('building_name', suggestion)
    setShowSuggestions(false)
  }

  const handleTemplateClick = (template: typeof DESCRIPTION_TEMPLATES[0]) => {
    setValue('building_description', template.text)
    setSelectedTemplate(template.id)
  }

  // Filter operators to get building managers and property managers
  const buildingManagers = operators.filter(op => 
    op.operator_type === 'BUILDING_MANAGER' && op.active
  )
  
  const propertyManagers = operators.filter(op => 
    op.operator_type === 'LEASING_AGENT' || op.operator_type === 'ADMIN'
  ).filter(op => op.active)

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          <span className="text-sm text-blue-600">Step 1 of 6</span>
        </div>
        
        <div className="space-y-4">
          {/* Building Name */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Building Name *
            </label>
            <Input
              {...register('building_name')}
              placeholder="Enter building name or select from suggestions"
              className={errors.building_name ? 'border-red-500' : ''}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {errors.building_name && (
              <p className="text-red-500 text-sm mt-1">Building name is required</p>
            )}
            
            {/* Building Name Suggestions */}
            {showSuggestions && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                {filteredSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
            
            {/* Quick suggestion badges */}
            <div className="flex flex-wrap gap-2 mt-2">
              {BUILDING_NAME_SUGGESTIONS.slice(0, 4).map((suggestion, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-blue-50 text-xs"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>

          {/* Building Manager and Property Manager */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Building Manager
              </label>
              <select
                {...register('building_manager_id')}
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled={operatorsLoading}
              >
                <option value="">Select a manager</option>
                {buildingManagers.map((manager) => (
                  <option key={manager.operator_id} value={manager.operator_id}>
                    {manager.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Property Manager
              </label>
              <select
                {...register('property_manager_id')}
                className="w-full p-2 border border-gray-300 rounded-md"
                disabled={operatorsLoading}
              >
                <option value="">Select property manager</option>
                {propertyManagers.map((manager) => (
                  <option key={manager.operator_id} value={manager.operator_id}>
                    {manager.name} ({manager.operator_type === 'ADMIN' ? 'Admin' : 'Leasing Agent'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Year Built */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year Built
            </label>
            <Input
              type="number"
              {...register('year_built')}
              placeholder="2020"
              min="1900"
              max={new Date().getFullYear()}
            />
          </div>

          {/* Building Available for Rent */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register('building_available_for_rent')}
              className="rounded"
              defaultChecked={true}
            />
            <label className="text-sm font-medium text-gray-700">
              Building Available for Rent
            </label>
          </div>

          {/* Building Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Building Description
            </label>
            
            {/* Quick Templates */}
            <div className="mb-2">
              <p className="text-xs text-gray-500 mb-2">Quick Templates:</p>
              <div className="flex flex-wrap gap-2">
                {DESCRIPTION_TEMPLATES.map((template) => (
                  <Badge
                    key={template.id}
                    variant={selectedTemplate === template.id ? "default" : "outline"}
                    className="cursor-pointer hover:bg-blue-50 text-xs"
                    onClick={() => handleTemplateClick(template)}
                  >
                    {template.label}
                  </Badge>
                ))}
              </div>
            </div>
            
            <textarea
              {...register('building_description')}
              placeholder="Describe the building, its character, and what makes it special..."
              className="w-full p-3 border border-gray-300 rounded-md"
              rows={4}
              value={buildingDescription || ''}
              onChange={(e) => {
                setValue('building_description', e.target.value)
                setSelectedTemplate(null)
              }}
            />
          </div>
        </div>
      </Card>
    </div>
  )
}
