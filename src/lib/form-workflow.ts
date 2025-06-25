/**
 * Form Workflow Navigation System
 * Defines the proper sequence and navigation between forms
 */

export type FormType = 'operator' | 'building' | 'room' | 'tenant' | 'lead'

export interface FormWorkflowStep {
  id: FormType
  title: string
  path: string
  description: string
  dependencies?: FormType[]
}

/**
 * Defines the logical workflow sequence for forms
 * Each form depends on data from previous forms in the sequence
 */
export const FORM_WORKFLOW: FormWorkflowStep[] = [
  {
    id: 'operator',
    title: 'Operator Management',
    path: '/forms/operator',
    description: 'Manage property operators and staff',
    dependencies: []
  },
  {
    id: 'building',
    title: 'Building Configuration',
    path: '/forms/building',
    description: 'Configure building details and amenities',
    dependencies: ['operator']
  },
  {
    id: 'room',
    title: 'Room Setup',
    path: '/forms/room',
    description: 'Set up rooms and their amenities',
    dependencies: ['building']
  },
  {
    id: 'tenant',
    title: 'Tenant Management',
    path: '/forms/tenant',
    description: 'Manage tenant information and assignments',
    dependencies: ['building', 'room', 'operator']
  },
  {
    id: 'lead',
    title: 'Lead Tracking',
    path: '/forms/lead',
    description: 'Track prospective tenants and interests',
    dependencies: ['room']
  }
]

/**
 * Get the previous form in the workflow sequence
 */
export function getPreviousForm(currentForm: FormType): FormWorkflowStep | null {
  const currentIndex = FORM_WORKFLOW.findIndex(step => step.id === currentForm)
  if (currentIndex <= 0) return null
  return FORM_WORKFLOW[currentIndex - 1]
}

/**
 * Get the next form in the workflow sequence
 */
export function getNextForm(currentForm: FormType): FormWorkflowStep | null {
  const currentIndex = FORM_WORKFLOW.findIndex(step => step.id === currentForm)
  if (currentIndex === -1 || currentIndex >= FORM_WORKFLOW.length - 1) return null
  return FORM_WORKFLOW[currentIndex + 1]
}

/**
 * Get the current form step information
 */
export function getCurrentFormStep(currentForm: FormType): FormWorkflowStep | null {
  return FORM_WORKFLOW.find(step => step.id === currentForm) || null
}

/**
 * Get the proper back navigation URL for a form
 * Returns the previous form in the workflow, or the forms dashboard if at the beginning
 */
export function getBackNavigationUrl(currentForm: FormType): string {
  const previousForm = getPreviousForm(currentForm)
  return previousForm ? previousForm.path : '/forms'
}

/**
 * Get the proper forward navigation URL for a form
 * Returns the next form in the workflow, or the forms dashboard if at the end
 */
export function getForwardNavigationUrl(currentForm: FormType): string {
  const nextForm = getNextForm(currentForm)
  return nextForm ? nextForm.path : '/forms'
}

/**
 * Check if a form can be accessed based on its dependencies
 * This can be used to show/hide navigation options or validate access
 */
export function canAccessForm(formType: FormType, availableData: { [key in FormType]?: any[] }): boolean {
  const formStep = getCurrentFormStep(formType)
  if (!formStep || !formStep.dependencies) return true
  
  // Check if all dependencies have data
  return formStep.dependencies.every(dep => {
    const data = availableData[dep]
    return data && data.length > 0
  })
}

/**
 * Get workflow progress information
 */
export function getWorkflowProgress(currentForm: FormType): {
  currentStep: number
  totalSteps: number
  progress: number
  isFirst: boolean
  isLast: boolean
} {
  const currentIndex = FORM_WORKFLOW.findIndex(step => step.id === currentForm)
  const totalSteps = FORM_WORKFLOW.length
  
  return {
    currentStep: currentIndex + 1,
    totalSteps,
    progress: ((currentIndex + 1) / totalSteps) * 100,
    isFirst: currentIndex === 0,
    isLast: currentIndex === totalSteps - 1
  }
}

/**
 * Get all forms that can be accessed from the current form
 */
export function getAccessibleForms(currentForm: FormType, availableData: { [key in FormType]?: any[] }): FormWorkflowStep[] {
  return FORM_WORKFLOW.filter(step => canAccessForm(step.id, availableData))
}
