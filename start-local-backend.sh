#!/bin/bash

echo "🚀 Starting Homewiz Local Backend..."
echo "=================================="

# Navigate to backend directory
cd /Users/kaushatrivedi/Downloads/Homewiz-backend-main/backend

# Check if environment variables are set
if [ -z "$GEMINI_API_KEY" ]; then
    echo "⚠️  Warning: GEMINI_API_KEY not set"
    echo "   You may need to set it in your shell:"
    echo "   export GEMINI_API_KEY='your_key_here'"
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "⚠️  Warning: NEXT_PUBLIC_SUPABASE_URL not set"
    echo "   Setting from frontend .env.local..."
    export NEXT_PUBLIC_SUPABASE_URL="https://ushsurulbffbbqkyfynd.supabase.co"
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "⚠️  Warning: NEXT_PUBLIC_SUPABASE_ANON_KEY not set"
    echo "   Setting from frontend .env.local..."
    export NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzaHN1cnVsYmZmYmJxa3lmeW5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzE2MDMsImV4cCI6MjA2NTgwNzYwM30.ITybGpihJbJHppQIbq2O3CF6VSJwoH8-KsuA2hhsi4s"
fi

# Start the backend
python start_backend.py