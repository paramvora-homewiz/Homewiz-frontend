import { OperatorFormData, BuildingFormData, RoomFormData, TenantFormData, LeadFormData } from '@/types'

// Validation result interface
export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
  warnings: Record<string, string>
}

// Common validation functions
export const validators = {
  required: (value: any, fieldName: string): string | null => {
    if (value === null || value === undefined || value === '') {
      return `${fieldName} is required`
    }
    return null
  },

  email: (value: string): string | null => {
    if (!value) return null
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value) ? null : 'Please enter a valid email address'
  },

  phone: (value: string): string | null => {
    if (!value) return null
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/
    return phoneRegex.test(value) ? null : 'Please enter a valid phone number'
  },

  url: (value: string): string | null => {
    if (!value) return null
    try {
      new URL(value)
      return null
    } catch {
      return 'Please enter a valid URL'
    }
  },

  positiveNumber: (value: number, fieldName: string): string | null => {
    if (value === null || value === undefined) return null
    return value >= 0 ? null : `${fieldName} must be a positive number`
  },

  minValue: (value: number, min: number, fieldName: string): string | null => {
    if (value === null || value === undefined) return null
    return value >= min ? null : `${fieldName} must be at least ${min}`
  },

  maxValue: (value: number, max: number, fieldName: string): string | null => {
    if (value === null || value === undefined) return null
    return value <= max ? null : `${fieldName} must not exceed ${max}`
  },

  dateNotInPast: (value: string, fieldName: string): string | null => {
    if (!value) return null
    const date = new Date(value)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date >= today ? null : `${fieldName} cannot be in the past`
  },

  dateAfter: (value: string, afterDate: string, fieldName: string, afterFieldName: string): string | null => {
    if (!value || !afterDate) return null
    const date = new Date(value)
    const after = new Date(afterDate)
    return date > after ? null : `${fieldName} must be after ${afterFieldName}`
  },

  jsonString: (value: string, fieldName: string): string | null => {
    if (!value) return null
    try {
      JSON.parse(value)
      return null
    } catch {
      return `${fieldName} must be valid JSON`
    }
  },

  minLength: (value: string, min: number, fieldName: string): string | null => {
    if (!value) return null
    return value.length >= min ? null : `${fieldName} must be at least ${min} characters`
  },

  maxLength: (value: string, max: number, fieldName: string): string | null => {
    if (!value) return null
    return value.length <= max ? null : `${fieldName} must not exceed ${max} characters`
  }
}

// Operator form validation
export function validateOperatorForm(data: OperatorFormData): ValidationResult {
  const errors: Record<string, string> = {}
  const warnings: Record<string, string> = {}

  // Required fields
  const nameError = validators.required(data.name, 'Name')
  if (nameError) errors.name = nameError

  const emailError = validators.required(data.email, 'Email')
  if (emailError) errors.email = emailError
  else {
    const emailFormatError = validators.email(data.email)
    if (emailFormatError) errors.email = emailFormatError
  }

  // Optional field validations
  if (data.phone) {
    const phoneError = validators.phone(data.phone)
    if (phoneError) errors.phone = phoneError
  }

  if (data.date_joined) {
    const futureDateError = validators.dateNotInPast(data.date_joined, 'Date joined')
    if (futureDateError) warnings.date_joined = 'Date joined is in the future'
  }

  // permissions and working_hours are already objects, no need to validate as JSON strings

  if (data.calendar_external_id && !data.calendar_sync_enabled) {
    warnings.calendar_external_id = 'Calendar external ID provided but sync is not enabled'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  }
}

// Building form validation
export function validateBuildingForm(data: BuildingFormData): ValidationResult {
  const errors: Record<string, string> = {}
  const warnings: Record<string, string> = {}

  // Required fields
  const nameError = validators.required(data.building_name, 'Building name')
  if (nameError) errors.building_name = nameError

  // Numeric validations
  if (data.year_built !== undefined) {
    const currentYear = new Date().getFullYear()
    const minYearError = validators.minValue(data.year_built, 1800, 'Year built')
    const maxYearError = validators.maxValue(data.year_built, currentYear, 'Year built')
    if (minYearError) errors.year_built = minYearError
    else if (maxYearError) errors.year_built = maxYearError
  }

  if (data.last_renovation !== undefined) {
    const currentYear = new Date().getFullYear()
    const maxYearError = validators.maxValue(data.last_renovation, currentYear, 'Last renovation')
    if (maxYearError) errors.last_renovation = maxYearError
    
    if (data.year_built && data.last_renovation < data.year_built) {
      errors.last_renovation = 'Last renovation cannot be before year built'
    }
  }

  if (data.floors !== undefined) {
    const minFloorsError = validators.minValue(data.floors, 1, 'Number of floors')
    if (minFloorsError) errors.floors = minFloorsError
  }

  if (data.total_rooms !== undefined) {
    const minRoomsError = validators.minValue(data.total_rooms, 1, 'Total rooms')
    if (minRoomsError) errors.total_rooms = minRoomsError
  }

  if (data.total_bathrooms !== undefined) {
    const minBathroomsError = validators.minValue(data.total_bathrooms, 1, 'Total bathrooms')
    if (minBathroomsError) errors.total_bathrooms = minBathroomsError
  }

  if (data.bathrooms_on_each_floor !== undefined) {
    const minBathroomsPerFloorError = validators.minValue(data.bathrooms_on_each_floor, 1, 'Bathrooms per floor')
    if (minBathroomsPerFloorError) errors.bathrooms_on_each_floor = minBathroomsPerFloorError

    // Business logic validation
    if (data.total_bathrooms && data.floors && data.bathrooms_on_each_floor) {
      const expectedTotalBathrooms = data.bathrooms_on_each_floor * data.floors
      if (expectedTotalBathrooms > data.total_bathrooms * 1.5) {
        warnings.bathrooms_on_each_floor = 'Bathrooms per floor seems high compared to total bathrooms'
      }
    }
  }

  if (data.min_lease_term !== undefined) {
    const minLeaseError = validators.minValue(data.min_lease_term, 1, 'Minimum lease term')
    if (minLeaseError) errors.min_lease_term = minLeaseError
  }

  if (data.pref_min_lease_term !== undefined) {
    const prefMinLeaseError = validators.minValue(data.pref_min_lease_term, 1, 'Preferred minimum lease term')
    if (prefMinLeaseError) errors.pref_min_lease_term = prefMinLeaseError

    if (data.min_lease_term && data.pref_min_lease_term < data.min_lease_term) {
      errors.pref_min_lease_term = 'Preferred minimum lease term cannot be less than minimum lease term'
    }
  }

  // Enum validations
  if (data.common_kitchen && !['None', 'Shared', 'Private', 'Both'].includes(data.common_kitchen)) {
    errors.common_kitchen = 'Invalid common kitchen option'
  }

  if (data.pet_friendly && !['Yes', 'No', 'Conditional'].includes(data.pet_friendly)) {
    errors.pet_friendly = 'Invalid pet-friendly option'
  }

  if (data.cleaning_common_spaces && !['Yes', 'No', 'Tenant Responsibility'].includes(data.cleaning_common_spaces)) {
    errors.cleaning_common_spaces = 'Invalid cleaning common spaces option'
  }

  // URL validations
  if (data.virtual_tour_url) {
    const urlError = validators.url(data.virtual_tour_url)
    if (urlError) errors.virtual_tour_url = urlError
  }

  // JSON format validations
  if (data.amenities_details && typeof data.amenities_details === 'string') {
    try {
      JSON.parse(data.amenities_details)
    } catch (e) {
      errors.amenities_details = 'Invalid amenities details format'
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  }
}

// Room form validation
export function validateRoomForm(data: RoomFormData): ValidationResult {
  const errors: Record<string, string> = {}
  const warnings: Record<string, string> = {}

  // Required fields
  const roomNumberError = validators.required(data.room_number, 'Room number')
  if (roomNumberError) errors.room_number = roomNumberError

  const buildingIdError = validators.required(data.building_id, 'Building')
  if (buildingIdError) errors.building_id = buildingIdError

  // Numeric validations
  if (data.maximum_people_in_room !== undefined) {
    const minPeopleError = validators.minValue(data.maximum_people_in_room, 1, 'Maximum people in room')
    if (minPeopleError) errors.maximum_people_in_room = minPeopleError
  }

  if (data.private_room_rent !== undefined) {
    const rentError = validators.positiveNumber(data.private_room_rent, 'Private room rent')
    if (rentError) errors.private_room_rent = rentError
  }

  if (data.shared_room_rent_2 !== undefined) {
    const rentError = validators.positiveNumber(data.shared_room_rent_2, 'Shared room rent')
    if (rentError) errors.shared_room_rent_2 = rentError
  }

  if (data.floor_number !== undefined) {
    const floorError = validators.minValue(data.floor_number, 1, 'Floor number')
    if (floorError) errors.floor_number = floorError
  }

  if (data.bed_count !== undefined) {
    const bedError = validators.minValue(data.bed_count, 1, 'Bed count')
    if (bedError) errors.bed_count = bedError
  }

  if (data.sq_footage !== undefined) {
    const sqftError = validators.minValue(data.sq_footage, 1, 'Square footage')
    if (sqftError) errors.sq_footage = sqftError
  }

  // Date validations
  if (data.available_from) {
    const pastDateError = validators.dateNotInPast(data.available_from, 'Available from')
    if (pastDateError) warnings.available_from = pastDateError
  }

  if (data.booked_from && data.booked_till) {
    const dateOrderError = validators.dateAfter(data.booked_till, data.booked_from, 'Booked until', 'Booked from')
    if (dateOrderError) errors.booked_till = dateOrderError
  }

  // URL validation
  if (data.virtual_tour_url) {
    const urlError = validators.url(data.virtual_tour_url)
    if (urlError) errors.virtual_tour_url = urlError
  }

  // Status consistency checks
  if (data.status === 'OCCUPIED' && data.active_tenants === 0) {
    warnings.active_tenants = 'Room is marked as occupied but has no active tenants'
  }

  if (data.status === 'AVAILABLE' && data.active_tenants > 0) {
    warnings.status = 'Room is marked as available but has active tenants'
  }

  if (!data.ready_to_rent && data.status === 'AVAILABLE') {
    warnings.ready_to_rent = 'Room is marked as available but not ready to rent'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  }
}

// Tenant form validation
export function validateTenantForm(data: TenantFormData): ValidationResult {
  const errors: Record<string, string> = {}
  const warnings: Record<string, string> = {}

  // Required fields
  const nameError = validators.required(data.tenant_name, 'Tenant name')
  if (nameError) errors.tenant_name = nameError

  const emailError = validators.required(data.tenant_email, 'Email')
  if (emailError) errors.tenant_email = emailError
  else {
    const emailFormatError = validators.email(data.tenant_email)
    if (emailFormatError) errors.tenant_email = emailFormatError
  }

  // Optional field validations
  if (data.phone) {
    const phoneError = validators.phone(data.phone)
    if (phoneError) errors.phone = phoneError
  }

  if (data.emergency_contact_phone) {
    const phoneError = validators.phone(data.emergency_contact_phone)
    if (phoneError) errors.emergency_contact_phone = phoneError
  }

  // Numeric validations
  if (data.deposit_amount !== undefined) {
    const depositError = validators.positiveNumber(data.deposit_amount, 'Deposit amount')
    if (depositError) errors.deposit_amount = depositError
  }

  // Date validations
  if (data.lease_start_date && data.lease_end_date) {
    const dateOrderError = validators.dateAfter(data.lease_end_date, data.lease_start_date, 'Lease end date', 'Lease start date')
    if (dateOrderError) errors.lease_end_date = dateOrderError
  }

  if (data.last_payment_date && data.next_payment_date) {
    const paymentDateError = validators.dateAfter(data.next_payment_date, data.last_payment_date, 'Next payment date', 'Last payment date')
    if (paymentDateError) warnings.next_payment_date = paymentDateError
  }

  // Conditional field validations
  if (data.has_pets && !data.pet_details) {
    warnings.pet_details = 'Pet details should be provided when tenant has pets'
  }

  if (data.has_vehicles && !data.vehicle_details) {
    warnings.vehicle_details = 'Vehicle details should be provided when tenant has vehicles'
  }

  if (data.has_renters_insurance && !data.insurance_details) {
    warnings.insurance_details = 'Insurance details should be provided when tenant has insurance'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  }
}

// Lead form validation
export function validateLeadForm(data: LeadFormData): ValidationResult {
  const errors: Record<string, string> = {}
  const warnings: Record<string, string> = {}

  // Required fields
  const emailError = validators.required(data.email, 'Email')
  if (emailError) errors.email = emailError
  else {
    const emailFormatError = validators.email(data.email)
    if (emailFormatError) errors.email = emailFormatError
  }

  // Budget validations
  if (data.budget_min !== undefined && data.budget_max !== undefined) {
    if (data.budget_min > data.budget_max) {
      errors.budget_max = 'Maximum budget must be greater than minimum budget'
    }
  }

  if (data.budget_min !== undefined) {
    const minBudgetError = validators.positiveNumber(data.budget_min, 'Minimum budget')
    if (minBudgetError) errors.budget_min = minBudgetError
  }

  if (data.budget_max !== undefined) {
    const maxBudgetError = validators.positiveNumber(data.budget_max, 'Maximum budget')
    if (maxBudgetError) errors.budget_max = maxBudgetError
  }

  // Date validations
  if (data.preferred_move_in_date) {
    const pastDateError = validators.dateNotInPast(data.preferred_move_in_date, 'Preferred move-in date')
    if (pastDateError) errors.preferred_move_in_date = pastDateError
  }

  if (data.planned_move_in && data.planned_move_out) {
    const dateOrderError = validators.dateAfter(data.planned_move_out, data.planned_move_in, 'Planned move-out', 'Planned move-in')
    if (dateOrderError) errors.planned_move_out = dateOrderError
  }

  // Lease term validation
  if (data.preferred_lease_term !== undefined) {
    const leaseTermError = validators.minValue(data.preferred_lease_term, 1, 'Preferred lease term')
    if (leaseTermError) errors.preferred_lease_term = leaseTermError
  }

  // rooms_interested, showing_dates, and additional_preferences are already objects/arrays, no need to validate as JSON strings

  // Lead score validation
  if (data.lead_score < 0 || data.lead_score > 100) {
    errors.lead_score = 'Lead score must be between 0 and 100'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  }
}

// Master validation function
export function validateForm(formType: string, data: any): ValidationResult {
  switch (formType) {
    case 'operator':
      return validateOperatorForm(data as OperatorFormData)
    case 'building':
      return validateBuildingForm(data as BuildingFormData)
    case 'room':
      return validateRoomForm(data as RoomFormData)
    case 'tenant':
      return validateTenantForm(data as TenantFormData)
    case 'lead':
      return validateLeadForm(data as LeadFormData)
    default:
      return { isValid: false, errors: { form: 'Unknown form type' }, warnings: {} }
  }
}
