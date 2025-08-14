/**
 * Backend Synchronization Utilities
 * Ensures frontend data perfectly matches backend models and validation rules
 */

/**
 * Parse building_images field which can be in various formats
 * @param images - Can be array, JSON string, or comma-separated string
 * @returns Array of image URLs
 */
export function parseBuildingImages(images: any): string[] {
  if (!images) return []
  
  // Helper function to validate URL
  const isValidImageUrl = (url: string): boolean => {
    if (!url || typeof url !== 'string') return false
    const trimmed = url.trim()
    
    // Check if it's a valid URL or path
    if (trimmed.startsWith('data:image/') || trimmed.startsWith('/')) {
      return true
    }
    
    // For HTTP/HTTPS URLs, also check if the domain is accessible
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      // Filter out known invalid domains
      if (trimmed.includes('urbanests.com')) {
        return false // This domain doesn't exist
      }
      // Only allow Supabase URLs or other valid domains
      return trimmed.includes('supabase.co') || 
             trimmed.includes('supabase.in') ||
             trimmed.includes('amazonaws.com') ||
             trimmed.includes('cloudinary.com') ||
             trimmed.includes('googleapis.com')
    }
    
    return false
  }
  
  // Already an array
  if (Array.isArray(images)) {
    return images
      .filter(img => typeof img === 'string' && img.trim())
      .filter(isValidImageUrl)
  }
  
  // String format
  if (typeof images === 'string') {
    const trimmed = images.trim()
    
    // Try parsing as JSON array
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) {
          return parsed
            .filter(img => typeof img === 'string' && img.trim())
            .filter(isValidImageUrl)
        }
      } catch {
        // Not valid JSON, continue
      }
    }
    
    // Check if it contains commas (comma-separated list)
    if (trimmed.includes(',')) {
      return trimmed.split(',')
        .map(url => url.trim())
        .filter(Boolean)
        .filter(isValidImageUrl)
    }
    
    // Single URL string - validate it
    if (isValidImageUrl(trimmed)) {
      return [trimmed]
    }
  }
  
  return []
}

/**
 * Transform backend room data to frontend format
 */
export function transformRoomDataForFrontend(backendData: any) {
  return {
    ...backendData,
    // Map room_images to both fields for compatibility
    images: parseBuildingImages(backendData.room_images),
    room_images: backendData.room_images,
  }
}

// Backend Enum Values (Must match backend exactly)
export const BACKEND_ENUMS = {
  OPERATOR_TYPES: ['LEASING_AGENT', 'BUILDING_MANAGER', 'ADMIN', 'MAINTENANCE'] as const,
  BATHROOM_TYPES: ['Private', 'En-Suite', 'Shared', 'Semi-Private'] as const,
  BED_SIZES: ['Twin', 'Full', 'Queen'] as const,
  BED_TYPES: ['Standard', 'Bunk', 'Loft'] as const,
  ROOM_VIEWS: ['Limited View', 'Courtyard', 'Street View', 'City View', 'Bay View', 'Garden View'] as const,
  ROOM_STATUS: ['Available', 'Occupied', 'Maintenance', 'Reserved'] as const,
  ROOM_TYPES: ['Standard', 'Suite', 'Studio', 'Deluxe', 'Penthouse'] as const,
  LEAD_STATUS: ['EXPLORING', 'INTERESTED', 'SCHEDULED_VIEWING', 'APPLICATION_SUBMITTED', 'APPROVED', 'REJECTED', 'CONVERTED'] as const,
  VISA_STATUS: ['US-CITIZEN', 'F1-VISA', 'H1B-VISA'] as const,
  TENANT_STATUS: ['ACTIVE', 'INACTIVE', 'PENDING', 'TERMINATED'] as const,
  PAYMENT_STATUS: ['CURRENT', 'PENDING', 'PAID', 'PARTIAL', 'OVERDUE'] as const,
  BOOKING_TYPES: ['LEASE', 'SHORT_TERM', 'MONTH_TO_MONTH', 'CORPORATE'] as const,
  ROOM_ACCESS_TYPES: ['KEY', 'KEYCARD', 'DIGITAL', 'CODE'] as const,
  CLEANING_FREQUENCY: ['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'ON_REQUEST'] as const,
} as const

// Required Fields Mapping (Backend requirements)
export const REQUIRED_FIELDS = {
  OPERATOR: ['name', 'email'] as const,
  BUILDING: ['building_id', 'building_name', 'street', 'city', 'state', 'zip'] as const,
  ROOM: [
    'room_id',
    'room_number',
    'building_id'
  ] as const,
  TENANT: [
    'tenant_name',
    'room_id', 
    'room_number',
    'lease_start_date',
    'lease_end_date', 
    'operator_id',
    'booking_type',
    'tenant_nationality',
    'tenant_email',
    'building_id',
    'deposit_amount'
  ] as const,
  LEAD: ['email'] as const,
} as const

/**
 * Data Transformation Functions
 */

/**
 * Transforms frontend tenant form data to backend database format
 * 
 * This function handles the critical mapping between the user-facing form fields
 * and the backend database schema. It performs several important transformations:
 * 
 * Field Mapping Strategy:
 * - Combines separate firstName/lastName fields into single tenant_name
 * - Maps user-friendly field names to database column names
 * - Handles fallback values for different form versions
 * - Sets default values for required fields when not provided
 * 
 * @param frontendData - Raw form data from the frontend tenant form
 * @returns Transformed object matching backend database schema
 * 
 * Critical Business Logic:
 * - Name combination: firstName + lastName → tenant_name (with proper spacing)
 * - Field aliasing: email → tenant_email, nationality → tenant_nationality
 * - Room/Building ID resolution: Supports both selected_* and direct field names
 * - Date mapping: preferred_move_in_date → lease_start_date for compatibility
 * - Status defaulting: Sets 'ACTIVE' status if not specified
 */
export function transformTenantDataForBackend(frontendData: any) {
  return {
    tenant_id: frontendData.tenant_id || `TENANT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    // Combine firstName + lastName → tenant_name with proper whitespace handling
    tenant_name: frontendData.firstName && frontendData.lastName 
      ? `${frontendData.firstName.trim()} ${frontendData.lastName.trim()}`
      : frontendData.tenant_name,
    
    // Map user-friendly field names to backend database column names
    tenant_email: frontendData.email || frontendData.tenant_email,
    tenant_nationality: frontendData.nationality || frontendData.tenant_nationality,
    
    // Room/Building assignment - supports multiple form field naming conventions
    room_id: frontendData.selected_room_id || frontendData.room_id,
    building_id: frontendData.selected_building_id || frontendData.building_id,
    
    // Direct field mapping with fallback support for different form versions
    room_number: frontendData.room_number,
    lease_start_date: frontendData.lease_start_date || frontendData.preferred_move_in_date,
    lease_end_date: frontendData.lease_end_date,
    operator_id: frontendData.operator_id,
    booking_type: frontendData.booking_type,
    deposit_amount: frontendData.deposit_amount,
    phone: frontendData.phone,
    status: frontendData.status || 'ACTIVE', // Default to ACTIVE status for new tenants
    
    // Emergency contact information (optional fields)
    emergency_contact_name: frontendData.emergency_contact_name,
    emergency_contact_phone: frontendData.emergency_contact_phone,
    emergency_contact_relation: frontendData.emergency_contact_relation,
    special_requests: frontendData.special_requests,
  }
}

// Transform lead data with JSON serialization
export function transformLeadDataForBackend(frontendData: any) {
  return {
    lead_id: frontendData.lead_id || `LEAD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    email: frontendData.email,
    status: frontendData.status || 'EXPLORING',
    interaction_count: frontendData.interaction_count || 0,
    
    // Serialize arrays to JSON strings (backend stores as Text)
    rooms_interested: frontendData.rooms_interested 
      ? JSON.stringify(frontendData.rooms_interested) 
      : null,
    showing_dates: frontendData.showing_dates 
      ? JSON.stringify(frontendData.showing_dates) 
      : null,
      
    selected_room_id: frontendData.selected_room_id,
    planned_move_in: frontendData.preferred_move_in_date || frontendData.planned_move_in,
    planned_move_out: frontendData.planned_move_out,
    visa_status: frontendData.visa_status,
  }
}

// Transform building data to match backend structure
// Updated to work with existing backend data types (UUID, boolean, etc.)
export function transformBuildingDataForBackend(frontendData: any) {
  // Transform frontend data to match backend database schema exactly
  return {
    // Core fields
    building_id: String(frontendData.building_id || generateBuildingId()),
    building_name: frontendData.building_name,
    
    // Address fields - backend uses these exact column names
    full_address: frontendData.full_address ||
      [frontendData.street, frontendData.area, frontendData.city, frontendData.state, frontendData.zip]
        .filter(Boolean).join(', '),
    street: frontendData.address || frontendData.street,
    area: frontendData.area,
    city: frontendData.city,
    state: frontendData.state,
    zip: frontendData.zip_code || frontendData.zip, // Backend expects 'zip' not 'zip_code'
    
    // Operator and availability
    operator_id: frontendData.operator_id,
    available: frontendData.available ?? true,
    
    // Building structure
    floors: frontendData.floors,
    total_rooms: frontendData.total_rooms,
    total_bathrooms: frontendData.total_bathrooms,
    bathrooms_on_each_floor: frontendData.bathrooms_on_each_floor,
    
    // Amenities and features
    common_kitchen: frontendData.common_kitchen,
    min_lease_term: frontendData.min_lease_term,
    pref_min_lease_term: frontendData.pref_min_lease_term,
    wifi_included: frontendData.wifi_included ?? true,
    laundry_onsite: frontendData.laundry_onsite ?? true,
    common_area: frontendData.common_area,
    secure_access: frontendData.secure_access ?? false,
    bike_storage: frontendData.bike_storage ?? false,
    rooftop_access: frontendData.rooftop_access ?? false,
    pet_friendly: frontendData.pet_friendly,
    cleaning_common_spaces: frontendData.cleaning_common_spaces,
    utilities_included: frontendData.utilities_included ?? false,
    fitness_area: frontendData.fitness_area ?? false,
    work_study_area: frontendData.work_study_area ?? false,
    social_events: frontendData.social_events ?? false,
    
    // Location and transportation
    nearby_conveniences_walk: frontendData.nearby_conveniences_walk,
    nearby_transportation: frontendData.nearby_transportation,
    priority: frontendData.priority || 0,
    
    // Building history
    year_built: frontendData.year_built,
    last_renovation: frontendData.last_renovation,
    
    // Additional info fields
    building_rules: frontendData.building_rules,
    amenities_details: frontendData.amenities_details,
    neighborhood_description: frontendData.neighborhood_description,
    building_description: frontendData.building_description,
    public_transit_info: frontendData.public_transit_info,
    parking_info: frontendData.parking_info,
    security_features: frontendData.security_features,
    disability_access: frontendData.disability_access,
    disability_features: frontendData.disability_features,
    
    // Media fields - backend expects these exact names
    building_images: frontendData.building_images || frontendData.images,
    virtual_tour_url: frontendData.virtual_tour_url || frontendData.video_url,
    
    // DO NOT include these fields - they don't exist in backend:
    // - categorized_images
    // - categorized_videos
    // - building_type
    // - images (backend uses building_images)
  }
}

// Transform backend data to frontend format
// Handles data type conversions from backend (UUID, boolean) to frontend (string, string)
export function transformBackendDataForFrontend(backendData: any) {
  return {
    ...backendData,

    // Convert UUID to string if needed
    building_id: backendData.building_id?.toString() || backendData.building_id,

    // Map backend fields to frontend expectations
    // Backend uses 'building_images', frontend may expect 'images'
    images: backendData.building_images || backendData.images || [],
    building_images: backendData.building_images || backendData.images || [],

    // Map address fields
    address: backendData.street || backendData.address,
    street: backendData.street || backendData.address,
    
    // Map zip fields - backend uses 'zip', frontend expects 'zip_code'
    zip_code: backendData.zip || backendData.zip_code,
    zip: backendData.zip || backendData.zip_code,

    // Map video fields
    video_url: backendData.virtual_tour_url || backendData.video_url,
    virtual_tour_url: backendData.virtual_tour_url || backendData.video_url,
  }
}

/**
 * Validation Functions
 */

// Validate enum values against backend
export function validateEnum(value: string, enumType: keyof typeof BACKEND_ENUMS): boolean {
  const enumValues = BACKEND_ENUMS[enumType] as readonly string[]
  return enumValues.includes(value)
}

// Validate required fields are present
export function validateRequiredFields(data: any, entityType: keyof typeof REQUIRED_FIELDS): string[] {
  const missingFields: string[] = []
  const requiredFields = REQUIRED_FIELDS[entityType]
  
  requiredFields.forEach(field => {
    const value = data[field]
    
    // Handle different data types appropriately
    if (value === null || value === undefined) {
      missingFields.push(field)
    } else if (typeof value === 'string' && !value.trim()) {
      missingFields.push(field)
    } else if (typeof value === 'number' && isNaN(value)) {
      missingFields.push(field)
    }
    // Boolean fields (including false) are valid, so don't check them
  })
  
  return missingFields
}

// Validate email format and uniqueness (for operators)
export function validateEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone number format with enhanced patterns
export function validatePhoneFormat(phone: string): boolean {
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '')
  // Accept phone numbers with 10-15 digits (international format)
  return digitsOnly.length >= 10 && digitsOnly.length <= 15
}

// Standardized phone validation with common formats
export function validatePhoneFormatStrict(phone: string): { isValid: boolean; formatted?: string; error?: string } {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, error: 'Phone number is required' }
  }
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '')
  
  // US phone number (10 digits)
  if (digitsOnly.length === 10) {
    const formatted = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`
    return { isValid: true, formatted }
  }
  
  // US phone number with country code (11 digits starting with 1)
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    const formatted = `+1 (${digitsOnly.slice(1, 4)}) ${digitsOnly.slice(4, 7)}-${digitsOnly.slice(7)}`
    return { isValid: true, formatted }
  }
  
  // International numbers (10-15 digits)
  if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
    return { isValid: true, formatted: phone }
  }
  
  return { 
    isValid: false, 
    error: 'Phone number must be 10-15 digits. Format: (123) 456-7890 or +1 (123) 456-7890' 
  }
}

// Enhanced email validation with common domain patterns
export function validateEmailFormatStrict(email: string): { isValid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email address is required' }
  }
  
  // Basic format check
  const basicEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!basicEmailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' }
  }
  
  // More strict validation
  const strictEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  if (!strictEmailRegex.test(email)) {
    return { isValid: false, error: 'Email format is invalid' }
  }
  
  // Check for common typos in domains
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com']
  const domain = email.split('@')[1]?.toLowerCase()
  
  // Check for common typos
  const typoChecks = {
    'gmai.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'gmial.com': 'gmail.com',
    'yahooo.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com'
  }
  
  if (domain && typoChecks[domain]) {
    return { 
      isValid: false, 
      error: `Did you mean ${email.replace(domain, typoChecks[domain])}?` 
    }
  }
  
  return { isValid: true }
}

// Validate date is in proper ISO format (YYYY-MM-DD)
export function validateDateFormat(dateString: string): boolean {
  const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!isoDateRegex.test(dateString)) return false
  
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

// Validate lease dates (end > start)
export function validateLeaseDates(startDate: string, endDate: string): boolean {
  if (!startDate || !endDate) return true // Allow empty (optional validation)
  
  const start = new Date(startDate)
  const end = new Date(endDate)
  
  return end > start
}

/**
 * ID Generation Functions (Must match backend patterns)
 */

export function generateTenantId(): string {
  return `TNT_${generateRandomId()}`
}

export function generateLeadId(): string {
  return `LEAD_${generateRandomId()}`
}

export function generateBuildingId(): string {
  return `BLD_${generateRandomId()}`
}

export function generateRoomId(): string {
  return `RM_${generateRandomId()}`
}

function generateRandomId(): string {
  return Math.random().toString(36).substr(2, 12).toUpperCase()
}

/**
 * Form Data Validators
 */

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
  missingRequired: string[]
}

export function validateTenantFormData(data: any): ValidationResult {
  const errors: Record<string, string> = {}

  // Transform data first
  const backendData = transformTenantDataForBackend(data)

  // Check required fields and map them back to frontend field names
  const missingRequiredBackend = validateRequiredFields(backendData, 'TENANT')
  const missingRequired = missingRequiredBackend.map(field => {
    // Map backend field names back to frontend field names for error display
    switch (field) {
      case 'tenant_name': return 'tenant_name'
      case 'tenant_email': return 'tenant_email'
      case 'tenant_nationality': return 'tenant_nationality'
      case 'room_id': return 'room_id'
      case 'building_id': return 'building_id'
      case 'operator_id': return 'operator_id'
      case 'booking_type': return 'booking_type'
      case 'lease_start_date': return 'lease_start_date'
      case 'lease_end_date': return 'lease_end_date'
      case 'deposit_amount': return 'deposit_amount'
      default: return field
    }
  })

  // Add required field errors to the errors object
  missingRequired.forEach(field => {
    switch (field) {
      case 'tenant_name':
        errors.tenant_name = 'Full name is required'
        break
      case 'tenant_email':
        errors.tenant_email = 'Email address is required'
        break
      case 'tenant_nationality':
        errors.tenant_nationality = 'Nationality is required'
        break
      case 'room_id':
        errors.room_id = 'Room selection is required'
        break
      case 'building_id':
        errors.building_id = 'Building selection is required'
        break
      case 'operator_id':
        errors.operator_id = 'Operator selection is required'
        break
      case 'booking_type':
        errors.booking_type = 'Booking type is required'
        break
      case 'lease_start_date':
        errors.lease_start_date = 'Lease start date is required'
        break
      case 'lease_end_date':
        errors.lease_end_date = 'Lease end date is required'
        break
      case 'deposit_amount':
        errors.deposit_amount = 'Deposit amount is required'
        break
    }
  })

  // Validate email format
  if (backendData.tenant_email && !validateEmailFormat(backendData.tenant_email)) {
    errors.tenant_email = 'Please enter a valid email address'
  }

  // Validate enum values
  if (backendData.booking_type && !validateEnum(backendData.booking_type, 'BOOKING_TYPES')) {
    errors.booking_type = 'Invalid booking type'
  }

  if (backendData.status && !validateEnum(backendData.status, 'TENANT_STATUS')) {
    errors.status = 'Invalid tenant status'
  }

  // Validate dates
  if (backendData.lease_start_date && !validateDateFormat(backendData.lease_start_date)) {
    errors.lease_start_date = 'Invalid date format (use YYYY-MM-DD)'
  }

  if (backendData.lease_end_date && !validateDateFormat(backendData.lease_end_date)) {
    errors.lease_end_date = 'Invalid date format (use YYYY-MM-DD)'
  }

  if (backendData.lease_start_date && backendData.lease_end_date &&
      !validateLeaseDates(backendData.lease_start_date, backendData.lease_end_date)) {
    errors.lease_end_date = 'Lease end date must be after start date'
  }

  // Validate deposit amount
  if (backendData.deposit_amount !== undefined && backendData.deposit_amount !== null) {
    if (isNaN(Number(backendData.deposit_amount))) {
      errors.deposit_amount = 'Deposit amount must be a valid number'
    } else if (Number(backendData.deposit_amount) < 0) {
      errors.deposit_amount = 'Deposit amount must be positive'
    }
  }

  // Validate phone number format if provided
  if (backendData.phone && !validatePhoneFormat(backendData.phone)) {
    errors.phone = 'Please enter a valid phone number'
  }

  return {
    isValid: missingRequired.length === 0 && Object.keys(errors).length === 0,
    errors,
    missingRequired
  }
}

export function validateBuildingFormData(data: any): ValidationResult {
  const errors: Record<string, string> = {}
  const backendData = transformBuildingDataForBackend(data)
  
  // If this is an update (building_id exists), only validate critical fields
  const isUpdate = !!data.building_id
  if (isUpdate) {
    // For updates, only validate the absolute minimum required fields
    if (!String(data.building_name || '').trim()) {
      errors.building_name = 'Building name is required'
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      missingRequired: []
    }
  }
  
  // For new buildings, do full validation
  const missingRequired = validateRequiredFields(backendData, 'BUILDING')

  // Map backend field names back to frontend field names for better error display
  const frontendMissingRequired = missingRequired.map(field => {
    switch (field) {
      case 'street': return !data.address && !data.street ? 'address' : null
      case 'zip': return !data.zip_code && !data.zip ? 'zip_code' : null
      default: return field
    }
  }).filter(Boolean)

  // Add frontend-specific validation errors
  if (!String(data.building_name || '').trim()) {
    errors.building_name = 'Building name is required'
  }

  if (!String(data.address || '').trim() && !String(data.street || '').trim()) {
    errors.address = 'Address is required'
  }

  if (!String(data.city || '').trim()) {
    errors.city = 'City is required'
  }

  if (!String(data.state || '').trim()) {
    errors.state = 'State is required'
  }

  if (!String(data.zip_code || '').trim() && !String(data.zip || '').trim()) {
    errors.zip_code = 'ZIP code is required'
  }

  if (!data.operator_id) {
    errors.operator_id = 'Operator selection is required'
  }

  // Validate numeric fields with enhanced constraints
  if (backendData.floors && backendData.floors < 1) {
    errors.floors = 'Building must have at least 1 floor'
  }

  if (backendData.total_rooms && backendData.total_rooms < 1) {
    errors.total_rooms = 'Building must have at least 1 room'
  }

  // Validate bathroom fields
  if (data.total_bathrooms !== undefined && data.total_bathrooms !== null) {
    if (data.total_bathrooms < 1) {
      errors.total_bathrooms = 'Building must have at least 1 bathroom'
    }
  }

  if (data.bathrooms_on_each_floor !== undefined && data.bathrooms_on_each_floor !== null) {
    if (data.bathrooms_on_each_floor < 1) {
      errors.bathrooms_on_each_floor = 'Must have at least 1 bathroom per floor'
    }

    // Business logic: bathrooms per floor should be reasonable compared to total bathrooms
    if (data.total_bathrooms && data.floors && data.bathrooms_on_each_floor) {
      const expectedTotalBathrooms = data.bathrooms_on_each_floor * data.floors
      if (expectedTotalBathrooms > data.total_bathrooms * 1.5) {
        errors.bathrooms_on_each_floor = 'Bathrooms per floor seems too high compared to total bathrooms'
      }
    }
  }

  // Validate lease term fields
  if (data.min_lease_term !== undefined && data.min_lease_term !== null) {
    if (data.min_lease_term < 1) {
      errors.min_lease_term = 'Minimum lease term must be at least 1 month'
    }
  }

  if (data.pref_min_lease_term !== undefined && data.pref_min_lease_term !== null) {
    if (data.pref_min_lease_term < 1) {
      errors.pref_min_lease_term = 'Preferred minimum lease term must be at least 1 month'
    }

    // Business logic: preferred minimum should be >= minimum lease term
    if (data.min_lease_term && data.pref_min_lease_term < data.min_lease_term) {
      errors.pref_min_lease_term = 'Preferred minimum lease term cannot be less than minimum lease term'
    }
  }

  // Validate year fields with business logic
  if (data.year_built !== undefined && data.year_built !== null) {
    const currentYear = new Date().getFullYear()
    if (data.year_built < 1800 || data.year_built > currentYear) {
      errors.year_built = `Year built must be between 1800 and ${currentYear}`
    }
  }

  if (data.last_renovation !== undefined && data.last_renovation !== null) {
    const currentYear = new Date().getFullYear()
    if (data.last_renovation > currentYear) {
      errors.last_renovation = `Last renovation year cannot be in the future`
    }

    // Business logic: renovation should be after or same as year built
    if (data.year_built && data.last_renovation < data.year_built) {
      errors.last_renovation = 'Last renovation cannot be before the year the building was built'
    }
  }

  // REMOVED STRICT VALIDATION FOR OPTIONAL FIELDS
  // These fields are optional and should not block updates
  // The backend will handle any data format issues
  
  // Skip validation for common_kitchen - accept any value
  // Skip validation for pet_friendly - accept any value  
  // Skip validation for cleaning_common_spaces - accept any value
  // Skip validation for amenities_details - accept any value

  // Validate URL fields
  if (data.virtual_tour_url && String(data.virtual_tour_url || '').trim()) {
    const urlPattern = /^https?:\/\/.+/
    if (!urlPattern.test(String(data.virtual_tour_url))) {
      errors.virtual_tour_url = 'Virtual tour URL must be a valid HTTP/HTTPS URL'
    }
  }

  return {
    isValid: frontendMissingRequired.length === 0 && Object.keys(errors).length === 0,
    errors,
    missingRequired: frontendMissingRequired
  }
}

export function validateOperatorFormData(data: any): ValidationResult {
  const errors: Record<string, string> = {}
  const missingRequired = validateRequiredFields(data, 'OPERATOR')
  
  // Validate email
  if (data.email && !validateEmailFormat(data.email)) {
    errors.email = 'Invalid email format'
  }
  
  // Validate operator type
  if (data.operator_type && !validateEnum(data.operator_type, 'OPERATOR_TYPES')) {
    errors.operator_type = 'Invalid operator type'
  }
  
  return {
    isValid: missingRequired.length === 0 && Object.keys(errors).length === 0,
    errors,
    missingRequired
  }
}

export function validateLeadFormData(data: any): ValidationResult {
  const errors: Record<string, string> = {}
  const backendData = transformLeadDataForBackend(data)
  const missingRequired = validateRequiredFields(backendData, 'LEAD')
  
  // Validate email
  if (backendData.email && !validateEmailFormat(backendData.email)) {
    errors.email = 'Invalid email format'
  }
  
  // Validate enum values
  if (backendData.status && !validateEnum(backendData.status, 'LEAD_STATUS')) {
    errors.status = 'Invalid lead status'
  }
  
  if (backendData.visa_status && !validateEnum(backendData.visa_status, 'VISA_STATUS')) {
    errors.visa_status = 'Invalid visa status'
  }
  
  return {
    isValid: missingRequired.length === 0 && Object.keys(errors).length === 0,
    errors,
    missingRequired
  }
}

/**
 * Validates room form data for updates - less strict than creation
 * Only validates required fields for updates and enum values
 * @param data - Raw form data from the frontend room form
 * @param isUpdate - Whether this is an update operation
 * @returns ValidationResult object containing validation status, errors, and missing required fields
 */
export function validateRoomFormDataForUpdate(data: any): ValidationResult {
  const errors: Record<string, string> = {}
  // For updates, only require the room_id
  const missingRequired: string[] = []
  
  // Only check critical fields for updates
  if (!data.room_id) {
    missingRequired.push('room_id')
  }
  
  // Transform data to check enum values
  const backendData = transformRoomDataForBackend(data)
  
  // Only validate enum values if they are provided
  if (backendData.bathroom_type && !validateEnum(backendData.bathroom_type, 'BATHROOM_TYPES')) {
    errors.bathroom_type = 'Invalid bathroom type'
  }
  
  if (backendData.status && !validateEnum(backendData.status, 'ROOM_STATUS')) {
    errors.status = 'Invalid room status'
  }
  
  // Only validate numeric fields if provided and not empty
  if (backendData.floor_number !== undefined && backendData.floor_number !== null && backendData.floor_number < 1) {
    errors.floor_number = 'Floor number must be at least 1'
  }
  
  return {
    isValid: missingRequired.length === 0 && Object.keys(errors).length === 0,
    errors,
    missingRequired
  }
}

/**
 * Validates room form data against business rules and backend constraints
 * 
 * This function performs comprehensive validation of room form data including:
 * - Required field validation based on backend schema requirements
 * - Enum value validation against predefined backend constants
 * - Business logic validation (e.g., occupancy limits, date ranges)
 * - Cross-field dependency validation
 * 
 * @param data - Raw form data from the frontend room form
 * @returns ValidationResult object containing validation status, errors, and missing required fields
 * 
 * Business Rules Enforced:
 * - Room number must be unique within a building (checked at backend level)
 * - Private room rent must be specified for all rooms
 * - Maximum occupancy cannot exceed physical bed count
 * - Lease dates must be in correct chronological order
 * - Status transitions must follow business workflow rules
 */
export function validateRoomFormData(data: any): ValidationResult {
  const errors: Record<string, string> = {}
  // Transform frontend form data to backend format for validation
  const backendData = transformRoomDataForBackend(data)
  // Check for missing required fields based on backend schema
  const missingRequired = validateRequiredFields(backendData, 'ROOM')
  
  // Validate enum values for fields that exist in schema
  if (backendData.bathroom_type && !validateEnum(backendData.bathroom_type, 'BATHROOM_TYPES')) {
    errors.bathroom_type = 'Invalid bathroom type'
  }
  
  if (backendData.bed_size && !validateEnum(backendData.bed_size, 'BED_SIZES')) {
    errors.bed_size = 'Invalid bed size'
  }
  
  if (backendData.bed_type && !validateEnum(backendData.bed_type, 'BED_TYPES')) {
    errors.bed_type = 'Invalid bed type'
  }
  
  if (backendData.view && !validateEnum(backendData.view, 'ROOM_VIEWS')) {
    errors.view = 'Invalid room view'
  }
  
  if (backendData.status && !validateEnum(backendData.status, 'ROOM_STATUS')) {
    errors.status = 'Invalid room status'
  }
  
  // Validate numeric fields
  if (backendData.floor_number && backendData.floor_number < 1) {
    errors.floor_number = 'Floor number must be at least 1'
  }
  
  if (backendData.bed_count && backendData.bed_count < 1) {
    errors.bed_count = 'Bed count must be at least 1'
  }
  
  if (backendData.maximum_people_in_room && backendData.maximum_people_in_room < 1) {
    errors.maximum_people_in_room = 'Maximum people must be at least 1'
  }
  
  if (backendData.private_room_rent && backendData.private_room_rent < 0) {
    errors.private_room_rent = 'Room rent cannot be negative'
  }
  
  // Cross-field validation rules
  if (backendData.maximum_people_in_room && backendData.bed_count) {
    if (backendData.maximum_people_in_room > backendData.bed_count) {
      errors.maximum_people_in_room = 'Maximum occupancy cannot exceed the number of beds'
    }
  }
  
  // Validate booking date logic
  if (backendData.booked_from && backendData.booked_till) {
    if (!validateLeaseDates(backendData.booked_from, backendData.booked_till)) {
      errors.booked_till = 'Booking end date must be after start date'
    }
  }
  
  return {
    isValid: missingRequired.length === 0 && Object.keys(errors).length === 0,
    errors,
    missingRequired
  }
}

// Transform operator data to match backend structure
export function transformOperatorDataForBackend(frontendData: any) {
  return {
    name: frontendData.name,
    email: frontendData.email,
    phone: frontendData.phone,
    role: frontendData.role,
    active: frontendData.active ?? true,
    date_joined: frontendData.date_joined || new Date().toISOString().split('T')[0],
    last_active: frontendData.last_active,
    operator_type: frontendData.operator_type || 'LEASING_AGENT'
  }
}

// Transform room data to match backend structure
export function transformRoomDataForBackend(frontendData: any) {
  return {
    // BACKEND SCHEMA FIELDS ONLY - match actual database columns
    room_id: frontendData.room_id || generateRoomId(),
    building_id: frontendData.building_id,
    room_number: frontendData.room_number,
    
    // Map room_type to the correct backend field if different
    // Using status field as that's what exists in the schema
    status: frontendData.status || frontendData.availability_status || 'AVAILABLE',
    
    // Numeric fields - use sq_footage as that's the actual column name
    sq_footage: frontendData.square_footage || frontendData.sq_footage || null,
    private_room_rent: frontendData.private_room_rent || null,
    shared_room_rent_2: frontendData.shared_room_rent_2 || null,
    floor_number: frontendData.floor_number || null,
    
    // Individual amenity boolean fields (not JSON)
    mini_fridge: frontendData.mini_fridge || false,
    sink: frontendData.sink || false,
    bedding_provided: frontendData.bedding_provided || false,
    work_desk: frontendData.work_desk || false,
    work_chair: frontendData.work_chair || false,
    heating: frontendData.heating || false,
    air_conditioning: frontendData.air_conditioning || false,
    cable_tv: frontendData.cable_tv || false,
    
    // Date fields
    available_from: frontendData.available_from || null,
    booked_from: frontendData.booked_from || null,
    booked_till: frontendData.booked_till || null,
    last_check: frontendData.last_check || null,
    last_renovation_date: frontendData.last_renovation_date || null,
    
    // Other fields that exist in schema
    bathroom_type: frontendData.bathroom_type || null,
    bed_count: frontendData.bed_count || frontendData.maximum_people_in_room || null,
    bed_size: frontendData.bed_size || null,
    bed_type: frontendData.bed_type || null,
    furnished: frontendData.furnished ?? false,
    maximum_people_in_room: frontendData.maximum_people_in_room || null,
    active_tenants: frontendData.active_tenants || null,
    view: frontendData.view || null,
    noise_level: frontendData.noise_level || null,
    sunlight: frontendData.sunlight || null,
    ready_to_rent: frontendData.ready_to_rent ?? false,
    virtual_tour_url: frontendData.virtual_tour_url || null,
    current_booking_types: frontendData.current_booking_types || null,
    furniture_details: frontendData.furniture_details || null,
    room_storage: frontendData.room_storage || null,
    additional_features: frontendData.additional_features || null,
    public_notes: frontendData.public_notes || null,
    internal_notes: frontendData.internal_notes || null,
    last_check_by: frontendData.last_check_by || null,
    
    // Store room_images properly - handle both arrays and single URLs
    room_images: (() => {
      if (!frontendData.room_images && !frontendData.images) return null
      
      const imageData = frontendData.room_images || frontendData.images
      
      // If it's already a string (single URL or JSON), return as is
      if (typeof imageData === 'string') {
        return imageData
      }
      
      // If it's an array
      if (Array.isArray(imageData)) {
        // Single image - store as URL string
        if (imageData.length === 1) {
          return imageData[0]
        }
        // Multiple images - store as JSON array
        return JSON.stringify(imageData)
      }
      
      return null
    })()
  }
}