'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Home,
  Bed,
  UserCheck,
  Clock,
  Target,
  Zap,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AnalyticsData {
  occupancy: {
    occupancy_rate: number
    total_rooms: number
    occupied_rooms: number
    available_rooms: number
  }
  financial: {
    total_revenue: number
    average_rent: number
    revenue_by_building: Array<{
      building_name: string
      total_revenue: number
    }>
  }
  leads: {
    total_leads: number
    conversion_rate: number
    leads_by_status: Array<{
      status: string
      count: number
    }>
  }
  maintenance: {
    total_requests: number
    pending_requests: number
    completed_requests: number
    average_completion_time: number
  }
  market: {
    price_insights: {
      lowest_rent: string
      average_rent: string
      highest_rent: string
    }
    availability_by_bedrooms: Array<{
      bedrooms: number
      available: number
    }>
    popular_buildings: Array<{
      name: string
      units_available: number
    }>
  }
}

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ElementType
  trend?: 'up' | 'down' | 'neutral'
  color: string
}

function MetricCard({ title, value, change, icon: Icon, trend, color }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-3 rounded-lg", color)}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium",
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
          )}>
            {trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <h3 className="text-sm text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </motion.div>
  )
}

export default function LeadAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState('month')

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Fetch occupancy data
      const occupancyRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/analytics/occupancy`)
      const occupancyData = await occupancyRes.json()
      
      // Fetch financial data
      const financialRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/analytics/financial`)
      const financialData = await financialRes.json()
      
      // Fetch leads data
      const leadsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/analytics/leads`)
      const leadsData = await leadsRes.json()
      
      // Fetch maintenance data
      const maintenanceRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/analytics/maintenance`)
      const maintenanceData = await maintenanceRes.json()
      
      // Fetch market insights using AI query
      const marketRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/query/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: "Show me market analytics"
        })
      })
      const marketResponse = await marketRes.json()
      
      setAnalyticsData({
        occupancy: occupancyData,
        financial: financialData,
        leads: leadsData,
        maintenance: maintenanceData,
        market: marketResponse.result || {
          price_insights: {
            lowest_rent: 'N/A',
            average_rent: 'N/A',
            highest_rent: 'N/A'
          },
          availability_by_bedrooms: [],
          popular_buildings: []
        }
      })
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error || !analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'No data available'}</p>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const { occupancy, financial, leads, maintenance, market } = analyticsData

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-indigo-600" />
              <h1 className="text-xl font-semibold text-gray-900">HomeWiz Analytics</h1>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
              <button
                onClick={fetchAnalytics}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Occupancy Rate"
            value={`${(occupancy.occupancy_rate * 100).toFixed(1)}%`}
            change={2.3}
            trend="up"
            icon={Home}
            color="bg-indigo-600"
          />
          <MetricCard
            title="Total Revenue"
            value={`$${financial.total_revenue.toLocaleString()}`}
            change={5.2}
            trend="up"
            icon={DollarSign}
            color="bg-green-600"
          />
          <MetricCard
            title="Active Leads"
            value={leads.total_leads}
            change={12.5}
            trend="up"
            icon={Users}
            color="bg-purple-600"
          />
          <MetricCard
            title="Conversion Rate"
            value={`${(leads.conversion_rate * 100).toFixed(1)}%`}
            change={-1.2}
            trend="down"
            icon={Target}
            color="bg-orange-600"
          />
        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Occupancy Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-600" />
              Occupancy Overview
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Occupied Units</span>
                  <span className="font-medium">{occupancy.occupied_rooms}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{ width: `${occupancy.occupancy_rate * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Available Units</span>
                <span className="font-medium text-green-600">{occupancy.available_rooms}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Units</span>
                <span className="font-medium">{occupancy.total_rooms}</span>
              </div>
            </div>
          </motion.div>

          {/* Market Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-600" />
              Market Insights
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Rent Range</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-gray-500">Low</p>
                    <p className="font-semibold">{market.price_insights.lowest_rent}</p>
                  </div>
                  <div className="bg-indigo-50 rounded p-2">
                    <p className="text-xs text-gray-500">Avg</p>
                    <p className="font-semibold text-indigo-600">{market.price_insights.average_rent}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs text-gray-500">High</p>
                    <p className="font-semibold">{market.price_insights.highest_rent}</p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Available by Type</p>
                {market.availability_by_bedrooms.map((item) => (
                  <div key={item.bedrooms} className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">
                      {item.bedrooms === 0 ? 'Studio' : `${item.bedrooms} BR`}
                    </span>
                    <span className="font-medium">{item.available} units</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Lead Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-indigo-600" />
              Lead Performance
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Lead Status</p>
                {leads.leads_by_status.map((status) => (
                  <div key={status.status} className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">{status.status}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${(status.count / leads.total_leads) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-10 text-right">{status.count}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">AI Chat Conversion</span>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-green-600">+15%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Revenue by Building */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-indigo-600" />
            Revenue by Building
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {financial.revenue_by_building.slice(0, 6).map((building) => (
              <div key={building.building_name} className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">{building.building_name}</h3>
                <p className="text-2xl font-bold text-green-600">
                  ${building.total_revenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">Average rent: ${financial.average_rent.toFixed(0)}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Maintenance Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-600" />
            Maintenance Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">{maintenance.total_requests}</p>
              <p className="text-sm text-gray-600">Total Requests</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{maintenance.pending_requests}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{maintenance.completed_requests}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-indigo-600">{maintenance.average_completion_time}h</p>
              <p className="text-sm text-gray-600">Avg. Time</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}