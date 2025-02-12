import { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  signInWithPopup,
  GoogleAuthProvider,
  AuthError
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { createUserDocument } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { logger } from '../lib/logger';
import { doc, getDoc } from 'firebase/firestore';

export function useFirebaseAuth() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuthError = (error: AuthError) => {
    logger.error('Authentication error:', error);
    const message = error.code === 'auth/configuration-not-found' 
      ? 'Authentication service is temporarily unavailable. Please try again later.'
      : error.message;
    toast.error(message);
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Check if user document already exists
      const userRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Create user document in Firestore only if it doesn't exist
        await createUserDocument(userCredential.user.uid, {
          email: userCredential.user.email,
          displayName: userCredential.user.displayName,
          photoURL: userCredential.user.photoURL
        });
      }

      navigate('/dashboard');
      toast.success('Account created successfully!');
    } catch (error) {
      handleAuthError(error as AuthError);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user document exists
      const userRef = doc(db, 'users', result.user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        // Create user document for Google sign-in only if it doesn't exist
        await createUserDocument(result.user.uid, {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL
        });
      }

      navigate('/dashboard');
      toast.success('Successfully signed in with Google!');
    } catch (error) {
      handleAuthError(error as AuthError);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
      toast.success('Successfully signed in!');
    } catch (error) {
      handleAuthError(error as AuthError);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
    } catch (error) {
      handleAuthError(error as AuthError);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      logger.info('User signed out successfully');
      navigate('/');
      toast.success('Signed out successfully');
    } catch (error) {
      handleAuthError(error as AuthError);
    }
  };

  return {
    signIn,
    signUp,
    resetPassword,
    signOut,
    signInWithGoogle,
    loading
  };
}