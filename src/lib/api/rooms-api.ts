/**
 * Rooms API Service
 *
 * Replaces Supabase direct database access for rooms table
 * Maps to backend endpoints: /rooms/*
 */

import { apiClient, ApiResponse } from '../api-client'
import {
  Room,
  RoomInsert,
  RoomUpdate,
  QueryOptions,
  FileUploadResponse
} from './types'

export const roomsApi = {
  /**
   * Get all rooms with optional filtering
   * Backend: GET /rooms/
   */
  async getAll(options?: QueryOptions): Promise<ApiResponse<Room[]>> {
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

    const endpoint = params.toString() ? `/rooms/?${params.toString()}` : '/rooms/'

    return apiClient.get<Room[]>(endpoint, {
      cache: true,
      cacheTtl: 180000, // 3 minutes (rooms change more frequently)
    })
  },

  /**
   * Get room by ID
   * Backend: GET /rooms/{room_id}
   */
  async getById(roomId: string): Promise<ApiResponse<Room>> {
    return apiClient.get<Room>(`/rooms/${roomId}`, {
      cache: true,
      cacheTtl: 180000,
    })
  },

  /**
   * Get room details with parsed image URLs
   * Backend: GET /rooms/{room_id}/details
   */
  async getDetails(roomId: string): Promise<ApiResponse<Room>> {
    return apiClient.get<Room>(`/rooms/${roomId}/details`, {
      cache: true,
      cacheTtl: 180000,
    })
  },

  /**
   * Create new room
   * Backend: POST /rooms/
   */
  async create(data: RoomInsert): Promise<ApiResponse<Room>> {
    apiClient.clearCache()

    return apiClient.post<Room>('/rooms/', data, {
      validateResponse: true,
      retries: 2,
    })
  },

  /**
   * Update existing room
   * Backend: PUT /rooms/{room_id}
   */
  async update(roomId: string, data: RoomUpdate): Promise<ApiResponse<Room>> {
    apiClient.clearCache()

    return apiClient.put<Room>(`/rooms/${roomId}`, data, {
      validateResponse: true,
      retries: 2,
    })
  },

  /**
   * Delete room
   * Backend: DELETE /rooms/{room_id}
   */
  async delete(roomId: string): Promise<ApiResponse<void>> {
    apiClient.clearCache()

    return apiClient.delete<void>(`/rooms/${roomId}`, {
      retries: 1,
    })
  },

  /**
   * Get rooms by building ID
   * Backend: GET /rooms/?building_id={building_id}
   */
  async getByBuilding(buildingId: string): Promise<ApiResponse<Room[]>> {
    return apiClient.get<Room[]>(`/rooms/?building_id=${buildingId}`, {
      cache: true,
      cacheTtl: 180000,
    })
  },

  /**
   * Get available rooms by building
   * Filters for AVAILABLE status
   */
  async getAvailableByBuilding(buildingId: string): Promise<ApiResponse<Room[]>> {
    return apiClient.get<Room[]>(`/rooms/?building_id=${buildingId}&status=AVAILABLE`, {
      cache: true,
      cacheTtl: 180000,
    })
  },

  /**
   * Update room status
   * Backend: POST /rooms/{room_id}/status
   */
  async updateStatus(
    roomId: string,
    status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED'
  ): Promise<ApiResponse<Room>> {
    apiClient.clearCache()

    return apiClient.post<Room>(`/rooms/${roomId}/status`, { status }, {
      validateResponse: true,
      retries: 2,
    })
  },

  /**
   * Check room availability
   * Backend: GET /rooms/{room_id}/availability
   */
  async checkAvailability(roomId: string, startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)

    const endpoint = params.toString()
      ? `/rooms/${roomId}/availability?${params.toString()}`
      : `/rooms/${roomId}/availability`

    return apiClient.get(endpoint, {
      cache: true,
      cacheTtl: 60000, // 1 minute
    })
  },

  /**
   * Get rooms by price range
   * Client-side filtering if backend doesn't support
   */
  async getByPriceRange(minPrice: number, maxPrice: number): Promise<ApiResponse<Room[]>> {
    // Option 1: If backend supports price filtering
    return apiClient.get<Room[]>(
      `/rooms/?min_price=${minPrice}&max_price=${maxPrice}`,
      {
        cache: true,
        cacheTtl: 180000,
      }
    )

    // Option 2: Client-side filtering (fallback)
    // const response = await this.getAll()
    // if (response.success && response.data) {
    //   const filtered = response.data.filter(room => {
    //     const price = room.private_room_rent ?? 0
    //     return price >= minPrice && price <= maxPrice
    //   })
    //   return { ...response, data: filtered }
    // }
    // return response
  },

  /**
   * Upload room images
   * Backend: POST /rooms/{room_id}/images/upload
   */
  async uploadImages(roomId: string, files: File[]): Promise<ApiResponse<FileUploadResponse[]>> {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))

    return apiClient.request({
      method: 'POST',
      endpoint: `/rooms/${roomId}/images/upload`,
      data: formData,
      headers: {},
      validateResponse: true,
      retries: 1,
    })
  },

  /**
   * Get room images
   * Backend: GET /rooms/{room_id}/images/
   */
  async getImages(roomId: string): Promise<ApiResponse<any[]>> {
    return apiClient.get(`/rooms/${roomId}/images/`, {
      cache: true,
      cacheTtl: 300000,
    })
  },

  /**
   * Delete room image
   * Backend: DELETE /rooms/{room_id}/images/{image_id}
   */
  async deleteImage(roomId: string, imageId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/rooms/${roomId}/images/${imageId}`)
  },

  /**
   * Search rooms with advanced filters
   * For chat/search functionality
   */
  async search(params: {
    priceMin?: number
    priceMax?: number
    city?: string
    bedrooms?: number
    amenities?: string[]
    petFriendly?: boolean
    furnished?: boolean
  }): Promise<ApiResponse<Room[]>> {
    const searchParams = new URLSearchParams()

    if (params.priceMin) searchParams.append('min_price', params.priceMin.toString())
    if (params.priceMax) searchParams.append('max_price', params.priceMax.toString())
    if (params.city) searchParams.append('city', params.city)
    if (params.bedrooms) searchParams.append('bedrooms', params.bedrooms.toString())
    if (params.petFriendly !== undefined) searchParams.append('pet_friendly', params.petFriendly.toString())
    if (params.furnished !== undefined) searchParams.append('furnished', params.furnished.toString())
    if (params.amenities && params.amenities.length > 0) {
      params.amenities.forEach(amenity => searchParams.append('amenities', amenity))
    }

    const endpoint = `/rooms/?${searchParams.toString()}`

    return apiClient.get<Room[]>(endpoint, {
      cache: true,
      cacheTtl: 60000,
    })
  },
}
