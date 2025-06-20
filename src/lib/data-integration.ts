/**
 * Data Integration Hub for HomeWiz
 * 
 * This module provides a unified interface for all data operations,
 * combining collection, validation, transformation, and export capabilities.
 */

import { OnboardingFormData, UploadedFile } from '@/types'
import { 
  dataCollectionManager, 
  collectFormSubmission, 
  collectUserAction,
  BackendFormData 
} from './data-collection'
import { 
  dataExportManager, 
  exportToBackend, 
  registerCustomBackend,
  ExportConfig 
} from './data-export'
import { apiClient, submitFormData, uploadFile } from './api-client'
import { authConfigManager } from './auth-config'

// Integration Status Types
export enum IntegrationStatus {
  IDLE = 'idle',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  ERROR = 'error',
  PARTIAL_SUCCESS = 'partial_success'
}

// Integration Result
export interface IntegrationResult {
  status: IntegrationStatus
  applicationId?: string
  backendResponse?: any
  exportResults?: any[]
  errors?: string[]
  warnings?: string[]
  metadata?: {
    processingTime: number
    dataSize: number
    fieldsProcessed: number
    filesUploaded: number
  }
}

/**
 * Data Integration Manager
 * Orchestrates all data operations from collection to backend submission
 */
export class DataIntegrationManager {
  private static instance: DataIntegrationManager

  private constructor() {}

  static getInstance(): DataIntegrationManager {
    if (!DataIntegrationManager.instance) {
      DataIntegrationManager.instance = new DataIntegrationManager()
    }
    return DataIntegrationManager.instance
  }

  /**
   * Complete form submission workflow
   * Collects, validates, transforms, and submits data to backend
   */
  async submitFormComplete(
    formData: OnboardingFormData,
    files: UploadedFile[] = [],
    userId?: string,
    exportConfigs: string[] = ['rest']
  ): Promise<IntegrationResult> {
    const startTime = Date.now()
    const errors: string[] = []
    const warnings: string[] = []
    const exportResults: any[] = []

    try {
      // Step 1: Collect and transform form data
      collectUserAction('form_submission_started', {
        userId,
        formType: 'onboarding',
        fieldsCount: Object.keys(formData).length,
        filesCount: files.length,
      })

      const transformedData = collectFormSubmission(formData, userId)

      // Step 2: Upload files if any
      const uploadedFiles: UploadedFile[] = []
      for (const file of files) {
        try {
          if (file.file) {
            const uploadResult = await uploadFile(file.file, file.category)
            if (uploadResult.success) {
              uploadedFiles.push({
                ...file,
                id: uploadResult.data.id,
                url: uploadResult.data.url,
                uploadedAt: new Date().toISOString(),
              })
            } else {
              warnings.push(`Failed to upload file: ${file.name}`)
            }
          }
        } catch (error) {
          warnings.push(`File upload error for ${file.name}: ${error}`)
        }
      }

      // Update transformed data with uploaded files
      transformedData.documents = uploadedFiles.map(file => ({
        id: file.id || `doc_${Date.now()}`,
        name: file.name,
        category: file.category,
        size: file.size || 0,
        type: file.type || 'unknown',
        uploadedAt: file.uploadedAt || new Date().toISOString(),
        url: file.url,
      }))

      // Step 3: Submit to primary backend
      let backendResponse: any = null
      try {
        const submitResult = await submitFormData(transformedData)
        if (submitResult.success) {
          backendResponse = submitResult.data
          collectUserAction('backend_submission_success', {
            userId,
            applicationId: transformedData.applicationId,
            responseId: submitResult.data?.id,
          })
        } else {
          errors.push(`Backend submission failed: ${submitResult.error}`)
        }
      } catch (error) {
        errors.push(`Backend submission error: ${error}`)
      }

      // Step 4: Export to additional backends
      for (const configName of exportConfigs) {
        try {
          const exportResult = await exportToBackend(transformedData, configName)
          exportResults.push({
            backend: configName,
            success: exportResult.success,
            response: exportResult.response,
            error: exportResult.error,
          })

          if (!exportResult.success) {
            warnings.push(`Export to ${configName} failed: ${exportResult.error}`)
          }
        } catch (error) {
          warnings.push(`Export to ${configName} error: ${error}`)
          exportResults.push({
            backend: configName,
            success: false,
            error: String(error),
          })
        }
      }

      // Step 5: Determine final status
      const processingTime = Date.now() - startTime
      const hasErrors = errors.length > 0
      const hasWarnings = warnings.length > 0
      const hasSuccessfulExports = exportResults.some(r => r.success)

      let status: IntegrationStatus
      if (hasErrors && !backendResponse) {
        status = IntegrationStatus.ERROR
      } else if (hasWarnings || !hasSuccessfulExports) {
        status = IntegrationStatus.PARTIAL_SUCCESS
      } else {
        status = IntegrationStatus.SUCCESS
      }

      // Collect completion event
      collectUserAction('form_submission_completed', {
        userId,
        applicationId: transformedData.applicationId,
        status,
        processingTime,
        errorsCount: errors.length,
        warningsCount: warnings.length,
        exportsCount: exportResults.length,
      })

      return {
        status,
        applicationId: transformedData.applicationId,
        backendResponse,
        exportResults,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
        metadata: {
          processingTime,
          dataSize: JSON.stringify(transformedData).length,
          fieldsProcessed: Object.keys(formData).length,
          filesUploaded: uploadedFiles.length,
        },
      }
    } catch (error) {
      const processingTime = Date.now() - startTime
      
      collectUserAction('form_submission_failed', {
        userId,
        error: String(error),
        processingTime,
      })

      return {
        status: IntegrationStatus.ERROR,
        errors: [String(error)],
        metadata: {
          processingTime,
          dataSize: 0,
          fieldsProcessed: 0,
          filesUploaded: 0,
        },
      }
    }
  }

  /**
   * Export session data to multiple backends
   */
  async exportSessionData(
    exportConfigs: string[] = ['rest'],
    userId?: string
  ): Promise<IntegrationResult> {
    const startTime = Date.now()
    const errors: string[] = []
    const exportResults: any[] = []

    try {
      collectUserAction('session_export_started', {
        userId,
        exportConfigs,
      })

      const sessionData = dataCollectionManager.exportAllData()

      for (const configName of exportConfigs) {
        try {
          const exportResult = await dataExportManager.exportSessionData(configName)
          exportResults.push({
            backend: configName,
            success: exportResult.success,
            response: exportResult.response,
            error: exportResult.error,
          })

          if (!exportResult.success) {
            errors.push(`Session export to ${configName} failed: ${exportResult.error}`)
          }
        } catch (error) {
          errors.push(`Session export to ${configName} error: ${error}`)
          exportResults.push({
            backend: configName,
            success: false,
            error: String(error),
          })
        }
      }

      const processingTime = Date.now() - startTime
      const hasErrors = errors.length > 0
      const hasSuccessfulExports = exportResults.some(r => r.success)

      const status = hasErrors && !hasSuccessfulExports 
        ? IntegrationStatus.ERROR 
        : hasErrors 
          ? IntegrationStatus.PARTIAL_SUCCESS 
          : IntegrationStatus.SUCCESS

      collectUserAction('session_export_completed', {
        userId,
        status,
        processingTime,
        errorsCount: errors.length,
        exportsCount: exportResults.length,
      })

      return {
        status,
        exportResults,
        errors: errors.length > 0 ? errors : undefined,
        metadata: {
          processingTime,
          dataSize: JSON.stringify(sessionData).length,
          fieldsProcessed: sessionData.events.length,
          filesUploaded: 0,
        },
      }
    } catch (error) {
      const processingTime = Date.now() - startTime
      
      return {
        status: IntegrationStatus.ERROR,
        errors: [String(error)],
        metadata: {
          processingTime,
          dataSize: 0,
          fieldsProcessed: 0,
          filesUploaded: 0,
        },
      }
    }
  }

  /**
   * Configure custom backend integration
   */
  configureBackend(name: string, config: ExportConfig): void {
    registerCustomBackend(name, config)
    
    collectUserAction('backend_configured', {
      backendName: name,
      endpoint: config.endpoint,
      method: config.method,
    })
  }

  /**
   * Test backend configuration
   */
  async testBackend(configName: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await dataExportManager.testExportConfig(configName)
      
      collectUserAction('backend_test', {
        backendName: configName,
        success: result.success,
        error: result.error,
      })

      return result
    } catch (error) {
      return {
        success: false,
        error: String(error),
      }
    }
  }

  /**
   * Get integration statistics
   */
  getStats(): {
    dataCollection: any
    apiClient: any
    authConfig: any
  } {
    return {
      dataCollection: dataCollectionManager.getStats(),
      apiClient: apiClient.getCacheStats(),
      authConfig: {
        mode: authConfigManager.getConfig().mode,
        isDemoMode: authConfigManager.isDemoMode(),
        isClerkConfigured: authConfigManager.isClerkConfigured(),
      },
    }
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    dataCollectionManager.clearData()
    apiClient.clearCache()
    
    collectUserAction('cache_cleared', {
      timestamp: new Date().toISOString(),
    })
  }

  /**
   * Export all data for debugging
   */
  exportDebugData(): {
    sessionData: any
    cacheStats: any
    authConfig: any
    timestamp: string
  } {
    return {
      sessionData: dataCollectionManager.exportAllData(),
      cacheStats: apiClient.getCacheStats(),
      authConfig: authConfigManager.exportConfig(),
      timestamp: new Date().toISOString(),
    }
  }
}

// Export singleton instance
export const dataIntegrationManager = DataIntegrationManager.getInstance()

// Utility functions for easy integration
export const submitForm = async (
  formData: OnboardingFormData,
  files: UploadedFile[] = [],
  userId?: string,
  backends: string[] = ['rest']
): Promise<IntegrationResult> => {
  return dataIntegrationManager.submitFormComplete(formData, files, userId, backends)
}

export const exportSession = async (
  backends: string[] = ['rest'],
  userId?: string
): Promise<IntegrationResult> => {
  return dataIntegrationManager.exportSessionData(backends, userId)
}

export const configureBackend = (name: string, config: ExportConfig): void => {
  dataIntegrationManager.configureBackend(name, config)
}

export const testBackend = async (configName: string): Promise<{ success: boolean; error?: string }> => {
  return dataIntegrationManager.testBackend(configName)
}

// Export types
export { IntegrationStatus }
export type { IntegrationResult }
