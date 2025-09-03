# HomeWiz System Analysis Report

## Overview
HomeWiz is a property management system with an AI-powered chat interface for querying and managing rental properties, tenants, leads, and analytics.

## System Architecture

### Frontend (Next.js 13 + React)
- **Port**: 3000
- **Main Features**:
  - AI Chat Interface
  - Property exploration
  - Form management system
  - Analytics dashboard
  - Lead management

### Backend (FastAPI + Python)
- **Port**: 8002
- **Main Features**:
  - Natural language query processing
  - Google Gemini LLM integration
  - Supabase database operations
  - Multi-layer query verification

## Data Flow Architecture

```
User Query (Frontend)
    ↓
BackendIntegratedChatInterface.tsx
    ↓
Backend Health Check (every 5 min)
    ↓
If Backend Available:
    → POST /query/ or /universal-query/
    → Intelligent Function Dispatcher
    → Route to appropriate handler:
        - Universal Query Processor (SQL)
        - Building/Room Finder
        - Analytics Generator
        - Lead Insights
    → Result Verification
    → Response to Frontend
    ↓
If Backend Unavailable:
    → Direct Supabase Query
    → LLM Result Parsing (optional)
    ↓
Interactive Message Renderer
    ↓
Display Results to User
```

## Key Integration Points

### 1. Chat Query Flow
**Frontend**: `BackendIntegratedChatInterface.tsx`
- Sends: `{ query: "user's natural language query" }`
- Endpoint: `POST ${BACKEND_URL}/query/`
- Headers: `Content-Type: application/json`

**Backend**: `query.py` → `ai_dispatcher.py`
- Processes natural language
- Determines intent and routes to appropriate function
- Returns structured response with metadata

**Response Format**:
```json
{
  "success": true,
  "function_called": "function_name",
  "result": {
    "data": [...],
    "message": "Human-readable message",
    "metadata": {...}
  },
  "confidence": 0.95
}
```

### 2. Database Schema (Supabase)

**Core Tables**:
- `operators` - Staff managing properties
- `buildings` - Property information
- `rooms` - Individual units
- `tenants` - Current renters
- `leads` - Potential renters
- `scheduled_events` - Tours and appointments
- `maintenance_requests` - Repair requests
- `notifications` - System notifications
- `documents` - Stored documents
- `checklists` - Task management

**Relationships**:
- Buildings → Rooms (1:many)
- Rooms → Tenants (1:1 current)
- Buildings → Operators (many:many)
- Leads → Scheduled Events (1:many)

### 3. AI Query Processing Pipeline

**Stage 1: Intent Recognition**
- Function: `intelligent_function_dispatcher_supabase.py`
- Uses Gemini to classify query intent
- Routes to appropriate handler

**Stage 2: Query Processing**
Options based on intent:

a) **Universal Query** (SQL-based):
   - `hallucination_free_query_processor.py`
   - Generates SQL with schema constraints
   - Executes safely against database
   - Verifies and structures results

b) **Building/Room Search**:
   - `intelligent_building_room_finder.py`
   - Semantic search with filters
   - Returns available properties

c) **Analytics**:
   - `v3_intelligent_insights_supabase.py`
   - Generates business insights
   - Financial analysis
   - Occupancy metrics

d) **Lead Analysis**:
   - Conversion funnel analysis
   - Lead scoring and insights

**Stage 3: Result Verification**
- `result_verifier.py`
- Validates data integrity
- Ensures no hallucination
- Formats for frontend display

### 4. Frontend Display Components

**Based on Response Type**:
- **Room/Building Data**: `InteractiveMessageRenderer`
  - Card-based layout
  - Action buttons (schedule tour, contact)
  - Image galleries

- **Analytics Data**: `AnalyticsMessageDisplay`
  - Charts and graphs
  - Key metrics highlighting
  - Trend analysis

- **Complex Data**: `SmartDataVisualizer`
  - JSON tree view
  - Tabular data
  - Export capabilities

- **No Results**: `NoResultsDisplay`
  - Helpful suggestions
  - Alternative queries

## Current System Status

### ✅ Working Components
1. **Frontend**:
   - Chat interface fully functional
   - Backend connection with retry logic
   - Fallback to direct Supabase
   - All display components operational

2. **Backend**:
   - Query processing pipeline active
   - All AI services functional
   - Database connections working
   - Error handling in place

3. **Integration**:
   - REST API communication
   - JSON data exchange
   - CORS properly configured (for local)

### ⚠️ Issues & Limitations

1. **CORS Issue**: Production backend blocks localhost:3000
   - Solution: Use local backend on port 8002

2. **WebSocket**: Not implemented
   - Chat updates via polling only
   - No real-time notifications

3. **Authentication**: Not enforced
   - Using Supabase anonymous key
   - No row-level security

4. **Commented Endpoints**: Many CRUD endpoints disabled
   - Only query endpoints active
   - Form submissions may not work

5. **Data Type Issues**:
   - Some numeric fields stored as TEXT
   - Requires parsing in queries

## Testing Queries

### Basic Queries to Test:
1. "Show me all available rooms"
2. "What buildings do we have?"
3. "Show me tenant information"
4. "Generate analytics report"
5. "Find rooms under $1000"
6. "Show me today's scheduled tours"

### Expected Flow:
1. Query enters chat interface
2. Backend processes via AI
3. Returns structured data
4. Frontend renders appropriately
5. User can interact with results

## Configuration Verification

### Frontend (.env.local):
```
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8002
NEXT_PUBLIC_BACKEND_WS_URL=ws://localhost:8002/ws/chat
NEXT_PUBLIC_USE_BACKEND_AI=true
NEXT_PUBLIC_DISABLE_BACKEND=false
```

### Backend (.env):
```
GEMINI_API_KEY=<your-key>
NEXT_PUBLIC_SUPABASE_URL=<supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-key>
```

## Recommendations

1. **Enable Authentication**: Implement auth middleware
2. **Activate CRUD Endpoints**: Uncomment and test form endpoints
3. **Add WebSocket**: Real-time updates for chat
4. **Fix Data Types**: Standardize numeric fields
5. **Add Monitoring**: Request logging and performance metrics
6. **Implement Caching**: Query result caching for performance

## Conclusion

The system is well-architected with strong AI capabilities and good separation of concerns. The main functionality (AI chat queries) is fully operational. Secondary features (forms, CRUD operations) need activation and testing.