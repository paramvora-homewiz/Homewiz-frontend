/**
 * Real-Time Polling Service
 *
 * Replaces Supabase Real-Time subscriptions with polling
 * Provides similar API but uses periodic HTTP requests instead of WebSocket
 */

type PollingCallback<T> = (data: T[]) => void
type ChangeCallback<T> = (change: {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  old: T | null
  new: T | null
}) => void

interface PollingSubscription {
  id: string
  tableName: string
  interval: number
  callback: PollingCallback<any>
  changeCallback?: ChangeCallback<any>
  lastData: any[]
  timerId: NodeJS.Timeout | null
  isActive: boolean
}

interface PollingConfig {
  tableName: string
  interval?: number // Polling interval in milliseconds (default: 5000)
  filters?: Record<string, any>
  onData?: PollingCallback<any>
  onChange?: ChangeCallback<any>
}

class RealtimePollingService {
  private subscriptions: Map<string, PollingSubscription> = new Map()
  private subscriptionCounter = 0

  /**
   * Subscribe to table changes via polling
   *
   * @param config Polling configuration
   * @returns Subscription ID for unsubscribing
   */
  subscribe<T = any>(config: PollingConfig): string {
    const {
      tableName,
      interval = 5000, // Default 5 second polling
      filters,
      onData,
      onChange
    } = config

    const subscriptionId = `${tableName}_${++this.subscriptionCounter}`

    const subscription: PollingSubscription = {
      id: subscriptionId,
      tableName,
      interval,
      callback: onData || (() => {}),
      changeCallback: onChange,
      lastData: [],
      timerId: null,
      isActive: true
    }

    // Store subscription
    this.subscriptions.set(subscriptionId, subscription)

    // Start polling
    this.startPolling(subscription, filters)

    return subscriptionId
  }

  /**
   * Unsubscribe from updates
   */
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId)

    if (subscription) {
      subscription.isActive = false
      if (subscription.timerId) {
        clearInterval(subscription.timerId)
      }
      this.subscriptions.delete(subscriptionId)
    }
  }

  /**
   * Unsubscribe all subscriptions
   */
  unsubscribeAll(): void {
    this.subscriptions.forEach(subscription => {
      if (subscription.timerId) {
        clearInterval(subscription.timerId)
      }
    })
    this.subscriptions.clear()
  }

  /**
   * Pause polling for a subscription
   */
  pause(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId)
    if (subscription && subscription.timerId) {
      clearInterval(subscription.timerId)
      subscription.timerId = null
      subscription.isActive = false
    }
  }

  /**
   * Resume polling for a subscription
   */
  resume(subscriptionId: string, filters?: Record<string, any>): void {
    const subscription = this.subscriptions.get(subscriptionId)
    if (subscription && !subscription.isActive) {
      subscription.isActive = true
      this.startPolling(subscription, filters)
    }
  }

  /**
   * Change polling interval for a subscription
   */
  setInterval(subscriptionId: string, interval: number): void {
    const subscription = this.subscriptions.get(subscriptionId)
    if (subscription) {
      const wasActive = subscription.isActive
      if (subscription.timerId) {
        clearInterval(subscription.timerId)
      }
      subscription.interval = interval
      if (wasActive) {
        this.startPolling(subscription)
      }
    }
  }

  /**
   * Get subscription stats
   */
  getStats(): {
    total: number
    active: number
    paused: number
    subscriptions: { id: string; table: string; interval: number; active: boolean }[]
  } {
    const subscriptions = Array.from(this.subscriptions.values())
    return {
      total: subscriptions.length,
      active: subscriptions.filter(s => s.isActive).length,
      paused: subscriptions.filter(s => !s.isActive).length,
      subscriptions: subscriptions.map(s => ({
        id: s.id,
        table: s.tableName,
        interval: s.interval,
        active: s.isActive
      }))
    }
  }

  /**
   * Internal: Start polling for a subscription
   */
  private async startPolling(subscription: PollingSubscription, filters?: Record<string, any>): Promise<void> {
    const poll = async () => {
      if (!subscription.isActive) {
        return
      }

      try {
        // Fetch data from backend API
        const endpoint = this.buildEndpoint(subscription.tableName, filters)
        const response = await fetch(endpoint)

        if (!response.ok) {
          console.error(`Polling error for ${subscription.tableName}:`, response.statusText)
          return
        }

        const result = await response.json()
        const newData = result.data || result || []

        // Call onData callback with full dataset
        if (subscription.callback) {
          subscription.callback(newData)
        }

        // Detect changes if onChange callback is provided
        if (subscription.changeCallback) {
          this.detectChanges(subscription, newData)
        }

        // Update last data
        subscription.lastData = newData

      } catch (error) {
        console.error(`Polling error for ${subscription.tableName}:`, error)
      }
    }

    // Initial poll
    await poll()

    // Set up interval for subsequent polls
    subscription.timerId = setInterval(poll, subscription.interval)
  }

  /**
   * Internal: Build API endpoint for table
   */
  private buildEndpoint(tableName: string, filters?: Record<string, any>): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8002'
    const params = new URLSearchParams()

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }

    const queryString = params.toString()
    return `${baseUrl}/${tableName}/${queryString ? `?${queryString}` : ''}`
  }

  /**
   * Internal: Detect changes between old and new data
   */
  private detectChanges<T>(subscription: PollingSubscription, newData: T[]): void {
    const oldData = subscription.lastData
    const oldMap = new Map(oldData.map((item: any) => [this.getItemId(item), item]))
    const newMap = new Map(newData.map((item: any) => [this.getItemId(item), item]))

    // Detect INSERTs
    newData.forEach((item: any) => {
      const id = this.getItemId(item)
      if (!oldMap.has(id)) {
        subscription.changeCallback?.({
          type: 'INSERT',
          old: null,
          new: item
        })
      }
    })

    // Detect DELETEs
    oldData.forEach((item: any) => {
      const id = this.getItemId(item)
      if (!newMap.has(id)) {
        subscription.changeCallback?.({
          type: 'DELETE',
          old: item,
          new: null
        })
      }
    })

    // Detect UPDATEs
    newData.forEach((item: any) => {
      const id = this.getItemId(item)
      const oldItem = oldMap.get(id)

      if (oldItem && JSON.stringify(oldItem) !== JSON.stringify(item)) {
        subscription.changeCallback?.({
          type: 'UPDATE',
          old: oldItem,
          new: item
        })
      }
    })
  }

  /**
   * Internal: Get unique ID from item
   * Tries common ID field names
   */
  private getItemId(item: any): string {
    return item.id ||
           item.building_id ||
           item.room_id ||
           item.tenant_id ||
           item.operator_id ||
           item.lead_id ||
           JSON.stringify(item) // Fallback to full object
  }
}

// Export singleton instance
export const realtimePolling = new RealtimePollingService()

/**
 * Convenience hooks for common tables
 */
export const pollingHelpers = {
  /**
   * Subscribe to buildings table
   */
  subscribeToBuildings(onData: PollingCallback<any>, interval?: number): string {
    return realtimePolling.subscribe({
      tableName: 'buildings',
      interval,
      onData
    })
  },

  /**
   * Subscribe to rooms table
   */
  subscribeToRooms(onData: PollingCallback<any>, interval?: number): string {
    return realtimePolling.subscribe({
      tableName: 'rooms',
      interval,
      onData
    })
  },

  /**
   * Subscribe to tenants table
   */
  subscribeToTenants(onData: PollingCallback<any>, interval?: number): string {
    return realtimePolling.subscribe({
      tableName: 'tenants',
      interval,
      onData
    })
  },

  /**
   * Subscribe to operators table
   */
  subscribeToOperators(onData: PollingCallback<any>, interval?: number): string {
    return realtimePolling.subscribe({
      tableName: 'operators',
      interval,
      onData
    })
  },

  /**
   * Subscribe to leads table
   */
  subscribeToLeads(onData: PollingCallback<any>, interval?: number): string {
    return realtimePolling.subscribe({
      tableName: 'leads',
      interval,
      onData
    })
  },
}
