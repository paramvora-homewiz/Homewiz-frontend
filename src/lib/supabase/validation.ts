/**
 * Comprehensive Data Validation and Sanitization for HomeWiz
 * 
 * This module provides:
 * - Input validation and sanitization
 * - Type checking and conversion
 * - Security measures against injection attacks
 * - Business logic validation
 * - Custom validation rules
 */

import { z } from 'zod'

// Common validation patterns
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phonePattern = /^\+?[\d\s\-\(\)]+$/
const zipCodePattern = /^\d{5}(-\d{4})?$/
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

// Custom validation functions
export const customValidators = {
  /**
   * Validate email address
   */
  email: (value: string): boolean => {
    return emailPattern.test(value.trim())
  },

  /**
   * Validate phone number
   */
  phone: (value: string): boolean => {
    return phonePattern.test(value.trim())
  },

  /**
   * Validate ZIP code
   */
  zipCode: (value: string): boolean => {
    return zipCodePattern.test(value.trim())
  },

  /**
   * Validate UUID
   */
  uuid: (value: string): boolean => {
    return uuidPattern.test(value.trim())
  },

  /**
   * Validate date range
   */
  dateRange: (startDate: string, endDate: string): boolean => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return end > start
  },

  /**
   * Validate positive number
   */
  positiveNumber: (value: number): boolean => {
    return !isNaN(value) && value > 0
  },

  /**
   * Validate year
   */
  year: (value: number): boolean => {
    const currentYear = new Date().getFullYear()
    return !isNaN(value) && value >= 1800 && value <= currentYear + 10
  }
}

// Sanitization functions
export const sanitizers = {
  /**
   * Sanitize string input
   */
  string: (value: string): string => {
    return value.trim().replace(/[<>]/g, '')
  },

  /**
   * Sanitize email
   */
  email: (value: string): string => {
    return value.trim().toLowerCase()
  },

  /**
   * Sanitize phone number
   */
  phone: (value: string): string => {
    return value.trim().replace(/[^\d\+\-\(\)\s]/g, '')
  },

  /**
   * Sanitize numeric input
   */
  number: (value: string | number): number | null => {
    const num = typeof value === 'string' ? parseFloat(value) : value
    return isNaN(num) ? null : num
  },

  /**
   * Sanitize boolean input
   */
  boolean: (value: any): boolean => {
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value === '1'
    }
    return Boolean(value)
  }
}

// Zod schemas for comprehensive validation
export const validationSchemas = {
  /**
   * Tenant validation schema
   */
  tenant: z.object({
    first_name: z.string()
      .min(1, 'First name is required')
      .max(50, 'First name must be less than 50 characters')
      .transform(sanitizers.string),
    
    last_name: z.string()
      .min(1, 'Last name is required')
      .max(50, 'Last name must be less than 50 characters')
      .transform(sanitizers.string),
    
    email: z.string()
      .email('Please enter a valid email address')
      .transform(sanitizers.email),
    
    phone: z.string()
      .optional()
      .refine(val => !val || customValidators.phone(val), 'Please enter a valid phone number')
      .transform(val => val ? sanitizers.phone(val) : null),
    
    date_of_birth: z.string()
      .optional()
      .refine(val => !val || !isNaN(Date.parse(val)), 'Please enter a valid date'),
    
    tenant_nationality: z.string()
      .optional()
      .transform(val => val ? sanitizers.string(val) : null),
    
    emergency_contact_name: z.string()
      .optional()
      .transform(val => val ? sanitizers.string(val) : null),
    
    emergency_contact_phone: z.string()
      .optional()
      .refine(val => !val || customValidators.phone(val), 'Please enter a valid emergency contact phone')
      .transform(val => val ? sanitizers.phone(val) : null),
    
    emergency_contact_relationship: z.string()
      .optional()
      .transform(val => val ? sanitizers.string(val) : null),
    
    building_id: z.string()
      .optional()
      .refine(val => !val || customValidators.uuid(val), 'Invalid building ID'),
    
    room_id: z.string()
      .optional()
      .refine(val => !val || customValidators.uuid(val), 'Invalid room ID'),
    
    lease_start_date: z.string()
      .optional()
      .refine(val => !val || !isNaN(Date.parse(val)), 'Please enter a valid lease start date'),
    
    lease_end_date: z.string()
      .optional()
      .refine(val => !val || !isNaN(Date.parse(val)), 'Please enter a valid lease end date'),
    
    rent_amount: z.number()
      .optional()
      .refine(val => val === undefined || customValidators.positiveNumber(val), 'Rent amount must be positive'),
    
    deposit_amount: z.number()
      .optional()
      .refine(val => val === undefined || customValidators.positiveNumber(val), 'Deposit amount must be positive'),
    
    payment_status: z.enum(['CURRENT', 'LATE', 'OVERDUE', 'PENDING']).optional(),
    
    rent_payment_method: z.enum(['BANK_TRANSFER', 'CREDIT_CARD', 'CHECK', 'CASH', 'OTHER']).optional(),
    
    account_status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).default('ACTIVE'),
    
    operator_id: z.number().optional(),
    
    booking_type: z.enum(['PRIVATE', 'SHARED_2', 'SHARED_3', 'SHARED_4']).optional(),
    
    special_requests: z.string()
      .optional()
      .transform(val => val ? sanitizers.string(val) : null),
    
    communication_preferences: z.string().optional(),
    
    payment_reminders_enabled: z.boolean().default(true),
    
    has_pets: z.boolean().default(false),
    
    has_vehicles: z.boolean().default(false),
    
    has_renters_insurance: z.boolean().default(false),
    
    status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'TERMINATED']).default('ACTIVE')
  }).refine(data => {
    // Custom validation: lease dates
    if (data.lease_start_date && data.lease_end_date) {
      return customValidators.dateRange(data.lease_start_date, data.lease_end_date)
    }
    return true
  }, {
    message: 'Lease end date must be after start date',
    path: ['lease_end_date']
  }),

  /**
   * Building validation schema
   */
  building: z.object({
    building_name: z.string()
      .min(1, 'Building name is required')
      .max(100, 'Building name must be less than 100 characters')
      .transform(sanitizers.string),
    
    address: z.string()
      .min(1, 'Address is required')
      .max(200, 'Address must be less than 200 characters')
      .transform(sanitizers.string),
    
    city: z.string()
      .min(1, 'City is required')
      .max(50, 'City must be less than 50 characters')
      .transform(sanitizers.string),
    
    state: z.string()
      .min(1, 'State is required')
      .max(50, 'State must be less than 50 characters')
      .transform(sanitizers.string),
    
    zip_code: z.string()
      .refine(customValidators.zipCode, 'Please enter a valid ZIP code')
      .transform(sanitizers.string),
    
    country: z.string()
      .default('United States')
      .transform(sanitizers.string),
    
    total_units: z.number()
      .min(1, 'Total units must be at least 1')
      .max(10000, 'Total units cannot exceed 10,000'),
    
    available_units: z.number()
      .min(0, 'Available units cannot be negative')
      .optional(),
    
    building_type: z.enum(['APARTMENT', 'CONDO', 'HOUSE', 'TOWNHOUSE', 'STUDIO', 'OTHER']),
    
    year_built: z.number()
      .optional()
      .refine(val => val === undefined || customValidators.year(val), 'Please enter a valid year'),
    
    amenities: z.any().optional(),
    
    contact_info: z.any().optional(),
    
    status: z.enum(['ACTIVE', 'INACTIVE', 'UNDER_CONSTRUCTION', 'MAINTENANCE']).default('ACTIVE'),
    
    area: z.string()
      .optional()
      .transform(val => val ? sanitizers.string(val) : null),
    
    description: z.string()
      .optional()
      .max(1000, 'Description must be less than 1000 characters')
      .transform(val => val ? sanitizers.string(val) : null),
    
    images: z.any().optional(),
    
    parking_available: z.boolean().default(false),
    
    pet_friendly: z.boolean().default(false),
    
    furnished_options: z.boolean().default(false)
  }).refine(data => {
    // Custom validation: available units <= total units
    if (data.available_units !== undefined) {
      return data.available_units <= data.total_units
    }
    return true
  }, {
    message: 'Available units cannot exceed total units',
    path: ['available_units']
  }),

  /**
   * Operator validation schema
   */
  operator: z.object({
    name: z.string()
      .min(1, 'Name is required')
      .max(100, 'Name must be less than 100 characters')
      .transform(sanitizers.string),
    
    email: z.string()
      .email('Please enter a valid email address')
      .transform(sanitizers.email),
    
    phone: z.string()
      .optional()
      .refine(val => !val || customValidators.phone(val), 'Please enter a valid phone number')
      .transform(val => val ? sanitizers.phone(val) : null),
    
    operator_type: z.enum(['ADMIN', 'MANAGER', 'LEASING_AGENT', 'MAINTENANCE', 'SUPPORT']),
    
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).default('ACTIVE'),
    
    department: z.string()
      .optional()
      .transform(val => val ? sanitizers.string(val) : null),
    
    hire_date: z.string()
      .optional()
      .refine(val => !val || !isNaN(Date.parse(val)), 'Please enter a valid hire date'),
    
    permissions: z.any().optional()
  }),

  /**
   * Lead validation schema
   */
  lead: z.object({
    email: z.string()
      .email('Please enter a valid email address')
      .transform(sanitizers.email),
    
    first_name: z.string()
      .optional()
      .transform(val => val ? sanitizers.string(val) : null),
    
    last_name: z.string()
      .optional()
      .transform(val => val ? sanitizers.string(val) : null),
    
    phone: z.string()
      .optional()
      .refine(val => !val || customValidators.phone(val), 'Please enter a valid phone number')
      .transform(val => val ? sanitizers.phone(val) : null),
    
    status: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST']).default('NEW'),
    
    source: z.string()
      .optional()
      .transform(val => val ? sanitizers.string(val) : null),
    
    notes: z.string()
      .optional()
      .max(2000, 'Notes must be less than 2000 characters')
      .transform(val => val ? sanitizers.string(val) : null),
    
    assigned_operator_id: z.number().optional(),
    
    interested_buildings: z.any().optional(),
    
    budget_range: z.any().optional(),
    
    move_in_date: z.string()
      .optional()
      .refine(val => !val || !isNaN(Date.parse(val)), 'Please enter a valid move-in date'),
    
    preferences: z.any().optional()
  })
}

/**
 * Validation service class
 */
export class ValidationService {
  /**
   * Validate data against a schema
   */
  static validate<T>(schema: z.ZodSchema<T>, data: any): { success: boolean; data?: T; errors?: Record<string, string> } {
    try {
      const result = schema.parse(data)
      return {
        success: true,
        data: result
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {}
        error.errors.forEach(err => {
          const path = err.path.join('.')
          errors[path] = err.message
        })
        return {
          success: false,
          errors
        }
      }
      return {
        success: false,
        errors: { general: 'Validation failed' }
      }
    }
  }

  /**
   * Validate tenant data
   */
  static validateTenant(data: any) {
    return this.validate(validationSchemas.tenant, data)
  }

  /**
   * Validate building data
   */
  static validateBuilding(data: any) {
    return this.validate(validationSchemas.building, data)
  }

  /**
   * Validate operator data
   */
  static validateOperator(data: any) {
    return this.validate(validationSchemas.operator, data)
  }

  /**
   * Validate lead data
   */
  static validateLead(data: any) {
    return this.validate(validationSchemas.lead, data)
  }
}

// Export validation service
export const validator = ValidationService
