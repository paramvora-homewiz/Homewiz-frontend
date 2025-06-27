# Local Development Setup Guide

This guide will help you set up the HomeWiz frontend to work with your local backend during development.

## Current Issue

You're getting these errors because:
1. **Backend Connection Error**: Frontend is trying to connect to `localhost:8000` but the backend isn't running
2. **Supabase Connection Error**: Invalid API key (`your_anon_key_here` is a placeholder)

## Solution: Proper Environment Configuration

### For Local Development (Recommended)

1. **Start your backend server first**:
   ```bash
   # In your backend directory (/Users/kaushatrivedi/Downloads/homewiz-backend-shardul-backend)
   cd /Users/kaushatrivedi/Downloads/homewiz-backend-shardul-backend
   python -m uvicorn app.main:app --reload --port 8000
   ```

2. **Your `.env.local` is now configured for local backend**:
   - `NEXT_PUBLIC_DISABLE_BACKEND=false` (enables backend connection)
   - `NEXT_PUBLIC_API_URL=http://localhost:8000/api` (points to local backend)

3. **Start the frontend**:
   ```bash
   # In this directory
   npm run dev
   ```

### Alternative: Use Local Supabase

If you want to test with Supabase locally:

1. **Start local Supabase**:
   ```bash
   ./start-supabase.sh
   ```

2. **Update `.env.local`**:
   ```bash
   NEXT_PUBLIC_DISABLE_BACKEND=true
   # Keep the local Supabase settings that are already configured
   ```

## For Production (Render Deployment)

Your Render deployment should use these environment variables:

```bash
# Backend Configuration
NEXT_PUBLIC_DISABLE_BACKEND=true
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Supabase Configuration (get these from your Supabase dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://ushsurulbffbbqkyfynd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key

# Other settings
NEXT_PUBLIC_DEMO_MODE=false
PORT=10000
```

## Getting Your Supabase API Key

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the "anon public" key
5. Replace `your_actual_supabase_anon_key` with the real key

## Quick Start Commands

### Option 1: Local Backend Development
```bash
# Terminal 1: Start backend
cd /Users/kaushatrivedi/Downloads/homewiz-backend-shardul-backend
python -m uvicorn app.main:app --reload --port 8000

# Terminal 2: Start frontend
cd /Users/kaushatrivedi/Downloads/Homewiz-frontend-main
npm run dev
```

### Option 2: Local Supabase Development
```bash
# Terminal 1: Start Supabase
./start-supabase.sh

# Terminal 2: Start frontend (with backend disabled)
# Edit .env.local to set NEXT_PUBLIC_DISABLE_BACKEND=true
npm run dev
```

## Troubleshooting

### Backend Connection Issues
- Make sure backend is running on port 8000
- Check if backend has CORS configured for `http://localhost:3000`
- Verify backend API endpoints are working

### Supabase Connection Issues
- Verify your Supabase URL and API key are correct
- Check if your Supabase project is active
- Ensure your database tables exist

### Environment Variable Issues
- Restart the development server after changing `.env.local`
- Check that environment variables start with `NEXT_PUBLIC_`
- Verify no typos in variable names
