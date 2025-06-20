'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Filter,
  Download,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import '@/styles/design-system.css'

// Mock data generation
const generateMockData = () => {
  const today = new Date()
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(today, 29 - i)
    return {
      date: format(date, 'MMM dd'),
      fullDate: date,
      leads: Math.floor(Math.random() * 20) + 5,
      applications: Math.floor(Math.random() * 15) + 2,
      conversions: Math.floor(Math.random() * 8) + 1,
      revenue: Math.floor(Math.random() * 5000) + 2000,
      occupancy: Math.floor(Math.random() * 20) + 75
    }
  })

  const roomStatusData = [
    { name: 'Available', value: 45, color: '#10B981' },
    { name: 'Occupied', value: 120, color: '#EF4444' },
    { name: 'Maintenance', value: 8, color: '#F59E0B' },
    { name: 'Reserved', value: 12, color: '#3B82F6' }
  ]

  const leadSourceData = [
    { name: 'Website', value: 35, color: '#8B5CF6' },
    { name: 'Referral', value: 28, color: '#06B6D4' },
    { name: 'Social Media', value: 22, color: '#EC4899' },
    { name: 'Advertisement', value: 15, color: '#F59E0B' }
  ]

  const monthlyRevenueData = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2024, i, 1)
    return {
      month: format(month, 'MMM'),
      revenue: Math.floor(Math.random() * 50000) + 30000,
      expenses: Math.floor(Math.random() * 20000) + 15000,
      profit: 0
    }
  }).map(item => ({
    ...item,
    profit: item.revenue - item.expenses
  }))

  return {
    dailyMetrics: last30Days,
    roomStatus: roomStatusData,
    leadSources: leadSourceData,
    monthlyRevenue: monthlyRevenueData
  }
}

interface MetricCardProps {
  title: string
  value: string | number
  change: number
  icon: React.ReactNode
  color: string
  format?: 'number' | 'currency' | 'percentage'
}

function MetricCard({ title, value, change, icon, color, format = 'number' }: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (format === 'currency') {
      return `$${typeof val === 'number' ? val.toLocaleString() : val}`
    }
    if (format === 'percentage') {
      return `${val}%`
    }
    return typeof val === 'number' ? val.toLocaleString() : val
  }

  const isPositive = change >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <EnhancedCard variant="premium" className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{formatValue(value)}</p>
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{Math.abs(change)}% vs last month</span>
            </div>
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
            <div className="text-white">
              {icon}
            </div>
          </div>
        </div>
      </EnhancedCard>
    </motion.div>
  )
}

interface ChartCardProps {
  title: string
  children: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

function ChartCard({ title, children, actions, className = '' }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <EnhancedCard variant="premium" className="p-6 h-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
        {children}
      </EnhancedCard>
    </motion.div>
  )
}

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [visibleCharts, setVisibleCharts] = useState({
    dailyMetrics: true,
    roomStatus: true,
    leadSources: true,
    monthlyRevenue: true
  })

  const data = useMemo(() => generateMockData(), [])

  const toggleChart = (chartName: keyof typeof visibleCharts) => {
    setVisibleCharts(prev => ({
      ...prev,
      [chartName]: !prev[chartName]
    }))
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
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
            Real-time insights and comprehensive analytics for your rental business
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-600">Chart Visibility:</span>
              {Object.entries(visibleCharts).map(([key, visible]) => (
                <button
                  key={key}
                  onClick={() => toggleChart(key as keyof typeof visibleCharts)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
                    visible ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {key}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </motion.button>
            <motion.button
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Download className="w-4 h-4" />
              Export
            </motion.button>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Leads"
            value={1247}
            change={12.5}
            icon={<Target className="w-6 h-6" />}
            color="from-pink-500 to-purple-500"
          />
          <MetricCard
            title="Active Tenants"
            value={342}
            change={8.2}
            icon={<Users className="w-6 h-6" />}
            color="from-blue-500 to-cyan-500"
          />
          <MetricCard
            title="Occupancy Rate"
            value={87}
            change={-2.1}
            icon={<Home className="w-6 h-6" />}
            color="from-green-500 to-emerald-500"
            format="percentage"
          />
          <MetricCard
            title="Monthly Revenue"
            value={125000}
            change={15.3}
            icon={<DollarSign className="w-6 h-6" />}
            color="from-orange-500 to-red-500"
            format="currency"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Metrics Chart */}
          <AnimatePresence>
            {visibleCharts.dailyMetrics && (
              <ChartCard
                title="Daily Performance Trends"
                actions={
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Last 30 days</span>
                  </div>
                }
                className="lg:col-span-2"
              >
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.dailyMetrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="leads"
                      stroke="#ec4899"
                      strokeWidth={3}
                      dot={{ fill: '#ec4899', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#ec4899', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="applications"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="conversions"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            )}
          </AnimatePresence>

          {/* Room Status Chart */}
          <AnimatePresence>
            {visibleCharts.roomStatus && (
              <ChartCard
                title="Room Status Distribution"
                actions={
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">185 total rooms</span>
                  </div>
                }
              >
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.roomStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.roomStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            )}
          </AnimatePresence>

          {/* Lead Sources Chart */}
          <AnimatePresence>
            {visibleCharts.leadSources && (
              <ChartCard
                title="Lead Sources"
                actions={
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">This month</span>
                  </div>
                }
              >
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.leadSources} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" stroke="#6b7280" />
                    <YAxis dataKey="name" type="category" stroke="#6b7280" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {data.leadSources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
