# HomeWiz Production Deployment Guide

## 🎯 Overview

Your HomeWiz frontend has been configured with **production-ready smart defaults** that automatically detect the environment and use the appropriate backend URLs.

## ✨ What's Changed

### 1. **Smart Environment Detection**

The application now automatically detects whether it's running in:
- **Production** (Vercel): Uses cloud backend URLs
- **Development** (localhost): Uses local backend URLs

### 2. **Zero Configuration Deployment**

You **NO LONGER NEED** to set environment variables in Vercel for basic operation. The app will automatically use:

**Production URLs:**
- HTTP API: `https://homewiz-backend-335786120771.us-west2.run.app`
- WebSocket: `wss://homewiz-backend-335786120771.us-west2.run.app/ws/chat`

**Development URLs:**
- HTTP API: `http://localhost:8000`
- WebSocket: `ws://localhost:8000/ws/chat`

### 3. **Files Modified**

- `src/lib/config.ts` - Added smart environment detection
- `src/lib/api-client.ts` - Uses smart config defaults
- `src/lib/config/backend.ts` - Added smart backend URL detection
- `.env.local` - Updated with clear documentation

## 🚀 Deployment Instructions

### Option 1: Zero Configuration (Recommended)

Simply deploy to Vercel - **no environment variables needed!**

```bash
# Push your code
git add .
git commit -m "Add production-ready configuration"
git push

# Vercel will auto-deploy and use cloud backend URLs
```

### Option 2: Custom Configuration (If Needed)

If you need to override the smart defaults, set these in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add only if needed:

```
NEXT_PUBLIC_API_URL=your_custom_backend_url
NEXT_PUBLIC_BACKEND_API_URL=your_custom_backend_url
NEXT_PUBLIC_BACKEND_WS_URL=your_custom_websocket_url
```

4. Redeploy

## 🔍 Verification

After deployment, check the browser console for these logs:

```
🌐 HomeWiz Client Configuration
   API Base URL: https://homewiz-backend-335786120771.us-west2.run.app
   Environment: production
```

And server logs for:

```
🔧 HomeWiz Frontend Configuration Loaded
📦 Environment: production
🏭 NODE_ENV: production
☁️  VERCEL_ENV: production
🌐 API URL (Smart Default): https://homewiz-backend-335786120771.us-west2.run.app
```

## ⚠️ CORS Configuration

### Current Backend CORS Settings

Your backend (`/Users/kaushatrivedi/Downloads/Homewiz-Project-main 2/backend/app/main.py`) currently allows:

```python
origins = [
    "https://homewiz-frontend.vercel.app",
    "http://localhost:3000",
]
```

### Required Action

Your Vercel deployment is at `https://homewiz-frontend-one.vercel.app`, which is **NOT** in the allowed origins list.

**You have two options:**

#### Option A: Update Your Vercel Domain (Recommended)

1. In Vercel, go to **Settings** → **Domains**
2. Add `homewiz-frontend.vercel.app` as a custom domain
3. This matches your backend CORS configuration

#### Option B: Ask Backend Team to Update CORS

Request the backend team to add your actual domain:

```python
origins = [
    "https://homewiz-frontend.vercel.app",
    "https://homewiz-frontend-one.vercel.app",  # Add this
    "http://localhost:3000",
]
```

Or use a regex pattern to allow all Vercel deployments:

```python
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

### Test in Development

```bash
npm run dev
# Should use http://localhost:8000
```

### Test Production Build Locally

```bash
npm run build
npm start
# Should use https://homewiz-backend-335786120771.us-west2.run.app
```

### Test in Vercel

1. Deploy to Vercel
2. Open browser console
3. Check logs for the correct backend URL
4. Test form submission - it should call the cloud backend

## 🛠️ Troubleshooting

### Issue: Still seeing localhost URLs in production

**Solution:**
1. Clear Vercel build cache:
   - Go to Vercel Dashboard → Settings → General
   - Scroll to "Build & Development Settings"
   - Clear cache and redeploy

2. Ensure you're on the latest code:
   ```bash
   git pull
   git push
   ```

### Issue: CORS errors persist

**Solution:**
1. Verify your Vercel domain matches backend CORS config
2. Check browser console for the exact origin being sent
3. Update backend CORS configuration accordingly

### Issue: Environment variables not working

**Solution:**
1. Verify variables are prefixed with `NEXT_PUBLIC_`
2. Redeploy after adding variables (environment changes require rebuild)
3. Check Vercel logs for environment variable values

## 📊 How It Works

### Configuration Priority

1. **Explicit Environment Variables** (highest priority)
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_BACKEND_API_URL`

2. **Smart Detection** (automatic)
   - Checks `NODE_ENV`
   - Checks `VERCEL_ENV`
   - Uses production URLs if production environment detected

3. **Fallback** (lowest priority)
   - Development URLs (localhost)

### Code Flow

```typescript
// src/lib/config.ts
const isProduction =
  process.env.NODE_ENV === 'production' ||
  process.env.VERCEL_ENV === 'production'

const getDefaultApiUrl = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL
  if (process.env.NEXT_PUBLIC_BACKEND_API_URL) return process.env.NEXT_PUBLIC_BACKEND_API_URL
  return isProduction ? PRODUCTION_BACKEND_URL : DEVELOPMENT_BACKEND_URL
}
```

## 📝 Summary

**Key Points:**

1. ✅ **No environment variables needed** for standard deployment
2. ✅ **Automatic environment detection** handles URL switching
3. ✅ **Works for both chatbot and forms** - unified configuration
4. ⚠️ **CORS must be configured** in backend for your Vercel domain
5. 🔧 **Override possible** via environment variables if needed

## 🎉 Next Steps

1. **Deploy to Vercel** - Just push your code
2. **Verify CORS** - Test form submission
3. **Monitor logs** - Check browser console for confirmation
4. **Optional:** Add custom domain in Vercel settings

---

**Need Help?**

- Check Vercel deployment logs
- Review browser console logs
- Verify backend CORS configuration
- Test locally with `npm run build && npm start`
