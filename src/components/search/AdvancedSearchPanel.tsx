'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EnhancedCard } from '@/components/ui/enhanced-components'
import { getBuildings, getRooms, getOperators, getTenants, getLeads } from '../../lib/api-client'
import {
  Search,
  Filter,
  X,
  Users,
  Building,
  Home,
  UserCheck,
  Target,
  SortAsc,
  SortDesc,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'

interface SearchData {
  operators: any[]
  buildings: any[]
  rooms: any[]
  leads: any[]
  tenants: any[]
}

interface SearchFilters {
  searchTerm: string
  dataType: 'all' | 'operators' | 'buildings' | 'rooms' | 'leads' | 'tenants'
  status?: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

interface SearchResult {
  id: string
  type: string
  title: string
  subtitle: string
  data: any
  matchedFields: string[]
}

export default function AdvancedSearchPanel() {
  const [data, setData] = useState<SearchData>({
    operators: [],
    buildings: [],
    rooms: [],
    leads: [],
    tenants: []
  })
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    dataType: 'all',
    sortBy: 'relevance',
    sortOrder: 'desc'
  })
  const [loading, setLoading] = useState(true)
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [operators, buildings, rooms, leads] = await Promise.all([
        getOperators(),
        getBuildings(),
        getRooms(),
        getLeads()
      ])

      setData({
        operators,
        buildings,
        rooms,
        leads,
        tenants: [] // Will be populated when tenants endpoint is available
      })
    } catch (error) {
      console.error('Error fetching search data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Search function
  const searchInObject = (obj: any, term: string): string[] => {
    const matchedFields: string[] = []
    const searchTerm = term.toLowerCase()

    const searchRecursive = (value: any, path: string = '') => {
      if (typeof value === 'string' && value.toLowerCase().includes(searchTerm)) {
        matchedFields.push(path || 'value')
      } else if (typeof value === 'number' && value.toString().includes(searchTerm)) {
        matchedFields.push(path || 'value')
      } else if (typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([key, val]) => {
          searchRecursive(val, path ? `${path}.${key}` : key)
        })
      }
    }

    searchRecursive(obj)
    return matchedFields
  }

  // Generate search results
  const searchResults = useMemo(() => {
    if (!filters.searchTerm && filters.dataType === 'all') {
      return []
    }

    const results: SearchResult[] = []

    // Search operators
    if (filters.dataType === 'all' || filters.dataType === 'operators') {
      data.operators.forEach(operator => {
        const matchedFields = filters.searchTerm ? searchInObject(operator, filters.searchTerm) : ['all']
        if (matchedFields.length > 0 || !filters.searchTerm) {
          results.push({
            id: `operator-${operator.operator_id}`,
            type: 'operator',
            title: operator.name || `Operator ${operator.operator_id}`,
            subtitle: `${operator.role || 'Unknown Role'} • ${operator.email || 'No email'}`,
            data: operator,
            matchedFields
          })
        }
      })
    }

    // Search buildings
    if (filters.dataType === 'all' || filters.dataType === 'buildings') {
      data.buildings.forEach(building => {
        const matchedFields = filters.searchTerm ? searchInObject(building, filters.searchTerm) : ['all']
        if (matchedFields.length > 0 || !filters.searchTerm) {
          results.push({
            id: `building-${building.building_id}`,
            type: 'building',
            title: building.building_name || building.building_id,
            subtitle: `${building.area || 'Unknown Area'} • ${building.total_rooms || 0} rooms`,
            data: building,
            matchedFields
          })
        }
      })
    }

    // Search rooms
    if (filters.dataType === 'all' || filters.dataType === 'rooms') {
      data.rooms.forEach(room => {
        const matchedFields = filters.searchTerm ? searchInObject(room, filters.searchTerm) : ['all']
        if (matchedFields.length > 0 || !filters.searchTerm) {
          const building = data.buildings.find(b => b.building_id === room.building_id)
          results.push({
            id: `room-${room.room_id}`,
            type: 'room',
            title: `Room ${room.room_number || room.room_id}`,
            subtitle: `${building?.building_name || 'Unknown Building'} • ${room.status} • $${room.private_room_rent || 0}`,
            data: room,
            matchedFields
          })
        }
      })
    }

    // Search leads
    if (filters.dataType === 'all' || filters.dataType === 'leads') {
      data.leads.forEach(lead => {
        const matchedFields = filters.searchTerm ? searchInObject(lead, filters.searchTerm) : ['all']
        if (matchedFields.length > 0 || !filters.searchTerm) {
          results.push({
            id: `lead-${lead.lead_id}`,
            type: 'lead',
            title: lead.email || `Lead ${lead.lead_id}`,
            subtitle: `${lead.status || 'Unknown Status'} • ${lead.visa_status || 'Unknown Visa Status'}`,
            data: lead,
            matchedFields
          })
        }
      })
    }

    // Sort results
    return results.sort((a, b) => {
      if (filters.sortBy === 'relevance') {
        return filters.sortOrder === 'desc' 
          ? b.matchedFields.length - a.matchedFields.length
          : a.matchedFields.length - b.matchedFields.length
      } else if (filters.sortBy === 'title') {
        return filters.sortOrder === 'desc'
          ? b.title.localeCompare(a.title)
          : a.title.localeCompare(b.title)
      } else if (filters.sortBy === 'type') {
        return filters.sortOrder === 'desc'
          ? b.type.localeCompare(a.type)
          : a.type.localeCompare(b.type)
      }
      return 0
    })
  }, [data, filters])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'operator': return <Users className="w-4 h-4" />
      case 'building': return <Building className="w-4 h-4" />
      case 'room': return <Home className="w-4 h-4" />
      case 'lead': return <Target className="w-4 h-4" />
      case 'tenant': return <UserCheck className="w-4 h-4" />
      default: return <Search className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'operator': return 'bg-blue-100 text-blue-800'
      case 'building': return 'bg-emerald-100 text-emerald-800'
      case 'room': return 'bg-purple-100 text-purple-800'
      case 'lead': return 'bg-pink-100 text-pink-800'
      case 'tenant': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const exportResults = () => {
    const dataStr = JSON.stringify(searchResults, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `search-results-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading search data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Advanced Search</h1>
              <p className="text-gray-600">Search and filter across all your property management data</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={fetchData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportResults} variant="outline" size="sm" disabled={searchResults.length === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <EnhancedCard variant="premium" className="p-6">
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search across all data types..."
                  value={filters.searchTerm}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {filters.searchTerm && (
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, searchTerm: '' }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>

                <select
                  value={filters.dataType}
                  onChange={(e) => setFilters(prev => ({ ...prev, dataType: e.target.value as any }))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="operators">Operators</option>
                  <option value="buildings">Buildings</option>
                  <option value="rooms">Rooms</option>
                  <option value="leads">Leads</option>
                  <option value="tenants">Tenants</option>
                </select>

                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="relevance">Sort by Relevance</option>
                  <option value="title">Sort by Title</option>
                  <option value="type">Sort by Type</option>
                </select>

                <button
                  onClick={() => setFilters(prev => ({ 
                    ...prev, 
                    sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
                  }))}
                  className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                >
                  {filters.sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  {filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </button>

                <div className="text-sm text-gray-500">
                  {searchResults.length} results found
                </div>
              </div>
            </div>
          </EnhancedCard>
        </motion.div>

        {/* Results */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Results List */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <EnhancedCard variant="premium" className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Search Results</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  <AnimatePresence>
                    {searchResults.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No results found</p>
                        <p className="text-sm">Try adjusting your search terms or filters</p>
                      </div>
                    ) : (
                      searchResults.map((result, index) => (
                        <motion.div
                          key={result.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                            selectedResult?.id === result.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedResult(result)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${getTypeColor(result.type)}`}>
                                {getTypeIcon(result.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-900">{result.title}</h4>
                                  <Badge className={getTypeColor(result.type)}>
                                    {result.type}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{result.subtitle}</p>
                                {result.matchedFields.length > 0 && result.matchedFields[0] !== 'all' && (
                                  <div className="flex flex-wrap gap-1">
                                    {result.matchedFields.slice(0, 3).map((field, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {field}
                                      </Badge>
                                    ))}
                                    {result.matchedFields.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{result.matchedFields.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button className="p-1 text-gray-400 hover:text-blue-600">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-green-600">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-red-600">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </EnhancedCard>
            </motion.div>
          </div>

          {/* Detail Panel */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <EnhancedCard variant="premium" className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Details</h3>
                {selectedResult ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${getTypeColor(selectedResult.type)}`}>
                        {getTypeIcon(selectedResult.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{selectedResult.title}</h4>
                        <p className="text-sm text-gray-600">{selectedResult.subtitle}</p>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <h5 className="font-medium text-gray-900 mb-2">Raw Data</h5>
                      <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-64">
                        {JSON.stringify(selectedResult.data, null, 2)}
                      </pre>
                    </div>
                    {selectedResult.matchedFields.length > 0 && selectedResult.matchedFields[0] !== 'all' && (
                      <div className="border-t pt-4">
                        <h5 className="font-medium text-gray-900 mb-2">Matched Fields</h5>
                        <div className="flex flex-wrap gap-1">
                          {selectedResult.matchedFields.map((field, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {field}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Select a result to view details</p>
                  </div>
                )}
              </EnhancedCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
