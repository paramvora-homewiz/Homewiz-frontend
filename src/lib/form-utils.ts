/**
 * Form Utilities for HomeWiz Frontend
 *
 * This module provides utility functions for form data processing,
 * validation, transformation, and ID generation used across the application.
 */

import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { ApplicationFormData, Lead, TenantFormData } from '@/types'
import ErrorHandler, { ErrorType } from './error-handler'

/**
 * Generate a unique tenant ID with TNT prefix
 *
 * @returns Unique tenant ID in format TNT_XXXXXXXXXXXX
 *
 * @example
 * generateTenantId() // "TNT_A1B2C3D4E5F6"
 */
export function generateTenantId(): string {
  return `TNT_${uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase()}`
}

/**
 * Generate a unique lead ID with LEAD prefix
 *
 * @returns Unique lead ID in format LEAD_XXXXXXXXXXXX
 *
 * @example
 * generateLeadId() // "LEAD_A1B2C3D4E5F6"
 */
export function generateLeadId(): string {
  return `LEAD_${uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase()}`
}

/**
 * Calculate lease end date based on start date and lease term in months
 *
 * @param startDate - Lease start date in ISO format (YYYY-MM-DD)
 * @param leaseTerm - Lease term in months
 * @returns Lease end date in YYYY-MM-DD format
 *
 * @example
 * calculateLeaseEndDate('2024-01-15', 12) // "2025-01-15"
 * calculateLeaseEndDate('2024-06-01', 6) // "2024-12-01"
 */
export function calculateLeaseEndDate(startDate: string, leaseTerm: number): string {
  const start = new Date(startDate)
  const end = new Date(start)
  end.setMonth(end.getMonth() + leaseTerm)
  return end.toISOString().split('T')[0] // Return YYYY-MM-DD format
}

/**
 * Transform frontend application form data to backend tenant creation format
 * Handles data mapping, ID generation, and date calculations
 *
 * @param formData - Application form data from frontend
 * @returns Transformed data object for backend API
 *
 * @example
 * const tenantData = transformToTenantData(applicationForm)
 * // Returns formatted object with tenant_id, lease dates, preferences, etc.
 */
export function transformToTenantData(formData: ApplicationFormData): any {
  // Generate tenant ID if not provided
  const tenantId = formData.tenant_id || generateTenantId()
  
  // Calculate lease dates
  const leaseStartDate = formData.lease_start_date || formData.preferred_move_in_date
  const leaseEndDate = formData.lease_end_date || 
    (leaseStartDate ? calculateLeaseEndDate(leaseStartDate, formData.preferred_lease_term) : undefined)

  // Transform amenity preferences to JSON
  const amenityPreferences = {
    wifi: formData.amenity_wifi,
    laundry: formData.amenity_laundry,
    parking: formData.amenity_parking,
    security: formData.amenity_security,
    gym: formData.amenity_gym,
    common_area: formData.amenity_common_area,
    rooftop: formData.amenity_rooftop,
    bike_storage: formData.amenity_bike_storage,
  }

  // Combine special requests with amenity preferences
  const specialRequests = formData.special_requests || ''
  const combinedRequests = specialRequests + 
    (Object.values(amenityPreferences).some(Boolean) ? 
      `\n\nAmenity Preferences: ${JSON.stringify(amenityPreferences)}` : '')

  return {
    tenant_id: tenantId,
    tenant_name: `${formData.firstName} ${formData.lastName}`.trim(),
    room_id: formData.selected_room_id,
    room_number: formData.room_number,
    lease_start_date: leaseStartDate,
    lease_end_date: leaseEndDate,
    operator_id: formData.operator_id,
    booking_type: formData.booking_type || 'LEASE',
    tenant_nationality: formData.nationality,
    tenant_email: formData.email,
    phone: formData.phone,
    emergency_contact_name: formData.emergency_contact_name,
    emergency_contact_phone: formData.emergency_contact_phone,
    emergency_contact_relation: formData.emergency_contact_relation,
    building_id: formData.selected_building_id,
    status: formData.status || 'ACTIVE',
    deposit_amount: formData.deposit_amount || 0.0,
    payment_status: formData.payment_status || 'PENDING',
    special_requests: combinedRequests.trim() || null,
  }
}

/**
 * Transform frontend form data to backend lead creation format
 */
export function transformToLeadData(formData: ApplicationFormData): any {
  // Generate lead ID if not provided
  const leadId = formData.lead_id || generateLeadId()

  // Transform additional preferences to JSON
  const additionalPreferences = {
    room_type: formData.room_type,
    bathroom_type: formData.bathroom_type,
    floor_preference: formData.floor_preference,
    view_preference: formData.view_preference,
    pets: formData.pets,
    pet_details: formData.pet_details,
    smoking: formData.smoking,
    has_vehicles: formData.has_vehicles,
    vehicle_details: formData.vehicle_details,
    has_renters_insurance: formData.has_renters_insurance,
    insurance_details: formData.insurance_details,
    amenities: {
      wifi: formData.amenity_wifi,
      laundry: formData.amenity_laundry,
      parking: formData.amenity_parking,
      security: formData.amenity_security,
      gym: formData.amenity_gym,
      common_area: formData.amenity_common_area,
      rooftop: formData.amenity_rooftop,
      bike_storage: formData.amenity_bike_storage,
    }
  }

  return {
    email: formData.email,
    status: 'APPLICATION_SUBMITTED',
    rooms_interested: formData.rooms_interested ? JSON.stringify(formData.rooms_interested) : null,
    selected_room_id: formData.selected_room_id,
    showing_dates: formData.showing_dates ? JSON.stringify(formData.showing_dates) : null,
    planned_move_in: formData.preferred_move_in_date,
    planned_move_out: formData.planned_move_out,
    visa_status: formData.visa_status,
    notes: formData.notes,
    lead_source: formData.lead_source,
    preferred_communication: formData.preferred_communication || 'EMAIL',
    budget_min: formData.budget_min,
    budget_max: formData.budget_max,
    preferred_move_in_date: formData.preferred_move_in_date,
    preferred_lease_term: formData.preferred_lease_term,
    additional_preferences: JSON.stringify(additionalPreferences),
  }
}

/**
 * Validate required fields for tenant creation
 */
export function validateTenantRequiredFields(formData: ApplicationFormData): string[] {
  const errors: string[] = []

  if (!formData.firstName?.trim()) errors.push('First name is required')
  if (!formData.lastName?.trim()) errors.push('Last name is required')
  if (!formData.email?.trim()) errors.push('Email is required')
  if (!formData.selected_room_id) errors.push('Room selection is required')
  if (!formData.selected_building_id) errors.push('Building selection is required')

  return errors
}

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

const emailSchema = z.string()
  .email('Invalid email address')
  .min(1, 'Email is required')
  .max(254, 'Email is too long')

const phoneSchema = z.string()
  .min(10, 'Phone number must be at least 10 digits')
  .max(15, 'Phone number is too long')

const nameSchema = z.string()
  .min(1, 'Name is required')
  .max(50, 'Name is too long')
  .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name contains invalid characters')

const currencySchema = z.number()
  .positive('Amount must be positive')
  .max(999999999, 'Amount is too large')

// ============================================================================
// ENHANCED VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate email format with detailed error messages
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  try {
    emailSchema.parse(email)
    return { valid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message }
    }
    return { valid: false, error: 'Invalid email format' }
  }
}

/**
 * Simple email validation for backward compatibility
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number with detailed error messages
 */
export function validatePhone(phone: string): { valid: boolean; error?: string } {
  try {
    // Clean phone number
    const cleaned = phone.replace(/\D/g, '')

    // Check US phone number (10 or 11 digits)
    if (cleaned.length === 10 || (cleaned.length === 11 && cleaned.startsWith('1'))) {
      return { valid: true }
    }

    return { valid: false, error: 'Phone number must be 10 digits (US format)' }
  } catch (error) {
    return { valid: false, error: 'Invalid phone number format' }
  }
}

/**
 * Validate name fields with detailed error messages
 */
export function validateName(name: string, fieldName: string = 'Name'): { valid: boolean; error?: string } {
  try {
    nameSchema.parse(name)
    return { valid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message.replace('Name', fieldName) }
    }
    return { valid: false, error: `Invalid ${fieldName.toLowerCase()} format` }
  }
}

/**
 * Validate currency amount with detailed error messages
 */
export function validateCurrency(amount: number | string): { valid: boolean; error?: string } {
  try {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numAmount)) {
      return { valid: false, error: 'Amount must be a valid number' }
    }
    currencySchema.parse(numAmount)
    return { valid: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: error.errors[0].message }
    }
    return { valid: false, error: 'Invalid amount' }
  }
}

/**
 * Comprehensive form validation
 */
export function validateFormData(formData: ApplicationFormData): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  // Validate personal information
  const firstNameValidation = validateName(formData.firstName, 'First name')
  if (!firstNameValidation.valid) {
    errors.firstName = firstNameValidation.error!
  }

  const lastNameValidation = validateName(formData.lastName, 'Last name')
  if (!lastNameValidation.valid) {
    errors.lastName = lastNameValidation.error!
  }

  const emailValidation = validateEmail(formData.email)
  if (!emailValidation.valid) {
    errors.email = emailValidation.error!
  }

  const phoneValidation = validatePhone(formData.phone)
  if (!phoneValidation.valid) {
    errors.phone = phoneValidation.error!
  }

  // Validate budget
  if (formData.budget_min !== undefined) {
    const budgetMinValidation = validateCurrency(formData.budget_min)
    if (!budgetMinValidation.valid) {
      errors.budget_min = budgetMinValidation.error!
    }
  }

  if (formData.budget_max !== undefined) {
    const budgetMaxValidation = validateCurrency(formData.budget_max)
    if (!budgetMaxValidation.valid) {
      errors.budget_max = budgetMaxValidation.error!
    }
  }

  // Validate budget range
  if (formData.budget_min && formData.budget_max) {
    const budgetRangeError = validateBudgetRange(formData.budget_min, formData.budget_max)
    if (budgetRangeError) {
      errors.budget_range = budgetRangeError
    }
  }

  // Validate dates
  if (formData.preferred_move_in_date) {
    if (!validateFutureDate(formData.preferred_move_in_date)) {
      errors.preferred_move_in_date = 'Move-in date must be in the future'
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Format phone number to E.164 format
 */
export function formatPhoneNumber(phone: string, countryCode: string = '+1'): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  // If it starts with country code digits, use as is
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`
  }
  
  // If it's 10 digits, add US country code
  if (digits.length === 10) {
    return `${countryCode}${digits}`
  }
  
  // Return original if format is unclear
  return phone
}

/**
 * Validate date is in the future
 */
export function validateFutureDate(dateString: string): boolean {
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Reset time to start of day
  return date >= today
}

/**
 * Validate budget range
 */
export function validateBudgetRange(min: number, max: number): string | null {
  if (min < 0) return 'Minimum budget cannot be negative'
  if (max < 0) return 'Maximum budget cannot be negative'
  if (min > max) return 'Minimum budget cannot be greater than maximum budget'
  if (min > 10000 || max > 10000) return 'Budget seems unreasonably high'
  if (min < 100 && min > 0) return 'Budget seems unreasonably low'
  return null
}

/**
 * Generate suggested deposit amount based on rent
 */
export function calculateSuggestedDeposit(monthlyRent: number): number {
  // Typically 1-2 months rent, we'll use 1.5 months
  return Math.round(monthlyRent * 1.5)
}

/**
 * Check if form data is complete for submission
 */
export function isFormReadyForSubmission(formData: ApplicationFormData): boolean {
  const requiredFieldErrors = validateTenantRequiredFields(formData)
  return requiredFieldErrors.length === 0
}
