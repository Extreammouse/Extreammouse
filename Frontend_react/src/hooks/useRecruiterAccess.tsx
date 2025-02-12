// hooks/useRecruiterAccess.ts
import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

interface AccessStatus {
  isAuthorized: boolean;
  message: string;
  loading: boolean;
}

export const useRecruiterAccess = () => {
  const [accessStatus, setAccessStatus] = useState<AccessStatus>({
    isAuthorized: false,
    message: '',
    loading: true
  });

  useEffect(() => {
    const validateAccess = async () => {
      const auth = getAuth();
      const db = getFirestore();
      
      try {
        const user = auth.currentUser;
        if (!user) {
          setAccessStatus({
            isAuthorized: false,
            message: 'Please sign in to access recruiter features',
            loading: false
          });
          return;
        }

        const userDoc = await getDoc(doc(db, 'user', user.uid));
        if (!userDoc.exists()) {
          setAccessStatus({
            isAuthorized: false,
            message: 'User profile not found',
            loading: false
          });
          return;
        }

        const userData = userDoc.data();
        const userRole = userData?.role || 'student';
        const approvalStatus = userData?.approvalStatus || 'pending';
        const domain = userData?.domain || '';

        // Add your approved domains here
        const approvedDomains = ['quicksend.com'];

        if (userRole !== 'recruiter') {
          setAccessStatus({
            isAuthorized: false,
            message: 'This feature is only available to recruiter accounts',
            loading: false
          });
          return;
        }

        if (approvalStatus !== 'approved') {
          setAccessStatus({
            isAuthorized: false,
            message: 'Your recruiter account is pending approval',
            loading: false
          });
          return;
        }

        if (!approvedDomains.includes(domain.toLowerCase())) {
          setAccessStatus({
            isAuthorized: false,
            message: 'Please use an approved company email domain',
            loading: false
          });
          return;
        }

        setAccessStatus({
          isAuthorized: true,
          message: '',
          loading: false
        });

      } catch (error) {
        console.error('Error validating recruiter access:', error);
        setAccessStatus({
          isAuthorized: false,
          message: 'An error occurred while checking access',
          loading: false
        });
      }
    };

    validateAccess();
  }, []);

  return accessStatus;
};