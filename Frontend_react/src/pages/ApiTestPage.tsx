import React from 'react';
import ApiTestDebug from '../components/ApiTestDebug';

const ApiTestPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">API Testing Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Endpoint Testing</h2>
          <ApiTestDebug />
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Current Environment</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm">
            {JSON.stringify({
              nodeEnv: process.env.NODE_ENV,
              baseUrl: window.location.origin,
              apiUrl: ''
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ApiTestPage;
