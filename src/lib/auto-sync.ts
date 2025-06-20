/**
 * Autonomous Data Synchronization for HomeWiz Frontend
 * 
 * This module provides automated data synchronization, offline support,
 * and autonomous operation capabilities for the frontend application.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { ApiResponse, User, OnboardingFormData } from '@/types'
import { DataCache, DataConsistency } from './data-manager'
import { ApiResponseHandler } from './api-response-handler'
import ErrorHandler, { ErrorType } from './error-handler'
import config from './config'

// Sync status types
export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  SUCCESS = 'success',
  ERROR = 'error',
  OFFLINE = 'offline'
}

// Sync priority levels
export enum SyncPriority {
  LOW = 1,
  MEDIUM = 2,
  HIGH = 3,
  CRITICAL = 4
}

// Sync operation interface
export interface SyncOperation {
  id: string
  type: string
  data: any
  priority: SyncPriority
  timestamp: number
  retryCount: number
  maxRetries: number
  lastError?: string
}

// Sync result interface
export interface SyncResult {
  success: boolean
  operationsProcessed: number
  operationsSucceeded: number
  operationsFailed: number
  errors: string[]
  duration: number
}

class AutoSyncManager {
  private syncQueue: SyncOperation[] = []
  private isOnline: boolean = navigator.onLine
  private syncInterval: number = 30000 // 30 seconds
  private syncTimer: NodeJS.Timeout | null = null
  private isRunning: boolean = false
  private listeners: Set<(status: SyncStatus) => void> = new Set()

  constructor() {
    this.setupOnlineDetection()
    this.startAutoSync()
  }

  /**
   * Setup online/offline detection
   */
  private setupOnlineDetection(): void {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.notifyListeners(SyncStatus.IDLE)
      this.processSyncQueue()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      this.notifyListeners(SyncStatus.OFFLINE)
    })
  }

  /**
   * Start automatic synchronization
   */
  private startAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
    }

    this.syncTimer = setInterval(() => {
      if (this.isOnline && !this.isRunning) {
        this.processSyncQueue()
      }
    }, this.syncInterval)
  }

  /**
   * Stop automatic synchronization
   */
  public stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = null
    }
  }

  /**
   * Add operation to sync queue
   */
  public queueOperation(
    type: string,
    data: any,
    priority: SyncPriority = SyncPriority.MEDIUM,
    maxRetries: number = 3
  ): string {
    const operation: SyncOperation = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      priority,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries
    }

    // Insert based on priority
    const insertIndex = this.syncQueue.findIndex(op => op.priority < priority)
    if (insertIndex === -1) {
      this.syncQueue.push(operation)
    } else {
      this.syncQueue.splice(insertIndex, 0, operation)
    }

    // Process immediately if online and not running
    if (this.isOnline && !this.isRunning) {
      setTimeout(() => this.processSyncQueue(), 100)
    }

    return operation.id
  }

  /**
   * Process sync queue
   */
  private async processSyncQueue(): Promise<SyncResult> {
    if (this.isRunning || !this.isOnline || this.syncQueue.length === 0) {
      return {
        success: true,
        operationsProcessed: 0,
        operationsSucceeded: 0,
        operationsFailed: 0,
        errors: [],
        duration: 0
      }
    }

    this.isRunning = true
    this.notifyListeners(SyncStatus.SYNCING)

    const startTime = Date.now()
    let operationsProcessed = 0
    let operationsSucceeded = 0
    let operationsFailed = 0
    const errors: string[] = []

    try {
      // Process operations in priority order
      const operationsToProcess = [...this.syncQueue]
      this.syncQueue = []

      for (const operation of operationsToProcess) {
        operationsProcessed++

        try {
          await this.processOperation(operation)
          operationsSucceeded++
        } catch (error) {
          operationsFailed++
          operation.retryCount++
          operation.lastError = error instanceof Error ? error.message : String(error)
          errors.push(`${operation.type}: ${operation.lastError}`)

          // Retry if under max retries
          if (operation.retryCount < operation.maxRetries) {
            this.syncQueue.push(operation)
          } else {
            ErrorHandler.handleError(error, {
              type: ErrorType.DATA_PROCESSING,
              additionalInfo: { operation }
            })
          }
        }
      }

      const result: SyncResult = {
        success: operationsFailed === 0,
        operationsProcessed,
        operationsSucceeded,
        operationsFailed,
        errors,
        duration: Date.now() - startTime
      }

      this.notifyListeners(result.success ? SyncStatus.SUCCESS : SyncStatus.ERROR)
      return result

    } catch (error) {
      this.notifyListeners(SyncStatus.ERROR)
      throw error
    } finally {
      this.isRunning = false
    }
  }

  /**
   * Process individual sync operation
   */
  private async processOperation(operation: SyncOperation): Promise<void> {
    switch (operation.type) {
      case 'user_update':
        await this.syncUserUpdate(operation.data)
        break
      case 'form_save':
        await this.syncFormSave(operation.data)
        break
      case 'file_upload':
        await this.syncFileUpload(operation.data)
        break
      case 'cache_sync':
        await this.syncCacheData(operation.data)
        break
      default:
        throw new Error(`Unknown sync operation type: ${operation.type}`)
    }
  }

  /**
   * Sync user update
   */
  private async syncUserUpdate(data: any): Promise<void> {
    try {
      const response = await fetch(`${config.api.baseUrl}/api/users/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.app.demoMode && { 'X-Demo-Mode': 'true' })
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`User sync failed: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('User sync completed:', result)
    } catch (error) {
      console.error('User sync failed:', error)
      throw error
    }
  }

  /**
   * Sync form save
   */
  private async syncFormSave(data: OnboardingFormData): Promise<void> {
    try {
      // Cache form data locally first
      DataCache.set(`form_${data.email}`, data, 86400) // 24 hours

      // Sync with backend
      const response = await fetch(`${config.api.baseUrl}/api/forms/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.app.demoMode && { 'X-Demo-Mode': 'true' })
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`Form sync failed: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Form sync completed:', result)
    } catch (error) {
      console.error('Form sync failed:', error)
      throw error
    }
  }

  /**
   * Sync file upload
   */
  private async syncFileUpload(data: any): Promise<void> {
    try {
      const formData = new FormData()
      formData.append('file', data.file)
      formData.append('category', data.category)
      formData.append('metadata', JSON.stringify(data.metadata))

      const response = await fetch(`${config.api.baseUrl}/api/files/upload`, {
        method: 'POST',
        headers: {
          ...(config.app.demoMode && { 'X-Demo-Mode': 'true' })
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`File upload failed: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('File upload completed:', result)
    } catch (error) {
      console.error('File upload failed:', error)
      throw error
    }
  }

  /**
   * Sync cached data
   */
  private async syncCacheData(data: any): Promise<void> {
    try {
      // Validate cached data consistency
      const consistency = DataConsistency.checkConsistency(
        data.local,
        data.remote,
        data.fields
      )

      if (!consistency.consistent) {
        // Resolve conflicts using merge strategy
        const merged = DataConsistency.mergeData(
          data.local,
          data.remote,
          'newest'
        )

        // Update cache with merged data
        DataCache.set(data.key, merged)
        console.log('Cache data synchronized and conflicts resolved')
      }
    } catch (error) {
      console.error('Cache sync failed:', error)
      throw error
    }
  }

  /**
   * Add sync status listener
   */
  public addListener(listener: (status: SyncStatus) => void): void {
    this.listeners.add(listener)
  }

  /**
   * Remove sync status listener
   */
  public removeListener(listener: (status: SyncStatus) => void): void {
    this.listeners.delete(listener)
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(status: SyncStatus): void {
    this.listeners.forEach(listener => {
      try {
        listener(status)
      } catch (error) {
        console.error('Error in sync status listener:', error)
      }
    })
  }

  /**
   * Get current sync status
   */
  public getStatus(): {
    isOnline: boolean
    isRunning: boolean
    queueLength: number
    lastSync?: number
  } {
    return {
      isOnline: this.isOnline,
      isRunning: this.isRunning,
      queueLength: this.syncQueue.length,
    }
  }

  /**
   * Force immediate sync
   */
  public async forcSync(): Promise<SyncResult> {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline')
    }

    return await this.processSyncQueue()
  }

  /**
   * Clear sync queue
   */
  public clearQueue(): void {
    this.syncQueue = []
  }
}

// Global auto-sync manager instance
const autoSyncManager = new AutoSyncManager()

// React hook for auto-sync functionality
export function useAutoSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(SyncStatus.IDLE)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleStatusChange = (status: SyncStatus) => {
      setSyncStatus(status)
      setIsOnline(status !== SyncStatus.OFFLINE)
    }

    autoSyncManager.addListener(handleStatusChange)

    return () => {
      autoSyncManager.removeListener(handleStatusChange)
    }
  }, [])

  const queueOperation = useCallback((
    type: string,
    data: any,
    priority: SyncPriority = SyncPriority.MEDIUM
  ) => {
    return autoSyncManager.queueOperation(type, data, priority)
  }, [])

  const forceSync = useCallback(async () => {
    return await autoSyncManager.forcSync()
  }, [])

  const getStatus = useCallback(() => {
    return autoSyncManager.getStatus()
  }, [])

  return {
    syncStatus,
    isOnline,
    queueOperation,
    forceSync,
    getStatus
  }
}

// Utility functions for common sync operations
export const syncUserData = (userData: User) => {
  autoSyncManager.queueOperation('user_update', userData, SyncPriority.HIGH)
}

export const syncFormData = (formData: OnboardingFormData) => {
  autoSyncManager.queueOperation('form_save', formData, SyncPriority.MEDIUM)
}

export const syncFileUpload = (file: File, category: string, metadata: any) => {
  autoSyncManager.queueOperation('file_upload', { file, category, metadata }, SyncPriority.HIGH)
}

// Export the manager and types
export { autoSyncManager }
// SyncStatus and SyncPriority are already exported above
export default autoSyncManager
