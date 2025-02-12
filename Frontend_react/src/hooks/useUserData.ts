import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './useAuth';
import { logger } from '../lib/logger';

export interface UserData {
  emailgencount: number;
  trialCount: number;
  email: string;
  resumes?: {
    fileContent: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    uploadedAt: string;
  };
}

export function useUserData() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUserData() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Check if user document exists in 'user' collection
        const userRef = doc(db, 'user', user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          logger.warn(`No document found for user: ${user.uid}`);
          setError(new Error('User document not found'));
          setLoading(false);
          return;
        }

        // Log successful data fetch
        logger.info(`Successfully fetched data for user: ${user.uid}`);
        setUserData(userDoc.data() as UserData);
        setError(null);
      } catch (error) {
        logger.error('Error fetching user data:', error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [user]);

  return { userData, loading, error };
}