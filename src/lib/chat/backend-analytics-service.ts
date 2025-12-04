// Service to call backend analytics endpoints directly

import { backendConfig } from '../config/backend'

// Use centralized backend config - no localhost fallback in production
const BACKEND_API_URL = backendConfig.http.base

interface AnalyticsResponse {
  success: boolean;
  data: any;
  error?: string;
}

export class BackendAnalyticsService {
  async callAnalyticsEndpoint(endpoint: string, params?: any): Promise<AnalyticsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null) {
            queryParams.append(key, params[key]);
          }
        });
      }

      const url = `${BACKEND_API_URL}/analytics/${endpoint}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error(`Error calling analytics endpoint ${endpoint}:`, error);
      return { 
        success: false, 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async getOccupancyRate(buildingId?: string) {
    const response = await this.callAnalyticsEndpoint('occupancy', { building_id: buildingId });
    return response.data;
  }

  async getFinancialMetrics(buildingId?: string, startDate?: string, endDate?: string) {
    const response = await this.callAnalyticsEndpoint('financial', { 
      building_id: buildingId,
      start_date: startDate,
      end_date: endDate
    });
    return response.data;
  }

  async getLeadConversionMetrics(startDate?: string, endDate?: string) {
    const response = await this.callAnalyticsEndpoint('leads', { 
      start_date: startDate,
      end_date: endDate
    });
    return response.data;
  }

  async getMaintenanceMetrics(buildingId?: string, startDate?: string, endDate?: string) {
    const response = await this.callAnalyticsEndpoint('maintenance', { 
      building_id: buildingId,
      start_date: startDate,
      end_date: endDate
    });
    return response.data;
  }

  async getRoomPerformanceMetrics(buildingId?: string, limit: number = 10) {
    const response = await this.callAnalyticsEndpoint('rooms', { 
      building_id: buildingId,
      limit
    });
    return response.data;
  }

  async getTenantMetrics(buildingId?: string) {
    const response = await this.callAnalyticsEndpoint('tenants', { 
      building_id: buildingId
    });
    return response.data;
  }

  async getDashboardMetrics(buildingId?: string) {
    const response = await this.callAnalyticsEndpoint('dashboard', { 
      building_id: buildingId
    });
    return response.data;
  }

  async compareProperties(buildingIds: string[]) {
    const response = await fetch(`${BACKEND_API_URL}/analytics/property-comparison`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ building_ids: buildingIds })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }

  async getLeadSourceAnalysis(startDate?: string, endDate?: string) {
    const response = await this.callAnalyticsEndpoint('lead-sources', { 
      start_date: startDate,
      end_date: endDate
    });
    return response.data;
  }

  async getOccupancyHistory(buildingId?: string, months: number = 12) {
    const response = await this.callAnalyticsEndpoint('occupancy-history', { 
      building_id: buildingId,
      months
    });
    return response.data;
  }
}

export const backendAnalyticsService = new BackendAnalyticsService();