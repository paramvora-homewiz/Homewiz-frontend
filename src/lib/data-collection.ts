/**
 * Production-Ready Data Collection System for HomeWiz
 * 
 * This module provides comprehensive JSON data collection, validation,
 * transformation, and export capabilities for all application data.
 */

import { z } from 'zod'
import { OnboardingFormData, User, Building, Room, Lead, UploadedFile } from '@/types'
import config from './config'

// Data Collection Event Types
export enum DataEventType {
  FORM_SUBMISSION = 'form_submission',
  USER_ACTION = 'user_action',
  API_CALL = 'api_call',
  FILE_UPLOAD = 'file_upload',
  ERROR_EVENT = 'error_event',
  SYSTEM_EVENT = 'system_event'
}

// Data Collection Priority Levels
export enum DataPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Base Data Event Schema
export const DataEventSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(DataEventType),
  priority: z.nativeEnum(DataPriority),
  timestamp: z.string(),
  userId: z.string().optional(),
  sessionId: z.string(),
  source: z.string(),
  data: z.record(z.any()),
  metadata: z.object({
    userAgent: z.string().optional(),
    ip: z.string().optional(),
    referrer: z.string().optional(),
    environment: z.string(),
    version: z.string(),
  }),
})

export type DataEvent = z.infer<typeof DataEventSchema>

// Structured JSON Data Schemas for Backend Integration
export const BackendFormDataSchema = z.object({
  // Application Metadata
  applicationId: z.string(),
  submissionTimestamp: z.string(),
  formVersion: z.string(),
  source: z.string(),
  
  // User Information
  user: z.object({
    id: z.string().optional(),
    email: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    phone: z.string(),
    dateOfBirth: z.string().optional(),
    nationality: z.string().optional(),
  }),
  
  // Professional Information
  professional: z.object({
    occupation: z.string(),
    company: z.string().optional(),
    annualIncome: z.number().optional(),
    visaStatus: z.string().optional(),
  }),
  
  // Housing Preferences
  housing: z.object({
    budgetMin: z.number(),
    budgetMax: z.number(),
    preferredMoveInDate: z.string(),
    preferredLeaseTerm: z.number(),
    bookingType: z.enum(['LEASE', 'SHORT_TERM', 'MONTH_TO_MONTH', 'CORPORATE']),
    roomType: z.enum(['private', 'shared', 'either']).optional(),
    bathroomType: z.enum(['private', 'shared']).optional(),
    floorPreference: z.enum(['low', 'high']).optional(),
    viewPreference: z.string().optional(),
  }),
  
  // Selected Property
  property: z.object({
    buildingId: z.string().optional(),
    roomId: z.string().optional(),
    buildingName: z.string().optional(),
    roomNumber: z.string().optional(),
  }),
  
  // Amenities
  amenities: z.object({
    wifi: z.boolean(),
    laundry: z.boolean(),
    parking: z.boolean(),
    security: z.boolean(),
    gym: z.boolean(),
    commonArea: z.boolean(),
    rooftop: z.boolean(),
    bikeStorage: z.boolean(),
  }),
  
  // Lifestyle
  lifestyle: z.object({
    hasVehicles: z.boolean(),
    vehicleDetails: z.string().optional(),
    hasRentersInsurance: z.boolean(),
    insuranceDetails: z.string().optional(),
    pets: z.boolean(),
    petDetails: z.string().optional(),
    smoking: z.boolean(),
    additionalPreferences: z.string().optional(),
  }),
  
  // Emergency Contact
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relation: z.string().optional(),
  }),
  
  // Documents
  documents: z.array(z.object({
    id: z.string(),
    name: z.string(),
    category: z.string(),
    size: z.number(),
    type: z.string(),
    uploadedAt: z.string(),
    url: z.string().optional(),
  })),
  
  // References
  references: z.array(z.object({
    name: z.string(),
    relationship: z.string(),
    phone: z.string(),
    email: z.string().optional(),
  })),
})

export type BackendFormData = z.infer<typeof BackendFormDataSchema>

/**
 * Data Collection Manager
 * Handles all data collection, validation, and export operations
 */
export class DataCollectionManager {
  private static instance: DataCollectionManager
  private events: DataEvent[] = []
  private sessionId: string
  private isEnabled: boolean = true

  private constructor() {
    this.sessionId = this.generateSessionId()
    this.initializeSession()
  }

  static getInstance(): DataCollectionManager {
    if (!DataCollectionManager.instance) {
      DataCollectionManager.instance = new DataCollectionManager()
    }
    return DataCollectionManager.instance
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private initializeSession(): void {
    this.collectEvent({
      type: DataEventType.SYSTEM_EVENT,
      priority: DataPriority.LOW,
      source: 'data_collection_manager',
      data: {
        event: 'session_started',
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
      }
    })
  }

  /**
   * Enable or disable data collection
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
    this.collectEvent({
      type: DataEventType.SYSTEM_EVENT,
      priority: DataPriority.MEDIUM,
      source: 'data_collection_manager',
      data: {
        event: 'collection_toggled',
        enabled,
        timestamp: new Date().toISOString(),
      }
    })
  }

  /**
   * Collect a data event
   */
  collectEvent(eventData: Partial<DataEvent> & { type: DataEventType; source: string; data: Record<string, any> }): void {
    if (!this.isEnabled) return

    const event: DataEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      priority: DataPriority.MEDIUM,
      metadata: {
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        environment: config.environment,
        version: config.app.version,
        referrer: typeof window !== 'undefined' ? document.referrer : undefined,
      },
      ...eventData,
    }

    // Validate event
    try {
      DataEventSchema.parse(event)
      this.events.push(event)
      
      // Auto-export critical events
      if (event.priority === DataPriority.CRITICAL) {
        this.exportEvent(event)
      }
    } catch (error) {
      console.error('Invalid data event:', error)
    }
  }

  /**
   * Transform onboarding form data to backend-ready JSON
   */
  transformFormData(formData: OnboardingFormData, userId?: string): BackendFormData {
    const applicationId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const backendData: BackendFormData = {
      applicationId,
      submissionTimestamp: new Date().toISOString(),
      formVersion: '1.0.0',
      source: 'homewiz_frontend',
      
      user: {
        id: userId,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        nationality: formData.nationality,
      },
      
      professional: {
        occupation: formData.occupation,
        company: formData.company,
        annualIncome: formData.annual_income,
        visaStatus: formData.visa_status,
      },
      
      housing: {
        budgetMin: formData.budget_min,
        budgetMax: formData.budget_max,
        preferredMoveInDate: formData.preferred_move_in_date,
        preferredLeaseTerm: formData.preferred_lease_term,
        bookingType: formData.booking_type,
        roomType: formData.room_type,
        bathroomType: formData.bathroom_type,
        floorPreference: formData.floor_preference,
        viewPreference: formData.view_preference,
      },
      
      property: {
        buildingId: formData.selected_building_id,
        roomId: formData.selected_room_id,
        buildingName: formData.selected_building_id,
        roomNumber: formData.selected_room_id,
      },
      
      amenities: {
        wifi: formData.amenity_wifi,
        laundry: formData.amenity_laundry,
        parking: formData.amenity_parking,
        security: formData.amenity_security,
        gym: formData.amenity_gym,
        commonArea: formData.amenity_common_area,
        rooftop: formData.amenity_rooftop,
        bikeStorage: formData.amenity_bike_storage,
      },
      
      lifestyle: {
        hasVehicles: formData.has_vehicles,
        vehicleDetails: formData.vehicle_details,
        hasRentersInsurance: formData.has_renters_insurance,
        insuranceDetails: formData.insurance_details,
        pets: formData.pets,
        petDetails: formData.pet_details,
        smoking: formData.smoking,
        additionalPreferences: formData.additional_preferences,
      },
      
      emergencyContact: {
        name: formData.emergency_contact_name,
        phone: formData.emergency_contact_phone,
        relation: formData.emergency_contact_relation,
      },
      
      documents: (formData.documents || []).map(doc => ({
        id: doc.id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: doc.name,
        category: doc.category,
        size: doc.size || 0,
        type: doc.type || 'unknown',
        uploadedAt: doc.uploadedAt || new Date().toISOString(),
        url: doc.url,
      })),
      
      references: (formData.references || []).map(ref => ({
        name: ref.name,
        relationship: ref.relationship,
        phone: ref.phone,
        email: ref.email,
      })),
    }

    // Validate transformed data
    try {
      BackendFormDataSchema.parse(backendData)
      
      // Collect form submission event
      this.collectEvent({
        type: DataEventType.FORM_SUBMISSION,
        priority: DataPriority.HIGH,
        source: 'onboarding_form',
        data: {
          applicationId,
          formType: 'onboarding',
          dataSize: JSON.stringify(backendData).length,
          fieldsCompleted: this.countCompletedFields(formData),
        }
      })
      
      return backendData
    } catch (error) {
      console.error('Form data validation failed:', error)
      throw new Error('Invalid form data structure')
    }
  }

  private countCompletedFields(formData: OnboardingFormData): number {
    let count = 0
    Object.values(formData).forEach(value => {
      if (value !== undefined && value !== null && value !== '') {
        count++
      }
    })
    return count
  }

  /**
   * Export all collected data as JSON
   */
  exportAllData(): {
    session: {
      id: string
      startTime: string
      endTime: string
      duration: number
      eventCount: number
    }
    events: DataEvent[]
    summary: {
      eventTypes: Record<string, number>
      priorities: Record<string, number>
      sources: Record<string, number>
    }
  } {
    const now = new Date().toISOString()
    const firstEvent = this.events[0]
    const startTime = firstEvent?.timestamp || now
    const duration = new Date(now).getTime() - new Date(startTime).getTime()

    // Generate summary statistics
    const eventTypes: Record<string, number> = {}
    const priorities: Record<string, number> = {}
    const sources: Record<string, number> = {}

    this.events.forEach(event => {
      eventTypes[event.type] = (eventTypes[event.type] || 0) + 1
      priorities[event.priority] = (priorities[event.priority] || 0) + 1
      sources[event.source] = (sources[event.source] || 0) + 1
    })

    return {
      session: {
        id: this.sessionId,
        startTime,
        endTime: now,
        duration,
        eventCount: this.events.length,
      },
      events: this.events,
      summary: {
        eventTypes,
        priorities,
        sources,
      }
    }
  }

  /**
   * Export data in various formats
   */
  exportData(format: 'json' | 'csv' | 'xml' = 'json'): string {
    const data = this.exportAllData()

    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2)
      case 'csv':
        return this.convertToCSV(data.events)
      case 'xml':
        return this.convertToXML(data)
      default:
        return JSON.stringify(data, null, 2)
    }
  }

  private convertToCSV(events: DataEvent[]): string {
    if (events.length === 0) return ''

    const headers = ['id', 'type', 'priority', 'timestamp', 'userId', 'sessionId', 'source']
    const rows = events.map(event => [
      event.id,
      event.type,
      event.priority,
      event.timestamp,
      event.userId || '',
      event.sessionId,
      event.source,
    ])

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  }

  private convertToXML(data: any): string {
    // Simple XML conversion - can be enhanced based on needs
    return `<?xml version="1.0" encoding="UTF-8"?>
<dataExport>
  <session>
    <id>${data.session.id}</id>
    <startTime>${data.session.startTime}</startTime>
    <endTime>${data.session.endTime}</endTime>
    <duration>${data.session.duration}</duration>
    <eventCount>${data.session.eventCount}</eventCount>
  </session>
  <events>
    ${data.events.map((event: DataEvent) => `
    <event>
      <id>${event.id}</id>
      <type>${event.type}</type>
      <priority>${event.priority}</priority>
      <timestamp>${event.timestamp}</timestamp>
      <source>${event.source}</source>
    </event>`).join('')}
  </events>
</dataExport>`
  }

  /**
   * Export single event (for critical events)
   */
  private async exportEvent(event: DataEvent): Promise<void> {
    try {
      // In production, this could send to analytics service, logging service, etc.
      console.log('Critical event exported:', event)

      // Could also send to backend immediately
      if (config.api.baseUrl && !config.app.demoMode) {
        await fetch(`${config.api.baseUrl}/api/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        })
      }
    } catch (error) {
      console.error('Failed to export critical event:', error)
    }
  }

  /**
   * Clear all collected data
   */
  clearData(): void {
    this.collectEvent({
      type: DataEventType.SYSTEM_EVENT,
      priority: DataPriority.MEDIUM,
      source: 'data_collection_manager',
      data: {
        event: 'data_cleared',
        previousEventCount: this.events.length,
        timestamp: new Date().toISOString(),
      }
    })

    this.events = []
  }

  /**
   * Get current statistics
   */
  getStats(): {
    eventCount: number
    sessionDuration: number
    lastEventTime: string | null
    isEnabled: boolean
  } {
    const lastEvent = this.events[this.events.length - 1]
    const firstEvent = this.events[0]
    const duration = lastEvent && firstEvent
      ? new Date(lastEvent.timestamp).getTime() - new Date(firstEvent.timestamp).getTime()
      : 0

    return {
      eventCount: this.events.length,
      sessionDuration: duration,
      lastEventTime: lastEvent?.timestamp || null,
      isEnabled: this.isEnabled,
    }
  }
}

// Export singleton instance
export const dataCollectionManager = DataCollectionManager.getInstance()

// Utility functions for easy data collection
export const collectFormSubmission = (formData: OnboardingFormData, userId?: string) => {
  const transformedData = dataCollectionManager.transformFormData(formData, userId)

  dataCollectionManager.collectEvent({
    type: DataEventType.FORM_SUBMISSION,
    priority: DataPriority.HIGH,
    source: 'form_submission_utility',
    data: {
      applicationId: transformedData.applicationId,
      formType: 'onboarding',
      userEmail: transformedData.user.email,
      completionRate: calculateCompletionRate(formData),
    }
  })

  return transformedData
}

export const collectUserAction = (action: string, data: Record<string, any>, userId?: string) => {
  dataCollectionManager.collectEvent({
    type: DataEventType.USER_ACTION,
    priority: DataPriority.MEDIUM,
    source: 'user_action_utility',
    data: {
      action,
      userId,
      ...data,
    }
  })
}

export const collectApiCall = (endpoint: string, method: string, status: number, duration: number) => {
  dataCollectionManager.collectEvent({
    type: DataEventType.API_CALL,
    priority: status >= 400 ? DataPriority.HIGH : DataPriority.LOW,
    source: 'api_client',
    data: {
      endpoint,
      method,
      status,
      duration,
      success: status < 400,
    }
  })
}

export const collectError = (error: Error, context: string, userId?: string) => {
  dataCollectionManager.collectEvent({
    type: DataEventType.ERROR_EVENT,
    priority: DataPriority.CRITICAL,
    source: 'error_handler',
    data: {
      errorMessage: error.message,
      errorStack: error.stack,
      context,
      userId,
    }
  })
}

function calculateCompletionRate(formData: OnboardingFormData): number {
  const requiredFields = [
    'firstName', 'lastName', 'email', 'phone', 'occupation',
    'budget_min', 'budget_max', 'preferred_move_in_date', 'preferred_lease_term'
  ]

  const completedRequired = requiredFields.filter(field => {
    const value = formData[field as keyof OnboardingFormData]
    return value !== undefined && value !== null && value !== ''
  }).length

  return (completedRequired / requiredFields.length) * 100
}

// Export types and schemas
// DataEvent and BackendFormData are already exported above
