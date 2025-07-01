/**
 * API Service - Unified Client Proxy
 * 
 * This file now serves as a proxy to the unified API client for backward compatibility.
 * All functionality has been consolidated into lib/api-client.ts for better maintainability.
 * 
 * @deprecated Use lib/api-client.ts for new development
 */

// Re-export everything from the unified API client
export * from '../lib/api-client'

// For components expecting the old apiService class interface
import { 
  getBuildings as unifiedGetBuildings,
  getRooms as unifiedGetRooms,
  getOperators as unifiedGetOperators,
  getTenants as unifiedGetTenants,
  getLeads as unifiedGetLeads,
  createBuilding as unifiedCreateBuilding,
  createRoom as unifiedCreateRoom,
  createTenant as unifiedCreateTenant,
  createLead as unifiedCreateLead,
  createOperator as unifiedCreateOperator,
  ApiResponse
} from '../lib/api-client'

// Legacy class interface for backward compatibility
export class ApiService {
  async getBuildings(): Promise<ApiResponse> {
    return unifiedGetBuildings()
  }

  async getRooms(buildingId?: string): Promise<ApiResponse> {
    return unifiedGetRooms(buildingId)
  }

  async getOperators(): Promise<ApiResponse> {
    return unifiedGetOperators()
  }

  async getTenants(): Promise<ApiResponse> {
    return unifiedGetTenants()
  }

  async getLeads(): Promise<ApiResponse> {
    return unifiedGetLeads()
  }

  async createBuilding(data: any): Promise<ApiResponse> {
    return unifiedCreateBuilding(data)
  }

  async createRoom(data: any): Promise<ApiResponse> {
    return unifiedCreateRoom(data)
  }

  async createTenant(data: any): Promise<ApiResponse> {
    return unifiedCreateTenant(data)
  }

  async createLead(data: any): Promise<ApiResponse> {
    return unifiedCreateLead(data)
  }

  async createOperator(data: any): Promise<ApiResponse> {
    return unifiedCreateOperator(data)
  }

  // Placeholder methods for database logging (functionality moved to api-client)
  getLogStats() {
    console.warn('Database logging functionality has been moved to the unified API client')
    return { total: 0, recent: [] }
  }

  clearLogs() {
    console.warn('Database logging functionality has been moved to the unified API client')
  }
}

// Export singleton instance for backward compatibility
export const apiService = new ApiService()

// Migration notice
console.warn(
  'Notice: apiService has been migrated to lib/api-client.ts. Please update your imports for better performance and maintainability.'
)