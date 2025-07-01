/**
 * Test script to validate form validation improvements
 */

import { describe, it, expect } from 'vitest'
import { validateTenantFormData } from '../src/lib/backend-sync'

// Test data scenarios
const testCases = [
  {
    name: 'Empty form data',
    data: {},
    expectedErrors: ['tenant_name', 'tenant_email', 'tenant_nationality', 'room_id', 'building_id', 'operator_id', 'booking_type', 'lease_start_date', 'lease_end_date', 'deposit_amount']
  },
  {
    name: 'Partial valid data',
    data: {
      tenant_name: 'John Doe',
      tenant_email: 'john@example.com',
      tenant_nationality: 'American'
    },
    expectedErrors: ['room_id', 'building_id', 'operator_id', 'booking_type', 'lease_start_date', 'lease_end_date', 'deposit_amount']
  },
  {
    name: 'Invalid email format',
    data: {
      tenant_name: 'John Doe',
      tenant_email: 'invalid-email',
      tenant_nationality: 'American'
    },
    expectedErrors: ['tenant_email', 'room_id', 'building_id', 'operator_id', 'booking_type', 'lease_start_date', 'lease_end_date', 'deposit_amount']
  },
  {
    name: 'Complete valid data',
    data: {
      tenant_name: 'John Doe',
      tenant_email: 'john@example.com',
      tenant_nationality: 'American',
      room_id: 'ROOM_001',
      building_id: 'BLDG_001',
      operator_id: 1,
      booking_type: 'LEASE',
      lease_start_date: '2024-01-01',
      lease_end_date: '2024-12-31',
      deposit_amount: 1000,
      phone: '+1 (555) 123-4567'
    },
    expectedErrors: []
  }
]

describe('Form Validation Improvements', () => {
  testCases.forEach((testCase) => {
    it(`should handle ${testCase.name}`, () => {
      const result = validateTenantFormData(testCase.data)

      // Debug output for failing tests
      if (testCase.name === 'Complete valid data' && !result.isValid) {
        console.log('Debug - Complete valid data validation failed:')
        console.log('Errors:', result.errors)
        console.log('Missing required:', result.missingRequired)
        console.log('Input data:', testCase.data)
      }

      // Check if expected errors match actual errors
      const actualErrors = Object.keys(result.errors)
      const missingExpected = testCase.expectedErrors.filter(err => !actualErrors.includes(err))
      const unexpectedErrors = actualErrors.filter(err => !testCase.expectedErrors.includes(err))

      expect(missingExpected).toHaveLength(0)
      expect(unexpectedErrors).toHaveLength(0)

      if (testCase.expectedErrors.length === 0) {
        expect(result.isValid).toBe(true)
      } else {
        expect(result.isValid).toBe(false)
      }
    })
  })

  it('should provide comprehensive validation features', () => {
    // Test that validation system has all required features
    const emptyResult = validateTenantFormData({})

    expect(emptyResult).toHaveProperty('isValid')
    expect(emptyResult).toHaveProperty('errors')
    expect(emptyResult).toHaveProperty('missingRequired')
    expect(typeof emptyResult.isValid).toBe('boolean')
    expect(typeof emptyResult.errors).toBe('object')
    expect(Array.isArray(emptyResult.missingRequired)).toBe(true)
  })
})
