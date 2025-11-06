# HomeWiz Production Deployment Guide

## 🎯 Problem Solved

**Issue:** Frontend deployed on Vercel was calling `localhost:8000` instead of cloud backend, causing CORS errors.

**Root Cause:** The `Updatedconfig` branch had no common ancestor with `main` branch, making it impossible to create a PR.

**Solution:** Created proper branch from `main` with smart environment detection that automatically uses:
- **Production**: `https://homewiz-backend-335786120771.us-west2.run.app`
- **Development**: `http://localhost:8000`

## ✨ What Changed

### Smart Environment Detection

The application now automatically detects whether it's running in production or development:

```typescript
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'
```

### Zero Configuration Deployment

**You NO LONGER NEED environment variables in Vercel!** The app automatically:
1. Detects production environment
2. Uses cloud backend URLs
3. Works for both chatbot AND forms

### Files Modified

- `src/lib/config.ts` - Smart environment detection with production defaults
- `src/lib/api-client.ts` - Uses smart config with logging
- `src/lib/config/backend.ts` - Smart backend URL detection for WebSocket and HTTP
- `.env.example` - Updated with clear documentation about smart defaults

## 🚀 Deployment Instructions

### Just Push and Deploy!

```bash
# Merge this PR on GitHub
# Vercel will auto-deploy with correct backend URLs - no config needed!
```

That's it! No environment variables to set in Vercel dashboard.

## 🔍 Verification

After deployment, check browser console:

```
🌐 HomeWiz Client Configuration
   API Base URL: https://homewiz-backend-335786120771.us-west2.run.app
   Environment: production
```

And check Vercel logs:

```
🔧 HomeWiz Frontend Configuration Loaded
📦 Environment: production
🏭 NODE_ENV: production
☁️  VERCEL_ENV: production
🌐 API URL (Smart Default): https://homewiz-backend-335786120771.us-west2.run.app
```

## ⚠️ CORS Configuration Required

### Current Issue

Your backend CORS allows `https://homewiz-frontend.vercel.app`, but your deployment is at `https://homewiz-frontend-one.vercel.app`.

### Solution Options

**Option A: Update Vercel Domain (Recommended)**
1. Go to Vercel → Settings → Domains
2. Add `homewiz-frontend.vercel.app` as custom domain

**Option B: Update Backend CORS**

Ask backend team to add your domain in `/backend/app/main.py`:

```python
origins = [
    "https://homewiz-frontend.vercel.app",
    "https://homewiz-frontend-one.vercel.app",  # Add this
    "http://localhost:3000",
]

# Or use regex to allow all Vercel deployments:
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://homewiz-frontend.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🧪 Testing

### Development
```bash
npm run dev
# Uses http://localhost:8000
```

### Production Build Locally
```bash
npm run build
npm start
# Uses https://homewiz-backend-335786120771.us-west2.run.app
```

## 🛠️ How It Works

### Configuration Priority

1. **Explicit Environment Variables** (highest)
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_BACKEND_API_URL`

2. **Smart Detection** (automatic)
   - Checks `NODE_ENV` and `VERCEL_ENV`
   - Uses production URLs if production detected

3. **Fallback** (lowest)
   - Development URLs (localhost)

### Code Flow

```typescript
// src/lib/config.ts
const getDefaultApiUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL
  if (process.env.NEXT_PUBLIC_BACKEND_API_URL) return process.env.NEXT_PUBLIC_BACKEND_API_URL
  return isProduction ? PRODUCTION_BACKEND_URL : DEVELOPMENT_BACKEND_URL
}
```

## 📝 Key Points

1. ✅ **Zero configuration** needed for Vercel
2. ✅ **Automatic environment detection**
3. ✅ **Works for chatbot AND forms**
4. ⚠️ **CORS must be configured** in backend
5. 🔧 **Can override** via environment variables if needed

## 🎉 Result

Forms and chatbot will now correctly call the cloud backend in production, fixing the CORS error!
