# Frontend to Backend Connection Test

This test script verifies that your HomeWiz frontend can successfully connect to and interact with the backend API.

## 🎯 What This Test Does

The test script (`test-frontend-backend-connection.js`) performs comprehensive testing of:

1. **Backend Server Availability** - Checks if the FastAPI server is running
2. **API Endpoints** - Tests all major CRUD operations for:
   - **Operators** (Property managers/staff)
   - **Buildings** (Property buildings)
   - **Rooms** (Individual rental units)
   - **Tenants** (Current residents)
   - **Leads** (Prospective tenants)
3. **Data Relationships** - Verifies foreign key relationships work correctly
4. **Error Handling** - Tests API error responses
5. **Cleanup** - Removes all test data after completion

## 🚀 Quick Start

### Step 1: Setup Frontend
```bash
# Run the setup script (installs dependencies and configures environment)
./setup-backend-test.sh
```

### Step 2: Start Backend Server
```bash
# Navigate to backend directory
cd /Users/kaushatrivedi/Downloads/homewiz-backend-shardul-backend

# Create virtual environment (if not already done)
python -m venv venv
source venv/bin/activate  # On macOS/Linux
# or: venv\Scripts\activate  # On Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file with:
echo "DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres" > .env
echo "DATABASE_PASSWORD=postgres" >> .env
echo "GEMINI_API_KEY=your_gemini_api_key_here" >> .env

# Start the server
uvicorn app.main:app --reload --port 8000
```

### Step 3: Run the Test
```bash
# In the frontend directory, run:
node test-frontend-backend-connection.js
```

## 📊 Expected Output

When successful, you should see:
```
🔍 Testing Frontend to Backend Connection...
📡 Backend URL: http://127.0.0.1:8000/api

🔄 Testing backend server availability...
✅ Backend server is running!

📋 Testing Operators CRUD...
   ✅ Operator created with ID: 123
   ✅ Operator read: Frontend Test Operator
   ✅ Operator updated: Updated Test Operator
   ✅ Found 1 operators

🏢 Testing Buildings CRUD...
   ✅ Building created with ID: test-building-1234567890
   ✅ Building read: Frontend Test Building
   ✅ Found 1 buildings

... (similar for Rooms, Tenants, Leads)

🧹 Cleaning up test data...
   ✅ All test data cleaned up

🎉 All tests passed! Frontend to Backend connection is working perfectly!
```

## 🔧 Backend Schema Reference

Based on the backend models in `/Users/kaushatrivedi/Downloads/homewiz-backend-shardul-backend/app/db/models.py`:

### Operators Table
- `operator_id` (int, primary key)
- `name` (string, required)
- `email` (string, required, unique)
- `phone` (string, optional)
- `role` (string, optional)
- `active` (boolean, default: true)
- `date_joined` (date, optional)
- `operator_type` (string, default: "LEASING_AGENT")

### Buildings Table
- `building_id` (string, primary key)
- `building_name` (string, required)
- `full_address` (string, optional)
- `operator_id` (int, foreign key to operators)
- `available` (boolean, default: true)
- `floors` (int, optional)
- `total_rooms` (int, optional)

### Rooms Table
- `room_id` (string, primary key)
- `room_number` (string, required)
- `building_id` (string, foreign key to buildings)
- `status` (string, default: "AVAILABLE")
- `private_room_rent` (float, optional)
- `maximum_people_in_room` (int, optional)

### Tenants Table
- `tenant_id` (string, primary key)
- `tenant_name` (string, required)
- `room_id` (string, foreign key to rooms)
- `operator_id` (int, foreign key to operators)
- `building_id` (string, foreign key to buildings)
- `lease_start_date` (date, required)
- `lease_end_date` (date, required)
- `tenant_email` (string, required, unique)
- `booking_type` (string, required)
- `deposit_amount` (float, required)

### Leads Table
- `lead_id` (string, primary key)
- `email` (string, required, unique)
- `status` (string, required)
- `interaction_count` (int, default: 0)
- `planned_move_in` (date, optional)

## 🐛 Troubleshooting

### Backend Server Not Running
```
❌ Backend server is not running!
```
**Solution**: Start the backend server with `uvicorn app.main:app --reload --port 8000`

### Database Connection Issues
```
❌ Database connection failed
```
**Solution**: 
1. Ensure Supabase is running locally on port 54322
2. Check DATABASE_URL in backend .env file
3. Verify database credentials

### CORS Errors
```
❌ CORS error - Backend needs to allow requests from frontend origin
```
**Solution**: The backend is configured to allow localhost:3000, but check CORS settings in `app/main.py`

### Missing Dependencies
```
❌ axios is not installed
```
**Solution**: Run `npm install axios` in the frontend directory

## 📝 Configuration Files

### Frontend (.env.local)
```env
# For backend testing
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
NEXT_PUBLIC_DISABLE_BACKEND=false
```

### Backend (.env)
```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
DATABASE_PASSWORD=postgres
GEMINI_API_KEY=your_gemini_api_key_here
```

## 🎯 Next Steps After Successful Test

1. **Update Frontend Configuration**: Set `NEXT_PUBLIC_DISABLE_BACKEND=false` in `.env.local`
2. **Test Frontend Forms**: Try creating operators, buildings, rooms, etc. through the UI
3. **Verify Data Persistence**: Check that data created in the frontend appears in the backend database
4. **Test Real-time Features**: If enabled, verify that changes sync between frontend and backend

## 📞 Support

If you encounter issues:
1. Check the console output for specific error messages
2. Verify all prerequisites are met (backend running, database accessible)
3. Ensure all environment variables are correctly set
4. Check network connectivity between frontend and backend
