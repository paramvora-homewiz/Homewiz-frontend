'use client';

import React from 'react';
import SmartDataVisualizer from '@/components/chat/SmartDataVisualizer';

export default function TestVisualizerPage() {
  // Test data for financial report
  const financialData = {
    insight_type: "FINANCIAL",
    total_potential_revenue: 28865,
    actual_revenue: 7986,
    revenue_realization_rate: 27.66,
    avg_private_rent: 905,
    max_rent: 995,
    min_rent: 0,
    by_building: [
      {
        building_id: 1,
        building_name: "BLDG_MAIN_FOLSOM",
        total_potential_revenue: 16845,
        actual_revenue: 2985,
        revenue_realization_rate: 17.72,
        avg_private_rent: 995
      },
      {
        building_id: 2,
        building_name: "BLDG_221_7TH",
        total_potential_revenue: 10845,
        actual_revenue: 3980,
        revenue_realization_rate: 36.70,
        avg_private_rent: 995
      },
      {
        building_id: 3,
        building_name: "BLDG_233_FOLSOM",
        total_potential_revenue: 1175,
        actual_revenue: 1021,
        revenue_realization_rate: 86.89,
        avg_private_rent: 850
      }
    ]
  };

  // Test data for lead conversion
  const leadData = {
    insight_type: "LEAD_CONVERSION",
    total_leads: 156,
    converted: 28,
    conversion_rate: 0.18,
    new_leads: 20,
    interested: 36,
    application_submitted: 26,
    rejected: 16,
    lost: 56,
    average_conversion_time: "10.67 days",
    by_source: {
      website: { leads: 45, converted: 12, rate: 0.27 },
      referral: { leads: 30, converted: 8, rate: 0.27 },
      walk_in: { leads: 25, converted: 5, rate: 0.20 },
      social_media: { leads: 56, converted: 3, rate: 0.05 }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Smart Data Visualizer Demo
          </h1>
          <p className="text-gray-600">
            See how raw backend data transforms into beautiful UI components
          </p>
        </div>

        {/* Financial Data Visualization */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Financial Analytics Report
          </h2>
          <SmartDataVisualizer 
            data={financialData}
            title="Monthly Revenue Analysis"
          />
        </div>

        {/* Lead Conversion Data Visualization */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Lead Conversion Analytics
          </h2>
          <SmartDataVisualizer 
            data={leadData}
            title="Lead Performance Report"
          />
        </div>

        {/* Raw JSON Example */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Generic Data (will show formatted cards)
          </h2>
          <SmartDataVisualizer 
            data={{
              total_rooms: 45,
              occupied_rooms: 38,
              available_rooms: 7,
              occupancy_rate: 84.4,
              average_rent: 895,
              total_revenue: 33610
            }}
            title="Property Overview"
          />
        </div>
      </div>
    </div>
  );
}