// API Configuration
export const API_CONFIG = {
  // OpenAI API Key - In production, this should be stored securely on the backend
  // For development, you can set this directly or use environment variables
  OPENAI_API_KEY: '',
  
  // Backend API URL
  BACKEND_URL: 'http://localhost:5000',
  
  // OpenAI API settings
  OPENAI: {
    MODEL: 'gpt-3.5-turbo',
    MAX_TOKENS: 2000,
    TEMPERATURE: 0.7,
  }
};

// Helper function to check if OpenAI API key is configured
export const isOpenAIConfigured = (): boolean => {
  return !!API_CONFIG.OPENAI_API_KEY;
};

// Helper function to get API key from localStorage (fallback)
export const getOpenAIKey = (): string => {
  return API_CONFIG.OPENAI_API_KEY || localStorage.getItem('openai_api_key') || '';
};

// Helper function to set API key in localStorage
export const setOpenAIKey = (apiKey: string): void => {
  localStorage.setItem('openai_api_key', apiKey);
}; 