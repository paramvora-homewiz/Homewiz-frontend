/**
 * Production Monitoring and Security for HomeWiz
 * 
 * This module provides comprehensive monitoring, logging, error tracking,
 * and security features for production deployment.
 */

import { z } from 'zod'
import config from './config'
import { collectError, collectUserAction, dataCollectionManager } from './data-collection'

// Monitoring Event Types
export enum MonitoringEventType {
  PERFORMANCE = 'performance',
  ERROR = 'error',
  SECURITY = 'security',
  USER_BEHAVIOR = 'user_behavior',
  SYSTEM = 'system',
  BUSINESS = 'business'
}

// Security Event Types
export enum SecurityEventType {
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  INVALID_TOKEN = 'invalid_token',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  DATA_BREACH_ATTEMPT = 'data_breach_attempt',
  XSS_ATTEMPT = 'xss_attempt',
  CSRF_ATTEMPT = 'csrf_attempt'
}

// Performance Metrics
export interface PerformanceMetrics {
  pageLoadTime: number
  apiResponseTime: number
  renderTime: number
  memoryUsage: number
  networkLatency: number
  errorRate: number
  userSatisfactionScore: number
}

// Security Alert
export interface SecurityAlert {
  id: string
  type: SecurityEventType
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  userId?: string
  ip?: string
  userAgent?: string
  details: Record<string, any>
  resolved: boolean
}

/**
 * Production Monitoring Manager
 */
export class MonitoringManager {
  private static instance: MonitoringManager
  private performanceObserver?: PerformanceObserver
  private errorBoundaryActive: boolean = false
  private securityAlerts: SecurityAlert[] = []
  private rateLimitTracker: Map<string, number[]> = new Map()

  private constructor() {
    this.initializeMonitoring()
  }

  static getInstance(): MonitoringManager {
    if (!MonitoringManager.instance) {
      MonitoringManager.instance = new MonitoringManager()
    }
    return MonitoringManager.instance
  }

  /**
   * Initialize monitoring systems
   */
  private initializeMonitoring(): void {
    if (typeof window === 'undefined') return

    // Performance monitoring
    this.initializePerformanceMonitoring()
    
    // Error monitoring
    this.initializeErrorMonitoring()
    
    // Security monitoring
    this.initializeSecurityMonitoring()
    
    // User behavior monitoring
    this.initializeUserBehaviorMonitoring()
  }

  /**
   * Initialize performance monitoring
   */
  private initializePerformanceMonitoring(): void {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackPerformanceEntry(entry)
        }
      })

      this.performanceObserver.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] })
    }

    // Track Core Web Vitals
    this.trackCoreWebVitals()
  }

  /**
   * Initialize error monitoring
   */
  private initializeErrorMonitoring(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        type: 'javascript_error',
      })
    })

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: 'Unhandled Promise Rejection',
        error: event.reason,
        type: 'promise_rejection',
      })
    })
  }

  /**
   * Initialize security monitoring
   */
  private initializeSecurityMonitoring(): void {
    // Monitor for XSS attempts
    this.monitorXSSAttempts()
    
    // Monitor for CSRF attempts
    this.monitorCSRFAttempts()
    
    // Monitor rate limiting
    this.monitorRateLimit()
  }

  /**
   * Initialize user behavior monitoring
   */
  private initializeUserBehaviorMonitoring(): void {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      collectUserAction('page_visibility_changed', {
        hidden: document.hidden,
        timestamp: new Date().toISOString(),
      })
    })

    // Track user engagement
    let engagementStartTime = Date.now()
    window.addEventListener('beforeunload', () => {
      const engagementTime = Date.now() - engagementStartTime
      collectUserAction('session_ended', {
        engagementTime,
        timestamp: new Date().toISOString(),
      })
    })
  }

  /**
   * Track performance entry
   */
  private trackPerformanceEntry(entry: PerformanceEntry): void {
    const performanceData = {
      name: entry.name,
      type: entry.entryType,
      startTime: entry.startTime,
      duration: entry.duration,
      timestamp: new Date().toISOString(),
    }

    dataCollectionManager.collectEvent({
      type: MonitoringEventType.PERFORMANCE,
      priority: 'low',
      source: 'performance_monitor',
      data: performanceData,
    })
  }

  /**
   * Track Core Web Vitals
   */
  private trackCoreWebVitals(): void {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        this.trackMetric('lcp', entry.startTime)
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay (FID)
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        this.trackMetric('fid', (entry as any).processingStart - entry.startTime)
      }
    }).observe({ entryTypes: ['first-input'] })

    // Cumulative Layout Shift (CLS)
    let clsValue = 0
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
        }
      }
      this.trackMetric('cls', clsValue)
    }).observe({ entryTypes: ['layout-shift'] })
  }

  /**
   * Track custom metric
   */
  trackMetric(name: string, value: number, tags?: Record<string, string>): void {
    dataCollectionManager.collectEvent({
      type: MonitoringEventType.PERFORMANCE,
      priority: 'medium',
      source: 'custom_metrics',
      data: {
        metric: name,
        value,
        tags,
        timestamp: new Date().toISOString(),
      },
    })
  }

  /**
   * Track error
   */
  trackError(errorData: {
    message: string
    filename?: string
    lineno?: number
    colno?: number
    error?: Error
    type: string
    context?: string
  }): void {
    const errorInfo = {
      ...errorData,
      stack: errorData.error?.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    }

    dataCollectionManager.collectEvent({
      type: MonitoringEventType.ERROR,
      priority: 'high',
      source: 'error_monitor',
      data: errorInfo,
    })

    // Also use the existing error collection
    if (errorData.error) {
      collectError(errorData.error, errorData.context || errorData.type)
    }
  }

  /**
   * Track security event
   */
  trackSecurityEvent(
    type: SecurityEventType,
    severity: SecurityAlert['severity'],
    details: Record<string, any>
  ): void {
    const alert: SecurityAlert = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      timestamp: new Date().toISOString(),
      userId: details.userId,
      ip: details.ip,
      userAgent: navigator.userAgent,
      details,
      resolved: false,
    }

    this.securityAlerts.push(alert)

    dataCollectionManager.collectEvent({
      type: MonitoringEventType.SECURITY,
      priority: severity === 'critical' ? 'critical' : 'high',
      source: 'security_monitor',
      data: alert,
    })

    // Auto-escalate critical security events
    if (severity === 'critical') {
      this.escalateSecurityAlert(alert)
    }
  }

  /**
   * Monitor XSS attempts
   */
  private monitorXSSAttempts(): void {
    // Monitor for suspicious script injections
    const originalCreateElement = document.createElement
    document.createElement = function(tagName: string) {
      const element = originalCreateElement.call(this, tagName)
      
      if (tagName.toLowerCase() === 'script') {
        MonitoringManager.getInstance().trackSecurityEvent(
          SecurityEventType.XSS_ATTEMPT,
          'high',
          {
            tagName,
            timestamp: new Date().toISOString(),
          }
        )
      }
      
      return element
    }
  }

  /**
   * Monitor CSRF attempts
   */
  private monitorCSRFAttempts(): void {
    // Monitor for requests without proper CSRF tokens
    const originalFetch = window.fetch
    window.fetch = async function(input: RequestInfo | URL, init?: RequestInit) {
      const url = typeof input === 'string' ? input : input.toString()
      
      // Check for CSRF token in POST requests
      if (init?.method === 'POST' && !url.includes(config.api.baseUrl)) {
        MonitoringManager.getInstance().trackSecurityEvent(
          SecurityEventType.CSRF_ATTEMPT,
          'medium',
          {
            url,
            method: init.method,
            timestamp: new Date().toISOString(),
          }
        )
      }
      
      return originalFetch.call(this, input, init)
    }
  }

  /**
   * Monitor rate limiting
   */
  private monitorRateLimit(): void {
    const checkRateLimit = (key: string, limit: number, windowMs: number): boolean => {
      const now = Date.now()
      const requests = this.rateLimitTracker.get(key) || []
      
      // Remove old requests outside the window
      const validRequests = requests.filter(time => now - time < windowMs)
      
      if (validRequests.length >= limit) {
        this.trackSecurityEvent(
          SecurityEventType.RATE_LIMIT_EXCEEDED,
          'medium',
          {
            key,
            requestCount: validRequests.length,
            limit,
            windowMs,
          }
        )
        return false
      }
      
      validRequests.push(now)
      this.rateLimitTracker.set(key, validRequests)
      return true
    }

    // Example: Monitor API calls
    window.addEventListener('fetch', () => {
      checkRateLimit('api_calls', 100, 60000) // 100 requests per minute
    })
  }

  /**
   * Escalate critical security alert
   */
  private escalateSecurityAlert(alert: SecurityAlert): void {
    // In production, this could send to security team, trigger alerts, etc.
    console.error('CRITICAL SECURITY ALERT:', alert)
    
    // Could integrate with services like:
    // - Sentry for error tracking
    // - DataDog for monitoring
    // - PagerDuty for alerting
    // - Slack for notifications
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    
    return {
      pageLoadTime: navigation?.loadEventEnd - navigation?.navigationStart || 0,
      apiResponseTime: this.getAverageApiResponseTime(),
      renderTime: navigation?.domContentLoadedEventEnd - navigation?.navigationStart || 0,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      networkLatency: navigation?.responseStart - navigation?.requestStart || 0,
      errorRate: this.calculateErrorRate(),
      userSatisfactionScore: this.calculateUserSatisfactionScore(),
    }
  }

  /**
   * Get security alerts
   */
  getSecurityAlerts(): SecurityAlert[] {
    return [...this.securityAlerts]
  }

  /**
   * Resolve security alert
   */
  resolveSecurityAlert(alertId: string): void {
    const alert = this.securityAlerts.find(a => a.id === alertId)
    if (alert) {
      alert.resolved = true
    }
  }

  /**
   * Calculate average API response time
   */
  private getAverageApiResponseTime(): number {
    const apiEntries = performance.getEntriesByType('resource')
      .filter(entry => entry.name.includes('/api/'))
    
    if (apiEntries.length === 0) return 0
    
    const totalTime = apiEntries.reduce((sum, entry) => sum + entry.duration, 0)
    return totalTime / apiEntries.length
  }

  /**
   * Calculate error rate
   */
  private calculateErrorRate(): number {
    const stats = dataCollectionManager.getStats()
    const errorEvents = dataCollectionManager.exportAllData().events
      .filter(event => event.type === 'error_event')
    
    return stats.eventCount > 0 ? (errorEvents.length / stats.eventCount) * 100 : 0
  }

  /**
   * Calculate user satisfaction score
   */
  private calculateUserSatisfactionScore(): number {
    const metrics = this.getPerformanceMetrics()
    
    // Simple scoring based on Core Web Vitals
    let score = 100
    
    // Penalize slow loading
    if (metrics.pageLoadTime > 3000) score -= 20
    if (metrics.pageLoadTime > 5000) score -= 30
    
    // Penalize high error rate
    if (metrics.errorRate > 1) score -= 15
    if (metrics.errorRate > 5) score -= 25
    
    return Math.max(0, score)
  }

  /**
   * Export monitoring data
   */
  exportMonitoringData(): {
    performance: PerformanceMetrics
    securityAlerts: SecurityAlert[]
    systemInfo: any
    timestamp: string
  } {
    return {
      performance: this.getPerformanceMetrics(),
      securityAlerts: this.getSecurityAlerts(),
      systemInfo: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
      },
      timestamp: new Date().toISOString(),
    }
  }
}

// Export singleton instance
export const monitoringManager = MonitoringManager.getInstance()

// Utility functions
export const trackMetric = (name: string, value: number, tags?: Record<string, string>) => {
  monitoringManager.trackMetric(name, value, tags)
}

export const trackError = (error: Error, context?: string) => {
  monitoringManager.trackError({
    message: error.message,
    error,
    type: 'application_error',
    context,
  })
}

export const trackSecurityEvent = (
  type: SecurityEventType,
  severity: SecurityAlert['severity'],
  details: Record<string, any>
) => {
  monitoringManager.trackSecurityEvent(type, severity, details)
}

// Export types
export { MonitoringEventType, SecurityEventType }
export type { PerformanceMetrics, SecurityAlert }
