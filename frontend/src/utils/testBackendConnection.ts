// Test Backend Connection Utility
export const testBackendConnection = async (): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> => {
  try {
    console.log('Testing backend connection...');
    
    // Test 1: Health check endpoint
    const healthResponse = await fetch('/api/health');
    console.log('Health check response status:', healthResponse.status);
    
    if (!healthResponse.ok) {
      return {
        success: false,
        message: `Backend health check failed with status: ${healthResponse.status}`,
        details: { status: healthResponse.status }
      };
    }
    
    const healthData = await healthResponse.json();
    console.log('Health check data:', healthData);
    
    // Test 2: Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      return {
        success: false,
        message: 'No authentication token found. Please log in.',
        details: { hasToken: false }
      };
    }
    
    // Test 3: Check AI status endpoint
    const aiStatusResponse = await fetch('/api/ai/status', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    console.log('AI status response status:', aiStatusResponse.status);
    
    if (!aiStatusResponse.ok) {
      const errorText = await aiStatusResponse.text();
      return {
        success: false,
        message: `AI status check failed with status: ${aiStatusResponse.status}`,
        details: { 
          status: aiStatusResponse.status, 
          error: errorText,
          hasToken: true 
        }
      };
    }
    
    const aiStatusData = await aiStatusResponse.json();
    console.log('AI status data:', aiStatusData);
    
    return {
      success: true,
      message: 'Backend connection successful',
      details: {
        health: healthData,
        aiStatus: aiStatusData,
        hasToken: true
      }
    };
    
  } catch (error) {
    console.error('Backend connection test failed:', error);
    
    let message = 'Unknown connection error';
    if (error instanceof TypeError && error.message.includes('fetch')) {
      message = 'Unable to connect to backend. Please ensure the server is running on port 5000.';
    } else if (error instanceof Error) {
      message = error.message;
    }
    
    return {
      success: false,
      message,
      details: { error: error instanceof Error ? error.message : 'Unknown error' }
    };
  }
};

// Helper function to add test button to UI (for debugging)
export const addTestButton = () => {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    const button = document.createElement('button');
    button.textContent = 'Test Backend Connection';
    button.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 9999;
      padding: 8px 12px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    `;
    
    button.onclick = async () => {
      const result = await testBackendConnection();
      alert(`Connection Test Result:\n${result.message}\n\nDetails: ${JSON.stringify(result.details, null, 2)}`);
    };
    
    document.body.appendChild(button);
  }
}; 