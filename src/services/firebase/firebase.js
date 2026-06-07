import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Check if we have at least the API Key and Project ID.
// If not, we will fallback to Mock Sandbox Mode.
export const isFirebaseEnabled = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId
);

let app = null;
let auth = null;
let db = null;
let analytics = null;

if (isFirebaseEnabled) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    // Initialize Analytics only in browser environment (not SSR)
    if (typeof window !== "undefined") {
      isSupported().then((supported) => {
        if (supported) {
          analytics = getAnalytics(app);
          console.log("[Turnitin SaaS] Firebase Analytics initialized.");
        }
      });
    }

    console.log("[Turnitin SaaS] Real Firebase Initialized successfully ✓");
  } catch (error) {
    console.error("[Turnitin SaaS] Error initializing real Firebase:", error);
  }
} else {
  console.log("[Turnitin SaaS] Firebase credentials missing. Running in Mock Sandbox Mode.");
}

export { app, auth, db, analytics };
