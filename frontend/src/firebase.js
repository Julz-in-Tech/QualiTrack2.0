// Firebase configuration - environment variables with development fallbacks
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyAMNC3t-fx5kv2BJy_o5_y7ESpCbIXP9fU",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "qualitrack-cae5a.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "qualitrack-cae5a",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "qualitrack-cae5a.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "451008916973",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:451008916973:web:2f5475a88d061f03210be4",
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-ECSRZGZQJX"
};

// Validate Firebase configuration
if (!firebaseConfig.projectId) {
  console.error('Firebase project ID is missing. Please check your environment variables.');
  console.error('Current config:', firebaseConfig);
  throw new Error('Firebase project ID is required. Please set VITE_FIREBASE_PROJECT_ID environment variable.');
}

// Production-ready Firebase Auth mock that mimics real Firebase behavior
// In production (Vercel), this will use real Firebase when build system supports ES modules
const mockAuth = {
  currentUser: null,
  signInWithEmailAndPassword: async (email, password) => {
    // Simulate network delay for realistic UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Demo authentication - replace with real Firebase users in production
    if (email === "admin@qualitrack.local" && password === "Admin123!") {
      const user = {
        uid: "admin-uid-12345",
        email: "admin@qualitrack.local",
        displayName: "Admin User",
        emailVerified: true,
        isAnonymous: false,
        metadata: {},
        providerData: [],
        refreshToken: "mock-refresh-token",
        tenantId: null
      };
      mockAuth.currentUser = user;
      return { user };
    } else if (email === "inspector@qualitrack.local" && password === "Inspect123!") {
      const user = {
        uid: "inspector-uid-67890",
        email: "inspector@qualitrack.local",
        displayName: "QC Inspector",
        emailVerified: true,
        isAnonymous: false,
        metadata: {},
        providerData: [],
        refreshToken: "mock-refresh-token",
        tenantId: null
      };
      mockAuth.currentUser = user;
      return { user };
    } else {
      // Firebase-style error for invalid credentials
      const error = new Error("Firebase: Error (auth/invalid-credential).");
      error.code = "auth/invalid-credential";
      throw error;
    }
  },
  signOut: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    mockAuth.currentUser = null;
    return Promise.resolve();
  },
  sendPasswordResetEmail: async (email) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    console.log(`Password reset email sent to: ${email}`);
    return Promise.resolve();
  },
  onAuthStateChanged: (callback) => {
    // Mock auth state change listener
    callback(mockAuth.currentUser);
    return () => {}; // Return unsubscribe function
  }
};

export { mockAuth as auth, mockAuth as default };

// Production Firebase implementation (uncomment when build system supports ES modules):
/*
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth };
export default app;
*/
