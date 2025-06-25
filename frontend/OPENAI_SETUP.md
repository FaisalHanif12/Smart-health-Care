# OpenAI API Setup Guide

## 🔑 Setting Up Your OpenAI API Key

### Step 1: Get Your OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in to your account
3. Click "Create new secret key"
4. Copy your API key (starts with `sk-`)

### Step 2: Configure Environment Variables

#### Option A: Using .env file (Recommended for Development)
1. Create a `.env` file in the `frontend` folder:
```bash
# In frontend/.env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

2. Replace `your_openai_api_key_here` with your actual API key

#### Option B: Using System Environment Variables
```bash
# Windows (PowerShell)
$env:VITE_OPENAI_API_KEY="your_openai_api_key_here"

# Windows (Command Prompt)
set VITE_OPENAI_API_KEY=your_openai_api_key_here

# macOS/Linux
export VITE_OPENAI_API_KEY="your_openai_api_key_here"
```

### Step 3: Restart Development Server
After setting the environment variable, restart your development server:
```bash
npm run dev
```

## 🔒 Security Best Practices

### For Development:
- Use `.env` file (already in `.gitignore`)
- Never commit API keys to version control

### For Production:
- Use environment variables on your hosting platform
- Consider moving API calls to backend for better security
- Implement rate limiting and usage monitoring

## 🧪 Testing Your Setup

1. Go to Diet Plan or Workout Plan page
2. You should see your personalized prompt
3. Click "Generate AI Plan" 
4. If configured correctly, AI will generate your plan

## 🚨 Troubleshooting

### "OpenAI API key not configured" Error:
1. Check if `.env` file exists in `frontend` folder
2. Verify the variable name is exactly `VITE_OPENAI_API_KEY`
3. Restart the development server
4. Check browser console for any errors

### API Rate Limits:
- Free tier: Limited requests per minute
- Paid tier: Higher limits based on your plan
- Monitor usage at [OpenAI Usage Dashboard](https://platform.openai.com/usage)

## 📝 Example .env File
```env
# OpenAI Configuration
VITE_OPENAI_API_KEY=sk-proj-your-actual-key-here

# Optional: Backend URL (if different)
VITE_API_BASE_URL=http://localhost:5000/api
```

## 💡 Tips
- Keep your API key secure and private
- Monitor your OpenAI usage to avoid unexpected charges
- Test with simple prompts first
- The app will fallback to localStorage if env var is not set 