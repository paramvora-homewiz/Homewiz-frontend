// Intelligent data parser using LLM for complex data structures

interface ParsedDataResult {
  success: boolean;
  formattedData?: any;
  visualizationType?: 'table' | 'chart' | 'cards' | 'list' | 'raw';
  summary?: string;
  error?: string;
}

// Patterns for common data types
const dataPatterns = {
  financial: /revenue|cost|price|rent|payment|amount|total|balance/i,
  occupancy: /occupancy|occupied|available|vacant|rooms|units/i,
  tenant: /tenant|resident|lease|renter|occupant/i,
  maintenance: /maintenance|repair|request|work order|service/i,
  analytics: /analytics|metrics|statistics|performance|report/i,
  payment: /payment_status|amount_due|paid|overdue|pending|days_overdue|payment_date/i,
};

// Intelligent data parser (synchronous)
export function parseComplexData(data: any): ParsedDataResult {
  try {
    // First, try to detect data type
    const dataType = detectDataType(data);

    // Based on data type, format accordingly
    switch (dataType) {
      case 'financial':
        return formatFinancialData(data);
      case 'occupancy':
        return formatOccupancyData(data);
      case 'tenant':
        return formatTenantData(data);
      case 'payment':
        return formatPaymentData(data);
      case 'table':
        return formatTableData(data);
      case 'list':
        return formatListData(data);
      default:
        return formatGenericData(data);
    }
  } catch (error) {
    return {
      success: false,
      error: `Failed to parse data: ${error}`,
    };
  }
}

// Detect data type from structure and content
function detectDataType(data: any): string {
  if (!data || typeof data !== 'object') return 'raw';
  
  const dataStr = JSON.stringify(data).toLowerCase();
  
  // Check for specific patterns
  for (const [type, pattern] of Object.entries(dataPatterns)) {
    if (pattern.test(dataStr)) {
      return type;
    }
  }
  
  // Check if it's array of similar objects (table data)
  if (Array.isArray(data) && data.length > 0) {
    const firstItem = data[0];
    if (typeof firstItem === 'object' && !Array.isArray(firstItem)) {
      const keys = Object.keys(firstItem);
      const allHaveSameKeys = data.every(item => 
        typeof item === 'object' && 
        Object.keys(item).length === keys.length &&
        keys.every(key => key in item)
      );
      if (allHaveSameKeys) return 'table';
    }
    return 'list';
  }
  
  return 'generic';
}

// Format financial data
function formatFinancialData(data: any): ParsedDataResult {
  const formatted: any = {
    metrics: [],
    details: {},
  };

  // Helper to classify metric type
  const classifyType = (k: string): 'currency' | 'percentage' | 'number' => {
    const key = k.toLowerCase()
    if (key.includes('rate') || key.includes('percentage') || key.endsWith('_pct')) return 'percentage'
    if (/(revenue|cost|price|rent|payment|amount|total)/i.test(key)) return 'currency'
    return 'number'
  }

  // Preserve known collections so SmartView can render specialized UIs
  if (Array.isArray((data as any).by_building)) {
    formatted.by_building = (data as any).by_building
  }

  // Extract metrics and keep raw values where possible
  for (const [key, value] of Object.entries(data)) {
    // Skip these as they're handled in specialized views
    if (key === 'by_building' || key === 'funnel' || key === 'by_source') continue

    const type = classifyType(key)
    const isNumeric = typeof value === 'number'

    if (type === 'currency' || type === 'percentage' || (type === 'number' && isNumeric)) {
      formatted.metrics.push({
        key,
        label: formatLabel(key),
        value: isNumeric ? (value as number) : value,
        type,
      })
    } else {
      // Don't include funnel or other visualization-specific data in details
      if (key !== 'funnel' && key !== 'by_source') {
        formatted.details[key] = value
      }
    }
  }

  return {
    success: true,
    formattedData: formatted,
    visualizationType: 'cards',
    summary: `Financial data with ${formatted.metrics.length} key metrics`,
  }
}

// Format occupancy data
function formatOccupancyData(data: any): ParsedDataResult {
  const formatted: any = {
    occupancyRate: null,
    metrics: [],
    breakdown: [],
  };
  
  // Extract occupancy-specific metrics
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    
    if (lowerKey.includes('rate') || lowerKey.includes('percentage')) {
      formatted.occupancyRate = {
        label: formatLabel(key),
        value: formatPercentage(value),
      };
    } else if (lowerKey.includes('occupied') || lowerKey.includes('available') || lowerKey.includes('total')) {
      formatted.metrics.push({
        label: formatLabel(key),
        value: formatValue(value),
        type: 'number',
      });
    } else if (Array.isArray(value)) {
      formatted.breakdown = value;
    }
  }
  
  return {
    success: true,
    formattedData: formatted,
    visualizationType: 'cards',
    summary: 'Occupancy analytics and metrics',
  };
}

// Format tenant data
function formatTenantData(data: any): ParsedDataResult {
  const formatted: any = {
    totalTenants: 0,
    metrics: [],
    tenantList: [],
  };
  
  // Process tenant data
  if (Array.isArray(data)) {
    formatted.tenantList = data;
    formatted.totalTenants = data.length;
  } else {
    for (const [key, value] of Object.entries(data)) {
      if (key.toLowerCase().includes('total') || key.toLowerCase().includes('count')) {
        formatted.totalTenants = value as number;
      } else if (Array.isArray(value)) {
        formatted.tenantList = value;
      } else {
        formatted.metrics.push({
          label: formatLabel(key),
          value: formatValue(value),
        });
      }
    }
  }
  
  return {
    success: true,
    formattedData: formatted,
    visualizationType: formatted.tenantList.length > 0 ? 'table' : 'cards',
    summary: `Tenant data with ${formatted.totalTenants} total tenants`,
  };
}

// Format payment data
function formatPaymentData(data: any): ParsedDataResult {
  const formatted: any = {
    tenants: [],
    summary: {
      total_tenants: 0,
      paid_count: 0,
      overdue_count: 0,
      pending_count: 0,
      total_collected: 0,
      total_outstanding: 0,
      collection_rate: 0,
    }
  };

  // If data is already in the expected format
  if (data.tenants || data.payments || data.payment_status) {
    return {
      success: true,
      formattedData: data,
      visualizationType: 'cards',
      summary: 'Tenant payment status data',
    };
  }

  // If data is an array of payment records
  if (Array.isArray(data)) {
    formatted.tenants = data;
    
    // Calculate summary
    data.forEach(payment => {
      formatted.summary.total_tenants++;
      
      if (payment.status === 'paid') {
        formatted.summary.paid_count++;
        formatted.summary.total_collected += payment.amount_paid || payment.amount_due || 0;
      } else if (payment.status === 'overdue') {
        formatted.summary.overdue_count++;
        formatted.summary.total_outstanding += payment.amount_due || 0;
      } else if (payment.status === 'pending' || payment.status === 'partial') {
        formatted.summary.pending_count++;
        formatted.summary.total_outstanding += (payment.amount_due - (payment.amount_paid || 0));
      }
    });
    
    // Calculate collection rate
    const total = formatted.summary.total_collected + formatted.summary.total_outstanding;
    if (total > 0) {
      formatted.summary.collection_rate = (formatted.summary.total_collected / total) * 100;
    }
  }

  return {
    success: true,
    formattedData: formatted,
    visualizationType: 'cards',
    summary: `Payment status for ${formatted.summary.total_tenants} tenants`,
  };
}

// Format table data
function formatTableData(data: any[]): ParsedDataResult {
  if (!Array.isArray(data) || data.length === 0) {
    return formatGenericData(data);
  }
  
  // Get columns from first item
  const columns = Object.keys(data[0]).map(key => ({
    key,
    label: formatLabel(key),
    type: detectColumnType(data, key),
  }));
  
  return {
    success: true,
    formattedData: {
      columns,
      rows: data,
    },
    visualizationType: 'table',
    summary: `Table with ${data.length} rows and ${columns.length} columns`,
  };
}

// Format list data
function formatListData(data: any[]): ParsedDataResult {
  return {
    success: true,
    formattedData: {
      items: data.map((item, index) => ({
        id: index,
        value: item,
        display: typeof item === 'object' ? JSON.stringify(item) : String(item),
      })),
    },
    visualizationType: 'list',
    summary: `List with ${data.length} items`,
  };
}

// Format generic data
function formatGenericData(data: any): ParsedDataResult {
  // Try to create a structured view
  const structured: any = {
    properties: [],
    nestedData: {},
  };
  
  if (typeof data === 'object' && data !== null) {
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        structured.nestedData[key] = value;
      } else {
        structured.properties.push({
          key,
          label: formatLabel(key),
          value: formatValue(value),
          type: typeof value,
        });
      }
    }
  }
  
  return {
    success: true,
    formattedData: structured,
    visualizationType: 'cards',
    summary: 'Structured data view',
  };
}

// Helper functions
function formatLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function formatValue(value: any): string {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'number') {
    if (value >= 1000) {
      return value.toLocaleString();
    }
    return value.toString();
  }
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return `[${value.length} items]`;
  if (typeof value === 'object') return '[Object]';
  return String(value);
}

function formatPercentage(value: any): string {
  const num = Number(value);
  if (isNaN(num)) return 'N/A';
  
  // Check if it's already a percentage or needs conversion
  const percentage = num > 1 ? num : num * 100;
  return `${percentage.toFixed(1)}%`;
}

function detectColumnType(data: any[], key: string): string {
  const values = data.map(row => row[key]).filter(v => v !== null && v !== undefined);
  if (values.length === 0) return 'string';
  
  // Check if all values are numbers
  if (values.every(v => typeof v === 'number')) return 'number';
  
  // Check if all values are dates
  if (values.every(v => !isNaN(Date.parse(v)))) return 'date';
  
  // Check if all values are booleans
  if (values.every(v => typeof v === 'boolean')) return 'boolean';
  
  // Check if values look like currency
  if (values.every(v => typeof v === 'number' || (typeof v === 'string' && /^\$?[\d,]+\.?\d*$/.test(v)))) {
    return 'currency';
  }
  
  return 'string';
}

// LLM prompt generator for complex parsing
export function generateParsingPrompt(data: any): string {
  return `
Please analyze this data and provide a structured summary:

${JSON.stringify(data, null, 2)}

Identify:
1. The type of data (financial, occupancy, tenant, etc.)
2. Key metrics and their values
3. Any patterns or insights
4. Best way to visualize this data (table, cards, chart, etc.)

Format your response as JSON with these fields:
{
  "dataType": "type of data",
  "keyMetrics": [{"label": "Metric Name", "value": "value", "unit": "unit"}],
  "insights": ["insight 1", "insight 2"],
  "visualizationType": "recommended visualization",
  "summary": "brief summary"
}
`;
}