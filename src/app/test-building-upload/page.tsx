'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import BuildingForm from '@/components/forms/BuildingForm'
import { FormDataProvider } from '@/components/forms/FormDataProvider'
import { databaseService } from '@/lib/supabase/database'
import { transformBuildingDataForBackend } from '@/lib/backend-sync'

export default function TestBuildingUpload() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  const handleSubmit = async (data: any) => {
    setIsLoading(true)
    setTestResult(null)
    
    try {
      console.log('🧪 TEST: Starting building submission test...')
      console.log('📋 Raw form data:', data)
      
      // Transform data for backend
      const transformedData = transformBuildingDataForBackend(data)
      console.log('🔄 Transformed data:', transformedData)
      
      // Create building in Supabase
      const result = await databaseService.buildings.create(transformedData)
      console.log('📤 Supabase response:', result)
      
      if (result.success) {
        setTestResult({
          success: true,
          message: 'Building created successfully!',
          buildingId: result.data?.building_id,
          data: result.data
        })
        
        // Return success response for form to handle media upload
        return {
          success: true,
          data: result.data
        }
      } else {
        setTestResult({
          success: false,
          message: 'Failed to create building',
          error: result.error
        })
        
        return {
          success: false,
          error: result.error?.message || 'Unknown error'
        }
      }
    } catch (error) {
      console.error('❌ TEST ERROR:', error)
      setTestResult({
        success: false,
        message: 'Test failed with exception',
        error
      })
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Test Building Upload</h1>
          <p className="text-gray-600 mt-2">
            Test page to verify building data and media upload to Supabase
          </p>
        </div>

        {testResult && (
          <div className={`mb-8 p-4 rounded-lg ${
            testResult.success ? 'bg-green-100 border-green-500' : 'bg-red-100 border-red-500'
          } border`}>
            <h3 className={`font-semibold ${
              testResult.success ? 'text-green-800' : 'text-red-800'
            }`}>
              {testResult.message}
            </h3>
            {testResult.buildingId && (
              <p className="text-sm text-gray-700 mt-1">
                Building ID: {testResult.buildingId}
              </p>
            )}
            {testResult.error && (
              <pre className="text-xs text-red-700 mt-2 overflow-auto">
                {JSON.stringify(testResult.error, null, 2)}
              </pre>
            )}
            {testResult.data && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-gray-600">
                  View created data
                </summary>
                <pre className="text-xs text-gray-700 mt-2 overflow-auto">
                  {JSON.stringify(testResult.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}

        <FormDataProvider>
          <BuildingForm
            onSubmit={handleSubmit}
            onCancel={() => router.push('/forms')}
            isLoading={isLoading}
          />
        </FormDataProvider>
      </div>
    </div>
  )
}