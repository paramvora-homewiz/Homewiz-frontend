'use client'

import React from 'react';
import { InlineOccupancyChart } from './analytics/InlineOccupancyChart';
import { InlineRevenueChart } from './analytics/InlineRevenueChart';
import { InlineAnalyticsGrid } from './analytics/InlineAnalyticsGrid';
import { InlinePropertyComparison } from './analytics/InlinePropertyComparison';
import SmartDataVisualizer from './SmartDataVisualizer';

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
  
  // Check if content contains raw JSON data
  const containsRawData = React.useMemo(() => {
    // Check if content looks like JSON
    const trimmedContent = content.trim();
    return (trimmedContent.startsWith('{') && trimmedContent.endsWith('}')) ||
           (trimmedContent.startsWith('[') && trimmedContent.endsWith(']')) ||
           content.includes('"Analytics Data"') ||
           content.includes('"total_leads"') ||
           content.includes('"conversion_rate"') ||
           content.includes('"revenue"') ||
           content.includes('"occupancy"');
  }, [content]);
  
  // Try to parse JSON from content
  const parsedContentData = React.useMemo(() => {
    if (!containsRawData) return null;
    
    try {
      // Try to extract JSON from the content
      const jsonMatch = content.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // If parsing fails, return null
    }
    return null;
  }, [content, containsRawData]);

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

  // Check if we have raw data to display
  if (parsedContentData) {
    const textBeforeJson = content.substring(0, content.indexOf(JSON.stringify(parsedContentData).charAt(0)));
    const textAfterJson = content.substring(content.lastIndexOf(JSON.stringify(parsedContentData).slice(-1)) + 1);
    
    return (
      <div className="space-y-4">
        {/* Text before JSON */}
        {textBeforeJson.trim() && (
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{textBeforeJson.trim()}</p>
          </div>
        )}
        
        {/* Smart Data Visualization */}
        <SmartDataVisualizer 
          data={parsedContentData} 
          title="Analytics Data"
          className="my-4"
        />
        
        {/* Text after JSON */}
        {textAfterJson.trim() && (
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{textAfterJson.trim()}</p>
          </div>
        )}
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