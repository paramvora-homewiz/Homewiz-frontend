#!/bin/bash

echo "🔧 Fixing Next.js Development Server Asset Loading Issues..."
echo "=================================================="

# Step 1: Kill any existing Next.js processes
echo "1. Stopping any existing Next.js processes..."
pkill -f "next" 2>/dev/null || true
pkill -f "node.*next" 2>/dev/null || true
sleep 2

# Step 2: Clear all caches and build artifacts
echo "2. Clearing all caches and build artifacts..."
rm -rf .next 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf .next/cache 2>/dev/null || true

# Step 3: Clear npm cache (if needed)
echo "3. Clearing npm cache..."
npm cache clean --force 2>/dev/null || true

# Step 4: Verify port 3000 is free
echo "4. Checking port 3000 availability..."
if lsof -ti:3000 >/dev/null 2>&1; then
    echo "   Port 3000 is still in use. Killing processes..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Step 5: Build the application fresh
echo "5. Building application with fresh assets..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🚀 Starting clean development server..."
    echo "   The server will start on http://localhost:3000"
    echo "   After it starts, hard refresh your browser (Ctrl+F5 or Cmd+Shift+R)"
    echo ""
    npm run dev
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
