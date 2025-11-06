# Vercel Production Setup Guide

## Problem: Forms Trying to Call localhost in Production

If you see CORS errors like:
```
Access to fetch at 'http://localhost:8000/api/operators' from origin 'https://homewiz-frontend-one.vercel.app' has been blocked by CORS policy
```

This means your production app is trying to call a local backend that doesn't exist.

## Solution: Configure Vercel Environment Variables

### Step 1: Go to Vercel Dashboard

1. Visit https://vercel.com
2. Select your project: `Homewiz-frontend`
3. Go to **Settings** → **Environment Variables**

### Step 2: Set Required Environment Variables

Add the following variables for **Production** environment:

#### **CRITICAL: Disable Backend API**
```
NEXT_PUBLIC_DISABLE_BACKEND=true
```
This makes the app use Supabase directly instead of trying to call a backend API.

#### **Supabase Configuration**
```
NEXT_PUBLIC_SUPABASE_URL=https://ushsurulbffbbqkyfynd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzaHN1cnVsYmZmYmJxa3lmeW5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzE2MDMsImV4cCI6MjA2NTgwNzYwM30.ITybGpihJbJHppQIbq2O3CF6VSJwoH8-KsuA2hhsi4s
NEXT_PUBLIC_ENABLE_SUPABASE_DIRECT=true
```

#### **Optional: Google Gemini API Key** (for AI features)
```
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_gemini_api_key
```

### Step 3: Redeploy

After setting environment variables:

1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Or simply push a new commit to trigger automatic deployment

### Step 4: Verify

After redeployment, check browser console:
- ✅ Should see: `🔧 FormDataProvider: Using Supabase cloud database`
- ✅ Should NOT see: Calls to `localhost:8000`
- ✅ Forms should submit successfully to Supabase

## Alternative: Use Deployed Backend

If you have a backend API deployed (e.g., on Cloud Run), set:

```
NEXT_PUBLIC_DISABLE_BACKEND=false
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
NEXT_PUBLIC_BACKEND_API_URL=https://your-backend-url.com
NEXT_PUBLIC_BACKEND_WS_URL=wss://your-backend-url.com/ws/chat
```

## Environment Variable Reference

| Variable | Development | Production |
|----------|-------------|------------|
| `NEXT_PUBLIC_DISABLE_BACKEND` | `false` (if backend running) | `true` (use Supabase) |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000/api` | Not needed if backend disabled |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | Your Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key | Your anon key |

## Troubleshooting

### Forms still calling localhost?

1. Double-check environment variable is set: `NEXT_PUBLIC_DISABLE_BACKEND=true`
2. Make sure you redeployed after setting the variable
3. Clear browser cache and hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

### How to check current config?

Add this to browser console:
```javascript
console.log({
  disableBackend: process.env.NEXT_PUBLIC_DISABLE_BACKEND,
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
})
```
