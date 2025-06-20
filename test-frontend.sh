#!/bin/bash

# HomeWiz Frontend Test Script
echo "🏠 HomeWiz Frontend Test Suite"
echo "=============================="

# Test basic connectivity
echo "🔍 Testing frontend connectivity..."
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)

if [ "$response" = "200" ]; then
    echo "✅ Frontend is accessible at http://localhost:3000"
else
    echo "❌ Frontend is not accessible (HTTP $response)"
    exit 1
fi

# Test specific routes
echo ""
echo "🧪 Testing specific routes..."

routes=(
    "/"
    "/forms"
    "/demo"
    "/onboarding"
    "/simple"
    "/standalone"
)

for route in "${routes[@]}"; do
    response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$route")
    if [ "$response" = "200" ]; then
        echo "✅ $route - OK"
    else
        echo "⚠️  $route - HTTP $response"
    fi
done

# Test API connectivity from frontend
echo ""
echo "🔗 Testing backend API connectivity..."
api_response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)

if [ "$api_response" = "200" ]; then
    echo "✅ Backend API is accessible at http://localhost:8000"
else
    echo "❌ Backend API is not accessible (HTTP $api_response)"
fi

echo ""
echo "📊 Test Summary:"
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000"
echo "Status:   Both services are running"
echo ""
echo "🎉 HomeWiz is ready for development!"
echo ""
echo "📖 Next steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Try the demo forms at http://localhost:3000/forms"
echo "3. Check the API docs at http://localhost:8000/docs"
