/**
 * Connection Checker Utility
 * Provides backend connectivity status and graceful error handling
 */

import config from '@/lib/config'

export interface ConnectionStatus {
  isConnected: boolean
  lastChecked: Date
  error?: string
  backendVersion?: string
}

class ConnectionChecker {
  private status: ConnectionStatus = {
    isConnected: false,
    lastChecked: new Date()
  }

  private checkInProgress = false
  private listeners: ((status: ConnectionStatus) => void)[] = []

  /**
   * Check if backend is reachable
   */
  async checkConnection(): Promise<ConnectionStatus> {
    if (this.checkInProgress) {
      return this.status
    }

    this.checkInProgress = true

    try {
      console.log('🔍 Checking backend connection...')
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout

      const response = await fetch(`${config.api.baseUrl}/`, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        const data = await response.json()
        
        this.status = {
          isConnected: true,
          lastChecked: new Date(),
          backendVersion: data.message || 'Unknown'
        }
        
        console.log('✅ Backend connection successful')
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      console.log('❌ Backend connection failed:', error)
      
      let errorMessage = 'Unknown connection error'
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Connection timeout - backend not responding'
        } else if (error.message === 'Failed to fetch') {
          errorMessage = 'Backend server not running'
        } else {
          errorMessage = error.message
        }
      }

      this.status = {
        isConnected: false,
        lastChecked: new Date(),
        error: errorMessage
      }
    } finally {
      this.checkInProgress = false
      this.notifyListeners()
    }

    return this.status
  }

  /**
   * Get current connection status
   */
  getStatus(): ConnectionStatus {
    return { ...this.status }
  }

  /**
   * Subscribe to connection status changes
   */
  onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    this.listeners.push(callback)
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback)
    }
  }

  /**
   * Check if we should attempt API calls
   */
  shouldAttemptApiCall(): boolean {
    const timeSinceCheck = Date.now() - this.status.lastChecked.getTime()
    
    // If we haven't checked recently, allow the attempt (it will trigger a new check)
    if (timeSinceCheck > 30000) { // 30 seconds
      return true
    }
    
    return this.status.isConnected
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.status)
      } catch (error) {
        console.error('Error notifying connection status listener:', error)
      }
    })
  }
}

// Singleton instance
export const connectionChecker = new ConnectionChecker()

/**
 * React hook for connection status (import React separately)
 */
export function useConnectionStatus() {
  // Note: Import React in the component that uses this hook
  // const [status, setStatus] = useState(connectionChecker.getStatus())
  // useEffect(() => { ... }, [])
  
  // For now, return a simple function to get current status
  return connectionChecker.getStatus()
}

// Fallback for non-React usage
export const checkBackendConnection = () => connectionChecker.checkConnection()
export const getConnectionStatus = () => connectionChecker.getStatus()
export const shouldAttemptApiCall = () => connectionChecker.shouldAttemptApiCall()