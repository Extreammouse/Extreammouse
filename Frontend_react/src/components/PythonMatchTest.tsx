import React, { useState } from 'react';

const PythonMatchTest = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    setResult('Starting test...\n');

    const url = 'https://jobapplicationprodv3-501349658960.us-central1.run.app/generate-job-output';
    
    const payload = {
      email: "ehushubham@gmail.com"
    };

    const headers = {
      'Content-Type': 'application/json'
    };

    try {
      // Log request details
      setResult(prev => prev + `\nMaking request to: ${url}\n`);
      setResult(prev => prev + `Headers: ${JSON.stringify(headers, null, 2)}\n`);
      setResult(prev => prev + `Payload: ${JSON.stringify(payload, null, 2)}\n`);

      // Make POST request - exactly matching Python's requests.post()
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
      });

      // Log response details
      setResult(prev => prev + `\nStatus Code: ${response.status}\n`);
      setResult(prev => prev + `Response Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}\n`);

      const text = await response.text();
      setResult(prev => prev + `\nResponse Body: ${text}\n`);

      // Try to parse JSON if possible
      try {
        const data = JSON.parse(text);
        setResult(prev => prev + `\nData received: ${JSON.stringify(data, null, 2)}\n`);
      } catch (e) {
        setResult(prev => prev + `\nCould not parse response as JSON`);
      }

    } catch (error) {
      if (error instanceof TypeError) {
        setResult(prev => prev + `\nError connecting: ${error.message}\n`);
      } else {
        setResult(prev => prev + `\nAn error occurred: \n`);
      }
      console.error('Error details:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="space-y-4">
        <button 
          onClick={testApi}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test API (Python Match)'}
        </button>
        <pre className="mt-4 p-4 bg-gray-100 rounded whitespace-pre-wrap text-xs font-mono">
          {result || 'Click button to test API'}
        </pre>
      </div>
    </div>
  );
};

export default PythonMatchTest;