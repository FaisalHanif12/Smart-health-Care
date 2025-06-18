# 🚨 OpenAI API Configuration Error - Quick Fix

## The Problem
You're seeing the error: `"Failed to generate diet plan: OpenAI API key not configured"` because both the frontend and backend need OpenAI API keys to generate AI-powered diet and workout plans.

## ⚡ Quick Solution (30 seconds)

### Option 1: Use the Automated Setup Script
1. Open terminal in the project root directory
2. Run: `node setup-openai.js`
3. Enter your OpenAI API key when prompted
4. Restart both frontend and backend servers

### Option 2: Manual Setup
1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create `frontend/.env` file:
   ```env
   VITE_OPENAI_API_KEY=sk-your-api-key-here
   ```
3. Create `backend/.env` file:
   ```env
   OPENAI_API_KEY=sk-your-api-key-here
   ```
4. Restart both servers

## 🔑 Getting Your OpenAI API Key
1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in to your OpenAI account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

## 🚀 After Setup
1. Restart your servers:
   ```bash
   # Terminal 1 (Backend)
   cd backend
   npm run dev

   # Terminal 2 (Frontend)  
   cd frontend
   npm run dev
   ```
2. Go to Diet Plan page
3. Click "🤖 Create Your 6-Day Plan with AI"
4. It should now generate your personalized diet plan!

## ✅ Verification
- Backend console should show: `OPENAI_API_KEY: Set (****)`
- No more "OpenAI API key not configured" errors
- AI generation works in both Diet Plan and Workout Plan pages

## 🔒 Security Notes
- `.env` files are in `.gitignore` (won't be committed to Git)
- Keep your API key private and secure
- Monitor usage at [OpenAI Usage Dashboard](https://platform.openai.com/usage)

## 💡 Why This Happens
The app uses OpenAI's GPT-4 to generate personalized diet and workout plans based on your profile. Without the API key, it can't connect to OpenAI's services.

## 📞 Still Having Issues?
If you're still getting errors after setup:
1. Check that your API key starts with `sk-`
2. Verify you have credits in your OpenAI account
3. Make sure both servers are restarted after adding the keys
4. Check the detailed guides in `frontend/OPENAI_SETUP.md` and `backend/OPENAI_SETUP.md` 