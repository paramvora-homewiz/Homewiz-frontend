-- HomeWiz Database Setup Script
-- Run this in your Supabase SQL Editor

-- 1. Create Buildings Table
CREATE TABLE IF NOT EXISTS buildings (
  building_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  building_name VARCHAR(100) NOT NULL,
  address VARCHAR(200) NOT NULL,
  city VARCHAR(50) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_code VARCHAR(10) NOT NULL,
  country VARCHAR(50) DEFAULT 'United States',
  total_units INTEGER NOT NULL DEFAULT 0,
  available_units INTEGER DEFAULT 0,
  building_type VARCHAR(20) NOT NULL CHECK (building_type IN ('APARTMENT', 'CONDO', 'HOUSE', 'TOWNHOUSE', 'STUDIO', 'OTHER')),
  year_built INTEGER CHECK (year_built >= 1800 AND year_built <= EXTRACT(YEAR FROM NOW()) + 10),
  amenities JSONB,
  contact_info JSONB,
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'UNDER_CONSTRUCTION', 'MAINTENANCE')),
  area VARCHAR(100),
  description TEXT,
  images JSONB,
  parking_available BOOLEAN DEFAULT false,
  pet_friendly BOOLEAN DEFAULT false,
  furnished_options BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Operators Table
CREATE TABLE IF NOT EXISTS operators (
  operator_id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  operator_type VARCHAR(20) NOT NULL CHECK (operator_type IN ('ADMIN', 'MANAGER', 'LEASING_AGENT', 'MAINTENANCE', 'SUPPORT')),
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  department VARCHAR(50),
  hire_date DATE,
  permissions JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
  room_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id UUID REFERENCES buildings(building_id) ON DELETE CASCADE,
  room_number VARCHAR(10) NOT NULL,
  room_type VARCHAR(20) NOT NULL,
  square_footage INTEGER CHECK (square_footage > 0),
  private_room_rent DECIMAL(10,2) CHECK (private_room_rent >= 0),
  shared_room_rent_2 DECIMAL(10,2) CHECK (shared_room_rent_2 >= 0),
  shared_room_rent_3 DECIMAL(10,2) CHECK (shared_room_rent_3 >= 0),
  shared_room_rent_4 DECIMAL(10,2) CHECK (shared_room_rent_4 >= 0),
  availability_status VARCHAR(20) DEFAULT 'AVAILABLE' CHECK (availability_status IN ('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED')),
  lease_start_date DATE,
  lease_end_date DATE,
  amenities JSONB,
  floor_number INTEGER CHECK (floor_number > 0),
  bathroom_type VARCHAR(20),
  furnished BOOLEAN DEFAULT false,
  utilities_included JSONB,
  images JSONB,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(building_id, room_number)
);

-- 4. Create Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
  tenant_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE CHECK (date_of_birth <= CURRENT_DATE),
  tenant_nationality VARCHAR(50),
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20),
  emergency_contact_relationship VARCHAR(50),
  building_id UUID REFERENCES buildings(building_id),
  room_id UUID REFERENCES rooms(room_id),
  lease_start_date DATE,
  lease_end_date DATE CHECK (lease_end_date IS NULL OR lease_end_date > lease_start_date),
  rent_amount DECIMAL(10,2) CHECK (rent_amount >= 0),
  deposit_amount DECIMAL(10,2) CHECK (deposit_amount >= 0),
  payment_status VARCHAR(20) CHECK (payment_status IN ('CURRENT', 'LATE', 'OVERDUE', 'PENDING')),
  rent_payment_method VARCHAR(20) CHECK (rent_payment_method IN ('BANK_TRANSFER', 'CREDIT_CARD', 'CHECK', 'CASH', 'OTHER')),
  account_status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (account_status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  operator_id INTEGER REFERENCES operators(operator_id),
  booking_type VARCHAR(20) CHECK (booking_type IN ('PRIVATE', 'SHARED_2', 'SHARED_3', 'SHARED_4')),
  special_requests TEXT,
  communication_preferences VARCHAR(20) DEFAULT 'EMAIL' CHECK (communication_preferences IN ('EMAIL', 'SMS', 'BOTH')),
  payment_reminders_enabled BOOLEAN DEFAULT true,
  has_pets BOOLEAN DEFAULT false,
  has_vehicles BOOLEAN DEFAULT false,
  has_renters_insurance BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'PENDING', 'TERMINATED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Leads Table
CREATE TABLE IF NOT EXISTS leads (
  lead_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST')),
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

-- 6. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_buildings_status ON buildings(status);
CREATE INDEX IF NOT EXISTS idx_buildings_city ON buildings(city);
CREATE INDEX IF NOT EXISTS idx_buildings_building_type ON buildings(building_type);

CREATE INDEX IF NOT EXISTS idx_rooms_building_id ON rooms(building_id);
CREATE INDEX IF NOT EXISTS idx_rooms_availability_status ON rooms(availability_status);

CREATE INDEX IF NOT EXISTS idx_tenants_email ON tenants(email);
CREATE INDEX IF NOT EXISTS idx_tenants_building_id ON tenants(building_id);
CREATE INDEX IF NOT EXISTS idx_tenants_room_id ON tenants(room_id);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);

CREATE INDEX IF NOT EXISTS idx_operators_email ON operators(email);
CREATE INDEX IF NOT EXISTS idx_operators_type ON operators(operator_type);
CREATE INDEX IF NOT EXISTS idx_operators_status ON operators(status);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_operator ON leads(assigned_operator_id);

-- 7. Create Functions for Updated At Timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Create Triggers for Auto-updating Timestamps
CREATE TRIGGER update_buildings_updated_at BEFORE UPDATE ON buildings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_operators_updated_at BEFORE UPDATE ON operators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Enable Row Level Security
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS Policies (Allow all for now - customize based on your auth needs)
CREATE POLICY "Allow all operations on buildings" ON buildings FOR ALL USING (true);
CREATE POLICY "Allow all operations on rooms" ON rooms FOR ALL USING (true);
CREATE POLICY "Allow all operations on tenants" ON tenants FOR ALL USING (true);
CREATE POLICY "Allow all operations on operators" ON operators FOR ALL USING (true);
CREATE POLICY "Allow all operations on leads" ON leads FOR ALL USING (true);

-- 11. Insert Sample Data
INSERT INTO operators (name, email, operator_type, department) VALUES
('John Smith', 'john@homewiz.com', 'ADMIN', 'Management'),
('Sarah Johnson', 'sarah@homewiz.com', 'LEASING_AGENT', 'Leasing'),
('Mike Wilson', 'mike@homewiz.com', 'MANAGER', 'Operations'),
('Lisa Chen', 'lisa@homewiz.com', 'LEASING_AGENT', 'Leasing'),
('David Brown', 'david@homewiz.com', 'MAINTENANCE', 'Maintenance')
ON CONFLICT (email) DO NOTHING;

INSERT INTO buildings (building_name, address, city, state, zip_code, total_units, available_units, building_type, year_built, parking_available, pet_friendly) VALUES
('Sunset Apartments', '123 Main Street', 'San Francisco', 'CA', '94102', 50, 15, 'APARTMENT', 2018, true, true),
('Downtown Condos', '456 Market Street', 'San Francisco', 'CA', '94103', 30, 8, 'CONDO', 2020, true, false),
('Garden View Townhomes', '789 Oak Avenue', 'San Francisco', 'CA', '94104', 20, 5, 'TOWNHOUSE', 2019, true, true),
('Modern Studios', '321 Pine Street', 'San Francisco', 'CA', '94105', 40, 12, 'STUDIO', 2021, false, false)
ON CONFLICT DO NOTHING;

-- Insert sample rooms (using building IDs from the inserted buildings)
INSERT INTO rooms (building_id, room_number, room_type, private_room_rent, shared_room_rent_2, availability_status, floor_number, furnished)
SELECT 
    b.building_id,
    '10' || generate_series(1, 5)::text,
    'STANDARD',
    1200.00 + (random() * 800)::numeric(10,2),
    800.00 + (random() * 400)::numeric(10,2),
    CASE WHEN random() > 0.7 THEN 'OCCUPIED' ELSE 'AVAILABLE' END,
    ((generate_series(1, 5) - 1) / 5) + 1,
    random() > 0.5
FROM buildings b
WHERE b.building_name = 'Sunset Apartments'
ON CONFLICT DO NOTHING;

-- Success message
SELECT 'Database setup completed successfully! 🎉' as message;
