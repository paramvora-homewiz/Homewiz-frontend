'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Home, Users, Building, TrendingUp, Calendar, 
  PieChart, CheckCircle, Clock, Target, Award, 
  DoorOpen, DoorClosed, Activity
} from 'lucide-react';

interface OccupancyData {
  total_rooms: number;
  total_rentable_rooms: number;
  available_rooms: number;
  occupied_rooms: number;
  occupancy_rate: number;
}

interface OccupancyReportProps {
  data: OccupancyData;
}

export default function OccupancyReportRenderer({ data }: OccupancyReportProps) {
  // Safely parse numbers with fallback
  const safeNumber = (value: any, fallback: number = 0): number => {
    const num = Number(value);
    return isNaN(num) || value === null || value === undefined ? fallback : num;
  };

  // Safe values with fallbacks
  const totalRooms = safeNumber(data?.total_rooms, 0);
  const totalRentableRooms = safeNumber(data?.total_rentable_rooms, totalRooms); // Fallback to total_rooms
  const availableRooms = safeNumber(data?.available_rooms, 0);
  const occupiedRooms = safeNumber(data?.occupied_rooms, 0);
  const occupancyRate = safeNumber(data?.occupancy_rate, 0);

  // Calculate additional metrics with safe division
  const availabilityRate = totalRentableRooms > 0 ? Math.round((availableRooms / totalRentableRooms) * 100) : 0;
  const utilizationRate = totalRooms > 0 ? Math.round((totalRentableRooms / totalRooms) * 100) : 100;
  const occupiedPercentage = Math.round(occupancyRate);
  
  // Determine occupancy status
  const getOccupancyStatus = (rate: number) => {
    if (rate >= 90) return { label: 'Excellent', color: 'green', bg: 'bg-green-100', text: 'text-green-600' };
    if (rate >= 75) return { label: 'Good', color: 'blue', bg: 'bg-blue-100', text: 'text-blue-600' };
    if (rate >= 60) return { label: 'Fair', color: 'yellow', bg: 'bg-yellow-100', text: 'text-yellow-600' };
    return { label: 'Low', color: 'red', bg: 'bg-red-100', text: 'text-red-600' };
  };

  const occupancyStatus = getOccupancyStatus(occupancyRate);

  // Check if we have any valid data
  const hasValidData = totalRooms > 0 || occupiedRooms > 0 || availableRooms > 0;

  if (!data || !hasValidData) {
    return (
      <div className="w-full">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Building className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">No Occupancy Data Available</h3>
              <p className="text-sm text-gray-600 mt-1">
                Occupancy data is not available for this building. Please ensure the building ID is correct or try again later.
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
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Occupancy Report</h2>
            <p className="text-indigo-100">
              Real-time property utilization metrics
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">
              {occupiedPercentage}%
            </div>
            <div className="text-indigo-100 text-sm">Occupied</div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mt-2 ${occupancyStatus.bg} ${occupancyStatus.text}`}>
              {occupancyStatus.label}
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Rooms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Rooms</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalRooms.toLocaleString()}
              </p>
              <p className="text-gray-500 text-sm">All units in portfolio</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-full">
              <Building className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </motion.div>

        {/* Rentable Rooms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Rentable Rooms</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalRentableRooms.toLocaleString()}
              </p>
              <p className="text-blue-600 text-sm">{utilizationRate}% of total</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Home className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        {/* Occupied Rooms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Occupied</p>
              <p className="text-2xl font-bold text-gray-900">
                {occupiedRooms.toLocaleString()}
              </p>
              <p className="text-green-600 text-sm">Revenue generating</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DoorClosed className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        {/* Available Rooms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Available</p>
              <p className="text-2xl font-bold text-gray-900">
                {availableRooms.toLocaleString()}
              </p>
              <p className="text-orange-600 text-sm">Ready to lease</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <DoorOpen className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Occupancy Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Occupancy Breakdown</h3>
          <PieChart className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="space-y-4">
          {/* Occupied Bar */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Occupied Rooms</span>
              <span className="font-medium">{occupiedRooms} ({occupiedPercentage}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-green-500 h-4 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                style={{ width: `${occupiedPercentage}%` }}
              >
                <span className="text-white text-xs font-medium">
                  {occupiedPercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Available Bar */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Available Rooms</span>
              <span className="font-medium">{availableRooms} ({availabilityRate}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-orange-500 h-4 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                style={{ width: `${availabilityRate}%` }}
              >
                <span className="text-white text-xs font-medium">
                  {availabilityRate}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Room Grid */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Visual Room Status</h4>
          <div className="grid grid-cols-10 gap-1">
            {Array.from({ length: 100 }, (_, i) => {
              const isOccupied = i < occupiedPercentage;
              return (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-sm ${
                    isOccupied ? 'bg-green-400' : 'bg-gray-200'
                  } transition-colors duration-100`}
                  style={{ animationDelay: `${i * 10}ms` }}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-400 rounded-sm mr-1"></div>
              <span>Occupied ({occupiedPercentage}%)</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-200 rounded-sm mr-1"></div>
              <span>Available ({100 - occupiedPercentage}%)</span>
            </div>
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
          <Target className="w-5 h-5 text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Performance Insights</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-indigo-600 mb-1">
              {utilizationRate}%
            </div>
            <div className="text-sm text-gray-600">Portfolio utilization rate</div>
            <div className="text-xs text-gray-500 mt-1">
              {totalRentableRooms} of {totalRooms} rooms rentable
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Overall occupancy</div>
            <div className="text-xs text-gray-500 mt-1">
              Including non-rentable units
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {totalRooms - totalRentableRooms}
            </div>
            <div className="text-sm text-gray-600">Non-rentable units</div>
            <div className="text-xs text-gray-500 mt-1">
              Maintenance, common areas, etc.
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}