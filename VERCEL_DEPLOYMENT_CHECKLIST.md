# Vercel Deployment Checklist

## ✅ Pre-Deployment Steps

- [ ] Push all code to GitHub repository
- [ ] Ensure `.env.local` is NOT committed (check .gitignore)
- [ ] Test application locally with production backend

## ✅ Vercel Setup

1. [ ] Go to [vercel.com](https://vercel.com) and sign in
2. [ ] Click "Add New Project"
3. [ ] Import your GitHub repository
4. [ ] Configure build settings (should auto-detect Next.js)

## ✅ Environment Variables to Add in Vercel

Copy these exactly as shown:

```bash
NEXT_PUBLIC_API_URL=https://homewiz-backend-335786120771.us-west2.run.app
NEXT_PUBLIC_BACKEND_API_URL=https://homewiz-backend-335786120771.us-west2.run.app
NEXT_PUBLIC_BACKEND_WS_URL=wss://homewiz-backend-335786120771.us-west2.run.app/ws/chat
NEXT_PUBLIC_DISABLE_BACKEND=false
NEXT_PUBLIC_ENABLE_AI_MOCK=false
NEXT_PUBLIC_USE_SUPABASE_AI=false
NEXT_PUBLIC_USE_BACKEND_AI=true
NEXT_PUBLIC_SUPABASE_URL=https://ushsurulbffbbqkyfynd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzaHN1cnVsYmZmYmJxa3lmeW5kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMzE2MDMsImV4cCI6MjA2NTgwNzYwM30.ITybGpihJbJHppQIbq2O3CF6VSJwoH8-KsuA2hhsi4s
NEXT_PUBLIC_ENABLE_WEBSOCKET=false
NEXT_PUBLIC_ENABLE_STREAMING=false
NEXT_PUBLIC_ENABLE_RECONNECT=false
NEXT_PUBLIC_ENABLE_SUPABASE_DIRECT=true
NEXT_PUBLIC_APP_NAME=HomeWiz
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_LOG_LEVEL=info
```

Optional (if you have Gemini API key for production):
```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_production_gemini_key
```

## ✅ Backend Requirements

**IMPORTANT**: The backend needs to be configured to accept requests from your Vercel domain.

### Backend CORS Configuration Needed:
The backend at `https://homewiz-backend-335786120771.us-west2.run.app` needs to allow:
- Your Vercel production domain (e.g., `https://your-app.vercel.app`)
- Vercel preview domains (`https://*.vercel.app`)

### Backend Changes Required:
1. **CORS Update** - Add Vercel domains to allowed origins
2. **Room Search Function** - Ensure `unified_room_search_function` includes building data in response

## ✅ Post-Deployment Testing

- [ ] Visit your Vercel URL
- [ ] Test chat functionality - ask "show me available rooms"
- [ ] Verify room cards display (building names won't show until backend is updated)
- [ ] Test form submissions
- [ ] Check browser console for any errors
- [ ] Verify images load correctly

## ⚠️ Common Issues

### CORS Errors
- **Symptom**: "CORS policy" errors in browser console
- **Solution**: Backend needs to whitelist your Vercel domain

### Building Names Not Showing
- **Symptom**: Room cards display but no building names
- **Solution**: Backend's `unified_room_search_function` needs to include building data

### Environment Variables Not Working
- **Symptom**: App uses localhost instead of production backend
- **Solution**: Redeploy after setting environment variables in Vercel

## 🎯 Success Criteria

Your deployment is successful when:
- ✅ Chat interface loads and responds to queries
- ✅ Forms can be submitted
- ✅ No console errors
- ✅ Backend API calls succeed
- ⏳ Building names show on room cards (pending backend update)