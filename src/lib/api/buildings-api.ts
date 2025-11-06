/**
 * Buildings API Service
 *
 * Replaces Supabase direct database access for buildings table
 * Maps to backend endpoints: /buildings/*
 */

import { apiClient, ApiResponse } from '../api-client'
import {
  Building,
  BuildingInsert,
  BuildingUpdate,
  QueryOptions,
  BackendListResponse,
  FileUploadResponse
} from './types'

export const buildingsApi = {
  /**
   * Get all buildings with optional filtering
   * Backend: GET /buildings/
   */
  async getAll(options?: QueryOptions): Promise<ApiResponse<Building[]>> {
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

    const endpoint = params.toString() ? `/buildings/?${params.toString()}` : '/buildings/'

    return apiClient.get<Building[]>(endpoint, {
      cache: true,
      cacheTtl: 300000, // 5 minutes
    })
  },

  /**
   * Get building by ID
   * Backend: GET /buildings/{building_id}
   */
  async getById(buildingId: string): Promise<ApiResponse<Building>> {
    return apiClient.get<Building>(`/buildings/${buildingId}`, {
      cache: true,
      cacheTtl: 300000,
    })
  },

  /**
   * Create new building
   * Backend: POST /buildings/
   */
  async create(data: BuildingInsert): Promise<ApiResponse<Building>> {
    // Clear cache on mutation
    apiClient.clearCache()

    return apiClient.post<Building>('/buildings/', data, {
      validateResponse: true,
      retries: 2,
    })
  },

  /**
   * Update existing building
   * Backend: PUT /buildings/{building_id}
   */
  async update(buildingId: string, data: BuildingUpdate): Promise<ApiResponse<Building>> {
    // Clear cache on mutation
    apiClient.clearCache()

    return apiClient.put<Building>(`/buildings/${buildingId}`, data, {
      validateResponse: true,
      retries: 2,
    })
  },

  /**
   * Delete building
   * Backend: DELETE /buildings/{building_id}
   */
  async delete(buildingId: string): Promise<ApiResponse<void>> {
    // Clear cache on mutation
    apiClient.clearCache()

    return apiClient.delete<void>(`/buildings/${buildingId}`, {
      retries: 1,
    })
  },

  /**
   * Get buildings with available rooms (JOIN query)
   * This may need custom backend endpoint or client-side filtering
   */
  async getWithAvailableRooms(): Promise<ApiResponse<Building[]>> {
    // Option 1: If backend has this endpoint
    // return apiClient.get<Building[]>('/buildings/with-available-rooms')

    // Option 2: Filter client-side (less efficient)
    const response = await this.getAll()
    if (response.success && response.data) {
      const filtered = response.data.filter(b => (b.available_units ?? 0) > 0)
      return {
        ...response,
        data: filtered
      }
    }
    return response
  },

  /**
   * Search buildings by location
   * Uses backend search functionality
   */
  async searchByLocation(query: string): Promise<ApiResponse<Building[]>> {
    return apiClient.get<Building[]>(`/buildings/?search=${encodeURIComponent(query)}`, {
      cache: true,
      cacheTtl: 60000, // 1 minute for search results
    })
  },

  /**
   * Get building statistics
   * Backend: GET /buildings/{building_id}/stats
   */
  async getStats(buildingId: string): Promise<ApiResponse<any>> {
    return apiClient.get(`/buildings/${buildingId}/stats`, {
      cache: true,
      cacheTtl: 60000,
    })
  },

  /**
   * Upload building images
   * Backend: POST /buildings/{building_id}/images/upload
   */
  async uploadImages(buildingId: string, files: File[]): Promise<ApiResponse<FileUploadResponse[]>> {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))

    return apiClient.request({
      method: 'POST',
      endpoint: `/buildings/${buildingId}/images/upload`,
      data: formData,
      headers: {}, // Let browser set Content-Type with boundary
      validateResponse: true,
      retries: 1,
    })
  },

  /**
   * Upload single building image
   * Backend: POST /buildings/{building_id}/images/single
   */
  async uploadSingleImage(buildingId: string, file: File, category?: string): Promise<ApiResponse<FileUploadResponse>> {
    const formData = new FormData()
    formData.append('file', file)
    if (category) formData.append('category', category)

    return apiClient.request({
      method: 'POST',
      endpoint: `/buildings/${buildingId}/images/single`,
      data: formData,
      headers: {},
      validateResponse: true,
      retries: 1,
    })
  },

  /**
   * Delete building image
   * Backend: DELETE /buildings/{building_id}/images/{image_id}
   */
  async deleteImage(buildingId: string, imageId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/buildings/${buildingId}/images/${imageId}`)
  },

  /**
   * Delete all building images
   * Backend: DELETE /buildings/{building_id}/images/all
   */
  async deleteAllImages(buildingId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/buildings/${buildingId}/images/all`)
  },

  /**
   * Get all building images
   * Backend: GET /buildings/{building_id}/images/
   */
  async getImages(buildingId: string): Promise<ApiResponse<any[]>> {
    return apiClient.get(`/buildings/${buildingId}/images/`, {
      cache: true,
      cacheTtl: 300000,
    })
  },

  /**
   * Upload building video
   * Backend: POST /buildings/{building_id}/videos/upload
   */
  async uploadVideo(buildingId: string, file: File): Promise<ApiResponse<FileUploadResponse>> {
    const formData = new FormData()
    formData.append('file', file)

    return apiClient.request({
      method: 'POST',
      endpoint: `/buildings/${buildingId}/videos/upload`,
      data: formData,
      headers: {},
      validateResponse: true,
      retries: 0, // Videos are large, don't retry
      timeout: 120000, // 2 minutes for large files
    })
  },

  /**
   * Delete building videos
   * Backend: DELETE /buildings/{building_id}/videos/
   */
  async deleteVideos(buildingId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/buildings/${buildingId}/videos/`)
  },
}
