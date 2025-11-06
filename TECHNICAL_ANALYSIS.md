# HomeWiz - Technical Deep Dive Analysis

## 🏛️ System Architecture

### Three-Tier Architecture
```
Presentation Layer (Frontend)
    ↓
Business Logic Layer (Backend)
    ↓
Data Layer (Supabase)
```

---

## 🎨 Frontend Architecture

### Next.js App Router Structure
```
app/
├── (dashboard)/          # Protected dashboard routes
│   ├── page.tsx         # Main dashboard
│   ├── analytics/       # Analytics pages
│   └── settings/        # User settings
├── api/                 # API routes (server-side)
├── chat/                # AI chat interface
├── explore/             # Property explorer
└── lead-analytics/      # Lead management
```

### Component Hierarchy
```
App (Root)
├── Middleware (Auth, Logging)
├── Layout (Navigation, Sidebar)
├── Pages
│   ├── Dashboard
│   │   ├── PropertyCards
│   │   ├── AnalyticsCharts
│   │   └── MetricsPanel
│   ├── Chat
│   │   ├── ChatInput
│   │   ├── MessageList
│   │   └── ResponseDisplay
│   └── Explore
│       ├── SearchFilters
│       ├── PropertyGrid
│       └── PropertyDetails
└── Providers (Supabase, Auth)
```

### State Management
- **React Context**: User auth, theme, notifications
- **React Hooks**: Local component state
- **Supabase Real-time**: Live data updates
- **URL State**: Search filters, pagination

### Data Flow
```
User Input
    ↓
React Component
    ↓
Supabase Client / API Call
    ↓
Backend / Database
    ↓
Response Processing
    ↓
State Update
    ↓
UI Re-render
```

---

## 🔧 Backend Architecture

### FastAPI Application Structure
```
app/
├── main.py              # FastAPI app initialization
├── config.py            # Configuration management
├── middleware/          # CORS, auth, logging
├── endpoints/           # API route handlers
├── services/            # Business logic
├── models/              # Data models
├── db/                  # Database connection
└── ai_services/         # AI query processing
```

### Request Processing Pipeline
```
HTTP Request
    ↓
CORS Middleware
    ↓
Route Handler
    ↓
Input Validation (Pydantic)
    ↓
Business Logic (Service)
    ↓
Database Query
    ↓
AI Processing (if needed)
    ↓
Response Formatting
    ↓
HTTP Response
```

### AI Query Processing System
```
User Query (Natural Language)
    ↓
Schema Injection (Table/Column Names)
    ↓
Gemini AI (SQL Generation)
    ↓
SQL Validation Layer
    ↓
Permission Check
    ↓
SQL Execution (Supabase)
    ↓
Result Verification
    ↓
Frontend Response Formatting
    ↓
JSON Response
```

---

## 🗄️ Database Schema (Supabase)

### Core Tables
```
rooms
├── room_id (PK)
├── room_number
├── building_id (FK)
├── rent
├── status
├── amenities
└── ...

buildings
├── building_id (PK)
├── name
├── address
├── total_rooms
└── ...

tenants
├── tenant_id (PK)
├── name
├── email
├── building_id (FK)
└── ...

leads
├── lead_id (PK)
├── name
├── email
├── interested_rooms
└── ...
```

### Security Features
- Row-Level Security (RLS) policies
- Column-level access control
- User authentication via JWT
- Permission-based queries

---

## 🔐 Authentication & Authorization

### Frontend Auth Flow
```
User Login
    ↓
Clerk Authentication
    ↓
JWT Token Generation
    ↓
Store in Session
    ↓
Attach to API Requests
    ↓
Access Protected Routes
```

### Backend Permission Levels
```
Basic User
├── Tables: rooms, buildings
├── Operations: SELECT
└── Use: Property search

Agent
├── Tables: rooms, buildings, leads, events
├── Operations: SELECT, INSERT, UPDATE
└── Use: Lead management

Manager
├── Tables: rooms, buildings, tenants, leads, maintenance
├── Operations: SELECT, INSERT, UPDATE
└── Use: Full management

Admin
├── Tables: All
├── Operations: All
└── Use: System administration
```

---

## 📡 API Communication

### Frontend to Backend
```
fetch('/api/universal-query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "Find rooms under $1200",
    user_context: { permissions, role, user_id }
  })
})
```

### Response Format
```json
{
  "success": true,
  "data": [...],
  "message": "Query successful",
  "metadata": {
    "result_type": "property_search",
    "sql_query": "SELECT...",
    "row_count": 10,
    "execution_time": 1.234
  },
  "errors": [],
  "warnings": []
}
```

---

## 🧪 Testing Strategy

### Frontend Testing
- **Unit Tests**: Component logic, hooks
- **Integration Tests**: API calls, state management
- **E2E Tests**: User workflows
- **Tool**: Vitest + React Testing Library

### Backend Testing
- **Unit Tests**: Service functions, utilities
- **Integration Tests**: Database queries, API endpoints
- **Performance Tests**: Query execution time
- **Tool**: Pytest

### Test Coverage
```
Frontend: 60%+ coverage target
Backend: 80%+ coverage target
```

---

## 🚀 Performance Optimization

### Frontend
- Code splitting (Next.js automatic)
- Image optimization
- CSS-in-JS optimization
- Lazy loading components
- Caching strategies

### Backend
- Query optimization
- Connection pooling
- Response caching
- Pagination for large datasets
- Index optimization

### Database
- Indexed columns for fast queries
- Materialized views for analytics
- Connection pooling
- Query result caching

---

## 🔄 Real-time Features

### Supabase Real-time
```typescript
const subscription = supabase
  .from('rooms')
  .on('*', payload => {
    // Update UI with new data
  })
  .subscribe()
```

### WebSocket Support
- Optional WebSocket for chat
- Real-time notifications
- Live collaboration features

---

## 📊 Monitoring & Logging

### Frontend Logging
- Error tracking (Sentry)
- Performance monitoring
- User analytics
- Debug logs

### Backend Logging
- Request/response logging
- Error tracking
- Performance metrics
- Database query logs

---

## 🛡️ Security Measures

### Frontend
- HTTPS only
- CSRF protection
- XSS prevention
- Secure cookie handling
- Input validation

### Backend
- SQL injection prevention
- Rate limiting
- CORS configuration
- JWT validation
- Permission enforcement

### Database
- RLS policies
- Encrypted connections
- Backup strategies
- Access logging

---

## 📈 Scalability Considerations

### Horizontal Scaling
- Stateless backend design
- Load balancing ready
- Database connection pooling
- Caching layer support

### Vertical Scaling
- Optimized queries
- Efficient algorithms
- Memory management
- Resource pooling

---

**Analysis Date**: 2025-10-27
**Frontend Status**: ✅ Running
**Backend Status**: ⚠️ Dependency Issue

