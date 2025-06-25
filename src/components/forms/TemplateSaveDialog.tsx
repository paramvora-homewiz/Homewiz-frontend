'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { EnhancedCard, EnhancedInput } from '@/components/ui/enhanced-components'
import { FormTemplate, TemplateSaveDialogProps } from '@/types'
import {
  Save,
  X,
  Tag,
  Star,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Plus
} from 'lucide-react'

export default function TemplateSaveDialog({
  isOpen,
  onClose,
  formType,
  formData,
  onSave
}: TemplateSaveDialogProps) {
  const [templateName, setTemplateName] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  // Generate smart template name suggestions
  const generateSmartName = () => {
    const suggestions = []
    
    switch (formType) {
      case 'building':
        if (formData.building_name) {
          suggestions.push(`${formData.building_name} Template`)
        }
        if (formData.total_rooms) {
          suggestions.push(`${formData.total_rooms}-Room Building`)
        }
        if (formData.building_type) {
          suggestions.push(`${formData.building_type} Template`)
        }
        break
        
      case 'room':
        if (formData.room_number) {
          suggestions.push(`Room ${formData.room_number} Template`)
        }
        if (formData.bathroom_type && formData.bed_count) {
          suggestions.push(`${formData.bed_count}-Bed ${formData.bathroom_type} Room`)
        }
        if (formData.private_room_rent) {
          const rentRange = formData.private_room_rent < 800 ? 'Budget' : 
                           formData.private_room_rent < 1200 ? 'Standard' : 'Premium'
          suggestions.push(`${rentRange} Room Template`)
        }
        break
        
      case 'tenant':
        if (formData.tenant_name) {
          suggestions.push(`${formData.tenant_name} Profile`)
        }
        if (formData.booking_type) {
          suggestions.push(`${formData.booking_type} Tenant`)
        }
        break
        
      case 'operator':
        if (formData.name) {
          suggestions.push(`${formData.name} Profile`)
        }
        if (formData.operator_type) {
          suggestions.push(`${formData.operator_type} Template`)
        }
        break
        
      case 'lead':
        if (formData.lead_source) {
          suggestions.push(`${formData.lead_source} Lead`)
        }
        if (formData.budget_min && formData.budget_max) {
          suggestions.push(`$${formData.budget_min}-${formData.budget_max} Lead`)
        }
        break
    }
    
    return suggestions.length > 0 ? suggestions[0] : `${formType.charAt(0).toUpperCase() + formType.slice(1)} Template`
  }

  // Generate smart tags based on form data
  const generateSmartTags = () => {
    const smartTags = []
    
    switch (formType) {
      case 'building':
        if (formData.building_type) smartTags.push(formData.building_type.toLowerCase())
        if (formData.total_rooms) {
          if (formData.total_rooms <= 10) smartTags.push('small')
          else if (formData.total_rooms <= 25) smartTags.push('medium')
          else smartTags.push('large')
        }
        if (formData.wifi_included) smartTags.push('wifi')
        if (formData.laundry_onsite) smartTags.push('laundry')
        if (formData.secure_access) smartTags.push('secure')
        break
        
      case 'room':
        if (formData.bathroom_type) smartTags.push(formData.bathroom_type.toLowerCase())
        if (formData.bed_count === 1) smartTags.push('single')
        else if (formData.bed_count === 2) smartTags.push('double')
        if (formData.private_room_rent) {
          if (formData.private_room_rent < 800) smartTags.push('budget')
          else if (formData.private_room_rent < 1200) smartTags.push('standard')
          else smartTags.push('premium')
        }
        break
        
      case 'tenant':
        if (formData.booking_type) smartTags.push(formData.booking_type.toLowerCase())
        if (formData.has_pets) smartTags.push('pets')
        if (formData.has_vehicles) smartTags.push('vehicle')
        break
        
      case 'operator':
        if (formData.operator_type) smartTags.push(formData.operator_type.toLowerCase())
        if (formData.emergency_contact) smartTags.push('emergency')
        break
        
      case 'lead':
        if (formData.lead_source) smartTags.push(formData.lead_source.toLowerCase())
        if (formData.visa_status) smartTags.push(formData.visa_status.toLowerCase())
        break
    }
    
    return smartTags.slice(0, 5) // Limit to 5 smart tags
  }

  // Initialize with smart suggestions
  useEffect(() => {
    if (isOpen && !templateName) {
      setTemplateName(generateSmartName())
      setTags(generateSmartTags())
    }
  }, [isOpen, formType, formData])

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setTemplateName('')
      setDescription('')
      setTags([])
      setNewTag('')
      setIsDefault(false)
      setErrors({})
      setIsSaving(false)
    }
  }, [isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!templateName.trim()) {
      newErrors.name = 'Template name is required'
    } else if (templateName.length < 3) {
      newErrors.name = 'Template name must be at least 3 characters'
    } else if (templateName.length > 50) {
      newErrors.name = 'Template name must be less than 50 characters'
    }
    
    if (description && description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase()) && tags.length < 10) {
      setTags([...tags, newTag.trim().toLowerCase()])
      setNewTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (newTag.trim()) {
        handleAddTag()
      } else {
        handleSave()
      }
    }
  }

  const handleSave = async () => {
    if (!validateForm()) return
    
    setIsSaving(true)
    
    try {
      const template: Omit<FormTemplate, 'id' | 'createdAt' | 'useCount'> = {
        name: templateName.trim(),
        formType,
        data: formData,
        description: description.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
        isDefault
      }
      
      await onSave(template)
      onClose()
    } catch (error) {
      setErrors({ general: 'Failed to save template. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-md"
        >
          <EnhancedCard className="bg-white">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Save className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Save as Template</h2>
                    <p className="text-sm text-gray-600">
                      Save this {formType} form for future use
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {/* Template Name */}
                <div>
                  <EnhancedInput
                    label="Template Name"
                    placeholder="Enter a descriptive name"
                    value={templateName}
                    onChange={setTemplateName}
                    error={errors.name}
                    icon={<Sparkles className="h-4 w-4" />}
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description to help identify this template"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={3}
                    maxLength={200}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {description.length}/200 characters
                  </p>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (Optional)
                  </label>
                  
                  {/* Existing Tags */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="flex items-center gap-1 cursor-pointer hover:bg-gray-200"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  {/* Add New Tag */}
                  {tags.length < 10 && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddTag}
                        disabled={!newTag.trim() || tags.includes(newTag.trim().toLowerCase())}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-1">
                    Tags help organize and find templates quickly ({tags.length}/10)
                  </p>
                </div>

                {/* Default Template Option */}
                <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <label htmlFor="isDefault" className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-amber-500" />
                    <span className="font-medium text-amber-800">Make this a default template</span>
                  </label>
                </div>

                {/* Error Message */}
                {errors.general && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      {errors.general}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="flex-1"
                  disabled={isSaving || !templateName.trim()}
                >
                  {isSaving ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Save Template
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </EnhancedCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
