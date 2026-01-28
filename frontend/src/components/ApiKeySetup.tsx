import { useState } from 'react';
import { setOpenAIKey, isValidOpenAIKey } from '../config/api';

interface ApiKeySetupProps {
  onKeySet: () => void;
}

export default function ApiKeySetup({ onKeySet }: ApiKeySetupProps) {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!apiKey.trim()) {
      setError('Please enter your OpenAI API key');
      setIsLoading(false);
      return;
    }

    if (!isValidOpenAIKey(apiKey.trim())) {
      setError('Invalid API key format. OpenAI keys start with "sk-" and are longer than 20 characters.');
      setIsLoading(false);
      return;
    }

    try {
      // Save to localStorage as fallback
      setOpenAIKey(apiKey.trim());
      
      // Test the API key with a simple request
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Invalid API key or network error');
      }

      onKeySet();
    } catch (error) {
      setError('Failed to validate API key. Please check your key and internet connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <div className="mx-auto w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3a1 1 0 011-1h2.586l6.414-6.414a6 6 0 015.743-7.743z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Setup OpenAI API Key</h2>
        <p className="text-sm text-gray-600 mt-2">
          Enter your OpenAI API key to enable AI-powered diet and workout plan generation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
            OpenAI API Key
          </label>
          <input
            type="password"
            id="apiKey"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Validating...' : 'Save API Key'}
        </button>
      </form>

      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">How to get your API key:</h3>
        <ol className="text-xs text-gray-600 space-y-1">
          <li>1. Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">OpenAI Platform</a></li>
          <li>2. Sign in to your account</li>
          <li>3. Click "Create new secret key"</li>
          <li>4. Copy and paste the key here</li>
        </ol>
        <p className="text-xs text-gray-500 mt-2">
          <strong>Note:</strong> For better security, create a .env file in the frontend folder with VITE_OPENAI_API_KEY=your_key_here
        </p>
      </div>
    </div>
  );
} 