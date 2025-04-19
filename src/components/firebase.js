// Import the required Firebase functions
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 
import { getStorage } from "firebase/storage"; 

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAao2zF5EpQZtC6gDVsWA39Z4o0FlPvKWo",
  authDomain: "project-3rdyear.firebaseapp.com",
  projectId: "project-3rdyear",
  storageBucket: "project-3rdyear.appspot.com",
  messagingSenderId: "1051586925241",
  appId: "1:1051586925241:web:5ad944d877fa521fe50168",
  measurementId: "G-2Y0HMHV79R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Analytics only if in client-side and measurementId exists
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  getAnalytics(app);
}

// Export instances for use in other files
export { app, auth, db, storage };