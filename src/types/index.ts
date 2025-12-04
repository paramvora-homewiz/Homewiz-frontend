/**
 * HomeWiz TypeScript Type Definitions
 *
 * Comprehensive type definitions for the HomeWiz application
 * with strict typing, validation, and documentation.
 */

// ============================================================================
// USER & AUTHENTICATION TYPES
// ============================================================================

// User role types with hierarchy
export type UserRole = 'no_access' | 'view' | 'submit' | 'edit'

// User interface with comprehensive fields
export interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: UserRole
  active?: boolean
  createdAt: string
  lastLogin?: string
  metadata?: Record<string, any>
}

// User creation and update types
export interface UserCreate extends Omit<User, 'id' | 'createdAt' | 'lastLogin'> {
  password?: string
}

export interface UserUpdate extends Partial<Omit<User, 'id' | 'createdAt'>> {}

// User authentication context
export interface AuthUser extends User {
  isAuthenticated: boolean
  permissions: UserRole[]
  token?: string
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

// Generic API response wrapper
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  status_code?: number
  timestamp?: number
}

// Enhanced API response with metadata
export interface EnhancedApiResponse<T = any> extends ApiResponse<T> {
  requestId?: string
  cached?: boolean
  retryCount?: number
  processingTime?: number
}

// Error response details
export interface ApiErrorResponse {
  success: false
  error: string
  code?: string
  details?: any
  timestamp: number
  requestId?: string
}

// ============================================================================
// FILE UPLOAD TYPES
// ============================================================================

export interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadedAt: string
  category: FileCategory
  metadata?: Record<string, any>
}

export type FileCategory =
  | 'profile_photo'
  | 'id_document'
  | 'income_proof'
  | 'reference_letter'
  | 'lease_document'
  | 'insurance_document'
  | 'building_image'
  | 'building_video'
  | 'other'

// File upload configuration
export interface FileUploadConfig {
  maxSize: number
  allowedTypes: string[]
  accept: string
  multiple?: boolean
}

// ============================================================================
// OPERATOR TYPES
// ============================================================================

export type OperatorType = 'LEASING_AGENT' | 'MAINTENANCE' | 'BUILDING_MANAGER' | 'ADMIN' | 'OWNER'
export type NotificationPreference = 'EMAIL' | 'SMS' | 'BOTH' | 'NONE'

export interface Operator {
  operator_id: number  // Changed from string to number to match backend
  name: string
  email: string
  phone?: string
  role?: string
  active: boolean
  date_joined: string
  last_active?: string
  operator_type: OperatorType
  permissions?: Record<string, boolean>
  notification_preferences: NotificationPreference
  working_hours?: Record<string, any>
  emergency_contact: boolean
  calendar_sync_enabled: boolean
  calendar_external_id?: string
}

export interface OperatorFormData extends Omit<Operator, 'operator_id' | 'date_joined'> {
  operator_id?: number  // Changed from string to number to match backend
  date_joined?: string
}

// ============================================================================
// BUILDING TYPES
// ============================================================================

export interface Building {
  building_id: string
  building_name: string
  address: string
  city: string
  state: string
  zip_code: string
  country: string
  // CRITICAL FIX: Match backend schema exactly
  total_units: number    // Backend field name (not total_rooms)
  available_units: number // Backend field name (not available_rooms)
  building_type: string
  status: string         // Missing backend field - critical for building status
  area?: string          // Missing backend field - geographic area
  description?: string   // Backend field name (not building_description)
  images?: string[]      // Backend field name (not building_images) - stored as Json
  parking_available: boolean // Backend field
  pet_friendly: boolean      // Backend field  
  furnished_options: boolean // Backend field
  // Additional fields that exist in frontend but not backend
  operator_id?: number       // Frontend-only field (not in backend schema)
  amenities?: string[]
  year_built?: number
  last_renovation?: number
  building_rules?: string
  amenities_details?: Record<string, any>
  neighborhood_description?: string
  building_description?: string  // Frontend alias for description
  public_transit_info?: string
  parking_info?: string
  security_features?: string
  disability_access?: boolean
  disability_features?: string
  building_images?: string[]     // Frontend alias for images
  virtual_tour_url?: string      // Legacy single URL (backward compatibility)
  virtual_tour_urls?: string[]   // Multiple video/tour URLs
  created_at?: string
  updated_at?: string
}

export interface BuildingFormData extends Omit<Building, 'building_id' | 'created_at' | 'updated_at'> {
  building_id?: string
  // CRITICAL BACKEND COMPATIBILITY FIXES
  total_units: number        // Backend field name (was total_rooms)
  available_units: number    // Backend field name (was available_rooms) 
  status: string             // Required backend field
  area?: string              // Required backend field
  description?: string       // Backend field name (not building_description)
  images?: string[]          // Backend field name (stored as Json)
  parking_available: boolean // Backend field
  pet_friendly: boolean      // Backend field (boolean, not string)
  furnished_options: boolean // Backend field
  
  // Additional form fields not in base Building interface
  full_address?: string
  street?: string
  zip?: string
  floors?: number
  total_bathrooms?: number
  bathrooms_on_each_floor?: number
  common_kitchen?: string
  min_lease_term?: number
  pref_min_lease_term?: number
  wifi_included: boolean
  laundry_onsite: boolean
  common_area?: string
  secure_access: boolean
  bike_storage: boolean
  rooftop_access: boolean
  pet_friendly_details?: string    // Detailed pet policy (renamed from pet_friendly)
  cleaning_common_spaces?: string
  utilities_included: boolean
  fitness_area: boolean
  work_study_area: boolean
  social_events: boolean
  nearby_conveniences_walk?: string
  nearby_transportation?: string
  walkscore_data?: string  // JSON string of WalkScoreData for backend storage
  priority?: number
  property_manager?: number
  available: boolean
  
  // Structured parking options (frontend enhancement)
  covered_parking?: boolean
  garage_parking?: boolean
  street_parking?: boolean
  visitor_parking?: boolean
  handicap_parking?: boolean
  electric_charging?: boolean
  
  // Accessibility features (frontend enhancement)
  wheelchair_ramp?: boolean
  elevator_access?: boolean
  wide_doorways?: boolean
  accessible_bathroom?: boolean
  hearing_assistance?: boolean
  visual_assistance?: boolean
  accessible_parking?: boolean
  grab_bars?: boolean
  lowered_counters?: boolean
  accessible_entrance?: boolean
  service_animal_friendly?: boolean
  accessible_emergency?: boolean
  accessibility_details?: string

  // Security features (frontend enhancement)
  security_cameras?: boolean
  keycard_access?: boolean
  keycode_entry?: boolean
  security_guard?: boolean
  onsite_manager?: boolean
  gated_community?: boolean
  intercom_system?: boolean
  building_alarm?: boolean

  // Media files for upload
  media_files?: MediaFile[]
  // New categorized media structure
  categorized_media?: CategorizedMediaFiles
  
  // Maintain backward compatibility with old field names
  total_rooms?: number       // Alias for total_units (for old forms)
  available_rooms?: number   // Alias for available_units (for old forms)
  building_description?: string  // Alias for description
  building_images?: string[]     // Alias for images
}

// ============================================================================
// ROOM TYPES
// ============================================================================

export type RoomStatus = 'Available' | 'Occupied' | 'Maintenance' | 'Reserved'
export type NoiseLevel = 'QUIET' | 'MODERATE' | 'LIVELY'
export type SunlightLevel = 'BRIGHT' | 'MODERATE' | 'LOW'
export type BathroomType = 'Private' | 'Shared' | 'En-Suite'

export interface Room {
  room_id: string
  room_number: string
  building_id: string
  ready_to_rent: boolean
  status: RoomStatus
  booked_from?: string
  booked_till?: string
  active_tenants: number
  maximum_people_in_room: number
  private_room_rent: number
  shared_room_rent_2?: number
  floor_number: number
  bed_count: number
  bathroom_type: BathroomType
  bed_size: string
  bed_type: string
  view?: string
  sq_footage?: number
  room_images?: string[]
  virtual_tour_url?: string
  available_from?: string
  additional_features?: string
  created_at?: string
  updated_at?: string
}

export type RoomType = 'Standard' | 'Suite' | 'Studio' | 'Deluxe' | 'Penthouse'

export interface RoomFormData extends Omit<Room, 'room_id' | 'created_at' | 'updated_at'> {
  room_id?: string
  room_number: string
  building_id: string
  room_type: RoomType // Critical: Required field missing from database schema
  ready_to_rent: boolean
  status: RoomStatus
  booked_from?: string
  booked_till?: string
  active_tenants: number
  maximum_people_in_room: number
  private_room_rent: number
  shared_room_rent_2?: number
  last_check?: string
  last_check_by?: number
  current_booking_types?: string
  floor_number: number
  bed_count: number
  bathroom_type: BathroomType
  bed_size: string
  bed_type: string
  view?: string
  sq_footage?: number
  mini_fridge: boolean
  sink: boolean
  bedding_provided: boolean
  work_desk: boolean
  work_chair: boolean
  heating: boolean
  air_conditioning: boolean
  cable_tv: boolean
  room_storage?: string
  noise_level?: string
  sunlight?: string
  furnished?: boolean
  last_renovation_date?: string
  virtual_tour_url?: string
  available_from?: string
  additional_features?: string
  room_photos?: File[]
  // Backend-required description field
  description?: string
  
  // Backend Compatibility Fields (CRITICAL FIXES)
  shared_room_rent_3?: number // Missing backend field - 3-person occupancy
  shared_room_rent_4?: number // Missing backend field - 4-person occupancy  
  availability_status?: 'Available' | 'Occupied' | 'Maintenance' | 'Reserved' // Backend field name
  square_footage?: number // Backend field name (not sq_footage)
  lease_start_date?: string // Backend tracking field
  lease_end_date?: string // Backend tracking field
  
  // New fields added based on best practices
  room_access_type?: 'KEY' | 'KEYCARD' | 'DIGITAL' | 'CODE'
  internet_speed?: number
  room_condition_score?: number
  cleaning_frequency?: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'ON_REQUEST'
  utilities_meter_id?: string
  last_cleaning_date?: string
  // JSON field improvements for better data structure
  utilities_included?: Record<string, boolean> | string // Support both structured and JSON string
}

// Tenant Form Interface - Maps to tenants table
export interface TenantFormData {
  tenant_id?: string
  tenant_name: string
  room_id?: string
  room_number?: string
  lease_start_date?: string
  lease_end_date?: string
  operator_id?: number
  booking_type?: string
  tenant_nationality?: string
  tenant_email: string
  phone?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relation?: string
  building_id?: string
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'TERMINATED'
  deposit_amount?: number
  payment_status?: string
  special_requests?: string
  payment_reminders_enabled: boolean
  communication_preferences: 'EMAIL' | 'SMS' | 'BOTH'
  account_status: 'ACTIVE' | 'INACTIVE' | 'PENDING'
  last_payment_date?: string
  next_payment_date?: string
  rent_payment_method?: string
  has_pets: boolean
  pet_details?: string
  has_vehicles: boolean
  vehicle_details?: string
  has_renters_insurance: boolean
  insurance_details?: string
}

// Lead Form Interface - Maps to leads table
export interface LeadFormData {
  lead_id?: string
  email: string
  status: 'EXPLORING' | 'INTERESTED' | 'SCHEDULED_VIEWING' | 'APPLICATION_SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CONVERTED'
  interaction_count: number
  rooms_interested?: string // JSON array as String
  selected_room_id?: string
  showing_dates?: string // JSON array as String
  planned_move_in?: string
  planned_move_out?: string
  visa_status?: string
  notes?: string
  lead_score: number
  lead_source?: 'WEBSITE' | 'REFERRAL' | 'ADVERTISEMENT' | 'SOCIAL_MEDIA' | 'OTHER'
  preferred_communication: 'EMAIL' | 'SMS' | 'PHONE'
  budget_min?: number
  budget_max?: number
  preferred_move_in_date?: string
  preferred_lease_term?: number // in months
  additional_preferences?: string // JSON string of additional preferences
  last_contacted?: string
  next_follow_up?: string
}

// Lead/Prospect Types
export interface Lead {
  lead_id: string
  email: string
  status: LeadStatus
  interaction_count: number
  rooms_interested?: string[]
  selected_room_id?: string
  showing_dates?: string[]
  planned_move_in?: string
  planned_move_out?: string
  visa_status?: string
  notes?: string
  created_at?: string
  last_modified?: string
  lead_score: number
  lead_source?: string
  preferred_communication: 'EMAIL' | 'SMS' | 'BOTH'
  budget_min?: number
  budget_max?: number
  preferred_move_in_date?: string
  preferred_lease_term?: number
  additional_preferences?: string
  last_contacted?: string
  next_follow_up?: string
  
  // Additional form fields
  firstName?: string
  lastName?: string
  phone?: string
  dateOfBirth?: string
  nationality?: string
  occupation?: string
  company?: string
  annual_income?: number
  booking_type?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relation?: string

  // Room and amenity preferences
  room_type?: string
  bathroom_type?: string
  floor_preference?: string
  view_preference?: string

  // Vehicle and insurance
  has_vehicles?: boolean
  vehicle_details?: string
  has_renters_insurance?: boolean
  insurance_details?: string

  // Lifestyle
  pets?: boolean
  pet_details?: string
  smoking?: boolean

  // References and documents
  references?: Reference[]
  documents?: UploadedFile[]
}

export type LeadStatus = 
  | 'EXPLORING' 
  | 'INTERESTED' 
  | 'SCHEDULED_VIEWING' 
  | 'APPLICATION_SUBMITTED' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'CONVERTED'

export interface Reference {
  id: string
  name: string
  relationship: string
  phone: string
  email?: string
}

// Room interface is defined above in ROOM TYPES section (line ~278)
// Duplicate Room interface removed to prevent type conflicts

// RoomStatus is already defined above in ROOM TYPES section

// Duplicate Building interface removed - using the one defined above

// File Upload Types
export interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  url: string
  uploadedAt: string
  category: FileCategory
}

export interface MediaFile {
  id: string
  name: string
  type: string
  size: number
  file: File
  preview: string
  category: 'building_image' | 'building_video'
  url?: string // Supabase storage URL if uploaded
  metadata?: {
    category: string
    tag: string
    [key: string]: any
  }
}

export interface CategorizedMediaFiles {
  outside: MediaFile[]
  common_areas: MediaFile[]
  amenities: MediaFile[]
  kitchen_bathrooms: MediaFile[]
  videos: MediaFile[]
}

// FileCategory is already defined above

// Form Types
export interface ApplicationFormData {
  // System Generated Fields
  tenant_id?: string
  lead_id?: string

  // Personal Information
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth?: string
  nationality?: string
  preferred_communication: 'EMAIL' | 'SMS' | 'PHONE' | 'BOTH'

  // Emergency Contact Information
  emergency_contact_name?: string
  emergency_contact_phone?: string
  emergency_contact_relation?: string

  // Professional Information
  occupation: string
  company?: string
  annual_income?: number
  visa_status?: string
  lead_source?: string
  booking_type: 'LEASE' | 'SHORT_TERM' | 'MONTH_TO_MONTH' | 'CORPORATE'

  // Housing Preferences
  budget_min: number
  budget_max: number
  preferred_move_in_date: string
  preferred_lease_term: number

  // Property Selection (Required for Tenant Creation)
  selected_room_id?: string
  selected_building_id?: string
  room_number?: string

  // Lease Information
  lease_start_date?: string
  lease_end_date?: string
  deposit_amount?: number
  payment_status?: 'PENDING' | 'PAID' | 'PARTIAL' | 'OVERDUE'
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'TERMINATED'

  // Additional Tenant Information
  special_requests?: string
  operator_id?: number

  // Lead-specific fields
  rooms_interested?: string[] // Array of room IDs
  showing_dates?: string[] // Array of date strings
  planned_move_out?: string
  notes?: string
  lead_score?: number
  last_contacted?: string
  next_follow_up?: string

  // Room Preferences
  room_type?: 'private' | 'shared' | 'either'
  bathroom_type?: 'private' | 'shared'
  floor_preference?: 'low' | 'high'
  view_preference?: string

  // Amenity Preferences
  amenity_wifi: boolean
  amenity_laundry: boolean
  amenity_parking: boolean
  amenity_security: boolean
  amenity_gym: boolean
  amenity_common_area: boolean
  amenity_rooftop: boolean
  amenity_bike_storage: boolean

  // Vehicle Information
  has_vehicles: boolean
  vehicle_details?: string

  // Insurance Information
  has_renters_insurance: boolean
  insurance_details?: string

  // Lifestyle Information
  pets: boolean
  pet_details?: string
  smoking: boolean
  additional_preferences?: string

  // References
  references?: Reference[]

  // Documents
  documents?: UploadedFile[]
}

export interface RoomPreferences {
  room_type: 'private' | 'shared' | 'either'
  floor_preference?: 'low' | 'high' | 'no_preference'
  bathroom_type?: 'private' | 'shared' | 'no_preference'
  view_preference?: string
  amenities_important: string[]
}

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
  email?: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Form Step Types
export interface FormStep {
  id: string
  title: string
  description: string
  component: React.ComponentType<any>
  isComplete: boolean
  isOptional?: boolean
}

// Notification Types
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  duration?: number
}

// ============================================================================
// FORM TEMPLATE TYPES
// ============================================================================

// Form Template Interface
export interface FormTemplate {
  id: string
  name: string
  formType: 'operator' | 'building' | 'room' | 'tenant' | 'lead'
  data: any
  createdAt: string
  lastUsed?: string
  useCount: number
  isDefault?: boolean
  tags?: string[]
  description?: string
}

// Recent Submission Interface
export interface RecentSubmission {
  id: string
  formType: 'operator' | 'building' | 'room' | 'tenant' | 'lead'
  data: any
  submittedAt: string
  preview: string
}

// Template Manager State
export interface TemplateManagerState {
  templates: FormTemplate[]
  recentSubmissions: RecentSubmission[]
  loading: boolean
  error: string | null
}

// Template Save Dialog Props
export interface TemplateSaveDialogProps {
  isOpen: boolean
  onClose: () => void
  formType: 'operator' | 'building' | 'room' | 'tenant' | 'lead'
  formData: any
  onSave: (template: Omit<FormTemplate, 'id' | 'createdAt' | 'useCount'>) => void
}

// Template Selector Props
export interface TemplateSelectorProps {
  formType: 'operator' | 'building' | 'room' | 'tenant' | 'lead'
  onTemplateSelect: (template: FormTemplate) => void
  onRecentSelect: (submission: RecentSubmission) => void
  className?: string
}

// ============================================================================
// ROOM POC TYPES (Proof of Concept - Dynamic Bed Management)
// ============================================================================

export type RoomPoCType = 'Private' | 'Shared'
export type BedType = 'Single' | 'Double' | 'Queen' | 'King' | 'Bunk'
export type ViewType = 'Street' | 'Garden' | 'Courtyard' | 'None'
// Note: BathroomType is defined above in ROOM TYPES section as 'Private' | 'Shared' | 'En-Suite'
export type BookingStatus = 'Available' | 'Reserved' | 'Occupied'

export interface BedBookingInfo {
  availableFrom?: string
  availableUntil?: string
  status?: BookingStatus
}

export interface BedData {
  bedName?: string
  bedType?: BedType
  view?: ViewType
  rent?: number
  maxOccupancy?: number
  bookingInfo?: BedBookingInfo
}

export interface RoomPoCFormData {
  // Step 1: Basic Information
  roomNumber: string
  buildingId: string
  roomType: RoomPoCType
  maxBeds: number
  bathroomType?: BathroomType
  floorNumber?: number

  // Step 2: Individual Bed Configuration
  beds: BedData[]

  // Step 3: Room Amenities & Photos
  roomAmenities: {
    miniFridge: boolean
    sink: boolean
    beddingProvided: boolean
    workDesk: boolean
    workChair: boolean
    heating: boolean
    airConditioning: boolean
    cableTv: boolean
  }
  roomPhotos: File[]
  customAmenities?: string

  // Step 4: Maintenance & Utilities
  maintenance: {
    lastCheckDate?: string
    lastMaintenanceStaffId?: string
    lastRenovationDate?: string
  }
  condition: {
    roomConditionScore?: number
    cleaningFrequency?: string
    utilitiesMeterId?: string
    lastCleaningDate?: string
  }
  utilitiesIncluded: {
    electricity: boolean
    water: boolean
    gas: boolean
    internet: boolean
    cableTv: boolean
    trash: boolean
    heating: boolean
    ac: boolean
  }
}

export interface RoomPoCFormProps {
  onSubmit: (data: RoomPoCFormData) => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
  buildings: any[] // Use any[] to avoid type conflicts with FormDataProvider
  // Edit mode props
  initialData?: Partial<RoomPoCFormData>
  mode?: 'create' | 'edit'
  roomId?: string // For edit mode - existing room_id
}

// ============================================================================
// WALKSCORE API TYPES
// ============================================================================

// WalkScore score descriptions based on score ranges
export type WalkScoreDescription =
  | "Walker's Paradise"      // 90-100
  | "Very Walkable"          // 70-89
  | "Somewhat Walkable"      // 50-69
  | "Car-Dependent"          // 25-49
  | "Almost All Errands Require a Car" // 0-24

export type TransitScoreDescription =
  | "Excellent Transit"      // 90-100
  | "Excellent Transit"      // 70-89
  | "Good Transit"           // 50-69
  | "Some Transit"           // 25-49
  | "Minimal Transit"        // 0-24

export type BikeScoreDescription =
  | "Biker's Paradise"       // 90-100
  | "Very Bikeable"          // 70-89
  | "Bikeable"               // 50-69
  | "Somewhat Bikeable"      // 0-49

// Individual score data
export interface WalkScoreDetail {
  score: number              // 0-100
  description: string        // Human-readable description
}

// Nearby amenity from WalkScore API
export interface WalkScoreAmenity {
  name: string               // Business name
  type: string               // Category: grocery, restaurant, coffee, etc.
  distance: number           // Distance in miles
  icon?: string              // Optional icon identifier
}

// Categorized amenities for display
export interface CategorizedAmenities {
  dining: WalkScoreAmenity[]
  grocery: WalkScoreAmenity[]
  coffee: WalkScoreAmenity[]
  shopping: WalkScoreAmenity[]
  entertainment: WalkScoreAmenity[]
  fitness: WalkScoreAmenity[]
  parks: WalkScoreAmenity[]
  schools: WalkScoreAmenity[]
  other: WalkScoreAmenity[]
}

// Transit options nearby
export interface TransitOption {
  name: string               // Station/stop name
  type: 'bus' | 'subway' | 'rail' | 'light_rail' | 'ferry' | 'cable_car' | 'other'
  distance: number           // Distance in miles
  routes?: string[]          // Route numbers/names
}

// Complete WalkScore data structure
export interface WalkScoreData {
  // Core scores
  walk_score: WalkScoreDetail
  transit_score?: WalkScoreDetail
  bike_score?: WalkScoreDetail

  // Nearby amenities organized by category
  nearby_amenities: CategorizedAmenities

  // Transit options
  transit_options: TransitOption[]

  // Metadata
  address_used: string       // The address that was looked up
  fetched_at: string         // ISO timestamp of when data was fetched
  logo_url: string           // WalkScore logo URL (required for attribution)
  more_info_url: string      // Link to full WalkScore page

  // Status
  status: 'success' | 'error' | 'no_data'
  error_message?: string
}

// API response from WalkScore
export interface WalkScoreApiResponse {
  status: number
  walkscore?: number
  description?: string
  updated?: string
  logo_url?: string
  more_info_icon?: string
  more_info_link?: string
  ws_link?: string
  help_link?: string
  snapped_lat?: number
  snapped_lon?: number
  // Transit score (requires separate API call or premium)
  transit?: {
    score?: number
    description?: string
    summary?: string
  }
  // Bike score
  bike?: {
    score?: number
    description?: string
  }
}

// Component props for WalkScore display
export interface WalkScoreDisplayProps {
  data: WalkScoreData | null
  isLoading: boolean
  error?: string
  onRetry?: () => void
  compact?: boolean          // Compact view for smaller spaces
  showAmenities?: boolean    // Whether to show nearby amenities
  className?: string
}

// Hook return type for useWalkScore
export interface UseWalkScoreReturn {
  data: WalkScoreData | null
  isLoading: boolean
  error: string | null
  fetchWalkScore: (address: string, city: string, state: string, zip: string) => Promise<void>
  clearData: () => void
}
