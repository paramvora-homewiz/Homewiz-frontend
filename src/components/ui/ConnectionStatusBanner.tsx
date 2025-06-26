'use client'

import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, RefreshCw, Terminal } from 'lucide-react'
import { checkBackendConnection, getConnectionStatus, type ConnectionStatus } from '@/utils/connectionChecker'
import { showInfoMessage } from '@/lib/error-handler'
import config from '@/lib/config'

export function ConnectionStatusBanner() {
  const [status, setStatus] = useState<ConnectionStatus>(getConnectionStatus())
  const [isChecking, setIsChecking] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  // Check connection on mount and periodically
  useEffect(() => {
    const checkConnection = async () => {
      const newStatus = await checkBackendConnection()
      setStatus(newStatus)
    }

    checkConnection()

    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000)
    return () => clearInterval(interval)
  }, [])

  const handleManualCheck = async () => {
    setIsChecking(true)
    const newStatus = await checkBackendConnection()
    setStatus(newStatus)
    setIsChecking(false)
  }

  const handleStartBackend = () => {
    const instructions = `
To start the backend server:

1. Open a new terminal
2. Navigate to: /Users/kaushatrivedi/Downloads/homewiz-backend-shardul-backend  
3. Run: python -m uvicorn app.main:app --reload --port 8000

If you get a GEMINI_API_KEY error:
1. Create a .env file in the backend directory
2. Add: GEMINI_API_KEY=your_gemini_api_key_here
3. Get your API key from: https://makersuite.google.com/app/apikey
    `
    
    showInfoMessage(
      'Backend Setup Instructions',
      instructions.trim(),
      { duration: 15000 }
    )
  }

  // Don't show banner if backend is connected or if backend is disabled
  if (status.isConnected || config.api.disabled) {
    return null
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Backend Not Connected
          </h3>
          
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              The backend server is not running. The app is running in demo mode with limited functionality.
            </p>
            
            {showDetails && (
              <div className="mt-2 p-2 bg-yellow-100 rounded text-xs font-mono">
                <strong>Error:</strong> {status.error || 'Unknown error'}<br/>
                <strong>Last checked:</strong> {status.lastChecked.toLocaleTimeString()}<br/>
                <strong>Backend URL:</strong> http://localhost:8000
              </div>
            )}
          </div>
          
          <div className="mt-3 flex space-x-2">
            <button
              onClick={handleManualCheck}
              disabled={isChecking}
              className="inline-flex items-center px-3 py-1 border border-yellow-300 rounded-md text-xs font-medium text-yellow-800 bg-yellow-100 hover:bg-yellow-200 disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
              {isChecking ? 'Checking...' : 'Retry Connection'}
            </button>
            
            <button
              onClick={handleStartBackend}
              className="inline-flex items-center px-3 py-1 border border-blue-300 rounded-md text-xs font-medium text-blue-800 bg-blue-100 hover:bg-blue-200"
            >
              <Terminal className="h-3 w-3 mr-1" />
              Start Backend
            </button>
            
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="inline-flex items-center px-3 py-1 text-xs font-medium text-yellow-600 hover:text-yellow-800"
            >
              {showDetails ? 'Hide' : 'Show'} Details
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}