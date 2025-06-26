-- HomeWiz Database Schema Setup
-- Run this in your Supabase SQL Editor to create all necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Buildings Table
CREATE TABLE IF NOT EXISTS buildings (
    building_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    building_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(50) DEFAULT 'USA',
    total_units INTEGER NOT NULL DEFAULT 0,
    available_units INTEGER DEFAULT 0,
    building_type VARCHAR(50) NOT NULL,
    year_built INTEGER,
    amenities JSONB,
    contact_info JSONB,
    status VARCHAR(20) DEFAULT 'active',
    area VARCHAR(100),
    description TEXT,
    images JSONB,
    parking_available BOOLEAN DEFAULT false,
    pet_friendly BOOLEAN DEFAULT false,
    furnished_options BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
    room_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    building_id UUID NOT NULL REFERENCES buildings(building_id) ON DELETE CASCADE,
    room_number VARCHAR(20) NOT NULL,
    room_type VARCHAR(50) NOT NULL,
    square_footage DECIMAL(8,2),
    private_room_rent DECIMAL(10,2),
    shared_room_rent_2 DECIMAL(10,2),
    shared_room_rent_3 DECIMAL(10,2),
    shared_room_rent_4 DECIMAL(10,2),
    availability_status VARCHAR(20) DEFAULT 'available',
    lease_start_date DATE,
    lease_end_date DATE,
    amenities JSONB,
    floor_number INTEGER,
    bathroom_type VARCHAR(50),
    furnished BOOLEAN DEFAULT false,
    utilities_included JSONB,
    images JSONB,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(building_id, room_number)
);

-- Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
    tenant_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    building_id UUID REFERENCES buildings(building_id),
    room_id UUID REFERENCES rooms(room_id),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    emergency_contact JSONB,
    lease_start_date DATE,
    lease_end_date DATE,
    rent_amount DECIMAL(10,2),
    security_deposit DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'active',
    documents JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Operators Table
CREATE TABLE IF NOT EXISTS operators (
    operator_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL,
    permissions JSONB,
    buildings_assigned JSONB,
    status VARCHAR(20) DEFAULT 'active',
    hire_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads Table
CREATE TABLE IF NOT EXISTS leads (
    lead_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    preferred_move_in_date DATE,
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    preferred_room_type VARCHAR(50),
    building_preferences JSONB,
    status VARCHAR(20) DEFAULT 'new',
    source VARCHAR(50),
    notes TEXT,
    follow_up_date DATE,
    assigned_operator_id UUID REFERENCES operators(operator_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_buildings_city ON buildings(city);
CREATE INDEX IF NOT EXISTS idx_buildings_status ON buildings(status);
CREATE INDEX IF NOT EXISTS idx_rooms_building_id ON rooms(building_id);
CREATE INDEX IF NOT EXISTS idx_rooms_availability ON rooms(availability_status);
CREATE INDEX IF NOT EXISTS idx_tenants_building_id ON tenants(building_id);
CREATE INDEX IF NOT EXISTS idx_tenants_email ON tenants(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_buildings_updated_at BEFORE UPDATE ON buildings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_operators_updated_at BEFORE UPDATE ON operators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO buildings (building_name, address, city, state, zip_code, total_units, available_units, building_type, year_built, parking_available, pet_friendly) VALUES
('Sunset Apartments', '123 Main St', 'San Francisco', 'CA', '94102', 50, 5, 'Apartment Complex', 2020, true, true),
('Downtown Lofts', '456 Market St', 'San Francisco', 'CA', '94103', 30, 3, 'Loft Building', 2018, false, false),
('Garden View Residences', '789 Oak St', 'Oakland', 'CA', '94601', 75, 8, 'Apartment Complex', 2019, true, true);

-- Enable Row Level Security (RLS)
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - you can restrict later)
CREATE POLICY "Allow all operations on buildings" ON buildings FOR ALL USING (true);
CREATE POLICY "Allow all operations on rooms" ON rooms FOR ALL USING (true);
CREATE POLICY "Allow all operations on tenants" ON tenants FOR ALL USING (true);
CREATE POLICY "Allow all operations on operators" ON operators FOR ALL USING (true);
CREATE POLICY "Allow all operations on leads" ON leads FOR ALL USING (true);
