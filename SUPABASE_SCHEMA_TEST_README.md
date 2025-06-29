# Frontend to Supabase Cloud Schema Test

This test script verifies that your HomeWiz frontend can successfully connect to Supabase cloud database using the exact backend schema as reference.

## 🎯 What This Test Does

The test script (`test-frontend-supabase-schema.js`) performs comprehensive testing using the **backend database models** as reference:

### **Schema Reference Source**
- **Backend Models**: `/Users/kaushatrivedi/Downloads/homewiz-backend-shardul-backend/app/db/models.py`
- **Exact Field Names**: Uses the same field names, data types, and relationships as the backend
- **Foreign Key Validation**: Tests all relationships between tables
- **Data Compatibility**: Ensures frontend can work with backend-compatible data structures

### **Tables Tested**
1. **Operators** - Property managers and staff
2. **Buildings** - Property buildings with full details
3. **Rooms** - Individual rental units with amenities
4. **Tenants** - Current residents with lease information
5. **Leads** - Prospective tenants with preferences

## 🚀 Quick Start

### Step 1: Setup
```bash
# Run the setup script
./setup-supabase-schema-test.sh
```

### Step 2: Verify Supabase Configuration
Ensure your `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### Step 3: Run the Test
```bash
node test-frontend-supabase-schema.js
```

## 📊 Backend Schema Reference

Based on `/Users/kaushatrivedi/Downloads/homewiz-backend-shardul-backend/app/db/models.py`:

### **Operators Table**
```python
# Backend Model Fields
operator_id = Column(Integer, primary_key=True)  # Auto-increment
name = Column(String, nullable=False)            # Required
email = Column(String, unique=True, nullable=False)  # Required, unique
phone = Column(String)                           # Optional
role = Column(String)                            # Optional
active = Column(Boolean, default=True)           # Boolean, default true
date_joined = Column(Date)                       # Date field
operator_type = Column(String, default="LEASING_AGENT")  # Enum-like
notification_preferences = Column(String, default="EMAIL")
emergency_contact = Column(Boolean, default=False)
calendar_sync_enabled = Column(Boolean, default=False)
```

### **Buildings Table**
```python
# Backend Model Fields
building_id = Column(String, primary_key=True)   # String primary key
building_name = Column(String, nullable=False)   # Required
full_address = Column(String)                    # Optional
operator_id = Column(Integer, ForeignKey("operators.operator_id"))  # FK
available = Column(Boolean, default=True)
street = Column(String)
city = Column(String)
state = Column(String)
zip = Column(String)
floors = Column(Integer)
total_rooms = Column(Integer)
wifi_included = Column(Boolean, default=False)
pet_friendly = Column(String)  # String, not boolean
year_built = Column(Integer)
```

### **Rooms Table**
```python
# Backend Model Fields
room_id = Column(String, primary_key=True)       # String primary key
room_number = Column(String, nullable=False)     # Required
building_id = Column(String, ForeignKey("buildings.building_id"))  # FK
status = Column(String, default="AVAILABLE")
private_room_rent = Column(Float)                # Decimal/Float
shared_room_rent_2 = Column(Float)
maximum_people_in_room = Column(Integer)
floor_number = Column(Integer)
bed_count = Column(Integer)
bathroom_type = Column(String)
furnished = Column(Boolean, default=False)
noise_level = Column(String)  # 'QUIET', 'MODERATE', 'LIVELY'
sunlight = Column(String)     # 'BRIGHT', 'MODERATE', 'LOW'
```

### **Tenants Table**
```python
# Backend Model Fields
tenant_id = Column(String, primary_key=True)     # String primary key
tenant_name = Column(String, nullable=False)     # Required
room_id = Column(String, ForeignKey("rooms.room_id"))  # FK
operator_id = Column(Integer, ForeignKey("operators.operator_id"))  # FK
building_id = Column(String, ForeignKey("buildings.building_id"))  # FK
lease_start_date = Column(Date)                  # Date field
lease_end_date = Column(Date)                    # Date field
tenant_email = Column(String, unique=True)       # Unique
booking_type = Column(String)                    # Required
deposit_amount = Column(Float)                   # Decimal/Float
payment_status = Column(String)
has_pets = Column(Boolean, default=False)
has_vehicles = Column(Boolean, default=False)
```

### **Leads Table**
```python
# Backend Model Fields
lead_id = Column(String, primary_key=True)       # String primary key
email = Column(String, unique=True, nullable=False)  # Required, unique
status = Column(String, nullable=False)          # Required
interaction_count = Column(Integer, default=0)
planned_move_in = Column(Date)                   # Date field
visa_status = Column(String)
lead_score = Column(Integer, default=0)
budget_min = Column(Float)
budget_max = Column(Float)
preferred_lease_term = Column(Integer)           # in months
```

## 📋 Expected Output

### **Successful Test Run**
```
🔍 Testing Frontend to Supabase Cloud Connection...
📊 Using Backend Schema as Reference

🔄 Testing Supabase connection...
✅ Supabase connection successful!

🔍 Testing Schema Compatibility...
   ✅ operators table accessible
   ✅ buildings table accessible
   ✅ rooms table accessible
   ✅ tenants table accessible
   ✅ leads table accessible

📋 Testing Operators CRUD (Backend Schema)...
   ✅ Operator created with ID: 123
   ✅ Operator read: Frontend Test Operator (LEASING_AGENT)
   ✅ Operator updated: Updated Test Operator

🏢 Testing Buildings CRUD (Backend Schema)...
   ✅ Building created with ID: test-building-1234567890
   ✅ Building read: Frontend Test Building (3 floors)

... (similar for Rooms, Tenants, Leads)

🧹 Cleaning up test data...
   ✅ All test data cleaned up

🎉 All tests passed! Frontend to Supabase Cloud connection is working perfectly!

✅ Summary:
   • Supabase cloud connection established
   • All tables are accessible and compatible with backend schema
   • CRUD operations work for all entities
   • Data relationships and foreign keys are working
   • Backend schema compatibility confirmed
```

## 🐛 Troubleshooting

### **Schema Mismatch Errors**
```
❌ Could not find the 'name' column of 'operators' in the schema cache
```
**Solution**: Your Supabase table structure doesn't match the backend schema. Update your Supabase tables to match the backend models.

### **Foreign Key Constraint Errors**
```
❌ insert or update on table "buildings" violates foreign key constraint
```
**Solution**: Ensure foreign key relationships are properly configured in Supabase.

### **RLS Policy Errors**
```
❌ new row violates row-level security policy
```
**Solution**: Update your Supabase RLS policies to allow CRUD operations, or disable RLS for testing.

### **Connection Errors**
```
❌ Supabase connection failed: Invalid API key
```
**Solution**: Verify your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.

## 🔧 Supabase Setup Requirements

### **1. Create Tables**
Your Supabase database needs tables that match the backend schema. You can:

**Option A: Use Backend Migration**
```bash
cd /Users/kaushatrivedi/Downloads/homewiz-backend-shardul-backend
python app/db/scripts/create_tables.py
```

**Option B: Manual SQL in Supabase**
```sql
-- Example for operators table
CREATE TABLE operators (
  operator_id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  phone VARCHAR,
  role VARCHAR,
  active BOOLEAN DEFAULT true,
  date_joined DATE,
  operator_type VARCHAR DEFAULT 'LEASING_AGENT',
  notification_preferences VARCHAR DEFAULT 'EMAIL',
  emergency_contact BOOLEAN DEFAULT false,
  calendar_sync_enabled BOOLEAN DEFAULT false
);
```

### **2. Configure RLS Policies**
```sql
-- Allow all operations for testing (adjust for production)
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations" ON operators FOR ALL USING (true);

-- Repeat for all tables: buildings, rooms, tenants, leads
```

### **3. Set Up Foreign Keys**
```sql
-- Example foreign key constraints
ALTER TABLE buildings 
ADD CONSTRAINT fk_buildings_operator 
FOREIGN KEY (operator_id) REFERENCES operators(operator_id);

ALTER TABLE rooms 
ADD CONSTRAINT fk_rooms_building 
FOREIGN KEY (building_id) REFERENCES buildings(building_id);
```

## 📝 Next Steps After Successful Test

1. **Update Frontend Configuration**:
   ```env
   NEXT_PUBLIC_DISABLE_BACKEND=true
   NEXT_PUBLIC_PREFER_CLOUD=true
   ```

2. **Test Frontend Forms**: Verify that your frontend forms work with the confirmed schema

3. **Data Migration**: If needed, migrate existing data to match the backend schema

4. **Production Setup**: Configure proper RLS policies for production security

## 🎯 Benefits of This Approach

- **Schema Consistency**: Ensures frontend and backend use identical data structures
- **Future Compatibility**: Frontend will work seamlessly when backend is integrated
- **Data Integrity**: Validates all relationships and constraints work correctly
- **Development Efficiency**: Reduces schema-related bugs and integration issues
