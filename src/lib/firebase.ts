import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc,
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  updateDoc,
  writeBatch,
  getDocFromServer
} from "firebase/firestore";

// Read coordinates from the config file or default config
const firebaseConfig = {
  apiKey: "AIzaSyD_3GOes0ny4zcZat-0WS4sCFpUGa6FQc8",
  authDomain: "continual-palace-8f4nj.firebaseapp.com",
  projectId: "continual-palace-8f4nj",
  storageBucket: "continual-palace-8f4nj.firebasestorage.app",
  messagingSenderId: "935533075869",
  appId: "1:935533075869:web:6b90cb7ea8f0b2c2c72374"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, "ai-studio-47eed919-8733-47b3-8106-629efa395ca6");
const googleProvider = new GoogleAuthProvider();

// Standard connection check
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn("Firebase client appears to be offline. Local persistence will be used as a backup.");
    }
  }
}
testConnection();

export { 
  app, 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  updateDoc,
  writeBatch
};
export type { User };
