# Render Environment Variables Setup

## 🚀 Quick Fix for 502 Error

Your 502 error is caused by CORS issues when trying to connect to localhost from your deployed frontend. Here's how to fix it:

### Step 1: Update Environment Variables in Render

1. **Go to your Render Dashboard**
   - Navigate to: https://dashboard.render.com
   - Select your `homewiz-frontend` service

2. **Go to Environment Tab**
   - Click on "Environment" in the left sidebar

3. **Add/Update these variables:**

```
NEXT_PUBLIC_DISABLE_BACKEND=true
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 2: Redeploy

1. **Trigger a new deployment**
   - Click "Manual Deploy" → "Deploy latest commit"
   - Or push a new commit to trigger auto-deploy

2. **Wait for deployment to complete**
   - Monitor the build logs
   - Should complete without errors

### Step 3: Verify Fix

After deployment, your site should:
- ✅ Load without 502 errors
- ✅ Show no CORS errors in browser console
- ✅ Display "Demo Mode" banner
- ✅ Forms work with demo data
- ✅ No backend connection attempts

### Expected Console Output

You should see:
```
🔧 HomeWiz Frontend Configuration Loaded
Environment: production
Demo Mode: true
API URL: http://localhost:8000/api
Backend Disabled: true
```

### Troubleshooting

**Still getting 502 errors?**
- Check Render build logs for errors
- Verify environment variables are saved correctly
- Try a fresh deployment

**Want to enable backend later?**
1. Deploy your FastAPI backend to Render/Railway
2. Update environment variables:
   ```
   NEXT_PUBLIC_DISABLE_BACKEND=false
   NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
   ```

**Local development:**
- Use `npm run dev` for local development
- Backend connection will work locally if backend is running on port 8000

## Current Status

✅ **Fixed**: Backend connection logic updated
✅ **Fixed**: CORS error handling improved  
✅ **Fixed**: Demo mode properly configured
✅ **Ready**: For deployment with backend disabled

## Next Steps

1. Update Render environment variables (above)
2. Redeploy your service
3. Test the deployed application
4. Optionally deploy backend later for full functionality
