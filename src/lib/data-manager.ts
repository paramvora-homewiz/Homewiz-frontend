/**
 * Data Management Utilities for HomeWiz Frontend
 * 
 * This module provides comprehensive data management utilities including
 * JSON validation, data transformation, caching, and consistency checks.
 */

import { z } from 'zod'
import config from './config'

// Data validation schemas
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['no_access', 'view', 'submit', 'edit']),
  createdAt: z.string(),
  lastLogin: z.string().optional(),
})

export const OnboardingFormSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  preferred_communication: z.enum(['EMAIL', 'SMS', 'PHONE', 'BOTH']),

  // Professional Information
  occupation: z.string().min(1, 'Occupation is required'),
  company: z.string().optional(),
  annual_income: z.number().positive().optional(),
  visa_status: z.string().optional(),

  // Housing Preferences
  budget_min: z.number().positive('Minimum budget must be positive'),
  budget_max: z.number().positive('Maximum budget must be positive'),
  preferred_move_in_date: z.string(),
  preferred_lease_term: z.number().positive(),

  // Property Selection
  selected_room_id: z.string().optional(),
  selected_building_id: z.string().optional(),

  // Additional Information
  has_vehicles: z.boolean(),
  vehicle_details: z.string().optional(),
  has_renters_insurance: z.boolean(),
  insurance_details: z.string().optional(),
  pets: z.boolean(),
  pet_details: z.string().optional(),
  smoking: z.boolean(),
  additional_preferences: z.string().optional(),
})

export const BuildingSchema = z.object({
  building_id: z.string(),
  building_name: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  zip_code: z.string(),
  country: z.string(),
  operator_id: z.string(),
  total_rooms: z.number(),
  available_rooms: z.number(),
  building_type: z.string(),
  amenities: z.array(z.string()),
  year_built: z.number().optional(),
  disability_access: z.boolean(),
  building_images: z.array(z.string()).optional(),
})

export const RoomSchema = z.object({
  room_id: z.string(),
  room_number: z.string(),
  building_id: z.string(),
  ready_to_rent: z.boolean(),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED']),
  active_tenants: z.number(),
  maximum_people_in_room: z.number(),
  private_room_rent: z.number(),
  shared_room_rent_2: z.number().optional(),
  floor_number: z.number(),
  bed_count: z.number(),
  bathroom_type: z.string(),
  bed_size: z.string(),
  bed_type: z.string(),
  view: z.string().optional(),
  room_images: z.array(z.string()).optional(),
})

// Data transformation utilities
export class DataTransformer {
  /**
   * Transform form data to API format
   */
  static transformFormData(data: any): any {
    const transformed = { ...data }

    // Convert string numbers to numbers
    const numericFields = [
      'annual_income', 'budget_min', 'budget_max', 
      'preferred_lease_term', 'deposit_amount'
    ]
    
    numericFields.forEach(field => {
      if (transformed[field] && typeof transformed[field] === 'string') {
        const num = parseFloat(transformed[field])
        if (!isNaN(num)) {
          transformed[field] = num
        }
      }
    })

    // Convert string booleans to booleans
    const booleanFields = [
      'has_vehicles', 'has_renters_insurance', 'pets', 'smoking',
      'amenity_wifi', 'amenity_laundry', 'amenity_parking',
      'amenity_security', 'amenity_gym', 'amenity_common_area',
      'amenity_rooftop', 'amenity_bike_storage'
    ]
    
    booleanFields.forEach(field => {
      if (transformed[field] !== undefined) {
        transformed[field] = Boolean(transformed[field])
      }
    })

    // Format dates
    const dateFields = ['dateOfBirth', 'preferred_move_in_date', 'lease_start_date', 'lease_end_date']
    dateFields.forEach(field => {
      if (transformed[field] && typeof transformed[field] === 'string') {
        try {
          const date = new Date(transformed[field])
          transformed[field] = date.toISOString().split('T')[0] // YYYY-MM-DD format
        } catch (error) {
          console.warn(`Invalid date format for ${field}:`, transformed[field])
        }
      }
    })

    return transformed
  }

  /**
   * Transform API response to frontend format
   */
  static transformApiResponse(data: any): any {
    const transformed = { ...data }

    // Convert ISO dates to display format
    const dateFields = ['createdAt', 'lastLogin', 'lease_start_date', 'lease_end_date']
    dateFields.forEach(field => {
      if (transformed[field]) {
        try {
          const date = new Date(transformed[field])
          transformed[field] = date.toLocaleDateString()
        } catch (error) {
          console.warn(`Invalid date format for ${field}:`, transformed[field])
        }
      }
    })

    return transformed
  }

  /**
   * Sanitize data for storage
   */
  static sanitizeData(data: any): any {
    const sanitized = { ...data }

    // Remove sensitive fields
    const sensitiveFields = ['password', 'ssn', 'credit_card']
    sensitiveFields.forEach(field => {
      delete sanitized[field]
    })

    // Trim string fields
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = sanitized[key].trim()
      }
    })

    return sanitized
  }
}

// Data validation utilities
export class DataValidator {
  /**
   * Validate data against schema
   */
  static validate<T>(data: any, schema: z.ZodSchema<T>): { success: boolean; data?: T; errors?: string[] } {
    try {
      const validatedData = schema.parse(data)
      return { success: true, data: validatedData }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        return { success: false, errors }
      }
      return { success: false, errors: ['Validation failed'] }
    }
  }

  /**
   * Validate onboarding form data
   */
  static validateOnboardingForm(data: any) {
    return this.validate(data, OnboardingFormSchema)
  }

  /**
   * Validate user data
   */
  static validateUser(data: any) {
    return this.validate(data, UserSchema)
  }

  /**
   * Validate building data
   */
  static validateBuilding(data: any) {
    return this.validate(data, BuildingSchema)
  }

  /**
   * Validate room data
   */
  static validateRoom(data: any) {
    return this.validate(data, RoomSchema)
  }
}

// Data caching utilities
export class DataCache {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  /**
   * Set data in cache
   */
  static set(key: string, data: any, ttl: number = config.performance.cacheTtl): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl * 1000, // Convert to milliseconds
    })
  }

  /**
   * Get data from cache
   */
  static get(key: string): any | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    // Check if expired
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  /**
   * Clear cache
   */
  static clear(): void {
    this.cache.clear()
  }

  /**
   * Remove expired entries
   */
  static cleanup(): void {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// Data consistency utilities
export class DataConsistency {
  /**
   * Check data consistency between objects
   */
  static checkConsistency(obj1: any, obj2: any, fields: string[]): { consistent: boolean; differences: string[] } {
    const differences: string[] = []

    fields.forEach(field => {
      if (obj1[field] !== obj2[field]) {
        differences.push(`${field}: ${obj1[field]} !== ${obj2[field]}`)
      }
    })

    return {
      consistent: differences.length === 0,
      differences
    }
  }

  /**
   * Merge data objects with conflict resolution
   */
  static mergeData(target: any, source: any, strategy: 'source' | 'target' | 'newest' = 'source'): any {
    const merged = { ...target }

    Object.keys(source).forEach(key => {
      if (source[key] !== undefined) {
        if (strategy === 'source') {
          merged[key] = source[key]
        } else if (strategy === 'target') {
          // Keep target value
        } else if (strategy === 'newest') {
          // Use timestamp to determine newest
          const targetTime = target.lastModified || target.updatedAt || 0
          const sourceTime = source.lastModified || source.updatedAt || 0
          if (sourceTime > targetTime) {
            merged[key] = source[key]
          }
        }
      }
    })

    return merged
  }
}

// Export all utilities
export default {
  DataTransformer,
  DataValidator,
  DataCache,
  DataConsistency,
  schemas: {
    UserSchema,
    OnboardingFormSchema,
    BuildingSchema,
    RoomSchema,
  }
}
