import React from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';  // Import CSS
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { logger } from './lib/logger';
import toast from 'react-hot-toast';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const AppWrapper = () => {
  return (
    <>
      <Toaster position="top-right" />
      <App />
    </>
  );
};

// Initialize the app after Firebase auth is ready
const initializeApp = () => {
  const root = createRoot(rootElement);
  
  // Wait for initial auth state before rendering
  const unsubscribe = onAuthStateChanged(
    auth,
    (user) => {
      logger.info(`Auth state initialized: ${user ? 'User logged in' : 'No user'}`);
      root.render(
        <React.StrictMode>
          <AppWrapper />
        </React.StrictMode>
      );
      unsubscribe();
    },
    (error) => {
      logger.error('Auth state initialization error:', error);
      toast.error('Authentication service is temporarily unavailable');
      root.render(
        <React.StrictMode>
          <AppWrapper />
        </React.StrictMode>
      );
      unsubscribe();
    }
  );
};

// Start the application
initializeApp();