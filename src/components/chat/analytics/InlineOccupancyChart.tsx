'use client'

import React from 'react';
import { Building, Home } from 'lucide-react';

interface InlineOccupancyChartProps {
  data: any;
}

export function InlineOccupancyChart({ data }: InlineOccupancyChartProps) {
  const occupancyData = data.occupancy_by_month || [];
  const currentRate = data.current_occupancy_rate || 0;
  const maxOccupancy = 100;

  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Occupancy Rate</h3>
        <Building className="w-5 h-5 text-gray-400" />
      </div>

      {/* Current Occupancy */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Current Occupancy</span>
          <span className="text-2xl font-bold text-gray-900">{currentRate}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${
              currentRate >= 90 
                ? 'bg-gradient-to-r from-green-500 to-green-600'
                : currentRate >= 70
                ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                : 'bg-gradient-to-r from-orange-500 to-orange-600'
            }`}
            style={{ width: `${currentRate}%` }}
          />
        </div>
      </div>

      {/* Historical Chart */}
      {occupancyData.length > 0 && (
        <>
          <p className="text-sm text-gray-600 mb-2">Historical Trend</p>
          <div className="relative h-32">
            <div className="absolute inset-0 flex items-end justify-between space-x-1">
              {occupancyData.slice(-6).map((item: any, index: number) => (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div className="relative w-full">
                    <div
                      className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t hover:from-blue-600 hover:to-blue-500 transition-colors"
                      style={{ height: `${(item.occupancy_rate / maxOccupancy) * 128}px` }}
                    />
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {item.occupancy_rate}%
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t">
        <div className="text-center">
          <p className="text-xs text-gray-600">Occupied</p>
          <p className="text-sm font-bold text-gray-900">{data.occupied_units || 0}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600">Vacant</p>
          <p className="text-sm font-bold text-gray-900">{data.vacant_units || 0}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-600">Total Units</p>
          <p className="text-sm font-bold text-gray-900">{data.total_units || 0}</p>
        </div>
      </div>
    </div>
  );
}