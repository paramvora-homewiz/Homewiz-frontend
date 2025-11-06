/**
 * Leads API Service
 *
 * Replaces Supabase direct database access for leads table
 * Maps to backend endpoints: /leads/*
 */

import { apiClient, ApiResponse } from '../api-client'
import { Lead, LeadInsert, LeadUpdate, QueryOptions, Tenant } from './types'

export const leadsApi = {
  /**
   * Get all leads with optional filtering
   * Backend: GET /leads/
   */
  async getAll(options?: QueryOptions): Promise<ApiResponse<Lead[]>> {
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

    const endpoint = params.toString() ? `/leads/?${params.toString()}` : '/leads/'

    return apiClient.get<Lead[]>(endpoint, {
      cache: true,
      cacheTtl: 180000, // 3 minutes
    })
  },

  /**
   * Get lead by ID
   * Backend: GET /leads/{lead_id}
   */
  async getById(leadId: string): Promise<ApiResponse<Lead>> {
    return apiClient.get<Lead>(`/leads/${leadId}`, {
      cache: true,
      cacheTtl: 180000,
    })
  },

  /**
   * Create new lead
   * Backend: POST /leads/
   */
  async create(data: LeadInsert): Promise<ApiResponse<Lead>> {
    apiClient.clearCache()

    return apiClient.post<Lead>('/leads/', data, {
      validateResponse: true,
      retries: 2,
    })
  },

  /**
   * Update lead status
   * Backend: PUT /leads/{lead_id}/status
   */
  async updateStatus(leadId: string, status: string): Promise<ApiResponse<Lead>> {
    apiClient.clearCache()

    return apiClient.put<Lead>(`/leads/${lead_id}/status`, { status }, {
      validateResponse: true,
      retries: 2,
    })
  },

  /**
   * Update lead wishlist/room preferences
   * Backend: PUT /leads/{lead_id}/wishlist
   */
  async updateWishlist(leadId: string, roomsInterested: any): Promise<ApiResponse<Lead>> {
    apiClient.clearCache()

    return apiClient.put<Lead>(`/leads/${leadId}/wishlist`, {
      rooms_interested: roomsInterested
    }, {
      validateResponse: true,
      retries: 2,
    })
  },

  /**
   * Get leads by status
   * Backend: GET /leads/by-status/{status}
   */
  async getByStatus(status: string): Promise<ApiResponse<Lead[]>> {
    return apiClient.get<Lead[]>(`/leads/by-status/${status}`, {
      cache: true,
      cacheTtl: 180000,
    })
  },

  /**
   * Convert lead to tenant
   * Backend: POST /leads/{lead_id}/convert
   */
  async convertToTenant(leadId: string, tenantData?: Partial<any>): Promise<ApiResponse<Tenant>> {
    apiClient.clearCache()

    return apiClient.post<Tenant>(`/leads/${leadId}/convert`, tenantData || {}, {
      validateResponse: true,
      retries: 2,
    })
  },

  /**
   * Assign lead to operator
   * This might be a custom field update
   */
  async assignToOperator(leadId: string, operatorId: string): Promise<ApiResponse<Lead>> {
    apiClient.clearCache()

    return apiClient.put<Lead>(`/leads/${leadId}`, {
      operator_id: operatorId
    }, {
      validateResponse: true,
      retries: 2,
    })
  },

  /**
   * Search leads
   */
  async search(searchTerm: string): Promise<ApiResponse<Lead[]>> {
    return apiClient.get<Lead[]>(`/leads/?search=${encodeURIComponent(searchTerm)}`, {
      cache: true,
      cacheTtl: 60000,
    })
  },

  /**
   * Get lead events (tours, followups, etc.)
   * Backend: GET /leads/{lead_id}/events/
   */
  async getEvents(leadId: string): Promise<ApiResponse<any[]>> {
    return apiClient.get(`/leads/${leadId}/events/`, {
      cache: true,
      cacheTtl: 60000,
    })
  },
}
