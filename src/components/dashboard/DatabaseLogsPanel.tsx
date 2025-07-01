'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EnhancedCard } from '@/components/ui/enhanced-components'
import { databaseLogger, LogEntry } from '../../services/databaseLogger'
import {
  Database,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Download,
  Filter,
  Search,
  Calendar,
  BarChart3,
  Activity
} from 'lucide-react'

interface DatabaseLogsPanelProps {
  className?: string
}

export default function DatabaseLogsPanel({ className = '' }: DatabaseLogsPanelProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([])
  const [stats, setStats] = useState<any>({})
  const [filterTable, setFilterTable] = useState<string>('all')
  const [filterOperation, setFilterOperation] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Refresh logs from the logger
  const refreshLogs = () => {
    setIsRefreshing(true)
    const allLogs = databaseLogger.getLogs()
    const logStats = databaseLogger.getStats()
    
    setLogs(allLogs)
    setStats(logStats)
    setIsRefreshing(false)
  }

  // Filter logs based on current filters
  useEffect(() => {
    let filtered = logs

    // Filter by table
    if (filterTable !== 'all') {
      filtered = filtered.filter(log => log.operation.table === filterTable)
    }

    // Filter by operation
    if (filterOperation !== 'all') {
      filtered = filtered.filter(log => log.operation.operation === filterOperation)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.operation.table.toLowerCase().includes(searchTerm.toLowerCase()) ||
        JSON.stringify(log.operation.data).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.error && log.error.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    setFilteredLogs(filtered)
  }, [logs, filterTable, filterOperation, searchTerm])

  // Auto-refresh logs every 2 seconds
  useEffect(() => {
    refreshLogs()
    const interval = setInterval(refreshLogs, 2000)
    return () => clearInterval(interval)
  }, [])

  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case 'INSERT': return <Plus className="w-4 h-4" />
      case 'UPDATE': return <Edit className="w-4 h-4" />
      case 'DELETE': return <Trash2 className="w-4 h-4" />
      default: return <Database className="w-4 h-4" />
    }
  }

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case 'INSERT': return 'from-green-500 to-emerald-500'
      case 'UPDATE': return 'from-blue-500 to-cyan-500'
      case 'DELETE': return 'from-red-500 to-pink-500'
      default: return 'from-gray-500 to-slate-500'
    }
  }

  const getTableColor = (table: string) => {
    switch (table) {
      case 'operators': return 'bg-blue-100 text-blue-800'
      case 'buildings': return 'bg-emerald-100 text-emerald-800'
      case 'rooms': return 'bg-purple-100 text-purple-800'
      case 'tenants': return 'bg-orange-100 text-orange-800'
      case 'leads': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const exportLogs = () => {
    const dataStr = databaseLogger.exportLogs()
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `database-logs-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const clearLogs = () => {
    if (confirm('Are you sure you want to clear all logs?')) {
      databaseLogger.clearLogs()
      refreshLogs()
    }
  }

  const uniqueTables = Array.from(new Set(logs.map(log => log.operation.table)))

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Database Activity Logs</h2>
            <p className="text-gray-600">Real-time tracking of all database operations</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={refreshLogs}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={exportLogs} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={clearLogs} variant="outline" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <EnhancedCard variant="premium" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Operations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
            </div>
          </div>
        </EnhancedCard>

        <EnhancedCard variant="premium" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(stats.successRate || 0)}%</p>
            </div>
          </div>
        </EnhancedCard>

        <EnhancedCard variant="premium" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Inserts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.byOperation?.INSERT || 0}</p>
            </div>
          </div>
        </EnhancedCard>

        <EnhancedCard variant="premium" className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
              <Edit className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Updates</p>
              <p className="text-2xl font-bold text-gray-900">{stats.byOperation?.UPDATE || 0}</p>
            </div>
          </div>
        </EnhancedCard>
      </div>

      {/* Filters */}
      <EnhancedCard variant="premium" className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            value={filterTable}
            onChange={(e) => setFilterTable(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Tables</option>
            {uniqueTables.map(table => (
              <option key={table} value={table}>{table}</option>
            ))}
          </select>

          <select
            value={filterOperation}
            onChange={(e) => setFilterOperation(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Operations</option>
            <option value="INSERT">INSERT</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
          </select>

          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm w-48"
            />
          </div>

          <div className="text-sm text-gray-500">
            Showing {filteredLogs.length} of {logs.length} logs
          </div>
        </div>
      </EnhancedCard>

      {/* Logs List */}
      <EnhancedCard variant="premium" className="p-6">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No database operations logged yet</p>
                <p className="text-sm">Operations will appear here when you add data</p>
              </div>
            ) : (
              filteredLogs.map((log, index) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 bg-gradient-to-r ${getOperationColor(log.operation.operation)} rounded-lg text-white`}>
                        {getOperationIcon(log.operation.operation)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getTableColor(log.operation.table)}>
                            {log.operation.table}
                          </Badge>
                          <span className="text-sm font-medium text-gray-900">
                            {log.operation.operation}
                          </span>
                          {log.operation.id && (
                            <span className="text-xs text-gray-500">
                              ID: {log.operation.id}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          <pre className="whitespace-pre-wrap font-mono text-xs bg-gray-100 p-2 rounded">
                            {JSON.stringify(log.operation.data, null, 2)}
                          </pre>
                        </div>
                        {log.error && (
                          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            <strong>Error:</strong> {log.error}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {log.success ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <Clock className="w-3 h-3" />
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </EnhancedCard>
    </div>
  )
}
