'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  dataCollectionManager, 
  collectFormSubmission, 
  collectUserAction,
  DataEventType,
  DataPriority 
} from '@/lib/data-collection'
import { 
  dataExportManager, 
  exportToBackend, 
  registerCustomBackend 
} from '@/lib/data-export'
import { dataIntegrationManager, submitForm } from '@/lib/data-integration'
import { authConfigManager, AuthMode, setDemoMode } from '@/lib/auth-config'
import { monitoringManager, trackMetric } from '@/lib/monitoring'
import { ApplicationFormData } from '@/types'
import { Download, Database, Shield, BarChart3, Settings, Play, RefreshCw } from 'lucide-react'

export default function DataCollectionDemo() {
  const [stats, setStats] = useState<any>({})
  const [exportData, setExportData] = useState<string>('')
  const [authMode, setAuthMode] = useState<AuthMode>(AuthMode.DEMO)
  const [monitoringData, setMonitoringData] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    updateStats()
    const interval = setInterval(updateStats, 2000)
    return () => clearInterval(interval)
  }, [])

  const updateStats = () => {
    setStats(dataIntegrationManager.getStats())
    setMonitoringData(monitoringManager.exportMonitoringData())
  }

  const handleCollectSampleData = () => {
    collectUserAction('demo_button_click', {
      buttonType: 'sample_data',
      timestamp: new Date().toISOString(),
    })

    // Collect various types of events
    dataCollectionManager.collectEvent({
      type: DataEventType.USER_ACTION,
      priority: DataPriority.MEDIUM,
      source: 'demo_component',
      data: {
        action: 'sample_data_generation',
        eventCount: 5,
      }
    })

    // Track some metrics
    trackMetric('demo_interactions', 1, { component: 'data_collection_demo' })
    trackMetric('page_engagement', Math.random() * 100, { type: 'demo' })

    updateStats()
  }

  const handleSubmitSampleForm = async () => {
    setIsLoading(true)
    
    const sampleFormData: ApplicationFormData = {
      firstName: 'Demo',
      lastName: 'User',
      email: 'demo@homewiz.com',
      phone: '+1234567890',
      occupation: 'Software Engineer',
      budget_min: 1500,
      budget_max: 2500,
      preferred_move_in_date: '2024-06-01',
      preferred_lease_term: 12,
      preferred_communication: 'EMAIL',
      booking_type: 'LEASE',
      amenity_wifi: true,
      amenity_laundry: true,
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
    }

    try {
      const result = await submitForm(sampleFormData, [], 'demo-user', ['rest'])
      console.log('Form submission result:', result)
      
      collectUserAction('demo_form_submitted', {
        success: result.status === 'success',
        applicationId: result.applicationId,
      })
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsLoading(false)
      updateStats()
    }
  }

  const handleExportData = (format: 'json' | 'csv' | 'xml') => {
    const exported = dataCollectionManager.exportData(format)
    setExportData(exported)
    
    collectUserAction('demo_data_exported', {
      format,
      dataSize: exported.length,
    })

    // Create download
    const blob = new Blob([exported], { 
      type: format === 'json' ? 'application/json' : 
           format === 'csv' ? 'text/csv' : 'application/xml' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `homewiz-data.${format}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleToggleAuthMode = () => {
    const newMode = authMode === AuthMode.DEMO ? AuthMode.CLERK : AuthMode.DEMO
    setAuthMode(newMode)
    authConfigManager.switchMode(newMode)
    
    collectUserAction('demo_auth_mode_toggled', {
      previousMode: authMode,
      newMode,
    })
  }

  const handleConfigureCustomBackend = () => {
    registerCustomBackend('demo_webhook', {
      endpoint: 'https://webhook.site/your-unique-url',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'homewiz-demo',
      },
      transformData: (data) => ({
        event: 'form_submission',
        timestamp: new Date().toISOString(),
        data: data,
      }),
    })

    collectUserAction('demo_backend_configured', {
      backendName: 'demo_webhook',
    })
  }

  const handleClearData = () => {
    dataIntegrationManager.clearCache()
    setExportData('')
    updateStats()
    
    collectUserAction('demo_data_cleared', {
      timestamp: new Date().toISOString(),
    })
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          HomeWiz Data Collection Demo
        </h1>
        <p className="text-gray-600">
          Explore the production-ready data collection, authentication, and monitoring features
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Events Collected</p>
              <p className="text-2xl font-bold">{stats.dataCollection?.eventCount || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Cache Size</p>
              <p className="text-2xl font-bold">{stats.apiClient?.size || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Auth Mode</p>
              <Badge variant={authMode === AuthMode.DEMO ? 'secondary' : 'default'}>
                {authMode}
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Session Duration</p>
              <p className="text-2xl font-bold">
                {Math.round((stats.dataCollection?.sessionDuration || 0) / 1000)}s
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Demo Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Data Collection
          </h3>
          <div className="space-y-3">
            <Button 
              onClick={handleCollectSampleData}
              className="w-full"
              variant="outline"
            >
              <Play className="w-4 h-4 mr-2" />
              Collect Sample Data
            </Button>
            
            <Button 
              onClick={handleSubmitSampleForm}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              Submit Sample Form
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Download className="w-5 h-5 mr-2" />
            Data Export
          </h3>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <Button 
                onClick={() => handleExportData('json')}
                variant="outline"
                size="sm"
              >
                JSON
              </Button>
              <Button 
                onClick={() => handleExportData('csv')}
                variant="outline"
                size="sm"
              >
                CSV
              </Button>
              <Button 
                onClick={() => handleExportData('xml')}
                variant="outline"
                size="sm"
              >
                XML
              </Button>
            </div>
            
            <Button 
              onClick={handleConfigureCustomBackend}
              className="w-full"
              variant="outline"
            >
              Configure Webhook
            </Button>
          </div>
        </Card>
      </div>

      {/* Authentication Demo */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Authentication Management
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Current Mode: {authMode}</p>
            <p className="text-xs text-gray-500">
              {authMode === AuthMode.DEMO 
                ? 'Demo mode - authentication disabled for testing' 
                : 'Clerk mode - production authentication enabled'
              }
            </p>
          </div>
          <Button onClick={handleToggleAuthMode} variant="outline">
            Switch to {authMode === AuthMode.DEMO ? 'Clerk' : 'Demo'}
          </Button>
        </div>
      </Card>

      {/* Monitoring Data */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2" />
          Performance Monitoring
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Page Load Time</p>
            <p className="font-semibold">
              {Math.round(monitoringData.performance?.pageLoadTime || 0)}ms
            </p>
          </div>
          <div>
            <p className="text-gray-600">Error Rate</p>
            <p className="font-semibold">
              {(monitoringData.performance?.errorRate || 0).toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-gray-600">Memory Usage</p>
            <p className="font-semibold">
              {Math.round((monitoringData.performance?.memoryUsage || 0) / 1024 / 1024)}MB
            </p>
          </div>
          <div>
            <p className="text-gray-600">Satisfaction Score</p>
            <p className="font-semibold">
              {Math.round(monitoringData.performance?.userSatisfactionScore || 0)}/100
            </p>
          </div>
        </div>
      </Card>

      {/* Export Preview */}
      {exportData && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Exported Data Preview</h3>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-64">
            {exportData.substring(0, 1000)}
            {exportData.length > 1000 && '...\n[Data truncated for display]'}
          </pre>
        </Card>
      )}

      {/* Clear Data */}
      <div className="text-center">
        <Button onClick={handleClearData} variant="outline" className="text-red-600">
          Clear All Data
        </Button>
      </div>
    </div>
  )
}
