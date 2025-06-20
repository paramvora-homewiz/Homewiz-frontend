import { useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'

interface SmartDefaultsOptions {
  form: UseFormReturn<any>
}

export function useSmartDefaults({ form }: SmartDefaultsOptions) {
  const { watch, setValue, getValues } = form

  // Watch for changes that should trigger auto-calculations
  const preferred_move_in_date = watch('preferred_move_in_date')
  const preferred_lease_term = watch('preferred_lease_term')
  const annual_income = watch('annual_income')
  const occupation = watch('occupation')
  const nationality = watch('nationality')

  // Auto-calculate lease end date
  useEffect(() => {
    if (preferred_move_in_date && preferred_lease_term) {
      const startDate = new Date(preferred_move_in_date)
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + preferred_lease_term)
      
      const currentLeaseEndDate = getValues('lease_end_date')
      if (!currentLeaseEndDate) {
        setValue('lease_end_date', endDate.toISOString().split('T')[0])
      }
    }
  }, [preferred_move_in_date, preferred_lease_term, setValue, getValues])

  // Auto-calculate lease start date from move-in date
  useEffect(() => {
    if (preferred_move_in_date) {
      const currentLeaseStartDate = getValues('lease_start_date')
      if (!currentLeaseStartDate) {
        setValue('lease_start_date', preferred_move_in_date)
      }
    }
  }, [preferred_move_in_date, setValue, getValues])

  // Suggest budget based on income (30% rule)
  useEffect(() => {
    if (annual_income && annual_income > 0) {
      const monthlyIncome = annual_income / 12
      const suggestedMaxBudget = Math.round(monthlyIncome * 0.3)
      const suggestedMinBudget = Math.round(suggestedMaxBudget * 0.7)

      const currentBudgetMax = getValues('budget_max')
      const currentBudgetMin = getValues('budget_min')

      // Only set if user hasn't already set a budget
      if (!currentBudgetMax || currentBudgetMax === 0) {
        setValue('budget_max', suggestedMaxBudget)
      }
      if (!currentBudgetMin || currentBudgetMin === 0) {
        setValue('budget_min', suggestedMinBudget)
      }
    }
  }, [annual_income, setValue, getValues])

  // Set default move-in date to 30 days from now
  useEffect(() => {
    const currentMoveInDate = getValues('preferred_move_in_date')
    if (!currentMoveInDate) {
      const defaultDate = new Date()
      defaultDate.setDate(defaultDate.getDate() + 30)
      setValue('preferred_move_in_date', defaultDate.toISOString().split('T')[0])
    }
  }, [setValue, getValues])

  // Set visa status based on nationality
  useEffect(() => {
    if (nationality && !getValues('visa_status')) {
      const usNationalities = ['United States', 'US', 'USA', 'American']
      if (usNationalities.some(nat => nationality.toLowerCase().includes(nat.toLowerCase()))) {
        setValue('visa_status', 'US_CITIZEN')
      } else {
        // Don't auto-set for non-US, let user choose
      }
    }
  }, [nationality, setValue, getValues])

  // Set default communication preference based on form completion method
  useEffect(() => {
    const currentPreference = getValues('preferred_communication')
    if (!currentPreference || currentPreference === 'EMAIL') {
      // Default to email, but could be smart based on device/context
      setValue('preferred_communication', 'EMAIL')
    }
  }, [setValue, getValues])

  // Auto-suggest lead source
  useEffect(() => {
    const currentLeadSource = getValues('lead_source')
    if (!currentLeadSource) {
      // Default to website since they're filling out the form online
      setValue('lead_source', 'WEBSITE')
    }
  }, [setValue, getValues])

  return {
    // Helper functions for manual smart defaults
    calculateSuggestedBudget: (income: number) => {
      const monthlyIncome = income / 12
      return {
        min: Math.round(monthlyIncome * 0.2),
        max: Math.round(monthlyIncome * 0.3)
      }
    },
    
    calculateLeaseEndDate: (startDate: string, termMonths: number) => {
      const start = new Date(startDate)
      const end = new Date(start)
      end.setMonth(end.getMonth() + termMonths)
      return end.toISOString().split('T')[0]
    },
    
    getDefaultMoveInDate: (daysFromNow: number = 30) => {
      const date = new Date()
      date.setDate(date.getDate() + daysFromNow)
      return date.toISOString().split('T')[0]
    }
  }
}

// Hook for occupation-based suggestions
export function useOccupationSuggestions(occupation: string) {
  const getSalaryRange = (occ: string): { min: number; max: number } | null => {
    const occupationSalaries: Record<string, { min: number; max: number }> = {
      'software engineer': { min: 80000, max: 150000 },
      'data scientist': { min: 90000, max: 160000 },
      'product manager': { min: 100000, max: 180000 },
      'designer': { min: 60000, max: 120000 },
      'teacher': { min: 40000, max: 70000 },
      'nurse': { min: 60000, max: 90000 },
      'doctor': { min: 150000, max: 300000 },
      'lawyer': { min: 80000, max: 200000 },
      'consultant': { min: 70000, max: 150000 },
      'accountant': { min: 50000, max: 80000 },
      'marketing manager': { min: 60000, max: 120000 },
      'sales representative': { min: 40000, max: 100000 },
      'project manager': { min: 70000, max: 130000 },
      'research scientist': { min: 70000, max: 120000 },
      'financial analyst': { min: 60000, max: 100000 },
      'operations manager': { min: 70000, max: 120000 }
    }

    const key = occ.toLowerCase()
    return occupationSalaries[key] || null
  }

  const getCompanySuggestions = (occ: string): string[] => {
    const companySuggestions: Record<string, string[]> = {
      'software engineer': ['Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Uber', 'Airbnb'],
      'data scientist': ['Google', 'Microsoft', 'Amazon', 'Netflix', 'Uber', 'Spotify'],
      'consultant': ['McKinsey & Company', 'Boston Consulting Group', 'Bain & Company', 'Deloitte', 'PwC'],
      'teacher': ['Public School District', 'Private School', 'University', 'Community College'],
      'nurse': ['UCSF Medical Center', 'Stanford Health Care', 'Kaiser Permanente', 'Sutter Health'],
      'doctor': ['UCSF Medical Center', 'Stanford Health Care', 'Kaiser Permanente', 'Private Practice'],
      'lawyer': ['Law Firm', 'Corporate Legal', 'Government', 'Non-profit'],
      'accountant': ['Big Four', 'Local CPA Firm', 'Corporate Finance', 'Government']
    }

    const key = occ.toLowerCase()
    return companySuggestions[key] || []
  }

  return {
    salaryRange: getSalaryRange(occupation),
    companySuggestions: getCompanySuggestions(occupation)
  }
}

// Hook for location-based defaults
export function useLocationDefaults() {
  const getLocationDefaults = () => {
    // Could use geolocation API or IP-based location
    // For now, return SF Bay Area defaults
    return {
      city: 'San Francisco',
      state: 'CA',
      timezone: 'America/Los_Angeles',
      averageRent: {
        studio: 2500,
        oneBedroom: 3200,
        twoBedroom: 4500
      }
    }
  }

  return { getLocationDefaults }
}

// Hook for smart amenity suggestions based on profile
export function useAmenitySuggestions(formData: any) {
  const getSuggestedAmenities = () => {
    const suggestions: string[] = []

    // Based on occupation
    if (formData.occupation?.toLowerCase().includes('software') || 
        formData.occupation?.toLowerCase().includes('tech')) {
      suggestions.push('wifi', 'work_study_area')
    }

    // Based on age/lifestyle
    if (formData.has_vehicles) {
      suggestions.push('parking')
    }

    if (formData.pets) {
      suggestions.push('pet_friendly')
    }

    // Based on budget (higher budget = more amenities)
    if (formData.budget_max > 3000) {
      suggestions.push('gym', 'rooftop', 'concierge')
    }

    return suggestions
  }

  return { getSuggestedAmenities }
}

// Hook for form-specific smart defaults and history
export function useFormSmartDefaults(formType: 'operator' | 'building' | 'room' | 'tenant' | 'lead') {
  const STORAGE_KEY = `homewiz_${formType}_history`

  const getFormHistory = (): any[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  const saveToHistory = (data: any) => {
    try {
      const history = getFormHistory()
      const updated = [...history, data].slice(-10) // Keep last 10
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    } catch (error) {
      console.warn('Failed to save form history:', error)
    }
  }

  const getSmartDefaults = () => {
    const history = getFormHistory()
    const recent = history.slice(-3) // Last 3 entries

    const getMostCommon = (field: string) => {
      const values = recent.map(entry => entry[field]).filter(Boolean)
      if (values.length === 0) return null

      const counts = values.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return Object.entries(counts).sort(([,a], [,b]) => b - a)[0]?.[0]
    }

    switch (formType) {
      case 'building':
        return {
          available: true,
          wifi_included: true,
          laundry_onsite: true,
          secure_access: true,
          year_built: getMostCommon('year_built') || new Date().getFullYear() - 5,
          min_lease_term: getMostCommon('min_lease_term') || 12,
          cleaning_common_spaces: getMostCommon('cleaning_common_spaces') || 'Weekly professional cleaning'
        }

      case 'room':
        return {
          ready_to_rent: true,
          status: 'AVAILABLE',
          work_desk: true,
          work_chair: true,
          heating: true,
          private_room_rent: getMostCommon('private_room_rent') || 800
        }

      case 'operator':
        return {
          operator_type: 'LEASING_AGENT',
          notification_preferences: 'EMAIL',
          active: true,
          emergency_contact: false
        }

      default:
        return {}
    }
  }

  const getFieldSuggestions = (field: string): string[] => {
    const history = getFormHistory()
    return [...new Set(
      history
        .map(entry => entry[field])
        .filter(value => value && typeof value === 'string')
        .slice(-5)
    )]
  }

  return {
    getSmartDefaults,
    saveToHistory,
    getFieldSuggestions
  }
}
