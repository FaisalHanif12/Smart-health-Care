// API Configuration
export const API_CONFIG = {
  // OpenAI API Key - Loaded from environment variables
  // Set VITE_OPENAI_API_KEY in your .env file
  // In production, this should be moved to backend for security
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
  
  // Backend API URL - Use relative path to leverage Vite proxy
  BACKEND_URL: '',
  
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

// Helper function to get API key with multiple fallbacks
export const getOpenAIKey = (): string => {
  // Priority: 1. Environment variable, 2. localStorage, 3. empty string
  const envKey = API_CONFIG.OPENAI_API_KEY;
  const localKey = localStorage.getItem('openai_api_key');
  
  if (envKey && envKey.trim()) {
    return envKey.trim();
  }
  
  if (localKey && localKey.trim()) {
    return localKey.trim();
  }
  
  return '';
};

// Helper function to validate API key format
export const isValidOpenAIKey = (apiKey: string): boolean => {
  return apiKey.startsWith('sk-') && apiKey.length > 20;
};

// Helper function to set API key in localStorage
export const setOpenAIKey = (apiKey: string): void => {
  localStorage.setItem('openai_api_key', apiKey);
}; 