# Template Functionality Integration Guide

## Overview

The HomeWiz application already has a fully implemented template system that works seamlessly with the enhanced error handling. This guide shows how to use and integrate these features.

## 🎯 Available Template Features

### 1. Template Management
- **Save forms as templates** with custom names and tags
- **Browse template library** with search and filtering
- **Recent submissions** for quick access to previous entries
- **Default templates** for commonly used configurations
- **Usage tracking** to see most popular templates

### 2. Form Guidance System
- **Step-by-step guidance** through form sections
- **Contextual tips** and best practices
- **Time estimates** for completion
- **Interactive navigation** between sections

### 3. Enhanced Validation
- **Real-time validation** with debounced input
- **Inline error messages** next to fields
- **Validation summary** at form level
- **Success indicators** for valid fields

## 🚀 Quick Start

### Adding Templates to Any Form

```typescript
import { TemplateSelector, TemplateSaveDialog } from '@/components/forms'
import { useFormTemplates } from '@/hooks/useFormTemplates'

function MyForm() {
  const [formData, setFormData] = useState({})
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  
  const { saveTemplate, saveRecentSubmission } = useFormTemplates({ 
    formType: 'room' // or 'operator', 'building', 'tenant', 'lead'
  })

  const handleTemplateSelect = (template) => {
    setFormData(prev => ({ ...prev, ...template.data }))
    // Show success message
    showSuccessMessage('Template Loaded', `Applied template: ${template.name}`)
  }

  const handleRecentSelect = (submission) => {
    setFormData(prev => ({ ...prev, ...submission.data }))
    showInfoMessage('Recent Data Loaded', 'Previous submission data applied')
  }

  const handleSaveTemplate = async (templateData) => {
    try {
      await saveTemplate(templateData)
      showSuccessMessage('Template Saved', `Template "${templateData.name}" saved successfully`)
    } catch (error) {
      handleFormSubmissionError(error, { additionalInfo: { operation: 'save_template' } })
    }
  }

  const handleSubmit = async (data) => {
    try {
      await onSubmit(data)
      // Save to recent submissions
      await saveRecentSubmission(data, generatePreview(data))
      showFormSuccessMessage('room', 'saved')
    } catch (error) {
      handleFormSubmissionError(error)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Template Selector */}
      <TemplateSelector
        formType="room"
        onTemplateSelect={handleTemplateSelect}
        onRecentSelect={handleRecentSelect}
      />

      {/* Form fields */}
      <div className="space-y-4">
        {/* Your form inputs */}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button type="submit">Save Room</Button>
        <Button 
          type="button" 
          variant="outline"
          onClick={() => setShowSaveDialog(true)}
        >
          Save as Template
        </Button>
      </div>

      {/* Save Template Dialog */}
      <TemplateSaveDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        formType="room"
        formData={formData}
        onSave={handleSaveTemplate}
      />
    </form>
  )
}
```

### Adding Form Guidance

```typescript
import { FormGuidance } from '@/components/forms'

function GuidedForm() {
  const [currentStep, setCurrentStep] = useState(0)

  return (
    <div>
      <FormGuidance
        formType="room"
        currentStep={currentStep}
        totalSteps={4}
        onStepClick={setCurrentStep}
      />
      
      {/* Form content based on current step */}
      {currentStep === 0 && <BasicInfoSection />}
      {currentStep === 1 && <RoomDetailsSection />}
      {currentStep === 2 && <PricingSection />}
      {currentStep === 3 && <ReviewSection />}
    </div>
  )
}
```

## 🎨 Template Features in Action

### 1. Template Selector Features
- **Search templates** by name or tags
- **Filter by type** (default vs user templates)
- **Recent submissions** with timestamps
- **Usage statistics** showing most used templates
- **Quick actions** to load or delete templates

### 2. Save Template Dialog Features
- **Smart name suggestions** based on form content
- **Tag management** for organization
- **Description field** for template details
- **Default template** marking
- **Validation** to ensure required fields

### 3. Form Guidance Features
- **Progress tracking** through form sections
- **Contextual tips** for each section
- **Time estimates** for completion
- **Examples** for complex fields
- **Best practices** and recommendations

## 📍 Demo and Testing

### Template Demo Page
Visit `/forms/template-demo` to see all template features:
- Create and save templates
- Browse template library
- Test form guidance
- See validation in action

### Error Handling Demo
Visit `/error-handling-demo` to see enhanced error handling:
- Different error types
- Loading states
- Success messages
- Recovery mechanisms

## 🔧 Integration with Enhanced Error Handling

The template system now works seamlessly with the enhanced error handling:

```typescript
// Template operations with error handling
const handleTemplateOperation = async (operation) => {
  try {
    setIsLoading(true)
    await operation()
    showSuccessMessage('Success', 'Template operation completed')
  } catch (error) {
    handleFormSubmissionError(error, {
      additionalInfo: { operation: 'template_management' }
    })
  } finally {
    setIsLoading(false)
  }
}

// Form submission with template saving
const handleSubmitWithTemplate = async (formData) => {
  return ErrorRecovery.withRetry(
    async () => {
      // Submit form
      const result = await submitForm(formData)
      
      // Save to recent submissions
      await saveRecentSubmission(formData, generatePreview(formData))
      
      return result
    },
    { maxAttempts: 3 },
    { operation: 'form_submit_with_template' }
  )
}
```

## 📊 Template Data Structure

### Template Object
```typescript
interface FormTemplate {
  id: string
  name: string
  formType: 'operator' | 'building' | 'room' | 'tenant' | 'lead'
  data: any
  createdAt: string
  lastUsed?: string
  useCount: number
  isDefault?: boolean
  tags?: string[]
  description?: string
}
```

### Recent Submission Object
```typescript
interface RecentSubmission {
  id: string
  formType: 'operator' | 'building' | 'room' | 'tenant' | 'lead'
  data: any
  submittedAt: string
  preview: string
}
```

## 🎯 Best Practices

### 1. Template Naming
- Use descriptive names: "Studio Apartment - Downtown"
- Include key characteristics: "2BR Shared - Students"
- Add location info: "Building A - Standard Room"

### 2. Tag Organization
- Use consistent tags: "student", "professional", "luxury"
- Include building/location tags: "downtown", "campus"
- Add feature tags: "furnished", "utilities-included"

### 3. Error Handling Integration
- Always wrap template operations in try-catch
- Use appropriate error types for different failures
- Provide recovery actions for failed operations
- Show loading states during template operations

## 🚀 Advanced Features

### 1. Template Import/Export
```typescript
const { exportTemplates, importTemplates } = useFormTemplates({ formType: 'room' })

// Export templates
const exportData = await exportTemplates()
downloadFile(exportData, 'room-templates.json')

// Import templates
await importTemplates(jsonData)
```

### 2. Bulk Operations
```typescript
// Delete multiple templates
await deleteTemplates(['template1', 'template2'])

// Update template tags
await updateTemplateTags('templateId', ['new-tag', 'updated'])
```

### 3. Template Analytics
```typescript
// Get template usage statistics
const stats = getTemplateStats()
console.log('Most used template:', stats.mostUsed)
console.log('Recent activity:', stats.recentActivity)
```

## 📝 Summary

The template functionality is fully implemented and ready to use! It includes:

✅ **Template Management** - Save, load, organize templates
✅ **Recent Submissions** - Quick access to previous entries  
✅ **Form Guidance** - Step-by-step help and tips
✅ **Enhanced Validation** - Real-time feedback
✅ **Error Integration** - Works with enhanced error handling
✅ **Demo Pages** - Full examples and testing

Simply import the components and hooks to add template functionality to any form!
