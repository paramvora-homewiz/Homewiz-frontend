#!/bin/bash

# Simple Backend Connection Test
echo "🔍 Testing HomeWiz Backend Connection..."

BACKEND_URL="http://localhost:8000"

# Test 1: Backend Health Check
echo ""
echo "1️⃣ Testing backend health check..."
if curl -s -f "$BACKEND_URL/" > /dev/null 2>&1; then
    echo "✅ Backend is responding at $BACKEND_URL"
    echo "Response:"
    curl -s "$BACKEND_URL/" | python -m json.tool 2>/dev/null || curl -s "$BACKEND_URL/"
else
    echo "❌ Backend not responding at $BACKEND_URL"
    echo "💡 Start the backend server first!"
    echo "   cd '/Users/kaushatrivedi/Downloads/homewiz-backend-shardul-backend 5/backend'"
    echo "   pip install -r requirements.txt"
    echo "   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
    exit 1
fi

# Test 2: Query Endpoint
echo ""
echo "2️⃣ Testing /query/ endpoint..."
QUERY_RESPONSE=$(curl -s -X POST "$BACKEND_URL/query/" \
    -H "Content-Type: application/json" \
    -d '{"query": "test connection"}' \
    -w "%{http_code}")

HTTP_CODE="${QUERY_RESPONSE: -3}"
RESPONSE_BODY="${QUERY_RESPONSE%???}"

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Query endpoint working!"
    echo "Response:"
    echo "$RESPONSE_BODY" | python -m json.tool 2>/dev/null || echo "$RESPONSE_BODY"
else
    echo "❌ Query endpoint failed (HTTP $HTTP_CODE)"
    echo "Response:"
    echo "$RESPONSE_BODY"
fi

# Test 3: Sample Chat Query
echo ""
echo "3️⃣ Testing sample chat query..."
CHAT_RESPONSE=$(curl -s -X POST "$BACKEND_URL/query/" \
    -H "Content-Type: application/json" \
    -d '{"query": "Find me available rooms"}' \
    -w "%{http_code}")

HTTP_CODE="${CHAT_RESPONSE: -3}"
RESPONSE_BODY="${CHAT_RESPONSE%???}"

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Chat query working!"
    echo "Response preview:"
    echo "$RESPONSE_BODY" | python -c "import sys,json; data=json.load(sys.stdin); print(f'Function: {data.get(\"function_called\", \"N/A\")}'); print(f'Response: {data.get(\"response\", \"N/A\")[:100]}...')" 2>/dev/null || echo "$RESPONSE_BODY"
else
    echo "❌ Chat query failed (HTTP $HTTP_CODE)"
    echo "Response:"
    echo "$RESPONSE_BODY"
fi

echo ""
echo "🎉 Connection test completed!"
echo "📱 You can now access the chat interface at: http://localhost:3000/chat"