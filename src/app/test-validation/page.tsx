'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  validateBuildingFormData, 
  transformBuildingDataForBackend 
} from '@/lib/backend-sync'

export default function TestValidation() {
  const [testResult, setTestResult] = useState<any>(null)

  const testValidation = () => {
    // Sample form data similar to what BuildingForm would have
    const sampleFormData = {
      building_id: 'BLD_1751400686950_8a7r84h4m',
      building_name: 'Test Building',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip_code: '10001',
      country: 'USA',
      operator_id: 1, // This might be undefined in the form
      total_rooms: 10,
      available_rooms: 5,
      building_type: 'Apartment',
      amenities: [],
      disability_access: true,
      available: true,
      wifi_included: true,
      laundry_onsite: true,
      secure_access: true,
      bike_storage: false,
      rooftop_access: false,
      utilities_included: false,
      fitness_area: false,
      work_study_area: false,
      social_events: false,
      pet_friendly: 'NO_PETS'
    }

    console.log('🧪 Testing validation with sample data:', sampleFormData)

    // Test validation
    const validationResult = validateBuildingFormData(sampleFormData)
    
    // Test transformation
    const transformedData = transformBuildingDataForBackend(sampleFormData)

    const result = {
      originalData: sampleFormData,
      transformedData: transformedData,
      validationResult: validationResult,
      timestamp: new Date().toISOString()
    }

    console.log('🔍 Validation Test Result:', result)
    setTestResult(result)
  }

  const testWithMissingOperator = () => {
    // Test with missing operator_id (common issue)
    const sampleFormData = {
      building_id: 'BLD_1751400686950_8a7r84h4m',
      building_name: 'Test Building',
      address: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip_code: '10001',
      country: 'USA',
      operator_id: undefined, // This is likely the issue
      total_rooms: 10,
      available_rooms: 5,
      building_type: 'Apartment',
      amenities: [],
      disability_access: true,
      available: true
    }

    console.log('🧪 Testing with missing operator_id:', sampleFormData)

    const validationResult = validateBuildingFormData(sampleFormData)
    const transformedData = transformBuildingDataForBackend(sampleFormData)

    const result = {
      originalData: sampleFormData,
      transformedData: transformedData,
      validationResult: validationResult,
      scenario: 'missing_operator',
      timestamp: new Date().toISOString()
    }

    console.log('🔍 Missing Operator Test Result:', result)
    setTestResult(result)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Validation Tester</h1>
          <p className="text-gray-600 mt-2">
            Test building form validation to identify the "1 validation error" issue
          </p>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Test Scenarios</h2>
          <div className="flex gap-4">
            <Button onClick={testValidation}>
              Test Complete Data
            </Button>
            <Button onClick={testWithMissingOperator} variant="outline">
              Test Missing Operator
            </Button>
          </div>
        </Card>

        {testResult && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-lg">Validation Summary</h3>
                <div className={`p-3 rounded ${
                  testResult.validationResult.isValid 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  <p>
                    <strong>Valid:</strong> {testResult.validationResult.isValid ? 'Yes' : 'No'}
                  </p>
                  <p>
                    <strong>Missing Required:</strong> {testResult.validationResult.missingRequired.length} 
                    {testResult.validationResult.missingRequired.length > 0 && 
                      ` (${testResult.validationResult.missingRequired.join(', ')})`
                    }
                  </p>
                  <p>
                    <strong>Errors:</strong> {Object.keys(testResult.validationResult.errors).length}
                    {Object.keys(testResult.validationResult.errors).length > 0 && 
                      ` (${Object.keys(testResult.validationResult.errors).join(', ')})`
                    }
                  </p>
                </div>
              </div>

              {Object.keys(testResult.validationResult.errors).length > 0 && (
                <div>
                  <h3 className="font-medium text-lg">Error Details</h3>
                  <div className="bg-red-50 p-3 rounded">
                    {Object.entries(testResult.validationResult.errors).map(([field, error]) => (
                      <div key={field} className="text-sm">
                        <strong>{field}:</strong> {error as string}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <details className="border rounded p-3">
                <summary className="cursor-pointer font-medium">Raw Data</summary>
                <pre className="text-xs mt-2 overflow-auto">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </details>
            </div>
          </Card>
        )}

        <Card className="p-6 bg-blue-50">
          <h3 className="font-semibold text-blue-800 mb-2">Common Issues</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Missing operator_id (operator not selected)</li>
            <li>• Address fields not filled</li>
            <li>• Required numeric fields are 0 or undefined</li>
            <li>• Field name mismatches between frontend and backend</li>
          </ul>
        </Card>
      </div>
    </div>
  )
}