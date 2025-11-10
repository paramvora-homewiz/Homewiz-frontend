'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EnhancedCard, StatusBadge, EnhancedInput, EnhancedSelect } from '@/components/ui/enhanced-components'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { buildingsService, roomsService, tenantsService, operatorsService } from '@/lib/supabase/database'
import type { Building, Room, Tenant, Operator } from '@/lib/supabase/types'
import {
  Database,
  Building as BuildingIcon,
  Home,
  Users,
  UserCheck,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
  Trash2,
  MoreVertical,
  Calendar,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import {
  EditBuildingModal,
  EditRoomModal,
  EditTenantModal,
  EditOperatorModal
} from '@/components/admin'
import { ViewBuildingModal } from '@/components/admin/ViewBuildingModal'
import { ViewRoomModal } from '@/components/admin/ViewRoomModal'
import { ViewTenantModal } from '@/components/admin/ViewTenantModal'
import { ViewOperatorModal } from '@/components/admin/ViewOperatorModal'
import { showSuccessMessage, showWarningMessage } from '@/lib/error-handler'
import { Tooltip } from '@/components/ui/tooltip'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

type TabType = 'buildings' | 'rooms' | 'tenants' | 'operators'

interface DataManagementPageProps {}

interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

interface FilterConfig {
  [key: string]: string | number | boolean
}

const ITEMS_PER_PAGE = 10

export default function DataManagementPage({}: DataManagementPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('buildings')
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: '', direction: 'asc' })
  const [filters, setFilters] = useState<FilterConfig>({})
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  
  // Data states
  const [buildings, setBuildings] = useState<Building[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [operators, setOperators] = useState<Operator[]>([])
  
  // Total counts for stats
  const [totalCounts, setTotalCounts] = useState({
    buildings: 0,
    rooms: 0,
    tenants: 0,
    activeTenants: 0,
    operators: 0,
    activeOperators: 0
  })
  
  // Action menu states
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showActionMenu, setShowActionMenu] = useState(false)
  
  // Edit modal states
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null)
  const [editingRoom, setEditingRoom] = useState<Room | null>(null)
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)
  const [editingOperator, setEditingOperator] = useState<Operator | null>(null)
  
  // View modal states
  const [viewingBuilding, setViewingBuilding] = useState<Building | null>(null)
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null)
  const [viewingTenant, setViewingTenant] = useState<Tenant | null>(null)
  const [viewingOperator, setViewingOperator] = useState<Operator | null>(null)

  // Fetch total counts for stats (independent of active tab and pagination)
  const fetchTotalCounts = async () => {
    try {
      // Fetch all counts in parallel for better performance via Supabase direct access
      const [buildingsResponse, roomsResponse, tenantsResponse, activeTenantsResponse, operatorsResponse, activeOperatorsResponse] = await Promise.all([
        // Total buildings
        buildingsService.getAll({ limit: 1 }),
        // Total rooms
        roomsService.getAll({ limit: 1 }),
        // Total tenants
        tenantsService.getAll({ limit: 1 }),
        // Active tenants
        tenantsService.getAll({ limit: 1, filters: { status: 'ACTIVE' } }),
        // Total operators
        operatorsService.getAll({ limit: 1 }),
        // Active operators
        operatorsService.getAll({ limit: 1, filters: { active: true } })
      ])

      setTotalCounts({
        buildings: buildingsResponse.data?.length || 0,
        rooms: roomsResponse.data?.length || 0,
        tenants: tenantsResponse.data?.length || 0,
        activeTenants: activeTenantsResponse.data?.length || 0,
        operators: operatorsResponse.data?.length || 0,
        activeOperators: activeOperatorsResponse.data?.length || 0
      })
    } catch (error: any) {
      // Silent fail for count statistics
    }
  }

  // Fetch data for the active tab
  const fetchData = async () => {
    setIsLoading(true)
    try {
      switch (activeTab) {
        case 'buildings':
          const buildingsResponse = await buildingsService.getAll({
            page: currentPage,
            limit: ITEMS_PER_PAGE,
            search: searchTerm,
            searchFields: ['building_name', 'address', 'city', 'area'],
            filters,
            sortBy: sortConfig.key || 'created_at',
            sortOrder: sortConfig.direction
          })
          if (buildingsResponse.success && buildingsResponse.data) {
            setBuildings(buildingsResponse.data)
          }
          break

        case 'rooms':
          const roomsResponse = await roomsService.getAll({
            page: currentPage,
            limit: ITEMS_PER_PAGE,
            search: searchTerm,
            searchFields: ['room_id'],
            filters,
            sortBy: sortConfig.key || 'room_id',
            sortOrder: sortConfig.direction
          })
          if (roomsResponse.success && roomsResponse.data) {
            setRooms(roomsResponse.data)
          }
          break

        case 'tenants':
          const tenantsResponse = await tenantsService.getAll({
            page: currentPage,
            limit: ITEMS_PER_PAGE,
            search: searchTerm,
            searchFields: ['tenant_name', 'tenant_email'],
            filters,
            sortBy: sortConfig.key || 'created_at',
            sortOrder: sortConfig.direction
          })
          if (tenantsResponse.success && tenantsResponse.data) {
            setTenants(tenantsResponse.data)
          }
          break

        case 'operators':
          const operatorsResponse = await operatorsService.getAll({
            page: currentPage,
            limit: ITEMS_PER_PAGE,
            search: searchTerm,
            searchFields: ['name', 'email'],
            filters,
            sortBy: sortConfig.key || 'operator_id',
            sortOrder: sortConfig.direction
          })
          if (operatorsResponse.success && operatorsResponse.data) {
            setOperators(operatorsResponse.data)
          }
          break
      }
    } catch (error: any) {
      showWarningMessage('Data Fetch Error', error?.message || 'Failed to load data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch total counts on component mount
  useEffect(() => {
    fetchTotalCounts()
  }, [])

  // Refresh data when dependencies change
  useEffect(() => {
    fetchData()
  }, [activeTab, currentPage, searchTerm, sortConfig, filters])

  // Reset pagination when changing tabs
  useEffect(() => {
    setCurrentPage(1)
    setSearchTerm('')
    setFilters({})
    setSortConfig({ key: '', direction: 'asc' })
  }, [activeTab])

  // Add error handling for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      event.preventDefault() // Prevent the default browser behavior
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    })
  }

  const handleDelete = async (id: string | number) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    setIsLoading(true)
    try {
      let response
      switch (activeTab) {
        case 'buildings':
          response = await buildingsService.delete(String(id))
          break
        case 'rooms':
          response = await roomsService.delete(String(id))
          break
        case 'tenants':
          response = await tenantsService.delete(String(id))
          break
        case 'operators':
          response = await operatorsService.delete(String(id))
          break
      }

      if (response?.success) {
        showSuccessMessage('Deleted Successfully', 'Item has been removed.')
        fetchData()
        fetchTotalCounts() // Update total counts after deletion
      } else {
        showWarningMessage('Delete Failed', response?.error || 'Failed to delete item.')
      }
    } catch (error: any) {
      showWarningMessage('Delete Error', error?.message || 'Failed to delete item. Please try again.')
    } finally {
      setIsLoading(false)
      setShowActionMenu(false)
    }
  }

  // Helper function to get total count for current tab
  const getTotalCountForTab = () => {
    switch (activeTab) {
      case 'buildings':
        return totalCounts.buildings
      case 'rooms':
        return totalCounts.rooms
      case 'tenants':
        return totalCounts.tenants
      case 'operators':
        return totalCounts.operators
      default:
        return 0
    }
  }

  const handleExport = () => {
    try {
      let data: any[] = []
      let filename = ''
      
      switch (activeTab) {
        case 'buildings':
          data = buildings
          filename = 'buildings-export'
          break
        case 'rooms':
          data = rooms
          filename = 'rooms-export'
          break
        case 'tenants':
          data = tenants
          filename = 'tenants-export'
          break
        case 'operators':
          data = operators
          filename = 'operators-export'
          break
      }
      
      const jsonStr = JSON.stringify(data, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      
      // Clean up URL object
      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 100)
    } catch (error) {
      console.error('Export failed:', error)
      showWarningMessage('Export Failed', 'Unable to export data. Please try again.')
    }
  }

  const renderBuildingsTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-left">
              <button
                onClick={() => handleSort('building_name')}
                className="flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900"
              >
                Building Name
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </th>
            <th className="px-4 py-3 text-left">
              <button
                onClick={() => handleSort('address')}
                className="flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900"
              >
                Address
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </th>
            <th className="px-4 py-3 text-left">City</th>
            <th className="px-4 py-3 text-left">Type</th>
            <th className="px-4 py-3 text-left">Operator</th>
            <th className="px-4 py-3 text-left">Created</th>
            <th className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {buildings.map((building, index) => (
            <motion.tr
              key={building.building_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg">
                    <BuildingIcon className="w-5 h-5 text-emerald-700" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{building.building_name}</p>
                    <p className="text-sm text-gray-500">ID: {building.building_id}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{building.address}</span>
                </div>
              </td>
              <td className="px-4 py-4 text-gray-600">{building.city}</td>
              <td className="px-4 py-4">
                <Badge variant="outline">{building.building_type}</Badge>
              </td>
              <td className="px-4 py-4 text-gray-600">{building.operator_id || 'N/A'}</td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Calendar className="w-4 h-4" />
                  {new Date(building.created_at).toLocaleDateString()}
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center justify-center gap-2">
                  <Tooltip content="View Details">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setViewingBuilding(building)}
                        className="hover:bg-blue-50 transition-all duration-200"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </Tooltip>
                  <Tooltip content="Edit Building">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingBuilding(building)}
                        className="hover:bg-blue-50 transition-all duration-200"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </Tooltip>
                  <Tooltip content="Delete Building">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(building.building_id)}
                        className="hover:bg-red-50 transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </motion.div>
                  </Tooltip>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderRoomsTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-left">
              <button
                onClick={() => handleSort('room_id')}
                className="flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900"
              >
                Room ID
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </th>
            <th className="px-4 py-3 text-left">Building</th>
            <th className="px-4 py-3 text-left">Type</th>
            <th className="px-4 py-3 text-left">Rent</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Occupancy</th>
            <th className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room, index) => (
            <motion.tr
              key={room.room_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg">
                    <Home className="w-5 h-5 text-purple-700" />
                  </div>
                  <span className="font-medium text-gray-900">{room.room_id}</span>
                </div>
              </td>
              <td className="px-4 py-4 text-gray-600">{room.building_id}</td>
              <td className="px-4 py-4">
                <Badge variant="outline">{room.room_type}</Badge>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-1 text-gray-700">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-medium">{room.private_room_rent || room.shared_room_rent_2 || 'N/A'}</span>
                </div>
              </td>
              <td className="px-4 py-4">
                <StatusBadge status={room.status || 'UNKNOWN'} />
              </td>
              <td className="px-4 py-4">
                <div className="text-sm text-gray-600">
                  {room.private_room_rent ? 'Private' : `${room.total_beds || 0} beds`}
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center justify-center gap-2">
                  <Tooltip content="View Details">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setViewingRoom(room)}
                        className="hover:bg-blue-50 transition-all duration-200"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </Tooltip>
                  <Tooltip content="Edit Room">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingRoom(room)}
                        className="hover:bg-blue-50 transition-all duration-200"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </Tooltip>
                  <Tooltip content="Delete Room">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(room.room_id)}
                        className="hover:bg-red-50 transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </motion.div>
                  </Tooltip>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderTenantsTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-left">
              <button
                onClick={() => handleSort('first_name')}
                className="flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900"
              >
                Name
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </th>
            <th className="px-4 py-3 text-left">Contact</th>
            <th className="px-4 py-3 text-left">Room</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Lease Period</th>
            <th className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((tenant, index) => (
            <motion.tr
              key={tenant.tenant_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg">
                    <UserCheck className="w-5 h-5 text-orange-700" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {tenant.tenant_name}
                    </p>
                    <p className="text-sm text-gray-500">ID: {tenant.tenant_id}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-3 h-3" />
                    {tenant.tenant_email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-3 h-3" />
                    {tenant.phone}
                  </div>
                </div>
              </td>
              <td className="px-4 py-4 text-gray-600">{tenant.room_id || 'N/A'}</td>
              <td className="px-4 py-4">
                <StatusBadge status={tenant.status} />
              </td>
              <td className="px-4 py-4">
                <div className="text-sm text-gray-600">
                  {tenant.lease_start_date && tenant.lease_end_date ? (
                    <>
                      {new Date(tenant.lease_start_date).toLocaleDateString()} - 
                      {new Date(tenant.lease_end_date).toLocaleDateString()}
                    </>
                  ) : (
                    'N/A'
                  )}
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center justify-center gap-2">
                  <Tooltip content="View Details">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setViewingTenant(tenant)}
                        className="hover:bg-blue-50 transition-all duration-200"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </Tooltip>
                  <Tooltip content="Edit Tenant">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingTenant(tenant)}
                        className="hover:bg-blue-50 transition-all duration-200"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </Tooltip>
                  <Tooltip content="Delete Tenant">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(tenant.tenant_id)}
                        className="hover:bg-red-50 transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </motion.div>
                  </Tooltip>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderOperatorsTable = () => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="px-4 py-3 text-left">
              <button
                onClick={() => handleSort('name')}
                className="flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900"
              >
                Name
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </th>
            <th className="px-4 py-3 text-left">Contact</th>
            <th className="px-4 py-3 text-left">Type</th>
            <th className="px-4 py-3 text-left">Company</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {operators.map((operator, index) => (
            <motion.tr
              key={operator.operator_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border-b border-gray-100 hover:bg-gray-50"
            >
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg">
                    <Users className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{operator.name}</p>
                    <p className="text-sm text-gray-500">ID: {operator.operator_id}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-3 h-3" />
                    {operator.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-3 h-3" />
                    {operator.phone}
                  </div>
                </div>
              </td>
              <td className="px-4 py-4">
                <Badge variant="outline">{operator.operator_type}</Badge>
              </td>
              <td className="px-4 py-4 text-gray-600">{operator.company || 'N/A'}</td>
              <td className="px-4 py-4">
                <StatusBadge status={operator.active ? 'ACTIVE' : 'INACTIVE'} />
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center justify-center gap-2">
                  <Tooltip content="View Details">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setViewingOperator(operator)}
                        className="hover:bg-blue-50 transition-all duration-200"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </Tooltip>
                  <Tooltip content="Edit Operator">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingOperator(operator)}
                        className="hover:bg-blue-50 transition-all duration-200"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </Tooltip>
                  <Tooltip content="Delete Operator">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(operator.operator_id)}
                        className="hover:bg-red-50 transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </motion.div>
                  </Tooltip>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'buildings':
        return renderBuildingsTable()
      case 'rooms':
        return renderRoomsTable()
      case 'tenants':
        return renderTenantsTable()
      case 'operators':
        return renderOperatorsTable()
    }
  }

  const tabs = [
    { id: 'buildings' as TabType, label: 'Buildings', icon: BuildingIcon, color: 'from-emerald-500 to-emerald-600' },
    { id: 'rooms' as TabType, label: 'Rooms', icon: Home, color: 'from-purple-500 to-purple-600' },
    { id: 'tenants' as TabType, label: 'Tenants', icon: UserCheck, color: 'from-orange-500 to-orange-600' },
    { id: 'operators' as TabType, label: 'Operators', icon: Users, color: 'from-blue-500 to-blue-600' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/forms'}
                className="flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Data Management</h1>
              <p className="text-gray-600 mt-1">View and manage all your database records</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="outline"
                onClick={() => {
                  fetchData()
                  fetchTotalCounts()
                }}
                disabled={isLoading}
                className="shadow-sm hover:shadow-md transition-all duration-300"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="gradient"
                onClick={handleExport}
                className="shadow-md hover:shadow-lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 p-1 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg
                font-medium transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-gradient-to-r ' + tab.color + ' text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <EnhancedCard variant="premium" className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1 w-full">
                <EnhancedInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  placeholder={`Search ${activeTab}...`}
                  icon={<Search className="w-5 h-5" />}
                />
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className="flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {Object.keys(filters).length > 0 && (
                    <Badge variant="secondary">{Object.keys(filters).length}</Badge>
                  )}
                </Button>
              </motion.div>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
              {showFilterPanel && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 pt-4 border-t border-gray-200"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Dynamic filters based on active tab */}
                    {activeTab === 'buildings' && (
                      <>
                        <EnhancedSelect
                          label="Property Type"
                          value={String(filters.building_type || '')}
                          onChange={(value) => setFilters({ ...filters, building_type: value })}
                          options={[
                            { value: '', label: 'All Types' },
                            { value: 'APARTMENT', label: 'Apartment' },
                            { value: 'HOUSE', label: 'House' },
                            { value: 'CONDO', label: 'Condo' }
                          ]}
                        />
                      </>
                    )}
                    {activeTab === 'rooms' && (
                      <>
                        <EnhancedSelect
                          label="Status"
                          value={String(filters.status || '')}
                          onChange={(value) => setFilters({ ...filters, status: value })}
                          options={[
                            { value: '', label: 'All Statuses' },
                            { value: 'AVAILABLE', label: 'Available' },
                            { value: 'OCCUPIED', label: 'Occupied' },
                            { value: 'MAINTENANCE', label: 'Maintenance' }
                          ]}
                        />
                      </>
                    )}
                    {activeTab === 'tenants' && (
                      <>
                        <EnhancedSelect
                          label="Status"
                          value={String(filters.status || '')}
                          onChange={(value) => setFilters({ ...filters, status: value })}
                          options={[
                            { value: '', label: 'All Statuses' },
                            { value: 'ACTIVE', label: 'Active' },
                            { value: 'INACTIVE', label: 'Inactive' },
                            { value: 'PENDING', label: 'Pending' }
                          ]}
                        />
                      </>
                    )}
                    {activeTab === 'operators' && (
                      <>
                        <EnhancedSelect
                          label="Operator Type"
                          value={String(filters.operator_type || '')}
                          onChange={(value) => setFilters({ ...filters, operator_type: value })}
                          options={[
                            { value: '', label: 'All Types' },
                            { value: 'PROPERTY_MANAGER', label: 'Property Manager' },
                            { value: 'LEASING_AGENT', label: 'Leasing Agent' },
                            { value: 'MAINTENANCE', label: 'Maintenance' }
                          ]}
                        />
                      </>
                    )}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilters({})}
                        className="shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        Clear Filters
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </EnhancedCard>
        </motion.div>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <EnhancedCard variant="premium" className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" text="Loading data..." />
              </div>
            ) : (
              <>
                {renderContent()}
                
                {/* Pagination */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {getTotalCountForTab() === 0 
                      ? 'No data available'
                      : `Page ${currentPage} of ${Math.ceil(getTotalCountForTab() / ITEMS_PER_PAGE) || 1}`
                    }
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={currentPage >= Math.ceil(getTotalCountForTab() / ITEMS_PER_PAGE)}
                        className="shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </>
            )}
          </EnhancedCard>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <EnhancedCard variant="premium" className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                <BuildingIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Buildings</p>
                <p className="text-2xl font-bold text-gray-900">{totalCounts.buildings}</p>
              </div>
            </div>
          </EnhancedCard>

          <EnhancedCard variant="premium" className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Rooms</p>
                <p className="text-2xl font-bold text-gray-900">{totalCounts.rooms}</p>
              </div>
            </div>
          </EnhancedCard>

          <EnhancedCard variant="premium" className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Tenants</p>
                <p className="text-2xl font-bold text-gray-900">{totalCounts.activeTenants}</p>
              </div>
            </div>
          </EnhancedCard>

          <EnhancedCard variant="premium" className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Operators</p>
                <p className="text-2xl font-bold text-gray-900">{totalCounts.activeOperators}</p>
              </div>
            </div>
          </EnhancedCard>
        </motion.div>
      </div>

      {/* Edit Modals */}
      <EditBuildingModal
        building={editingBuilding}
        open={!!editingBuilding}
        onOpenChange={(open) => !open && setEditingBuilding(null)}
        onSuccess={() => {
          fetchData()
          fetchTotalCounts() // Update total counts after edit
          showSuccessMessage(
            'Building Updated',
            'The building has been updated successfully.'
          )
        }}
        operators={operators}
      />

      <EditRoomModal
        room={editingRoom}
        open={!!editingRoom}
        onOpenChange={(open) => !open && setEditingRoom(null)}
        onSuccess={() => {
          fetchData()
          fetchTotalCounts() // Update total counts after edit
          showSuccessMessage(
            'Room Updated',
            'The room has been updated successfully.'
          )
        }}
        buildings={buildings.map(b => ({
          building_id: b.building_id,
          building_name: b.building_name
        }))}
      />

      <EditTenantModal
        tenant={editingTenant}
        open={!!editingTenant}
        onOpenChange={(open) => !open && setEditingTenant(null)}
        onSuccess={() => {
          fetchData()
          fetchTotalCounts() // Update total counts after edit
          showSuccessMessage(
            'Tenant Updated',
            'The tenant has been updated successfully.'
          )
        }}
        buildings={buildings.map(b => ({
          building_id: b.building_id,
          building_name: b.building_name
        }))}
        rooms={rooms.map(r => ({
          room_id: r.room_id,
          building_id: r.building_id
        }))}
      />

      <EditOperatorModal
        operator={editingOperator}
        open={!!editingOperator}
        onOpenChange={(open) => !open && setEditingOperator(null)}
        onSuccess={() => {
          fetchData()
          fetchTotalCounts() // Update total counts after edit
          showSuccessMessage(
            'Operator Updated',
            'The operator has been updated successfully.'
          )
        }}
      />

      {/* View Modals */}
      <ViewBuildingModal
        building={viewingBuilding}
        open={!!viewingBuilding}
        onOpenChange={(open) => !open && setViewingBuilding(null)}
      />

      <ViewRoomModal
        room={viewingRoom}
        open={!!viewingRoom}
        onOpenChange={(open) => !open && setViewingRoom(null)}
      />

      <ViewTenantModal
        tenant={viewingTenant}
        open={!!viewingTenant}
        onOpenChange={(open) => !open && setViewingTenant(null)}
      />

      <ViewOperatorModal
        operator={viewingOperator}
        open={!!viewingOperator}
        onOpenChange={(open) => !open && setViewingOperator(null)}
      />
    </div>
  )
}