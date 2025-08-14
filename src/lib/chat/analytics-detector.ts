import { backendAnalyticsService } from './backend-analytics-service';

interface AnalyticsQuery {
  type: 'occupancy' | 'financial' | 'maintenance' | 'leads' | 'dashboard' | 'rooms' | 'tenants' | null;
  buildingId?: string;
  timeRange?: string;
}

export function detectAnalyticsQuery(query: string): AnalyticsQuery {
  const lowerQuery = query.toLowerCase();
  
  // Detect query type
  let type: AnalyticsQuery['type'] = null;
  
  if (lowerQuery.includes('occupancy') || lowerQuery.includes('vacant') || lowerQuery.includes('occupied')) {
    type = 'occupancy';
  } else if (lowerQuery.includes('revenue') || lowerQuery.includes('financial') || lowerQuery.includes('rent') || lowerQuery.includes('income') || lowerQuery.includes('money')) {
    type = 'financial';
  } else if (lowerQuery.includes('maintenance') || lowerQuery.includes('repair') || lowerQuery.includes('fix')) {
    type = 'maintenance';
  } else if (lowerQuery.includes('lead') || lowerQuery.includes('conversion') || lowerQuery.includes('inquiry')) {
    type = 'leads';
  } else if (lowerQuery.includes('room') && (lowerQuery.includes('performance') || lowerQuery.includes('status'))) {
    type = 'rooms';
  } else if (lowerQuery.includes('tenant')) {
    type = 'tenants';
  } else if (lowerQuery.includes('analytics') || lowerQuery.includes('metrics') || lowerQuery.includes('dashboard') || lowerQuery.includes('overview')) {
    type = 'dashboard';
  }
  
  // Extract building ID if mentioned
  let buildingId: string | undefined;
  const buildingMatch = query.match(/building\s+(\w+)/i);
  if (buildingMatch) {
    buildingId = buildingMatch[1];
  }
  
  return { type, buildingId };
}

export async function fetchAnalyticsData(query: AnalyticsQuery) {
  if (!query.type) return null;
  
  try {
    switch (query.type) {
      case 'occupancy':
        const occupancyData = await backendAnalyticsService.getOccupancyRate(query.buildingId);
        if (!occupancyData) return null;
        return {
          analytics_type: 'occupancy',
          analytics_data: occupancyData,
          has_analytics: true
        };
        
      case 'financial':
        const financialData = await backendAnalyticsService.getFinancialMetrics(query.buildingId);
        if (!financialData) return null;
        return {
          analytics_type: 'financial',
          analytics_data: financialData,
          has_analytics: true
        };
        
      case 'maintenance':
        const maintenanceData = await backendAnalyticsService.getMaintenanceMetrics(query.buildingId);
        if (!maintenanceData) return null;
        return {
          analytics_type: 'metrics',
          analytics_data: {
            ...maintenanceData,
            type: 'maintenance'
          },
          has_analytics: true
        };
        
      case 'leads':
        const leadData = await backendAnalyticsService.getLeadConversionMetrics();
        if (!leadData) return null;
        return {
          analytics_type: 'metrics',
          analytics_data: {
            ...leadData,
            type: 'leads'
          },
          has_analytics: true
        };
        
      case 'rooms':
        const roomData = await backendAnalyticsService.getRoomPerformanceMetrics(query.buildingId);
        if (!roomData) return null;
        return {
          analytics_type: 'metrics',
          analytics_data: {
            ...roomData,
            type: 'rooms'
          },
          has_analytics: true
        };
        
      case 'tenants':
        const tenantData = await backendAnalyticsService.getTenantMetrics(query.buildingId);
        if (!tenantData) return null;
        return {
          analytics_type: 'metrics',
          analytics_data: {
            ...tenantData,
            type: 'tenants'
          },
          has_analytics: true
        };
        
      case 'dashboard':
        const dashboardData = await backendAnalyticsService.getDashboardMetrics(query.buildingId);
        if (!dashboardData) return null;
        return {
          analytics_type: 'dashboard',
          analytics_data: dashboardData,
          has_analytics: true
        };
        
      default:
        return null;
    }
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return null;
  }
}

export function processBackendAnalyticsData(backendResponse: any): any {
  // Check if backend response contains analytics data from SQL query
  if (backendResponse?.result?.metadata?.has_analytics) {
    return {
      analytics_type: backendResponse.result.metadata.analytics_type,
      analytics_data: backendResponse.result.metadata.analytics_data,
      has_analytics: true,
      sql_query: backendResponse.result.metadata.sql_query,
      function_called: backendResponse.function_called
    };
  }
  
  // Check if it's a direct analytics response from text-to-SQL
  if (backendResponse?.result?.sql_query || backendResponse?.result?.query_results) {
    return {
      analytics_type: 'sql_analytics',
      analytics_data: {
        sql_query: backendResponse.result.sql_query,
        query_results: backendResponse.result.query_results,
        data: backendResponse.result.data
      },
      has_analytics: true,
      sql_query: backendResponse.result.sql_query,
      function_called: backendResponse.function_called
    };
  }
  
  // Check if it's a direct analytics response
  if (backendResponse?.metadata?.has_analytics) {
    return {
      analytics_type: backendResponse.metadata.analytics_type,
      analytics_data: backendResponse.metadata.analytics_data,
      has_analytics: true,
      function_called: backendResponse.function_called
    };
  }
  
  // Check for analytics data in different response structures
  if (backendResponse?.analytics_data) {
    return {
      analytics_type: backendResponse.analytics_type || 'metrics',
      analytics_data: backendResponse.analytics_data,
      has_analytics: true,
      function_called: backendResponse.function_called
    };
  }
  
  return null;
}

export function generateAnalyticsResponse(query: AnalyticsQuery, data: any): string {
  if (!data) return '';
  
  switch (query.type) {
    case 'occupancy':
      const occupancyRate = data.occupancy_rate || data.current_occupancy_rate || 0;
      const occupied = data.occupied || data.occupied_units || 0;
      const total = data.total || data.total_units || 0;
      const vacant = data.vacant || data.vacant_units || (total - occupied);
      
      return `Here's the current occupancy information:\n\n📊 **Occupancy Rate**: ${occupancyRate}%\n🏠 **Occupied Units**: ${occupied} out of ${total}\n🔑 **Vacant Units**: ${vacant}\n\nThe visualization below shows the occupancy details.`;
      
    case 'financial':
      const totalRevenue = data.total_revenue || data.revenue || 0;
      const avgRent = data.average_rent || data.avg_rent || 0;
      const growth = data.revenue_growth || data.growth || 0;
      
      return `Here's the financial overview for this month:\n\n💰 **Total Revenue**: $${totalRevenue.toLocaleString()}\n📈 **Revenue Growth**: ${growth}%\n🏠 **Average Rent**: $${avgRent.toLocaleString()}/month\n\nThe chart displays the revenue details and trends.`;
      
    case 'maintenance':
      return `Here's the maintenance request summary:\n\n🔧 **Total Requests**: ${data.total_requests || 0}\n⏳ **Pending**: ${data.pending_requests || data.pending || 0}\n✅ **Completed**: ${data.completed_requests || data.completed || 0}\n⏱️ **Avg Resolution Time**: ${data.average_resolution_time || data.avg_resolution_time || 0} days`;
      
    case 'leads':
      return `Here's the lead conversion analytics:\n\n👥 **Total Leads**: ${data.total_leads || 0}\n🎯 **Conversion Rate**: ${data.conversion_rate || 0}%\n✅ **Converted Leads**: ${data.converted_leads || data.converted || 0}\n📊 **Active Leads**: ${data.active_leads || data.active || 0}`;
      
    case 'rooms':
      const totalRooms = data.total_rooms || 0;
      const availableRooms = data.available_rooms || 0;
      
      return `Here's the room performance metrics:\n\n🏠 **Total Rooms**: ${totalRooms}\n✅ **Available Rooms**: ${availableRooms}\n📊 **Occupancy**: ${((totalRooms - availableRooms) / totalRooms * 100).toFixed(1)}%`;
      
    case 'tenants':
      const totalTenants = data.total_tenants || 0;
      const activeTenants = data.active_tenants || 0;
      
      return `Here's the tenant analytics:\n\n👥 **Total Tenants**: ${totalTenants}\n✅ **Active Tenants**: ${activeTenants}\n📊 **New This Month**: ${data.new_tenants || 0}`;
      
    case 'dashboard':
      return `Here's your comprehensive analytics dashboard with all key metrics and performance indicators:`;
      
    default:
      return 'Analytics data retrieved successfully. See the visualization below for details.';
  }
}