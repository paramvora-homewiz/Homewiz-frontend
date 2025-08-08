'use client'

import React from 'react';
import { InlineOccupancyChart } from './analytics/InlineOccupancyChart';
import { InlineRevenueChart } from './analytics/InlineRevenueChart';
import { InlineAnalyticsGrid } from './analytics/InlineAnalyticsGrid';
import { InlinePropertyComparison } from './analytics/InlinePropertyComparison';

interface MessageRendererProps {
  content: string;
  metadata?: any;
  role: 'user' | 'assistant' | 'system';
}

export function MessageRenderer({ content, metadata, role }: MessageRendererProps) {
  // Check if the message contains analytics data
  const hasAnalyticsData = metadata?.analytics_data || metadata?.has_analytics;
  const analyticsType = metadata?.analytics_type;
  const analyticsData = metadata?.analytics_data;

  // For user messages, just render the content
  if (role === 'user') {
    return (
      <div className="prose prose-sm max-w-none">
        <p className="text-white whitespace-pre-wrap leading-relaxed">{content}</p>
      </div>
    );
  }

  // For assistant messages with analytics
  if (hasAnalyticsData && analyticsData) {
    return (
      <div className="space-y-4">
        {/* Text content */}
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{content}</p>
        </div>

        {/* Analytics visualizations */}
        <div className="mt-4">
          {analyticsType === 'occupancy' && (
            <InlineOccupancyChart data={analyticsData} />
          )}
          
          {analyticsType === 'financial' && (
            <InlineRevenueChart data={analyticsData} />
          )}
          
          {analyticsType === 'metrics' && (
            <InlineAnalyticsGrid 
              data={analyticsData} 
              type={analyticsData.type || 'all'} 
            />
          )}

          {analyticsType === 'dashboard' && (
            <div className="space-y-3">
              {analyticsData.occupancy && (
                <InlineOccupancyChart data={analyticsData.occupancy} />
              )}
              {analyticsData.financial && (
                <InlineRevenueChart data={analyticsData.financial} />
              )}
              {analyticsData.buildings && (
                <InlinePropertyComparison buildings={analyticsData.buildings} />
              )}
              {analyticsData.metrics && (
                <InlineAnalyticsGrid data={analyticsData.metrics} type="all" />
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default rendering for regular messages
  return (
    <div className="prose prose-sm max-w-none">
      <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{content}</p>
    </div>
  );
}