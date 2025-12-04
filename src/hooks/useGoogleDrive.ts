'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  loadGoogleApi,
  loadGoogleIdentityServices,
  initGooglePicker,
  getAccessToken,
  showGooglePicker,
  downloadDriveFile,
  getGoogleConfig,
  GoogleDriveFile,
} from '@/lib/google-drive'

interface UseGoogleDriveOptions {
  mimeTypes?: string[]
  multiSelect?: boolean
  maxFiles?: number
  autoDownload?: boolean
}

interface UseGoogleDriveReturn {
  isConfigured: boolean
  isLoading: boolean
  isDownloading: boolean
  error: string | null
  selectedFiles: GoogleDriveFile[]
  openPicker: () => Promise<GoogleDriveFile[]>
  openPickerAndDownload: () => Promise<File[]>
  clearSelection: () => void
  clearError: () => void
}

export function useGoogleDrive(options: UseGoogleDriveOptions = {}): UseGoogleDriveReturn {
  const { mimeTypes, multiSelect = true, maxFiles = 10 } = options

  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<GoogleDriveFile[]>([])
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const config = getGoogleConfig()

  // Initialize Google APIs
  useEffect(() => {
    if (!config.isConfigured || isInitialized) return

    const init = async () => {
      try {
        await Promise.all([
          loadGoogleApi(),
          loadGoogleIdentityServices(),
        ])
        await initGooglePicker()
        setIsInitialized(true)
      } catch (err) {
        console.error('Failed to initialize Google APIs:', err)
      }
    }

    init()
  }, [config.isConfigured, isInitialized])

  const openPicker = useCallback(async (): Promise<GoogleDriveFile[]> => {
    if (!config.isConfigured) {
      setError('Google Drive is not configured')
      return []
    }

    setIsLoading(true)
    setError(null)

    try {
      // Get access token if we don't have one
      let token = accessToken
      if (!token) {
        token = await getAccessToken(config.clientId)
        setAccessToken(token)
      }

      // Show picker
      const files = await showGooglePicker({
        accessToken: token,
        apiKey: config.apiKey,
        mimeTypes,
        multiSelect,
        maxFiles,
      })

      setSelectedFiles(files)
      return files
    } catch (err: any) {
      const message = err.message || 'Failed to open Google Drive picker'
      setError(message)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [config, accessToken, mimeTypes, multiSelect, maxFiles])

  const openPickerAndDownload = useCallback(async (): Promise<File[]> => {
    const files = await openPicker()
    if (files.length === 0) return []

    setIsDownloading(true)
    setError(null)

    try {
      const downloadedFiles = await Promise.all(
        files.map((file) =>
          downloadDriveFile(file.id, accessToken!, file.name, file.mimeType)
        )
      )
      return downloadedFiles
    } catch (err: any) {
      const message = err.message || 'Failed to download files from Google Drive'
      setError(message)
      return []
    } finally {
      setIsDownloading(false)
    }
  }, [openPicker, accessToken])

  const clearSelection = useCallback(() => {
    setSelectedFiles([])
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isConfigured: config.isConfigured,
    isLoading,
    isDownloading,
    error,
    selectedFiles,
    openPicker,
    openPickerAndDownload,
    clearSelection,
    clearError,
  }
}
