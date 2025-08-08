import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { SchedulingAgent } from '../agents/scheduling-agent'

// Initialize services
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

export interface RAGContext {
  query: string
  retrievedData: any
  dataSource: string
  timestamp: Date
}

export interface RAGResponse {
  response: string
  context: RAGContext
  confidence: number
}

export class RAGChatbotService {
  
  // Main RAG pipeline
  static async processQuery(userQuery: string): Promise<RAGResponse> {
    try {
      // Step 1: Analyze user intent
      const intent = await this.analyzeIntent(userQuery)
      
      // Handle greetings and general queries without database access
      if (intent.type === 'greeting') {
        return {
          response: this.getGreetingResponse(),
          context: {
            query: userQuery,
            retrievedData: null,
            dataSource: 'conversation',
            timestamp: new Date()
          },
          confidence: 1.0
        }
      }
      
      // Handle scheduling requests
      if (intent.type === 'scheduling' || userQuery.toLowerCase().includes('schedule') || userQuery.toLowerCase().includes('book') || userQuery.toLowerCase().includes('tour')) {
        const schedulingResponse = await SchedulingAgent.processSchedulingRequest({
          userQuery,
          roomIds: intent.room_ids,
          buildingIds: intent.building_ids
        })
        
        return {
          response: schedulingResponse.message,
          context: {
            query: userQuery,
            retrievedData: { scheduledTours: schedulingResponse.scheduledTours },
            dataSource: 'scheduling',
            timestamp: new Date()
          },
          confidence: schedulingResponse.success ? 0.95 : 0.5
        }
      }
      
      if (intent.type === 'general') {
        return {
          response: this.getGeneralResponse(userQuery),
          context: {
            query: userQuery,
            retrievedData: null,
            dataSource: 'conversation',
            timestamp: new Date()
          },
          confidence: 1.0
        }
      }
      
      // Step 2: Retrieve relevant data from database
      const retrievedData = await this.retrieveData(intent)
      
      // Step 3: Generate response using retrieved data as context
      const response = await this.generateContextualResponse(userQuery, retrievedData, intent)
      
      return {
        response,
        context: {
          query: userQuery,
          retrievedData,
          dataSource: intent.tables ? intent.tables.join(', ') : 'database',
          timestamp: new Date()
        },
        confidence: 0.95
      }
    } catch (error) {
      console.error('RAG Pipeline Error:', error)
      throw error
    }
  }
  
  // Handle greeting responses
  static getGreetingResponse(): string {
    const greetings = [
      "Hello! I'm your HomeWiz assistant. I can help you find available rooms, check building information, look up tenant details, and answer questions about our properties. What would you like to know?",
      "Hi there! Welcome to HomeWiz. I'm here to help you with property information, room availability, tenant queries, and more. How can I assist you today?",
      "Hello! I'm ready to help you explore our property database. Ask me about available rooms, buildings, pricing, or anything else you'd like to know!",
    ]
    return greetings[Math.floor(Math.random() * greetings.length)]
  }
  
  // Handle general conversation
  static getGeneralResponse(query: string): string {
    const lowerQuery = query.toLowerCase()
    
    if (lowerQuery.includes('how are you')) {
      return "I'm functioning well, thank you! I'm here to help you find information about our properties, rooms, tenants, and more. What would you like to know?"
    }
    
    if (lowerQuery.includes('what can you do') || lowerQuery.includes('help')) {
      return `I can help you with:
• Finding available rooms and their prices
• Providing building information and amenities
• Looking up tenant details
• Showing recent leads
• Checking operator and agent information
• Analyzing building occupancy
• Providing property statistics
• And much more!

Just ask me any question about our properties and I'll search our database for you.`
    }
    
    if (lowerQuery.includes('who are you')) {
      return "I'm the HomeWiz AI assistant, powered by RAG (Retrieval-Augmented Generation). I can access our property database to provide you with accurate, real-time information about rooms, buildings, tenants, and more."
    }
    
    return "I'm here to help you with property-related questions. You can ask me about available rooms, building details, tenant information, or any other data in our system. What would you like to know?"
  }
  
  // Step 1: Intent Analysis
  static async analyzeIntent(query: string) {
    // First check if this is a greeting or general conversation
    const lowerQuery = query.toLowerCase().trim()
    const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy', 'greetings']
    const generalQuestions = ['how are you', 'what can you do', 'help', 'who are you', 'what is homewiz']
    
    if (greetings.some(g => lowerQuery === g || lowerQuery.startsWith(g + ' '))) {
      return { type: 'greeting', query }
    }
    
    if (generalQuestions.some(q => lowerQuery.includes(q))) {
      return { type: 'general', query }
    }
    
    // Otherwise, analyze for database intent
    const intentPrompt = `Analyze this query and determine if it needs database access and which tables to query.
    
Our database schema:
- rooms (room_id, room_number, room_type, status, ready_to_rent, private_room_rent, building_id, floor_number, bathroom_included, furnished)
- buildings (building_id, building_name, address, city, state, zip_code, amenities, total_units, available_units)
- tenants (tenant_id, tenant_name, tenant_email, phone, room_id, lease_start, lease_end)
- leads (lead_id, first_name, last_name, email, phone, status, source, created_at)
- operators (operator_id, name, email, phone, company, building_id)

Query: "${query}"

Return a JSON object with:
{
  "tables": ["primary_table", "joined_tables"],
  "filters": {
    "field": "value or condition"
  },
  "fields_needed": ["field1", "field2"],
  "query_type": "search|count|aggregate|detail|analysis",
  "natural_language_intent": "what the user wants to know",
  "analysis_type": "occupancy|availability|comparison|statistics"
}

Examples:
- "Show available rooms" → {"tables": ["rooms", "buildings"], "filters": {"status": "AVAILABLE", "ready_to_rent": true}}
- "How many tenants" → {"tables": ["tenants"], "query_type": "count"}
- "Rooms under $2000" → {"tables": ["rooms"], "filters": {"private_room_rent": "<2000"}}
- "Building occupancy analysis" → {"tables": ["buildings", "rooms", "tenants"], "query_type": "analysis", "analysis_type": "occupancy"}
- "Which buildings are empty" → {"tables": ["buildings", "rooms", "tenants"], "query_type": "analysis", "analysis_type": "occupancy"}
- "How many rooms are empty" → {"tables": ["rooms"], "query_type": "count", "filters": {"status": "AVAILABLE"}}
- "Empty rooms" → {"tables": ["rooms", "buildings"], "filters": {"status": "AVAILABLE"}}
- "How many operators" → {"tables": ["operators"], "query_type": "count"}
- "Show all agents" → {"tables": ["operators"], "query_type": "search"}
- "Building statistics" → {"tables": ["buildings", "rooms"], "query_type": "statistics"}
- "Property statistics" → {"tables": ["buildings", "rooms", "tenants"], "query_type": "statistics"}

Return ONLY the JSON object.`

    try {
      const result = await model.generateContent(intentPrompt)
      const text = result.response.text()
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.error('Intent analysis error:', error)
    }
    
    // Fallback intent
    return {
      tables: ['rooms', 'buildings'],
      filters: {},
      query_type: 'search',
      natural_language_intent: query
    }
  }
  
  // Step 2: Data Retrieval
  static async retrieveData(intent: any) {
    const retrievedData: any = {}
    
    try {
      // Handle statistics queries
      if (intent.query_type === 'statistics' || intent.query_type === 'analysis') {
        // Get comprehensive statistics
        const stats: any = {}
        
        // Building statistics
        const { data: buildings, error: buildingsError } = await supabase
          .from('buildings')
          .select('*, rooms(count)')
          
        if (!buildingsError && buildings) {
          stats.total_buildings = buildings.length
          stats.buildings_by_city = {}
          stats.total_available_units = 0
          stats.total_units = 0
          
          buildings.forEach(building => {
            // City grouping
            const city = building.city || 'Unknown'
            if (!stats.buildings_by_city[city]) {
              stats.buildings_by_city[city] = {
                count: 0,
                buildings: []
              }
            }
            stats.buildings_by_city[city].count++
            stats.buildings_by_city[city].buildings.push(building.building_name)
            
            // Unit counts
            stats.total_units += building.total_units || 0
            stats.total_available_units += building.available_units || 0
          })
          
          retrievedData.buildings = buildings
        }
        
        // Room statistics
        const { data: rooms, error: roomsError } = await supabase
          .from('rooms')
          .select('*')
          
        if (!roomsError && rooms) {
          stats.total_rooms = rooms.length
          stats.available_rooms = rooms.filter(r => {
            const status = r.status?.toUpperCase()
            return status === 'AVAILABLE' || status === 'VACANT'
          }).length
          stats.occupied_rooms = rooms.filter(r => {
            const status = r.status?.toUpperCase()
            return status === 'OCCUPIED' || status === 'RENTED'
          }).length
          
          // Price statistics
          const prices = rooms.map(r => r.private_room_rent).filter(p => p > 0)
          if (prices.length > 0) {
            stats.average_rent = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
            stats.min_rent = Math.min(...prices)
            stats.max_rent = Math.max(...prices)
          }
          
          // Room type distribution
          stats.room_types = {}
          rooms.forEach(room => {
            const type = room.room_type || 'Unknown'
            stats.room_types[type] = (stats.room_types[type] || 0) + 1
          })
          
          retrievedData.rooms = rooms
        }
        
        // Tenant statistics
        const { count: tenantCount, error: tenantError } = await supabase
          .from('tenants')
          .select('*', { count: 'exact', head: true })
          
        if (!tenantError) {
          stats.total_tenants = tenantCount
        }
        
        // Calculate occupancy rate
        if (stats.total_rooms > 0) {
          stats.occupancy_rate = Math.round((stats.occupied_rooms / stats.total_rooms) * 100)
        }
        
        retrievedData.statistics = stats
        return retrievedData
      }
      
      // Handle occupancy analysis queries
      if (intent.query_type === 'analysis' && intent.analysis_type === 'occupancy') {
        // Get all buildings with their room counts
        const { data: buildings, error: buildingsError } = await supabase
          .from('buildings')
          .select('*, rooms(count)')
          
        // Get all rooms with their occupancy status
        const { data: rooms, error: roomsError } = await supabase
          .from('rooms')
          .select('*, buildings(*), tenants(count)')
          
        // Get tenant count per building
        const { data: tenants, error: tenantsError } = await supabase
          .from('tenants')
          .select('*, rooms(building_id, buildings(building_name))')
          
        if (!buildingsError && buildings) {
          retrievedData.buildings = buildings
        }
        if (!roomsError && rooms) {
          retrievedData.rooms = rooms
        }
        if (!tenantsError && tenants) {
          retrievedData.tenants = tenants
        }
        
        // Perform occupancy analysis
        retrievedData.occupancy_analysis = this.calculateOccupancy(buildings, rooms, tenants)
        
        return retrievedData
      }
      
      // Handle different query patterns
      if (intent.tables.includes('rooms')) {
        // Handle count queries for rooms
        if (intent.query_type === 'count') {
          // Get all rooms first to analyze
          const { data: allRooms, error: allError } = await supabase
            .from('rooms')
            .select('*, buildings(*)')
          
          if (!allError && allRooms) {
            retrievedData.rooms = allRooms
            
            // Count empty/available rooms (case-insensitive)
            const emptyRooms = allRooms.filter(room => {
              const status = room.status?.toUpperCase();
              return status === 'AVAILABLE' || status === 'VACANT' || !room.status;
            })
            const occupiedRooms = allRooms.filter(room => {
              const status = room.status?.toUpperCase();
              return status === 'OCCUPIED' || status === 'RENTED';
            })
            
            retrievedData.room_counts = {
              total: allRooms.length,
              empty: emptyRooms.length,
              occupied: occupiedRooms.length,
              available_for_rent: allRooms.filter(r => r.ready_to_rent).length
            }
          }
        } else {
          // Regular room query
          let roomQuery = supabase
            .from('rooms')
            .select('*, buildings(*)')
          
          // Apply filters from intent
          if (intent.filters?.status) {
            roomQuery = roomQuery.eq('status', intent.filters.status)
          }
          if (intent.filters?.ready_to_rent !== undefined) {
            roomQuery = roomQuery.eq('ready_to_rent', intent.filters.ready_to_rent)
          }
          if (intent.filters?.private_room_rent) {
            const priceCondition = intent.filters.private_room_rent
            if (priceCondition.startsWith('<')) {
              roomQuery = roomQuery.lte('private_room_rent', parseInt(priceCondition.slice(1)))
            } else if (priceCondition.startsWith('>')) {
              roomQuery = roomQuery.gte('private_room_rent', parseInt(priceCondition.slice(1)))
            }
          }
          
          const { data, error } = await roomQuery.limit(100)
          if (error) {
            console.error('Room query error:', error)
            retrievedData._error = error.message
          } else if (data) {
            retrievedData.rooms = data
          }
        }
      }
      
      if (intent.tables.includes('buildings') && !intent.tables.includes('rooms')) {
        const { data, error } = await supabase
          .from('buildings')
          .select('*')
          .limit(50)
        if (!error && data) {
          retrievedData.buildings = data
        }
      }
      
      if (intent.tables.includes('tenants')) {
        let tenantQuery = supabase
          .from('tenants')
          .select('*, rooms(room_number, buildings(building_name))')
        
        if (intent.query_type === 'count') {
          const { count, error } = await tenantQuery.count()
          if (!error) {
            retrievedData.tenant_count = count
          }
        } else {
          const { data, error } = await tenantQuery.limit(50)
          if (!error && data) {
            retrievedData.tenants = data
          }
        }
      }
      
      if (intent.tables.includes('leads')) {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50)
        if (!error && data) {
          retrievedData.leads = data
        }
      }
      
      if (intent.tables.includes('operators')) {
        if (intent.query_type === 'count') {
          // Get count of operators
          const { count: operatorCount, error: countError } = await supabase
            .from('operators')
            .select('*', { count: 'exact', head: true })
          
          // Also get all operators for analysis
          const { data, error } = await supabase
            .from('operators')
            .select('*, buildings(*)')
            
          if (!countError && operatorCount !== null) {
            retrievedData.operator_count = operatorCount
          }
          if (!error && data) {
            retrievedData.operators = data
          }
        } else {
          const { data, error } = await supabase
            .from('operators')
            .select('*, buildings(*)')
            .limit(50)
          if (!error && data) {
            retrievedData.operators = data
          }
        }
      }
      
      // Add metadata
      retrievedData._metadata = {
        query_executed: new Date().toISOString(),
        intent: intent.natural_language_intent,
        tables_queried: intent.tables,
        filters_applied: intent.filters || {}
      }
      
    } catch (error) {
      console.error('Data retrieval error:', error)
      retrievedData._error = error
      retrievedData._metadata = {
        query_executed: new Date().toISOString(),
        error: true,
        error_message: error instanceof Error ? error.message : String(error)
      }
    }
    
    return retrievedData
  }
  
  // Step 3: Context-Aware Response Generation
  static async generateContextualResponse(query: string, data: any, intent: any): Promise<string> {
    // Check if we have data
    const hasData = Object.keys(data).some(key => {
      if (key === '_metadata' || key === '_error') return false;
      
      const value = data[key];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) {
        // Check for room_counts, occupancy_analysis, etc.
        return Object.keys(value).length > 0;
      }
      if (typeof value === 'number') return true;
      return Boolean(value);
    })
    
    if (!hasData) {
      return this.getNoDataResponse(query, intent)
    }
    
    // Build context from retrieved data
    let contextDescription = ''
    
    if (data.room_counts) {
      contextDescription += `Room Statistics:\n`
      contextDescription += `• Total Rooms: ${data.room_counts.total}\n`
      contextDescription += `• Empty/Vacant Rooms: ${data.room_counts.empty}\n`
      contextDescription += `• Occupied Rooms: ${data.room_counts.occupied}\n`
      contextDescription += `• Available for Rent: ${data.room_counts.available_for_rent}\n`
    }
    
    if (data.rooms) {
      const roomCount = data.rooms.length
      if (roomCount > 10) {
        contextDescription += `\nRoom Details (showing ${Math.min(roomCount, 10)} of ${roomCount} rooms):\n`
      } else {
        contextDescription += `\nRoom Details (${roomCount} total):\n`
      }
      
      data.rooms.slice(0, 10).forEach((room: any) => {
        const buildingName = room.buildings?.building_name || 'Building'
        const location = room.buildings ? `${room.buildings.city}, ${room.buildings.state}` : ''
        contextDescription += `• Room ${room.room_number} at ${buildingName}: `
        contextDescription += `${room.room_type} for $${room.private_room_rent}/month`
        contextDescription += ` (${room.floor_number === 1 ? '1st' : room.floor_number === 2 ? '2nd' : room.floor_number === 3 ? '3rd' : room.floor_number + 'th'} floor`
        contextDescription += room.furnished ? ', furnished' : ', unfurnished'
        contextDescription += room.bathroom_included ? ', private bathroom' : ''
        contextDescription += `, Status: ${room.status || 'Unknown'}`
        contextDescription += `)`
        if (location) contextDescription += ` - ${location}`
        contextDescription += `\n`
      })
    }
    
    if (data.buildings) {
      contextDescription += `\nProperties (${data.buildings.length} total):\n`
      data.buildings.forEach((building: any) => {
        contextDescription += `• ${building.building_name} at ${building.address}, ${building.city}, ${building.state} ${building.zip_code}\n`
        contextDescription += `  ${building.available_units} of ${building.total_units} units available`
        if (building.amenities && building.amenities.length > 0) {
          contextDescription += `, amenities include: ${building.amenities.join(', ')}`
        }
        contextDescription += `\n`
      })
    }
    
    if (data.tenants) {
      contextDescription += `\nCurrent Residents (${data.tenants.length} total):\n`
      data.tenants.forEach((tenant: any) => {
        const tenantName = tenant.tenant_name || `${tenant.first_name || ''} ${tenant.last_name || ''}`.trim() || 'Unknown Tenant'
        contextDescription += `• ${tenantName}`
        if (tenant.rooms?.room_number) {
          contextDescription += ` in Room ${tenant.rooms.room_number}`
          if (tenant.rooms.buildings?.building_name) {
            contextDescription += ` at ${tenant.rooms.buildings.building_name}`
          }
        }
        contextDescription += `\n`
      })
    }
    
    if (data.tenant_count !== undefined) {
      contextDescription += `\nTotal residents in our properties: ${data.tenant_count}\n`
    }
    
    if (data.leads) {
      contextDescription += `\nRecent Inquiries (${data.leads.length} total):\n`
      data.leads.forEach((lead: any) => {
        const leadName = `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || lead.email;
        const leadStatus = lead.status || lead.lead_status || 'Unknown';
        contextDescription += `• ${leadName} - ${leadStatus.toLowerCase().replace('_', ' ')}`
        if (lead.source || lead.lead_source) {
          contextDescription += `, from ${lead.source || lead.lead_source}`
        }
        contextDescription += `\n`
      })
    }
    
    if (data.operators) {
      contextDescription += `\nProperty Managers/Operators (${data.operators.length} total):\n`
      data.operators.forEach((operator: any) => {
        contextDescription += `• ${operator.name || 'Unknown'}`
        if (operator.company) {
          contextDescription += ` from ${operator.company}`
        }
        if (operator.buildings && operator.buildings.length > 0) {
          contextDescription += ` - manages ${operator.buildings.length} building(s)`
        }
        contextDescription += `\n`
      })
    }
    
    if (data.operator_count !== undefined) {
      contextDescription += `\nTotal operators/agents in the system: ${data.operator_count}\n`
    }
    
    if (data.statistics) {
      const stats = data.statistics
      contextDescription += `\nProperty Statistics:\n`
      contextDescription += `• Total Buildings: ${stats.total_buildings || 0}\n`
      contextDescription += `• Total Units: ${stats.total_units || 0}\n`
      contextDescription += `• Available Units: ${stats.total_available_units || 0}\n`
      contextDescription += `• Total Rooms: ${stats.total_rooms || 0}\n`
      contextDescription += `• Available Rooms: ${stats.available_rooms || 0}\n`
      contextDescription += `• Occupied Rooms: ${stats.occupied_rooms || 0}\n`
      contextDescription += `• Overall Occupancy Rate: ${stats.occupancy_rate || 0}%\n`
      
      if (stats.average_rent) {
        contextDescription += `\nRent Statistics:\n`
        contextDescription += `• Average Rent: $${stats.average_rent}\n`
        contextDescription += `• Minimum Rent: $${stats.min_rent}\n`
        contextDescription += `• Maximum Rent: $${stats.max_rent}\n`
      }
      
      if (stats.buildings_by_city) {
        contextDescription += `\nBuildings by City:\n`
        Object.entries(stats.buildings_by_city).forEach(([city, data]: [string, any]) => {
          contextDescription += `• ${city}: ${data.count} building(s)\n`
        })
      }
      
      if (stats.room_types) {
        contextDescription += `\nRoom Types:\n`
        Object.entries(stats.room_types).forEach(([type, count]) => {
          contextDescription += `• ${type}: ${count} room(s)\n`
        })
      }
      
      if (stats.total_tenants !== undefined) {
        contextDescription += `\nTotal Tenants: ${stats.total_tenants}\n`
      }
    }
    
    if (data.occupancy_analysis) {
      const analysis = data.occupancy_analysis
      contextDescription += `\nOccupancy Analysis:\n`
      contextDescription += `• Total Buildings: ${analysis.total_buildings}\n`
      contextDescription += `• Total Rooms: ${analysis.total_rooms}\n`
      contextDescription += `• Occupied Rooms: ${analysis.total_occupied_rooms} (${analysis.overall_occupancy_rate}%)\n`
      contextDescription += `• Vacant Rooms: ${analysis.total_vacant_rooms}\n`
      
      if (analysis.empty_buildings.length > 0) {
        contextDescription += `\nCompletely Empty Buildings (${analysis.empty_buildings.length}):\n`
        analysis.empty_buildings.forEach((building: any) => {
          contextDescription += `• ${building.building_name}: ${building.room_count} rooms, all vacant\n`
        })
      }
      
      if (analysis.fully_occupied_buildings.length > 0) {
        contextDescription += `\nFully Occupied Buildings (${analysis.fully_occupied_buildings.length}):\n`
        analysis.fully_occupied_buildings.forEach((building: any) => {
          contextDescription += `• ${building.building_name}: ${building.occupied_rooms} rooms, 100% occupied\n`
        })
      }
      
      if (analysis.partially_occupied_buildings.length > 0) {
        contextDescription += `\nPartially Occupied Buildings (${analysis.partially_occupied_buildings.length}):\n`
        analysis.partially_occupied_buildings.forEach((building: any) => {
          contextDescription += `• ${building.building_name}: ${building.occupied_rooms}/${building.room_count} rooms occupied (${building.occupancy_rate}%)\n`
        })
      }
    }
    
    // Generate natural language response using the context
    const responsePrompt = `You are a friendly and helpful real estate assistant having a natural conversation. Use ONLY the data provided below to answer the user's question conversationally.
    
CRITICAL RULES:
1. ONLY use information from the provided data - never make up details
2. Write as if you're having a friendly conversation, not reading from a database
3. Be specific but natural - mention actual room numbers, prices, and details
4. If there's limited data, acknowledge it naturally (e.g., "I only found a few options...")
5. Never mention "database", "query", "retrieved data", or technical terms
6. Respond like a knowledgeable assistant who just checked the available properties
7. Keep responses concise but informative
8. Use natural transitions and conversational language
9. When showing many buildings, provide a brief summary instead of listing all details
10. If there are more than 10 buildings, mention the total count and suggest exploring interactively

User asked: "${query}"

Available information:
${contextDescription}

Based on this information, provide a natural, conversational response that directly answers what the user asked for. If there are many buildings (more than 10), provide a summary like "I found X buildings across Y cities with Z available units total" instead of listing all. Speak as if you're a helpful assistant who just looked up this information for them:`

    try {
      const result = await model.generateContent(responsePrompt)
      return result.response.text()
    } catch (error) {
      console.error('Response generation error:', error)
      // Fallback to structured response
      return `Based on your query "${query}", here's what I found in the database:\n\n${contextDescription}`
    }
  }
  
  // Calculate occupancy statistics
  static calculateOccupancy(buildings: any[], rooms: any[], tenants: any[]) {
    const analysis: any = {
      total_buildings: buildings?.length || 0,
      total_rooms: rooms?.length || 0,
      total_tenants: tenants?.length || 0,
      buildings_breakdown: []
    }
    
    // Create a map of building occupancy
    const buildingMap = new Map()
    
    // Initialize buildings
    buildings?.forEach(building => {
      buildingMap.set(building.building_id, {
        building_name: building.building_name,
        total_units: building.total_units || 0,
        available_units: building.available_units || 0,
        room_count: 0,
        occupied_rooms: 0,
        vacant_rooms: 0,
        occupancy_rate: 0
      })
    })
    
    // Count rooms per building
    rooms?.forEach(room => {
      const buildingData = buildingMap.get(room.building_id)
      if (buildingData) {
        buildingData.room_count++
        
        // Check if room is occupied (has tenants)
        const roomStatus = room.status?.toUpperCase();
        const isOccupied = room.tenants?.length > 0 || roomStatus === 'OCCUPIED' || roomStatus === 'RENTED'
        if (isOccupied) {
          buildingData.occupied_rooms++
        } else {
          buildingData.vacant_rooms++
        }
      }
    })
    
    // Calculate occupancy rates and identify empty buildings
    let empty_buildings = []
    let fully_occupied_buildings = []
    let partially_occupied_buildings = []
    
    buildingMap.forEach((data, buildingId) => {
      if (data.room_count > 0) {
        data.occupancy_rate = Math.round((data.occupied_rooms / data.room_count) * 100)
        
        if (data.occupancy_rate === 0) {
          empty_buildings.push(data)
        } else if (data.occupancy_rate === 100) {
          fully_occupied_buildings.push(data)
        } else {
          partially_occupied_buildings.push(data)
        }
      }
      
      analysis.buildings_breakdown.push(data)
    })
    
    analysis.empty_buildings = empty_buildings
    analysis.fully_occupied_buildings = fully_occupied_buildings
    analysis.partially_occupied_buildings = partially_occupied_buildings
    analysis.total_occupied_rooms = rooms?.filter(r => {
      const status = r.status?.toUpperCase();
      return r.tenants?.length > 0 || status === 'OCCUPIED' || status === 'RENTED';
    }).length || 0
    analysis.total_vacant_rooms = rooms?.filter(r => {
      const status = r.status?.toUpperCase();
      return (!r.tenants || r.tenants.length === 0) && status !== 'OCCUPIED' && status !== 'RENTED';
    }).length || 0
    analysis.overall_occupancy_rate = analysis.total_rooms > 0 
      ? Math.round((analysis.total_occupied_rooms / analysis.total_rooms) * 100) 
      : 0
    
    return analysis
  }
  
  // Handle no data responses naturally
  static getNoDataResponse(query: string, intent: any): string {
    const responses = {
      rooms: [
        "I couldn't find any rooms matching your criteria. Would you like me to search with different parameters?",
        "Unfortunately, there aren't any rooms available that match what you're looking for right now. Can I help you search for something else?",
        "I searched our database but didn't find rooms meeting those requirements. Would you like to broaden your search?"
      ],
      tenants: [
        "I couldn't find any tenant information matching your query. Would you like to search differently?",
        "No tenants were found based on your search criteria. Can I help with something else?"
      ],
      buildings: [
        "I couldn't locate any buildings matching your description. Would you like to try a different search?",
        "No buildings were found in our system that match your criteria. Can I help you look for properties in a different area?"
      ],
      leads: [
        "I didn't find any leads matching your search. Would you like to check recent leads instead?",
        "No leads were found based on your criteria. Can I help you with something else?"
      ],
      general: [
        "I searched our database but couldn't find what you're looking for. Could you provide more details or try a different query?",
        "I wasn't able to find information matching your request. Would you like to try searching for something else?",
        "Sorry, I couldn't locate the information you requested. How else can I assist you?"
      ]
    }
    
    // Choose appropriate response based on intent
    const tableType = intent.tables?.[0] || 'general'
    const responseOptions = responses[tableType as keyof typeof responses] || responses.general
    return responseOptions[Math.floor(Math.random() * responseOptions.length)]
  }
  
  // Utility: Format data for display
  static formatDataForDisplay(data: any): any {
    const formatted: any = {}
    
    if (data.rooms && Array.isArray(data.rooms)) {
      formatted.rooms = data.rooms.map((room: any) => ({
        id: room.room_id,
        room_number: room.room_number,
        building: room.buildings?.building_name,
        type: room.room_type,
        price: room.private_room_rent,
        status: room.status,
        floor: room.floor_number,
        furnished: room.furnished,
        location: `${room.buildings?.city}, ${room.buildings?.state}`
      }))
    }
    
    if (data.buildings && Array.isArray(data.buildings)) {
      formatted.buildings = data.buildings.map((building: any) => ({
        id: building.building_id,
        name: building.building_name,
        address: building.address,
        city: building.city,
        state: building.state,
        total_units: building.total_units,
        available_units: building.available_units
      }))
    }
    
    if (data.tenants && Array.isArray(data.tenants)) {
      formatted.tenants = data.tenants.map((tenant: any) => ({
        id: tenant.tenant_id,
        name: tenant.tenant_name || `${tenant.first_name || ''} ${tenant.last_name || ''}`.trim() || 'Unknown',
        email: tenant.tenant_email || tenant.email,
        phone: tenant.phone,
        room: tenant.rooms?.room_number,
        building: tenant.rooms?.buildings?.building_name
      }))
    }
    
    if (data.leads && Array.isArray(data.leads)) {
      formatted.leads = data.leads.map((lead: any) => ({
        id: lead.lead_id,
        name: `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || lead.email,
        email: lead.email,
        status: lead.status || lead.lead_status,
        source: lead.source || lead.lead_source,
        created: lead.created_at
      }))
    }
    
    if (data.operators && Array.isArray(data.operators)) {
      formatted.operators = data.operators.map((operator: any) => ({
        id: operator.operator_id,
        name: operator.name,
        email: operator.email,
        phone: operator.phone,
        company: operator.company,
        buildings: operator.buildings?.map((b: any) => b.building_name) || []
      }))
    }
    
    if (data.occupancy_analysis) {
      formatted.occupancy_analysis = data.occupancy_analysis
    }
    
    return formatted
  }
}

export default RAGChatbotService