/**
 * Enhanced API Service with Database Logging
 * Handles all API calls and logs database operations
 */

import { databaseLogger, logDataAdded, logDataUpdated, logDataDeleted, logDatabaseError } from './databaseLogger'
import config from '../lib/config'
import { transformBackendDataForFrontend } from '../lib/backend-sync'

const API_BASE_URL = config.api.baseUrl

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

class ApiService {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  /**
   * Generic API call with logging
   */
  private async apiCall<T>(
    endpoint: string,
    options: RequestInit = {},
    operation?: { type: 'INSERT' | 'UPDATE' | 'DELETE', table: string, data?: any, id?: string | number }
  ): Promise<T> {
    // If backend is disabled, throw a specific error
    if (config.api.disabled) {
      throw new Error('Backend is disabled for this deployment. Using demo data only.')
    }

    const url = `${this.baseUrl}${endpoint}`

    try {
      console.log(`🌐 API Call: ${options.method || 'GET'} ${endpoint}`)
      
      // Prepare headers - avoid custom headers that trigger CORS preflight
      const headers: Record<string, string> = {}

      // For simple requests, only set Content-Type for POST/PUT with JSON body
      if (!(options.body instanceof FormData) && (options.method === 'POST' || options.method === 'PUT')) {
        headers['Content-Type'] = 'application/json'
      }

      const response = await fetch(url, {
        headers: {
          ...headers,
          ...options.headers,
        },
        mode: 'cors', // Explicitly set CORS mode
        credentials: 'omit', // Don't send credentials to avoid CORS preflight
        ...options,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()

      // Log successful database operations
      if (operation) {
        switch (operation.type) {
          case 'INSERT':
            logDataAdded(operation.table, operation.data, operation.id)
            break
          case 'UPDATE':
            logDataUpdated(operation.table, operation.data, operation.id!)
            break
          case 'DELETE':
            logDataDeleted(operation.table, operation.id!)
            break
        }
      }

      return data
    } catch (error) {
      // Enhanced error handling for common "Failed to fetch" scenarios
      const errorMessage = this.getEnhancedErrorMessage(error, url)
      console.error(`❌ API Error: ${endpoint}`, errorMessage)
      
      // Log database operation errors
      if (operation) {
        logDatabaseError({
          operation: operation.type,
          table: operation.table,
          data: operation.data,
          timestamp: new Date().toISOString(),
          id: operation.id
        }, errorMessage)
      }
      
      throw new Error(errorMessage)
    }
  }

  private getEnhancedErrorMessage(error: any, url: string): string {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      if (url.includes('localhost:8000')) {
        return `🔌 Backend server not running on port 8000. Please start the backend server first.
        
To start the backend:
1. Open terminal in: /Users/kaushatrivedi/Downloads/homewiz-backend-shardul-backend
2. Run: python -m uvicorn app.main:app --reload --port 8000

If you get GEMINI_API_KEY error, create a .env file with:
GEMINI_API_KEY=your_gemini_api_key_here`
      }
      
      return `🔌 Cannot connect to backend server at ${url}. Please check if the server is running.`
    }
    
    if (error instanceof Error) {
      if (error.message.includes('CORS')) {
        return `🚫 CORS error - Backend needs to allow requests from frontend origin`
      }
      
      if (error.message.includes('NetworkError')) {
        return `🌐 Network error - Check internet connection and server status`
      }
      
      return error.message
    }
    
    return 'Unknown API error occurred'
  }

  // ===== OPERATORS =====

  async getOperators() {
    return this.apiCall<any[]>('/operators/')
  }

  async createOperator(operatorData: any) {
    return this.apiCall<any>('/operators/', {
      method: 'POST',
      body: JSON.stringify(operatorData),
    }, {
      type: 'INSERT',
      table: 'operators',
      data: operatorData
    })
  }

  async updateOperator(id: number, operatorData: any) {
    return this.apiCall<any>(`/operators/${id}`, {
      method: 'PUT',
      body: JSON.stringify(operatorData),
    }, {
      type: 'UPDATE',
      table: 'operators',
      data: operatorData,
      id
    })
  }

  async deleteOperator(id: number) {
    return this.apiCall<any>(`/operators/${id}`, {
      method: 'DELETE',
    }, {
      type: 'DELETE',
      table: 'operators',
      id
    })
  }

  // ===== BUILDINGS =====

  async getBuildings() {
    const buildings = await this.apiCall<any[]>('/buildings/')
    // Transform backend data to frontend format (handle UUID, boolean conversions)
    if (Array.isArray(buildings)) {
      return buildings.map(transformBackendDataForFrontend)
    }
    return buildings
  }

  async createBuilding(buildingData: any) {
    console.log('🏢 Creating building with JSON data (no images)')
    // New backend only accepts JSON for building creation, images are uploaded separately
    return this.apiCall<any>('/buildings/', {
      method: 'POST',
      body: JSON.stringify(buildingData),
    }, {
      type: 'INSERT',
      table: 'buildings',
      data: buildingData
    })
  }

  async uploadBuildingImages(buildingId: string, files: File[]) {
    console.log(`📸 Uploading ${files.length} images for building ${buildingId}`)

    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })

    // Don't use apiCall for file uploads to avoid Content-Type conflicts
    const url = `${this.baseUrl}/buildings/${buildingId}/images/upload`
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type - let browser set it with boundary
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`❌ Image upload error:`, error)
      throw error
    }
  }

  async updateBuilding(id: string, buildingData: any) {
    return this.apiCall<any>(`/buildings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(buildingData),
    }, {
      type: 'UPDATE',
      table: 'buildings',
      data: buildingData,
      id
    })
  }

  async deleteBuilding(id: string) {
    return this.apiCall<any>(`/buildings/${id}`, {
      method: 'DELETE',
    }, {
      type: 'DELETE',
      table: 'buildings',
      id
    })
  }

  async updateBuildingImages(buildingId: string, imageUrls: string[]) {
    console.log(`🔗 Updating building ${buildingId} with ${imageUrls.length} Supabase image URLs`)

    return this.apiCall<any>(`/buildings/${buildingId}`, {
      method: 'PUT',
      body: JSON.stringify({ 
        building_id: buildingId,
        building_images: imageUrls 
      }),
    }, {
      type: 'UPDATE',
      table: 'buildings',
      data: { building_id: buildingId, building_images: imageUrls },
      id: buildingId
    })
  }

  // ===== ROOMS =====

  async getRooms() {
    return this.apiCall<any[]>('/rooms/')
  }

  async createRoom(roomData: any) {
    return this.apiCall<any>('/rooms/', {
      method: 'POST',
      body: JSON.stringify(roomData),
    }, {
      type: 'INSERT',
      table: 'rooms',
      data: roomData
    })
  }

  async updateRoom(id: string, roomData: any) {
    return this.apiCall<any>(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roomData),
    }, {
      type: 'UPDATE',
      table: 'rooms',
      data: roomData,
      id
    })
  }

  async deleteRoom(id: string) {
    return this.apiCall<any>(`/rooms/${id}`, {
      method: 'DELETE',
    }, {
      type: 'DELETE',
      table: 'rooms',
      id
    })
  }

  // ===== TENANTS =====

  async getTenants() {
    return this.apiCall<any[]>('/tenants/')
  }

  async createTenant(tenantData: any) {
    return this.apiCall<any>('/tenants/', {
      method: 'POST',
      body: JSON.stringify(tenantData),
    }, {
      type: 'INSERT',
      table: 'tenants',
      data: tenantData
    })
  }

  async updateTenant(id: number, tenantData: any) {
    return this.apiCall<any>(`/tenants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tenantData),
    }, {
      type: 'UPDATE',
      table: 'tenants',
      data: tenantData,
      id
    })
  }

  async deleteTenant(id: number) {
    return this.apiCall<any>(`/tenants/${id}`, {
      method: 'DELETE',
    }, {
      type: 'DELETE',
      table: 'tenants',
      id
    })
  }

  // ===== LEADS =====

  async getLeads() {
    return this.apiCall<any[]>('/leads/')
  }

  async createLead(leadData: any) {
    return this.apiCall<any>('/leads/', {
      method: 'POST',
      body: JSON.stringify(leadData),
    }, {
      type: 'INSERT',
      table: 'leads',
      data: leadData
    })
  }

  async updateLead(id: number, leadData: any) {
    return this.apiCall<any>(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(leadData),
    }, {
      type: 'UPDATE',
      table: 'leads',
      data: leadData,
      id
    })
  }

  async deleteLead(id: number) {
    return this.apiCall<any>(`/leads/${id}`, {
      method: 'DELETE',
    }, {
      type: 'DELETE',
      table: 'leads',
      id
    })
  }

  // ===== DASHBOARD METRICS =====

  async getDashboardMetrics() {
    return this.apiCall<any>('/analytics/dashboard')
  }

  // ===== LOGGING UTILITIES =====
  
  getLogs() {
    return databaseLogger.getLogs()
  }

  getLogStats() {
    return databaseLogger.getStats()
  }

  clearLogs() {
    databaseLogger.clearLogs()
  }
}

// Create singleton instance
export const apiService = new ApiService()

export default apiService
