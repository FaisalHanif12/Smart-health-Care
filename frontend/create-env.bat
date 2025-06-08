@echo off
echo.
echo 🔧 OpenAI API Key Setup for Fitness Planner
echo.
echo This will create a .env file with your OpenAI API key.
echo.
set /p apikey="Enter your OpenAI API key (starts with sk-): "

if "%apikey%"=="" (
    echo ❌ No API key entered. Please try again.
    pause
    exit /b
)

echo # OpenAI Configuration for Fitness Planner > .env
echo VITE_OPENAI_API_KEY=%apikey% >> .env
echo. >> .env
echo # Optional: Backend URL (if different from default) >> .env
echo # VITE_BACKEND_URL=http://localhost:5000 >> .env

echo.
echo ✅ .env file created successfully!
echo 📁 Location: %cd%\.env
echo.
echo 🚀 Next steps:
echo 1. Restart your development server (npm run dev)
echo 2. Go to Diet Plan or Workout Plan page  
echo 3. Click "Generate AI Plan" to test
echo.
echo ⚠️  Security Note: Never commit your .env file to version control!
echo.
pause 