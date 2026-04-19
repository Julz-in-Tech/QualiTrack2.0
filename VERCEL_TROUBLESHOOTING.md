# Vercel Deployment Troubleshooting Guide

## Current Issue
Your Vercel deployment at `quali-track-lemon.vercel.app` is still returning 404 errors despite configuration changes.

## Step-by-Step Debugging Process

### 1. Check Your Current Vercel Settings

Go to your Vercel project dashboard and verify:

#### Build & Development Settings
- **Build Command**: Should be `npm run build`
- **Output Directory**: Should be `dist`
- **Install Command**: Should be `npm install`
- **Framework**: Should be "Other" or null

#### Environment Variables
Make sure ALL these are set:
```
VITE_FIREBASE_API_KEY=AIzaSyAMNC3t-fx5kv2BJy_o5_y7ESpCbIXP9fU
VITE_FIREBASE_AUTH_DOMAIN=qualitrack-cae5a.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=qualitrack-cae5a
VITE_FIREBASE_STORAGE_BUCKET=qualitrack-cae5a.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=451008916973
VITE_FIREBASE_APP_ID=1:451008916973:web:2f5475a88d061f03210be4
VITE_FIREBASE_MEASUREMENT_ID=G-ECSRZGZQJX
```

### 2. Alternative Deployment Methods

#### Method A: Manual Vercel CLI Deployment
```bash
# In your frontend directory
npx vercel --prod
```

#### Method B: GitHub Integration (if using Git)
1. Push all changes to your repository
2. Ensure Vercel is connected to your GitHub repo
3. Trigger a new deployment

#### Method C: Drag and Drop
1. Run `npm run build` locally
2. Zip the entire `dist` folder
3. Upload to Vercel dashboard

### 3. Check Build Logs

In Vercel dashboard:
1. Go to **Deployments** tab
2. Click on your latest deployment
3. Look for any error messages in the build log
4. Check if `dist/index.html` was created successfully

### 4. File Structure Verification

After build, your `dist` folder should contain:
```
dist/
  index.html
  assets/
    app.css
    app.js
```

### 5. Test Different vercel.json Configurations

#### Option 1: Minimal Configuration
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ]
}
```

#### Option 2: No vercel.json (Delete the file)
Sometimes Vercel's automatic detection works better without custom configuration.

#### Option 3: Explicit Routes
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/assets/(.*)",
      "dest": "/assets/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### 6. Common Issues and Solutions

#### Issue: "No such file or directory: dist/index.html"
**Solution**: Check build logs, ensure build command completes successfully

#### Issue: Assets returning 404
**Solution**: Verify paths in index.html use relative paths (`./assets/` not `/assets/`)

#### Issue: Environment variables not working
**Solution**: Ensure variables are set in Vercel dashboard, not just locally

#### Issue: Build process failing
**Solution**: Check Node.js version compatibility in Vercel settings

### 7. Quick Test - Deploy Static Files Only

If all else fails, try this minimal approach:

1. Build locally: `npm run build`
2. Create a simple test in `dist/index.html`:
```html
<!DOCTYPE html>
<html>
<head>
    <title>Test</title>
</head>
<body>
    <h1>Hello World</h1>
</body>
</html>
```
3. Deploy just the `dist` folder to verify basic Vercel functionality

### 8. Contact Vercel Support

If none of these work:
- Check Vercel status page for any outages
- Contact Vercel support with your build logs
- Check if there are any account/project limitations

## Next Steps

1. Try Method A (CLI deployment) first
2. Check build logs for specific errors
3. Verify environment variables are set correctly
4. Test with minimal configuration
5. If still failing, try the manual drag-and-drop method

## Expected Result

After fixing, you should see:
- Main page loads at `https://quali-track-lemon.vercel.app`
- No 404 errors
- Authentication works with demo accounts
- All assets load properly
