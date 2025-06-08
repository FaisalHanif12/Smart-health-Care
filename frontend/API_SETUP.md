# API Configuration Setup

## OpenAI API Key Configuration

The application uses environment variables for secure API key management.

### Current Configuration
- API Key is loaded from environment variables
- Create a `.env` file in the `frontend` directory
- Add `VITE_OPENAI_API_KEY=your_api_key_here` to the `.env` file
- The `.env` file is automatically excluded from Git commits

### Setup Instructions

1. **Copy the template file:**
   ```bash
   cp frontend/environment.template frontend/.env
   ```

2. **Edit the .env file and add your OpenAI API key:**
   ```env
   VITE_OPENAI_API_KEY=your_actual_api_key_here
   ```

3. **The application will automatically load the API key from the environment**

### For Production Deployment

**⚠️ SECURITY WARNING**: For production deployment, you should:

1. **Move API key to backend environment variables**
2. **Use backend proxy for API calls**
3. **Never expose API keys in frontend code**

### Current Features

- ✅ Environment variable configuration
- ✅ API key management in Profile page
- ✅ Personalized prompt generation
- ✅ Diet and workout plan prompts
- ✅ Direct integration with OpenAI service
- ✅ Error handling and validation

### Usage

1. The API key is automatically loaded from environment variables
2. Users can also add their own API key via the Profile page
3. Generate personalized prompts for diet and workout plans
4. Copy prompts or use direct AI integration

### API Limits

- Supports OpenAI GPT-3.5-turbo model
- Monitor usage at: https://platform.openai.com/usage
- Consider implementing rate limiting for production use