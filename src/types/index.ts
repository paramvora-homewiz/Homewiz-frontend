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

export type OperatorType = 'LEASING_AGENT' | 'MAINTENANCE' | 'BUILDING_MANAGER' | 'ADMIN'
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
  operator_id?: number  // Changed from string to optional number to match backend
  total_rooms: number
  available_rooms: number
  building_type: string
  amenities: string[]
  year_built?: number
  last_renovation?: number
  building_rules?: string
  amenities_details?: Record<string, any>
  neighborhood_description?: string
  building_description?: string
  public_transit_info?: string
  parking_info?: string
  security_features?: string
  disability_access: boolean
  disability_features?: string
  building_images?: string[]
  virtual_tour_url?: string
  created_at?: string
  updated_at?: string
}

export interface BuildingFormData extends Omit<Building, 'building_id' | 'created_at' | 'updated_at'> {
  building_id?: string
  full_address?: string
  street?: string
  area?: string
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
  pet_friendly?: string
  cleaning_common_spaces?: string
  utilities_included: boolean
  fitness_area: boolean
  work_study_area: boolean
  social_events: boolean
  nearby_conveniences_walk?: string
  nearby_transportation?: string
  priority?: number
  property_manager?: number
  available: boolean
  // Media files for upload
  media_files?: MediaFile[]
}

// ============================================================================
// ROOM TYPES
// ============================================================================

export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED'
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

export interface RoomFormData extends Omit<Room, 'room_id' | 'created_at' | 'updated_at'> {
  room_id?: string
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
  // New fields added based on best practices
  room_access_type?: 'KEY' | 'KEYCARD' | 'DIGITAL' | 'CODE'
  internet_speed?: number
  room_condition_score?: number
  cleaning_frequency?: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'ON_REQUEST'
  utilities_meter_id?: string
  last_cleaning_date?: string
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

// Room and Building Types
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
  room_images?: string[]
  virtual_tour_url?: string
  available_from?: string
  additional_features?: string
}

// RoomStatus is already defined above

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
