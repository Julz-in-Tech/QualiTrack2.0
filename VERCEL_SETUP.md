# Vercel Environment Variables for Firebase Authentication

## Required Environment Variables

Add these environment variables in your Vercel project dashboard under **Settings > Environment Variables**:

### Firebase Configuration Variables

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `VITE_FIREBASE_API_KEY` | `AIzaSyAMNC3t-fx5kv2BJy_o5_y7ESpCbIXP9fU` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `qualitrack-cae5a.firebaseapp.com` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | `qualitrack-cae5a` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `qualitrack-cae5a.firebasestorage.app` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `451008916973` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | `1:451008916973:web:2f5475a88d061f03210be4` | Firebase app ID |
| `VITE_FIREBASE_MEASUREMENT_ID` | `G-ECSRZGZQJX` | Google Analytics measurement ID |

## Step-by-Step Setup

### 1. Go to Vercel Dashboard
- Navigate to your Vercel project
- Go to **Settings** tab
- Click on **Environment Variables**

### 2. Add Environment Variables
For each variable above:
1. Click **Add New**
2. Enter the **Variable Name** (exactly as shown)
3. Enter the **Value** 
4. Select **Production**, **Preview**, and **Development** environments
5. Click **Save**

### 3. Redeploy Your Application
After adding all environment variables:
- Go to **Deployments** tab
- Click **...** menu on your latest deployment
- Select **Redeploy**

## Firebase Console Setup

### Enable Email/Password Authentication
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `qualitrack-cae5a`
3. Go to **Authentication** > **Sign-in method**
4. Enable **Email/Password** provider
5. Click **Save**

### Create Demo Users
In Firebase Authentication > **Users** tab:
1. Click **Add user**
2. Add these users:

#### Admin User
- **Email**: `admin@qualitrack.local`
- **Password**: `Admin123!`
- **Email verified**: Checked

#### QC Inspector User  
- **Email**: `inspector@qualitrack.local`
- **Password**: `Inspect123!`
- **Email verified**: Checked

## Security Notes

### API Key Security
- The Firebase API key is public by design
- Security is enforced through Firebase Security Rules
- Never enable anonymous authentication in production

### Domain Restrictions
In Firebase Console > Authentication > **Settings**:
1. Add your Vercel domain to **Authorized domains**
2. Add `localhost` for development
3. Add your production URL (e.g., `your-app.vercel.app`)

## Testing After Deployment

1. Visit your deployed Vercel application
2. Try logging in with demo accounts:
   - Admin: `admin@qualitrack.local` / `Admin123!`
   - Inspector: `inspector@qualitrack.local` / `Inspect123!`
3. Verify authentication works correctly

## Troubleshooting

### Common Issues
- **"auth/config-not-found"**: Check environment variables are correctly set
- **"auth/invalid-api-key"**: Verify API key matches your Firebase project
- **CORS errors**: Add your Vercel domain to Firebase authorized domains

### Debug Steps
1. Check Vercel deployment logs for environment variable loading
2. Verify Firebase project settings
3. Test with incognito browser window
4. Check browser console for Firebase error messages

## Next Steps

Once authentication is working:
1. Consider adding Google Sign-in provider
2. Set up Firebase Security Rules for data access
3. Configure Firebase Analytics for user tracking
4. Add email verification for new users

## Support

If you encounter issues:
- Check Vercel deployment logs
- Verify Firebase Console settings
- Ensure all environment variables are set correctly
- Test with different browsers/devices
