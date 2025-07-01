'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EnhancedCard } from '@/components/ui/enhanced-components'
import { getOperators, getBuildings, getRooms, getLeads } from '../../lib/api-client'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Building,
  Home,
  Target,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react'

interface AnalyticsData {
  operators: any[]
  buildings: any[]
  rooms: any[]
  leads: any[]
  tenants: any[]
}

interface MetricCard {
  title: string
  value: string | number
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
  icon: React.ReactNode
  color: string
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function AdvancedAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData>({
    operators: [],
    buildings: [],
    rooms: [],
    leads: [],
    tenants: []
  })
  const [loading, setLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const fetchAnalyticsData = async () => {
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
      console.error('Error fetching analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate metrics
  const calculateMetrics = (): MetricCard[] => {
    const totalRooms = data.rooms.length
    const availableRooms = data.rooms.filter(room => room.status === 'AVAILABLE').length
    const occupiedRooms = data.rooms.filter(room => room.status === 'OCCUPIED').length
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0

    const totalRevenue = data.rooms.reduce((sum, room) => {
      return sum + (room.private_room_rent || 0)
    }, 0)

    const activeLeads = data.leads.filter(lead => lead.status === 'EXPLORING' || lead.status === 'INTERESTED').length
    const convertedLeads = data.leads.filter(lead => lead.status === 'CONVERTED').length
    const conversionRate = data.leads.length > 0 ? (convertedLeads / data.leads.length) * 100 : 0

    return [
      {
        title: 'Total Revenue',
        value: `$${totalRevenue.toLocaleString()}`,
        change: 12.5,
        changeType: 'increase',
        icon: <DollarSign className="w-6 h-6" />,
        color: 'from-green-500 to-emerald-500'
      },
      {
        title: 'Occupancy Rate',
        value: `${occupancyRate.toFixed(1)}%`,
        change: occupancyRate > 80 ? 5.2 : -2.1,
        changeType: occupancyRate > 80 ? 'increase' : 'decrease',
        icon: <Home className="w-6 h-6" />,
        color: 'from-blue-500 to-cyan-500'
      },
      {
        title: 'Active Leads',
        value: activeLeads,
        change: 18,
        changeType: 'increase',
        icon: <Target className="w-6 h-6" />,
        color: 'from-purple-500 to-pink-500'
      },
      {
        title: 'Conversion Rate',
        value: `${conversionRate.toFixed(1)}%`,
        change: conversionRate > 20 ? 8.3 : -3.2,
        changeType: conversionRate > 20 ? 'increase' : 'decrease',
        icon: <TrendingUp className="w-6 h-6" />,
        color: 'from-orange-500 to-red-500'
      }
    ]
  }

  // Prepare chart data
  const getRoomStatusData = () => {
    const statusCounts = data.rooms.reduce((acc, room) => {
      acc[room.status] = (acc[room.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0) + status.slice(1).toLowerCase(),
      value: count,
      percentage: ((count / data.rooms.length) * 100).toFixed(1)
    }))
  }

  const getBuildingData = () => {
    return data.buildings.map(building => {
      const buildingRooms = data.rooms.filter(room => room.building_id === building.building_id)
      const occupiedRooms = buildingRooms.filter(room => room.status === 'OCCUPIED').length
      const occupancyRate = buildingRooms.length > 0 ? (occupiedRooms / buildingRooms.length) * 100 : 0

      return {
        name: building.building_name || building.building_id,
        totalRooms: buildingRooms.length,
        occupiedRooms,
        occupancyRate: Math.round(occupancyRate),
        revenue: buildingRooms.reduce((sum, room) => sum + (room.private_room_rent || 0), 0)
      }
    })
  }

  const getLeadStatusData = () => {
    const statusCounts = data.leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0) + status.slice(1).toLowerCase(),
      value: count
    }))
  }

  const metrics = calculateMetrics()
  const roomStatusData = getRoomStatusData()
  const buildingData = getBuildingData()
  const leadStatusData = getLeadStatusData()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
              <p className="text-gray-600">Comprehensive insights into your property management operations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <Button onClick={fetchAnalyticsData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <EnhancedCard key={metric.title} variant="premium" className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 bg-gradient-to-r ${metric.color} rounded-lg text-white`}>
                      {metric.icon}
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{metric.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${
                    metric.changeType === 'increase' ? 'text-green-600' : 
                    metric.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {metric.changeType === 'increase' ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : metric.changeType === 'decrease' ? (
                      <TrendingDown className="w-4 h-4" />
                    ) : null}
                    <span>{Math.abs(metric.change)}%</span>
                  </div>
                </div>
              </EnhancedCard>
            ))}
          </div>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Room Status Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <EnhancedCard variant="premium" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Room Status Distribution</h3>
                <PieChartIcon className="w-5 h-5 text-gray-500" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roomStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {roomStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} rooms`, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </EnhancedCard>
          </motion.div>

          {/* Building Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <EnhancedCard variant="premium" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Building Occupancy Rates</h3>
                <BarChart3 className="w-5 h-5 text-gray-500" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={buildingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="occupancyRate" fill="#8884d8" name="Occupancy Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </EnhancedCard>
          </motion.div>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Lead Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <EnhancedCard variant="premium" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Lead Status Overview</h3>
                <Target className="w-5 h-5 text-gray-500" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={leadStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#82ca9d" name="Number of Leads" />
                </BarChart>
              </ResponsiveContainer>
            </EnhancedCard>
          </motion.div>

          {/* Revenue by Building */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <EnhancedCard variant="premium" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Revenue by Building</h3>
                <DollarSign className="w-5 h-5 text-gray-500" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={buildingData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </EnhancedCard>
          </motion.div>
        </div>

        {/* Data Summary Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <EnhancedCard variant="premium" className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Building Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Building</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Total Rooms</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Occupied</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Occupancy Rate</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Monthly Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {buildingData.map((building, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{building.name}</td>
                      <td className="py-3 px-4 text-gray-600">{building.totalRooms}</td>
                      <td className="py-3 px-4 text-gray-600">{building.occupiedRooms}</td>
                      <td className="py-3 px-4">
                        <Badge 
                          className={
                            building.occupancyRate >= 80 ? 'bg-green-100 text-green-800' :
                            building.occupancyRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }
                        >
                          {building.occupancyRate}%
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-gray-600">${building.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </EnhancedCard>
        </motion.div>
      </div>
    </div>
  )
}
