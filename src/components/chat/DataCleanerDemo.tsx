'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Code, Eye, Copy } from 'lucide-react';
import SmartDataVisualizer from './SmartDataVisualizer';
import { extractRelevantData, formatBackendResponse } from '@/lib/clean-backend-response';

// Demo component to show before/after data cleaning
export default function DataCleanerDemo() {
  const [showRaw, setShowRaw] = useState(false);
  
  // Sample messy backend response
  const messyData = {
    success: true,
    backend_success: true,
    function_called: "analytics_query",
    tokens_used: 1543,
    model: "gpt-4",
    authenticated: true,
    auth_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    result: {
      success: true,
      data: {
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
      },
      _internal_id: "abc123",
      processing_time: 234,
      cache_hit: false,
      timestamp: "2024-01-13T12:00:00Z"
    },
    raw_query: "Show me lead conversion analytics",
    debug: { sql_executed: true, rows_scanned: 1543 },
    __v: 0
  };
  
  // Clean the data
  const cleanedData = extractRelevantData(messyData);
  const { displayType, title } = formatBackendResponse(messyData);
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Cleaning Demo</h2>
        <p className="text-gray-600">See how we transform messy backend data into beautiful UI</p>
      </div>
      
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setShowRaw(false)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            !showRaw 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Eye className="w-4 h-4 inline mr-2" />
          Clean View
        </button>
        <button
          onClick={() => setShowRaw(true)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            showRaw 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Code className="w-4 h-4 inline mr-2" />
          Raw Data
        </button>
      </div>
      
      <motion.div
        key={showRaw ? 'raw' : 'clean'}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {showRaw ? (
          <div className="bg-gray-900 text-gray-100 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4 text-red-400">
              ❌ What users see without cleaning (BAD)
            </h3>
            <pre className="text-xs overflow-x-auto">
              {JSON.stringify(messyData, null, 2)}
            </pre>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold mb-4 text-green-600">
              ✅ What users see with our cleaning (GOOD)
            </h3>
            <SmartDataVisualizer 
              data={cleanedData}
              title={title}
            />
          </div>
        )}
      </motion.div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> The cleaning process removes {Object.keys(messyData).length - Object.keys(cleanedData).length} internal fields
          and presents only user-relevant data in a beautiful format.
        </p>
      </div>
    </div>
  );
}