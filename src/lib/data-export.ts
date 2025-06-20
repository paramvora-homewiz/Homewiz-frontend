/**
 * Data Export Utilities for HomeWiz
 * 
 * This module provides utilities to export collected JSON data
 * to any backend system with flexible configuration options.
 */

import { dataCollectionManager, BackendFormData, DataEvent } from './data-collection'
import { collectApiCall, collectError } from './data-collection'
import config from './config'

// Export Configuration Types
export interface ExportConfig {
  endpoint: string
  method: 'POST' | 'PUT' | 'PATCH'
  headers?: Record<string, string>
  authentication?: {
    type: 'bearer' | 'api-key' | 'basic'
    token?: string
    apiKey?: string
    username?: string
    password?: string
  }
  retryConfig?: {
    maxRetries: number
    retryDelay: number
    backoffMultiplier: number
  }
  transformData?: (data: any) => any
}

// Default export configurations for common backends
export const DEFAULT_EXPORT_CONFIGS: Record<string, ExportConfig> = {
  // Generic REST API
  rest: {
    endpoint: '/api/applications',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    retryConfig: {
      maxRetries: 3,
      retryDelay: 1000,
      backoffMultiplier: 2,
    },
  },
  
  // Webhook format
  webhook: {
    endpoint: '/webhook/form-submission',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Webhook-Source': 'homewiz-frontend',
    },
    retryConfig: {
      maxRetries: 5,
      retryDelay: 2000,
      backoffMultiplier: 1.5,
    },
  },
  
  // Airtable format
  airtable: {
    endpoint: 'https://api.airtable.com/v0/{baseId}/{tableId}',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    authentication: {
      type: 'bearer',
    },
    transformData: (data: BackendFormData) => ({
      fields: {
        'Application ID': data.applicationId,
        'Email': data.user.email,
        'Full Name': `${data.user.firstName} ${data.user.lastName}`,
        'Phone': data.user.phone,
        'Occupation': data.professional.occupation,
        'Budget Min': data.housing.budgetMin,
        'Budget Max': data.housing.budgetMax,
        'Move In Date': data.housing.preferredMoveInDate,
        'Submission Date': data.submissionTimestamp,
        'Building ID': data.property.buildingId,
        'Room ID': data.property.roomId,
      }
    }),
  },
  
  // Google Sheets format (via Apps Script)
  googleSheets: {
    endpoint: 'https://script.google.com/macros/s/{scriptId}/exec',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    transformData: (data: BackendFormData) => ({
      action: 'addRow',
      data: [
        data.applicationId,
        data.submissionTimestamp,
        data.user.email,
        `${data.user.firstName} ${data.user.lastName}`,
        data.user.phone,
        data.professional.occupation,
        data.housing.budgetMin,
        data.housing.budgetMax,
        data.housing.preferredMoveInDate,
        data.property.buildingId,
        data.property.roomId,
        JSON.stringify(data.amenities),
        JSON.stringify(data.lifestyle),
      ]
    }),
  },
  
  // Zapier webhook format
  zapier: {
    endpoint: 'https://hooks.zapier.com/hooks/catch/{hookId}/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    transformData: (data: BackendFormData) => ({
      application_id: data.applicationId,
      submission_timestamp: data.submissionTimestamp,
      user_email: data.user.email,
      user_name: `${data.user.firstName} ${data.user.lastName}`,
      user_phone: data.user.phone,
      occupation: data.professional.occupation,
      budget_min: data.housing.budgetMin,
      budget_max: data.housing.budgetMax,
      move_in_date: data.housing.preferredMoveInDate,
      building_id: data.property.buildingId,
      room_id: data.property.roomId,
      amenities: data.amenities,
      lifestyle: data.lifestyle,
      emergency_contact: data.emergencyContact,
      documents_count: data.documents.length,
      references_count: data.references.length,
    }),
  },
}

/**
 * Data Export Manager
 * Handles exporting data to various backend systems
 */
export class DataExportManager {
  private static instance: DataExportManager
  private exportConfigs: Map<string, ExportConfig> = new Map()

  private constructor() {
    // Load default configurations
    Object.entries(DEFAULT_EXPORT_CONFIGS).forEach(([name, config]) => {
      this.exportConfigs.set(name, config)
    })
  }

  static getInstance(): DataExportManager {
    if (!DataExportManager.instance) {
      DataExportManager.instance = new DataExportManager()
    }
    return DataExportManager.instance
  }

  /**
   * Register a custom export configuration
   */
  registerExportConfig(name: string, config: ExportConfig): void {
    this.exportConfigs.set(name, config)
  }

  /**
   * Get export configuration by name
   */
  getExportConfig(name: string): ExportConfig | undefined {
    return this.exportConfigs.get(name)
  }

  /**
   * Export form data to a specific backend
   */
  async exportFormData(
    data: BackendFormData,
    configName: string,
    customConfig?: Partial<ExportConfig>
  ): Promise<{ success: boolean; response?: any; error?: string }> {
    const baseConfig = this.exportConfigs.get(configName)
    if (!baseConfig) {
      throw new Error(`Export configuration '${configName}' not found`)
    }

    const config = { ...baseConfig, ...customConfig }
    const startTime = Date.now()

    try {
      // Transform data if transformer is provided
      const exportData = config.transformData ? config.transformData(data) : data

      // Build request headers
      const headers = { ...config.headers }
      
      // Add authentication headers
      if (config.authentication) {
        switch (config.authentication.type) {
          case 'bearer':
            if (config.authentication.token) {
              headers['Authorization'] = `Bearer ${config.authentication.token}`
            }
            break
          case 'api-key':
            if (config.authentication.apiKey) {
              headers['X-API-Key'] = config.authentication.apiKey
            }
            break
          case 'basic':
            if (config.authentication.username && config.authentication.password) {
              const credentials = btoa(`${config.authentication.username}:${config.authentication.password}`)
              headers['Authorization'] = `Basic ${credentials}`
            }
            break
        }
      }

      // Make the request with retry logic
      const response = await this.makeRequestWithRetry(
        config.endpoint,
        {
          method: config.method,
          headers,
          body: JSON.stringify(exportData),
        },
        config.retryConfig
      )

      const duration = Date.now() - startTime
      collectApiCall(config.endpoint, config.method, response.status, duration)

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status} ${response.statusText}`)
      }

      const responseData = await response.json().catch(() => ({}))

      return {
        success: true,
        response: responseData,
      }
    } catch (error) {
      const duration = Date.now() - startTime
      collectApiCall(config.endpoint, config.method, 0, duration)
      collectError(error as Error, `data_export_${configName}`)

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown export error',
      }
    }
  }

  /**
   * Export all collected session data
   */
  async exportSessionData(
    configName: string,
    customConfig?: Partial<ExportConfig>
  ): Promise<{ success: boolean; response?: any; error?: string }> {
    const sessionData = dataCollectionManager.exportAllData()
    
    const baseConfig = this.exportConfigs.get(configName)
    if (!baseConfig) {
      throw new Error(`Export configuration '${configName}' not found`)
    }

    const config = { ...baseConfig, ...customConfig }
    
    // Use session data endpoint if available, otherwise use default
    const endpoint = config.endpoint.replace('/applications', '/sessions')

    return this.exportFormData(sessionData as any, configName, {
      ...customConfig,
      endpoint,
    })
  }

  /**
   * Bulk export multiple form submissions
   */
  async bulkExportFormData(
    dataArray: BackendFormData[],
    configName: string,
    customConfig?: Partial<ExportConfig>
  ): Promise<{ success: boolean; results: any[]; errors: string[] }> {
    const results: any[] = []
    const errors: string[] = []

    for (const data of dataArray) {
      try {
        const result = await this.exportFormData(data, configName, customConfig)
        if (result.success) {
          results.push(result.response)
        } else {
          errors.push(result.error || 'Unknown error')
        }
      } catch (error) {
        errors.push(error instanceof Error ? error.message : 'Unknown error')
      }
    }

    return {
      success: errors.length === 0,
      results,
      errors,
    }
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequestWithRetry(
    url: string,
    options: RequestInit,
    retryConfig?: ExportConfig['retryConfig']
  ): Promise<Response> {
    const maxRetries = retryConfig?.maxRetries || 3
    const retryDelay = retryConfig?.retryDelay || 1000
    const backoffMultiplier = retryConfig?.backoffMultiplier || 2

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, options)
        
        // If successful or client error (4xx), don't retry
        if (response.ok || (response.status >= 400 && response.status < 500)) {
          return response
        }
        
        // Server error (5xx), retry if attempts remaining
        if (attempt < maxRetries) {
          const delay = retryDelay * Math.pow(backoffMultiplier, attempt)
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
        
        return response
      } catch (error) {
        lastError = error as Error
        
        if (attempt < maxRetries) {
          const delay = retryDelay * Math.pow(backoffMultiplier, attempt)
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
      }
    }

    throw lastError || new Error('Request failed after all retries')
  }

  /**
   * Test export configuration
   */
  async testExportConfig(
    configName: string,
    testData?: Partial<BackendFormData>
  ): Promise<{ success: boolean; error?: string }> {
    const config = this.exportConfigs.get(configName)
    if (!config) {
      return { success: false, error: `Configuration '${configName}' not found` }
    }

    // Create minimal test data
    const defaultTestData: BackendFormData = {
      applicationId: 'test_app_123',
      submissionTimestamp: new Date().toISOString(),
      formVersion: '1.0.0',
      source: 'test',
      user: {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        phone: '+1234567890',
      },
      professional: {
        occupation: 'Test Occupation',
      },
      housing: {
        budgetMin: 1000,
        budgetMax: 2000,
        preferredMoveInDate: new Date().toISOString(),
        preferredLeaseTerm: 12,
        bookingType: 'LEASE',
      },
      property: {},
      amenities: {
        wifi: true,
        laundry: false,
        parking: false,
        security: true,
        gym: false,
        commonArea: true,
        rooftop: false,
        bikeStorage: false,
      },
      lifestyle: {
        hasVehicles: false,
        hasRentersInsurance: false,
        pets: false,
        smoking: false,
      },
      emergencyContact: {},
      documents: [],
      references: [],
      ...testData,
    }

    try {
      const result = await this.exportFormData(defaultTestData, configName)
      return { success: result.success, error: result.error }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Test failed',
      }
    }
  }
}

// Export singleton instance
export const dataExportManager = DataExportManager.getInstance()

// Utility functions for easy data export
export const exportToBackend = async (
  data: BackendFormData,
  backend: string = 'rest',
  customConfig?: Partial<ExportConfig>
) => {
  return dataExportManager.exportFormData(data, backend, customConfig)
}

export const exportSessionToBackend = async (
  backend: string = 'rest',
  customConfig?: Partial<ExportConfig>
) => {
  return dataExportManager.exportSessionData(backend, customConfig)
}

export const registerCustomBackend = (name: string, config: ExportConfig) => {
  dataExportManager.registerExportConfig(name, config)
}

// Export types
// ExportConfig is already exported above
