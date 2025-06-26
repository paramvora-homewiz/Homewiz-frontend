#!/bin/bash

# HomeWiz Database Setup Script
# This script helps you set up your database connection quickly

echo "🏠 HomeWiz Database Setup"
echo "========================="
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found!"
    echo "Please make sure you're in the project root directory."
    exit 1
fi

echo "📋 Current configuration:"
echo ""

# Show current Supabase URL
CURRENT_URL=$(grep "NEXT_PUBLIC_SUPABASE_URL=" .env.local | cut -d'=' -f2)
echo "Supabase URL: $CURRENT_URL"

# Show current demo mode
CURRENT_DEMO=$(grep "NEXT_PUBLIC_DEMO_MODE=" .env.local | cut -d'=' -f2)
echo "Demo Mode: $CURRENT_DEMO"

echo ""
echo "🎯 Setup Options:"
echo "1. Cloud Supabase (Recommended)"
echo "2. Local Supabase"
echo "3. Test current configuration"
echo "4. Exit"
echo ""

read -p "Choose an option (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🌐 Setting up Cloud Supabase..."
        echo ""
        echo "Please follow these steps:"
        echo "1. Go to https://supabase.com"
        echo "2. Create a new project"
        echo "3. Get your Project URL and API keys"
        echo ""
        
        read -p "Enter your Supabase Project URL: " supabase_url
        read -p "Enter your Supabase Anon Key: " anon_key
        
        # Update .env.local
        sed -i.bak "s|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=$supabase_url|" .env.local
        sed -i.bak "s|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=$anon_key|" .env.local
        sed -i.bak "s|NEXT_PUBLIC_DEMO_MODE=.*|NEXT_PUBLIC_DEMO_MODE=false|" .env.local
        
        echo ""
        echo "✅ Configuration updated!"
        echo ""
        echo "📋 Next steps:"
        echo "1. Run the database schema: Copy database-setup.sql to Supabase SQL Editor"
        echo "2. Test connection: node test-database.js"
        echo "3. Start development: npm run dev"
        ;;
        
    2)
        echo ""
        echo "🏠 Setting up Local Supabase..."
        echo ""
        echo "Prerequisites:"
        echo "- Docker Desktop must be installed and running"
        echo "- Supabase CLI must be installed"
        echo ""
        
        read -p "Do you have Docker and Supabase CLI installed? (y/n): " has_prereqs
        
        if [ "$has_prereqs" = "y" ]; then
            # Update .env.local for local setup
            sed -i.bak "s|NEXT_PUBLIC_SUPABASE_URL=.*|NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321|" .env.local
            sed -i.bak "s|NEXT_PUBLIC_SUPABASE_ANON_KEY=.*|NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0|" .env.local
            sed -i.bak "s|NEXT_PUBLIC_DEMO_MODE=.*|NEXT_PUBLIC_DEMO_MODE=false|" .env.local
            
            echo ""
            echo "✅ Configuration updated for local Supabase!"
            echo ""
            echo "📋 Next steps:"
            echo "1. Run: supabase start"
            echo "2. Run the database schema in Supabase Studio"
            echo "3. Test connection: node test-database.js"
            echo "4. Start development: npm run dev"
        else
            echo ""
            echo "Please install the prerequisites first:"
            echo "1. Docker Desktop: https://www.docker.com/products/docker-desktop"
            echo "2. Supabase CLI: npm install -g supabase"
        fi
        ;;
        
    3)
        echo ""
        echo "🧪 Testing current configuration..."
        echo ""
        
        if command -v node &> /dev/null; then
            node test-database.js
        else
            echo "❌ Node.js not found. Please install Node.js to run the test."
        fi
        ;;
        
    4)
        echo "👋 Goodbye!"
        exit 0
        ;;
        
    *)
        echo "❌ Invalid option. Please choose 1-4."
        exit 1
        ;;
esac

echo ""
echo "🎉 Setup completed!"
echo ""
echo "📚 For detailed instructions, see:"
echo "- DATABASE_SETUP_GUIDE.md"
echo "- database-setup.sql"
