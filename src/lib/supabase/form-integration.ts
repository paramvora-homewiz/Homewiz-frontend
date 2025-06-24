/**
 * Form Integration Layer for Supabase
 * 
 * This module provides:
 * - Form data transformation and validation
 * - Integration with Supabase database services
 * - Error handling and user feedback
 * - File upload management
 * - Real-time updates for collaborative editing
 */

import { databaseService } from './database'
import { errorHandler, handleDatabaseError } from './error-handler'
import { realtimeManager } from './realtime'
import { 
  TenantInsert, TenantUpdate, 
  BuildingInsert, BuildingUpdate,
  OperatorInsert, OperatorUpdate,
  LeadInsert, LeadUpdate
} from './types'

// Form submission result interface
export interface FormSubmissionResult<T = any> {
  success: boolean
  data?: T
  error?: string
  validationErrors?: Record<string, string>
  message?: string
}

// File upload result interface
export interface FileUploadResult {
  success: boolean
  url?: string
  error?: string
  fileName?: string
  fileSize?: number
}

/**
 * Tenant Form Integration
 */
export class TenantFormIntegration {
  /**
   * Submit tenant form data
   */
  static async submitTenant(formData: any): Promise<FormSubmissionResult> {
    try {
      // Validate form data
      const validationResult = this.validateTenantData(formData)
      if (!validationResult.isValid) {
        return {
          success: false,
          validationErrors: validationResult.errors,
          message: 'Please correct the validation errors and try again.'
        }
      }

      // Transform form data to database format
      const tenantData: TenantInsert = this.transformTenantData(formData)

      // Submit to database
      const result = await databaseService.tenants.create(tenantData)

      if (result.success) {
        return {
          success: true,
          data: result.data,
          message: 'Tenant created successfully!'
        }
      } else {
        const enhancedError = handleDatabaseError(result.error, 'tenant_creation')
        return {
          success: false,
          error: enhancedError.userMessage,
          message: 'Failed to create tenant. Please try again.'
        }
      }
    } catch (error) {
      const enhancedError = handleDatabaseError(error, 'tenant_form_submission')
      return {
        success: false,
        error: enhancedError.userMessage,
        message: 'An unexpected error occurred. Please try again.'
      }
    }
  }

  /**
   * Update tenant data
   */
  static async updateTenant(tenantId: string, formData: any): Promise<FormSubmissionResult> {
    try {
      const validationResult = this.validateTenantData(formData, true)
      if (!validationResult.isValid) {
        return {
          success: false,
          validationErrors: validationResult.errors
        }
      }

      const tenantData: TenantUpdate = this.transformTenantData(formData, true)
      const result = await databaseService.tenants.update(tenantId, tenantData)

      if (result.success) {
        return {
          success: true,
          data: result.data,
          message: 'Tenant updated successfully!'
        }
      } else {
        const enhancedError = handleDatabaseError(result.error, 'tenant_update')
        return {
          success: false,
          error: enhancedError.userMessage
        }
      }
    } catch (error) {
      const enhancedError = handleDatabaseError(error, 'tenant_form_update')
      return {
        success: false,
        error: enhancedError.userMessage
      }
    }
  }

  /**
   * Validate tenant form data
   */
  private static validateTenantData(data: any, isUpdate = false): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {}

    // Required fields for creation
    if (!isUpdate) {
      if (!data.first_name?.trim()) {
        errors.first_name = 'First name is required'
      }
      if (!data.last_name?.trim()) {
        errors.last_name = 'Last name is required'
      }
      if (!data.email?.trim()) {
        errors.email = 'Email is required'
      }
    }

    // Email validation
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Please enter a valid email address'
    }

    // Phone validation
    if (data.phone && !/^\+?[\d\s\-\(\)]+$/.test(data.phone)) {
      errors.phone = 'Please enter a valid phone number'
    }

    // Date validations
    if (data.lease_start_date && data.lease_end_date) {
      const startDate = new Date(data.lease_start_date)
      const endDate = new Date(data.lease_end_date)
      
      if (endDate <= startDate) {
        errors.lease_end_date = 'Lease end date must be after start date'
      }
    }

    // Rent amount validation
    if (data.rent_amount && (isNaN(data.rent_amount) || data.rent_amount < 0)) {
      errors.rent_amount = 'Rent amount must be a valid positive number'
    }

    // Deposit amount validation
    if (data.deposit_amount && (isNaN(data.deposit_amount) || data.deposit_amount < 0)) {
      errors.deposit_amount = 'Deposit amount must be a valid positive number'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  /**
   * Transform form data to database format
   */
  private static transformTenantData(formData: any, isUpdate = false): TenantInsert | TenantUpdate {
    const baseData = {
      first_name: formData.first_name?.trim(),
      last_name: formData.last_name?.trim(),
      email: formData.email?.trim().toLowerCase(),
      phone: formData.phone?.trim() || null,
      date_of_birth: formData.date_of_birth || null,
      tenant_nationality: formData.tenant_nationality?.trim() || null,
      emergency_contact_name: formData.emergency_contact_name?.trim() || null,
      emergency_contact_phone: formData.emergency_contact_phone?.trim() || null,
      emergency_contact_relationship: formData.emergency_contact_relationship?.trim() || null,
      building_id: formData.building_id || null,
      room_id: formData.room_id || null,
      lease_start_date: formData.lease_start_date || null,
      lease_end_date: formData.lease_end_date || null,
      rent_amount: formData.rent_amount ? parseFloat(formData.rent_amount) : null,
      deposit_amount: formData.deposit_amount ? parseFloat(formData.deposit_amount) : null,
      payment_status: formData.payment_status || null,
      rent_payment_method: formData.rent_payment_method || null,
      account_status: formData.account_status || 'ACTIVE',
      operator_id: formData.operator_id ? parseInt(formData.operator_id) : null,
      booking_type: formData.booking_type || null,
      special_requests: formData.special_requests?.trim() || null,
      communication_preferences: formData.communication_preferences || null,
      payment_reminders_enabled: Boolean(formData.payment_reminders_enabled),
      has_pets: Boolean(formData.has_pets),
      has_vehicles: Boolean(formData.has_vehicles),
      has_renters_insurance: Boolean(formData.has_renters_insurance),
      status: formData.status || 'ACTIVE'
    }

    if (isUpdate) {
      return baseData as TenantUpdate
    }

    return {
      ...baseData,
      created_at: new Date().toISOString()
    } as TenantInsert
  }
}

/**
 * Building Form Integration
 */
export class BuildingFormIntegration {
  /**
   * Submit building form data
   */
  static async submitBuilding(formData: any): Promise<FormSubmissionResult> {
    try {
      const validationResult = this.validateBuildingData(formData)
      if (!validationResult.isValid) {
        return {
          success: false,
          validationErrors: validationResult.errors
        }
      }

      const buildingData: BuildingInsert = this.transformBuildingData(formData)
      const result = await databaseService.buildings.create(buildingData)

      if (result.success) {
        return {
          success: true,
          data: result.data,
          message: 'Building created successfully!'
        }
      } else {
        const enhancedError = handleDatabaseError(result.error, 'building_creation')
        return {
          success: false,
          error: enhancedError.userMessage
        }
      }
    } catch (error) {
      const enhancedError = handleDatabaseError(error, 'building_form_submission')
      return {
        success: false,
        error: enhancedError.userMessage
      }
    }
  }

  /**
   * Validate building form data
   */
  private static validateBuildingData(data: any): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {}

    if (!data.building_name?.trim()) {
      errors.building_name = 'Building name is required'
    }
    if (!data.address?.trim()) {
      errors.address = 'Address is required'
    }
    if (!data.city?.trim()) {
      errors.city = 'City is required'
    }
    if (!data.state?.trim()) {
      errors.state = 'State is required'
    }
    if (!data.zip_code?.trim()) {
      errors.zip_code = 'ZIP code is required'
    }
    if (!data.building_type?.trim()) {
      errors.building_type = 'Building type is required'
    }

    if (data.total_units && (isNaN(data.total_units) || data.total_units < 1)) {
      errors.total_units = 'Total units must be a positive number'
    }

    if (data.year_built && (isNaN(data.year_built) || data.year_built < 1800 || data.year_built > new Date().getFullYear())) {
      errors.year_built = 'Please enter a valid year'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  /**
   * Transform building form data
   */
  private static transformBuildingData(formData: any): BuildingInsert {
    return {
      building_name: formData.building_name.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      zip_code: formData.zip_code.trim(),
      country: formData.country?.trim() || 'United States',
      total_units: parseInt(formData.total_units) || 0,
      available_units: parseInt(formData.available_units) || parseInt(formData.total_units) || 0,
      building_type: formData.building_type,
      year_built: formData.year_built ? parseInt(formData.year_built) : null,
      amenities: formData.amenities || null,
      contact_info: formData.contact_info || null,
      status: formData.status || 'ACTIVE',
      area: formData.area?.trim() || null,
      description: formData.description?.trim() || null,
      images: formData.images || null,
      parking_available: Boolean(formData.parking_available),
      pet_friendly: Boolean(formData.pet_friendly),
      furnished_options: Boolean(formData.furnished_options),
      created_at: new Date().toISOString()
    }
  }
}

/**
 * Operator Form Integration
 */
export class OperatorFormIntegration {
  /**
   * Submit operator form data
   */
  static async submitOperator(formData: any): Promise<FormSubmissionResult> {
    try {
      const validationResult = this.validateOperatorData(formData)
      if (!validationResult.isValid) {
        return {
          success: false,
          validationErrors: validationResult.errors
        }
      }

      const operatorData: OperatorInsert = this.transformOperatorData(formData)
      const result = await databaseService.operators.create(operatorData)

      if (result.success) {
        return {
          success: true,
          data: result.data,
          message: 'Operator created successfully!'
        }
      } else {
        const enhancedError = handleDatabaseError(result.error, 'operator_creation')
        return {
          success: false,
          error: enhancedError.userMessage
        }
      }
    } catch (error) {
      const enhancedError = handleDatabaseError(error, 'operator_form_submission')
      return {
        success: false,
        error: enhancedError.userMessage
      }
    }
  }

  /**
   * Validate operator form data
   */
  private static validateOperatorData(data: any): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {}

    if (!data.name?.trim()) {
      errors.name = 'Name is required'
    }
    if (!data.email?.trim()) {
      errors.email = 'Email is required'
    }
    if (!data.operator_type?.trim()) {
      errors.operator_type = 'Operator type is required'
    }

    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Please enter a valid email address'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  /**
   * Transform operator form data
   */
  private static transformOperatorData(formData: any): OperatorInsert {
    return {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone?.trim() || null,
      operator_type: formData.operator_type,
      status: formData.status || 'ACTIVE',
      department: formData.department?.trim() || null,
      hire_date: formData.hire_date || null,
      permissions: formData.permissions || null,
      created_at: new Date().toISOString()
    }
  }
}

// Export form integration services
export const formIntegration = {
  tenant: TenantFormIntegration,
  building: BuildingFormIntegration,
  operator: OperatorFormIntegration
}
