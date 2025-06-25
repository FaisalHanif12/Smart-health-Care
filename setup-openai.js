#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 OpenAI API Key Setup for Fitness Planner');
console.log('=========================================\n');
console.log('This script will help you configure OpenAI API keys for both frontend and backend.\n');

// Check if .env files already exist
const frontendEnvPath = path.join(__dirname, 'frontend', '.env');
const backendEnvPath = path.join(__dirname, 'backend', '.env');

const frontendExists = fs.existsSync(frontendEnvPath);
const backendExists = fs.existsSync(backendEnvPath);

if (frontendExists || backendExists) {
  console.log('⚠️  Existing .env files detected:');
  if (frontendExists) console.log('   - frontend/.env already exists');
  if (backendExists) console.log('   - backend/.env already exists');
  console.log('   This script will update them with your OpenAI API key.\n');
}

console.log('📝 To get your OpenAI API key:');
console.log('   1. Go to https://platform.openai.com/api-keys');
console.log('   2. Sign in to your account');
console.log('   3. Click "Create new secret key"');
console.log('   4. Copy the key (starts with "sk-")\n');

rl.question('🔑 Enter your OpenAI API key (starts with sk-): ', (apiKey) => {
  if (!apiKey || !apiKey.startsWith('sk-')) {
    console.log('❌ Invalid API key format. Please make sure it starts with "sk-"');
    rl.close();
    return;
  }

  try {
    // Create frontend .env file
    const frontendEnvContent = `# Environment Variables for Fitness Planner Frontend
# OpenAI API Key for AI features
VITE_OPENAI_API_KEY=${apiKey}

# Backend API URL (optional, defaults to localhost:5000)
VITE_API_BASE_URL=http://localhost:5000/api
`;

    // Create backend .env file
    const backendEnvContent = `# Environment Variables for Fitness Planner Backend
# OpenAI API Key for AI features
OPENAI_API_KEY=${apiKey}

# Database Configuration (add your MongoDB URI if needed)
# MONGODB_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Email Configuration (Optional)
# EMAIL_FROM=your_email@gmail.com
# EMAIL_PASSWORD=your_app_password
# FROM_NAME=Smart Health Care
`;

    // Write frontend .env file
    fs.writeFileSync(frontendEnvPath, frontendEnvContent);
    console.log('✅ Created frontend/.env file');

    // Write backend .env file
    fs.writeFileSync(backendEnvPath, backendEnvContent);
    console.log('✅ Created backend/.env file');

    console.log('\n🎉 Setup completed successfully!');
    console.log('\n🚀 Next steps:');
    console.log('   1. Restart both your frontend and backend servers');
    console.log('   2. Frontend: cd frontend && npm run dev');
    console.log('   3. Backend: cd backend && npm run dev');
    console.log('   4. Go to Diet Plan page and click "Generate AI Plan"');
    console.log('\n⚠️  Security Notes:');
    console.log('   - .env files are in .gitignore and won\'t be committed');
    console.log('   - Keep your API key secure and private');
    console.log('   - Monitor usage at https://platform.openai.com/usage');
    console.log('\n📚 For more detailed setup instructions:');
    console.log('   - Frontend: see frontend/OPENAI_SETUP.md');
    console.log('   - Backend: see backend/OPENAI_SETUP.md');

  } catch (error) {
    console.log('❌ Error creating .env files:', error.message);
    console.log('\n🔧 Manual setup:');
    console.log('   1. Create frontend/.env with: VITE_OPENAI_API_KEY=' + apiKey);
    console.log('   2. Create backend/.env with: OPENAI_API_KEY=' + apiKey);
  }
  
  rl.close();
});

// Handle Ctrl+C gracefully
rl.on('SIGINT', () => {
  console.log('\n\n❌ Setup cancelled by user');
  process.exit(0);
}); 