// Form Components
export { default as OperatorForm } from './OperatorForm'
export { default as BuildingForm } from './BuildingForm'
// Legacy RoomForm for editing - exports as RoomForm for backward compatibility
export { default as RoomForm, NewRoomForm, SimpleRoomForm } from './RoomFormLegacy'
// New RoomPoCForm for creating rooms with bed configuration
export { default as RoomPoCForm } from './RoomPoCForm'
export { default as TenantForm } from './TenantForm'
export { default as LeadForm } from './LeadForm'

// Dashboard and Navigation
export { default as FormsDashboard } from './FormsDashboard'

// Template Management Components
export { default as TemplateSelector } from './TemplateSelector'
export { default as TemplateSaveDialog } from './TemplateSaveDialog'

// Enhanced Form Components
export { default as EnhancedValidation, InlineValidation, ValidationSummary } from './EnhancedValidation'
export { default as FormGuidance, HelpTooltip } from './FormGuidance'

// Data Provider and Utilities
export { 
  FormDataProvider, 
  useFormData, 
  withFormData, 
  FormDataLoader, 
  SmartSelect,
  // Compatibility exports (deprecated - use FormDataProvider with config instead)
  SimpleFormDataProvider,
  useSimpleFormData
} from './FormDataProvider'

// Test Suite
export { default as FormsTestSuite } from './FormsTestSuite'

// Form validation utilities - commented out to avoid circular dependency during build
// export * from '../../lib/form-validation'
