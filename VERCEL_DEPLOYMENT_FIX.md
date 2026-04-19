# Fix Vercel 404 Error - QualiTrack Deployment

## Issue
Your Vercel deployment at `quali-track-lemon.vercel.app` is returning a 404 error because Vercel isn't properly configured to serve the static frontend files.

## Solution Steps

### 1. Update Your Vercel Project Configuration

#### Option A: Using the vercel.json file (Recommended)
I've created a `vercel.json` file in your frontend directory with the correct configuration. Make sure this file is deployed to Vercel.

#### Option B: Manual Vercel Dashboard Configuration
1. Go to your Vercel project dashboard
2. Go to **Settings** > **Build & Development Settings**
3. **Build Command**: `npm run vercel-build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

### 2. Add Environment Variables
Add these Firebase environment variables in Vercel dashboard:

| Variable | Value |
|----------|-------|
| `VITE_FIREBASE_API_KEY` | `AIzaSyAMNC3t-fx5kv2BJy_o5_y7ESpCbIXP9fU` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `qualitrack-cae5a.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `qualitrack-cae5a` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `qualitrack-cae5a.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `451008916973` |
| `VITE_FIREBASE_APP_ID` | `1:451008916973:web:2f5475a88d061f03210be4` |
| `VITE_FIREBASE_MEASUREMENT_ID` | `G-ECSRZGZQJX` |

### 3. Redeploy Your Application

#### Method A: Through Vercel Dashboard
1. Go to **Deployments** tab
2. Click **...** on your latest deployment
3. Select **Redeploy**

#### Method B: Using Vercel CLI
```bash
npx vercel --prod
```

#### Method C: Push Updated Code
1. Commit the new `vercel.json` and updated `package.json`
2. Push to your repository
3. Vercel will automatically redeploy

## What the Fix Does

### vercel.json Configuration
- **Build Configuration**: Tells Vercel how to build your project
- **Routes**: Ensures all routes serve `index.html` (SPA routing)
- **Static Assets**: Properly serves CSS and JS files from `/assets/`

### Build Script
- **vercel-build**: Custom build script for Vercel deployment
- **Output Directory**: `dist` folder where built files are stored

## Troubleshooting

### If Still Getting 404 Error

1. **Check Build Logs**: Go to Vercel dashboard > Deployments > View build logs
2. **Verify File Structure**: Ensure `dist/index.html` exists after build
3. **Check Environment Variables**: Ensure all Firebase variables are set
4. **Clear Cache**: In Vercel dashboard, clear build cache and redeploy

### Common Issues

#### Issue: "No such file or directory: dist/index.html"
**Fix**: Ensure build command is `npm run vercel-build` and output directory is `dist`

#### Issue: Firebase authentication not working
**Fix**: Verify all environment variables are correctly set in Vercel dashboard

#### Issue: Assets not loading (CSS/JS 404s)
**Fix**: The `vercel.json` routes configuration should handle this

## Expected Result

After deployment:
- Your app should load at `https://quali-track-lemon.vercel.app`
- Authentication should work with demo accounts
- All static assets should load properly
- No 404 errors for the main page

## Testing After Deployment

1. Visit `https://quali-track-lemon.vercel.app`
2. Try logging in with:
   - Admin: `admin@qualitrack.local` / `Admin123!`
   - Inspector: `inspector@qualitrack.local` / `Inspect123!`
3. Check browser console for any errors
4. Verify all CSS and JS files load correctly

## Next Steps

Once deployed successfully:
1. Add your Vercel domain to Firebase authorized domains
2. Test authentication flow
3. Monitor Vercel analytics for any issues
4. Consider setting up custom domain if needed
