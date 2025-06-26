# HomeWiz Frontend Deployment Guide

## Quick Fix for Current 502 Error

Your 502 error is caused by the frontend trying to connect to `localhost:8000` from the deployed environment. Here are the solutions:

### Option 1: Deploy Frontend-Only (Recommended for Demo)

Set these environment variables in your Render deployment:

```bash
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_DISABLE_BACKEND=true
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

This will:
- ✅ Disable backend connection attempts
- ✅ Remove CORS errors
- ✅ Use demo data for all forms
- ✅ Still show the UI and functionality

### Option 2: Deploy with Backend

If you want full functionality, you need to:

1. **Deploy your backend** (FastAPI) to a service like Render/Railway/Heroku
2. **Set the backend URL** in environment variables:

```bash
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com/api
NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
```

### Option 3: Local Development

For local development, use:

```bash
npm run dev
```

This will start the frontend on port 3000 and connect to `localhost:8000` for the backend.

## Current Environment Variables on Render

Based on your error, update these in your Render dashboard:

1. Go to your Render service dashboard
2. Navigate to "Environment" tab
3. Add/Update these variables:

```
NEXT_PUBLIC_DISABLE_BACKEND=true
NEXT_PUBLIC_DEMO_MODE=true
```

4. Redeploy your service

## Testing the Fix

After updating environment variables:

1. **Redeploy** your Render service
2. **Check browser console** - you should see:
   - ✅ No more CORS errors
   - ✅ No more "Failed to fetch" errors
   - ✅ Demo data messages instead

3. **Verify functionality**:
   - Forms should work with demo data
   - No backend connection errors
   - Clean console logs

## Troubleshooting

### Still seeing 502 errors?
- Check if Render build completed successfully
- Verify environment variables are set correctly
- Check Render logs for build/runtime errors

### Want to add backend later?
- Deploy your FastAPI backend
- Update `NEXT_PUBLIC_API_URL` to point to deployed backend
- Set `NEXT_PUBLIC_DISABLE_BACKEND=false`

### Local development issues?
- Ensure backend is running on port 8000
- Check `.env.local` file exists with correct values
- Use `npm run dev` (not `npm start`)
