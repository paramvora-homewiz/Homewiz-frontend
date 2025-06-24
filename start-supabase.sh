#!/bin/bash

# HomeWiz Supabase Local Setup Script
echo "🚀 Starting HomeWiz Supabase Local Development Environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo "Please start Docker Desktop and try again."
    echo "You can find Docker Desktop in your Applications folder."
    exit 1
fi

echo "✅ Docker is running!"

# Start Supabase
echo "🔄 Starting Supabase services..."
npx supabase start

# Check if Supabase started successfully
if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Supabase is now running locally!"
    echo ""
    echo "📋 Connection Details:"
    echo "   Studio URL: http://localhost:54323"
    echo "   API URL: http://localhost:54321"
    echo "   Database URL: postgresql://postgres:postgres@localhost:54322/postgres"
    echo ""
    echo "🔑 API Keys (for your .env.local):"
    echo "   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321"
    echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
    echo "   NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
    echo ""
    echo "📝 Next Steps:"
    echo "1. Update your .env.local file with the above credentials"
    echo "2. Open Supabase Studio: http://localhost:54323"
    echo "3. Run the database setup script in the SQL Editor"
    echo "4. Test your connection with: node test-supabase.js"
    echo ""
else
    echo "❌ Failed to start Supabase. Please check the error messages above."
    exit 1
fi
