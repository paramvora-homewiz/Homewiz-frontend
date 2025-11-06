'use client';

import React from 'react';
import SmartDataVisualizer from '@/components/chat/SmartDataVisualizer';

export default function TestDataPage() {
  // Test with the actual data structure from the screenshot
  const testData1 = {
    total_potential_revenue: 28865,
    actual_revenue: 7960,
    realization_rate: 0.2757,
    by_building: [
      {
        building_id: "123e4567-e89b-12d3-a456-426614174000",
        building_name: "1080 Folsom Residences",
        total_potential_revenue: 20895,
        actual_revenue: 7960,
        avg_private_rent: 995,
        revenue_realization_rate: 38.1
      }
    ]
  };

  // Test with different percentage format
  const testData2 = {
    total_potential_revenue: 60915,
    actual_revenue: 28865,
    revenue_realization_rate: 47.4,
    by_building: [
      {
        building_name: "Building A",
        total_potential_revenue: 30000,
        actual_revenue: 15000,
        revenue_realization_rate: 50.0
      },
      {
        building_name: "Building B", 
        total_potential_revenue: 30915,
        actual_revenue: 13865,
        revenue_realization_rate: 44.8
      }
    ]
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-8">Smart Data Visualizer Test</h1>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">Test 1: Real Backend Data Structure (27.57% as 0.2757)</h2>
          <SmartDataVisualizer 
            data={testData1}
            title="Financial Report Test 1"
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Test 2: Alternative Format (47.4% as 47.4)</h2>
          <SmartDataVisualizer 
            data={testData2}
            title="Financial Report Test 2"
          />
        </div>
      </div>
    </div>
  );
}