// API Configuration
export const API_CONFIG = {
  // OpenAI API Key - Loaded from environment variables
  // Set VITE_OPENAI_API_KEY in your .env file
  // In production, this should be moved to backend for security
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
  
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