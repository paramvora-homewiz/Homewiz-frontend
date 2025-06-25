# Multi-Page Form Template Integration Guide

## Overview

This guide shows how to integrate template functionality into multi-page forms, ensuring users can save and load templates while navigating through form steps.

## 🎯 Key Integration Points

### 1. Template Selector Placement
- **First Step**: Add template selector to the first step for immediate access
- **Prominent Position**: Place at the top of the first step with clear visual distinction
- **Context**: Provide helpful description about template benefits

### 2. Save Template Button
- **Navigation Area**: Add to form navigation for consistent access across steps
- **Visual Design**: Use distinctive styling to make it easily discoverable
- **State Management**: Ensure it works regardless of current step

### 3. Form Guidance Integration
- **Step Navigation**: Integrate with existing step indicators
- **Contextual Help**: Provide step-specific guidance and tips
- **Progress Tracking**: Show completion progress and time estimates

## 🚀 Implementation Example

### Step 1: Import Required Components

```typescript
import TemplateSelector from './TemplateSelector'
import TemplateSaveDialog from './TemplateSaveDialog'
import FormGuidance from './FormGuidance'
import { useFormTemplates } from '@/hooks/useFormTemplates'
import { showSuccessMessage, showInfoMessage, handleFormSubmissionError } from '@/lib/error-handler'
```

### Step 2: Set Up Template Management

```typescript
const [showTemplateSaveDialog, setShowTemplateSaveDialog] = useState(false)
const { saveRecentSubmission, saveTemplate } = useFormTemplates({ formType: 'room' })

// Template handlers with enhanced error handling
const handleTemplateSelect = (template: FormTemplate) => {
  setFormData(prev => ({
    ...prev,
    ...template.data,
    // Preserve important IDs
    room_id: prev.room_id,
    room_number: prev.room_number || template.data.room_number
  }))
  
  showSuccessMessage(
    'Template Applied',
    `Template "${template.name}" has been loaded successfully.`,
    {
      action: {
        label: 'View Details',
        onClick: () => console.log('Template details:', template)
      }
    }
  )
}

const handleRecentSelect = (submission: RecentSubmission) => {
  setFormData(prev => ({
    ...prev,
    ...submission.data,
    // Preserve important IDs
    room_id: prev.room_id,
    room_number: prev.room_number || submission.data.room_number
  }))
  
  showInfoMessage(
    'Previous Data Loaded',
    'Your previous submission data has been applied to the form.'
  )
}

const handleSaveTemplate = async (templateData: any) => {
  try {
    await saveTemplate(templateData)
    showSuccessMessage(
      'Template Saved',
      `Template "${templateData.name}" has been saved successfully.`,
      {
        action: {
          label: 'View Templates',
          onClick: () => console.log('Navigate to templates')
        }
      }
    )
  } catch (error) {
    handleFormSubmissionError(error, {
      additionalInfo: {
        operation: 'save_template',
        templateName: templateData.name
      }
    })
  }
}
```

### Step 3: Add Template Selector to First Step

```typescript
const FirstStep = () => (
  <motion.div
    key="first"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
    className="space-y-6"
  >
    {/* Template Selector */}
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <LayoutTemplate className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">Quick Start</h3>
          <p className="text-sm text-gray-600">
            Load a template or recent submission to get started faster
          </p>
        </div>
      </div>
      <TemplateSelector
        formType="room"
        onTemplateSelect={handleTemplateSelect}
        onRecentSelect={handleRecentSelect}
      />
    </Card>

    {/* Regular form content */}
    <Card className="p-6 premium-card bg-white/95 backdrop-blur-md shadow-lg">
      {/* Your form fields */}
    </Card>
  </motion.div>
)
```

### Step 4: Add Save Template Button to Navigation

```typescript
{/* Step Navigation */}
<div className="flex items-center justify-between pt-6 border-t bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
  <div className="flex items-center gap-3">
    {/* Previous/Back buttons */}
    {!isFirstStep && (
      <Button
        type="button"
        variant="outline"
        onClick={goToPreviousStep}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </Button>
    )}

    {/* Save as Template Button */}
    <Button
      type="button"
      variant="outline"
      onClick={() => setShowTemplateSaveDialog(true)}
      className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
    >
      <Bookmark className="w-4 h-4" />
      Save as Template
    </Button>
  </div>

  {/* Step indicator */}
  <div className="flex items-center gap-2 text-sm text-gray-600">
    Step {getCurrentStepIndex() + 1} of {FORM_STEPS.length}
  </div>

  {/* Next/Submit buttons */}
  <div className="flex items-center gap-3">
    {/* Next/Submit button logic */}
  </div>
</div>
```

### Step 5: Add Form Guidance

```typescript
{/* Form Guidance */}
<div className="mb-6">
  <FormGuidance
    formType="room"
    currentStep={getCurrentStepIndex()}
    totalSteps={FORM_STEPS.length}
    onStepClick={(stepIndex) => {
      if (stepIndex >= 0 && stepIndex < FORM_STEPS.length) {
        setCurrentStep(FORM_STEPS[stepIndex].id)
      }
    }}
  />
</div>
```

### Step 6: Add Template Save Dialog

```typescript
{/* Template Save Dialog */}
<TemplateSaveDialog
  isOpen={showTemplateSaveDialog}
  onClose={() => setShowTemplateSaveDialog(false)}
  formType="room"
  formData={formData}
  onSave={handleSaveTemplate}
/>
```

## 🎨 Design Considerations

### 1. Visual Hierarchy
- **Template Selector**: Use distinctive background color (blue gradient)
- **Save Button**: Use accent color to make it discoverable
- **Form Guidance**: Integrate seamlessly with step indicators

### 2. User Experience
- **First Step Placement**: Templates are most useful at the beginning
- **Persistent Access**: Save button available on all steps
- **Clear Feedback**: Success/error messages for all template operations

### 3. Data Preservation
- **ID Fields**: Always preserve important identifiers when loading templates
- **Current Progress**: Don't lose user's current step when loading templates
- **Validation State**: Clear errors when loading new template data

## 🔧 Best Practices

### 1. Template Loading
```typescript
// Always preserve critical IDs
const handleTemplateSelect = (template: FormTemplate) => {
  setFormData(prev => ({
    ...prev,
    ...template.data,
    // Preserve these fields
    id: prev.id,
    created_at: prev.created_at,
    updated_at: prev.updated_at
  }))
  
  // Clear validation errors
  setErrors({})
  
  // Show success feedback
  showSuccessMessage('Template Applied', `Loaded: ${template.name}`)
}
```

### 2. Template Saving
```typescript
// Include current step context
const handleSaveTemplate = async (templateData: any) => {
  try {
    // Add metadata about current form state
    const enrichedTemplate = {
      ...templateData,
      metadata: {
        currentStep: getCurrentStepIndex(),
        completedSteps: Array.from(completedSteps),
        savedAt: new Date().toISOString()
      }
    }
    
    await saveTemplate(enrichedTemplate)
    showSuccessMessage('Template Saved', `Saved: ${templateData.name}`)
  } catch (error) {
    handleFormSubmissionError(error, {
      additionalInfo: { operation: 'save_template' }
    })
  }
}
```

### 3. Form Guidance Integration
```typescript
// Sync with step navigation
const onStepClick = (stepIndex: number) => {
  // Validate current step before allowing navigation
  const currentStepValid = validateCurrentStep()
  
  if (currentStepValid || stepIndex < getCurrentStepIndex()) {
    setCurrentStep(FORM_STEPS[stepIndex].id)
  } else {
    showWarningMessage(
      'Complete Current Step',
      'Please complete the current step before proceeding.'
    )
  }
}
```

## 📱 Mobile Considerations

### 1. Responsive Design
- **Template Selector**: Stack vertically on mobile
- **Save Button**: Use icon-only version on small screens
- **Form Guidance**: Collapse to minimal view on mobile

### 2. Touch Interactions
- **Larger Touch Targets**: Ensure buttons are at least 44px
- **Swipe Navigation**: Consider adding swipe gestures for step navigation
- **Scroll Behavior**: Ensure template selector doesn't interfere with scrolling

## 🚀 Advanced Features

### 1. Auto-Save Templates
```typescript
// Auto-save as user progresses
useEffect(() => {
  const autoSaveTimer = setTimeout(() => {
    if (hasUnsavedChanges) {
      saveTemplate({
        name: `Auto-save ${new Date().toLocaleString()}`,
        data: formData,
        isAutoSave: true
      })
    }
  }, 30000) // Auto-save every 30 seconds

  return () => clearTimeout(autoSaveTimer)
}, [formData, hasUnsavedChanges])
```

### 2. Step-Specific Templates
```typescript
// Save templates for specific steps
const saveStepTemplate = async (stepId: string) => {
  const stepData = getStepData(stepId)
  await saveTemplate({
    name: `${stepId} Template`,
    data: stepData,
    stepSpecific: stepId
  })
}
```

This integration ensures that multi-page forms maintain all the powerful template functionality while providing an excellent user experience across all form steps.
