// Handler for processing analytics queries through the chat backend

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8002';

export interface ChatAnalyticsRequest {
  query: string;
  analytics_type: string;
  building_id?: string;
  parameters?: any;
}

export interface ChatAnalyticsResponse {
  success: boolean;
  response?: string;
  analytics_data?: any;
  analytics_type?: string;
  error?: string;
}

export async function sendAnalyticsQueryToBackend(
  query: string,
  analyticsType: string,
  buildingId?: string
): Promise<ChatAnalyticsResponse> {
  try {
    const requestBody: ChatAnalyticsRequest = {
      query,
      analytics_type: analyticsType,
      building_id: buildingId,
      parameters: {
        include_visualizations: true,
        format: 'chat'
      }
    };

    const response = await fetch(`${BACKEND_API_URL}/query/analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      // Fallback to direct analytics endpoint if chat analytics endpoint doesn't exist
      if (response.status === 404) {
        return {
          success: false,
          error: 'Analytics endpoint not found, using direct analytics API'
        };
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      response: data.response,
      analytics_data: data.analytics_data,
      analytics_type: data.analytics_type || analyticsType
    };
  } catch (error) {
    console.error('Error sending analytics query to backend:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}