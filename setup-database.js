/**
 * Database Setup Script for HomeWiz
 * This script will create all necessary tables and sample data
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🚀 Setting up HomeWiz Database...\n')

async function setupDatabase() {
  try {
    // 1. Create Buildings Table
    console.log('📋 Creating buildings table...')
    const { error: buildingsError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    })

    if (buildingsError) {
      console.log('⚠️  Buildings table might already exist or using direct insert...')
    } else {
      console.log('✅ Buildings table created')
    }

    // 2. Create Operators Table
    console.log('👥 Creating operators table...')
    const { error: operatorsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS operators (
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
      `
    })

    if (operatorsError) {
      console.log('⚠️  Operators table might already exist...')
    } else {
      console.log('✅ Operators table created')
    }

    // Let's try a simpler approach - direct inserts
    console.log('📝 Inserting sample operators...')
    const { error: insertOperatorsError } = await supabase
      .from('operators')
      .upsert([
        { name: 'John Smith', email: 'john@homewiz.com', operator_type: 'ADMIN', department: 'Management' },
        { name: 'Sarah Johnson', email: 'sarah@homewiz.com', operator_type: 'LEASING_AGENT', department: 'Leasing' },
        { name: 'Mike Wilson', email: 'mike@homewiz.com', operator_type: 'MANAGER', department: 'Operations' }
      ], { onConflict: 'email' })

    if (insertOperatorsError) {
      console.log('❌ Error inserting operators:', insertOperatorsError.message)
    } else {
      console.log('✅ Sample operators inserted')
    }

    // 3. Insert sample buildings
    console.log('🏢 Inserting sample buildings...')
    const { error: insertBuildingsError } = await supabase
      .from('buildings')
      .upsert([
        {
          building_name: 'Sunset Apartments',
          address: '123 Main Street',
          city: 'San Francisco',
          state: 'CA',
          zip_code: '94102',
          total_units: 50,
          available_units: 15,
          building_type: 'APARTMENT',
          year_built: 2018,
          parking_available: true,
          pet_friendly: true
        },
        {
          building_name: 'Downtown Condos',
          address: '456 Market Street',
          city: 'San Francisco',
          state: 'CA',
          zip_code: '94103',
          total_units: 30,
          available_units: 8,
          building_type: 'CONDO',
          year_built: 2020,
          parking_available: true,
          pet_friendly: false
        }
      ])

    if (insertBuildingsError) {
      console.log('❌ Error inserting buildings:', insertBuildingsError.message)
    } else {
      console.log('✅ Sample buildings inserted')
    }

    // 4. Test the setup
    console.log('\n🧪 Testing database setup...')
    
    const { data: buildings, error: testError } = await supabase
      .from('buildings')
      .select('*')
      .limit(5)

    if (testError) {
      console.log('❌ Test failed:', testError.message)
    } else {
      console.log(`✅ Found ${buildings.length} buildings`)
      if (buildings.length > 0) {
        console.log(`   Sample: ${buildings[0].building_name} in ${buildings[0].city}`)
      }
    }

    const { data: operators, error: testOperatorsError } = await supabase
      .from('operators')
      .select('*')
      .limit(5)

    if (testOperatorsError) {
      console.log('❌ Operators test failed:', testOperatorsError.message)
    } else {
      console.log(`✅ Found ${operators.length} operators`)
      if (operators.length > 0) {
        console.log(`   Sample: ${operators[0].name} (${operators[0].operator_type})`)
      }
    }

    console.log('\n🎉 Database setup completed!')
    console.log('🚀 You can now test the tenant form at: http://localhost:3000/forms')

  } catch (error) {
    console.log('❌ Setup failed:', error.message)
    console.log('\n💡 Manual Setup Required:')
    console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Run the SQL script from supabase-setup.sql')
  }
}

setupDatabase()
