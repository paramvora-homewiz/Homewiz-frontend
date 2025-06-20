/**
 * Test Suite for Data Collection System
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { 
  DataCollectionManager, 
  DataEventType, 
  DataPriority,
  collectFormSubmission,
  collectUserAction,
  collectApiCall,
  collectError
} from '../data-collection'
import { OnboardingFormData } from '@/types'

// Mock config
vi.mock('../config', () => ({
  default: {
    environment: 'test',
    app: {
      version: '1.0.0',
      demoMode: false,
    },
    api: {
      baseUrl: 'http://localhost:8000',
    },
  },
}))

describe('DataCollectionManager', () => {
  let manager: DataCollectionManager

  beforeEach(() => {
    manager = DataCollectionManager.getInstance()
    manager.clearData()
  })

  afterEach(() => {
    manager.clearData()
  })

  describe('Event Collection', () => {
    it('should collect events with proper structure', () => {
      manager.collectEvent({
        type: DataEventType.USER_ACTION,
        source: 'test',
        data: { action: 'click', target: 'button' },
      })

      const stats = manager.getStats()
      expect(stats.eventCount).toBe(2) // 1 session start + 1 test event
    })

    it('should validate event data', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      manager.collectEvent({
        type: 'invalid_type' as DataEventType,
        source: 'test',
        data: {},
      })

      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid data event:',
        expect.any(Object)
      )

      consoleSpy.mockRestore()
    })

    it('should auto-export critical events', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue(
        new Response(JSON.stringify({ success: true }), { status: 200 })
      )

      manager.collectEvent({
        type: DataEventType.ERROR_EVENT,
        priority: DataPriority.CRITICAL,
        source: 'test',
        data: { error: 'critical error' },
      })

      // Wait for async export
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:8000/api/events',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      )

      fetchSpy.mockRestore()
    })
  })

  describe('Form Data Transformation', () => {
    it('should transform form data correctly', () => {
      const mockFormData: OnboardingFormData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        occupation: 'Engineer',
        budget_min: 1000,
        budget_max: 2000,
        preferred_move_in_date: '2024-01-01',
        preferred_lease_term: 12,
        booking_type: 'LEASE',
        amenity_wifi: true,
        amenity_laundry: false,
        amenity_parking: true,
        amenity_security: true,
        amenity_gym: false,
        amenity_common_area: true,
        amenity_rooftop: false,
        amenity_bike_storage: false,
        has_vehicles: false,
        has_renters_insurance: true,
        pets: false,
        smoking: false,
        preferred_communication: 'EMAIL',
      }

      const transformed = manager.transformFormData(mockFormData, 'user123')

      expect(transformed).toMatchObject({
        user: {
          id: 'user123',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          phone: '+1234567890',
        },
        professional: {
          occupation: 'Engineer',
        },
        housing: {
          budgetMin: 1000,
          budgetMax: 2000,
          preferredMoveInDate: '2024-01-01',
          preferredLeaseTerm: 12,
          bookingType: 'LEASE',
        },
        amenities: {
          wifi: true,
          laundry: false,
          parking: true,
          security: true,
          gym: false,
          commonArea: true,
          rooftop: false,
          bikeStorage: false,
        },
        lifestyle: {
          hasVehicles: false,
          hasRentersInsurance: true,
          pets: false,
          smoking: false,
        },
      })

      expect(transformed.applicationId).toMatch(/^app_\d+_[a-z0-9]+$/)
      expect(transformed.submissionTimestamp).toBeDefined()
      expect(transformed.formVersion).toBe('1.0.0')
      expect(transformed.source).toBe('homewiz_frontend')
    })

    it('should handle missing optional fields', () => {
      const minimalFormData: OnboardingFormData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '+1987654321',
        occupation: 'Designer',
        budget_min: 800,
        budget_max: 1500,
        preferred_move_in_date: '2024-02-01',
        preferred_lease_term: 6,
        booking_type: 'SHORT_TERM',
        amenity_wifi: true,
        amenity_laundry: true,
        amenity_parking: false,
        amenity_security: true,
        amenity_gym: true,
        amenity_common_area: false,
        amenity_rooftop: true,
        amenity_bike_storage: false,
        has_vehicles: true,
        has_renters_insurance: false,
        pets: true,
        smoking: false,
        preferred_communication: 'SMS',
      }

      const transformed = manager.transformFormData(minimalFormData)

      expect(transformed.user.id).toBeUndefined()
      expect(transformed.professional.company).toBeUndefined()
      expect(transformed.emergencyContact.name).toBeUndefined()
      expect(transformed.documents).toEqual([])
      expect(transformed.references).toEqual([])
    })
  })

  describe('Data Export', () => {
    it('should export data in JSON format', () => {
      manager.collectEvent({
        type: DataEventType.USER_ACTION,
        source: 'test',
        data: { action: 'test' },
      })

      const exported = manager.exportData('json')
      const parsed = JSON.parse(exported)

      expect(parsed).toHaveProperty('session')
      expect(parsed).toHaveProperty('events')
      expect(parsed).toHaveProperty('summary')
      expect(parsed.events).toHaveLength(2) // session start + test event
    })

    it('should export data in CSV format', () => {
      manager.collectEvent({
        type: DataEventType.USER_ACTION,
        source: 'test',
        data: { action: 'test' },
      })

      const exported = manager.exportData('csv')
      const lines = exported.split('\n')

      expect(lines[0]).toBe('id,type,priority,timestamp,userId,sessionId,source')
      expect(lines).toHaveLength(3) // header + 2 events
    })

    it('should export data in XML format', () => {
      manager.collectEvent({
        type: DataEventType.USER_ACTION,
        source: 'test',
        data: { action: 'test' },
      })

      const exported = manager.exportData('xml')

      expect(exported).toContain('<?xml version="1.0" encoding="UTF-8"?>')
      expect(exported).toContain('<dataExport>')
      expect(exported).toContain('<session>')
      expect(exported).toContain('<events>')
    })
  })

  describe('Statistics', () => {
    it('should provide accurate statistics', () => {
      const initialStats = manager.getStats()
      expect(initialStats.eventCount).toBe(1) // session start event

      manager.collectEvent({
        type: DataEventType.USER_ACTION,
        source: 'test',
        data: { action: 'test' },
      })

      const updatedStats = manager.getStats()
      expect(updatedStats.eventCount).toBe(2)
      expect(updatedStats.isEnabled).toBe(true)
      expect(updatedStats.lastEventTime).toBeDefined()
    })
  })

  describe('Enable/Disable', () => {
    it('should stop collecting events when disabled', () => {
      manager.setEnabled(false)

      manager.collectEvent({
        type: DataEventType.USER_ACTION,
        source: 'test',
        data: { action: 'test' },
      })

      const stats = manager.getStats()
      expect(stats.isEnabled).toBe(false)
      // Should only have the initial session start event and the disable event
      expect(stats.eventCount).toBe(2)
    })

    it('should resume collecting events when re-enabled', () => {
      manager.setEnabled(false)
      manager.setEnabled(true)

      manager.collectEvent({
        type: DataEventType.USER_ACTION,
        source: 'test',
        data: { action: 'test' },
      })

      const stats = manager.getStats()
      expect(stats.isEnabled).toBe(true)
      expect(stats.eventCount).toBe(4) // start + disable + enable + test
    })
  })
})

describe('Utility Functions', () => {
  beforeEach(() => {
    DataCollectionManager.getInstance().clearData()
  })

  it('should collect form submission', () => {
    const mockFormData: OnboardingFormData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '+1234567890',
      occupation: 'Tester',
      budget_min: 1000,
      budget_max: 2000,
      preferred_move_in_date: '2024-01-01',
      preferred_lease_term: 12,
      booking_type: 'LEASE',
      amenity_wifi: true,
      amenity_laundry: true,
      amenity_parking: true,
      amenity_security: true,
      amenity_gym: true,
      amenity_common_area: true,
      amenity_rooftop: true,
      amenity_bike_storage: true,
      has_vehicles: false,
      has_renters_insurance: true,
      pets: false,
      smoking: false,
      preferred_communication: 'EMAIL',
    }

    const result = collectFormSubmission(mockFormData, 'user123')

    expect(result.applicationId).toBeDefined()
    expect(result.user.email).toBe('test@example.com')

    const stats = DataCollectionManager.getInstance().getStats()
    expect(stats.eventCount).toBe(3) // session start + form transform + form submission
  })

  it('should collect user action', () => {
    collectUserAction('button_click', { buttonId: 'submit' }, 'user123')

    const stats = DataCollectionManager.getInstance().getStats()
    expect(stats.eventCount).toBe(2) // session start + user action
  })

  it('should collect API call', () => {
    collectApiCall('/api/test', 'GET', 200, 150)

    const stats = DataCollectionManager.getInstance().getStats()
    expect(stats.eventCount).toBe(2) // session start + api call
  })

  it('should collect error', () => {
    const error = new Error('Test error')
    collectError(error, 'test_context', 'user123')

    const stats = DataCollectionManager.getInstance().getStats()
    expect(stats.eventCount).toBe(2) // session start + error
  })
})
