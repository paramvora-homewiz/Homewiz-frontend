#!/bin/bash

# Setup script for Frontend to Supabase Cloud Schema Test

echo "🚀 Setting up Frontend to Supabase Cloud Schema Test..."
echo ""

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the frontend directory (Homewiz-frontend-main)"
    exit 1
fi

# Install @supabase/supabase-js if not present
echo "📦 Checking dependencies..."
if ! npm list @supabase/supabase-js > /dev/null 2>&1; then
    echo "   Installing @supabase/supabase-js..."
    npm install @supabase/supabase-js
else
    echo "   ✅ @supabase/supabase-js is already installed"
fi

# Check if .env.local exists and has Supabase configuration
echo ""
echo "🔧 Checking Supabase configuration..."
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found"
    echo "   Please create .env.local with your Supabase credentials"
    exit 1
fi

# Check Supabase URL
if grep -q "NEXT_PUBLIC_SUPABASE_URL=" .env.local; then
    SUPABASE_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL=" .env.local | cut -d'=' -f2)
    if [[ "$SUPABASE_URL" == "your_supabase_url" ]] || [[ "$SUPABASE_URL" == "" ]]; then
        echo "   ❌ NEXT_PUBLIC_SUPABASE_URL is not configured properly"
        echo "   Current value: $SUPABASE_URL"
        echo "   Please update with your actual Supabase project URL"
        exit 1
    else
        echo "   ✅ Supabase URL configured: ${SUPABASE_URL:0:30}..."
    fi
else
    echo "   ❌ NEXT_PUBLIC_SUPABASE_URL not found in .env.local"
    exit 1
fi

# Check Supabase Anon Key
if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local; then
    SUPABASE_KEY=$(grep "NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local | cut -d'=' -f2)
    if [[ "$SUPABASE_KEY" == "your_supabase_anon_key" ]] || [[ "$SUPABASE_KEY" == "" ]]; then
        echo "   ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured properly"
        echo "   Please update with your actual Supabase anon key"
        exit 1
    else
        echo "   ✅ Supabase anon key configured: ${SUPABASE_KEY:0:20}..."
    fi
else
    echo "   ❌ NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local"
    exit 1
fi

# Check backend schema reference
BACKEND_DIR="/Users/kaushatrivedi/Downloads/homewiz-backend-shardul-backend"
if [ ! -d "$BACKEND_DIR" ]; then
    echo ""
    echo "⚠️  Backend directory not found at: $BACKEND_DIR"
    echo "   The test will still run, but schema reference may not be available"
    echo "   Update the BACKEND_DIR variable in this script if the path is different"
else
    echo "   ✅ Backend schema reference found"
    if [ -f "$BACKEND_DIR/app/db/models.py" ]; then
        echo "   ✅ Backend models.py found for schema reference"
    else
        echo "   ⚠️  Backend models.py not found - schema reference may be incomplete"
    fi
fi

echo ""
echo "📊 Backend Schema Reference:"
echo "   This test uses the database models from the backend as reference:"
echo "   $BACKEND_DIR/app/db/models.py"
echo ""
echo "   Tables that will be tested:"
echo "   • operators: operator_id (int), name, email, phone, role, active, etc."
echo "   • buildings: building_id (string), building_name, full_address, operator_id, etc."
echo "   • rooms: room_id (string), room_number, building_id, status, rent, etc."
echo "   • tenants: tenant_id (string), tenant_name, room_id, lease dates, etc."
echo "   • leads: lead_id (string), email, status, interaction_count, etc."

echo ""
echo "🔍 Supabase Database Requirements:"
echo "   Your Supabase database should have tables that match the backend schema:"
echo ""
echo "   1. Tables should exist: operators, buildings, rooms, tenants, leads"
echo "   2. Column names and types should match the backend models"
echo "   3. Foreign key relationships should be properly configured"
echo "   4. RLS (Row Level Security) policies should allow CRUD operations"
echo ""
echo "   If tables don't exist, you can:"
echo "   • Run the backend migration scripts to create them"
echo "   • Use Supabase SQL editor to create tables manually"
echo "   • Import schema from the backend database"

echo ""
echo "🧪 Ready to test! Run the following command:"
echo "   node test-frontend-supabase-schema.js"
echo ""
echo "📋 What the test will do:"
echo "   1. Connect to your Supabase cloud database"
echo "   2. Verify all tables exist and are accessible"
echo "   3. Test CRUD operations using backend schema data structures"
echo "   4. Verify foreign key relationships work correctly"
echo "   5. Clean up all test data automatically"
echo ""
echo "✅ Setup complete! Execute the test when ready."
