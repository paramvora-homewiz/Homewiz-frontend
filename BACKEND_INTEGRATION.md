# Homewiz Frontend - Backend Integration Documentation

## Overview

This document provides comprehensive details about the Homewiz frontend application, its integration with the backend API, and all features implemented. This documentation is intended for the backend team to understand the frontend implementation and ensure proper API compatibility.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Environment Configuration](#environment-configuration)
3. [Backend API Integration](#backend-api-integration)
4. [Form Implementations](#form-implementations)
5. [Data Transformation Layer](#data-transformation-layer)
6. [API Endpoints Used](#api-endpoints-used)
7. [Error Handling](#error-handling)
8. [Future Feature Requirements](#future-feature-requirements)
9. [Testing Checklist](#testing-checklist)

---

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 13.5.11 (App Router)
- **Language**: TypeScript 5
- **UI Library**: React 18.2.0
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Context (FormDataProvider)

### Directory Structure
```
/Users/kaushatrivedi/Downloads/Homewiz-frontend-main/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   └── forms/               # Form pages
│   │       ├── building/        # Building form
│   │       ├── room/            # Room form
│   │       ├── tenant/          # Tenant form
│   │       ├── operator/        # Operator form
│   │       └── lead/            # Lead form
│   ├── components/              # React components
│   │   ├── forms/              # Form components
│   │   ├── ui/                 # UI components
│   │   ├── dashboard/          # Dashboard components
│   │   └── chat/               # Chat components
│   ├── lib/                     # Utility libraries
│   │   ├── api/                # Backend API integration
│   │   ├── supabase/           # Supabase integration (deprecated)
│   │   └── backend-sync.ts     # Data transformation functions
│   ├── hooks/                   # Custom React hooks
│   ├── types/                   # TypeScript type definitions
│   └── styles/                  # Global styles
├── .env.local                   # Environment configuration
└── tsconfig.json               # TypeScript configuration
```

---

## Environment Configuration

### Current Environment Variables (.env.local)

```bash
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8002/api
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8002

# Feature Flags
NEXT_PUBLIC_DISABLE_BACKEND=false
NEXT_PUBLIC_USE_BACKEND_AI=true
NEXT_PUBLIC_ENABLE_SUPABASE_DIRECT=true

# Supabase Configuration (legacy - being phased out)
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-key>
```

### Important Notes
- **Backend API**: All forms now use `NEXT_PUBLIC_API_URL` for API calls
- **Port**: Backend runs on port 8002, frontend on port 3000
- **Supabase**: Direct Supabase access is being deprecated in favor of backend API

---

## Backend API Integration

### API Client Architecture

Location: `/src/lib/api/api-client.ts`

The API client provides:
- ✅ Automatic retry logic (configurable retries)
- ✅ Request/response caching (with TTL)
- ✅ Error handling with detailed logging
- ✅ Response validation
- ✅ Automatic cache invalidation on mutations

```typescript
// Example API client usage
import { apiClient } from '@/lib/api/api-client'

const response = await apiClient.post<Building>(
  '/buildings/',
  data,
  {
    validateResponse: true,
    retries: 2
  }
)
```

### API Service Modules

All API services are located in `/src/lib/api/` and exported via barrel export:

```typescript
// /src/lib/api/index.ts
export { buildingsApi } from './buildings-api'
export { roomsApi } from './rooms-api'
export { tenantsApi } from './tenants-api'
export { operatorsApi } from './operators-api'
export { leadsApi } from './leads-api'
export { storageApi } from './storage-api'
export { realtimePolling } from './realtime-polling'
export type * from './types'
```

---

## Form Implementations

### 1. Building Form

**Location**: `/src/app/forms/building/page.tsx`

**Component**: `BuildingForm` (`/src/components/forms/BuildingForm.tsx`)

**API Endpoint Used**: `POST /buildings/`

**Data Flow**:
```typescript
BuildingFormData (frontend)
  → transformBuildingDataForBackend()
  → BuildingInsert (backend format)
  → buildingsApi.create()
  → POST /buildings/
```

**Key Fields**:
- Building name, address, contact information
- Operator assignment
- Amenities (WiFi, laundry, parking, etc.)
- Policies (pets, smoking, guests)
- Building-level pricing and utilities
- Photos/images upload

**Success Behavior**:
- Shows success toast notification
- Redirects to `/forms` dashboard after 1.5 seconds

---

### 2. Room Form

**Location**: `/src/app/forms/room/page.tsx`

**Component**: `RoomForm` (`/src/components/forms/RoomForm.tsx`)

**API Endpoint Used**: `POST /rooms/`

**Data Flow**:
```typescript
RoomFormData (frontend)
  → transformRoomDataForBackend()
  → RoomInsert (backend format)
  → roomsApi.create()
  → POST /rooms/
```

**Key Fields**:
- Room number, floor, square footage
- Building association
- Room type (Single, Double, Triple, Quad, Studio, etc.)
- Occupancy and availability
- Pricing (base rent + shared room pricing for 2 occupants)
- Room features (bathroom type, kitchen, balcony, etc.)
- Furnishing details
- Photos/images upload

**ID Generation**:
```typescript
room_id = `ROOM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
```

**Success Behavior**:
- Shows success toast notification
- Redirects to `/forms` dashboard immediately

---

### 3. Tenant Form

**Location**: `/src/app/forms/tenant/page.tsx`

**Component**: `TenantForm` (`/src/components/forms/TenantForm.tsx`)

**API Endpoint Used**: `POST /tenants/`

**Data Flow**:
```typescript
TenantFormData (frontend)
  → transformTenantDataForBackend()
  → TenantInsert (backend format)
  → tenantsApi.create()
  → POST /tenants/
```

**Key Fields**:
- Personal information (name, email, phone)
- Building and room assignment
- Lease information (start date, end date, rent amount)
- Tenant preferences
- Emergency contact information
- Move-in/move-out dates

**ID Generation**:
```typescript
tenant_id = `TNT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
```

**Success Behavior**:
- Shows success toast notification
- Redirects to `/forms` dashboard

---

### 4. Operator Form

**Location**: `/src/app/forms/operator/page.tsx`

**Component**: `OperatorForm` (`/src/components/forms/OperatorForm.tsx`)

**API Endpoint Used**: `POST /operators/`

**Data Flow**:
```typescript
OperatorFormData (frontend)
  → transformOperatorDataForBackend()
  → OperatorInsert (backend format)
  → operatorsApi.create()
  → POST /operators/
```

**Key Fields**:
- Operator name, email, phone
- Operator type/role:
  - LEASING_AGENT
  - MAINTENANCE
  - BUILDING_MANAGER
  - ADMIN
  - **OWNER** (planned - see Future Features)
- Contact information
- Access permissions

**ID Generation**:
```typescript
operator_id = `OP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
```

**Success Behavior**:
- Shows success toast notification
- Redirects to `/forms` dashboard

---

### 5. Lead Form

**Location**: `/src/app/forms/lead/page.tsx`

**Component**: `LeadForm` (`/src/components/forms/LeadForm.tsx`)

**API Endpoint Used**: `POST /leads/`

**Data Flow**:
```typescript
LeadFormData (frontend)
  → transformLeadDataForBackend()
  → LeadInsert (backend format)
  → leadsApi.create()
  → POST /leads/
```

**Key Fields**:
- Lead contact information
- Interested rooms/buildings
- Budget preferences
- Move-in timeline
- Lead source
- Follow-up status and notes

**ID Generation**:
```typescript
lead_id = `LEAD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
```

**Success Behavior**:
- Shows success toast notification
- Redirects to `/forms` dashboard

---

## Data Transformation Layer

Location: `/src/lib/backend-sync.ts`

All form data is transformed before sending to the backend to ensure compatibility:

### Transformation Functions

```typescript
// Building transformation
export function transformBuildingDataForBackend(data: BuildingFormData): BuildingInsert

// Room transformation
export function transformRoomDataForBackend(data: RoomFormData): RoomInsert

// Tenant transformation
export function transformTenantDataForBackend(data: TenantFormData): TenantInsert

// Operator transformation
export function transformOperatorDataForBackend(data: OperatorFormData): OperatorInsert

// Lead transformation
export function transformLeadDataForBackend(data: LeadFormData): LeadInsert
```

### Common Transformations
- Date conversion (JavaScript Date → ISO strings)
- Boolean normalization
- Array/object flattening
- Field name mapping (camelCase ↔ snake_case)
- Null/undefined handling

---

## API Endpoints Used

### Buildings API

**Base URL**: `http://localhost:8002/api/buildings`

| Method | Endpoint | Purpose | Frontend Usage |
|--------|----------|---------|----------------|
| GET | `/buildings/` | List all buildings | FormDataProvider, Dashboard |
| GET | `/buildings/{id}` | Get single building | Building details page |
| POST | `/buildings/` | Create building | Building form submission |
| PUT | `/buildings/{id}` | Update building | Building edit form |
| DELETE | `/buildings/{id}` | Delete building | Building management |

**Request Body Example** (POST /buildings/):
```json
{
  "building_name": "Sunset Apartments",
  "address": "123 Main St",
  "city": "Boston",
  "state": "MA",
  "zip_code": "02101",
  "country": "USA",
  "operator_id": "OP_1234567890_abc123",
  "total_floors": 5,
  "total_units": 20,
  "amenities": {
    "wifi": true,
    "laundry": true,
    "parking": false
  },
  "policies": {
    "pets_allowed": true,
    "smoking_allowed": false
  }
}
```

---

### Rooms API

**Base URL**: `http://localhost:8002/api/rooms`

| Method | Endpoint | Purpose | Frontend Usage |
|--------|----------|---------|----------------|
| GET | `/rooms/` | List all rooms | FormDataProvider, Room selection |
| GET | `/rooms/{id}` | Get single room | Room details page |
| POST | `/rooms/` | Create room | Room form submission |
| PUT | `/rooms/{id}` | Update room | Room edit form |
| DELETE | `/rooms/{id}` | Delete room | Room management |

**Request Body Example** (POST /rooms/):
```json
{
  "room_id": "ROOM_1234567890_xyz789",
  "building_id": "BLD_1234567890_abc123",
  "room_number": "301",
  "floor": 3,
  "square_footage": 450,
  "room_type": "Double",
  "occupancy": 2,
  "base_rent": 1200,
  "shared_room_rent_2": 800,
  "availability_status": "Available",
  "bathroom_type": "Private",
  "features": {
    "balcony": true,
    "kitchen": "Full"
  }
}
```

---

### Tenants API

**Base URL**: `http://localhost:8002/api/tenants`

| Method | Endpoint | Purpose | Frontend Usage |
|--------|----------|---------|----------------|
| GET | `/tenants/` | List all tenants | Dashboard, Tenant list |
| GET | `/tenants/{id}` | Get single tenant | Tenant details page |
| POST | `/tenants/` | Create tenant | Tenant form submission |
| PUT | `/tenants/{id}` | Update tenant | Tenant edit form |
| DELETE | `/tenants/{id}` | Delete tenant | Tenant management |

**Request Body Example** (POST /tenants/):
```json
{
  "tenant_id": "TNT_1234567890_def456",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "building_id": "BLD_1234567890_abc123",
  "room_id": "ROOM_1234567890_xyz789",
  "lease_start_date": "2025-01-01",
  "lease_end_date": "2025-12-31",
  "rent_amount": 1200,
  "move_in_date": "2025-01-01"
}
```

---

### Operators API

**Base URL**: `http://localhost:8002/api/operators`

| Method | Endpoint | Purpose | Frontend Usage |
|--------|----------|---------|----------------|
| GET | `/operators/` | List all operators | FormDataProvider, Operator selection |
| GET | `/operators/{id}` | Get single operator | Operator details page |
| POST | `/operators/` | Create operator | Operator form submission |
| PUT | `/operators/{id}` | Update operator | Operator edit form |
| DELETE | `/operators/{id}` | Delete operator | Operator management |

**Request Body Example** (POST /operators/):
```json
{
  "operator_id": "OP_1234567890_ghi789",
  "name": "Jane Smith",
  "email": "jane.smith@homewiz.com",
  "phone": "+1234567890",
  "operator_type": "BUILDING_MANAGER",
  "active": true
}
```

---

### Leads API

**Base URL**: `http://localhost:8002/api/leads`

| Method | Endpoint | Purpose | Frontend Usage |
|--------|----------|---------|----------------|
| GET | `/leads/` | List all leads | Dashboard, Leads list |
| GET | `/leads/{id}` | Get single lead | Lead details page |
| POST | `/leads/` | Create lead | Lead form submission |
| PUT | `/leads/{id}` | Update lead | Lead edit form |
| DELETE | `/leads/{id}` | Delete lead | Lead management |

**Request Body Example** (POST /leads/):
```json
{
  "lead_id": "LEAD_1234567890_jkl012",
  "first_name": "Alice",
  "last_name": "Johnson",
  "email": "alice.j@example.com",
  "phone": "+1234567890",
  "interested_room_id": "ROOM_1234567890_xyz789",
  "budget_min": 800,
  "budget_max": 1500,
  "move_in_date": "2025-02-01",
  "lead_source": "Website",
  "status": "New"
}
```

---

## Error Handling

### Error Handling Strategy

Location: `/src/lib/error-handler.ts`

All forms use centralized error handling:

```typescript
import { handleFormSubmissionError, showFormSuccessMessage } from '@/lib/error-handler'

// Success handling
showFormSuccessMessage('building', 'saved')

// Error handling
handleFormSubmissionError(error, {
  additionalInfo: {
    formType: 'building',
    operation: 'save',
    api: 'backend'
  }
})
```

### Error Response Format

Expected backend error response:
```json
{
  "success": false,
  "error": "Error message string",
  "details": {
    "field": "validation error message"
  }
}
```

### Frontend Error Display
- Toast notifications for user-facing errors
- Console logging for debugging
- Detailed error context sent to error handler
- Form remains open on error (doesn't redirect)

---

## Future Feature Requirements

The following features have been planned but **NOT YET IMPLEMENTED**. These are requirements from stakeholders:

### 1. OWNER Role in Operator
**Backend Change Required**: Add `OWNER` to operator type enum
**Location**: `/backend/app/models/operator.py`

Current operator types:
```python
class OperatorType(str, Enum):
    LEASING_AGENT = "LEASING_AGENT"
    MAINTENANCE = "MAINTENANCE"
    BUILDING_MANAGER = "BUILDING_MANAGER"
    ADMIN = "ADMIN"
    # OWNER = "OWNER"  # TO BE ADDED
```

---

### 2. Multi-Select Neighborhoods with Dynamic Add
**Requirement**: Allow users to select multiple neighborhoods and add custom ones

**Backend Changes Required**:
- Change `area` field in Building model from single string to array
- Add neighborhood suggestions endpoint

**Frontend Changes Required**:
- Update BuildingForm to use multi-select component
- Add "Add custom neighborhood" functionality
- Store as array in database

**Example Data Structure**:
```json
{
  "neighborhoods": ["Downtown", "Financial District", "Custom Area"]
}
```

---

### 3. WalkScore API Integration
**Requirement**: Integrate WalkScore API to show walkability, transit, and bike scores

**API Details**:
- WalkScore API: https://www.walkscore.com/professional/api.php
- Requires API key
- Returns Walk Score, Transit Score, Bike Score

**Backend Changes Required**:
- Add fields to Building model:
  - `walk_score` (integer 0-100)
  - `transit_score` (integer 0-100)
  - `bike_score` (integer 0-100)
  - `walkscore_description` (string)

**Frontend Changes Required**:
- Display scores on building details page
- Auto-fetch scores on address input in BuildingForm
- Visual score indicators (color-coded badges)

**Implementation Steps**:
1. Backend creates endpoint: `GET /buildings/{id}/walkscore`
2. Backend fetches from WalkScore API using building address
3. Frontend calls endpoint and displays results
4. Cache scores to avoid repeated API calls

---

### 4. Parking Types Clarification
**Requirement**: Distinguish between different parking types

**Backend Changes Required**:
Add to Building amenities:
```python
parking_types: List[str] = []  # ["Off-street", "Street parking", "Metered street parking", "Garage"]
```

**Frontend Changes Required**:
- Multi-select parking types in BuildingForm
- Replace boolean `parking` with detailed parking options

---

### 5. Individual Bed Leasing (Triple/Quad Rooms)
**Requirement**: Allow leasing each bed individually in shared rooms

**Backend Changes Required**:
Add to Room model:
```python
shared_room_rent_3: Optional[float] = None  # Rent per person in triple occupancy
shared_room_rent_4: Optional[float] = None  # Rent per person in quad occupancy
individual_bed_leasing: bool = False  # Enable individual bed contracts
```

**Frontend Changes Required**:
- Add pricing fields for 3 and 4 occupants in RoomForm
- Add checkbox for "Allow individual bed leasing"
- Update room display to show per-bed pricing

**Example Pricing**:
- Single: $1500/month (1 person)
- Double: $900/month per person (2 people)
- Triple: $700/month per person (3 people)
- Quad: $600/month per person (4 people)

---

### 6. Room Configuration: Single to Bunk Beds
**Requirement**: Track whether room uses single beds or bunk beds

**Backend Changes Required**:
Add to Room model:
```python
bed_configuration: str = "Single"  # "Single", "Bunk", "Mixed"
```

**Frontend Changes Required**:
- Add bed configuration dropdown in RoomForm
- Display bed type in room details

---

### 7. Street Facing Room / Sunlight Information
**Requirement**: Replace "Dark Room/Sunlight Room" with more specific information

**Backend Changes Required**:
Add to Room features:
```python
street_facing: bool = False
sunlight_level: str = "Medium"  # "Low", "Medium", "High"
noise_level: str = "Quiet"  # "Quiet", "Moderate", "Noisy"
```

**Frontend Changes Required**:
- Add "Street Facing" checkbox in RoomForm
- Add "Sunlight Level" dropdown (Low/Medium/High)
- Add "Noise Level" dropdown (Quiet/Moderate/Noisy)

---

### 8. Owner Notes Field
**Requirement**: Add private notes field for property owners

**Backend Changes Required**:
Add to Building, Room, and Tenant models:
```python
owner_notes: Optional[str] = None  # Private notes, not visible to tenants
```

**Frontend Changes Required**:
- Add "Owner Notes" textarea in BuildingForm, RoomForm, TenantForm
- Mark as "Internal use only" in UI
- Restrict visibility based on user role (only OWNER and ADMIN can see)

---

### 9. Workflow Automation (Future - Manual for Now)
**Requirement**: Automate lease renewal, maintenance requests, payment reminders

**Current State**: All workflows are manual

**Future Implementation**:
- Automated email notifications for lease renewals
- Maintenance request ticketing system
- Payment reminder system
- Integration with calendar for scheduling

---

## Testing Checklist

### Backend API Testing Checklist

Before deploying to production, verify:

#### Buildings API
- [ ] POST /buildings/ creates building successfully
- [ ] POST /buildings/ returns proper error for missing required fields
- [ ] POST /buildings/ validates operator_id exists
- [ ] GET /buildings/ returns all buildings with proper pagination
- [ ] GET /buildings/{id} returns single building
- [ ] PUT /buildings/{id} updates building
- [ ] DELETE /buildings/{id} soft deletes building

#### Rooms API
- [ ] POST /rooms/ creates room successfully
- [ ] POST /rooms/ validates building_id exists
- [ ] POST /rooms/ enforces room_number uniqueness per building
- [ ] Shared room pricing fields accept null/undefined
- [ ] GET /rooms/ filters by building_id
- [ ] Room availability status updates work

#### Tenants API
- [ ] POST /tenants/ creates tenant successfully
- [ ] POST /tenants/ validates room_id and building_id exist
- [ ] Lease date validation (start < end)
- [ ] Email uniqueness validation
- [ ] Phone number format validation

#### Operators API
- [ ] POST /operators/ creates operator successfully
- [ ] Operator type enum validation works
- [ ] Email uniqueness validation
- [ ] Active/inactive status toggle works

#### Leads API
- [ ] POST /leads/ creates lead successfully
- [ ] Lead status tracking works
- [ ] Budget range validation
- [ ] Move-in date is in future

### Frontend Form Testing Checklist

- [ ] Building form submits and shows success message
- [ ] Room form submits and redirects to /forms
- [ ] Tenant form submits and creates tenant record
- [ ] Operator form submits with correct operator_type
- [ ] Lead form submits and captures all fields
- [ ] All forms show proper error messages on failure
- [ ] Form validation prevents invalid submissions
- [ ] Cancel buttons redirect back to /forms
- [ ] FormDataProvider loads buildings/rooms/operators properly
- [ ] Image uploads work (if implemented)

### Integration Testing
- [ ] Frontend on port 3000 connects to backend on port 8002
- [ ] CORS is properly configured on backend
- [ ] API responses match expected format (success/error)
- [ ] Data transformation functions handle all edge cases
- [ ] Error responses from backend are properly displayed
- [ ] Success responses trigger proper UI feedback

---

## Development Commands

### Start Frontend
```bash
cd /Users/kaushatrivedi/Downloads/Homewiz-frontend-main
npm run dev
```
Frontend runs on: http://localhost:3000

### Start Backend (from backend directory)
```bash
cd /Users/kaushatrivedi/Downloads/Homewiz-Project/backend
# (Backend start command - check backend README)
```
Backend runs on: http://localhost:8002

---

## Migration Status

### ✅ Completed
- All 5 forms migrated from Supabase direct access to backend API
- Building form using buildingsApi.create()
- Room form using roomsApi.create()
- Tenant form using tenantsApi.create()
- Operator form using operatorsApi.create()
- Lead form using leadsApi.create()
- Centralized API client with retry/caching
- Data transformation layer
- Error handling and success notifications
- **FormsDashboard refactored**: Removed embedded form submission, all forms now redirect to dedicated pages
- All form submissions now go through backend API (no Supabase direct access)

### ⏳ Pending
- Testing all forms with live backend
- Implementing future features (listed above)
- Image/file upload integration
- Real-time updates via polling/WebSocket

---

## Important Notes for Backend Team

### Forms Dashboard Changes

The `FormsDashboard.tsx` component has been refactored to **remove all embedded form submissions**:

**Before**:
- Dashboard had embedded forms that submitted directly to Supabase
- Forms could be filled out within the dashboard view
- Used `formIntegration` service for Supabase direct access

**After**:
- Dashboard is now a **navigation-only hub**
- All form buttons redirect to dedicated form pages: `/forms/building`, `/forms/room`, `/forms/tenant`, `/forms/operator`, `/forms/lead`
- All submissions now use backend API exclusively
- No more Supabase direct access from any form

**This ensures**:
- ✅ Consistent backend API usage across all forms
- ✅ Better separation of concerns
- ✅ Easier to maintain and test
- ✅ Single source of truth for form submissions (backend API)

---

## Contact & Support

For questions about this integration, please contact:
- Frontend Team: [contact info]
- Backend Team: [contact info]

---

**Document Version**: 1.0
**Last Updated**: 2025-11-17
**Generated by**: Claude Code Assistant
