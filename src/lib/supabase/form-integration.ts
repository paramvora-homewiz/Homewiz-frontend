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

    if (!data.building_name?.trim()) {
      errors.building_name = 'Building name is required'
    }
    // Check for street address (database uses 'street' field)
    if (!data.street?.trim() && !data.full_address?.trim()) {
      errors.street = 'Street address is required'
    }
    if (!data.city?.trim()) {
      errors.city = 'City is required'
    }
    if (!data.state?.trim()) {
      errors.state = 'State is required'
    }
    // Check for zip code (database uses 'zip' field)
    if (!data.zip?.trim()) {
      errors.zip = 'ZIP code is required'
    }
    // Note: building_type field doesn't exist in database schema, so we don't validate it

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
      building_id: formData.building_id || `BLD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate ID if missing
      building_name: formData.building_name.trim(),
      
      // Address fields (match database schema exactly)
      full_address: formData.full_address?.trim() || null,
      street: (formData.address || formData.street)?.trim() || null, // Use 'street' field as in database
      area: formData.area?.trim() || null,
      city: formData.city?.trim() || null,
      state: formData.state?.trim() || null,
      zip: (formData.zip_code || formData.zip)?.trim() || null, // Use 'zip' field as in database
      
      // Basic building info (building_type doesn't exist in database schema)
      year_built: formData.year_built ? parseInt(formData.year_built) : null,
      last_renovation: formData.last_renovation ? parseInt(formData.last_renovation) : null,
      operator_id: formData.operator_id || null,
      available: Boolean(formData.available ?? true),
      floors: formData.floors ? parseInt(formData.floors) : null,
      total_rooms: formData.total_rooms ? parseInt(formData.total_rooms) : null,
      total_bathrooms: formData.total_bathrooms ? parseInt(formData.total_bathrooms) : null,
      bathrooms_on_each_floor: formData.bathrooms_on_each_floor ? parseInt(formData.bathrooms_on_each_floor) : null,
      
      // Amenities and features
      common_kitchen: formData.common_kitchen || null,
      min_lease_term: formData.min_lease_term ? parseInt(formData.min_lease_term) : null,
      pref_min_lease_term: formData.pref_min_lease_term ? parseInt(formData.pref_min_lease_term) : null,
      wifi_included: Boolean(formData.wifi_included ?? false),
      laundry_onsite: Boolean(formData.laundry_onsite ?? false),
      common_area: formData.common_area?.trim() || null,
      secure_access: Boolean(formData.secure_access ?? false),
      bike_storage: Boolean(formData.bike_storage ?? false),
      rooftop_access: Boolean(formData.rooftop_access ?? false),
      pet_friendly: formData.pet_friendly || null,
      cleaning_common_spaces: formData.cleaning_common_spaces || null,
      utilities_included: Boolean(formData.utilities_included ?? false),
      fitness_area: Boolean(formData.fitness_area ?? false),
      work_study_area: Boolean(formData.work_study_area ?? false),
      social_events: Boolean(formData.social_events ?? false),
      nearby_conveniences_walk: formData.nearby_conveniences_walk?.trim() || null,
      nearby_transportation: formData.nearby_transportation?.trim() || null,
      priority: formData.priority ? parseInt(formData.priority) : null,
      
      // Additional info
      building_rules: formData.building_rules?.trim() || null,
      amenities_details: formData.amenities_details || null,
      neighborhood_description: formData.neighborhood_description?.trim() || null,
      building_description: formData.building_description?.trim() || null,
      public_transit_info: formData.public_transit_info?.trim() || null,
      parking_info: formData.parking_info?.trim() || null,
      security_features: formData.security_features?.trim() || null,
      disability_access: Boolean(formData.disability_access ?? false),
      disability_features: formData.disability_features?.trim() || null,
      building_images: formData.building_images || null,
      virtual_tour_url: formData.virtual_tour_url?.trim() || null,
      
      // Timestamps - let database handle these
      created_at: new Date().toISOString()
    }
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

      const roomData: RoomInsert = this.transformRoomData(formData)
      const result = await databaseService.rooms.create(roomData)

      if (result.success) {
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

    // Validate numeric fields
    if (formData.private_room_rent && (isNaN(formData.private_room_rent) || formData.private_room_rent < 0)) {
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

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  /**
   * Transform room form data to database format
   */
  private static transformRoomData(formData: any, isUpdate = false): RoomInsert | RoomUpdate {
    const baseData = {
      room_number: formData.room_number?.trim(),
      building_id: formData.building_id?.trim(),
      ready_to_rent: formData.ready_to_rent !== undefined ? Boolean(formData.ready_to_rent) : true,
      status: formData.status || 'AVAILABLE',
      booked_from: formData.booked_from || null,
      booked_till: formData.booked_till || null,
      active_tenants: formData.active_tenants ? parseInt(formData.active_tenants) : 0,
      maximum_people_in_room: formData.maximum_people_in_room ? parseInt(formData.maximum_people_in_room) : 1,
      available_from: formData.available_from || null,
      private_room_rent: formData.private_room_rent ? parseFloat(formData.private_room_rent) : null,
      shared_room_rent_2: formData.shared_room_rent_2 ? parseFloat(formData.shared_room_rent_2) : null,
      bed_count: formData.bed_count ? parseInt(formData.bed_count) : 1,
      bed_type: formData.bed_type?.trim() || null,
      bed_size: formData.bed_size?.trim() || null,
      bathroom_type: formData.bathroom_type?.trim() || null,
      sq_footage: formData.sq_footage ? parseInt(formData.sq_footage) : null, // Integer in database
      view: formData.view?.trim() || null,
      noise_level: formData.noise_level?.trim() || null,
      sunlight: formData.sunlight?.trim() || null,
      furnished: formData.furnished !== undefined ? Boolean(formData.furnished) : false,
      furniture_details: formData.furniture_details?.trim() || null,
      last_renovation_date: formData.last_renovation_date || null,
      public_notes: formData.public_notes?.trim() || null,
      internal_notes: formData.internal_notes?.trim() || null,
      virtual_tour_url: formData.virtual_tour_url?.trim() || null,
      additional_features: formData.additional_features?.trim() || null,
      room_images: formData.room_images || null,
      // Additional fields from database schema
      floor_number: formData.floor_number ? parseInt(formData.floor_number) : null,
      current_booking_types: formData.current_booking_types?.trim() || null,
      last_check: formData.last_check || null,
      last_check_by: formData.last_check_by ? parseInt(formData.last_check_by) : null,
      mini_fridge: formData.mini_fridge !== undefined ? Boolean(formData.mini_fridge) : false,
      sink: formData.sink !== undefined ? Boolean(formData.sink) : false,
      bedding_provided: formData.bedding_provided !== undefined ? Boolean(formData.bedding_provided) : false,
      work_desk: formData.work_desk !== undefined ? Boolean(formData.work_desk) : false,
      work_chair: formData.work_chair !== undefined ? Boolean(formData.work_chair) : false,
      heating: formData.heating !== undefined ? Boolean(formData.heating) : false,
      air_conditioning: formData.air_conditioning !== undefined ? Boolean(formData.air_conditioning) : false,
      cable_tv: formData.cable_tv !== undefined ? Boolean(formData.cable_tv) : false,
      room_storage: formData.room_storage?.trim() || null
    }

    if (!isUpdate) {
      // For new rooms, include room_id
      return {
        room_id: formData.room_id || `ROOM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...baseData
      } as RoomInsert
    }

    return baseData as RoomUpdate
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
