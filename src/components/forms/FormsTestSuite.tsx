'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { validateForm } from '@/lib/form-validation'
import { OperatorFormData, BuildingFormData, RoomFormData, TenantFormData, LeadFormData } from '@/types'

interface TestResult {
  formType: string
  testName: string
  passed: boolean
  errors: string[]
  warnings: string[]
}

export default function FormsTestSuite() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  // Test data samples
  const validOperatorData: OperatorFormData = {
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1 (555) 123-4567',
    role: 'Senior Leasing Agent',
    active: true,
    operator_type: 'LEASING_AGENT',
    notification_preferences: 'EMAIL',
    emergency_contact: false,
    calendar_sync_enabled: false,
    date_joined: '2024-01-15',
    working_hours: '{"monday": {"start": "09:00", "end": "17:00", "enabled": true}}'
  }

  const invalidOperatorData: OperatorFormData = {
    name: '',
    email: 'invalid-email',
    phone: 'abc123',
    role: '',
    active: true,
    operator_type: 'LEASING_AGENT',
    notification_preferences: 'EMAIL',
    emergency_contact: false,
    calendar_sync_enabled: false,
    permissions: 'invalid-json'
  }

  const validBuildingData: BuildingFormData = {
    building_name: 'Sunset Apartments',
    full_address: '123 Main Street, Anytown, ST 12345',
    operator_id: 1,
    available: true,
    street: '123 Main Street',
    city: 'Anytown',
    state: 'ST',
    zip: '12345',
    floors: 5,
    total_rooms: 50,
    total_bathrooms: 25,
    year_built: 2020,
    wifi_included: true,
    laundry_onsite: true,
    secure_access: true,
    bike_storage: false,
    rooftop_access: true,
    utilities_included: false,
    fitness_area: true,
    work_study_area: true,
    social_events: false,
    disability_access: true,
    virtual_tour_url: 'https://example.com/tour'
  }

  const invalidBuildingData: BuildingFormData = {
    building_name: '',
    available: true,
    year_built: 1700, // Too old
    last_renovation: 2025, // Future date
    floors: 0, // Invalid
    total_rooms: -5, // Invalid
    wifi_included: false,
    laundry_onsite: false,
    secure_access: false,
    bike_storage: false,
    rooftop_access: false,
    utilities_included: false,
    fitness_area: false,
    work_study_area: false,
    social_events: false,
    disability_access: false,
    virtual_tour_url: 'not-a-url'
  }

  const validRoomData: RoomFormData = {
    room_number: '101',
    building_id: 'bldg_123',
    ready_to_rent: true,
    status: 'AVAILABLE',
    active_tenants: 0,
    maximum_people_in_room: 2,
    private_room_rent: 800,
    shared_room_rent_2: 500,
    floor_number: 1,
    bed_count: 1,
    bathroom_type: 'PRIVATE',
    bed_size: 'QUEEN',
    bed_type: 'STANDARD',
    sq_footage: 120,
    mini_fridge: true,
    sink: false,
    bedding_provided: true,
    work_desk: true,
    work_chair: true,
    heating: true,
    air_conditioning: true,
    cable_tv: false,
    furnished: true,
    available_from: '2024-02-01'
  }

  const invalidRoomData: RoomFormData = {
    room_number: '',
    building_id: '',
    ready_to_rent: true,
    status: 'AVAILABLE',
    active_tenants: 0,
    maximum_people_in_room: 0, // Invalid
    private_room_rent: -100, // Invalid
    floor_number: 0, // Invalid
    bed_count: 0, // Invalid
    mini_fridge: false,
    sink: false,
    bedding_provided: false,
    work_desk: false,
    work_chair: false,
    heating: false,
    air_conditioning: false,
    cable_tv: false,
    furnished: false,
    virtual_tour_url: 'invalid-url'
  }

  const validTenantData: TenantFormData = {
    tenant_name: 'Jane Doe',
    tenant_email: 'jane.doe@example.com',
    phone: '+1 (555) 987-6543',
    room_id: 'room_123',
    building_id: 'bldg_123',
    status: 'ACTIVE',
    lease_start_date: '2024-01-01',
    lease_end_date: '2024-12-31',
    deposit_amount: 1000,
    payment_reminders_enabled: true,
    communication_preferences: 'EMAIL',
    account_status: 'ACTIVE',
    has_pets: false,
    has_vehicles: true,
    vehicle_details: '2020 Honda Civic, License: ABC123',
    has_renters_insurance: true,
    insurance_details: 'State Farm Policy #12345'
  }

  const invalidTenantData: TenantFormData = {
    tenant_name: '',
    tenant_email: 'invalid-email',
    phone: 'abc123',
    status: 'ACTIVE',
    lease_start_date: '2024-12-31',
    lease_end_date: '2024-01-01', // End before start
    deposit_amount: -500, // Invalid
    payment_reminders_enabled: true,
    communication_preferences: 'EMAIL',
    account_status: 'ACTIVE',
    has_pets: false,
    has_vehicles: false,
    has_renters_insurance: false
  }

  const validLeadData: LeadFormData = {
    email: 'prospect@example.com',
    status: 'INTERESTED',
    interaction_count: 3,
    lead_score: 75,
    preferred_communication: 'EMAIL',
    budget_min: 600,
    budget_max: 1200,
    preferred_move_in_date: '2024-03-01',
    preferred_lease_term: 12,
    visa_status: 'H1-B Visa',
    lead_source: 'WEBSITE',
    rooms_interested: '["room_123", "room_456"]',
    showing_dates: '["2024-02-15", "2024-02-20"]'
  }

  const invalidLeadData: LeadFormData = {
    email: 'invalid-email',
    status: 'EXPLORING',
    interaction_count: 0,
    lead_score: 150, // Invalid (over 100)
    preferred_communication: 'EMAIL',
    budget_min: 1500,
    budget_max: 800, // Max less than min
    preferred_move_in_date: '2023-01-01', // Past date
    planned_move_in: '2024-06-01',
    planned_move_out: '2024-05-01', // Before move-in
    rooms_interested: 'invalid-json',
    showing_dates: 'invalid-json'
  }

  const runTests = async () => {
    setIsRunning(true)
    const results: TestResult[] = []

    // Test valid data
    const testCases = [
      { formType: 'operator', testName: 'Valid Operator Data', data: validOperatorData },
      { formType: 'building', testName: 'Valid Building Data', data: validBuildingData },
      { formType: 'room', testName: 'Valid Room Data', data: validRoomData },
      { formType: 'tenant', testName: 'Valid Tenant Data', data: validTenantData },
      { formType: 'lead', testName: 'Valid Lead Data', data: validLeadData },
      
      // Test invalid data
      { formType: 'operator', testName: 'Invalid Operator Data', data: invalidOperatorData },
      { formType: 'building', testName: 'Invalid Building Data', data: invalidBuildingData },
      { formType: 'room', testName: 'Invalid Room Data', data: invalidRoomData },
      { formType: 'tenant', testName: 'Invalid Tenant Data', data: invalidTenantData },
      { formType: 'lead', testName: 'Invalid Lead Data', data: invalidLeadData }
    ]

    for (const testCase of testCases) {
      const validation = validateForm(testCase.formType, testCase.data)
      const isValidTest = testCase.testName.includes('Valid')
      
      results.push({
        formType: testCase.formType,
        testName: testCase.testName,
        passed: isValidTest ? validation.isValid : !validation.isValid,
        errors: Object.values(validation.errors),
        warnings: Object.values(validation.warnings)
      })

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    setTestResults(results)
    setIsRunning(false)
  }

  const getTestStatusBadge = (passed: boolean) => {
    return passed ? (
      <Badge className="bg-green-100 text-green-800">✅ PASS</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800">❌ FAIL</Badge>
    )
  }

  const passedTests = testResults.filter(r => r.passed).length
  const totalTests = testResults.length

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Forms Test Suite
        </h1>
        <p className="text-gray-600 mb-6">
          Comprehensive validation testing for all form components
        </p>
        
        <Button 
          onClick={runTests} 
          disabled={isRunning}
          className="mb-6"
        >
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </Button>

        {testResults.length > 0 && (
          <div className="mb-6">
            <div className="text-2xl font-bold">
              {passedTests}/{totalTests} Tests Passed
            </div>
            <div className="text-gray-600">
              Success Rate: {Math.round((passedTests / totalTests) * 100)}%
            </div>
          </div>
        )}
      </div>

      {testResults.length > 0 && (
        <div className="space-y-4">
          {['operator', 'building', 'room', 'tenant', 'lead'].map(formType => {
            const formTests = testResults.filter(r => r.formType === formType)
            const formPassed = formTests.filter(r => r.passed).length
            const formTotal = formTests.length

            return (
              <Card key={formType} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold capitalize">
                    {formType} Form Tests
                  </h2>
                  <Badge variant="outline">
                    {formPassed}/{formTotal} Passed
                  </Badge>
                </div>

                <div className="space-y-3">
                  {formTests.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{result.testName}</h3>
                        {getTestStatusBadge(result.passed)}
                      </div>

                      {result.errors.length > 0 && (
                        <div className="mb-2">
                          <div className="text-sm font-medium text-red-700 mb-1">Errors:</div>
                          <ul className="text-sm text-red-600 list-disc list-inside">
                            {result.errors.map((error, i) => (
                              <li key={i}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {result.warnings.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-yellow-700 mb-1">Warnings:</div>
                          <ul className="text-sm text-yellow-600 list-disc list-inside">
                            {result.warnings.map((warning, i) => (
                              <li key={i}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Test Coverage Summary */}
      {testResults.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Test Coverage Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">5</div>
              <div className="text-sm text-gray-600">Form Types Tested</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{testResults.filter(r => r.errors.length === 0).length}</div>
              <div className="text-sm text-gray-600">Error-Free Tests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{testResults.filter(r => r.warnings.length > 0).length}</div>
              <div className="text-sm text-gray-600">Tests with Warnings</div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
