#!/bin/bash

echo "🔄 Complete Development Server Reset"
echo "=================================="

echo "1. Stopping any existing Next.js processes..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "node.*next" 2>/dev/null || true

echo "2. Killing processes on port 3000..."
lsof -ti:3000 2>/dev/null | xargs kill -9 2>/dev/null || true

echo "3. Clearing all build artifacts..."
rm -rf .next 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true

echo "4. Waiting for cleanup to complete..."
sleep 2

echo "5. Starting fresh development server..."
npm run dev

echo ""
echo "✅ Development server reset complete!"
echo ""
echo "🔥 IMPORTANT: After the server starts, you MUST:"
echo "   1. Hard refresh your browser (Ctrl+F5 or Cmd+Shift+R)"
echo "   2. Or open an incognito/private window"
echo "   3. Or clear browser cache completely"
echo ""
echo "The 404 errors are caused by browser cache conflicts!"