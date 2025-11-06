# Supabase to Backend API Migration Guide

## Overview

This guide helps you migrate from direct Supabase database access to backend API calls. All necessary replacement services have been created in `/src/lib/api/`.

## Architecture Change

**Before (Supabase):**
```
Frontend → Supabase Client → PostgreSQL Database
```

**After (Backend API):**
```
Frontend → Backend API → Supabase → PostgreSQL Database
```

---

## Migration Steps

### Step 1: Import Replacements

Replace Supabase imports with new API services:

**Before:**
```typescript
import { databaseService } from '@/lib/supabase/database'
import { uploadBuildingImages } from '@/lib/supabase/storage'
import { realtimeManager } from '@/lib/supabase/realtime'
import { useSupabaseData } from '@/hooks/useSupabaseData'
```

**After:**
```typescript
import { buildingsApi, roomsApi, tenantsApi, operatorsApi, leadsApi } from '@/lib/api'
import { storageApi } from '@/lib/api'
import { realtimePolling } from '@/lib/api/realtime-polling'
import { useBackendData, useBuildings, useRooms } from '@/hooks/useBackendData'
```

---

## API Service Migration

### Buildings Operations

**Before (Supabase):**
```typescript
// Get all buildings
const result = await databaseService.buildings.getAll()

// Get by ID
const building = await databaseService.buildings.getById('BLD_123')

// Create
const newBuilding = await databaseService.buildings.create(data)

// Update
const updated = await databaseService.buildings.update('BLD_123', data)

// Delete
await databaseService.buildings.delete('BLD_123')
```

**After (Backend API):**
```typescript
import { buildingsApi } from '@/lib/api'

// Get all buildings
const response = await buildingsApi.getAll()
if (response.success) {
  const buildings = response.data
}

// Get by ID
const response = await buildingsApi.getById('BLD_123')

// Create
const response = await buildingsApi.create(data)

// Update
const response = await buildingsApi.update('BLD_123', data)

// Delete
const response = await buildingsApi.delete('BLD_123')
```

### Rooms Operations

**Before:**
```typescript
const rooms = await databaseService.rooms.getAll()
const roomsByBuilding = await databaseService.rooms.getByBuilding('BLD_123')
const availableRooms = await databaseService.rooms.getAvailableByBuilding('BLD_123')
```

**After:**
```typescript
import { roomsApi } from '@/lib/api'

const response = await roomsApi.getAll()
const response = await roomsApi.getByBuilding('BLD_123')
const response = await roomsApi.getAvailableByBuilding('BLD_123')
```

### Tenants Operations

**Before:**
```typescript
const tenants = await databaseService.tenants.getAll()
const tenant = await databaseService.tenants.getById('TEN_123')
await databaseService.tenants.update('TEN_123', data)
```

**After:**
```typescript
import { tenantsApi } from '@/lib/api'

const response = await tenantsApi.getAll()
const response = await tenantsApi.getById('TEN_123')
const response = await tenantsApi.update('TEN_123', data)
```

### Operators Operations

**Before:**
```typescript
const operators = await databaseService.operators.getAll()
const active = await databaseService.operators.getActive()
```

**After:**
```typescript
import { operatorsApi } from '@/lib/api'

const response = await operatorsApi.getAll()
const response = await operatorsApi.getActive()
```

### Leads Operations

**Before:**
```typescript
const leads = await databaseService.leads.getAll()
await databaseService.leads.convertToTenant('LEAD_123')
```

**After:**
```typescript
import { leadsApi } from '@/lib/api'

const response = await leadsApi.getAll()
const response = await leadsApi.convertToTenant('LEAD_123')
```

---

## File Upload Migration

### Building Images

**Before:**
```typescript
import { uploadBuildingImages } from '@/lib/supabase/storage'

await uploadBuildingImages('BLD_123', files)
```

**After:**
```typescript
import { storageApi } from '@/lib/api'

const response = await storageApi.uploadBuildingImages('BLD_123', files, 'outside')
```

### Room Images

**Before:**
```typescript
import { uploadRoomImages } from '@/lib/supabase/storage'

await uploadRoomImages('BLD_123', 'ROOM_456', files)
```

**After:**
```typescript
const response = await storageApi.uploadRoomImages('ROOM_456', files)
```

### Delete Images

**Before:**
```typescript
import { deleteFile } from '@/lib/supabase/storage'

await deleteFile('building-images', filePath)
```

**After:**
```typescript
const response = await storageApi.deleteBuildingImage('BLD_123', 'image_id')
```

---

## Real-Time Updates Migration

### Subscribing to Changes

**Before (Supabase Real-Time):**
```typescript
import { realtimeManager } from '@/lib/supabase/realtime'

const subscriptionId = realtimeManager.subscribe({
  table: 'buildings',
  event: '*',
}, (payload) => {
  console.log('Change detected:', payload)
})

// Cleanup
realtimeManager.unsubscribe(subscriptionId)
```

**After (Polling):**
```typescript
import { realtimePolling } from '@/lib/api/realtime-polling'

const subscriptionId = realtimePolling.subscribe({
  tableName: 'buildings',
  interval: 5000, // Poll every 5 seconds
  onData: (data) => {
    console.log('Updated data:', data)
  },
  onChange: (change) => {
    console.log('Change detected:', change.type, change.new)
  }
})

// Cleanup
realtimePolling.unsubscribe(subscriptionId)
```

### Convenience Helpers

**After:**
```typescript
import { pollingHelpers } from '@/lib/api/realtime-polling'

// Simple subscription
const id = pollingHelpers.subscribeToBuildings((data) => {
  setBuildings(data)
}, 5000)
```

---

## React Hook Migration

### useSupabaseData → useBackendData

**Before:**
```typescript
import { useSupabaseData } from '@/hooks/useSupabaseData'

const { data, loading, error, refetch, create, update, remove } = useSupabaseData('buildings', {
  enableRealtime: true,
  enableCaching: true
})
```

**After:**
```typescript
import { useBackendData } from '@/hooks/useBackendData'

const { data, loading, error, refetch, create, update, remove } = useBackendData('buildings', {
  enableRealtime: true,      // Uses polling
  realtimeInterval: 5000,    // Poll every 5 seconds
  enableCaching: true,
  refetchOnWindowFocus: true
})
```

### Pre-configured Hooks

**After:**
```typescript
import { useBuildings, useRooms, useTenants } from '@/hooks/useBackendData'

// Same interface as useSupabaseData
const { data: buildings, loading, create } = useBuildings({ enableRealtime: true })
const { data: rooms } = useRooms()
const { data: tenants } = useTenants()
```

---

## Form Integration Migration

### Building Form

**File:** `/src/lib/supabase/form-integration.ts` → Replace with API calls

**Before:**
```typescript
import { BuildingFormIntegration } from '@/lib/supabase/form-integration'

const result = await BuildingFormIntegration.submitBuilding(formData)
```

**After:**
```typescript
import { buildingsApi } from '@/lib/api'

const response = await buildingsApi.create({
  building_name: formData.building_name,
  address: formData.address,
  city: formData.city,
  state: formData.state,
  zip: formData.zip,
  // ... other fields
})

if (response.success) {
  console.log('Building created:', response.data)
}
```

### Room Form

**Before:**
```typescript
import { RoomFormIntegration } from '@/lib/supabase/form-integration'

await RoomFormIntegration.submitRoom(formData)
```

**After:**
```typescript
import { roomsApi } from '@/lib/api'

const response = await roomsApi.create({
  building_id: formData.building_id,
  room_number: formData.room_number,
  room_type: formData.room_type,
  private_room_rent: formData.private_room_rent,
  // ... other fields
})
```

### Tenant Form

**Before:**
```typescript
import { TenantFormIntegration } from '@/lib/supabase/form-integration'

await TenantFormIntegration.submitTenant(formData)
```

**After:**
```typescript
import { tenantsApi } from '@/lib/api'

const response = await tenantsApi.create({
  tenant_name: formData.tenant_name,
  tenant_email: formData.tenant_email,
  phone: formData.phone,
  room_id: formData.room_id,
  // ... other fields
})
```

---

## Component Updates

### Example: EditRoomModal.tsx

**Before:**
```typescript
import { databaseService } from '@/lib/supabase/database'

const handleSubmit = async (data: any) => {
  const result = await databaseService.rooms.update(roomId, data)
  if (result.success) {
    toast.success('Room updated')
  }
}
```

**After:**
```typescript
import { roomsApi } from '@/lib/api'

const handleSubmit = async (data: any) => {
  const response = await roomsApi.update(roomId, data)
  if (response.success) {
    toast.success('Room updated')
  }
}
```

### Example: Data Management Page

**Before:**
```typescript
import { useSupabaseData } from '@/hooks/useSupabaseData'

const { data: buildings, loading, create, update, remove } = useSupabaseData('buildings')
```

**After:**
```typescript
import { useBuildings } from '@/hooks/useBackendData'

const { data: buildings, loading, create, update, remove } = useBuildings({
  enableRealtime: true,
  realtimeInterval: 10000 // 10 seconds
})
```

---

## Error Handling

### Response Format

All API responses follow this structure:

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
  statusCode?: number
}
```

### Handling Errors

```typescript
const response = await buildingsApi.create(data)

if (response.success) {
  // Success
  console.log('Created:', response.data)
} else {
  // Error
  console.error('Error:', response.error)
  toast.error(response.error || 'Operation failed')
}
```

---

## Advanced Features

### Query Options

All `getAll()` methods support filtering:

```typescript
const response = await buildingsApi.getAll({
  page: 1,
  limit: 10,
  sortBy: 'building_name',
  sortOrder: 'asc',
  search: 'downtown',
  filters: {
    city: 'San Francisco',
    building_type: 'apartment'
  }
})
```

### Caching

Backend API client includes automatic caching:

```typescript
// First call - fetches from server
const response1 = await buildingsApi.getAll() // ~200ms

// Second call within 5 minutes - returns from cache
const response2 = await buildingsApi.getAll() // ~1ms
```

Clear cache when data is mutated:

```typescript
import { apiClient } from '@/lib/api-client'

await buildingsApi.create(data)
apiClient.clearCache() // Force fresh data on next fetch
```

### Upload with Progress

```typescript
import { storageApi } from '@/lib/api'

await storageApi.uploadWithProgress(
  '/buildings/BLD_123/images/upload',
  file,
  (progress) => {
    console.log(`Upload: ${progress}%`)
    setUploadProgress(progress)
  }
)
```

---

## File Checklist

### Files to Update

- [ ] `/src/components/forms/BuildingForm.tsx`
- [ ] `/src/components/forms/RoomForm.tsx`
- [ ] `/src/components/forms/TenantForm.tsx`
- [ ] `/src/components/forms/OperatorForm.tsx`
- [ ] `/src/components/forms/LeadForm.tsx`
- [ ] `/src/components/admin/EditBuildingModal.tsx`
- [ ] `/src/components/admin/EditRoomModal.tsx`
- [ ] `/src/components/admin/EditTenantModal.tsx`
- [ ] `/src/components/admin/EditOperatorModal.tsx`
- [ ] `/src/app/admin/data-management/page.tsx`
- [ ] `/src/components/chat/BackendIntegratedChatInterface.tsx` (if using direct Supabase)
- [ ] `/src/components/forms/MediaUploadSection.tsx`

### Files to Remove (After Migration Complete)

- [ ] `/src/lib/supabase/client.ts`
- [ ] `/src/lib/supabase/database.ts`
- [ ] `/src/lib/supabase/storage.ts`
- [ ] `/src/lib/supabase/realtime.ts`
- [ ] `/src/lib/supabase/form-integration.ts`
- [ ] `/src/hooks/useSupabaseData.ts`

### New Files Created

- [x] `/src/lib/api/index.ts`
- [x] `/src/lib/api/types.ts`
- [x] `/src/lib/api/buildings-api.ts`
- [x] `/src/lib/api/rooms-api.ts`
- [x] `/src/lib/api/tenants-api.ts`
- [x] `/src/lib/api/operators-api.ts`
- [x] `/src/lib/api/leads-api.ts`
- [x] `/src/lib/api/storage-api.ts`
- [x] `/src/lib/api/realtime-polling.ts`
- [x] `/src/hooks/useBackendData.ts`

---

## Testing Strategy

### 1. Test Individual API Calls

```typescript
// Test in browser console or create test file
import { buildingsApi } from '@/lib/api'

const test = async () => {
  const response = await buildingsApi.getAll()
  console.log('Buildings:', response)
}

test()
```

### 2. Test One Component at a Time

Start with a simple component (e.g., view-only modal) before tackling complex forms.

### 3. Test CRUD Operations

```typescript
// Create
const created = await buildingsApi.create(testData)

// Read
const fetched = await buildingsApi.getById(created.data.building_id)

// Update
const updated = await buildingsApi.update(created.data.building_id, { building_name: 'New Name' })

// Delete
const deleted = await buildingsApi.delete(created.data.building_id)
```

### 4. Test Real-Time Polling

```typescript
const subscriptionId = realtimePolling.subscribe({
  tableName: 'buildings',
  interval: 5000,
  onChange: (change) => {
    console.log('Change detected:', change)
  }
})

// Make a change in another tab/window and verify polling detects it
```

---

## Troubleshooting

### Issue: CORS Errors

**Solution:** Ensure backend allows your frontend origin:
```python
# Backend CORS config should include:
allow_origins=["http://localhost:3000", "https://homewizfrontend.vercel.app"]
```

### Issue: 404 Not Found

**Solution:** Check `NEXT_PUBLIC_API_URL` environment variable:
```env
NEXT_PUBLIC_API_URL=http://localhost:8002
```

### Issue: Real-Time Not Working

**Solution:** Verify polling is enabled and interval is appropriate:
```typescript
const { data } = useBuildings({
  enableRealtime: true,
  realtimeInterval: 5000 // Adjust based on needs
})
```

### Issue: Slow Performance

**Solution:** Enable caching and increase polling interval:
```typescript
const { data } = useBuildings({
  enableCaching: true,
  realtimeInterval: 30000 // 30 seconds
})
```

---

## Performance Comparison

| Feature | Supabase Direct | Backend API |
|---------|----------------|-------------|
| **Database Access** | Direct | Via HTTP |
| **Real-Time** | WebSocket (instant) | Polling (5-10s delay) |
| **Security** | Row Level Security | Backend validation |
| **Latency** | ~50-100ms | ~100-200ms |
| **Caching** | Client-side | Client + Server |
| **Offline Support** | Yes (with sync) | Limited (polling stops) |

---

## Migration Timeline

**Recommended Approach:**

1. **Week 1:** Test API services in isolation
2. **Week 2:** Migrate simple view-only components
3. **Week 3:** Migrate form submissions (CRUD)
4. **Week 4:** Migrate real-time features and file uploads
5. **Week 5:** Remove old Supabase code and test thoroughly

---

## Support

For issues during migration:
1. Check backend API logs for errors
2. Verify environment variables
3. Test API endpoints with curl/Postman
4. Review this migration guide

---

## Conclusion

This migration moves your architecture from client-side database access to a proper backend API layer, improving:
- **Security**: No direct database exposure
- **Control**: Centralized business logic
- **Scalability**: Better rate limiting and caching
- **Maintainability**: Single source of truth for data operations

While you lose instant WebSocket updates, polling provides a good alternative for most use cases.
