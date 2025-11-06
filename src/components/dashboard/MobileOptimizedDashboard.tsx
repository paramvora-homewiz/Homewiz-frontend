'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDeviceDetection, useMobileNavigation } from '@/hooks/useMobileOptimization'
import { 
  MobileButton, 
  MobileTabs, 
  BottomSheet, 
  SwipeableCard, 
  MobileFormWrapper,
  PullToRefresh 
} from '@/components/mobile/MobileOptimizedComponents'
import { EnhancedCard } from '@/components/ui/enhanced-components'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import {
  Home,
  Users,
  Building,
  Target,
  BarChart3,
  Settings,
  Menu,
  Plus,
  Search,
  Filter,
  Bell,
  User,
  Edit,
  Trash2,
  Star,
  TrendingUp,
  DollarSign,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ChevronRight
} from 'lucide-react'

interface QuickActionProps {
  icon: React.ReactNode
  label: string
  onClick: () => void
  color: string
}

function QuickAction({ icon, label, onClick, color }: QuickActionProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="p-2 bg-white/20 rounded-lg">
        {icon}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </motion.button>
  )
}

interface MetricCardProps {
  title: string
  value: string
  change: string
  icon: React.ReactNode
  color: string
}

function MetricCard({ title, value, change, icon, color }: MetricCardProps) {
  return (
    <EnhancedCard variant="premium" className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg bg-gradient-to-r ${color}`}>
          <div className="text-white">
            {icon}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
          <div className="text-sm text-green-600 dark:text-green-400">{change}</div>
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
    </EnhancedCard>
  )
}

interface PropertyCardProps {
  id: string
  name: string
  address: string
  rooms: number
  occupancy: number
  revenue: string
  status: 'active' | 'maintenance' | 'full'
}

function PropertyCard({ id, name, address, rooms, occupancy, revenue, status }: PropertyCardProps) {
  const statusColors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    maintenance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    full: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  }

  return (
    <SwipeableCard
      leftAction={{
        icon: <Edit className="w-5 h-5" />,
        color: 'bg-blue-500',
        label: 'Edit'
      }}
      rightAction={{
        icon: <Trash2 className="w-5 h-5" />,
        color: 'bg-red-500',
        label: 'Delete'
      }}
      onSwipeLeft={() => console.log('Delete', id)}
      onSwipeRight={() => console.log('Edit', id)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{name}</h3>
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              {address}
            </div>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
            {status}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">{rooms}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Rooms</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">{occupancy}%</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Occupied</div>
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">{revenue}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Revenue</div>
          </div>
        </div>
      </div>
    </SwipeableCard>
  )
}

export default function MobileOptimizedDashboard() {
  const { isMobile, screenSize } = useDeviceDetection()
  const { isMenuOpen, activeTab, toggleMenu, switchTab } = useMobileNavigation()
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Home className="w-4 h-4" /> },
    { id: 'properties', label: 'Properties', icon: <Building className="w-4 h-4" /> },
    { id: 'tenants', label: 'Tenants', icon: <Users className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> }
  ]

  const quickActions = [
    {
      icon: <Plus className="w-6 h-6" />,
      label: 'Add Property',
      onClick: () => console.log('Add Property'),
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Users className="w-6 h-6" />,
      label: 'New Tenant',
      onClick: () => console.log('New Tenant'),
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Target className="w-6 h-6" />,
      label: 'Add Lead',
      onClick: () => console.log('Add Lead'),
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      label: 'Schedule',
      onClick: () => console.log('Schedule'),
      color: 'from-orange-500 to-red-500'
    }
  ]

  const metrics = [
    {
      title: 'Total Revenue',
      value: '$125K',
      change: '+12.5%',
      icon: <DollarSign className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Active Properties',
      value: '24',
      change: '+2',
      icon: <Building className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Occupancy Rate',
      value: '87%',
      change: '+5.2%',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'New Leads',
      value: '42',
      change: '+18',
      icon: <Target className="w-5 h-5" />,
      color: 'from-orange-500 to-red-500'
    }
  ]

  const properties = [
    {
      id: '1',
      name: 'Sunset Apartments',
      address: '123 Main St, Downtown',
      rooms: 24,
      occupancy: 92,
      revenue: '$12.5K',
      status: 'active' as const
    },
    {
      id: '2',
      name: 'Garden View Complex',
      address: '456 Oak Ave, Midtown',
      rooms: 18,
      occupancy: 78,
      revenue: '$9.2K',
      status: 'maintenance' as const
    },
    {
      id: '3',
      name: 'City Center Lofts',
      address: '789 Pine St, Central',
      rooms: 32,
      occupancy: 100,
      revenue: '$18.7K',
      status: 'full' as const
    }
  ]

  const handleRefresh = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    console.log('Data refreshed')
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <QuickAction key={index} {...action} />
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Metrics</h2>
        <div className="grid grid-cols-2 gap-3">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
        <EnhancedCard variant="premium" className="p-4">
          <div className="space-y-3">
            {[
              { action: 'New tenant moved in', time: '2 hours ago', icon: <Users className="w-4 h-4" /> },
              { action: 'Payment received', time: '4 hours ago', icon: <DollarSign className="w-4 h-4" /> },
              { action: 'Maintenance completed', time: '6 hours ago', icon: <Settings className="w-4 h-4" /> }
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">{item.action}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{item.time}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        </EnhancedCard>
      </div>
    </div>
  )

  const renderProperties = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Properties</h2>
        <div className="flex items-center gap-2">
          <MobileButton
            onClick={() => setShowFilters(true)}
            variant="outline"
            size="small"
          >
            <Filter className="w-4 h-4" />
          </MobileButton>
          <MobileButton
            onClick={() => console.log('Search')}
            variant="outline"
            size="small"
          >
            <Search className="w-4 h-4" />
          </MobileButton>
        </div>
      </div>

      <div className="space-y-3">
        {properties.map((property) => (
          <PropertyCard key={property.id} {...property} />
        ))}
      </div>
    </div>
  )

  return (
    <MobileFormWrapper
      title="HomeWiz Dashboard"
      actions={
        <div className="flex items-center gap-2">
          <ThemeToggle variant="button" size="sm" />
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
            <Bell className="w-5 h-5" />
          </button>
        </div>
      }
    >
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-6">
          {/* Mobile Tabs */}
          <MobileTabs
            tabs={tabs}
            activeTab={tabs[activeTab]?.id || 'overview'}
            onChange={(tabId) => {
              const index = tabs.findIndex(tab => tab.id === tabId)
              switchTab(index)
            }}
          />

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 0 && renderOverview()}
              {activeTab === 1 && renderProperties()}
              {activeTab === 2 && <div className="text-center py-8 text-gray-500">Tenants content coming soon</div>}
              {activeTab === 3 && <div className="text-center py-8 text-gray-500">Analytics content coming soon</div>}
            </motion.div>
          </AnimatePresence>
        </div>
      </PullToRefresh>

      {/* Bottom Sheet for Filters */}
      <BottomSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filter Properties"
        height="half"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <div className="space-y-2">
              {['All', 'Active', 'Maintenance', 'Full'].map((status) => (
                <label key={status} className="flex items-center gap-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-sm text-gray-900 dark:text-white">{status}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="pt-4">
            <MobileButton onClick={() => setShowFilters(false)} fullWidth>
              Apply Filters
            </MobileButton>
          </div>
        </div>
      </BottomSheet>
    </MobileFormWrapper>
  )
}
