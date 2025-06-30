/**
 * Backend Synchronization Utilities
 * Ensures frontend data perfectly matches backend models and validation rules
 */

// Backend Enum Values (Must match backend exactly)
export const BACKEND_ENUMS = {
  // Operator related enums
  OPERATOR_TYPES: ['LEASING_AGENT', 'MAINTENANCE', 'BUILDING_MANAGER', 'ADMIN'] as const,
  OPERATOR_ROLES: ['Property Manager', 'Assistant Manager', 'Maintenance', 'Leasing Agent'] as const,
  NOTIFICATION_PREFERENCES: ['EMAIL', 'SMS', 'BOTH', 'NONE'] as const,
  
  // Room related enums
  ROOM_STATUS: ['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED'] as const,
  BATHROOM_TYPES: ['Private', 'En-Suite', 'Shared'] as const,
  BED_SIZES: ['Twin', 'Full', 'Queen', 'King'] as const,
  BED_TYPES: ['Single', 'Platform', 'Bunk'] as const,
  ROOM_VIEWS: ['Street', 'City', 'Bay', 'Garden', 'Courtyard'] as const,
  ROOM_STORAGE: ['Built-in Closet', 'Walk-in Closet', 'Wardrobe'] as const,
  NOISE_LEVELS: ['QUIET', 'MODERATE', 'LIVELY'] as const,
  SUNLIGHT_LEVELS: ['BRIGHT', 'MODERATE', 'LOW'] as const,
  
  // Building related enums
  PET_FRIENDLY_OPTIONS: ['Yes', 'No', 'Small Pets', 'Cats Only', 'All Pets'] as const,
  COMMON_KITCHEN_OPTIONS: ['None', 'Basic', 'Full', 'Premium'] as const,
  CLEANING_SCHEDULES: [
    'Daily cleaning service',
    'Weekly professional cleaning',
    'Bi-weekly cleaning service',
    'Monthly deep cleaning',
    'Tenant responsibility with supplies provided',
    'Tenant responsibility - own supplies'
  ] as const,
  
  // Tenant related enums
  TENANT_STATUS: ['ACTIVE', 'INACTIVE', 'PENDING', 'EXPIRED'] as const,
  BOOKING_TYPES: ['LEASE', 'CORPORATE', 'STUDENT'] as const,
  TENANT_NATIONALITY: ['US-CITIZEN', 'PERMANENT-RESIDENT', 'F1-VISA', 'H1B-VISA', 'OTHER'] as const,
  PAYMENT_STATUS: ['CURRENT', 'LATE', 'PENDING'] as const,
  COMMUNICATION_PREFERENCES: ['EMAIL', 'SMS', 'BOTH'] as const,
  ACCOUNT_STATUS: ['ACTIVE', 'INACTIVE', 'PENDING'] as const,
  EMERGENCY_CONTACT_RELATIONS: ['Parent', 'Sibling', 'Spouse', 'Friend', 'Other'] as const,
  
  // Lead related enums
  LEAD_STATUS: [
    'EXPLORING', 'SHOWING_SCHEDULED', 'APPLICATION_STARTED', 'APPLICATION_SUBMITTED', 
    'BACKGROUND_CHECK', 'LEASE_REQUESTED', 'APPROVED', 'LEASE_SIGNED', 
    'MOVED_IN', 'REJECTED', 'DECLINED'
  ] as const,
  VISA_STATUS: ['US-CITIZEN', 'PERMANENT-RESIDENT', 'F1-VISA', 'H1B-VISA', 'OTHER'] as const,
  LEAD_SOURCES: ['WEBSITE', 'REFERRAL', 'ADVERTISEMENT', 'SOCIAL_MEDIA'] as const,
  PREFERRED_COMMUNICATION: ['EMAIL', 'SMS', 'PHONE'] as const,
} as const

// Required Fields Mapping (Backend requirements)
export const REQUIRED_FIELDS = {
  OPERATOR: ['name', 'email'] as const,
  BUILDING: ['building_id', 'building_name'] as const, // Only these are truly required in backend
  ROOM: [
    'room_id',
    'room_number',
    'building_id',
    'private_room_rent'
  ] as const,
  TENANT: [
    'tenant_id',
    'tenant_name',
    'tenant_email',
    'room_id',
    'building_id'
  ] as const,
  LEAD: ['lead_id', 'email', 'status'] as const,
} as const

/**
 * Data Transformation Functions
 */

// Transform frontend form data to backend format
export function transformTenantDataForBackend(frontendData: any) {
  return {
    // Combine firstName + lastName → tenant_name
    tenant_name: frontendData.firstName && frontendData.lastName 
      ? `${frontendData.firstName.trim()} ${frontendData.lastName.trim()}`
      : frontendData.tenant_name,
    
    // Map field names to backend expectations
    tenant_email: frontendData.email || frontendData.tenant_email,
    tenant_nationality: frontendData.nationality || frontendData.tenant_nationality,
    
    // Ensure required fields are present
    room_id: frontendData.selected_room_id || frontendData.room_id,
    building_id: frontendData.selected_building_id || frontendData.building_id,
    
    // Copy other fields as-is
    room_number: frontendData.room_number,
    lease_start_date: frontendData.lease_start_date || frontendData.preferred_move_in_date,
    lease_end_date: frontendData.lease_end_date,
    operator_id: frontendData.operator_id,
    booking_type: frontendData.booking_type,
    deposit_amount: frontendData.deposit_amount,
    phone: frontendData.phone,
    status: frontendData.status || 'ACTIVE',
    
    // Optional fields
    emergency_contact_name: frontendData.emergency_contact_name,
    emergency_contact_phone: frontendData.emergency_contact_phone,
    emergency_contact_relation: frontendData.emergency_contact_relation,
    special_requests: frontendData.special_requests,
  }
}

// Transform lead data to match backend structure
export function transformLeadDataForBackend(frontendData: any) {
  return {
    lead_id: frontendData.lead_id || generateLeadId(),
    email: frontendData.email?.trim().toLowerCase(),
    status: frontendData.status || 'EXPLORING',
    interaction_count: frontendData.interaction_count ? parseInt(frontendData.interaction_count) : 0,
    lead_score: frontendData.lead_score ? parseInt(frontendData.lead_score) : 0,
    
    // Serialize arrays to JSON strings (backend stores as Text)
    rooms_interested: frontendData.rooms_interested 
      ? (Array.isArray(frontendData.rooms_interested)
          ? JSON.stringify(frontendData.rooms_interested)
          : frontendData.rooms_interested)
      : null,
    showing_dates: frontendData.showing_dates 
      ? (Array.isArray(frontendData.showing_dates)
          ? JSON.stringify(frontendData.showing_dates)
          : frontendData.showing_dates)
      : null,
      
    selected_room_id: frontendData.selected_room_id?.trim() || null,
    planned_move_in: frontendData.planned_move_in || frontendData.preferred_move_in_date || null,
    planned_move_out: frontendData.planned_move_out || null,
    preferred_move_in_date: frontendData.preferred_move_in_date || null,
    preferred_lease_term: frontendData.preferred_lease_term ? parseInt(frontendData.preferred_lease_term) : null,
    visa_status: frontendData.visa_status?.trim() || null,
    notes: frontendData.notes?.trim() || null,
    additional_preferences: frontendData.additional_preferences?.trim() || null,
    budget_min: frontendData.budget_min ? parseFloat(frontendData.budget_min) : null,
    budget_max: frontendData.budget_max ? parseFloat(frontendData.budget_max) : null,
    lead_source: frontendData.lead_source?.trim() || null,
    preferred_communication: frontendData.preferred_communication || 'EMAIL',
    last_contacted: frontendData.last_contacted || null,
    next_follow_up: frontendData.next_follow_up || null,
    created_at: new Date().toISOString()
  }
}

// Transform building data to match backend structure
export function transformBuildingDataForBackend(frontendData: any) {
  return {
    building_id: String(frontendData.building_id || generateBuildingId()),
    building_name: frontendData.building_name?.trim(),

    // Address fields (exact backend schema mapping)
    full_address: frontendData.full_address?.trim() ||
      [frontendData.street || frontendData.address, frontendData.area, frontendData.city, frontendData.state, frontendData.zip || frontendData.zip_code]
        .filter(Boolean).join(', ') || null,
    street: (frontendData.street || frontendData.address)?.trim() || null,
    area: frontendData.area?.trim() || null,
    city: frontendData.city?.trim() || null,
    state: frontendData.state?.trim() || null,
    zip: (frontendData.zip || frontendData.zip_code)?.trim() || null,

    // Foreign keys
    operator_id: frontendData.operator_id ? parseInt(frontendData.operator_id) : null,

    // Basic properties
    available: frontendData.available !== undefined ? Boolean(frontendData.available) : true,
    floors: frontendData.floors ? parseInt(frontendData.floors) : null,
    total_rooms: frontendData.total_rooms ? parseInt(frontendData.total_rooms) : null,
    total_bathrooms: frontendData.total_bathrooms ? parseInt(frontendData.total_bathrooms) : null,
    bathrooms_on_each_floor: frontendData.bathrooms_on_each_floor ? parseInt(frontendData.bathrooms_on_each_floor) : null,
    priority: frontendData.priority ? parseInt(frontendData.priority) : null,

    // Lease terms
    min_lease_term: frontendData.min_lease_term ? parseInt(frontendData.min_lease_term) : null,
    pref_min_lease_term: frontendData.pref_min_lease_term ? parseInt(frontendData.pref_min_lease_term) : null,

    // Amenities (all boolean, default false)
    wifi_included: Boolean(frontendData.wifi_included ?? false),
    laundry_onsite: Boolean(frontendData.laundry_onsite ?? false),
    secure_access: Boolean(frontendData.secure_access ?? false),
    bike_storage: Boolean(frontendData.bike_storage ?? false),
    rooftop_access: Boolean(frontendData.rooftop_access ?? false),
    utilities_included: Boolean(frontendData.utilities_included ?? false),
    fitness_area: Boolean(frontendData.fitness_area ?? false),
    work_study_area: Boolean(frontendData.work_study_area ?? false),
    social_events: Boolean(frontendData.social_events ?? false),
    disability_access: Boolean(frontendData.disability_access ?? false),

    // Text fields
    common_kitchen: frontendData.common_kitchen?.trim() || null,
    common_area: frontendData.common_area?.trim() || null,
    pet_friendly: frontendData.pet_friendly?.trim() || null,
    cleaning_common_spaces: frontendData.cleaning_common_spaces?.trim() || null,
    nearby_conveniences_walk: frontendData.nearby_conveniences_walk?.trim() || null,
    nearby_transportation: frontendData.nearby_transportation?.trim() || null,
    building_rules: frontendData.building_rules?.trim() || null,
    amenities_details: frontendData.amenities_details?.trim() || null,
    neighborhood_description: frontendData.neighborhood_description?.trim() || null,
    building_description: frontendData.building_description?.trim() || null,
    public_transit_info: frontendData.public_transit_info?.trim() || null,
    parking_info: frontendData.parking_info?.trim() || null,
    security_features: frontendData.security_features?.trim() || null,
    disability_features: frontendData.disability_features?.trim() || null,

    // Media fields - backend expects JSON array as string
    building_images: frontendData.building_images 
      ? (Array.isArray(frontendData.building_images) 
          ? JSON.stringify(frontendData.building_images)
          : frontendData.building_images)
      : (frontendData.images 
          ? (Array.isArray(frontendData.images)
              ? JSON.stringify(frontendData.images)
              : frontendData.images)
          : null),
    virtual_tour_url: frontendData.virtual_tour_url?.trim() || frontendData.video_url?.trim() || null,

    // Years
    year_built: frontendData.year_built ? parseInt(frontendData.year_built) : null,
    last_renovation: frontendData.last_renovation ? parseInt(frontendData.last_renovation) : null,

    // Timestamps - let database handle these
    created_at: new Date().toISOString()
  }
}

// Transform backend data to frontend format
// Handles data type conversions from backend (UUID, boolean) to frontend (string, string)
export function transformBackendDataForFrontend(backendData: any) {
  return {
    ...backendData,

    // Convert UUID to string
    building_id: backendData.building_id?.toString() || backendData.building_id,

    // Convert boolean pet_friendly to string
    pet_friendly: typeof backendData.pet_friendly === 'boolean'
      ? (backendData.pet_friendly ? "Yes" : "No")
      : backendData.pet_friendly,

    // Convert comma-separated building_images string to array
    images: backendData.building_images
      ? (typeof backendData.building_images === 'string'
          ? backendData.building_images.split(',').map((url: string) => url.trim()).filter(Boolean)
          : backendData.building_images)
      : [],

    // Map backend field names to frontend field names
    video_url: backendData.virtual_tour_url,

    // Ensure zip field is mapped correctly
    zip: backendData.zip || backendData.zip_code,
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

// Validate phone number format
export function validatePhoneFormat(phone: string): boolean {
  // Remove all non-digit characters for validation
  const digitsOnly = phone.replace(/\D/g, '')
  // Accept phone numbers with 10-15 digits (international format)
  return digitsOnly.length >= 10 && digitsOnly.length <= 15
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
  const missingRequired = validateRequiredFields(backendData, 'BUILDING')
  
  // Validate required fields
  if (!backendData.building_name?.trim()) {
    errors.building_name = 'Building name is required'
  }
  
  // Validate numeric fields
  if (backendData.floors && (isNaN(backendData.floors) || backendData.floors < 1)) {
    errors.floors = 'Building must have at least 1 floor'
  }
  
  if (backendData.total_rooms && (isNaN(backendData.total_rooms) || backendData.total_rooms < 1)) {
    errors.total_rooms = 'Building must have at least 1 room'
  }
  
  if (backendData.total_bathrooms && (isNaN(backendData.total_bathrooms) || backendData.total_bathrooms < 0)) {
    errors.total_bathrooms = 'Total bathrooms cannot be negative'
  }
  
  if (backendData.year_built && (isNaN(backendData.year_built) || backendData.year_built < 1800 || backendData.year_built > new Date().getFullYear() + 5)) {
    errors.year_built = 'Please enter a valid year'
  }
  
  // Validate enum values
  if (backendData.pet_friendly && !validateEnum(backendData.pet_friendly, 'PET_FRIENDLY_OPTIONS')) {
    errors.pet_friendly = 'Invalid pet policy selection'
  }
  
  if (backendData.common_kitchen && !validateEnum(backendData.common_kitchen, 'COMMON_KITCHEN_OPTIONS')) {
    errors.common_kitchen = 'Invalid common kitchen option'
  }
  
  if (backendData.cleaning_common_spaces && !validateEnum(backendData.cleaning_common_spaces, 'CLEANING_SCHEDULES')) {
    errors.cleaning_common_spaces = 'Invalid cleaning schedule'
  }
  
  return {
    isValid: missingRequired.length === 0 && Object.keys(errors).length === 0,
    errors,
    missingRequired
  }
}

export function validateOperatorFormData(data: any): ValidationResult {
  const errors: Record<string, string> = {}
  const backendData = transformOperatorDataForBackend(data)
  const missingRequired = validateRequiredFields(backendData, 'OPERATOR')
  
  // Validate required fields
  if (!backendData.name?.trim()) {
    errors.name = 'Name is required'
  }
  
  if (!backendData.email?.trim()) {
    errors.email = 'Email is required'
  }
  
  // Validate email format
  if (backendData.email && !validateEmailFormat(backendData.email)) {
    errors.email = 'Invalid email format'
  }
  
  // Validate phone format if provided
  if (backendData.phone && !validatePhoneFormat(backendData.phone)) {
    errors.phone = 'Invalid phone number format'
  }
  
  // Validate enum values
  if (backendData.operator_type && !validateEnum(backendData.operator_type, 'OPERATOR_TYPES')) {
    errors.operator_type = 'Invalid operator type'
  }
  
  if (backendData.role && !validateEnum(backendData.role, 'OPERATOR_ROLES')) {
    errors.role = 'Invalid role selection'
  }
  
  if (backendData.notification_preferences && !validateEnum(backendData.notification_preferences, 'NOTIFICATION_PREFERENCES')) {
    errors.notification_preferences = 'Invalid notification preference'
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
  
  // Validate required fields
  if (!backendData.email?.trim()) {
    errors.email = 'Email is required'
  }
  
  // Validate email format
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
  
  if (backendData.lead_source && !validateEnum(backendData.lead_source, 'LEAD_SOURCES')) {
    errors.lead_source = 'Invalid lead source'
  }
  
  if (backendData.preferred_communication && !validateEnum(backendData.preferred_communication, 'PREFERRED_COMMUNICATION')) {
    errors.preferred_communication = 'Invalid communication preference'
  }
  
  // Validate numeric fields
  if (backendData.lead_score !== undefined && (isNaN(backendData.lead_score) || backendData.lead_score < 0 || backendData.lead_score > 100)) {
    errors.lead_score = 'Lead score must be between 0 and 100'
  }
  
  if (backendData.interaction_count !== undefined && (isNaN(backendData.interaction_count) || backendData.interaction_count < 0)) {
    errors.interaction_count = 'Interaction count cannot be negative'
  }
  
  if (backendData.preferred_lease_term && (isNaN(backendData.preferred_lease_term) || backendData.preferred_lease_term < 1)) {
    errors.preferred_lease_term = 'Lease term must be at least 1 month'
  }
  
  if (backendData.budget_min && (isNaN(backendData.budget_min) || backendData.budget_min < 0)) {
    errors.budget_min = 'Minimum budget cannot be negative'
  }
  
  if (backendData.budget_max && (isNaN(backendData.budget_max) || backendData.budget_max < 0)) {
    errors.budget_max = 'Maximum budget cannot be negative'
  }
  
  if (backendData.budget_min && backendData.budget_max && backendData.budget_min > backendData.budget_max) {
    errors.budget_max = 'Maximum budget must be greater than minimum budget'
  }
  
  return {
    isValid: missingRequired.length === 0 && Object.keys(errors).length === 0,
    errors,
    missingRequired
  }
}

export function validateRoomFormData(data: any): ValidationResult {
  const errors: Record<string, string> = {}
  const backendData = transformRoomDataForBackend(data)
  const missingRequired = validateRequiredFields(backendData, 'ROOM')
  
  // Validate required fields
  if (!backendData.room_number?.trim()) {
    errors.room_number = 'Room number is required'
  }
  
  if (!backendData.building_id?.trim()) {
    errors.building_id = 'Building selection is required'
  }
  
  if (backendData.private_room_rent === undefined || backendData.private_room_rent === null) {
    errors.private_room_rent = 'Private room rent is required'
  }
  
  // Validate enum values
  if (backendData.status && !validateEnum(backendData.status, 'ROOM_STATUS')) {
    errors.status = 'Invalid room status'
  }
  
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
  
  if (backendData.room_storage && !validateEnum(backendData.room_storage, 'ROOM_STORAGE')) {
    errors.room_storage = 'Invalid room storage option'
  }
  
  if (backendData.noise_level && !validateEnum(backendData.noise_level, 'NOISE_LEVELS')) {
    errors.noise_level = 'Invalid noise level'
  }
  
  if (backendData.sunlight && !validateEnum(backendData.sunlight, 'SUNLIGHT_LEVELS')) {
    errors.sunlight = 'Invalid sunlight level'
  }
  
  // Validate numeric fields
  if (backendData.floor_number && (isNaN(backendData.floor_number) || backendData.floor_number < 1)) {
    errors.floor_number = 'Floor number must be at least 1'
  }
  
  if (backendData.bed_count && (isNaN(backendData.bed_count) || backendData.bed_count < 1)) {
    errors.bed_count = 'Bed count must be at least 1'
  }
  
  if (backendData.maximum_people_in_room && (isNaN(backendData.maximum_people_in_room) || backendData.maximum_people_in_room < 1)) {
    errors.maximum_people_in_room = 'Maximum people must be at least 1'
  }
  
  if (backendData.private_room_rent !== null && (isNaN(backendData.private_room_rent) || backendData.private_room_rent < 0)) {
    errors.private_room_rent = 'Room rent must be a positive number'
  }
  
  if (backendData.shared_room_rent_2 && (isNaN(backendData.shared_room_rent_2) || backendData.shared_room_rent_2 < 0)) {
    errors.shared_room_rent_2 = 'Shared room rent must be a positive number'
  }
  
  if (backendData.sq_footage && (isNaN(backendData.sq_footage) || backendData.sq_footage < 1)) {
    errors.sq_footage = 'Square footage must be at least 1'
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
    name: frontendData.name?.trim(),
    email: frontendData.email?.trim().toLowerCase(),
    phone: frontendData.phone?.trim() || null,
    role: frontendData.role?.trim() || null,
    active: frontendData.active !== undefined ? Boolean(frontendData.active) : true,
    date_joined: frontendData.date_joined || new Date().toISOString().split('T')[0],
    last_active: frontendData.last_active || null,
    operator_type: frontendData.operator_type || 'LEASING_AGENT',
    permissions: frontendData.permissions || null,
    notification_preferences: frontendData.notification_preferences || 'EMAIL',
    working_hours: frontendData.working_hours || null,
    emergency_contact: Boolean(frontendData.emergency_contact ?? false),
    calendar_sync_enabled: Boolean(frontendData.calendar_sync_enabled ?? false),
    calendar_external_id: frontendData.calendar_external_id || null
  }
}

// Transform room data to match backend structure
export function transformRoomDataForBackend(frontendData: any) {
  return {
    room_id: frontendData.room_id || generateRoomId(),
    room_number: frontendData.room_number?.trim(),
    building_id: frontendData.building_id?.trim(),

    // Status and availability
    ready_to_rent: frontendData.ready_to_rent !== undefined ? Boolean(frontendData.ready_to_rent) : true,
    status: frontendData.status || 'AVAILABLE',
    booked_from: frontendData.booked_from || null,
    booked_till: frontendData.booked_till || null,
    available_from: frontendData.available_from || null,
    active_tenants: frontendData.active_tenants ? parseInt(frontendData.active_tenants) : 0,
    maximum_people_in_room: frontendData.maximum_people_in_room ? parseInt(frontendData.maximum_people_in_room) : null,

    // Pricing (private_room_rent is required)
    private_room_rent: frontendData.private_room_rent ? parseFloat(frontendData.private_room_rent) : 0,
    shared_room_rent_2: frontendData.shared_room_rent_2 ? parseFloat(frontendData.shared_room_rent_2) : null,

    // Physical properties
    floor_number: frontendData.floor_number ? parseInt(frontendData.floor_number) : null,
    bed_count: frontendData.bed_count ? parseInt(frontendData.bed_count) : null,
    sq_footage: frontendData.sq_footage ? parseInt(frontendData.sq_footage) : null,

    // Room features
    bathroom_type: frontendData.bathroom_type?.trim() || null,
    bed_size: frontendData.bed_size?.trim() || null,
    bed_type: frontendData.bed_type?.trim() || null,
    view: frontendData.view?.trim() || null,
    room_storage: frontendData.room_storage?.trim() || null,
    noise_level: frontendData.noise_level?.trim() || null,
    sunlight: frontendData.sunlight?.trim() || null,

    // Amenities (all boolean, default false)
    mini_fridge: Boolean(frontendData.mini_fridge ?? false),
    sink: Boolean(frontendData.sink ?? false),
    bedding_provided: Boolean(frontendData.bedding_provided ?? false),
    work_desk: Boolean(frontendData.work_desk ?? false),
    work_chair: Boolean(frontendData.work_chair ?? false),
    heating: Boolean(frontendData.heating ?? false),
    air_conditioning: Boolean(frontendData.air_conditioning ?? false),
    cable_tv: Boolean(frontendData.cable_tv ?? false),
    furnished: Boolean(frontendData.furnished ?? false),

    // Additional fields
    current_booking_types: frontendData.current_booking_types?.trim() || null,
    furniture_details: frontendData.furniture_details?.trim() || null,
    public_notes: frontendData.public_notes?.trim() || null,
    internal_notes: frontendData.internal_notes?.trim() || null,
    additional_features: frontendData.additional_features?.trim() || null,

    // Inspection & maintenance
    last_check: frontendData.last_check || null,
    last_check_by: frontendData.last_check_by ? parseInt(frontendData.last_check_by) : null,
    last_renovation_date: frontendData.last_renovation_date || null,

    // Media - backend expects JSON array as string
    room_images: frontendData.room_images 
      ? (Array.isArray(frontendData.room_images) 
          ? JSON.stringify(frontendData.room_images)
          : frontendData.room_images)
      : (frontendData.images 
          ? (Array.isArray(frontendData.images)
              ? JSON.stringify(frontendData.images)
              : frontendData.images)
          : null),
    virtual_tour_url: frontendData.virtual_tour_url?.trim() || null
  }
}