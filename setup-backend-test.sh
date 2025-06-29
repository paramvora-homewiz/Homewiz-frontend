#!/bin/bash

# Setup script for Frontend to Backend Connection Test

echo "🚀 Setting up Frontend to Backend Connection Test..."
echo ""

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the frontend directory (Homewiz-frontend-main)"
    exit 1
fi

# Install axios if not present
echo "📦 Checking dependencies..."
if ! npm list axios > /dev/null 2>&1; then
    echo "   Installing axios..."
    npm install axios
else
    echo "   ✅ axios is already installed"
fi

# Check if backend directory exists
BACKEND_DIR="/Users/kaushatrivedi/Downloads/homewiz-backend-shardul-backend"
if [ ! -d "$BACKEND_DIR" ]; then
    echo "❌ Backend directory not found at: $BACKEND_DIR"
    echo "   Please update the BACKEND_DIR variable in this script with the correct path"
    exit 1
fi

echo "   ✅ Backend directory found"

# Check if .env.local exists and has the right configuration
echo ""
echo "🔧 Checking frontend configuration..."
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found"
    exit 1
fi

# Check if API URL is set correctly for backend testing
if grep -q "NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api" .env.local; then
    echo "   ✅ API URL is configured for backend testing"
elif grep -q "NEXT_PUBLIC_API_URL=" .env.local; then
    echo "   ⚠️  API URL is set but may not point to local backend"
    echo "   Current setting: $(grep NEXT_PUBLIC_API_URL .env.local)"
    echo "   For backend testing, it should be: NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api"
else
    echo "   ⚠️  API URL not found in .env.local"
    echo "   Adding NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api to .env.local"
    echo "" >> .env.local
    echo "# Backend API URL for testing" >> .env.local
    echo "NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api" >> .env.local
fi

echo ""
echo "📋 Backend Setup Instructions:"
echo "   1. Open a new terminal window"
echo "   2. Navigate to: $BACKEND_DIR"
echo "   3. Create a virtual environment: python -m venv venv"
echo "   4. Activate it: source venv/bin/activate (on macOS/Linux) or venv\\Scripts\\activate (on Windows)"
echo "   5. Install dependencies: pip install -r requirements.txt"
echo "   6. Create a .env file with required environment variables:"
echo "      DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres"
echo "      DATABASE_PASSWORD=postgres"
echo "      GEMINI_API_KEY=your_gemini_api_key_here"
echo "   7. Start the backend server: uvicorn app.main:app --reload --port 8000"
echo ""
echo "🧪 Once the backend is running, execute the test with:"
echo "   node test-frontend-backend-connection.js"
echo ""
echo "✅ Setup complete! Follow the instructions above to start testing."
