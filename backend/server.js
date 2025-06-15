const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Configure dotenv with explicit path
const dotenvResult = require('dotenv').config({ path: path.join(__dirname, '.env') });

// Debug dotenv loading
if (dotenvResult.error) {
  console.log('❌ Error loading .env file:', dotenvResult.error);
} else {
  console.log('✅ .env file loaded successfully');
  console.log('📁 .env path:', path.join(__dirname, '.env'));
}

// Fallback environment variables if .env doesn't load properly
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://mehrfaisal111:q5V8kT2NjcWH9nyf@smart-health-care.kjxomvs.mongodb.net/?retryWrites=true&w=majority&appName=Smart-Health-Care';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_make_it_long_and_complex_12345678';
process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
process.env.JWT_COOKIE_EXPIRE = process.env.JWT_COOKIE_EXPIRE || '7';
process.env.PORT = process.env.PORT || '5000';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Debug: Check if environment variables are loaded
console.log('🔧 Environment Debug:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not Set');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not Set');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM ? 'Set (' + process.env.EMAIL_FROM + ')' : 'Not Set');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set (****)' : 'Not Set');
console.log('FROM_NAME:', process.env.FROM_NAME || 'Not Set');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Set (****)' : 'Not Set');
console.log('PORT:', process.env.PORT);

const connectDB = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Health Care API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Smart Health Care API',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// Handle undefined routes
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
🚀 Smart Health Care Server is running!
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV}
🔗 Local: http://localhost:${PORT}
🏥 Health Check: http://localhost:${PORT}/api/health
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app; 