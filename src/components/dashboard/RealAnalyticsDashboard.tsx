'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { EnhancedCard } from '@/components/ui/enhanced-components'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Building,
  Home,
  DollarSign,
  Calendar,
  BarChart3,
  Activity,
  RefreshCw
} from 'lucide-react'
import { databaseService } from '@/lib/supabase/database'
import { format } from 'date-fns'
import '@/styles/design-system.css'

interface AnalyticsData {
  totalLeads: number
  activeTenants: number
  occupancyRate: number
  monthlyRevenue: number
  totalBuildings: number
  totalRooms: number
  availableRooms: number
  roomStatusData: Array<{ name: string; value: number; color: string }>
  tenantStatusData: Array<{ name: string; value: number; color: string }>
  buildingOccupancy: Array<{ building: string; occupancy: number; revenue: number }>
}

interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

function MetricCard({ title, value, icon, color, trend }: MetricCardProps) {
  return (
    <EnhancedCard className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trend && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
          <div className={`p-4 rounded-xl bg-gradient-to-br ${color}`}>
            {icon}
          </div>
        </div>
      </div>
    </EnhancedCard>
  )
}

export default function RealAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchAnalyticsData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch all data in parallel (with high limits to get all records)
      const [tenantsResponse, roomsResponse, buildingsResponse, leadsResponse] = await Promise.all([
        databaseService.tenants.list({ limit: 1000 }),
        databaseService.rooms.list({ limit: 1000 }),
        databaseService.buildings.list({ limit: 1000 }),
        databaseService.leads ? databaseService.leads.list({ limit: 1000 }) : Promise.resolve({ success: true, data: [] })
      ])

      if (!tenantsResponse.success || !roomsResponse.success || !buildingsResponse.success) {
        throw new Error('Failed to fetch data from database')
      }

      const tenants = tenantsResponse.data || []
      const rooms = roomsResponse.data || []
      const buildings = buildingsResponse.data || []
      const leads = (leadsResponse.success ? leadsResponse.data : []) || []

      // Calculate metrics
      const activeTenants = tenants.filter(t => t.status === 'Active').length
      const totalRooms = rooms.length
      const occupiedRooms = rooms.filter(r => r.status === 'OCCUPIED' || r.status === 'Occupied').length
      const availableRooms = rooms.filter(r => r.status === 'AVAILABLE' || r.status === 'Available').length
      const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0

      // Calculate monthly revenue from active tenants
      const monthlyRevenue = tenants
        .filter(t => t.status === 'Active')
        .reduce((sum, t) => {
          const rent = t.rent_amount || t.monthly_rent || 0
          return sum + (typeof rent === 'number' ? rent : parseFloat(rent) || 0)
        }, 0)

      // Room status distribution
      const roomStatusMap: Record<string, number> = {}
      rooms.forEach(room => {
        const status = room.status || 'Unknown'
        roomStatusMap[status] = (roomStatusMap[status] || 0) + 1
      })

      const roomStatusData = Object.entries(roomStatusMap).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
        value: count,
        color: status === 'AVAILABLE' || status === 'Available' ? '#10B981' :
               status === 'OCCUPIED' || status === 'Occupied' ? '#EF4444' :
               status === 'MAINTENANCE' || status === 'Maintenance' ? '#F59E0B' :
               status === 'RESERVED' || status === 'Reserved' ? '#3B82F6' : '#6B7280'
      }))

      // Tenant status distribution
      const tenantStatusMap: Record<string, number> = {}
      tenants.forEach(tenant => {
        const status = tenant.status || 'Unknown'
        tenantStatusMap[status] = (tenantStatusMap[status] || 0) + 1
      })

      const tenantStatusData = Object.entries(tenantStatusMap).map(([status, count]) => ({
        name: status,
        value: count,
        color: status === 'Active' ? '#10B981' :
               status === 'Inactive' ? '#EF4444' :
               status === 'Moving Out' ? '#F59E0B' :
               status === 'Pending Move-in' ? '#3B82F6' : '#6B7280'
      }))

      // Building occupancy breakdown
      const buildingOccupancy = buildings.map(building => {
        const buildingRooms = rooms.filter(r => r.building_id === building.building_id)
        const occupied = buildingRooms.filter(r => r.status === 'OCCUPIED' || r.status === 'Occupied').length
        const total = buildingRooms.length
        const occupancy = total > 0 ? Math.round((occupied / total) * 100) : 0

        const buildingTenants = tenants.filter(t => {
          const tenantRoom = rooms.find(r => r.room_id === t.room_id)
          return tenantRoom?.building_id === building.building_id && t.status === 'Active'
        })

        const revenue = buildingTenants.reduce((sum, t) => {
          const rent = t.rent_amount || t.monthly_rent || 0
          return sum + (typeof rent === 'number' ? rent : parseFloat(rent) || 0)
        }, 0)

        return {
          building: building.building_name || building.name || 'Unknown',
          occupancy,
          revenue: Math.round(revenue)
        }
      })

      setData({
        totalLeads: leads.length,
        activeTenants,
        occupancyRate,
        monthlyRevenue: Math.round(monthlyRevenue),
        totalBuildings: buildings.length,
        totalRooms,
        availableRooms,
        roomStatusData,
        tenantStatusData,
        buildingOccupancy
      })

      setLastUpdated(new Date())
    } catch (err: any) {
      console.error('Error fetching analytics:', err)
      setError(err.message || 'Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-600">Count: {payload[0].value}</p>
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">Error: {error || 'No data available'}</p>
          <button
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <BarChart3 className="w-4 h-4" />
            Analytics Dashboard
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-3">
            Rental Platform Analytics
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real-time insights from your property database
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Activity className="w-4 h-4" />
            <span>Last updated: {format(lastUpdated, 'MMM dd, yyyy HH:mm')}</span>
          </div>
          <button
            onClick={fetchAnalyticsData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <MetricCard
            title="Total Leads"
            value={data.totalLeads}
            icon={<Users className="w-6 h-6 text-white" />}
            color="from-purple-500 to-purple-600"
          />
          <MetricCard
            title="Active Tenants"
            value={data.activeTenants}
            icon={<Users className="w-6 h-6 text-white" />}
            color="from-blue-500 to-blue-600"
          />
          <MetricCard
            title="Occupancy Rate"
            value={`${data.occupancyRate}%`}
            icon={<Home className="w-6 h-6 text-white" />}
            color="from-green-500 to-green-600"
          />
          <MetricCard
            title="Monthly Revenue"
            value={`$${data.monthlyRevenue.toLocaleString()}`}
            icon={<DollarSign className="w-6 h-6 text-white" />}
            color="from-orange-500 to-orange-600"
          />
        </motion.div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Room Status Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <EnhancedCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Room Status Distribution</h3>
                  <Building className="w-5 h-5 text-gray-500" />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.roomStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.roomStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600">Total Rooms: <span className="font-bold text-gray-900">{data.totalRooms}</span></div>
                  <div className="text-gray-600">Available: <span className="font-bold text-green-600">{data.availableRooms}</span></div>
                </div>
              </div>
            </EnhancedCard>
          </motion.div>

          {/* Tenant Status Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <EnhancedCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Tenant Status Breakdown</h3>
                  <Users className="w-5 h-5 text-gray-500" />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.tenantStatusData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {data.tenantStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </EnhancedCard>
          </motion.div>
        </div>

        {/* Building Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <EnhancedCard>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Building Performance</h3>
                <Building className="w-5 h-5 text-gray-500" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.buildingOccupancy}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="building" />
                  <YAxis yAxisId="left" label={{ value: 'Occupancy %', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'Revenue $', angle: 90, position: 'insideRight' }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="occupancy" fill="#3B82F6" name="Occupancy %" radius={[8, 8, 0, 0]} />
                  <Bar yAxisId="right" dataKey="revenue" fill="#10B981" name="Revenue $" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </EnhancedCard>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <EnhancedCard>
            <div className="p-6 text-center">
              <Building className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600 mb-1">Total Buildings</p>
              <p className="text-3xl font-bold text-gray-900">{data.totalBuildings}</p>
            </div>
          </EnhancedCard>
          <EnhancedCard>
            <div className="p-6 text-center">
              <Home className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600 mb-1">Total Rooms</p>
              <p className="text-3xl font-bold text-gray-900">{data.totalRooms}</p>
            </div>
          </EnhancedCard>
          <EnhancedCard>
            <div className="p-6 text-center">
              <DollarSign className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-600 mb-1">Avg Revenue/Building</p>
              <p className="text-3xl font-bold text-gray-900">
                ${data.totalBuildings > 0 ? Math.round(data.monthlyRevenue / data.totalBuildings).toLocaleString() : 0}
              </p>
            </div>
          </EnhancedCard>
        </motion.div>
      </div>
    </div>
  )
}
