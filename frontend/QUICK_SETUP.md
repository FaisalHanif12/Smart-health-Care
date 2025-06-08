# 🚀 Quick OpenAI API Setup

## ⚡ Fastest Way to Get Started

### Option 1: Use the Setup Script (Windows)
1. Open Command Prompt or PowerShell
2. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
3. Run the setup script:
   ```bash
   create-env.bat
   ```
4. Enter your OpenAI API key when prompted
5. Restart your development server:
   ```bash
   npm run dev
   ```

### Option 2: Manual .env File Creation
1. Create a new file called `.env` in the `frontend` folder
2. Add this content (replace with your actual key):
   ```env
   VITE_OPENAI_API_KEY=sk-your-actual-openai-key-here
   ```
3. Save the file
4. Restart your development server:
   ```bash
   npm run dev
   ```

### Option 3: Use the In-App Setup
1. Go to Diet Plan or Workout Plan page
2. Click "Generate AI Plan"
3. A setup modal will appear
4. Enter your API key and click "Save"

## 🔑 Getting Your OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in to your account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. Use it in any of the setup options above

## ✅ Testing Your Setup

1. Go to Diet Plan or Workout Plan page
2. You should see your personalized prompt
3. Click "Generate AI Plan"
4. If successful, you'll see AI-generated content!

## 🚨 Troubleshooting

**Still getting "API key not configured" error?**
- Make sure the `.env` file is in the `frontend` folder (not the root)
- Check that the variable name is exactly `VITE_OPENAI_API_KEY`
- Restart your development server after creating the file
- Make sure your API key starts with `sk-`

**Need help?**
- Check the detailed guide: `OPENAI_SETUP.md`
- Verify your API key at [OpenAI Platform](https://platform.openai.com/api-keys)

## 📁 File Structure
```
Fitness-Planner/
├── frontend/
│   ├── .env                 ← Create this file here
│   ├── create-env.bat       ← Or run this script
│   ├── setup-env.js         ← Or use this Node.js script
│   └── src/
└── backend/
``` 