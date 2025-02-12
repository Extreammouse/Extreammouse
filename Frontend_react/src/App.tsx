import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import IntroPage from './pages/IntroPage';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import WriteToRecruiter from './pages/WriteToRecruiter';
import WriteCoverLetter from './pages/WriteCoverLetter';
import Pricing from './pages/Pricing';
import Settings from './pages/Settings';
import ResumeSearch from './pages/ResumeSearch';
import ApiTestPage from './pages/ApiTestPage';
import ProtectedRoute from './components/ProtectedRoute';
import EmailHistoryPage from './pages/EmailHistoryPage';
import CoverLetterHistoryPage from './pages/CoverLetterHistoryPage'
function App() {
  return (
    <Router>
      <Toaster position="top-center" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<IntroPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/pricing" element={<Pricing />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/write-to-recruiter"
          element={
            <ProtectedRoute>
              <WriteToRecruiter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/write-cover-letter"
          element={
            <ProtectedRoute>
              <WriteCoverLetter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resume-search"
          element={
            <ProtectedRoute>
              <ResumeSearch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/email-history"
          element={
            <ProtectedRoute>
              <EmailHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route 
          path="/cover-letter-history" 
          element={
            <ProtectedRoute>
              <CoverLetterHistoryPage />
            </ProtectedRoute>
          } 
        />
        <Route
          path="/api-test"
          element={
            <ProtectedRoute>
              <ApiTestPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;