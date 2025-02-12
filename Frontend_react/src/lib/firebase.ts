import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { logger } from './logger';

const firebaseConfig = {
  apiKey: "AIzaSyCNYsaBTqnFqD2y1Z0RX3BCc5hLqoX959c",
  authDomain: "mailup-5723e.firebaseapp.com",
  projectId: "mailup-5723e",
  storageBucket: "mailup-5723e.firebasestorage.app",
  messagingSenderId: "501349658960",
  appId: "1:501349658960:web:5cd7e317a02658804d3c55",
  measurementId: "G-L7Z344DTWM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Function to create user document
export async function createUserDocument(userId: string, userData: any) {
  try {
    const userRef = doc(db, 'user', userId);
    
    // Create new user document with initial values
    const newUserData = {
      email: userData.email,
      emailgencount: 2, // Free trial
      trialCount: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      plan: 'free',
      displayName: userData.displayName || null,
      searchcount: 5,
      approvalStatus: "pending",
      resumes: {}
    };

    // Set the document with merge option to avoid overwriting existing data
    await setDoc(userRef, newUserData, { merge: true });
    logger.info(`Created user document for: ${userId}`);
    return true;
  } catch (error) {
    logger.error('Error creating user document:', error);
    throw error;
  }
}

export { app, auth, db };