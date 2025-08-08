/**
 * Intelligent Supabase Query Service
 * Processes natural language queries and routes them to appropriate Supabase endpoints
 * Uses Google Gemini AI for intent analysis and response generation
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import SimpleChatService from '@/lib/supabase/chat-service-simple';
import { ComprehensiveChatService } from '@/lib/supabase/comprehensive-chat-service';

// Initialize services
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface QueryIntent {
  entity: 'rooms' | 'buildings' | 'tenants' | 'leads' | 'operators' | 'statistics' | 'general';
  action: 'search' | 'list' | 'count' | 'analyze' | 'get_info';
  filters: {
    priceMin?: number;
    priceMax?: number;
    city?: string;
    bedrooms?: number;
    available?: boolean;
    furnished?: boolean;
    petFriendly?: boolean;
    buildingName?: string;
    location?: string;
  };
  confidence: number;
  originalQuery: string;
}

export interface QueryResponse {
  success: boolean;
  data?: any;
  response: string;
  metadata: {
    intent: QueryIntent;
    dataSource: string;
    resultsCount?: number;
    processingTime: number;
  };
  error?: string;
}

export class IntelligentSupabaseQueryService {
  /**
   * Main entry point for processing natural language queries
   */
  static async processQuery(query: string): Promise<QueryResponse> {
    const startTime = Date.now();
    
    try {
      // Step 1: Analyze user intent
      const intent = await this.analyzeIntent(query);
      console.log('Analyzed intent:', intent);

      // Step 2: Execute appropriate query based on intent
      const data = await this.executeQuery(intent);
      
      // Step 3: Generate natural language response
      const response = await this.generateResponse(data, intent);
      
      const processingTime = Date.now() - startTime;
      
      // Structure the result properly for the interactive renderer
      let structuredResult = data;
      
      // Ensure buildings and rooms are in the expected format
      if (intent.entity === 'buildings' && Array.isArray(data)) {
        structuredResult = { buildings: data };
      } else if (intent.entity === 'rooms' && Array.isArray(data)) {
        structuredResult = { rooms: data };
      } else if (intent.entity === 'statistics' && data) {
        structuredResult = { stats: data.rooms ? data : { ...data } };
      }

      return {
        success: true,
        data,
        result: structuredResult, // Add structured result for the renderer
        response,
        metadata: {
          intent,
          dataSource: 'supabase',
          resultsCount: Array.isArray(data) ? data.length : data ? 1 : 0,
          processingTime
        }
      };
      
    } catch (error: any) {
      console.error('Query processing error:', error);
      
      return {
        success: false,
        response: this.getErrorResponse(error),
        metadata: {
          intent: { entity: 'general', action: 'search', filters: {}, confidence: 0, originalQuery: query },
          dataSource: 'error',
          processingTime: Date.now() - startTime
        },
        error: error.message
      };
    }
  }

  /**
   * Analyze user intent using Gemini AI
   */
  private static async analyzeIntent(query: string): Promise<QueryIntent> {
    const prompt = `
Analyze this real estate query and extract the intent in JSON format:

Query: "${query}"

Extract:
1. entity: rooms, buildings, tenants, leads, operators, statistics, or general
2. action: search, list, count, analyze, or get_info
3. filters: price range, location, amenities, etc.
4. confidence: 0-1 score

Examples:
- "Show me rooms under $2000" → {"entity": "rooms", "action": "search", "filters": {"priceMax": 2000}, "confidence": 0.9}
- "How many buildings are in San Francisco?" → {"entity": "buildings", "action": "count", "filters": {"city": "San Francisco"}, "confidence": 0.95}
- "Available furnished rooms" → {"entity": "rooms", "action": "search", "filters": {"available": true, "furnished": true}, "confidence": 0.85}
- "What buildings do you have?" → {"entity": "buildings", "action": "list", "filters": {}, "confidence": 0.8}

Return ONLY the JSON object:`;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          ...parsed,
          originalQuery: query
        };
      }
    } catch (error) {
      console.error('Intent analysis error:', error);
    }

    // Fallback intent analysis
    return this.getFallbackIntent(query);
  }

  /**
   * Execute query based on analyzed intent
   */
  private static async executeQuery(intent: QueryIntent): Promise<any> {
    switch (intent.entity) {
      case 'rooms':
        return await this.queryRooms(intent);
      case 'buildings':
        return await this.queryBuildings(intent);
      case 'tenants':
        return await this.queryTenants(intent);
      case 'statistics':
        return await this.queryStatistics(intent);
      default:
        return await this.queryRooms(intent); // Default to rooms
    }
  }

  /**
   * Query rooms based on intent
   */
  private static async queryRooms(intent: QueryIntent): Promise<any> {
    console.log('🔍 Querying rooms with intent:', intent);
    
    if (intent.action === 'count') {
      const { count } = await supabase
        .from('rooms')
        .select('*', { count: 'exact', head: true });
      return { count };
    }

    // Use SimpleChatService for room searches
    const searchParams = {
      priceMin: intent.filters.priceMin,
      priceMax: intent.filters.priceMax,
      city: intent.filters.city,
      bedrooms: intent.filters.bedrooms,
      furnished: intent.filters.furnished,
      petFriendly: intent.filters.petFriendly
    };

    let result;
    if (intent.action === 'list' || intent.action === 'search') {
      result = await SimpleChatService.searchRooms(searchParams);
    } else {
      result = await SimpleChatService.getAllRooms(10);
    }
    
    console.log('🏠 Room query result:', {
      count: result?.length || 0,
      firstRoom: result?.[0],
      isArray: Array.isArray(result)
    });
    
    return result;
  }

  /**
   * Query buildings based on intent
   */
  private static async queryBuildings(intent: QueryIntent): Promise<any> {
    let query = supabase.from('buildings').select('*');

    if (intent.filters.city) {
      query = query.ilike('city', `%${intent.filters.city}%`);
    }

    if (intent.filters.buildingName) {
      query = query.ilike('building_name', `%${intent.filters.buildingName}%`);
    }

    if (intent.action === 'count') {
      const { count } = await query.select('*', { count: 'exact', head: true });
      return { count };
    }

    const { data, error } = await query.limit(20);
    if (error) throw error;
    return data;
  }

  /**
   * Query tenants based on intent
   */
  private static async queryTenants(intent: QueryIntent): Promise<any> {
    let query = supabase.from('tenants').select('*');

    if (intent.action === 'count') {
      const { count } = await query.select('*', { count: 'exact', head: true });
      return { count };
    }

    const { data, error } = await query.limit(20);
    if (error) throw error;
    return data;
  }

  /**
   * Query statistics based on intent
   */
  private static async queryStatistics(intent: QueryIntent): Promise<any> {
    const stats: any = {};

    // Get room statistics
    const { data: rooms } = await supabase
      .from('rooms')
      .select('private_room_rent, status');

    if (rooms) {
      const availableRooms = rooms.filter(r => r.status === 'AVAILABLE');
      const rents = rooms.map(r => r.private_room_rent).filter(r => r !== null);
      
      stats.rooms = {
        total: rooms.length,
        available: availableRooms.length,
        averageRent: rents.length > 0 ? Math.round(rents.reduce((a, b) => a + b, 0) / rents.length) : 0,
        minRent: rents.length > 0 ? Math.min(...rents) : 0,
        maxRent: rents.length > 0 ? Math.max(...rents) : 0
      };
    }

    // Get building count
    const { count: buildingCount } = await supabase
      .from('buildings')
      .select('*', { count: 'exact', head: true });
    
    stats.buildings = { total: buildingCount || 0 };

    return stats;
  }

  /**
   * Generate natural language response using Gemini AI
   */
  private static async generateResponse(data: any, intent: QueryIntent): Promise<string> {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return this.getNoResultsResponse(intent);
    }

    // For buildings, provide interactive instructions
    if (intent.entity === 'buildings' && Array.isArray(data)) {
      const count = data.length;
      return `I found ${count} building${count > 1 ? 's' : ''} matching your search:

🏢 **Click on any building card below to schedule a tour!**

Each building card shows available amenities and location details. Simply click on the building you're interested in to explore more options or schedule a viewing.`;
    }

    // For rooms, provide summary
    if (intent.entity === 'rooms' && Array.isArray(data)) {
      const count = data.length;
      const prices = data.map(r => r.private_room_rent || r.price || 0).filter(p => p > 0);
      const avgPrice = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
      
      return `I found ${count} room${count > 1 ? 's' : ''} matching your criteria:

📊 **Summary**
• Average Price: $${avgPrice.toLocaleString()}/month
• Price Range: $${minPrice.toLocaleString()} - $${maxPrice.toLocaleString()}
• ${count > 6 ? 'Showing the first 6 rooms. Click "Show All" to see more.' : 'Showing all matching rooms.'}

Click on any room card for more details or to schedule a viewing.`;
    }

    // For statistics
    if (intent.entity === 'statistics' && data.rooms) {
      return `Here's your property analytics summary:

📊 **Room Statistics**
• Total Rooms: ${data.rooms.total}
• Available: ${data.rooms.available}
• Occupancy Rate: ${Math.round(((data.rooms.total - data.rooms.available) / data.rooms.total) * 100)}%

💰 **Pricing Analysis**
• Average Rent: $${data.rooms.averageRent.toLocaleString()}/month
• Price Range: $${data.rooms.minRent.toLocaleString()} - $${data.rooms.maxRent.toLocaleString()}

🏢 **Building Count**: ${data.buildings.total}

These metrics are updated in real-time from our database.`;
    }

    // Fallback to AI generation
    const prompt = `
Generate a natural, conversational response for this real estate query result:

Original Query: "${intent.originalQuery}"
Intent: ${intent.entity} ${intent.action}
Data: ${JSON.stringify(data, null, 2)}

Guidelines:
- Be conversational and helpful
- Highlight key information (prices, locations, availability)
- Use emojis sparingly for visual appeal
- Format numbers nicely (e.g., $1,500 not 1500)
- If multiple results, summarize key insights
- Keep response under 200 words
- Be specific about what was found

Example responses:
- For room search: "I found 5 available rooms matching your criteria! The prices range from $1,200 to $1,800..."
- For statistics: "Here's what I found in our database: We have 45 total rooms with 12 currently available..."
- For building info: "I found 3 buildings in San Francisco. The main properties are..."

Generate response:`;

    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Response generation error:', error);
      return this.getFallbackResponse(data, intent);
    }
  }

  /**
   * Fallback intent analysis for when AI fails
   */
  private static getFallbackIntent(query: string): QueryIntent {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('building')) {
      return {
        entity: 'buildings',
        action: 'list',
        filters: {},
        confidence: 0.6,
        originalQuery: query
      };
    }
    
    if (lowerQuery.includes('tenant')) {
      return {
        entity: 'tenants',
        action: 'list',
        filters: {},
        confidence: 0.6,
        originalQuery: query
      };
    }
    
    if (lowerQuery.includes('statistic') || lowerQuery.includes('how many')) {
      return {
        entity: 'statistics',
        action: 'analyze',
        filters: {},
        confidence: 0.7,
        originalQuery: query
      };
    }

    // Default to room search
    const priceMatch = query.match(/\$?(\d+)/);
    const filters: any = {};
    
    if (priceMatch) {
      filters.priceMax = parseInt(priceMatch[1]);
    }
    
    if (lowerQuery.includes('available')) {
      filters.available = true;
    }

    return {
      entity: 'rooms',
      action: 'search',
      filters,
      confidence: 0.5,
      originalQuery: query
    };
  }

  /**
   * Generate fallback response when AI fails
   */
  private static getFallbackResponse(data: any, intent: QueryIntent): string {
    if (Array.isArray(data)) {
      return `I found ${data.length} ${intent.entity} matching your search. Here are the results!`;
    }
    
    if (data?.count !== undefined) {
      return `I found ${data.count} ${intent.entity} in total.`;
    }
    
    return "I found some results for your query. Let me know if you need more specific information!";
  }

  /**
   * Generate response when no results found
   */
  private static getNoResultsResponse(intent: QueryIntent): string {
    const suggestions = {
      rooms: "Try adjusting your price range or location preferences.",
      buildings: "Try searching for a different city or area.",
      tenants: "There might not be any tenants matching your criteria.",
      statistics: "I couldn't gather statistics at the moment."
    };

    return `I couldn't find any ${intent.entity} matching your criteria. ${suggestions[intent.entity] || 'Try refining your search.'}`;
  }

  /**
   * Generate error response
   */
  private static getErrorResponse(error: any): string {
    if (error.message?.includes('fetch')) {
      return "I'm having trouble connecting to the database. Please check your internet connection and try again.";
    }
    
    return "I encountered an error while processing your request. Please try rephrasing your question or contact support if the issue persists.";
  }
}

export default IntelligentSupabaseQueryService;
