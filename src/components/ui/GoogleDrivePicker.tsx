'use client'

import React, { useState } from 'react'
import { Cloud, Loader2, AlertCircle, ExternalLink } from 'lucide-react'
import { useGoogleDrive } from '@/hooks/useGoogleDrive'
import { Button } from './button'

interface GoogleDrivePickerProps {
  onFilesDownloaded: (files: File[]) => void
  fileTypes?: 'images' | 'videos' | 'all'
  maxFiles?: number
  variant?: 'default' | 'compact' | 'icon-only'
  disabled?: boolean
  className?: string
}

const MIME_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  videos: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
  all: undefined,
}

export default function GoogleDrivePicker({
  onFilesDownloaded,
  fileTypes = 'all',
  maxFiles = 10,
  variant = 'default',
  disabled = false,
  className = '',
}: GoogleDrivePickerProps) {
  const [showSetupInfo, setShowSetupInfo] = useState(false)

  const {
    isConfigured,
    isLoading,
    isDownloading,
    error,
    openPickerAndDownload,
    clearError,
  } = useGoogleDrive({
    mimeTypes: MIME_TYPES[fileTypes],
    maxFiles,
  })

  const handleClick = async () => {
    if (!isConfigured) {
      setShowSetupInfo(true)
      return
    }

    clearError()
    const files = await openPickerAndDownload()
    if (files.length > 0) {
      onFilesDownloaded(files)
    }
  }

  const isProcessing = isLoading || isDownloading

  // Setup info modal
  if (showSetupInfo) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Cloud className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Setup Google Drive</h3>
              <p className="text-sm text-gray-500">One-time configuration required</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
            <p className="font-medium text-gray-900">Quick Setup Steps:</p>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">Google Cloud Console <ExternalLink className="w-3 h-3" /></a></li>
              <li>Create a project & enable "Google Drive API" and "Google Picker API"</li>
              <li>Create OAuth 2.0 credentials (Web application)</li>
              <li>Create an API key</li>
              <li>Add to your <code className="bg-gray-200 px-1 rounded">.env.local</code>:
                <pre className="mt-2 bg-gray-800 text-green-400 p-2 rounded text-xs overflow-x-auto">
{`NEXT_PUBLIC_GOOGLE_API_KEY=your_key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_id`}
                </pre>
              </li>
              <li>Restart the dev server</li>
            </ol>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setShowSetupInfo(false)}
            >
              Close
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={() => window.open('https://console.cloud.google.com/', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Console
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className={`relative ${className}`}>
        <button
          type="button"
          onClick={clearError}
          className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm hover:bg-red-100 transition-colors"
        >
          <AlertCircle className="w-4 h-4" />
          <span className="truncate max-w-[150px]">{error}</span>
        </button>
      </div>
    )
  }

  // Icon-only variant
  if (variant === 'icon-only') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isProcessing}
        className={`
          flex items-center justify-center w-12 h-full min-h-[80px]
          border-2 border-dashed rounded-lg transition-all
          ${!isConfigured
            ? 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300 hover:bg-gray-100'
            : 'border-blue-200 bg-blue-50 text-blue-600 hover:border-blue-400 hover:bg-blue-100'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        title={isConfigured ? 'Import from Google Drive' : 'Setup Google Drive'}
      >
        {isProcessing ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Cloud className="w-5 h-5" />
        )}
      </button>
    )
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isProcessing}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
          ${!isConfigured
            ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
      >
        {isProcessing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Cloud className="w-4 h-4" />
        )}
        <span>{isConfigured ? 'Google Drive' : 'Setup Drive'}</span>
      </button>
    )
  }

  // Default variant
  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isProcessing}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all
        ${!isConfigured
          ? 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100'
          : 'border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-400 hover:bg-blue-100'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {isProcessing ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Cloud className="w-5 h-5" />
      )}
      <div className="text-left">
        <p className="font-medium">
          {isConfigured ? 'Import from Google Drive' : 'Setup Google Drive'}
        </p>
        <p className="text-xs opacity-75">
          {isDownloading
            ? 'Downloading files...'
            : isLoading
            ? 'Opening picker...'
            : isConfigured
            ? 'Select files from your Drive'
            : 'Click to see setup instructions'}
        </p>
      </div>
    </button>
  )
}
