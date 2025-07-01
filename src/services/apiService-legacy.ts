/**
 * Legacy API Service - Compatibility Layer
 * 
 * This file provides backward compatibility for components that import from the old apiService.
 * All functionality has been migrated to the unified API client in lib/api-client.ts
 * 
 * @deprecated Use lib/api-client.ts instead
 */

// Re-export everything from the unified API client for backward compatibility
export {
  apiClient,
  ApiResponse,
  submitFormData,
  uploadFile,
  getBuildings,
  getRooms,
  getOperators,
  getTenants,
  getLeads,
  createBuilding,
  createRoom,
  createTenant,
  createLead,
  createOperator
} from '../lib/api-client'

// Legacy class interface for backward compatibility
export class ApiService {
  async getBuildings() {
    const { getBuildings } = await import('../lib/api-client')
    return getBuildings()
  }

  async getRooms(buildingId?: string) {
    const { getRooms } = await import('../lib/api-client')
    return getRooms(buildingId)
  }

  async getOperators() {
    const { getOperators } = await import('../lib/api-client')
    return getOperators()
  }

  async getTenants() {
    const { getTenants } = await import('../lib/api-client')
    return getTenants()
  }

  async getLeads() {
    const { getLeads } = await import('../lib/api-client')
    return getLeads()
  }

  async createBuilding(data: any) {
    const { createBuilding } = await import('../lib/api-client')
    return createBuilding(data)
  }

  async createRoom(data: any) {
    const { createRoom } = await import('../lib/api-client')
    return createRoom(data)
  }

  async createTenant(data: any) {
    const { createTenant } = await import('../lib/api-client')
    return createTenant(data)
  }

  async createLead(data: any) {
    const { createLead } = await import('../lib/api-client')
    return createLead(data)
  }

  async createOperator(data: any) {
    const { createOperator } = await import('../lib/api-client')
    return createOperator(data)
  }
}

// Export singleton instance for backward compatibility
export const apiService = new ApiService()

console.warn(
  'Warning: You are using the legacy apiService. Please migrate to the unified API client from lib/api-client.ts'
)