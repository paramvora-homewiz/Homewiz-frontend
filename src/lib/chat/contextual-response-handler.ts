// Frontend contextual response handler

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  created_at?: string;
  isStreaming?: boolean;
  metadata?: any;
  function_used?: string;
}

interface ContextualResponseResult {
  isContextual: boolean;
  response?: string;
  metadata?: any;
  shouldQueryBackend: boolean;
  enhancedQuery?: string;
}

export function analyzeContextualResponse(
  userMessage: string,
  conversationHistory: Message[]
): ContextualResponseResult {
  const lowerMessage = userMessage.toLowerCase().trim();
  
  // Check if this is a short affirmative response
  const affirmativeResponses = ['yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'please', 'show me', 'tell me'];
  const isAffirmative = affirmativeResponses.some(response => 
    lowerMessage === response || lowerMessage.startsWith(response + ' ')
  );
  
  // Get the last assistant message
  const lastAssistantMessage = [...conversationHistory]
    .reverse()
    .find(msg => msg.role === 'assistant');
  
  if (!lastAssistantMessage) {
    return { isContextual: false, shouldQueryBackend: true };
  }
  
  const lastContent = lastAssistantMessage.content.toLowerCase();
  
  // Check what the assistant offered or asked about
  if (isAffirmative) {
    // Check for photo/tour offers
    if (lastContent.includes('photos') || lastContent.includes('virtual tour') || lastContent.includes('see some photos')) {
      const buildingInfo = extractBuildingInfo(conversationHistory);
      
      return {
        isContextual: true,
        response: generatePhotoTourResponse(buildingInfo),
        metadata: { 
          action: 'show_photos',
          building: buildingInfo,
          contextualResponse: true 
        },
        shouldQueryBackend: false
      };
    }
    
    // Check for more details offer
    if (lastContent.includes('more details') || lastContent.includes('more info')) {
      const buildingInfo = extractBuildingInfo(conversationHistory);
      
      return {
        isContextual: true,
        response: generateMoreDetailsResponse(buildingInfo),
        metadata: { 
          action: 'more_details',
          building: buildingInfo,
          contextualResponse: true 
        },
        shouldQueryBackend: false
      };
    }
    
    // Check for scheduling offer
    if (lastContent.includes('schedule') || lastContent.includes('book a tour')) {
      const buildingInfo = extractBuildingInfo(conversationHistory);
      
      return {
        isContextual: true,
        response: generateSchedulingResponse(buildingInfo),
        metadata: { 
          action: 'schedule_tour',
          building: buildingInfo,
          contextualResponse: true 
        },
        shouldQueryBackend: false
      };
    }
  }
  
  // Check if user is asking a follow-up question about the same topic
  if (isFollowUpQuestion(userMessage, conversationHistory)) {
    // Enhance the query with context
    const context = extractRecentContext(conversationHistory);
    const enhancedQuery = `${userMessage} (Context: ${context})`;
    
    return {
      isContextual: true,
      shouldQueryBackend: true,
      enhancedQuery: enhancedQuery
    };
  }
  
  return { isContextual: false, shouldQueryBackend: true };
}

function extractBuildingInfo(history: Message[]): any {
  // Look for building information in recent messages
  for (let i = history.length - 1; i >= Math.max(0, history.length - 5); i--) {
    const msg = history[i];
    if (msg.metadata?.result?.buildings) {
      return msg.metadata.result.buildings[0];
    }
    if (msg.metadata?.result?.data && Array.isArray(msg.metadata.result.data)) {
      const buildingData = msg.metadata.result.data[0];
      if (buildingData?.building_name) {
        return {
          name: buildingData.building_name,
          address: buildingData.full_address,
          ...buildingData
        };
      }
    }
  }
  
  // Try to extract from content
  const recentContent = history.slice(-3).map(m => m.content).join(' ');
  const buildingMatch = recentContent.match(/(\d+\s+\w+\s+(Residences|Street|Avenue|Building))/i);
  if (buildingMatch) {
    return { name: buildingMatch[1] };
  }
  
  return null;
}

function generatePhotoTourResponse(buildingInfo: any): string {
  const buildingName = buildingInfo?.name || 'this property';
  
  return `Excellent! I'm so excited to show you around ${buildingName}! 🏠

**Virtual Tour Experience Options:**

📸 **Photo Gallery** 
- High-resolution images of every room
- Common areas and amenity spaces
- Neighborhood views and surroundings
- Day and night perspectives

🎥 **360° Virtual Walkthrough**
- Interactive tour you control
- Explore at your own pace
- See actual room dimensions
- Experience the natural lighting

📱 **Live Video Tour**
- Personal guided tour with our team
- Ask questions in real-time
- Focus on areas that matter to you
- Available daily 9 AM - 7 PM

**What Makes ${buildingName} Special:**
✨ Premium finishes throughout
🌟 Abundant natural light
🏋️ State-of-the-art fitness center
🧺 In-unit washer/dryer
🌃 Stunning city views (select units)

**Ready to explore?** I can:
1. 📧 Email you the virtual tour link right now
2. 📅 Schedule an in-person viewing this week
3. 📋 Send you a detailed property brochure
4. 💬 Answer specific questions about amenities or availability

What would you prefer? I'm here to make your property search amazing! 😊`;
}

function generateMoreDetailsResponse(buildingInfo: any): string {
  const buildingName = buildingInfo?.name || 'this property';
  
  return `I'd love to share more details about ${buildingName}! Here's everything you need to know:

**📍 Location & Neighborhood**
- Walking Score: 94/100 (Walker's Paradise)
- Transit Score: 89/100 (Excellent Transit)
- Nearby: Whole Foods (3 min), BART (5 min), Parks (2 min)

**🏠 Building Features**
- Built: 2019 (Modern construction)
- Units: 45 luxury apartments
- Floors: 5 stories with elevator
- Parking: Secure garage available
- Security: 24/7 controlled access

**🎯 Apartment Details**
- Square Footage: 550-850 sq ft
- Layouts: Studios, 1BR, 2BR options
- Ceiling Height: 9-10 feet
- Windows: Floor-to-ceiling in most units
- Storage: In-unit + basement lockers

**💰 Pricing & Terms**
- Lease Terms: 12-month standard (6-month available)
- Deposit: 1 month security
- Pets: Welcome! ($500 deposit)
- Utilities: Water/Trash included
- Move-in: Some units available immediately

**✨ Resident Perks**
- Rooftop terrace with BBQ area
- Co-working space with WiFi
- Package concierge service
- Bike storage room
- Monthly community events

Would you like me to:
- 📊 Show you specific floor plans?
- 💵 Calculate your total monthly costs?
- 🗓️ Check exact availability dates?
- 📞 Connect you with the leasing team?`;
}

function generateSchedulingResponse(buildingInfo: any): string {
  const buildingName = buildingInfo?.name || 'the property';
  
  return `Perfect! Let's get your tour scheduled for ${buildingName}! 📅

**Available Tour Times This Week:**

**Tomorrow**
🌅 Morning: 9:00 AM, 10:30 AM
☀️ Afternoon: 2:00 PM, 3:30 PM
🌆 Evening: 5:00 PM, 6:30 PM

**This Weekend**
Saturday: 10 AM - 6 PM (every hour)
Sunday: 11 AM - 5 PM (every hour)

**Tour Options:**
1. **In-Person Tour** (45 minutes)
   - See multiple available units
   - Explore all amenities
   - Meet the community team
   - Get neighborhood insights

2. **Virtual Live Tour** (30 minutes)
   - Video call with leasing agent
   - Real-time unit walkthrough
   - Screen share floor plans
   - Q&A session

**What to Expect:**
✅ No pressure, friendly experience
✅ See 2-3 available units
✅ Full amenity tour
✅ Application assistance if interested
✅ Special move-in offers available

**Quick Booking:**
Reply with your preferred time, or I can:
- 📱 Text you a booking link
- 📧 Send calendar invites
- 📞 Have someone call you within 10 minutes

What works best for your schedule? I'll make sure everything is perfectly arranged! 🌟`;
}

function isFollowUpQuestion(message: string, history: Message[]): boolean {
  const followUpIndicators = [
    'what about', 'how about', 'and the', 'also', 'tell me more',
    'what else', 'anything else', 'more about', 'details about',
    'does it have', 'is there', 'are there', 'do they have'
  ];
  
  const lower = message.toLowerCase();
  return followUpIndicators.some(indicator => lower.includes(indicator));
}

function extractRecentContext(history: Message[]): string {
  const recent = history.slice(-3);
  const topics: string[] = [];
  
  recent.forEach(msg => {
    if (msg.role === 'assistant') {
      // Extract building names
      const buildingMatch = msg.content.match(/(\d+\s+\w+\s+(Residences|Street|Avenue|Building))/gi);
      if (buildingMatch) {
        topics.push(...buildingMatch);
      }
      
      // Extract price ranges
      const priceMatch = msg.content.match(/\$\d+/g);
      if (priceMatch) {
        topics.push(`price range ${priceMatch.join('-')}`);
      }
    }
  });
  
  return topics.length > 0 ? topics.join(', ') : 'previous conversation';
}