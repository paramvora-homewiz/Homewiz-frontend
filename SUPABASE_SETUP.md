# Supabase Integration Setup Guide

This guide will help you set up Supabase integration for the HomeWiz frontend application.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. Node.js 18+ installed
3. The HomeWiz frontend application

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `homewiz-backend`
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to your users
5. Click "Create new project"
6. Wait for the project to be created (this may take a few minutes)

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (looks like `https://your-project.supabase.co`)
   - **Project API Keys** > **anon public** (this is your public key)
   - **Project API Keys** > **service_role** (this is your private key - keep it secret!)

## Step 3: Set Up Environment Variables

1. In your HomeWiz frontend directory, copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

## Step 4: Create Database Tables

Run the following SQL commands in your Supabase SQL Editor (Dashboard > SQL Editor):

### 1. Buildings Table
```sql
CREATE TABLE buildings (
  building_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  building_name VARCHAR(100) NOT NULL,
  address VARCHAR(200) NOT NULL,
  city VARCHAR(50) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  country VARCHAR(50) DEFAULT 'United States',
  total_units INTEGER NOT NULL DEFAULT 0,
  available_units INTEGER DEFAULT 0,
  building_type VARCHAR(20) NOT NULL,
  year_built INTEGER,
  amenities JSONB,
  contact_info JSONB,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  area VARCHAR(100),
  description TEXT,
  images JSONB,
  parking_available BOOLEAN DEFAULT false,
  pet_friendly BOOLEAN DEFAULT false,
  furnished_options BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Operators Table
```sql
CREATE TABLE operators (
  operator_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  operator_type VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  department VARCHAR(50),
  hire_date DATE,
  permissions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Rooms Table
```sql
CREATE TABLE rooms (
  room_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id UUID REFERENCES buildings(building_id) ON DELETE CASCADE,
  room_number VARCHAR(10) NOT NULL,
  room_type VARCHAR(20) NOT NULL,
  square_footage INTEGER,
  private_room_rent DECIMAL(10,2),
  shared_room_rent_2 DECIMAL(10,2),
  shared_room_rent_3 DECIMAL(10,2),
  shared_room_rent_4 DECIMAL(10,2),
  availability_status VARCHAR(20) DEFAULT 'AVAILABLE',
  lease_start_date DATE,
  lease_end_date DATE,
  amenities JSONB,
  floor_number INTEGER,
  bathroom_type VARCHAR(20),
  furnished BOOLEAN DEFAULT false,
  utilities_included JSONB,
  images JSONB,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Tenants Table
```sql
CREATE TABLE tenants (
  tenant_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  tenant_nationality VARCHAR(50),
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  emergency_contact_relationship VARCHAR(50),
  building_id UUID REFERENCES buildings(building_id),
  room_id UUID REFERENCES rooms(room_id),
  lease_start_date DATE,
  lease_end_date DATE,
  rent_amount DECIMAL(10,2),
  deposit_amount DECIMAL(10,2),
  payment_status VARCHAR(20),
  rent_payment_method VARCHAR(20),
  account_status VARCHAR(20) DEFAULT 'ACTIVE',
  operator_id INTEGER REFERENCES operators(operator_id),
  booking_type VARCHAR(20),
  special_requests TEXT,
  communication_preferences VARCHAR(20) DEFAULT 'EMAIL',
  payment_reminders_enabled BOOLEAN DEFAULT true,
  has_pets BOOLEAN DEFAULT false,
  has_vehicles BOOLEAN DEFAULT false,
  has_renters_insurance BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. Leads Table
```sql
CREATE TABLE leads (
  lead_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'NEW',
  source VARCHAR(50),
  notes TEXT,
  assigned_operator_id INTEGER REFERENCES operators(operator_id),
  interested_buildings JSONB,
  budget_range JSONB,
  move_in_date DATE,
  preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. Create Indexes for Performance
```sql
-- Buildings indexes
CREATE INDEX idx_buildings_status ON buildings(status);
CREATE INDEX idx_buildings_city ON buildings(city);
CREATE INDEX idx_buildings_building_type ON buildings(building_type);

-- Rooms indexes
CREATE INDEX idx_rooms_building_id ON rooms(building_id);
CREATE INDEX idx_rooms_availability_status ON rooms(availability_status);

-- Tenants indexes
CREATE INDEX idx_tenants_email ON tenants(email);
CREATE INDEX idx_tenants_building_id ON tenants(building_id);
CREATE INDEX idx_tenants_room_id ON tenants(room_id);
CREATE INDEX idx_tenants_status ON tenants(status);

-- Operators indexes
CREATE INDEX idx_operators_email ON operators(email);
CREATE INDEX idx_operators_type ON operators(operator_type);
CREATE INDEX idx_operators_status ON operators(status);

-- Leads indexes
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned_operator ON leads(assigned_operator_id);
```

## Step 5: Set Up Row Level Security (RLS)

Enable RLS for all tables and create policies:

```sql
-- Enable RLS
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policies (for now, allow all operations - customize based on your auth needs)
CREATE POLICY "Allow all operations on buildings" ON buildings FOR ALL USING (true);
CREATE POLICY "Allow all operations on rooms" ON rooms FOR ALL USING (true);
CREATE POLICY "Allow all operations on tenants" ON tenants FOR ALL USING (true);
CREATE POLICY "Allow all operations on operators" ON operators FOR ALL USING (true);
CREATE POLICY "Allow all operations on leads" ON leads FOR ALL USING (true);
```

## Step 6: Insert Sample Data (Optional)

```sql
-- Insert sample operators
INSERT INTO operators (name, email, operator_type) VALUES
('John Smith', 'john@homewiz.com', 'ADMIN'),
('Sarah Johnson', 'sarah@homewiz.com', 'LEASING_AGENT'),
('Mike Wilson', 'mike@homewiz.com', 'BUILDING_MANAGER');

-- Insert sample buildings
INSERT INTO buildings (building_name, address, city, state, zip_code, total_units, building_type) VALUES
('Sunset Apartments', '123 Main St', 'San Francisco', 'CA', '94102', 50, 'APARTMENT'),
('Downtown Condos', '456 Market St', 'San Francisco', 'CA', '94103', 30, 'CONDO');
```

## Step 7: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the forms page: `http://localhost:3000/forms`

3. Try creating a new tenant - the data should now be saved to Supabase!

## Step 8: Enable Real-time (Optional)

Real-time subscriptions are enabled by default. To verify they're working:

1. Open the tenant form in two browser windows
2. Create a tenant in one window
3. The other window should automatically update with the new data

## Troubleshooting

### Common Issues:

1. **"Missing environment variables" error**
   - Make sure your `.env.local` file has the correct Supabase credentials
   - Restart your development server after adding environment variables

2. **"Failed to fetch" errors**
   - Check that your Supabase project is running
   - Verify your project URL and API keys are correct
   - Check the browser console for detailed error messages

3. **Database connection errors**
   - Ensure all tables are created correctly
   - Check that RLS policies are set up properly
   - Verify your service role key has the necessary permissions

4. **Real-time not working**
   - Check that your Supabase project has real-time enabled
   - Verify that RLS policies allow the operations you're trying to perform

### Getting Help

- Check the browser console for detailed error messages
- Review the Supabase dashboard logs
- Consult the [Supabase documentation](https://supabase.com/docs)

## Next Steps

1. **Authentication**: Set up Supabase Auth for user management
2. **File Storage**: Use Supabase Storage for image uploads
3. **Edge Functions**: Add server-side logic with Supabase Edge Functions
4. **Monitoring**: Set up error tracking and performance monitoring

## Security Considerations

1. **Never expose your service role key** in client-side code
2. **Implement proper RLS policies** based on your authentication system
3. **Validate all user inputs** on both client and server side
4. **Use HTTPS** in production
5. **Regularly update dependencies** to patch security vulnerabilities
