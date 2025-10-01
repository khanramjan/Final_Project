import { useEffect, useState } from 'react';

const ApiTest = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      console.log('Making fetch request to http://localhost:5000/api/campaign/public');
      const response = await fetch('http://localhost:5000/api/campaign/public');
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setResult(`Error: ${response.status} - ${errorText}`);
        return;
      }
      
      const data = await response.json();
      console.log('Response data:', data);
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Fetch error:', error);
      setResult(`Fetch Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAPI();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>API Test</h1>
      <button onClick={testAPI} disabled={loading}>
        {loading ? 'Testing...' : 'Test API'}
      </button>
      <pre style={{ 
        background: '#f5f5f5', 
        padding: '10px', 
        borderRadius: '5px',
        marginTop: '20px',
        whiteSpace: 'pre-wrap'
      }}>
        {result}
      </pre>
    </div>
  );
};

export default ApiTest;