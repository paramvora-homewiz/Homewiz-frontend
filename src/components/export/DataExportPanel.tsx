'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EnhancedCard } from '@/components/ui/enhanced-components'
import { apiService } from '../../services/apiService'
import { dataExportService, ExportData, ExportOptions } from '../../services/dataExportService'
import { databaseLogger } from '../../services/databaseLogger'
import {
  Download,
  FileText,
  Database,
  Calendar,
  Filter,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Users,
  Building,
  Home,
  Target,
  UserCheck,
  Activity
} from 'lucide-react'

interface DataExportPanelProps {
  className?: string
}

export default function DataExportPanel({ className = '' }: DataExportPanelProps) {
  const [data, setData] = useState<ExportData>({})
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('json')
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>(['operators', 'buildings', 'rooms', 'leads'])
  const [includeHeaders, setIncludeHeaders] = useState(true)
  const [includeLogs, setIncludeLogs] = useState(false)
  const [customFilename, setCustomFilename] = useState('')
  const [exportStats, setExportStats] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [operators, buildings, rooms, leads] = await Promise.all([
        apiService.getOperators(),
        apiService.getBuildings(),
        apiService.getRooms(),
        apiService.getLeads()
      ])

      const exportData: ExportData = {
        operators,
        buildings,
        rooms,
        leads,
        tenants: [], // Will be populated when tenants endpoint is available
        logs: includeLogs ? databaseLogger.getLogs() : []
      }

      setData(exportData)
      setExportStats(dataExportService.getExportStats(exportData))
    } catch (error) {
      console.error('Error fetching export data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      // Filter data based on selected types
      const filteredData: ExportData = {}
      selectedDataTypes.forEach(dataType => {
        if (data[dataType as keyof ExportData]) {
          filteredData[dataType as keyof ExportData] = data[dataType as keyof ExportData]
        }
      })

      if (includeLogs) {
        filteredData.logs = databaseLogger.getLogs()
      }

      const options: ExportOptions = {
        format: exportFormat,
        filename: customFilename || undefined,
        includeHeaders
      }

      await dataExportService.exportData(filteredData, options)
      
      console.log('✅ Export completed successfully')
    } catch (error) {
      console.error('❌ Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const toggleDataType = (dataType: string) => {
    setSelectedDataTypes(prev => 
      prev.includes(dataType) 
        ? prev.filter(type => type !== dataType)
        : [...prev, dataType]
    )
  }

  const getDataTypeIcon = (dataType: string) => {
    switch (dataType) {
      case 'operators': return <Users className="w-4 h-4" />
      case 'buildings': return <Building className="w-4 h-4" />
      case 'rooms': return <Home className="w-4 h-4" />
      case 'leads': return <Target className="w-4 h-4" />
      case 'tenants': return <UserCheck className="w-4 h-4" />
      case 'logs': return <Activity className="w-4 h-4" />
      default: return <Database className="w-4 h-4" />
    }
  }

  const getDataTypeColor = (dataType: string) => {
    switch (dataType) {
      case 'operators': return 'bg-blue-100 text-blue-800'
      case 'buildings': return 'bg-emerald-100 text-emerald-800'
      case 'rooms': return 'bg-purple-100 text-purple-800'
      case 'leads': return 'bg-pink-100 text-pink-800'
      case 'tenants': return 'bg-orange-100 text-orange-800'
      case 'logs': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv': return '📊'
      case 'json': return '📄'
      case 'pdf': return '📋'
      default: return '📁'
    }
  }

  const dataTypes = [
    { key: 'operators', label: 'Operators', count: data.operators?.length || 0 },
    { key: 'buildings', label: 'Buildings', count: data.buildings?.length || 0 },
    { key: 'rooms', label: 'Rooms', count: data.rooms?.length || 0 },
    { key: 'leads', label: 'Leads', count: data.leads?.length || 0 },
    { key: 'tenants', label: 'Tenants', count: data.tenants?.length || 0 }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading export data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
            <Download className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Data Export</h2>
            <p className="text-gray-600">Export your data in various formats for backup and reporting</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Export Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Selection */}
        <EnhancedCard variant="premium" className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Select Data to Export</h3>
          
          <div className="space-y-3">
            {dataTypes.map(dataType => (
              <div
                key={dataType.key}
                className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedDataTypes.includes(dataType.key)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleDataType(dataType.key)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getDataTypeColor(dataType.key)}`}>
                      {getDataTypeIcon(dataType.key)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{dataType.label}</h4>
                      <p className="text-sm text-gray-600">{dataType.count} records</p>
                    </div>
                  </div>
                  {selectedDataTypes.includes(dataType.key) && (
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  )}
                </div>
              </div>
            ))}

            {/* Include Logs Option */}
            <div
              className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                includeLogs
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setIncludeLogs(!includeLogs)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-800">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Database Logs</h4>
                    <p className="text-sm text-gray-600">{databaseLogger.getLogs().length} log entries</p>
                  </div>
                </div>
                {includeLogs && (
                  <CheckCircle className="w-5 h-5 text-indigo-600" />
                )}
              </div>
            </div>
          </div>
        </EnhancedCard>

        {/* Export Options */}
        <EnhancedCard variant="premium" className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Export Options</h3>
          
          <div className="space-y-4">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
              <div className="grid grid-cols-3 gap-2">
                {(['csv', 'json', 'pdf'] as const).map(format => (
                  <button
                    key={format}
                    onClick={() => setExportFormat(format)}
                    className={`p-3 border rounded-lg text-center transition-all duration-200 ${
                      exportFormat === format
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{getFormatIcon(format)}</div>
                    <div className="text-sm font-medium">{format.toUpperCase()}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Filename */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Custom Filename (optional)</label>
              <input
                type="text"
                value={customFilename}
                onChange={(e) => setCustomFilename(e.target.value)}
                placeholder={`homewiz-export-${new Date().toISOString().split('T')[0]}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Include Headers (CSV only) */}
            {exportFormat === 'csv' && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeHeaders"
                  checked={includeHeaders}
                  onChange={(e) => setIncludeHeaders(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="includeHeaders" className="text-sm text-gray-700">
                  Include column headers
                </label>
              </div>
            )}

            {/* Export Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Export Summary</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Selected data types: {selectedDataTypes.length + (includeLogs ? 1 : 0)}</p>
                <p>Total records: {selectedDataTypes.reduce((sum, type) => {
                  const dataType = dataTypes.find(dt => dt.key === type)
                  return sum + (dataType?.count || 0)
                }, 0) + (includeLogs ? databaseLogger.getLogs().length : 0)}</p>
                <p>Format: {exportFormat.toUpperCase()}</p>
              </div>
            </div>

            {/* Export Button */}
            <Button
              onClick={handleExport}
              disabled={exporting || selectedDataTypes.length === 0}
              className="w-full"
              size="lg"
            >
              {exporting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </>
              )}
            </Button>
          </div>
        </EnhancedCard>
      </div>

      {/* Export History/Tips */}
      <EnhancedCard variant="premium" className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Export Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">CSV Format</h4>
              <p className="text-sm text-gray-600">Best for spreadsheet applications like Excel. Includes all data in tabular format.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Database className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">JSON Format</h4>
              <p className="text-sm text-gray-600">Perfect for data backup and system integration. Preserves data structure and relationships.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">PDF Format</h4>
              <p className="text-sm text-gray-600">Ideal for reports and presentations. Creates a formatted document ready for printing.</p>
            </div>
          </div>
        </div>
      </EnhancedCard>
    </div>
  )
}
