/**
 * Notification Service
 * Handles all types of notifications and alerts in the system
 */

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: string
  read: boolean
  category: 'system' | 'leads' | 'rooms' | 'maintenance' | 'operators' | 'buildings'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  actionUrl?: string
  actionLabel?: string
  data?: any
}

export interface NotificationRule {
  id: string
  name: string
  description: string
  category: string
  condition: (data: any) => boolean
  template: (data: any) => Omit<Notification, 'id' | 'timestamp' | 'read'>
  enabled: boolean
}

class NotificationService {
  private notifications: Notification[] = []
  private rules: NotificationRule[] = []
  private maxNotifications = 100
  private listeners: ((notifications: Notification[]) => void)[] = []

  constructor() {
    this.initializeDefaultRules()
  }

  /**
   * Initialize default notification rules
   */
  private initializeDefaultRules(): void {
    this.rules = [
      {
        id: 'new-lead',
        name: 'New Lead Alert',
        description: 'Notify when a new lead is created',
        category: 'leads',
        condition: (data) => data.operation === 'INSERT' && data.table === 'leads',
        template: (data) => ({
          type: 'info',
          title: 'New Lead Received',
          message: `New lead from ${data.data.email || 'unknown email'}`,
          category: 'leads',
          priority: 'medium',
          actionUrl: '/leads',
          actionLabel: 'View Lead'
        }),
        enabled: true
      },
      {
        id: 'room-available',
        name: 'Room Available',
        description: 'Notify when a room becomes available',
        category: 'rooms',
        condition: (data) => data.operation === 'UPDATE' && data.table === 'rooms' && data.data.status === 'AVAILABLE',
        template: (data) => ({
          type: 'success',
          title: 'Room Now Available',
          message: `Room ${data.data.room_number || data.data.room_id} is now available for rent`,
          category: 'rooms',
          priority: 'medium',
          actionUrl: '/rooms',
          actionLabel: 'View Room'
        }),
        enabled: true
      },
      {
        id: 'room-occupied',
        name: 'Room Occupied',
        description: 'Notify when a room becomes occupied',
        category: 'rooms',
        condition: (data) => data.operation === 'UPDATE' && data.table === 'rooms' && data.data.status === 'OCCUPIED',
        template: (data) => ({
          type: 'info',
          title: 'Room Occupied',
          message: `Room ${data.data.room_number || data.data.room_id} has been occupied`,
          category: 'rooms',
          priority: 'low',
          actionUrl: '/rooms',
          actionLabel: 'View Room'
        }),
        enabled: true
      },
      {
        id: 'maintenance-required',
        name: 'Maintenance Required',
        description: 'Notify when a room requires maintenance',
        category: 'maintenance',
        condition: (data) => data.operation === 'UPDATE' && data.table === 'rooms' && data.data.status === 'MAINTENANCE',
        template: (data) => ({
          type: 'warning',
          title: 'Maintenance Required',
          message: `Room ${data.data.room_number || data.data.room_id} requires maintenance attention`,
          category: 'maintenance',
          priority: 'high',
          actionUrl: '/rooms',
          actionLabel: 'View Room'
        }),
        enabled: true
      },
      {
        id: 'new-operator',
        name: 'New Operator Added',
        description: 'Notify when a new operator is added',
        category: 'operators',
        condition: (data) => data.operation === 'INSERT' && data.table === 'operators',
        template: (data) => ({
          type: 'info',
          title: 'New Operator Added',
          message: `${data.data.name || 'New operator'} has been added to the system`,
          category: 'operators',
          priority: 'low',
          actionUrl: '/operators',
          actionLabel: 'View Operators'
        }),
        enabled: true
      },
      {
        id: 'new-building',
        name: 'New Building Added',
        description: 'Notify when a new building is added',
        category: 'buildings',
        condition: (data) => data.operation === 'INSERT' && data.table === 'buildings',
        template: (data) => ({
          type: 'success',
          title: 'New Building Added',
          message: `${data.data.building_name || 'New building'} has been added to your portfolio`,
          category: 'buildings',
          priority: 'medium',
          actionUrl: '/buildings',
          actionLabel: 'View Building'
        }),
        enabled: true
      },
      {
        id: 'system-error',
        name: 'System Error',
        description: 'Notify when system errors occur',
        category: 'system',
        condition: (data) => data.success === false,
        template: (data) => ({
          type: 'error',
          title: 'System Error',
          message: `Error in ${data.table}: ${data.error || 'Unknown error'}`,
          category: 'system',
          priority: 'urgent',
          actionUrl: '/logs',
          actionLabel: 'View Logs'
        }),
        enabled: true
      }
    ]
  }

  /**
   * Add a new notification
   */
  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): string {
    const id = this.generateId()
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date().toISOString(),
      read: false
    }

    this.notifications.unshift(newNotification)

    // Keep only the most recent notifications
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications)
    }

    // Log the notification
    console.log(`🔔 Notification: ${notification.title} - ${notification.message}`)

    // Notify listeners
    this.notifyListeners()

    return id
  }

  /**
   * Process data change and trigger notifications based on rules
   */
  processDataChange(data: any): void {
    this.rules.forEach(rule => {
      if (rule.enabled && rule.condition(data)) {
        const notification = rule.template(data)
        this.addNotification({
          ...notification,
          data
        })
      }
    })
  }

  /**
   * Get all notifications
   */
  getNotifications(): Notification[] {
    return [...this.notifications]
  }

  /**
   * Get unread notifications
   */
  getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.read)
  }

  /**
   * Get notifications by category
   */
  getNotificationsByCategory(category: string): Notification[] {
    return this.notifications.filter(n => n.category === category)
  }

  /**
   * Get notifications by priority
   */
  getNotificationsByPriority(priority: string): Notification[] {
    return this.notifications.filter(n => n.priority === priority)
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id)
    if (notification) {
      notification.read = true
      this.notifyListeners()
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true)
    this.notifyListeners()
  }

  /**
   * Delete notification
   */
  deleteNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id)
    this.notifyListeners()
  }

  /**
   * Clear all notifications
   */
  clearAllNotifications(): void {
    this.notifications = []
    this.notifyListeners()
  }

  /**
   * Get notification statistics
   */
  getStats(): {
    total: number
    unread: number
    byCategory: Record<string, number>
    byPriority: Record<string, number>
    byType: Record<string, number>
  } {
    const stats = {
      total: this.notifications.length,
      unread: this.getUnreadNotifications().length,
      byCategory: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      byType: {} as Record<string, number>
    }

    this.notifications.forEach(notification => {
      // Count by category
      stats.byCategory[notification.category] = (stats.byCategory[notification.category] || 0) + 1
      
      // Count by priority
      stats.byPriority[notification.priority] = (stats.byPriority[notification.priority] || 0) + 1
      
      // Count by type
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1
    })

    return stats
  }

  /**
   * Subscribe to notification changes
   */
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener)
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.notifications]))
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Enable/disable notification rule
   */
  toggleRule(ruleId: string, enabled: boolean): void {
    const rule = this.rules.find(r => r.id === ruleId)
    if (rule) {
      rule.enabled = enabled
      console.log(`🔔 Notification rule "${rule.name}" ${enabled ? 'enabled' : 'disabled'}`)
    }
  }

  /**
   * Get all notification rules
   */
  getRules(): NotificationRule[] {
    return [...this.rules]
  }

  /**
   * Add custom notification rule
   */
  addRule(rule: Omit<NotificationRule, 'id'>): string {
    const id = this.generateId()
    const newRule: NotificationRule = {
      ...rule,
      id
    }
    this.rules.push(newRule)
    return id
  }

  /**
   * Show browser notification (if permission granted)
   */
  showBrowserNotification(notification: Notification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id
      })
    }
  }

  /**
   * Request browser notification permission
   */
  async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }
}

// Create singleton instance
export const notificationService = new NotificationService()

// Export convenience functions
export const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) =>
  notificationService.addNotification(notification)

export const processDataChange = (data: any) =>
  notificationService.processDataChange(data)

export default notificationService
