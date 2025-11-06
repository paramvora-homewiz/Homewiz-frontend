/**
 * Storage/File Upload API Service
 *
 * Replaces Supabase Storage with backend file upload endpoints
 * Consolidates all file upload operations
 */

import { apiClient, ApiResponse } from '../api-client'
import { FileUploadResponse, ImageCategory } from './types'

export const storageApi = {
  /**
   * Upload building images
   * Backend: POST /buildings/{building_id}/images/upload
   */
  async uploadBuildingImages(
    buildingId: string,
    files: File[],
    category?: ImageCategory
  ): Promise<ApiResponse<FileUploadResponse[]>> {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    if (category) formData.append('category', category)

    return apiClient.request({
      method: 'POST',
      endpoint: `/buildings/${buildingId}/images/upload`,
      data: formData,
      headers: {}, // Let browser set Content-Type with boundary
      validateResponse: true,
      retries: 1,
      timeout: 60000, // 60 seconds for image uploads
    })
  },

  /**
   * Upload single building image
   * Backend: POST /buildings/{building_id}/images/single
   */
  async uploadBuildingImage(
    buildingId: string,
    file: File,
    category?: ImageCategory
  ): Promise<ApiResponse<FileUploadResponse>> {
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
      timeout: 60000,
    })
  },

  /**
   * Upload building video
   * Backend: POST /buildings/{building_id}/videos/upload
   */
  async uploadBuildingVideo(
    buildingId: string,
    file: File
  ): Promise<ApiResponse<FileUploadResponse>> {
    const formData = new FormData()
    formData.append('file', file)

    return apiClient.request({
      method: 'POST',
      endpoint: `/buildings/${buildingId}/videos/upload`,
      data: formData,
      headers: {},
      validateResponse: true,
      retries: 0, // Don't retry large video uploads
      timeout: 180000, // 3 minutes for videos
    })
  },

  /**
   * Upload room images
   * Backend: POST /rooms/{room_id}/images/upload
   */
  async uploadRoomImages(
    roomId: string,
    files: File[]
  ): Promise<ApiResponse<FileUploadResponse[]>> {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))

    return apiClient.request({
      method: 'POST',
      endpoint: `/rooms/${roomId}/images/upload`,
      data: formData,
      headers: {},
      validateResponse: true,
      retries: 1,
      timeout: 60000,
    })
  },

  /**
   * Upload tenant document
   * Backend: POST /tenants/{tenant_id}/documents (if available)
   * Or generic document upload endpoint
   */
  async uploadTenantDocument(
    tenantId: string,
    file: File,
    documentType?: string
  ): Promise<ApiResponse<FileUploadResponse>> {
    const formData = new FormData()
    formData.append('file', file)
    if (documentType) formData.append('document_type', documentType)

    return apiClient.request({
      method: 'POST',
      endpoint: `/documents/`, // Or `/tenants/${tenantId}/documents`
      data: formData,
      headers: {},
      validateResponse: true,
      retries: 1,
      timeout: 60000,
    })
  },

  /**
   * Delete file
   * Generic file deletion endpoint
   */
  async deleteFile(fileId: string, fileType: 'image' | 'video' | 'document'): Promise<ApiResponse<void>> {
    return apiClient.delete(`/files/${fileType}/${fileId}`)
  },

  /**
   * Delete building image
   * Backend: DELETE /buildings/{building_id}/images/{image_id}
   */
  async deleteBuildingImage(buildingId: string, imageId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/buildings/${buildingId}/images/${imageId}`)
  },

  /**
   * Delete room image
   * Backend: DELETE /rooms/{room_id}/images/{image_id}
   */
  async deleteRoomImage(roomId: string, imageId: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/rooms/${roomId}/images/${imageId}`)
  },

  /**
   * Get file URL
   * Backend might return URLs directly, or need signed URL generation
   */
  async getFileUrl(filePath: string, expiresIn?: number): Promise<ApiResponse<{ url: string }>> {
    // If backend provides signed URL endpoint
    return apiClient.get(`/files/url?path=${encodeURIComponent(filePath)}&expires_in=${expiresIn || 3600}`)
  },

  /**
   * Validate file before upload
   * Client-side validation helper
   */
  validateFile(file: File, options?: {
    maxSize?: number
    allowedTypes?: string[]
  }): { valid: boolean; error?: string } {
    const maxSize = options?.maxSize || 10 * 1024 * 1024 // 10MB default
    const allowedTypes = options?.allowedTypes || [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/webm',
      'application/pdf', 'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`
      }
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`
      }
    }

    return { valid: true }
  },

  /**
   * Validate multiple files
   */
  validateFiles(files: File[], options?: {
    maxSize?: number
    allowedTypes?: string[]
    maxFiles?: number
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (options?.maxFiles && files.length > options.maxFiles) {
      errors.push(`Maximum ${options.maxFiles} files allowed`)
    }

    files.forEach((file, index) => {
      const validation = this.validateFile(file, options)
      if (!validation.valid) {
        errors.push(`File ${index + 1} (${file.name}): ${validation.error}`)
      }
    })

    return {
      valid: errors.length === 0,
      errors
    }
  },

  /**
   * Upload with progress tracking
   * Uses XMLHttpRequest for progress events
   */
  async uploadWithProgress(
    endpoint: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<FileUploadResponse> {
    return new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append('file', file)

      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100
          onProgress(progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            resolve(response.data || response)
          } catch (error) {
            reject(new Error('Invalid response format'))
          }
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'))
      })

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'))
      })

      // Get full URL
      const baseUrl = apiClient['baseUrl'] || process.env.NEXT_PUBLIC_API_URL || ''
      xhr.open('POST', `${baseUrl}${endpoint}`)

      // Add headers if needed (auth token, etc.)
      const headers = apiClient['defaultHeaders'] || {}
      Object.entries(headers).forEach(([key, value]) => {
        if (key !== 'Content-Type') { // Don't set Content-Type for FormData
          xhr.setRequestHeader(key, value as string)
        }
      })

      xhr.send(formData)
    })
  },
}
