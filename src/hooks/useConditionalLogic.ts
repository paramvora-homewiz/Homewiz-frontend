import { useMemo, useCallback } from 'react'

export interface Condition {
  field: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains' | 'in' | 'not_in' | 'exists' | 'not_exists'
  value?: any
  values?: any[]
}

export interface ConditionalRule {
  conditions: Condition[]
  logic?: 'AND' | 'OR'
  action: {
    type: 'show' | 'hide' | 'enable' | 'disable' | 'require' | 'optional' | 'set_value' | 'clear_value'
    target: string | string[]
    value?: any
  }
}

export interface ConditionalLogicConfig {
  rules: ConditionalRule[]
}

export function useConditionalLogic<T extends Record<string, any>>(
  formData: T,
  config: ConditionalLogicConfig
) {
  // Evaluate a single condition
  const evaluateCondition = useCallback((condition: Condition, data: T): boolean => {
    const fieldValue = data[condition.field]
    
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value
      
      case 'not_equals':
        return fieldValue !== condition.value
      
      case 'greater_than':
        return typeof fieldValue === 'number' && fieldValue > condition.value
      
      case 'less_than':
        return typeof fieldValue === 'number' && fieldValue < condition.value
      
      case 'contains':
        return typeof fieldValue === 'string' && fieldValue.includes(condition.value)
      
      case 'not_contains':
        return typeof fieldValue === 'string' && !fieldValue.includes(condition.value)
      
      case 'in':
        return condition.values?.includes(fieldValue) || false
      
      case 'not_in':
        return !condition.values?.includes(fieldValue)
      
      case 'exists':
        return fieldValue !== null && fieldValue !== undefined && fieldValue !== ''
      
      case 'not_exists':
        return fieldValue === null || fieldValue === undefined || fieldValue === ''
      
      default:
        return false
    }
  }, [])

  // Evaluate all conditions for a rule
  const evaluateRule = useCallback((rule: ConditionalRule, data: T): boolean => {
    const { conditions, logic = 'AND' } = rule
    
    if (conditions.length === 0) return false
    
    if (logic === 'AND') {
      return conditions.every(condition => evaluateCondition(condition, data))
    } else {
      return conditions.some(condition => evaluateCondition(condition, data))
    }
  }, [evaluateCondition])

  // Get field states based on conditional logic
  const fieldStates = useMemo(() => {
    const states: Record<string, {
      visible: boolean
      enabled: boolean
      required: boolean
      value?: any
      shouldClear?: boolean
    }> = {}

    // Initialize all possible fields with default states
    const allFields = new Set<string>()
    config.rules.forEach(rule => {
      rule.conditions.forEach(condition => allFields.add(condition.field))
      const targets = Array.isArray(rule.action.target) ? rule.action.target : [rule.action.target]
      targets.forEach(target => allFields.add(target))
    })

    allFields.forEach(field => {
      states[field] = {
        visible: true,
        enabled: true,
        required: false
      }
    })

    // Apply rules
    config.rules.forEach(rule => {
      if (evaluateRule(rule, formData)) {
        const targets = Array.isArray(rule.action.target) ? rule.action.target : [rule.action.target]
        
        targets.forEach(target => {
          if (!states[target]) {
            states[target] = {
              visible: true,
              enabled: true,
              required: false
            }
          }

          switch (rule.action.type) {
            case 'show':
              states[target].visible = true
              break
            
            case 'hide':
              states[target].visible = false
              break
            
            case 'enable':
              states[target].enabled = true
              break
            
            case 'disable':
              states[target].enabled = false
              break
            
            case 'require':
              states[target].required = true
              break
            
            case 'optional':
              states[target].required = false
              break
            
            case 'set_value':
              states[target].value = rule.action.value
              break
            
            case 'clear_value':
              states[target].shouldClear = true
              break
          }
        })
      }
    })

    return states
  }, [formData, config.rules, evaluateRule])

  // Get state for a specific field
  const getFieldState = useCallback((fieldName: string) => {
    return fieldStates[fieldName] || {
      visible: true,
      enabled: true,
      required: false
    }
  }, [fieldStates])

  // Check if field should be visible
  const isFieldVisible = useCallback((fieldName: string): boolean => {
    return getFieldState(fieldName).visible
  }, [getFieldState])

  // Check if field should be enabled
  const isFieldEnabled = useCallback((fieldName: string): boolean => {
    return getFieldState(fieldName).enabled
  }, [getFieldState])

  // Check if field is required
  const isFieldRequired = useCallback((fieldName: string): boolean => {
    return getFieldState(fieldName).required
  }, [getFieldState])

  // Get suggested value for field
  const getFieldValue = useCallback((fieldName: string): any => {
    return getFieldState(fieldName).value
  }, [getFieldState])

  // Check if field should be cleared
  const shouldClearField = useCallback((fieldName: string): boolean => {
    return getFieldState(fieldName).shouldClear || false
  }, [getFieldState])

  // Get all fields that should be cleared
  const getFieldsToClear = useCallback((): string[] => {
    return Object.entries(fieldStates)
      .filter(([_, state]) => state.shouldClear)
      .map(([fieldName]) => fieldName)
  }, [fieldStates])

  // Get all hidden fields
  const getHiddenFields = useCallback((): string[] => {
    return Object.entries(fieldStates)
      .filter(([_, state]) => !state.visible)
      .map(([fieldName]) => fieldName)
  }, [fieldStates])

  // Get all disabled fields
  const getDisabledFields = useCallback((): string[] => {
    return Object.entries(fieldStates)
      .filter(([_, state]) => !state.enabled)
      .map(([fieldName]) => fieldName)
  }, [fieldStates])

  // Get all required fields
  const getRequiredFields = useCallback((): string[] => {
    return Object.entries(fieldStates)
      .filter(([_, state]) => state.required)
      .map(([fieldName]) => fieldName)
  }, [fieldStates])

  return {
    fieldStates,
    getFieldState,
    isFieldVisible,
    isFieldEnabled,
    isFieldRequired,
    getFieldValue,
    shouldClearField,
    getFieldsToClear,
    getHiddenFields,
    getDisabledFields,
    getRequiredFields
  }
}

// Predefined common conditional logic patterns
export const CommonConditionalPatterns = {
  // Show field when another field has specific value
  showWhenEquals: (triggerField: string, value: any, targetField: string): ConditionalRule => ({
    conditions: [{ field: triggerField, operator: 'equals', value }],
    action: { type: 'show', target: targetField }
  }),

  // Hide field when another field is empty
  hideWhenEmpty: (triggerField: string, targetField: string): ConditionalRule => ({
    conditions: [{ field: triggerField, operator: 'not_exists' }],
    action: { type: 'hide', target: targetField }
  }),

  // Require field when another field has value
  requireWhenExists: (triggerField: string, targetField: string): ConditionalRule => ({
    conditions: [{ field: triggerField, operator: 'exists' }],
    action: { type: 'require', target: targetField }
  }),

  // Set value when condition is met
  setValueWhen: (triggerField: string, triggerValue: any, targetField: string, setValue: any): ConditionalRule => ({
    conditions: [{ field: triggerField, operator: 'equals', value: triggerValue }],
    action: { type: 'set_value', target: targetField, value: setValue }
  })
}
