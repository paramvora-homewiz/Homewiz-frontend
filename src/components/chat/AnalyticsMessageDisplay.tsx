'use client';

import React from 'react';
import SmartDataVisualizer from './SmartDataVisualizer';
import QueryResponseMismatchDetector from './QueryResponseMismatchDetector';

interface AnalyticsMessageDisplayProps {
  message: any;
  className?: string;
  userQuery?: string;
}

export default function AnalyticsMessageDisplay({ message, className = '', userQuery }: AnalyticsMessageDisplayProps) {
  console.log('📍 AnalyticsMessageDisplay received:', {
    hasMessage: !!message,
    hasUserQuery: !!userQuery,
    userQuery: userQuery,
    className
  });
  
  // Extract data from different possible locations in the message structure
  const extractAnalyticsData = () => {
    console.log('🔎 Extracting analytics data from message:', {
      message,
      hasMetadata: !!message.metadata,
      hasResult: !!message.metadata?.result,
      hasData: !!message.metadata?.data,
      contentPreview: message.content?.substring(0, 100)
    });
    
    // Check if data is in result.data
    if (message.metadata?.result?.data && typeof message.metadata.result.data === 'object') {
      console.log('📊 Found data in result.data:', message.metadata.result.data);
      return message.metadata.result.data;
    }
    
    // Check if data is directly in result
    if (message.metadata?.result && typeof message.metadata.result === 'object') {
      // Look for analytics indicators
      const result = message.metadata.result;
      if (result.by_building || result.total_potential_revenue !== undefined || 
          result.total_leads !== undefined || result.insight_type) {
        console.log('📊 Found analytics data in result:', result);
        return result;
      }
    }
    
    // Check if data is in metadata.data
    if (message.metadata?.data && typeof message.metadata.data === 'object') {
      console.log('📊 Found data in metadata.data:', message.metadata.data);
      return message.metadata.data;
    }
    
    // Check if data is in metadata directly (for different backend response structures)
    if (message.metadata && typeof message.metadata === 'object') {
      const meta = message.metadata;
      if (meta.by_building || meta.total_potential_revenue !== undefined || 
          meta.total_leads !== undefined || meta.insight_type) {
        console.log('📊 Found analytics data in metadata:', meta);
        return meta;
      }
    }
    
    // Check the content for embedded JSON
    if (message.content && typeof message.content === 'string') {
      // Look for JSON patterns in the content
      const jsonMatch = message.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsedData = JSON.parse(jsonMatch[0]);
          console.log('📊 Parsed JSON from content:', parsedData);
          return parsedData;
        } catch (e) {
          console.error('Failed to parse JSON from content:', e);
        }
      }
    }
    
    console.log('❌ No analytics data found');
    return null;
  };
  
  const data = extractAnalyticsData();
  
  // Extract clean message text (remove JSON if present)
  const getCleanMessage = () => {
    if (!message.content) return '';
    
    // Remove JSON blocks
    let cleanContent = message.content
      .replace(/\{[\s\S]*\}/g, '')
      .replace(/```[\s\S]*?```/g, '')
      .trim();
    
    // Get first meaningful sentence
    const sentences = cleanContent.split('.');
    if (sentences.length > 0 && sentences[0].trim()) {
      return sentences[0].trim() + '.';
    }
    
    return 'Here are the results:';
  };
  
  const cleanMessage = getCleanMessage();
  const showVisualization = data && (
    data.by_building || 
    data.total_potential_revenue !== undefined ||
    data.total_leads !== undefined ||
    data.insight_type
  );
  
  if (!showVisualization) {
    // Fallback to original content if no analytics data found
    return <div className={className}>{message.content}</div>;
  }
  
  // Determine the appropriate title
  const getTitle = () => {
    if (data.insight_type === 'FINANCIAL' || data.total_potential_revenue !== undefined) {
      return 'Financial Analysis';
    }
    if (data.insight_type === 'LEAD_CONVERSION' || data.total_leads !== undefined) {
      return 'Lead Conversion Analysis';
    }
    if (data.insight_type) {
      return `${data.insight_type} Analysis`;
    }
    return 'Analytics Report';
  };
  
  const visualizer = (
    <SmartDataVisualizer 
      data={data}
      title={getTitle()}
      userQuery={userQuery}
    />
  );
  
  // If we have a user query, check for mismatches
  if (userQuery) {
    return (
      <div className="space-y-4">
        <div className={className}>
          {cleanMessage}
        </div>
        <QueryResponseMismatchDetector query={userQuery} responseData={data}>
          {visualizer}
        </QueryResponseMismatchDetector>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className={className}>
        {cleanMessage}
      </div>
      {visualizer}
    </div>
  );
}