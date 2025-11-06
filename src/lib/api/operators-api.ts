/**
 * Operators API Service
 *
 * Replaces Supabase direct database access for operators table
 * Maps to backend endpoints: /operators/*
 */

import { apiClient, ApiResponse } from '../api-client'
import { Operator, OperatorInsert, OperatorUpdate, QueryOptions } from './types'

export const operatorsApi = {
  /**
   * Get all operators with optional filtering
   * Backend: GET /operators/
   */
  async getAll(options?: QueryOptions): Promise<ApiResponse<Operator[]>> {
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

    const endpoint = params.toString() ? `/operators/?${params.toString()}` : '/operators/'

    return apiClient.get<Operator[]>(endpoint, {
      cache: true,
      cacheTtl: 300000, // 5 minutes
    })
  },

  /**
   * Get operator by ID
   * Backend: GET /operators/{operator_id}
   */
  async getById(operatorId: string): Promise<ApiResponse<Operator>> {
    return apiClient.get<Operator>(`/operators/${operatorId}`, {
      cache: true,
      cacheTtl: 300000,
    })
  },

  /**
   * Create new operator
   * Backend: POST /operators/
   */
  async create(data: OperatorInsert): Promise<ApiResponse<Operator>> {
    apiClient.clearCache()

    return apiClient.post<Operator>('/operators/', data, {
      validateResponse: true,
      retries: 2,
    })
  },

  /**
   * Update existing operator
   * Backend: PUT /operators/{operator_id}
   */
  async update(operatorId: string, data: OperatorUpdate): Promise<ApiResponse<Operator>> {
    apiClient.clearCache()

    return apiClient.put<Operator>(`/operators/${operatorId}`, data, {
      validateResponse: true,
      retries: 2,
    })
  },

  /**
   * Delete operator
   * Backend: DELETE /operators/{operator_id}
   */
  async delete(operatorId: string): Promise<ApiResponse<void>> {
    apiClient.clearCache()

    return apiClient.delete<void>(`/operators/${operatorId}`, {
      retries: 1,
    })
  },

  /**
   * Get operators by type
   */
  async getByType(operatorType: string): Promise<ApiResponse<Operator[]>> {
    return apiClient.get<Operator[]>(`/operators/?operator_type=${operatorType}`, {
      cache: true,
      cacheTtl: 300000,
    })
  },

  /**
   * Get active operators only
   */
  async getActive(): Promise<ApiResponse<Operator[]>> {
    return apiClient.get<Operator[]>(`/operators/?active=true`, {
      cache: true,
      cacheTtl: 300000,
    })
  },

  /**
   * Get operator's schedule
   * Backend: GET /operators/{operator_id}/schedule
   */
  async getSchedule(operatorId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/operators/${operatorId}/schedule`, {
      cache: true,
      cacheTtl: 60000, // 1 minute for schedules
    })
  },

  /**
   * Update operator availability
   * Backend: PUT /operators/{operator_id}/availability
   */
  async updateAvailability(operatorId: string, availability: any): Promise<ApiResponse<Operator>> {
    apiClient.clearCache()

    return apiClient.put<Operator>(`/operators/${operatorId}/availability`, availability, {
      validateResponse: true,
      retries: 2,
    })
  },

  /**
   * Get operator's events
   * Backend: GET /operators/{operator_id}/events/
   */
  async getEvents(operatorId: string): Promise<ApiResponse<any[]>> {
    return apiClient.get(`/operators/${operatorId}/events/`, {
      cache: true,
      cacheTtl: 60000,
    })
  },
}
