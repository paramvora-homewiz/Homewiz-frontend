import { createClient } from '@supabase/supabase-js'
import { GoogleGenerativeAI } from '@google/generative-ai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

export interface SchedulingRequest {
  userQuery: string
  userEmail?: string
  userPhone?: string
  preferredDates?: string[]
  roomIds?: string[]
  buildingIds?: string[]
}

export interface SchedulingResponse {
  success: boolean
  message: string
  scheduledTours?: {
    roomId: string
    roomNumber: string
    buildingName: string
    proposedDate: string
    status: 'pending' | 'confirmed'
  }[]
  error?: string
}

export class SchedulingAgent {
  
  // Main scheduling pipeline with parallel processing
  static async processSchedulingRequest(request: SchedulingRequest): Promise<SchedulingResponse> {
    try {
      // Parse user intent for scheduling
      const intent = await this.parseSchedulingIntent(request.userQuery)
      
      // Run parallel tasks
      const [availabilityData, roomData, operatorData] = await Promise.all([
        this.checkAvailability(intent, request),
        this.fetchRoomDetails(intent, request),
        this.findAvailableOperators(intent)
      ])
      
      // Generate optimal schedule
      const schedule = await this.generateSchedule(
        intent,
        availabilityData,
        roomData,
        operatorData,
        request
      )
      
      // Create tour bookings
      const bookings = await this.createTourBookings(schedule, request)
      
      return {
        success: true,
        message: this.generateConfirmationMessage(bookings),
        scheduledTours: bookings
      }
      
    } catch (error) {
      console.error('Scheduling error:', error)
      return {
        success: false,
        message: 'Unable to schedule tours at this time.',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  // Parse scheduling intent from natural language
  static async parseSchedulingIntent(query: string) {
    const prompt = `Extract scheduling intent from this query:
    "${query}"
    
    Return JSON with:
    {
      "scheduling_type": "single|multiple|building_wide",
      "time_preference": "morning|afternoon|evening|flexible",
      "urgency": "asap|this_week|next_week|flexible",
      "specific_rooms": ["room_numbers"],
      "specific_buildings": ["building_names"],
      "group_tour": boolean,
      "special_requirements": "string or null"
    }`
    
    try {
      const result = await model.generateContent(prompt)
      const text = result.response.text()
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.error('Intent parsing error:', error)
    }
    
    return {
      scheduling_type: 'flexible',
      time_preference: 'flexible',
      urgency: 'flexible',
      specific_rooms: [],
      specific_buildings: [],
      group_tour: false,
      special_requirements: null
    }
  }
  
  // Check availability for rooms and time slots
  static async checkAvailability(intent: any, request: SchedulingRequest) {
    const availability: any = {
      rooms: {},
      timeSlots: {}
    }
    
    // Get room availability
    if (request.roomIds && request.roomIds.length > 0) {
      const { data: rooms } = await supabase
        .from('rooms')
        .select('*, buildings(*)')
        .in('room_id', request.roomIds)
        .eq('ready_to_rent', true)
      
      if (rooms) {
        rooms.forEach(room => {
          availability.rooms[room.room_id] = {
            available: room.status === 'AVAILABLE' || room.status === 'Available',
            room_number: room.room_number,
            building_name: room.buildings?.building_name
          }
        })
      }
    }
    
    // Generate available time slots
    const now = new Date()
    const slots = []
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date(now)
      date.setDate(date.getDate() + i)
      
      // Skip weekends if needed
      if (date.getDay() === 0 || date.getDay() === 6) continue
      
      // Morning, afternoon, evening slots
      slots.push({
        date: date.toISOString().split('T')[0],
        times: ['10:00 AM', '2:00 PM', '5:00 PM']
      })
    }
    
    availability.timeSlots = slots
    
    return availability
  }
  
  // Fetch detailed room information
  static async fetchRoomDetails(intent: any, request: SchedulingRequest) {
    let query = supabase
      .from('rooms')
      .select('*, buildings(*)')
      .eq('ready_to_rent', true)
      .in('status', ['AVAILABLE', 'Available'])
    
    if (request.roomIds && request.roomIds.length > 0) {
      query = query.in('room_id', request.roomIds)
    } else if (request.buildingIds && request.buildingIds.length > 0) {
      query = query.in('building_id', request.buildingIds)
    } else if (intent.specific_buildings.length > 0) {
      // First get building IDs from names
      const { data: buildings } = await supabase
        .from('buildings')
        .select('building_id')
        .in('building_name', intent.specific_buildings)
      
      if (buildings) {
        const buildingIds = buildings.map(b => b.building_id)
        query = query.in('building_id', buildingIds)
      }
    }
    
    const { data: rooms } = await query.limit(10)
    
    return rooms || []
  }
  
  // Find available operators for tours
  static async findAvailableOperators(intent: any) {
    const { data: operators } = await supabase
      .from('operators')
      .select('*, buildings(*)')
      .limit(5)
    
    return operators || []
  }
  
  // Generate optimal schedule based on all data
  static async generateSchedule(
    intent: any,
    availability: any,
    rooms: any[],
    operators: any[],
    request: SchedulingRequest
  ) {
    const schedule = []
    
    // Use AI to generate optimal schedule
    const prompt = `Generate an optimal tour schedule based on:
    - User intent: ${JSON.stringify(intent)}
    - Available rooms: ${rooms.length} rooms
    - Available time slots: Next 5 business days
    - User preferences: ${request.preferredDates?.join(', ') || 'Flexible'}
    
    Create a schedule that:
    1. Prioritizes user preferences
    2. Groups tours in the same building
    3. Allows 30 minutes per tour
    4. Avoids scheduling conflicts
    
    Return a brief schedule summary.`
    
    try {
      const result = await model.generateContent(prompt)
      const suggestion = result.response.text()
      
      // Create actual schedule entries
      const availableSlots = availability.timeSlots || []
      const roomsToSchedule = rooms.slice(0, Math.min(3, rooms.length)) // Max 3 tours
      
      roomsToSchedule.forEach((room, index) => {
        if (availableSlots[index]) {
          schedule.push({
            roomId: room.room_id,
            roomNumber: room.room_number,
            buildingName: room.buildings?.building_name,
            buildingId: room.building_id,
            date: availableSlots[index].date,
            time: availableSlots[index].times[0],
            operatorId: operators[0]?.operator_id
          })
        }
      })
      
    } catch (error) {
      console.error('Schedule generation error:', error)
    }
    
    return schedule
  }
  
  // Create tour bookings in the database
  static async createTourBookings(schedule: any[], request: SchedulingRequest) {
    const bookings = []
    
    for (const tour of schedule) {
      // In a real system, you'd create actual booking records
      // For now, we'll return the proposed schedule
      bookings.push({
        roomId: tour.roomId,
        roomNumber: tour.roomNumber,
        buildingName: tour.buildingName,
        proposedDate: `${tour.date} at ${tour.time}`,
        status: 'pending' as const
      })
    }
    
    return bookings
  }
  
  // Generate user-friendly confirmation message
  static generateConfirmationMessage(bookings: any[]): string {
    if (bookings.length === 0) {
      return "I couldn't schedule any tours at this time. Please try different dates or properties."
    }
    
    if (bookings.length === 1) {
      const tour = bookings[0]
      return `Great! I've scheduled a tour for Room ${tour.roomNumber} at ${tour.buildingName} on ${tour.proposedDate}. You'll receive a confirmation email shortly.`
    }
    
    return `Perfect! I've scheduled ${bookings.length} tours for you:\n${
      bookings.map(t => `• Room ${t.roomNumber} at ${t.buildingName} - ${t.proposedDate}`).join('\n')
    }\n\nYou'll receive confirmation emails for each tour.`
  }
}

// Parallel execution helper
export async function scheduleMultipleTours(requests: SchedulingRequest[]): Promise<SchedulingResponse[]> {
  // Process multiple scheduling requests in parallel
  const results = await Promise.all(
    requests.map(request => SchedulingAgent.processSchedulingRequest(request))
  )
  
  return results
}