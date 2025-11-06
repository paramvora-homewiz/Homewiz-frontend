// Analytics data formatting and parsing utilities

interface AnalyticsResponse {
  success?: boolean;
  data?: any;
  result?: any;
  insight_type?: string;
  error?: string;
}

interface BuildingRevenue {
  building_id: number;
  building_name: string;
  total_potential_revenue: number;
  actual_revenue: number;
  revenue_realization_rate: number;
  avg_private_rent: number;
}

interface FormattedAnalytics {
  type: 'financial' | 'occupancy' | 'tenant' | 'room_performance' | 'generic';
  title: string;
  data: any;
  summary?: {
    [key: string]: any;
  };
}

// Helper to safely parse numeric values
export const parseNumber = (value: any, fallback: number = 0): number => {
  const num = Number(value);
  return isNaN(num) || value === null || value === undefined ? fallback : num;
};

// Helper to format currency
export const formatCurrency = (amount: number): string => {
  if (amount === 0 || !amount) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper to format percentage
export const formatPercentage = (value: number, decimalPlaces: number = 1): string => {
  // Check if value is already a percentage (>1) or decimal (0-1)
  const percentage = value > 1 ? value : value * 100;
  return `${percentage.toFixed(decimalPlaces)}%`;
};

// Parse and format analytics response
export const parseAnalyticsResponse = (response: any): FormattedAnalytics | null => {
  // Extract data from various possible locations
  let data = response?.data || response?.result?.data || response?.result?.result?.data || response;
  let insightType = response?.insight_type || response?.result?.insight_type || response?.result?.result?.insight_type || '';
  
  if (!data) return null;
  
  // Normalize insight type
  insightType = insightType.toUpperCase();
  
  switch(insightType) {
    case 'FINANCIAL':
      return formatFinancialData(data);
    case 'OCCUPANCY':
      return formatOccupancyData(data);
    case 'TENANT':
      return formatTenantData(data);
    case 'ROOM_PERFORMANCE':
      return formatRoomPerformanceData(data);
    default:
      return formatGenericData(data);
  }
};

// Format financial data
const formatFinancialData = (data: any): FormattedAnalytics => {
  const totalPotentialRevenue = parseNumber(data.total_potential_revenue);
  const actualRevenue = parseNumber(data.actual_revenue);
  const realizationRate = parseNumber(data.revenue_realization_rate);
  
  // Fix building-wise revenue data
  const byBuilding = (data.by_building || []).map((building: any) => ({
    ...building,
    total_potential_revenue: parseNumber(building.total_potential_revenue),
    actual_revenue: parseNumber(building.actual_revenue),
    // Fix realization rate - ensure it's a percentage
    revenue_realization_rate: building.revenue_realization_rate > 1 
      ? building.revenue_realization_rate 
      : building.revenue_realization_rate * 100,
    avg_private_rent: parseNumber(building.avg_private_rent),
  }));
  
  return {
    type: 'financial',
    title: 'Financial Analytics Report',
    data: {
      ...data,
      total_potential_revenue: totalPotentialRevenue,
      actual_revenue: actualRevenue,
      revenue_realization_rate: realizationRate > 1 ? realizationRate : realizationRate * 100,
      by_building: byBuilding,
    },
    summary: {
      totalPotential: formatCurrency(totalPotentialRevenue),
      actualRevenue: formatCurrency(actualRevenue),
      realizationRate: formatPercentage(realizationRate),
      buildingCount: byBuilding.length,
    },
  };
};

// Format occupancy data
const formatOccupancyData = (data: any): FormattedAnalytics => {
  const totalRooms = parseNumber(data.total_rooms);
  const occupiedRooms = parseNumber(data.occupied_rooms);
  const availableRooms = parseNumber(data.available_rooms);
  const occupancyRate = parseNumber(data.occupancy_rate);
  
  return {
    type: 'occupancy',
    title: 'Occupancy Analytics Report',
    data: {
      ...data,
      total_rooms: totalRooms,
      occupied_rooms: occupiedRooms,
      available_rooms: availableRooms,
      occupancy_rate: occupancyRate > 1 ? occupancyRate : occupancyRate * 100,
    },
    summary: {
      totalRooms,
      occupiedRooms,
      availableRooms,
      occupancyRate: formatPercentage(occupancyRate),
    },
  };
};

// Format tenant data
const formatTenantData = (data: any): FormattedAnalytics => {
  return {
    type: 'tenant',
    title: 'Tenant Analytics Report',
    data: data,
    summary: {
      totalTenants: data.total_tenants || 0,
      activeLeases: data.active_leases || 0,
      avgTenureMonths: data.avg_tenure_months || 0,
    },
  };
};

// Format room performance data
const formatRoomPerformanceData = (data: any): FormattedAnalytics => {
  return {
    type: 'room_performance',
    title: 'Room Performance Report',
    data: data,
    summary: {
      priceRangeCount: data.price_comparison_by_building?.length || 0,
    },
  };
};

// Format generic analytics data
const formatGenericData = (data: any): FormattedAnalytics => {
  // Try to detect data type from structure
  let title = 'Analytics Report';
  let type: FormattedAnalytics['type'] = 'generic';
  
  if (data.total_leads || data.conversion_rate) {
    title = 'Lead Analytics Report';
  } else if (data.total_revenue || data.revenue_by_building) {
    title = 'Revenue Report';
    type = 'financial';
  } else if (data.occupancy_rate !== undefined) {
    title = 'Occupancy Report';
    type = 'occupancy';
  }
  
  return {
    type,
    title,
    data: data,
  };
};

// Parse raw JSON data into structured format
export const parseRawData = (rawData: string | object): any => {
  if (typeof rawData === 'string') {
    try {
      return JSON.parse(rawData);
    } catch (e) {
      // If it's not valid JSON, try to extract data patterns
      return extractDataFromText(rawData);
    }
  }
  return rawData;
};

// Extract structured data from text
const extractDataFromText = (text: string): any => {
  const result: any = {};
  
  // Extract numbers with labels
  const numberPatterns = /(\w+[\s_]*\w*):\s*([\d,]+\.?\d*)/g;
  let match;
  while ((match = numberPatterns.exec(text)) !== null) {
    const key = match[1].toLowerCase().replace(/\s+/g, '_');
    const value = parseFloat(match[2].replace(/,/g, ''));
    result[key] = value;
  }
  
  // Extract percentages
  const percentPatterns = /(\w+[\s_]*\w*):\s*([\d.]+)%/g;
  while ((match = percentPatterns.exec(text)) !== null) {
    const key = match[1].toLowerCase().replace(/\s+/g, '_') + '_percentage';
    result[key] = parseFloat(match[2]);
  }
  
  // Extract currency values
  const currencyPatterns = /(\w+[\s_]*\w*):\s*\$?([\d,]+\.?\d*)/g;
  while ((match = currencyPatterns.exec(text)) !== null) {
    const key = match[1].toLowerCase().replace(/\s+/g, '_');
    if (key.includes('price') || key.includes('rent') || key.includes('revenue')) {
      result[key] = parseFloat(match[2].replace(/,/g, ''));
    }
  }
  
  return result;
};

// Helper to check if data needs LLM parsing
export const needsLLMParsing = (data: any): boolean => {
  // Check if data is complex nested structure
  if (typeof data === 'object' && data !== null) {
    const keys = Object.keys(data);
    
    // Check for deeply nested structures
    for (const key of keys) {
      if (typeof data[key] === 'object' && data[key] !== null && !Array.isArray(data[key])) {
        const subKeys = Object.keys(data[key]);
        if (subKeys.length > 5) return true;
      }
    }
    
    // Check for unstructured text data
    if (keys.some(key => {
      const value = data[key];
      return typeof value === 'string' && value.length > 200 && !value.includes('http');
    })) {
      return true;
    }
  }
  
  return false;
};

// Format data for display
export const formatDataForDisplay = (data: any): string => {
  if (typeof data === 'object' && data !== null) {
    return JSON.stringify(data, null, 2)
      .replace(/"([^"]+)":/g, '$1:') // Remove quotes from keys
      .replace(/,$/gm, ',') // Keep commas
      .replace(/"/g, ''); // Remove quotes from values (careful with strings)
  }
  return String(data);
};