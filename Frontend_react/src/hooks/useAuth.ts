import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { logger } from '../lib/logger';
import toast from 'react-hot-toast';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        setLoading(false);
        logger.info(`Auth state changed: ${user ? 'User logged in' : 'No user'}`);
      },
      (error) => {
        setError(error);
        setLoading(false);
        logger.error('Auth state change error:', error);
        toast.error('Authentication error occurred. Please try again.');
      }
    );

    // Handle potential Firebase initialization errors
    if (!auth) {
      setLoading(false);
      setError(new Error('Firebase authentication not initialized'));
      toast.error('Unable to initialize authentication. Please refresh the page.');
    }

    return () => {
      unsubscribe();
      logger.info('Auth state listener cleaned up');
    };
  }, []);

  return { user, loading, error };
}