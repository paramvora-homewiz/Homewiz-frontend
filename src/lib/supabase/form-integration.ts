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
import { transformBuildingDataForBackend, transformRoomDataForBackend } from '../backend-sync'
import {
  TenantInsert, TenantUpdate,
  BuildingInsert, BuildingUpdate,
  RoomInsert, RoomUpdate,
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

    // Required fields for creation - validate based on form field names but map errors correctly
    if (!isUpdate) {
      if (!data.tenant_name?.trim()) {
        errors.tenant_name = 'Tenant name is required'
      }
      if (!data.tenant_email?.trim()) {
        errors.tenant_email = 'Email is required'
      }

      // Additional validation for name splitting
      if (data.tenant_name?.trim()) {
        const nameParts = data.tenant_name.trim().split(' ')
        if (nameParts.length < 2 || !nameParts[1]) {
          errors.tenant_name = 'Please enter both first and last name'
        }
      }
    }

    // Email validation - check both possible field names
    const email = data.tenant_email || data.email
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.tenant_email = 'Please enter a valid email address'
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
    // Handle tenant_name - combine first_name and last_name if provided separately
    let tenantName = ''

    if (formData.tenant_name?.trim()) {
      tenantName = formData.tenant_name.trim()
    } else if (formData.first_name && formData.last_name) {
      tenantName = `${formData.first_name.trim()} ${formData.last_name.trim()}`.trim()
    }

    const baseData = {
      // Use backend database schema field names
      tenant_name: tenantName,
      tenant_email: formData.tenant_email?.trim().toLowerCase() || formData.email?.trim().toLowerCase(),
      phone: formData.phone?.trim() || null,
      tenant_nationality: formData.tenant_nationality?.trim() || null,
      emergency_contact_name: formData.emergency_contact_name?.trim() || null,
      emergency_contact_phone: formData.emergency_contact_phone?.trim() || null,
      emergency_contact_relation: formData.emergency_contact_relation?.trim() || formData.emergency_contact_relationship?.trim() || null,
      building_id: formData.building_id || null,
      room_id: formData.room_id || null,
      lease_start_date: formData.lease_start_date || null,
      lease_end_date: formData.lease_end_date || null,
      room_number: formData.room_number || null,
      deposit_amount: formData.deposit_amount ? parseFloat(formData.deposit_amount) : null,
      payment_status: formData.payment_status || null,
      rent_payment_method: formData.rent_payment_method || null,
      account_status: formData.account_status || 'ACTIVE',
      operator_id: formData.operator_id ? parseInt(formData.operator_id) : null,
      booking_type: formData.booking_type || null,
      special_requests: formData.special_requests?.trim() || null,
      communication_preferences: formData.communication_preferences || 'EMAIL',
      payment_reminders_enabled: formData.payment_reminders_enabled !== undefined ? Boolean(formData.payment_reminders_enabled) : true,
      last_payment_date: formData.last_payment_date || null,
      next_payment_date: formData.next_payment_date || null,
      has_pets: formData.has_pets !== undefined ? Boolean(formData.has_pets) : false,
      pet_details: formData.pet_details?.trim() || null,
      has_vehicles: formData.has_vehicles !== undefined ? Boolean(formData.has_vehicles) : false,
      vehicle_details: formData.vehicle_details?.trim() || null,
      has_renters_insurance: formData.has_renters_insurance !== undefined ? Boolean(formData.has_renters_insurance) : false,
      insurance_details: formData.insurance_details?.trim() || null,
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

    // Required field validation
    if (!data.building_name?.trim()) {
      errors.building_name = 'Building name is required'
    }

    // Address validation - flexible since only building_name is truly required in backend
    // But we want to encourage proper address data for usability
    if (!data.street?.trim() && !data.address?.trim() && !data.full_address?.trim()) {
      errors.street = 'Street address is recommended'
    }

    // Numeric field validation
    if (data.floors && (isNaN(data.floors) || data.floors < 1)) {
      errors.floors = 'Building must have at least 1 floor'
    }

    if (data.total_rooms && (isNaN(data.total_rooms) || data.total_rooms < 1)) {
      errors.total_rooms = 'Building must have at least 1 room'
    }

    if (data.total_bathrooms && (isNaN(data.total_bathrooms) || data.total_bathrooms < 0)) {
      errors.total_bathrooms = 'Total bathrooms cannot be negative'
    }

    if (data.year_built && (isNaN(data.year_built) || data.year_built < 1800 || data.year_built > new Date().getFullYear() + 5)) {
      errors.year_built = 'Please enter a valid year'
    }

    if (data.last_renovation && (isNaN(data.last_renovation) || data.last_renovation < 1800 || data.last_renovation > new Date().getFullYear() + 5)) {
      errors.last_renovation = 'Please enter a valid renovation year'
    }

    if (data.min_lease_term && (isNaN(data.min_lease_term) || data.min_lease_term < 1)) {
      errors.min_lease_term = 'Minimum lease term must be at least 1 month'
    }

    if (data.pref_min_lease_term && (isNaN(data.pref_min_lease_term) || data.pref_min_lease_term < 1)) {
      errors.pref_min_lease_term = 'Preferred minimum lease term must be at least 1 month'
    }

    // Validate operator_id if provided
    if (data.operator_id && (isNaN(data.operator_id) || data.operator_id < 1)) {
      errors.operator_id = 'Please select a valid operator'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  /**
   * Transform building form data using backend-sync transformation
   */
  private static transformBuildingData(formData: any): BuildingInsert {
    // Use the centralized transformation function from backend-sync
    return transformBuildingDataForBackend(formData) as BuildingInsert
  }
}

/**
 * Room Form Integration
 */
export class RoomFormIntegration {
  /**
   * Submit room form data
   */
  static async submitRoom(formData: any): Promise<FormSubmissionResult> {
    try {
      const validationResult = this.validateRoomData(formData)
      if (!validationResult.isValid) {
        return {
          success: false,
          validationErrors: validationResult.errors,
          message: 'Please correct the validation errors and try again.'
        }
      }

      // Extract room_photos before transformation (they're not part of the database schema)
      const roomPhotos = formData.room_photos
      console.log('🔍 Room photos extracted from form integration:', {
        hasRoomPhotos: !!roomPhotos,
        roomPhotosLength: roomPhotos?.length || 0,
        roomPhotosType: typeof roomPhotos,
        roomPhotosConstructor: roomPhotos?.constructor?.name,
        hasBuildingId: !!formData.building_id,
        buildingId: formData.building_id,
        roomPhotosArray: roomPhotos,
        fullFormData: formData
      })

      // Debug each file individually if they exist
      if (roomPhotos && roomPhotos.length > 0) {
        console.log('🔍 Individual file analysis:')
        roomPhotos.forEach((file, index) => {
          console.log(`File ${index + 1}:`, {
            name: file?.name,
            type: file?.type,
            size: file?.size,
            lastModified: file?.lastModified,
            isFile: file instanceof File,
            isBlob: file instanceof Blob,
            constructor: file?.constructor?.name,
            hasArrayBuffer: typeof file?.arrayBuffer === 'function',
            fileObject: file
          })
        })
      }

      const roomData: RoomInsert = this.transformRoomData(formData)
      const result = await databaseService.rooms.create(roomData)

      if (result.success) {
        const createdRoom = result.data
        console.log('✅ Room created successfully in form integration:', createdRoom)

        // Handle room image uploads if any images were provided
        if (roomPhotos && roomPhotos.length > 0 && formData.building_id) {
          try {
            console.log(`🚀 Starting room image upload process from form integration...`)
            console.log(`📸 Uploading ${roomPhotos.length} room images for room ${createdRoom.room_id}`)
            console.log(`🏢 Building ID: ${formData.building_id}`)

            // Import the upload function
            const { uploadRoomImages } = await import('./storage')

            // Upload images to Supabase Storage
            const uploadResults = await uploadRoomImages(formData.building_id, createdRoom.room_id, roomPhotos)

            // Analyze results
            const successfulUploads = uploadResults.filter(result => result.success)
            const failedUploads = uploadResults.filter(result => !result.success)

            console.log(`📊 Upload results: ${successfulUploads.length} successful, ${failedUploads.length} failed`)

            if (successfulUploads.length > 0) {
              // Extract image URLs from successful uploads
              const imageUrls = successfulUploads.map(result => result.url).filter(Boolean)
              
              console.log(`🔗 Image URLs to save:`, imageUrls)

              if (imageUrls.length > 0) {
                try {
                  // Update room record in database with image URLs
                  console.log(`💾 Updating room ${createdRoom.room_id} database record with ${imageUrls.length} image URLs...`)

                  // Import the improved database update function
                  const { updateRoomWithImages } = await import('./room-database-fix')
                  
                  const updateResult = await updateRoomWithImages(createdRoom.room_id, imageUrls)

                  if (updateResult.success) {
                    console.log('✅ Room database record updated successfully with image URLs')
                    console.log(`🎉 Complete success: Room created and ${imageUrls.length} images uploaded and saved`)
                  } else {
                    console.error('❌ Failed to update room database record:', updateResult.error)
                    console.error('🔍 Room exists in database:', updateResult.roomExists)
                    // Don't fail the entire operation if image URL update fails
                  }
                } catch (updateError) {
                  console.error('❌ Exception while updating room database record:', updateError)
                  // Don't fail the entire operation if image URL update fails
                }
              }
            }

            // Log any upload failures for debugging
            if (failedUploads.length > 0) {
              console.error(`❌ Failed uploads (${failedUploads.length}):`, failedUploads.map(f => ({
                fileName: f.fileName,
                error: f.error
              })))
            }

          } catch (imageError) {
            console.error('❌ Critical error during image upload process:', imageError)
            // Don't fail the entire room creation if image upload fails
          }
        } else if (roomPhotos && roomPhotos.length > 0) {
          console.warn('⚠️ Room photos provided but missing building_id - cannot upload images')
        } else {
          console.log('ℹ️ No room photos to upload')
        }

        return {
          success: true,
          data: result.data,
          message: 'Room created successfully!'
        }
      } else {
        const enhancedError = handleDatabaseError(result.error, 'room_creation')
        return {
          success: false,
          error: enhancedError.userMessage,
          message: 'Failed to create room. Please try again.'
        }
      }
    } catch (error) {
      const enhancedError = handleDatabaseError(error, 'room_form_submission')
      return {
        success: false,
        error: enhancedError.userMessage,
        message: 'An unexpected error occurred. Please try again.'
      }
    }
  }

  /**
   * Update room data
   */
  static async updateRoom(roomId: string, formData: any): Promise<FormSubmissionResult> {
    try {
      const validationResult = this.validateRoomData(formData, true)
      if (!validationResult.isValid) {
        return {
          success: false,
          validationErrors: validationResult.errors
        }
      }

      const roomData: RoomUpdate = this.transformRoomData(formData, true)
      const result = await databaseService.rooms.update(roomId, roomData)

      if (result.success) {
        return {
          success: true,
          data: result.data,
          message: 'Room updated successfully!'
        }
      } else {
        const enhancedError = handleDatabaseError(result.error, 'room_update')
        return {
          success: false,
          error: enhancedError.userMessage
        }
      }
    } catch (error) {
      const enhancedError = handleDatabaseError(error, 'room_form_update')
      return {
        success: false,
        error: enhancedError.userMessage
      }
    }
  }

  /**
   * Validate room form data
   */
  private static validateRoomData(formData: any, isUpdate = false): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {}

    // Required fields validation
    if (!isUpdate && !formData.room_number?.trim()) {
      errors.room_number = 'Room number is required'
    }

    if (!formData.building_id?.trim()) {
      errors.building_id = 'Building selection is required'
    }

    // Private room rent is required in backend schema
    if (formData.private_room_rent === undefined || formData.private_room_rent === null || formData.private_room_rent === '') {
      errors.private_room_rent = 'Private room rent is required'
    }

    // Validate numeric fields
    if (formData.private_room_rent !== undefined && formData.private_room_rent !== null && formData.private_room_rent !== '' && (isNaN(formData.private_room_rent) || formData.private_room_rent < 0)) {
      errors.private_room_rent = 'Private room rent must be a valid positive number'
    }

    if (formData.shared_room_rent_2 && (isNaN(formData.shared_room_rent_2) || formData.shared_room_rent_2 < 0)) {
      errors.shared_room_rent_2 = 'Shared room rent must be a valid positive number'
    }

    if (formData.bed_count && (isNaN(formData.bed_count) || formData.bed_count < 1)) {
      errors.bed_count = 'Bed count must be at least 1'
    }

    if (formData.maximum_people_in_room && (isNaN(formData.maximum_people_in_room) || formData.maximum_people_in_room < 1)) {
      errors.maximum_people_in_room = 'Maximum people must be at least 1'
    }

    if (formData.floor_number && (isNaN(formData.floor_number) || formData.floor_number < 1)) {
      errors.floor_number = 'Floor number must be at least 1'
    }

    if (formData.sq_footage && (isNaN(formData.sq_footage) || formData.sq_footage < 1)) {
      errors.sq_footage = 'Square footage must be at least 1'
    }

    // Remove the active_tenants vs maximum_people_in_room validation as it's not required
    // This validation was causing unnecessary errors when users set active tenants
    // The business logic doesn't require this constraint to be enforced at form level

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  /**
   * Transform room form data using backend-sync transformation
   */
  private static transformRoomData(formData: any, isUpdate = false): RoomInsert | RoomUpdate {
    // Use the centralized transformation function from backend-sync
    const transformedData = transformRoomDataForBackend(formData)
    
    if (isUpdate) {
      // For updates, remove room_id from the data
      const { room_id, ...updateData } = transformedData
      return updateData as RoomUpdate
    }
    
    return transformedData as RoomInsert
  }
}

/**
 * Lead Form Integration
 */
export class LeadFormIntegration {
  /**
   * Submit lead form data
   */
  static async submitLead(formData: any): Promise<FormSubmissionResult> {
    try {
      const validationResult = this.validateLeadData(formData)
      if (!validationResult.isValid) {
        return {
          success: false,
          validationErrors: validationResult.errors,
          message: 'Please correct the validation errors and try again.'
        }
      }

      const leadData: LeadInsert = this.transformLeadData(formData)
      const result = await databaseService.leads.create(leadData)

      if (result.success) {
        return {
          success: true,
          data: result.data,
          message: 'Lead created successfully!'
        }
      } else {
        const enhancedError = handleDatabaseError(result.error, 'lead_creation')
        return {
          success: false,
          error: enhancedError.userMessage,
          message: 'Failed to create lead. Please try again.'
        }
      }
    } catch (error) {
      const enhancedError = handleDatabaseError(error, 'lead_form_submission')
      return {
        success: false,
        error: enhancedError.userMessage,
        message: 'An unexpected error occurred. Please try again.'
      }
    }
  }

  /**
   * Validate lead form data
   */
  private static validateLeadData(formData: any): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {}

    // Required fields validation
    if (!formData.email?.trim()) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address'
    }

    // Validate numeric fields
    if (formData.lead_score && (isNaN(formData.lead_score) || formData.lead_score < 0 || formData.lead_score > 100)) {
      errors.lead_score = 'Lead score must be between 0 and 100'
    }

    if (formData.interaction_count && (isNaN(formData.interaction_count) || formData.interaction_count < 0)) {
      errors.interaction_count = 'Interaction count must be a positive number'
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  /**
   * Transform lead form data to database format
   */
  private static transformLeadData(formData: any): LeadInsert {
    return {
      lead_id: formData.lead_id || `LEAD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: formData.email?.trim().toLowerCase(),
      status: formData.status || 'EXPLORING',
      interaction_count: formData.interaction_count ? parseInt(formData.interaction_count) : 0,
      lead_score: formData.lead_score ? parseInt(formData.lead_score) : 0,
      preferred_communication: formData.preferred_communication || 'EMAIL',
      rooms_interested: formData.rooms_interested ? JSON.stringify(formData.rooms_interested) : null,
      showing_dates: formData.showing_dates ? JSON.stringify(formData.showing_dates) : null,
      selected_room_id: formData.selected_room_id || null,
      planned_move_in: formData.planned_move_in || null,
      planned_move_out: formData.planned_move_out || null,
      visa_status: formData.visa_status?.trim() || null,
      notes: formData.notes?.trim() || null,
      source: formData.source?.trim() || null,
      budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
      budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
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
      // operator_id will be auto-generated, so we don't include it
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone?.trim() || null,
      role: formData.role?.trim() || null,
      active: formData.active !== undefined ? Boolean(formData.active) : true,
      operator_type: formData.operator_type || 'LEASING_AGENT',
      date_joined: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD for Date column
      permissions: formData.permissions || null,
      notification_preferences: formData.notification_preferences || 'EMAIL',
      working_hours: formData.working_hours || null,
      emergency_contact: Boolean(formData.emergency_contact),
      calendar_sync_enabled: Boolean(formData.calendar_sync_enabled),
      calendar_external_id: null
    }
  }
}

// Export form integration services
export const formIntegration = {
  tenant: TenantFormIntegration,
  building: BuildingFormIntegration,
  room: RoomFormIntegration,
  lead: LeadFormIntegration,
  operator: OperatorFormIntegration
}
