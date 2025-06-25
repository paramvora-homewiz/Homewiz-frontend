/**
 * HomeWiz API Client
 *
 * Comprehensive API client for HomeWiz backend with authentication,
 * error handling, data validation, and type safety.
 */

import { useAuth } from '@clerk/nextjs'
import { Lead, Room, Building, ApplicationFormData, ApiResponse, UploadedFile, User, UserRole } from '@/types'
import { transformToTenantData, transformToLeadData, validateEmail } from './form-utils'
import config from './config'

// API Error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Request configuration interface
interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: any
  timeout?: number
  retries?: number
}

// API Response wrapper
interface ApiResponseWrapper<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  status_code?: number
  timestamp?: number
}

// Enhanced HTTP client with authentication and error handling
class ApiClient {
  private baseURL: string
  private timeout: number
  private defaultHeaders: Record<string, string>

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.timeout = config.api.timeout
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  /**
   * Get authentication headers
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers = { ...this.defaultHeaders }

    // In demo mode, add demo header
    if (config.app.demoMode) {
      headers['X-Demo-Mode'] = 'true'
      return headers
    }

    // Get Clerk token if available (only on client side)
    if (typeof window !== 'undefined') {
      try {
        // This is a simplified approach - in practice you'd use the useAuth hook
        // or get the token from the auth context
        const authToken = localStorage.getItem('clerk-token')
        if (authToken) {
          headers['Authorization'] = `Bearer ${authToken}`
        }
      } catch (error) {
        console.warn('Failed to get auth token:', error)
      }
    }

    return headers
  }

  async request<T>(endpoint: string, options: RequestConfig = {}): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.timeout,
      retries = 3
    } = options

    const url = `${this.baseURL}${endpoint}`
    const authHeaders = await this.getAuthHeaders()

    const config: RequestInit = {
      method,
      headers: { ...authHeaders, ...headers },
      signal: AbortSignal.timeout(timeout),
    }

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body)
    }

    let lastError: Error | null = null

    // Retry logic
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, config)

        // Handle response
        const responseData = await this.handleResponse<T>(response)
        return responseData

      } catch (error) {
        lastError = error as Error

        // Don't retry on client errors (4xx) or last attempt
        if (error instanceof ApiError && error.status < 500) {
          throw error
        }

        if (attempt === retries) {
          break
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }

    throw lastError || new Error('Request failed after retries')
  }

  /**
   * Handle API response and errors
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    let responseData: any

    try {
      responseData = await response.json()
    } catch (error) {
      // Handle non-JSON responses
      if (!response.ok) {
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status
        )
      }
      return {} as T
    }

    if (!response.ok) {
      throw new ApiError(
        responseData.error || responseData.detail || `HTTP ${response.status}`,
        response.status,
        responseData.code,
        responseData.details
      )
    }

    // Handle wrapped responses
    if (responseData.success !== undefined) {
      if (!responseData.success) {
        throw new ApiError(
          responseData.error || 'API request failed',
          responseData.status_code || response.status,
          responseData.code,
          responseData.details
        )
      }
      return responseData.data || responseData
    }

    return responseData
  }

  async get<T>(endpoint: string, options: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  async post<T>(endpoint: string, data: any, options: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data,
    })
  }

  async put<T>(endpoint: string, data: any, options: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data,
    })
  }

  async patch<T>(endpoint: string, data: any, options: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data,
    })
  }

  async delete<T>(endpoint: string, options: Omit<RequestConfig, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }

  // User Management APIs
  async getCurrentUser(): Promise<User> {
    return this.get<User>('/api/users/me')
  }

  async syncUser(userData: any): Promise<ApiResponseWrapper> {
    return this.post<ApiResponseWrapper>('/api/users/sync', userData)
  }

  async updateUserRole(userId: string, role: UserRole): Promise<ApiResponseWrapper> {
    return this.put<ApiResponseWrapper>(`/api/users/${userId}/role`, { role })
  }

  async getUser(userId: string): Promise<User> {
    return this.get<User>(`/api/users/${userId}`)
  }

  async listUsers(skip: number = 0, limit: number = 100): Promise<User[]> {
    return this.get<User[]>(`/api/users?skip=${skip}&limit=${limit}`)
  }
}

const apiClient = new ApiClient(config.api.baseUrl)

// Mock data
const mockBuildings: Building[] = [
  {
    building_id: 'bld_001',
    building_name: 'Sunset Apartments',
    address: '123 Main St',
    city: 'San Francisco',
    state: 'CA',
    zip_code: '94102',
    country: 'USA',
    operator_id: 'op_001',
    total_rooms: 50,
    available_rooms: 12,
    building_type: 'Apartment Complex',
    amenities: ['Pool', 'Gym', 'Laundry', 'Parking'],
    year_built: 2018,
    disability_access: true,
    building_images: ['/images/building1.jpg'],
  },
  {
    building_id: 'bld_002',
    building_name: 'Downtown Lofts',
    address: '456 Oak Ave',
    city: 'San Francisco',
    state: 'CA',
    zip_code: '94103',
    country: 'USA',
    operator_id: 'op_001',
    total_rooms: 30,
    available_rooms: 8,
    building_type: 'Loft',
    amenities: ['Rooftop Deck', 'Concierge', 'Pet Friendly'],
    year_built: 2020,
    disability_access: true,
    building_images: ['/images/building2.jpg'],
  }
]

const mockRooms: Room[] = [
  {
    room_id: 'room_001',
    room_number: '101',
    building_id: 'bld_001',
    ready_to_rent: true,
    status: 'AVAILABLE',
    active_tenants: 0,
    maximum_people_in_room: 2,
    private_room_rent: 2500,
    shared_room_rent_2: 1800,
    floor_number: 1,
    bed_count: 1,
    bathroom_type: 'private',
    bed_size: 'Queen',
    bed_type: 'Platform',
    view: 'City View',
    room_images: ['/images/room1.jpg'],
  },
  {
    room_id: 'room_002',
    room_number: '205',
    building_id: 'bld_001',
    ready_to_rent: true,
    status: 'AVAILABLE',
    active_tenants: 0,
    maximum_people_in_room: 1,
    private_room_rent: 3200,
    floor_number: 2,
    bed_count: 1,
    bathroom_type: 'private',
    bed_size: 'King',
    bed_type: 'Memory Foam',
    view: 'Bay View',
    room_images: ['/images/room2.jpg'],
  }
]

let mockLeads: Lead[] = []

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Real API functions
export const api = {
  // Leads
  async createLead(leadData: Partial<Lead>): Promise<ApiResponse<Lead>> {
    try {
      const response = await apiClient.post<Lead>('/api/leads/', {
        email: leadData.email,
        status: leadData.status || 'EXPLORING'
      })

      return {
        success: true,
        data: response,
        message: 'Lead created successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create lead'
      }
    }
  },

  async updateLeadStatus(leadId: string, status: string): Promise<ApiResponse<Lead>> {
    try {
      const response = await apiClient.put<Lead>(`/api/leads/${leadId}/status`, { status })

      return {
        success: true,
        data: response,
        message: 'Lead status updated successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update lead status'
      }
    }
  },

  async updateLeadWishlist(leadId: string, wishlist: string[]): Promise<ApiResponse<Lead>> {
    try {
      const response = await apiClient.put<Lead>(`/api/leads/${leadId}/wishlist`, { wishlist })

      return {
        success: true,
        data: response,
        message: 'Lead wishlist updated successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update lead wishlist'
      }
    }
  },

  async getLeadByEmail(email: string): Promise<ApiResponse<Lead | null>> {
    try {
      // Note: Backend doesn't have direct email lookup, so we'll get all leads and filter
      const response = await apiClient.get<Lead[]>('/api/leads/')
      const lead = response.find(l => l.email === email)

      return {
        success: true,
        data: lead || null
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get lead'
      }
    }
  },

  // Email uniqueness check for tenants
  async checkEmailUniqueness(email: string): Promise<ApiResponse<boolean>> {
    try {
      // Check both leads and tenants for email uniqueness
      const [leadsResponse, tenantsResponse] = await Promise.all([
        apiClient.get<Lead[]>('/api/leads/').catch(() => []),
        apiClient.get<any[]>('/api/tenants/').catch(() => [])
      ])

      const emailExists =
        leadsResponse.some((l: Lead) => l.email === email) ||
        tenantsResponse.some((t: any) => t.tenant_email === email)

      return {
        success: true,
        data: !emailExists // Return true if email is available (unique)
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check email uniqueness'
      }
    }
  },

  // Buildings
  async getBuildings(): Promise<ApiResponse<Building[]>> {
    try {
      const response = await apiClient.get<Building[]>('/api/buildings/')

      return {
        success: true,
        data: response
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get buildings'
      }
    }
  },

  async getBuildingById(buildingId: string): Promise<ApiResponse<Building | null>> {
    try {
      const response = await apiClient.get<Building>(`/api/buildings/${buildingId}`)

      return {
        success: true,
        data: response
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get building'
      }
    }
  },

  // Rooms
  async getRooms(filters?: {
    building_id?: string
    status?: string
    min_rent?: number
    max_rent?: number
  }): Promise<ApiResponse<Room[]>> {
    try {
      let endpoint = '/api/rooms/'
      const params = new URLSearchParams()

      if (filters?.building_id) {
        params.append('building_id', filters.building_id)
      }
      if (filters?.status) {
        params.append('status', filters.status)
      }

      if (params.toString()) {
        endpoint += `?${params.toString()}`
      }

      const response = await apiClient.get<Room[]>(endpoint)

      // Apply client-side filtering for rent range if needed
      let filteredRooms = response
      if (filters?.min_rent) {
        filteredRooms = filteredRooms.filter(room => room.private_room_rent >= filters.min_rent!)
      }
      if (filters?.max_rent) {
        filteredRooms = filteredRooms.filter(room => room.private_room_rent <= filters.max_rent!)
      }

      return {
        success: true,
        data: filteredRooms
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get rooms'
      }
    }
  },

  async getRoomById(roomId: string): Promise<ApiResponse<Room | null>> {
    try {
      const response = await apiClient.get<Room>(`/api/rooms/${roomId}`)

      return {
        success: true,
        data: response
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get room'
      }
    }
  },

  // Tenants
  async createTenant(formData: ApplicationFormData): Promise<ApiResponse<any>> {
    try {
      const tenantData = transformToTenantData(formData)
      const response = await apiClient.post<any>('/api/tenants/', tenantData)

      return {
        success: true,
        data: response,
        message: 'Tenant created successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create tenant'
      }
    }
  },

  // File Upload (Mock Supabase)
  async uploadFile(file: File, category: string): Promise<ApiResponse<UploadedFile>> {
    await delay(2000) // Simulate upload time
    
    // In real implementation, this would upload to Supabase
    const mockUrl = URL.createObjectURL(file)
    
    const uploadedFile: UploadedFile = {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: file.type,
      size: file.size,
      url: mockUrl,
      uploadedAt: new Date().toISOString(),
      category: category as any
    }
    
    return {
      success: true,
      data: uploadedFile,
      message: 'File uploaded successfully'
    }
  },

  async deleteFile(fileId: string): Promise<ApiResponse<void>> {
    await delay(300)
    
    // In real implementation, this would delete from Supabase
    return {
      success: true,
      message: 'File deleted successfully'
    }
  },

  // Application Submission
  async submitApplication(formData: ApplicationFormData, files: UploadedFile[]): Promise<ApiResponse<{ applicationId: string, tenantId?: string, leadId?: string }>> {
    try {
      let tenantId: string | undefined
      let leadId: string | undefined

      // First, check if we have all required fields for tenant creation
      const hasRequiredTenantFields = formData.selected_room_id && formData.selected_building_id

      if (hasRequiredTenantFields) {
        // Create tenant record
        const tenantResponse = await this.createTenant(formData)
        if (tenantResponse.success) {
          tenantId = tenantResponse.data.tenant_id
        } else {
          throw new Error(tenantResponse.error || 'Failed to create tenant')
        }
      }

      // Always create/update lead record for tracking
      const leadResponse = await this.getLeadByEmail(formData.email)

      if (leadResponse.success && leadResponse.data) {
        // Update existing lead
        const updateResponse = await this.updateLeadStatus(leadResponse.data.lead_id, 'APPLICATION_SUBMITTED')
        if (updateResponse.success && updateResponse.data) {
          leadId = updateResponse.data.lead_id
        }
      } else {
        // Create new lead
        const createResponse = await this.createLead({
          email: formData.email,
          status: 'APPLICATION_SUBMITTED'
        })
        if (createResponse.success && createResponse.data) {
          leadId = createResponse.data.lead_id
        }
      }

      // Files are already uploaded, just use them directly
      const uploadedFiles: UploadedFile[] = files

      const applicationId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      return {
        success: true,
        data: {
          applicationId,
          tenantId,
          leadId
        },
        message: hasRequiredTenantFields
          ? 'Application submitted successfully - Tenant record created'
          : 'Application submitted successfully - Lead record created'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to submit application'
      }
    }
  },

  // Search and Suggestions
  async getOccupationSuggestions(query: string): Promise<ApiResponse<string[]>> {
    await delay(200)
    
    const occupations = [
      'Software Engineer', 'Data Scientist', 'Product Manager', 'Designer',
      'Teacher', 'Nurse', 'Doctor', 'Lawyer', 'Consultant', 'Accountant',
      'Marketing Manager', 'Sales Representative', 'Project Manager',
      'Research Scientist', 'Financial Analyst', 'Operations Manager'
    ]
    
    const filtered = occupations.filter(occ => 
      occ.toLowerCase().includes(query.toLowerCase())
    )
    
    return {
      success: true,
      data: filtered
    }
  },

  async getCompanySuggestions(occupation: string): Promise<ApiResponse<string[]>> {
    await delay(200)
    
    const companySuggestions: Record<string, string[]> = {
      'software engineer': ['Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Netflix', 'Uber', 'Airbnb'],
      'data scientist': ['Google', 'Microsoft', 'Amazon', 'Netflix', 'Uber', 'Spotify'],
      'consultant': ['McKinsey & Company', 'Boston Consulting Group', 'Bain & Company', 'Deloitte', 'PwC'],
      'teacher': ['Public School District', 'Private School', 'University', 'Community College'],
      'nurse': ['UCSF Medical Center', 'Stanford Health Care', 'Kaiser Permanente', 'Sutter Health']
    }
    
    const suggestions = companySuggestions[occupation.toLowerCase()] || []
    
    return {
      success: true,
      data: suggestions
    }
  }
}

// Helper function to initialize mock data
export const initializeMockData = () => {
  // This could be used to seed initial data if needed
  console.log('Mock API initialized with sample data')
}
