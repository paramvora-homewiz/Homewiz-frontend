// Clean and filter backend responses to show only user-relevant data

// Fields that should NEVER be shown to users
const INTERNAL_FIELDS = [
  'success',
  'backend_success', 
  'supabase_direct',
  'function_called',
  'used_llm_parsing',
  'llm_formatted',
  'llm_insights',
  'llm_visualization',
  'backend_error',
  'tokens_used',
  'usage',
  'model',
  'messages',
  'temperature',
  'max_tokens',
  'stream',
  'response_format',
  'tools',
  'tool_choice',
  'authenticated',
  'authentication_required',
  'authentication_expires_at',
  'client_id',
  'raw_query',
  'generated_insights',
  'original_query',
  'query',
  'request_id',
  'timestamp',
  'processing_time',
  'cache_hit',
  'error',
  'stack',
  'code',
  'statusCode',
  'headers',
  'body',
  'url',
  'method',
  'params',
  'query_params',
  'body_params',
  'auth_token',
  'api_key',
  'secret',
  'password',
  'token',
  'session',
  'cookies',
  'debug',
  'verbose',
  'raw_response',
  'raw_data',
  'internal',
  '_id',
  '__v',
  'created_at',
  'updated_at',
  'deleted_at',
  'is_deleted'
];

// Clean a single object
export function cleanObject(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => cleanObject(item));
  }
  
  const cleaned: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Skip internal fields
    if (INTERNAL_FIELDS.includes(key)) continue;
    
    // Skip fields starting with underscore
    if (key.startsWith('_')) continue;
    
    // Skip null/undefined values
    if (value === null || value === undefined) continue;
    
    // Recursively clean nested objects
    if (typeof value === 'object') {
      const cleanedValue = cleanObject(value);
      if (cleanedValue && Object.keys(cleanedValue).length > 0) {
        cleaned[key] = cleanedValue;
      }
    } else {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
}

// Extract only the relevant data from backend response
export function extractRelevantData(response: any): any {
  // Handle direct result object (for analytics/financial data)
  if (response?.result && typeof response.result === 'object') {
    const result = response.result;
    
    // Check if result has analytics/financial indicators
    const keys = Object.keys(result);
    const hasAnalyticsData = 
      keys.includes('total_potential_revenue') ||
      keys.includes('actual_revenue') ||
      keys.includes('revenue_realization_rate') ||
      keys.includes('realization_rate') ||
      keys.includes('total_leads') ||
      keys.includes('conversion_rate') ||
      keys.includes('by_building') ||
      keys.includes('by_source') ||
      keys.includes('insight_type');
    
    if (hasAnalyticsData) {
      // Return the full result for analytics data
      return cleanObject(result);
    }
    
    // If result has a data field, check that too
    if (result.data) {
      return cleanObject(result.data);
    }
  }
  
  // Priority order for finding the actual data
  const dataLocations = [
    response?.result?.data,
    response?.data,
    response?.result,
    response
  ];
  
  for (const location of dataLocations) {
    if (location && typeof location === 'object') {
      // Check if this looks like actual data (not metadata)
      const keys = Object.keys(location);
      const hasDataIndicators = 
        keys.includes('total_leads') ||
        keys.includes('conversion_rate') ||
        keys.includes('revenue') ||
        keys.includes('occupancy') ||
        keys.includes('buildings') ||
        keys.includes('rooms') ||
        keys.includes('tenants') ||
        keys.includes('by_building') ||
        Array.isArray(location);
      
      if (hasDataIndicators) {
        return cleanObject(location);
      }
    }
  }
  
  // If no data found, return cleaned response
  return cleanObject(response);
}

// Format response for display
export function formatBackendResponse(response: any): {
  data: any;
  displayType: 'analytics' | 'list' | 'details' | 'empty';
  title?: string;
} {
  const data = extractRelevantData(response);
  
  // Determine display type
  let displayType: 'analytics' | 'list' | 'details' | 'empty' = 'details';
  let title = 'Results';
  
  if (!data || Object.keys(data).length === 0) {
    displayType = 'empty';
  } else if (data.insight_type || data.total_leads || data.conversion_rate || data.revenue) {
    displayType = 'analytics';
    title = data.insight_type ? `${data.insight_type} Analysis` : 'Analytics Report';
  } else if (Array.isArray(data) || (data.rooms && Array.isArray(data.rooms)) || (data.buildings && Array.isArray(data.buildings))) {
    displayType = 'list';
    title = 'Search Results';
  }
  
  return {
    data,
    displayType,
    title
  };
}