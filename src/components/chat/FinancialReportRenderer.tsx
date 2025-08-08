'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, TrendingUp, Building, Users, Calendar, 
  PieChart, BarChart3, Home, Target, Award
} from 'lucide-react';

interface FinancialData {
  occupied_room_count: number;
  total_private_rent: number;
  total_shared_rent: number;
  avg_private_rent: number;
  avg_shared_rent: number;
  estimated_monthly_revenue: number;
  period_start: string;
  period_end: string;
}

interface FinancialReportProps {
  data: FinancialData;
  period?: string;
}

export default function FinancialReportRenderer({ data, period }: FinancialReportProps) {
  // Safely parse numbers with fallback
  const safeNumber = (value: any, fallback: number = 0): number => {
    const num = Number(value);
    return isNaN(num) || value === null || value === undefined ? fallback : num;
  };

  // Safe values with fallbacks
  const occupiedRooms = safeNumber(data?.occupied_room_count, 0);
  const totalPrivateRent = safeNumber(data?.total_private_rent, 0);
  const totalSharedRent = safeNumber(data?.total_shared_rent, 0);
  const avgPrivateRent = safeNumber(data?.avg_private_rent, 0);
  const avgSharedRent = safeNumber(data?.avg_shared_rent, 0);
  const monthlyRevenue = safeNumber(data?.estimated_monthly_revenue, 0);

  // Calculate additional metrics with safe division
  const totalRevenue = monthlyRevenue || (totalPrivateRent + totalSharedRent);
  const occupancyPercentage = occupiedRooms > 0 ? Math.round((occupiedRooms / (occupiedRooms + 10)) * 100) : 0;
  const privateRentShare = totalRevenue > 0 ? Math.round((totalPrivateRent / totalRevenue) * 100) : 0;
  const sharedRentShare = totalRevenue > 0 ? Math.round((totalSharedRent / totalRevenue) * 100) : 0;
  
  // Format currency with null check
  const formatCurrency = (amount: number) => {
    if (amount === 0 || !amount) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date with error handling
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date not available';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Check if we have any valid data
  const hasValidData = totalRevenue > 0 || occupiedRooms > 0 || totalPrivateRent > 0 || totalSharedRent > 0;

  if (!data || !hasValidData) {
    return (
      <div className="w-full">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-100 rounded-full">
              <BarChart3 className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">No Financial Data Available</h3>
              <p className="text-sm text-gray-600 mt-1">
                Financial data is not available at this time. Please try again later or contact support if this issue persists.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Financial Report</h2>
            <p className="text-blue-100">
              {formatDate(data.period_start)} - {formatDate(data.period_end)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              {formatCurrency(monthlyRevenue)}
            </div>
            <div className="text-blue-100 text-sm">Monthly Revenue</div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Private Rent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Private Rent</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalPrivateRent)}
              </p>
              <p className="text-green-600 text-sm">{privateRentShare}% of total</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Home className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        {/* Total Shared Rent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Shared Rent</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalSharedRent)}
              </p>
              <p className="text-blue-600 text-sm">{sharedRentShare}% of total</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        {/* Average Private Rent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Avg Private</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(avgPrivateRent)}
              </p>
              <p className="text-gray-500 text-sm">per room</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        {/* Occupied Rooms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Occupied Rooms</p>
              <p className="text-2xl font-bold text-gray-900">
                {occupiedRooms}
              </p>
              <p className="text-orange-600 text-sm">rooms generating revenue</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Building className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Revenue Breakdown Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Revenue Breakdown</h3>
          <PieChart className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          {/* Private Rent Bar */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Private Room Rent</span>
              <span className="font-medium">{formatCurrency(totalPrivateRent)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-green-500 h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(Math.max(privateRentShare, 0), 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">{privateRentShare}% of total revenue</div>
          </div>

          {/* Shared Rent Bar */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Shared Room Rent</span>
              <span className="font-medium">{formatCurrency(totalSharedRent)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(Math.max(sharedRentShare, 0), 100)}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">{sharedRentShare}% of total revenue</div>
          </div>
        </div>
      </motion.div>

      {/* Performance Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gray-50 rounded-lg p-6"
      >
        <div className="flex items-center mb-4">
          <Award className="w-5 h-5 text-yellow-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Key Insights</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {occupiedRooms > 0 ? formatCurrency(monthlyRevenue / occupiedRooms) : '$0'}
            </div>
            <div className="text-sm text-gray-600">Revenue per occupied room</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {avgSharedRent > 0 ? `${(Math.round(avgPrivateRent / avgSharedRent * 100) / 100).toFixed(2)}x` : 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Private vs shared rent ratio</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {formatCurrency(monthlyRevenue * 12)}
            </div>
            <div className="text-sm text-gray-600">Projected annual revenue</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}