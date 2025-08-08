'use client'

import React from 'react';
import { Building, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface InlinePropertyComparisonProps {
  buildings: Array<{
    name: string;
    occupancy_rate: number;
    occupied: number;
    total: number;
  }>;
}

export function InlinePropertyComparison({ buildings }: InlinePropertyComparisonProps) {
  const avgOccupancy = buildings.length > 0 
    ? buildings.reduce((sum, b) => sum + b.occupancy_rate, 0) / buildings.length 
    : 0;

  const getPerformanceIndicator = (rate: number) => {
    const diff = rate - avgOccupancy;
    if (Math.abs(diff) < 2) return { icon: Minus, color: 'text-gray-500', label: 'Average' };
    if (diff > 0) return { icon: TrendingUp, color: 'text-green-600', label: 'Above Avg' };
    return { icon: TrendingDown, color: 'text-red-600', label: 'Below Avg' };
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Property Performance</h3>
        <Building className="w-5 h-5 text-gray-400" />
      </div>

      {buildings.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No property data available</p>
      ) : (
        <>
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Portfolio Average</span>
              <span className="text-xl font-bold text-gray-900">{avgOccupancy.toFixed(1)}%</span>
            </div>
          </div>

          <div className="space-y-2">
            {buildings.map((building, index) => {
              const performance = getPerformanceIndicator(building.occupancy_rate);
              const Icon = performance.icon;
              
              return (
                <div key={index} className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{building.name}</h4>
                    <div className={`flex items-center ${performance.color}`}>
                      <Icon className="w-3 h-3 mr-1" />
                      <span className="text-xs font-medium">{performance.label}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-600">Occupancy</span>
                    <span className="text-sm font-bold text-gray-900">{building.occupancy_rate}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        building.occupancy_rate >= 90 
                          ? 'bg-gradient-to-r from-green-500 to-green-600'
                          : building.occupancy_rate >= 70
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                          : 'bg-gradient-to-r from-orange-500 to-orange-600'
                      }`}
                      style={{ width: `${building.occupancy_rate}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{building.occupied} occupied</span>
                    <span>{building.total - building.occupied} vacant</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}