'use client';

import React, { useState } from 'react';
import SmartDataVisualizer from '@/components/chat/SmartDataVisualizer';
import { Eye, Code } from 'lucide-react';

export default function DemoUIPage() {
  const [activeDemo, setActiveDemo] = useState<'financial' | 'lead'>('financial');

  // Sample financial data
  const financialData = {
    total_potential_revenue: 28865,
    actual_revenue: 7986,
    revenue_realization_rate: 27.66,
    by_building: [
      {
        building_name: "1000 Folsom Residences",
        total_potential_revenue: 16845,
        actual_revenue: 2985,
        revenue_realization_rate: 17.72,
        avg_private_rent: 995
      },
      {
        building_name: "221 7th Street Residences",
        total_potential_revenue: 10845,
        actual_revenue: 3980,
        revenue_realization_rate: 36.70,
        avg_private_rent: 995
      },
      {
        building_name: "233 Folsom Residences",
        total_potential_revenue: 1175,
        actual_revenue: 1021,
        revenue_realization_rate: 86.89,
        avg_private_rent: 850
      }
    ]
  };

  // Sample lead data
  const leadData = {
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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Beautiful UI Demo
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            See how your backend data transforms into stunning visualizations
          </p>
          
          {/* Demo Selector */}
          <div className="inline-flex rounded-lg shadow-sm" role="group">
            <button
              onClick={() => setActiveDemo('financial')}
              className={`px-6 py-3 text-sm font-medium rounded-l-lg border ${
                activeDemo === 'financial'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Financial Analytics
            </button>
            <button
              onClick={() => setActiveDemo('lead')}
              className={`px-6 py-3 text-sm font-medium rounded-r-lg border-t border-b border-r ${
                activeDemo === 'lead'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Lead Conversion
            </button>
          </div>
        </div>

        {/* Active Demo */}
        <div className="space-y-8">
          {activeDemo === 'financial' ? (
            <>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Financial Report - Beautiful UI
                </h2>
                <p className="text-gray-600 mb-6">
                  Notice the colorful cards, progress bars, and formatted currency values
                </p>
                <SmartDataVisualizer 
                  data={financialData}
                  title="Monthly Revenue Analysis"
                />
              </div>
              
              <div className="bg-gray-900 p-6 rounded-xl">
                <h3 className="text-xl font-semibold text-gray-100 mb-4">
                  Same Data - Raw JSON (What we DON\'T want to show)
                </h3>
                <pre className="text-sm text-gray-300 overflow-x-auto">
{JSON.stringify(financialData, null, 2)}
                </pre>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Lead Conversion - Beautiful UI
                </h2>
                <p className="text-gray-600 mb-6">
                  See the metric cards with icons, status breakdown, and conversion funnel
                </p>
                <SmartDataVisualizer 
                  data={leadData}
                  title="Lead Performance Analytics"
                />
              </div>
              
              <div className="bg-gray-900 p-6 rounded-xl">
                <h3 className="text-xl font-semibold text-gray-100 mb-4">
                  Same Data - Raw JSON (What we DON\'T want to show)
                </h3>
                <pre className="text-sm text-gray-300 overflow-x-auto">
{JSON.stringify(leadData, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Smart Detection</h3>
            <p className="text-gray-600">
              Automatically detects data type and chooses the best visualization
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Code className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Clean Data</h3>
            <p className="text-gray-600">
              Filters out internal fields and shows only relevant information
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Beautiful Design</h3>
            <p className="text-gray-600">
              Gradient cards, animations, and modern UI components
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}