'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, DollarSign, Building, Users, 
  BarChart3, PieChart, Activity, Home, Target, AlertCircle,
  CheckCircle, XCircle, Info
} from 'lucide-react';
import { parseAnalyticsResponse, formatCurrency, formatPercentage } from '@/lib/analytics-formatter';

interface EnhancedAnalyticsDisplayProps {
  data: any;
  content?: string;
}

export default function EnhancedAnalyticsDisplay({ data, content }: EnhancedAnalyticsDisplayProps) {
  // Parse the analytics response
  const formattedData = parseAnalyticsResponse(data);
  
  if (!formattedData) {
    return <RawDataDisplay data={data} />;
  }
  
  // Render based on analytics type
  switch (formattedData.type) {
    case 'financial':
      return <FinancialAnalyticsDisplay data={formattedData} />;
    case 'occupancy':
      return <OccupancyAnalyticsDisplay data={formattedData} />;
    case 'tenant':
      return <TenantAnalyticsDisplay data={formattedData} />;
    case 'room_performance':
      return <RoomPerformanceDisplay data={formattedData} />;
    default:
      return <GenericAnalyticsDisplay data={formattedData} />;
  }
}

// Financial Analytics Display
const FinancialAnalyticsDisplay: React.FC<{ data: any }> = ({ data }) => {
  const { data: analyticsData, summary } = data;
  const byBuilding = analyticsData.by_building || [];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-6"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Financial Analytics</h2>
            <p className="text-green-100">Revenue performance and insights</p>
          </div>
          <DollarSign className="w-12 h-12 text-white/20" />
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Potential Revenue"
          value={formatCurrency(analyticsData.total_potential_revenue)}
          icon={TrendingUp}
          color="bg-blue-500"
          trend={analyticsData.total_potential_revenue > 0 ? 'up' : 'neutral'}
        />
        <MetricCard
          title="Actual Revenue"
          value={formatCurrency(analyticsData.actual_revenue)}
          icon={DollarSign}
          color="bg-green-500"
        />
        <MetricCard
          title="Realization Rate"
          value={formatPercentage(analyticsData.revenue_realization_rate / 100)}
          icon={Target}
          color={getRealizationRateColor(analyticsData.revenue_realization_rate)}
          trend={getRealizationRateTrend(analyticsData.revenue_realization_rate)}
        />
      </div>
      
      {/* Building Breakdown */}
      {byBuilding.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Revenue by Building
          </h3>
          <div className="space-y-4">
            {byBuilding.map((building: any, idx: number) => (
              <BuildingRevenueCard key={idx} building={building} index={idx} />
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

// Building Revenue Card Component
const BuildingRevenueCard: React.FC<{ building: any; index: number }> = ({ building, index }) => {
  const realizationRate = building.revenue_realization_rate || 0;
  const isGood = realizationRate >= 70;
  const isMedium = realizationRate >= 50 && realizationRate < 70;
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="border rounded-xl p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">{building.building_name}</h4>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isGood ? 'bg-green-100 text-green-700' :
          isMedium ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {realizationRate.toFixed(1)}% realized
        </div>
      </div>
      
      {/* Revenue Bar Chart */}
      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Potential</span>
          <span className="font-medium">{formatCurrency(building.total_potential_revenue)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-gray-400 h-2 rounded-full" style={{ width: '100%' }} />
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Actual</span>
          <span className="font-medium">{formatCurrency(building.actual_revenue)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${realizationRate}%` }}
            transition={{ duration: 1, delay: index * 0.1 }}
            className={`h-2 rounded-full ${
              isGood ? 'bg-green-500' :
              isMedium ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
          />
        </div>
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Avg Rent</span>
        <span className="font-medium">{formatCurrency(building.avg_private_rent)}</span>
      </div>
    </motion.div>
  );
};

// Metric Card Component
const MetricCard: React.FC<{
  title: string;
  value: string;
  icon: any;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
}> = ({ title, value, icon: Icon, color, trend }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-xl shadow-md p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500 mr-1" />}
              {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500 mr-1" />}
              <span className={`text-sm ${
                trend === 'up' ? 'text-green-600' :
                trend === 'down' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {trend === 'up' ? 'Increasing' :
                 trend === 'down' ? 'Decreasing' :
                 'Stable'}
              </span>
            </div>
          )}
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
};

// Occupancy Analytics Display
const OccupancyAnalyticsDisplay: React.FC<{ data: any }> = ({ data }) => {
  const { data: analyticsData } = data;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-6"
    >
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Occupancy Analytics</h2>
        <p className="text-blue-100">Room occupancy and availability insights</p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Rooms"
          value={analyticsData.total_rooms.toString()}
          icon={Home}
          color="bg-gray-500"
        />
        <MetricCard
          title="Occupied"
          value={analyticsData.occupied_rooms.toString()}
          icon={CheckCircle}
          color="bg-green-500"
        />
        <MetricCard
          title="Available"
          value={analyticsData.available_rooms.toString()}
          icon={Activity}
          color="bg-blue-500"
        />
        <MetricCard
          title="Occupancy Rate"
          value={formatPercentage(analyticsData.occupancy_rate / 100)}
          icon={PieChart}
          color="bg-purple-500"
        />
      </div>
    </motion.div>
  );
};

// Tenant Analytics Display
const TenantAnalyticsDisplay: React.FC<{ data: any }> = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white mb-6">
        <h2 className="text-2xl font-bold mb-2">Tenant Analytics</h2>
        <p className="text-purple-100">Tenant insights and metrics</p>
      </div>
      <RawDataDisplay data={data.data} formatted />
    </motion.div>
  );
};

// Room Performance Display
const RoomPerformanceDisplay: React.FC<{ data: any }> = ({ data }) => {
  const priceComparison = data.data.price_comparison_by_building || [];
  
  if (priceComparison.length === 0) {
    return <RawDataDisplay data={data.data} />;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-6"
    >
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Room Performance</h2>
        <p className="text-orange-100">Price comparison and performance metrics</p>
      </div>
      
      <div className="space-y-4">
        {priceComparison.map((building: any, idx: number) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h3 className="font-bold text-gray-900 mb-4">{building.building_name}</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Lowest Price</p>
                <p className="text-xl font-bold text-green-600">
                  ${building.least_expensive.price}
                </p>
                <p className="text-sm text-gray-500">Room {building.least_expensive.room_number}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Highest Price</p>
                <p className="text-xl font-bold text-red-600">
                  ${building.most_expensive.price}
                </p>
                <p className="text-sm text-gray-500">Room {building.most_expensive.room_number}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Price Range</p>
                <p className="text-xl font-bold text-gray-900">${building.price_range}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// Generic Analytics Display
const GenericAnalyticsDisplay: React.FC<{ data: any }> = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="bg-gradient-to-r from-gray-600 to-gray-800 rounded-xl p-6 text-white mb-6">
        <h2 className="text-2xl font-bold mb-2">{data.title}</h2>
        <p className="text-gray-200">Analytics and insights</p>
      </div>
      <RawDataDisplay data={data.data} formatted />
    </motion.div>
  );
};

// Raw Data Display Component
const RawDataDisplay: React.FC<{ data: any; formatted?: boolean }> = ({ data, formatted }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  // Format the data for display
  const displayData = React.useMemo(() => {
    if (typeof data === 'string') return data;
    return JSON.stringify(data, null, 2);
  }, [data]);
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-50 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Info className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">
            {formatted ? 'Detailed Data' : 'Raw Data Response'}
          </h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
            <code>{displayData}</code>
          </pre>
        </motion.div>
      )}
      
      {!isExpanded && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600">
            Click expand to view the complete data structure
          </p>
        </div>
      )}
    </motion.div>
  );
};

// Helper functions
const getRealizationRateColor = (rate: number): string => {
  if (rate >= 70) return 'bg-green-500';
  if (rate >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
};

const getRealizationRateTrend = (rate: number): 'up' | 'down' | 'neutral' => {
  if (rate >= 70) return 'up';
  if (rate < 50) return 'down';
  return 'neutral';
};