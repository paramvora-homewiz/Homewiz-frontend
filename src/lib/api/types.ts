/**
 * API Response Types
 *
 * These types match the backend FastAPI response format
 */

// Base response from backend
export interface BackendResponse<T = any> {
  success?: boolean
  data?: T
  error?: string
  message?: string
  detail?: string // FastAPI validation errors
}

// List response with pagination
export interface BackendListResponse<T> {
  data: T[]
  count?: number
  total?: number
  page?: number
  limit?: number
}

// Query options for filtering and pagination
export interface QueryOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: Record<string, any>
  search?: string
  searchFields?: string[]
}

// Building types (matches backend schema)
export interface Building {
  building_id: string
  building_name: string
  address: string
  city: string
  state: string
  zip: string
  area?: string
  total_units?: number
  available_units?: number
  building_type?: string
  amenities?: any
  images?: string[]
  virtual_tour_url?: string
  operator_id?: string
  created_at?: string
  last_modified?: string
  [key: string]: any
}

export interface BuildingInsert extends Omit<Building, 'building_id' | 'created_at' | 'last_modified'> {}
export interface BuildingUpdate extends Partial<BuildingInsert> {}

// Room types
export interface Room {
  room_id: string
  building_id: string
  room_number: string
  room_type?: string
  private_room_rent?: number
  shared_room_rent_2?: number
  shared_room_rent_3?: number
  shared_room_rent_4?: number
  status?: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED'
  bed_count?: number
  room_images?: string[]
  virtual_tour_url?: string
  amenities?: any
  [key: string]: any
}

export interface RoomInsert extends Omit<Room, 'room_id'> {}
export interface RoomUpdate extends Partial<RoomInsert> {}

// Tenant types
export interface Tenant {
  tenant_id: string
  tenant_name: string
  tenant_email: string
  phone?: string
  room_id?: string
  building_id?: string
  lease_start_date?: string
  lease_end_date?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'TERMINATED' | 'EXPIRED'
  deposit_amount?: number
  payment_status?: string
  operator_id?: string
  emergency_contact?: any
  created_at?: string
  last_modified?: string
  [key: string]: any
}

export interface TenantInsert extends Omit<Tenant, 'tenant_id' | 'created_at' | 'last_modified'> {}
export interface TenantUpdate extends Partial<TenantInsert> {}

// Operator types
export interface Operator {
  operator_id: string
  name: string
  email: string
  phone?: string
  operator_type?: string
  company?: string
  active?: boolean
  created_at?: string
  [key: string]: any
}

export interface OperatorInsert extends Omit<Operator, 'operator_id' | 'created_at'> {}
export interface OperatorUpdate extends Partial<OperatorInsert> {}

// Lead types
export interface Lead {
  lead_id: string
  email: string
  lead_name?: string
  status?: string
  budget_min?: number
  budget_max?: number
  preferred_move_in_date?: string
  rooms_interested?: any
  selected_room_id?: string
  visa_status?: string
  created_at?: string
  last_modified?: string
  [key: string]: any
}

export interface LeadInsert extends Omit<Lead, 'lead_id' | 'created_at' | 'last_modified'> {}
export interface LeadUpdate extends Partial<LeadInsert> {}

// File upload types
export interface FileUploadResponse {
  url: string
  path: string
  file_name: string
  file_size?: number
  mime_type?: string
}

// Image category for uploads
export type ImageCategory = 'outside' | 'common_areas' | 'amenities' | 'kitchen_bathrooms' | 'videos'
