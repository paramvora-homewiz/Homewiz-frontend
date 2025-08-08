'use client'

import React from 'react';
import { DollarSign, TrendingUp } from 'lucide-react';

interface InlineRevenueChartProps {
  data: any;
}

export function InlineRevenueChart({ data }: InlineRevenueChartProps) {
  const monthlyData = data.revenue_by_month || [];
  const maxRevenue = Math.max(...monthlyData.map((d: any) => d.revenue || 0), 100000);

  return (
    <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Revenue Analytics</h3>
        <DollarSign className="w-5 h-5 text-gray-400" />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Total Revenue</p>
          <p className="text-lg font-bold text-gray-900">
            ${(data.total_revenue || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Avg. Rent</p>
          <p className="text-lg font-bold text-gray-900">
            ${(data.average_rent || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Growth</p>
          <p className="text-lg font-bold text-green-600 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            {data.revenue_growth || 0}%
          </p>
        </div>
      </div>

      {/* Revenue Chart */}
      {monthlyData.length > 0 && (
        <>
          <p className="text-sm text-gray-600 mb-2">Monthly Revenue Trend</p>
          <div className="relative h-32">
            <div className="absolute inset-0 flex items-end justify-between space-x-1">
              {monthlyData.slice(-6).map((item: any, index: number) => (
                <div key={index} className="flex-1 flex flex-col items-center group">
                  <div className="relative w-full">
                    <div
                      className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t hover:from-green-600 hover:to-green-500 transition-colors"
                      style={{ height: `${(item.revenue / maxRevenue) * 128}px` }}
                    />
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      ${(item.revenue || 0).toLocaleString()}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Projected Revenue */}
      {data.projected_revenue && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Projected Next Month</p>
              <p className="text-lg font-bold text-gray-900">
                ${data.projected_revenue.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">Target Progress</p>
              <div className="flex items-center mt-1">
                <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                    style={{ width: '85%' }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-700">85%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}