# Manual Vercel Deployment Instructions

## Method 1: Vercel CLI (Recommended)
1. Run `npx vercel login` (currently in progress)
2. Run `npx vercel --prod --yes`
3. Follow the prompts

## Method 2: Drag and Drop (If CLI fails)
1. Build the project:
   ```bash
   npm run build
   ```
2. Go to Vercel dashboard
3. Click "New Project"
4. Drag and drop the entire `dist` folder
5. Add environment variables manually

## Method 3: GitHub Integration
1. Push all changes to GitHub
2. Connect Vercel to your GitHub repo
3. Trigger deployment from Vercel dashboard

## Environment Variables to Add
Copy these exactly:
```
VITE_FIREBASE_API_KEY=AIzaSyAMNC3t-fx5kv2BJy_o5_y7ESpCbIXP9fU
VITE_FIREBASE_AUTH_DOMAIN=qualitrack-cae5a.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=qualitrack-cae5a
VITE_FIREBASE_STORAGE_BUCKET=qualitrack-cae5a.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=451008916973
VITE_FIREBASE_APP_ID=1:451008916973:web:2f5475a88d061f03210be4
VITE_FIREBASE_MEASUREMENT_ID=G-ECSRZGZQJX
```

## Expected Result
After deployment, your app should work at:
https://quali-track-lemon.vercel.app
