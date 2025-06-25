#!/bin/bash

echo "🏠 HomeWiz Supabase Local Setup"
echo "================================"
echo ""

# Check if Docker is running
echo "1️⃣ Checking Docker status..."
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo ""
    echo "📋 To fix this:"
    echo "   1. Open Docker Desktop from your Applications folder"
    echo "   2. Wait for Docker to start (you'll see the whale icon in your menu bar)"
    echo "   3. Run this script again"
    echo ""
    exit 1
fi

echo "✅ Docker is running!"
echo ""

# Start Supabase
echo "2️⃣ Starting Supabase services..."
./start-supabase.sh

if [ $? -eq 0 ]; then
    echo ""
    echo "3️⃣ Setting up database..."
    
    # Wait a moment for services to be ready
    sleep 5
    
    # Run database setup
    echo "Running database setup script..."
    node setup-database.js
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "4️⃣ Testing connection..."
        node test-supabase.js
        
        echo ""
        echo "🎉 Setup Complete!"
        echo ""
        echo "📋 What's Ready:"
        echo "   ✅ Local Supabase instance running"
        echo "   ✅ Database tables created"
        echo "   ✅ Sample data loaded"
        echo "   ✅ Environment variables configured"
        echo ""
        echo "🚀 Next Steps:"
        echo "   1. Start your frontend: npm run dev"
        echo "   2. Visit: http://localhost:3000/forms"
        echo "   3. Open Supabase Studio: http://localhost:54323"
        echo ""
    else
        echo "⚠️  Database setup had issues, but Supabase is running"
        echo "   You can manually run: node setup-database.js"
    fi
else
    echo "❌ Failed to start Supabase"
    exit 1
fi
