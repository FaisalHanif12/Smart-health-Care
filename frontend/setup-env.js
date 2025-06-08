const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 OpenAI API Key Setup for Fitness Planner\n');
console.log('This script will help you create a .env file with your OpenAI API key.\n');

rl.question('Enter your OpenAI API key (starts with sk-): ', (apiKey) => {
  if (!apiKey || !apiKey.startsWith('sk-')) {
    console.log('❌ Invalid API key format. Please make sure it starts with "sk-"');
    rl.close();
    return;
  }

  const envContent = `# OpenAI Configuration for Fitness Planner
VITE_OPENAI_API_KEY=${apiKey}

# Optional: Backend URL (if different from default)
# VITE_BACKEND_URL=http://localhost:5000
`;

  const envPath = path.join(__dirname, '.env');
  
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env file created successfully!');
    console.log('📁 Location:', envPath);
    console.log('\n🚀 Next steps:');
    console.log('1. Restart your development server (npm run dev)');
    console.log('2. Go to Diet Plan or Workout Plan page');
    console.log('3. Click "Generate AI Plan" to test');
    console.log('\n⚠️  Security Note: Never commit your .env file to version control!');
  } catch (error) {
    console.log('❌ Error creating .env file:', error.message);
  }
  
  rl.close();
}); 