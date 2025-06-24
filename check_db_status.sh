#!/bin/bash

# HomeWiz Database Status Checker
echo "🏠 HomeWiz Database Status Check"
echo "================================"

# Check if PostgreSQL is running
if ! pgrep -x "postgres" > /dev/null; then
    echo "❌ PostgreSQL is not running"
    exit 1
fi

echo "✅ PostgreSQL is running"

# Check database connection
if ! psql -d homewiz_local -c "SELECT 1;" > /dev/null 2>&1; then
    echo "❌ Cannot connect to homewiz_local database"
    exit 1
fi

echo "✅ Database connection successful"

# Check table counts
echo ""
echo "📊 Current Data Summary:"
echo "------------------------"

psql -d homewiz_local -c "
SELECT 
    'Buildings' as table_name, COUNT(*) as count FROM buildings
UNION ALL
SELECT 
    'Rooms' as table_name, COUNT(*) as count FROM rooms
UNION ALL
SELECT 
    'Operators' as table_name, COUNT(*) as count FROM operators
UNION ALL
SELECT 
    'Tenants' as table_name, COUNT(*) as count FROM tenants
UNION ALL
SELECT 
    'Leads' as table_name, COUNT(*) as count FROM leads
ORDER BY table_name;
" -t

# Check API connectivity
echo ""
echo "🔗 API Status:"
echo "--------------"

if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend API is responding"
    
    # Test buildings endpoint
    building_count=$(curl -s http://localhost:8000/api/buildings | python3 -c "import sys, json; print(len(json.load(sys.stdin)))" 2>/dev/null)
    if [ "$building_count" ]; then
        echo "✅ Buildings API returns $building_count buildings"
    else
        echo "⚠️  Buildings API response format issue"
    fi
else
    echo "❌ Backend API is not responding"
fi

# Check frontend
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is responding"
else
    echo "❌ Frontend is not responding"
fi

echo ""
echo "🎉 Status check complete!"
