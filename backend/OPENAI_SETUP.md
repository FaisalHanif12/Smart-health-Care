# OpenAI API Setup for Backend

## Overview
The backend now handles all OpenAI API calls for security and better control. You need to add your OpenAI API key to the backend environment variables.

## Setup Instructions

### Step 1: Add OpenAI API Key to Backend .env

1. Open or create the `.env` file in the `backend` directory
2. Add your OpenAI API key:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### Step 2: Example .env File Structure

Your `backend/.env` file should look like this:

```env
# Database Configuration
MONGODB_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# OpenAI Configuration
OPENAI_API_KEY=sk-your_actual_openai_api_key_here

# Email Configuration (Optional)
EMAIL_FROM=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
FROM_NAME=Smart Health Care
```

### Step 3: Restart the Backend Server

After adding the API key, restart your backend server:

```bash
cd backend
npm run dev
```

## Features

- **Secure**: API key is stored on the server, not exposed to clients
- **Centralized**: All AI requests go through the backend
- **User Authentication**: AI endpoints require valid user authentication
- **Error Handling**: Proper error messages for missing or invalid API keys
- **Rate Limiting**: Built-in rate limiting for API requests

## API Endpoints

The backend provides these AI endpoints:

- `POST /api/ai/generate-workout-plan` - Generate personalized workout plans
- `POST /api/ai/generate-diet-plan` - Generate personalized diet plans
- `GET /api/ai/status` - Check AI service configuration status

## Troubleshooting

### Error: OpenAI API key is not configured
- Make sure you've added `OPENAI_API_KEY` to your backend `.env` file
- Ensure the API key starts with `sk-`
- Restart the backend server after adding the key

### Error: Invalid API key
- Check that your OpenAI API key is correct
- Verify you have credits available in your OpenAI account
- Make sure the API key has the necessary permissions

## Security Notes

- Never commit your `.env` file to version control
- The `.env` file is already in `.gitignore`
- API keys are never sent to the frontend
- All AI requests require user authentication 