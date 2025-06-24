/**
 * Real-time Subscriptions Manager for HomeWiz
 * 
 * This module provides:
 * - Real-time data subscriptions
 * - Event handling and broadcasting
 * - Connection management
 * - Conflict resolution for concurrent updates
 * - Performance optimization
 */

import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { supabase, isSupabaseAvailable } from './client'
import { errorHandler } from './error-handler'

// Event types for real-time updates
export enum RealtimeEventType {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE'
}

// Subscription configuration
export interface SubscriptionConfig {
  table: string
  event?: RealtimeEventType | '*'
  filter?: string
  schema?: string
}

// Event payload interface
export interface RealtimeEvent<T = any> {
  eventType: RealtimeEventType
  table: string
  old?: T
  new?: T
  timestamp: Date
  userId?: string
}

// Subscription callback type
export type SubscriptionCallback<T = any> = (event: RealtimeEvent<T>) => void

// Subscription interface
interface Subscription {
  id: string
  config: SubscriptionConfig
  callback: SubscriptionCallback
  channel: RealtimeChannel
  isActive: boolean
  createdAt: Date
  lastEvent?: Date
}

/**
 * Real-time Manager Class
 */
export class RealtimeManager {
  private static instance: RealtimeManager
  private subscriptions = new Map<string, Subscription>()
  private isConnected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  static getInstance(): RealtimeManager {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance = new RealtimeManager()
    }
    return RealtimeManager.instance
  }

  /**
   * Subscribe to real-time events
   */
  subscribe<T = any>(
    config: SubscriptionConfig,
    callback: SubscriptionCallback<T>
  ): string {
    const subscriptionId = this.generateSubscriptionId(config)

    // Check if Supabase is available
    if (!isSupabaseAvailable() || !supabase) {
      console.log(`🔧 Supabase realtime disabled - skipping subscription to ${config.table}`)
      return subscriptionId
    }

    try {
      // Create channel
      const channel = supabase.channel(`${config.table}_${subscriptionId}`)

      // Configure postgres changes listener
      const changeConfig: any = {
        event: config.event || '*',
        schema: config.schema || 'public',
        table: config.table
      }

      if (config.filter) {
        changeConfig.filter = config.filter
      }

      channel.on(
        'postgres_changes',
        changeConfig,
        (payload: RealtimePostgresChangesPayload<T>) => {
          this.handleRealtimeEvent(payload, callback, subscriptionId)
        }
      )

      // Subscribe to channel
      channel.subscribe((status) => {
        this.handleSubscriptionStatus(subscriptionId, status)
      })

      // Store subscription
      const subscription: Subscription = {
        id: subscriptionId,
        config,
        callback,
        channel,
        isActive: true,
        createdAt: new Date()
      }

      this.subscriptions.set(subscriptionId, subscription)

      console.log(`Subscribed to ${config.table} with ID: ${subscriptionId}`)
      return subscriptionId

    } catch (error) {
      const enhancedError = errorHandler.processError(error, 'realtime_subscribe')
      console.error('Failed to create subscription:', enhancedError)
      throw enhancedError
    }
  }

  /**
   * Unsubscribe from real-time events
   */
  async unsubscribe(subscriptionId: string): Promise<boolean> {
    const subscription = this.subscriptions.get(subscriptionId)

    if (!subscription) {
      console.warn(`Subscription ${subscriptionId} not found`)
      return false
    }

    // Check if Supabase is available
    if (!isSupabaseAvailable() || !supabase) {
      console.log(`🔧 Supabase realtime disabled - removing subscription ${subscriptionId} from memory`)
      this.subscriptions.delete(subscriptionId)
      return true
    }

    try {
      await supabase.removeChannel(subscription.channel)
      subscription.isActive = false
      this.subscriptions.delete(subscriptionId)

      console.log(`Unsubscribed from ${subscriptionId}`)
      return true

    } catch (error) {
      const enhancedError = errorHandler.processError(error, 'realtime_unsubscribe')
      console.error('Failed to unsubscribe:', enhancedError)
      return false
    }
  }

  /**
   * Unsubscribe from all subscriptions
   */
  async unsubscribeAll(): Promise<void> {
    const subscriptionIds = Array.from(this.subscriptions.keys())
    
    await Promise.all(
      subscriptionIds.map(id => this.unsubscribe(id))
    )
    
    console.log('Unsubscribed from all real-time events')
  }

  /**
   * Handle real-time event
   */
  private handleRealtimeEvent<T>(
    payload: RealtimePostgresChangesPayload<T>,
    callback: SubscriptionCallback<T>,
    subscriptionId: string
  ): void {
    try {
      const event: RealtimeEvent<T> = {
        eventType: payload.eventType as RealtimeEventType,
        table: payload.table,
        old: payload.old,
        new: payload.new,
        timestamp: new Date()
      }
      
      // Update subscription last event time
      const subscription = this.subscriptions.get(subscriptionId)
      if (subscription) {
        subscription.lastEvent = new Date()
      }
      
      // Call the callback
      callback(event)
      
    } catch (error) {
      const enhancedError = errorHandler.processError(error, 'realtime_event_handler')
      console.error('Error handling real-time event:', enhancedError)
    }
  }

  /**
   * Handle subscription status changes
   */
  private handleSubscriptionStatus(subscriptionId: string, status: string): void {
    const subscription = this.subscriptions.get(subscriptionId)
    
    if (!subscription) return
    
    switch (status) {
      case 'SUBSCRIBED':
        this.isConnected = true
        this.reconnectAttempts = 0
        console.log(`Subscription ${subscriptionId} connected`)
        break
        
      case 'CHANNEL_ERROR':
        console.error(`Subscription ${subscriptionId} error`)
        this.handleConnectionError(subscriptionId)
        break
        
      case 'TIMED_OUT':
        console.warn(`Subscription ${subscriptionId} timed out`)
        this.handleConnectionError(subscriptionId)
        break
        
      case 'CLOSED':
        console.log(`Subscription ${subscriptionId} closed`)
        subscription.isActive = false
        break
    }
  }

  /**
   * Handle connection errors with retry logic
   */
  private handleConnectionError(subscriptionId: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`Max reconnection attempts reached for ${subscriptionId}`)
      return
    }
    
    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`Attempting to reconnect ${subscriptionId} in ${delay}ms (attempt ${this.reconnectAttempts})`)
    
    setTimeout(() => {
      this.reconnectSubscription(subscriptionId)
    }, delay)
  }

  /**
   * Reconnect a subscription
   */
  private async reconnectSubscription(subscriptionId: string): Promise<void> {
    const subscription = this.subscriptions.get(subscriptionId)
    
    if (!subscription) return
    
    // Check if Supabase is available
    if (!isSupabaseAvailable() || !supabase) {
      console.log(`🔧 Supabase realtime disabled - cannot reconnect subscription ${subscriptionId}`)
      this.subscriptions.delete(subscriptionId)
      return
    }

    try {
      // Unsubscribe from old channel
      await supabase.removeChannel(subscription.channel)

      // Create new subscription with same config
      const newSubscriptionId = this.subscribe(subscription.config, subscription.callback)

      // Remove old subscription
      this.subscriptions.delete(subscriptionId)

      console.log(`Reconnected subscription ${subscriptionId} as ${newSubscriptionId}`)

    } catch (error) {
      const enhancedError = errorHandler.processError(error, 'realtime_reconnect')
      console.error('Failed to reconnect subscription:', enhancedError)
    }
  }

  /**
   * Generate unique subscription ID
   */
  private generateSubscriptionId(config: SubscriptionConfig): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    return `${config.table}_${config.event || 'all'}_${timestamp}_${random}`
  }

  /**
   * Get subscription statistics
   */
  getStats() {
    const activeSubscriptions = Array.from(this.subscriptions.values()).filter(s => s.isActive)
    
    return {
      total: this.subscriptions.size,
      active: activeSubscriptions.length,
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      subscriptions: activeSubscriptions.map(s => ({
        id: s.id,
        table: s.config.table,
        event: s.config.event,
        createdAt: s.createdAt,
        lastEvent: s.lastEvent
      }))
    }
  }

  /**
   * Check if connected to real-time
   */
  isRealtimeConnected(): boolean {
    return this.isConnected
  }

  /**
   * Get active subscriptions
   */
  getActiveSubscriptions(): string[] {
    return Array.from(this.subscriptions.values())
      .filter(s => s.isActive)
      .map(s => s.id)
  }
}

// Export singleton instance
export const realtimeManager = RealtimeManager.getInstance()

// Utility functions for common subscription patterns
export const subscribeToTable = <T = any>(
  table: string,
  callback: SubscriptionCallback<T>,
  event?: RealtimeEventType
): string => {
  return realtimeManager.subscribe({ table, event }, callback)
}

export const subscribeToTableWithFilter = <T = any>(
  table: string,
  filter: string,
  callback: SubscriptionCallback<T>,
  event?: RealtimeEventType
): string => {
  return realtimeManager.subscribe({ table, filter, event }, callback)
}

export const unsubscribeFromTable = (subscriptionId: string): Promise<boolean> => {
  return realtimeManager.unsubscribe(subscriptionId)
}

// Predefined subscriptions for common use cases
export const subscribeToTenants = (callback: SubscriptionCallback): string => {
  return subscribeToTable('tenants', callback)
}

export const subscribeToBuildings = (callback: SubscriptionCallback): string => {
  return subscribeToTable('buildings', callback)
}

export const subscribeToRooms = (callback: SubscriptionCallback): string => {
  return subscribeToTable('rooms', callback)
}

export const subscribeToLeads = (callback: SubscriptionCallback): string => {
  return subscribeToTable('leads', callback)
}
