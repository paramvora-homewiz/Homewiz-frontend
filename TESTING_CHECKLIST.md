# HomeWiz System Testing Checklist

## Pre-Test Setup

### 1. Start Backend
```bash
./run-backend.sh
```
✓ Check: Backend running on http://localhost:8002
✓ Check: No errors in terminal
✓ Check: API docs accessible at http://localhost:8002/docs

### 2. Start Frontend
```bash
npm run dev
```
✓ Check: Frontend running on http://localhost:3000
✓ Check: No build errors

## Functionality Tests

### 1. Backend Connection Test
**Location**: Chat interface (http://localhost:3000/chat)

✓ **Check**: Status shows "Backend: Connected ✅"
✓ **If Failed**: 
  - Backend not running on port 8002
  - Check .env.local points to localhost:8002
  - Restart frontend after env changes

### 2. Basic Query Tests

#### Test 2.1: Property Queries
**Query**: "Show me all buildings"
- ✓ Expected: List of buildings with details
- ✓ Should show: Building names, addresses, amenities
- ✓ UI: Interactive cards with action buttons

**Query**: "Find available rooms"
- ✓ Expected: List of vacant rooms
- ✓ Should show: Room numbers, prices, features
- ✓ UI: Room cards with "Schedule Tour" button

#### Test 2.2: Tenant Queries
**Query**: "Show me current tenants"
- ✓ Expected: List of tenants
- ✓ Should show: Names, room assignments, contact info
- ✓ Note: May need proper data in database

#### Test 2.3: Analytics Queries
**Query**: "Show me occupancy analytics"
- ✓ Expected: Analytics report
- ✓ Should show: Occupancy rates, revenue metrics
- ✓ UI: Charts or data visualizations

### 3. Error Handling Tests

#### Test 3.1: Invalid Query
**Query**: "ajsdkfjalskdfj"
- ✓ Expected: Graceful error message
- ✓ Should not: Crash or show technical errors

#### Test 3.2: Backend Disconnection
**Action**: Stop backend while frontend is running
- ✓ Expected: Status changes to "Backend: Unavailable"
- ✓ Should: Fall back to direct Supabase queries
- ✓ Should: Show connection retry attempts

### 4. Data Display Tests

#### Test 4.1: Empty Results
**Query**: "Show rooms in building XYZ" (non-existent building)
- ✓ Expected: "No results found" display
- ✓ Should show: Helpful suggestions

#### Test 4.2: Large Dataset
**Query**: "Show all data for all buildings"
- ✓ Expected: Proper pagination or scrolling
- ✓ Should not: Freeze or crash browser

### 5. Form Integration Tests

#### Test 5.1: Navigation to Forms
**Check each route**:
- ✓ /forms/building
- ✓ /forms/room
- ✓ /forms/tenant
- ✓ /forms/lead
- ✓ /forms/operator

**Expected**: Forms load without errors
**Note**: Submit may not work if endpoints are disabled

### 6. Performance Tests

#### Test 6.1: Response Time
**Measure**: Time from query submission to response
- ✓ Should be: < 3 seconds for simple queries
- ✓ Should be: < 5 seconds for complex analytics

#### Test 6.2: Multiple Queries
**Action**: Submit several queries rapidly
- ✓ Expected: All queries processed
- ✓ Should not: Mix up responses

## Backend API Tests (using http://localhost:8002/docs)

### 1. Query Endpoint Test
**Endpoint**: POST /query/
**Payload**:
```json
{
  "query": "test connection"
}
```
✓ Expected: 200 OK with response

### 2. Universal Query Test
**Endpoint**: POST /universal-query/
**Payload**:
```json
{
  "query": "show all rooms"
}
```
✓ Expected: Structured response with room data

## Known Issues to Verify

### 1. CORS Configuration
- ✓ Local backend should allow localhost:3000
- ✓ No CORS errors in browser console

### 2. WebSocket Connection
- ⚠️ Currently not implemented
- ✓ Should not cause errors
- ✓ Chat should work without WebSocket

### 3. Authentication
- ⚠️ Currently not enforced
- ✓ All queries should work without login
- ✓ Using Supabase anonymous access

### 4. Data Type Issues
- ⚠️ Some numeric fields stored as TEXT
- ✓ Prices should display correctly
- ✓ Sorting might be alphabetical, not numeric

## Debug Commands

### Check Backend Logs
Look for in backend terminal:
- SQL queries being generated
- Function calls being made
- Any error messages

### Check Frontend Console
Open browser DevTools:
- Network tab: Check API calls
- Console: Look for errors
- Response format validation

### Check Supabase
If queries return no data:
- Verify tables exist
- Check if data is seeded
- Confirm connection string

## Success Criteria

✅ **System is working if**:
1. Backend connects successfully
2. Natural language queries return relevant data
3. Results display in appropriate UI components
4. Errors are handled gracefully
5. Can navigate between pages without crashes

⚠️ **Partially working if**:
1. Only query endpoints work (no CRUD)
2. WebSocket features missing
3. Some forms don't submit

❌ **Not working if**:
1. Backend won't start
2. Frontend can't connect to backend
3. All queries fail
4. UI crashes or freezes

## Next Steps After Testing

If everything works:
1. Test with more complex queries
2. Try the analytics features
3. Explore the admin panel

If issues found:
1. Check error logs
2. Verify environment variables
3. Ensure all dependencies installed
4. Check database connection