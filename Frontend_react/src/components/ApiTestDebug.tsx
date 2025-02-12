import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUserData } from '../hooks/useUserData';

const ApiTestDebug = () => {
  const { user } = useAuth();
  const { userData } = useUserData();
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testEndpoint = async () => {
    if (!user?.email) {
      setResult('No authenticated user found. Please sign in first.');
      return;
    }

    setLoading(true);
    setResult(`Starting test with authenticated user email: ${user.email}\n`);

    try {
      const baseUrl = 'https://jobapplicationprodv3-501349658960.us-central1.run.app';
      const endpoint = '/generate-job-output';
      const fullUrl = `${baseUrl}${endpoint}`;
      
      setResult(prev => prev + `\nTesting ${fullUrl}...\n`);
      
      // Log user context
      setResult(prev => prev + `\nUser Context:\n${JSON.stringify({
        uid: user.uid,
        email: user.email,
        userData: userData
      }, null, 2)}\n`);

      // Try OPTIONS first
      const optionsResponse = await fetch(fullUrl, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });

      setResult(prev => prev + `\nOPTIONS Response:\nStatus: ${optionsResponse.status}\nHeaders: ${JSON.stringify(Object.fromEntries(optionsResponse.headers.entries()), null, 2)}\n`);

      // Prepare request payload
      const payload = {
        email: user.email,
        jobDescription: 'Software Engineer position with focus on full-stack development',
        company: 'microsoft.com',
        jobPosition: 'Software Engineer',
        userId: user.uid
      };

      setResult(prev => prev + `\nRequest Payload:\n${JSON.stringify(payload, null, 2)}\n`);

      // Make POST request
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = responseText;
      }

      setResult(prev => prev + `\nPOST Response:\nStatus: ${response.status}\nHeaders: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}\nBody: ${JSON.stringify(responseData, null, 2)}\n`);

    } catch (error) {
      setResult(prev => prev + `\nError:\n`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button 
          onClick={testEndpoint}
          disabled={loading || !user?.email}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test API with Auth'}
        </button>
        {!user?.email && (
          <span className="text-red-500">Please sign in first</span>
        )}
      </div>
      <pre className="p-4 bg-gray-100 rounded whitespace-pre-wrap text-xs font-mono">
        {result || 'Click button to test API'}
      </pre>
    </div>
  );
};

export default ApiTestDebug;