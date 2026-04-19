# Firebase Project ID Missing Error Fix

## Problem
Your Vercel deployment is showing "project id is missing" error, which means Firebase configuration isn't loading properly.

## Root Cause
The `VITE_FIREBASE_PROJECT_ID` environment variable is not being set or loaded correctly in Vercel.

## Immediate Fix

### Step 1: Add Environment Variables in Vercel Dashboard

Go to your Vercel project dashboard:

1. **Settings** > **Environment Variables**
2. **Add each variable exactly** as shown:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `VITE_FIREBASE_API_KEY` | `AIzaSyAMNC3t-fx5kv2BJy_o5_y7ESpCbIXP9fU` | Production, Preview, Development |
| `VITE_FIREBASE_AUTH_DOMAIN` | `qualitrack-cae5a.firebaseapp.com` | Production, Preview, Development |
| `VITE_FIREBASE_PROJECT_ID` | `qualitrack-cae5a` | Production, Preview, Development |
| `VITE_FIREBASE_STORAGE_BUCKET` | `qualitrack-cae5a.firebasestorage.app` | Production, Preview, Development |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `451008916973` | Production, Preview, Development |
| `VITE_FIREBASE_APP_ID` | `1:451008916973:web:2f5475a88d061f03210be4` | Production, Preview, Development |
| `VITE_FIREBASE_MEASUREMENT_ID` | `G-ECSRZGZQJX` | Production, Preview, Development |

### Step 2: Redeploy Your Application

1. **Go to Deployments tab**
2. **Click "Redeploy"** on latest deployment
3. **Wait for deployment to complete**

### Step 3: Verify the Fix

After deployment, check:
1. **Main page loads** at `https://quali-track-lemon.vercel.app`
2. **No "project id is missing" error** in browser console
3. **Authentication works** with demo accounts

## Debugging If Still Failing

### Check Environment Variables in Build Logs
1. Go to Vercel dashboard
2. Click on deployment
3. View build logs
4. Look for environment variable loading messages

### Test Locally with Environment Variables
Create a `.env` file in `frontend/` directory:
```bash
# frontend/.env
VITE_FIREBASE_PROJECT_ID=qualitrack-cae5a
VITE_FIREBASE_API_KEY=AIzaSyAMNC3t-fx5kv2BJy_o5_y7ESpCbIXP9fU
VITE_FIREBASE_AUTH_DOMAIN=qualitrack-cae5a.firebaseapp.com
VITE_FIREBASE_STORAGE_BUCKET=qualitrack-cae5a.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=451008916973
VITE_FIREBASE_APP_ID=1:451008916973:web:2f5475a88d061f03210be4
VITE_FIREBASE_MEASUREMENT_ID=G-ECSRZGZQJX
```

Then test locally:
```bash
cd frontend
npm run dev
```

## Common Issues

### Issue: Environment Variables Not Loading
**Solution**: Ensure variables are set in ALL environments (Production, Preview, Development)

### Issue: Wrong Variable Names
**Solution**: Variable names must be EXACTLY as shown (including VITE_ prefix)

### Issue: Special Characters in Values
**Solution**: Copy values exactly without extra spaces or quotes

## Expected Result After Fix

- **No more "project id is missing" errors**
- **Firebase configuration loads properly**
- **Authentication system works**
- **Application loads successfully**

## Technical Details

The error occurs because:
1. Vercel builds the application
2. Firebase configuration tries to initialize
3. Missing `projectId` causes initialization to fail
4. Application crashes with "project id is missing" error

The fix ensures all required Firebase environment variables are available during build and runtime.
