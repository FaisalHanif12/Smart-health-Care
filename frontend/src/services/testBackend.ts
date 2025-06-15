// Simple test to verify backend connectivity
export const testBackendConnection = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/health');
    const data = await response.json();
    console.log('Backend connection test:', data);
    return data;
  } catch (error) {
    console.error('Backend connection failed:', error);
    throw error;
  }
};

export const testAIStatus = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch('http://localhost:5000/api/ai/status', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log('AI status test:', data);
    return data;
  } catch (error) {
    console.error('AI status test failed:', error);
    throw error;
  }
}; 