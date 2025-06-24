/**
 * Enhanced API Service with Database Logging
 * Handles all API calls and logs database operations
 */

import { databaseLogger, logDataAdded, logDataUpdated, logDataDeleted, logDatabaseError } from './databaseLogger'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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
    const url = `${this.baseUrl}${endpoint}`
    
    try {
      console.log(`🌐 API Call: ${options.method || 'GET'} ${endpoint}`)
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
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
      console.error(`❌ API Error: ${endpoint}`, error)
      
      // Log database operation errors
      if (operation) {
        logDatabaseError({
          operation: operation.type,
          table: operation.table,
          data: operation.data,
          timestamp: new Date().toISOString(),
          id: operation.id
        }, error instanceof Error ? error.message : 'Unknown error')
      }
      
      throw error
    }
  }

  // ===== OPERATORS =====
  
  async getOperators() {
    return this.apiCall<any[]>('/api/operators')
  }

  async createOperator(operatorData: any) {
    return this.apiCall<any>('/api/operators', {
      method: 'POST',
      body: JSON.stringify(operatorData),
    }, {
      type: 'INSERT',
      table: 'operators',
      data: operatorData
    })
  }

  async updateOperator(id: number, operatorData: any) {
    return this.apiCall<any>(`/api/operators/${id}`, {
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
    return this.apiCall<any>(`/api/operators/${id}`, {
      method: 'DELETE',
    }, {
      type: 'DELETE',
      table: 'operators',
      id
    })
  }

  // ===== BUILDINGS =====
  
  async getBuildings() {
    return this.apiCall<any[]>('/api/buildings')
  }

  async createBuilding(buildingData: any) {
    return this.apiCall<any>('/api/buildings', {
      method: 'POST',
      body: JSON.stringify(buildingData),
    }, {
      type: 'INSERT',
      table: 'buildings',
      data: buildingData
    })
  }

  async updateBuilding(id: string, buildingData: any) {
    return this.apiCall<any>(`/api/buildings/${id}`, {
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
    return this.apiCall<any>(`/api/buildings/${id}`, {
      method: 'DELETE',
    }, {
      type: 'DELETE',
      table: 'buildings',
      id
    })
  }

  // ===== ROOMS =====
  
  async getRooms() {
    return this.apiCall<any[]>('/api/rooms')
  }

  async createRoom(roomData: any) {
    return this.apiCall<any>('/api/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData),
    }, {
      type: 'INSERT',
      table: 'rooms',
      data: roomData
    })
  }

  async updateRoom(id: string, roomData: any) {
    return this.apiCall<any>(`/api/rooms/${id}`, {
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
    return this.apiCall<any>(`/api/rooms/${id}`, {
      method: 'DELETE',
    }, {
      type: 'DELETE',
      table: 'rooms',
      id
    })
  }

  // ===== TENANTS =====
  
  async getTenants() {
    return this.apiCall<any[]>('/api/tenants')
  }

  async createTenant(tenantData: any) {
    return this.apiCall<any>('/api/tenants', {
      method: 'POST',
      body: JSON.stringify(tenantData),
    }, {
      type: 'INSERT',
      table: 'tenants',
      data: tenantData
    })
  }

  async updateTenant(id: number, tenantData: any) {
    return this.apiCall<any>(`/api/tenants/${id}`, {
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
    return this.apiCall<any>(`/api/tenants/${id}`, {
      method: 'DELETE',
    }, {
      type: 'DELETE',
      table: 'tenants',
      id
    })
  }

  // ===== LEADS =====
  
  async getLeads() {
    return this.apiCall<any[]>('/api/leads')
  }

  async createLead(leadData: any) {
    return this.apiCall<any>('/api/leads', {
      method: 'POST',
      body: JSON.stringify(leadData),
    }, {
      type: 'INSERT',
      table: 'leads',
      data: leadData
    })
  }

  async updateLead(id: number, leadData: any) {
    return this.apiCall<any>(`/api/leads/${id}`, {
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
    return this.apiCall<any>(`/api/leads/${id}`, {
      method: 'DELETE',
    }, {
      type: 'DELETE',
      table: 'leads',
      id
    })
  }

  // ===== DASHBOARD METRICS =====
  
  async getDashboardMetrics() {
    return this.apiCall<any>('/api/analytics/dashboard')
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
