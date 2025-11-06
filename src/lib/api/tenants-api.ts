/**
 * Tenants API Service
 *
 * Replaces Supabase direct database access for tenants table
 * Maps to backend endpoints: /tenants/*
 */

import { apiClient, ApiResponse } from '../api-client'
import { Tenant, TenantInsert, TenantUpdate, QueryOptions } from './types'

export const tenantsApi = {
  /**
   * Get all tenants with optional filtering
   * Backend: GET /tenants/
   */
  async getAll(options?: QueryOptions): Promise<ApiResponse<Tenant[]>> {
    const params = new URLSearchParams()

    if (options?.page) params.append('page', options.page.toString())
    if (options?.limit) params.append('limit', options.limit.toString())
    if (options?.sortBy) params.append('sort_by', options.sortBy)
    if (options?.sortOrder) params.append('sort_order', options.sortOrder)
    if (options?.search) params.append('search', options.search)
    if (options?.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }

    const endpoint = params.toString() ? `/tenants/?${params.toString()}` : '/tenants/'

    return apiClient.get<Tenant[]>(endpoint, {
      cache: true,
      cacheTtl: 180000, // 3 minutes
    })
  },

  /**
   * Get tenant by ID
   * Backend: GET /tenants/{tenant_id}
   */
  async getById(tenantId: string): Promise<ApiResponse<Tenant>> {
    return apiClient.get<Tenant>(`/tenants/${tenantId}`, {
      cache: true,
      cacheTtl: 180000,
    })
  },

  /**
   * Create new tenant
   * Backend: POST /tenants/
   */
  async create(data: TenantInsert): Promise<ApiResponse<Tenant>> {
    apiClient.clearCache()

    return apiClient.post<Tenant>('/tenants/', data, {
      validateResponse: true,
      retries: 2,
    })
  },

  /**
   * Update existing tenant
   * Backend: PUT /tenants/{tenant_id}
   */
  async update(tenantId: string, data: TenantUpdate): Promise<ApiResponse<Tenant>> {
    apiClient.clearCache()

    return apiClient.put<Tenant>(`/tenants/${tenantId}`, data, {
      validateResponse: true,
      retries: 2,
    })
  },

  /**
   * Delete tenant
   * Backend: DELETE /tenants/{tenant_id}
   */
  async delete(tenantId: string): Promise<ApiResponse<void>> {
    apiClient.clearCache()

    return apiClient.delete<void>(`/tenants/${tenantId}`, {
      retries: 1,
    })
  },

  /**
   * Get tenants by building ID
   * Backend: GET /tenants/by-building/{building_id}
   */
  async getByBuilding(buildingId: string): Promise<ApiResponse<Tenant[]>> {
    return apiClient.get<Tenant[]>(`/tenants/by-building/${buildingId}`, {
      cache: true,
      cacheTtl: 180000,
    })
  },

  /**
   * Get tenants by status
   */
  async getByStatus(status: string): Promise<ApiResponse<Tenant[]>> {
    return apiClient.get<Tenant[]>(`/tenants/?status=${status}`, {
      cache: true,
      cacheTtl: 180000,
    })
  },

  /**
   * Search tenants by email or name
   */
  async search(searchTerm: string): Promise<ApiResponse<Tenant[]>> {
    return apiClient.get<Tenant[]>(`/tenants/?search=${encodeURIComponent(searchTerm)}`, {
      cache: true,
      cacheTtl: 60000,
    })
  },

  /**
   * Get tenant with building and room details (JOIN)
   * Backend should support this with ?include=building,room or similar
   */
  async getWithDetails(tenantId: string): Promise<ApiResponse<Tenant>> {
    return apiClient.get<Tenant>(`/tenants/${tenantId}?include=building,room`, {
      cache: true,
      cacheTtl: 180000,
    })
  },

  /**
   * Get lease information for a tenant
   * Backend: GET /tenants/{tenant_id}/lease
   */
  async getLeaseInfo(tenantId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/tenants/${tenantId}/lease`, {
      cache: true,
      cacheTtl: 300000,
    })
  },

  /**
   * Update payment status
   * Backend: PUT /tenants/{tenant_id}/payment-status
   */
  async updatePaymentStatus(
    tenantId: string,
    paymentStatus: string,
    lastPaymentDate?: string
  ): Promise<ApiResponse<Tenant>> {
    apiClient.clearCache()

    return apiClient.put<Tenant>(`/tenants/${tenantId}/payment-status`, {
      payment_status: paymentStatus,
      last_payment_date: lastPaymentDate,
    }, {
      validateResponse: true,
      retries: 2,
    })
  },

  /**
   * Get upcoming lease expirations
   * Get tenants whose leases expire within N days
   */
  async getUpcomingExpirations(daysAhead: number = 30): Promise<ApiResponse<Tenant[]>> {
    return apiClient.get<Tenant[]>(`/tenants/?expiring_within=${daysAhead}`, {
      cache: true,
      cacheTtl: 60000,
    })
  },
}
